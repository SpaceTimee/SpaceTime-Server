const textEncoder = new TextEncoder()

const jsonResponse = (body: unknown, status = 200, headers?: Record<string, string>) =>
  Response.json(body, {
    status,
    headers: {
      ...headers,
      'Cache-Control': 'no-store'
    }
  })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const onRequest = async ({ request, env }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'POST')
    return jsonResponse({ error: 'Method Not Allowed', message: 'Use POST' }, 405, { Allow: 'POST' })

  const [providedAuthorizationHash, expectedAuthorizationHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', textEncoder.encode(request.headers.get('Authorization') ?? '')),
    crypto.subtle.digest('SHA-256', textEncoder.encode(`Bearer ${env.CENSOR_CALLBACK_TOKEN}`))
  ])

  if (!crypto.subtle.timingSafeEqual(providedAuthorizationHash, expectedAuthorizationHash))
    return jsonResponse({ error: 'Unauthorized', message: 'Invalid callback token' }, 401, {
      'WWW-Authenticate': 'Bearer'
    })

  if (request.headers.get('Content-Type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json')
    return jsonResponse({ error: 'Unsupported Media Type', message: 'Use application/json' }, 415)

  const requestBody = await request.json<unknown>().catch(() => undefined)

  if (!isRecord(requestBody) || typeof requestBody.id !== 'string' || Object.keys(requestBody).length !== 2)
    return jsonResponse({ error: 'Bad Request', message: 'Invalid callback payload' }, 400)

  const hasResults = Object.hasOwn(requestBody, 'results')
  const hasError = Object.hasOwn(requestBody, 'error')

  if (hasResults === hasError)
    return jsonResponse({ error: 'Bad Request', message: 'Invalid callback payload' }, 400)

  let censorCheckResult: Record<string, unknown>

  if (hasResults) {
    if (
      !isRecord(requestBody.results) ||
      !Object.entries(requestBody.results).every(
        ([target, latency]) =>
          target.trim().length > 0 &&
          typeof latency === 'number' &&
          Number.isInteger(latency) &&
          latency >= 0 &&
          latency <= 2_147_483_647
      )
    )
      return jsonResponse({ error: 'Bad Request', message: 'Invalid callback results' }, 400)

    censorCheckResult = { results: requestBody.results as Record<string, number> }
  } else {
    if (typeof requestBody.error !== 'string' || !requestBody.error.trim())
      return jsonResponse({ error: 'Bad Request', message: 'Invalid callback error' }, 400)

    censorCheckResult = { error: requestBody.error }
  }

  let sessionId: DurableObjectId

  try {
    sessionId = env.CENSOR_SESSION_NAMESPACE.idFromString(requestBody.id)
  } catch {
    return jsonResponse({ error: 'Bad Request', message: 'Invalid censor check ID' }, 400)
  }

  const sessionStub = env.CENSOR_SESSION_NAMESPACE.get(sessionId) as unknown as {
    complete(censorCheckResult: Record<string, unknown>): Promise<Response>
  }
  const completeResponse = await sessionStub.complete(censorCheckResult).catch(() => undefined)

  void completeResponse?.body?.cancel().catch(() => undefined)

  switch (completeResponse?.status) {
    case 204:
      return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
    case 404:
      return jsonResponse({ error: 'Not Found', message: 'Unknown or expired censor check ID' }, 404)
    case 409:
      return jsonResponse({ error: 'Conflict', message: 'Censor check already has a different result' }, 409)
    default:
      return jsonResponse({ error: 'Session Error', message: 'Unable to deliver censor result' }, 502)
  }
}
