const jsonResponse = (body: unknown, status = 200, headers?: Record<string, string>) =>
  Response.json(body, {
    status,
    headers: {
      ...headers,
      'Cache-Control': 'no-store'
    }
  })

export const onRequest = async (context: EventContext<Env, string, unknown>) => {
  const { request, env } = context

  if (request.method !== 'GET')
    return jsonResponse({ error: 'Method Not Allowed', message: 'Use GET' }, 405, { Allow: 'GET' })

  const searchParams = new URL(request.url).searchParams

  const targets = [
    ...new Set(
      (searchParams.get('targets') ?? '')
        .split(',')
        .map((target) => target.trim())
        .filter(Boolean)
    )
  ]

  if (!targets.length) return jsonResponse({})

  const portValue = searchParams.get('port')?.trim() ?? ''
  const port = portValue ? Number(portValue) : undefined

  if (port !== undefined && (!/^\d+$/.test(portValue) || port < 1 || port > 65_535))
    return jsonResponse({ error: 'Bad Request', message: 'Invalid port' }, 400)

  const workflowTargets = targets.length === 1 ? [...targets, ...targets] : targets
  const sessionId = env.CENSOR_SESSION_NAMESPACE.newUniqueId()
  const sessionStub = env.CENSOR_SESSION_NAMESPACE.get(sessionId) as unknown as {
    start(): Promise<Response>
    wait(): Promise<Response>
    cancel(): Promise<Response>
  }
  const scheduleSessionCancellation = () => context.waitUntil(sessionStub.cancel().catch(() => undefined))
  const startResponse = await sessionStub.start().catch(() => undefined)

  void startResponse?.body?.cancel().catch(() => undefined)

  if (!startResponse?.ok) {
    if (startResponse === undefined) scheduleSessionCancellation()

    return jsonResponse({ error: 'Session Error', message: 'Unable to start censor check' }, 502)
  }

  const dispatchResponse = await fetch(
    'https://api.github.com/repos/SpaceTimee/Console-CensorChecker/actions/workflows/check_censor.yaml/dispatches',
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${env.CENSOR_GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SpaceTime-Client',
        'X-GitHub-Api-Version': '2026-03-10'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          ID: sessionId.toString(),
          TARGETS: workflowTargets.join(','),
          ...(port === undefined ? {} : { PORT: port })
        }
      }),
      redirect: 'manual'
    }
  ).catch(() => undefined)

  void dispatchResponse?.body?.cancel().catch(() => undefined)

  if (!dispatchResponse?.ok) {
    scheduleSessionCancellation()

    return jsonResponse({ error: 'Workflow Error', message: 'Unable to start censor check' }, 502)
  }

  const waitResponse = await sessionStub.wait().catch(() => undefined)

  if (waitResponse === undefined) {
    scheduleSessionCancellation()

    return jsonResponse({ error: 'Session Error', message: 'Unable to receive censor result' }, 502)
  }

  if (waitResponse.status !== 404) return waitResponse

  void waitResponse.body?.cancel().catch(() => undefined)

  return jsonResponse({ error: 'Gateway Timeout', message: 'Censor check timed out' }, 504)
}
