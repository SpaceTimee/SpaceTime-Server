export const onRequest = async ({ request, env }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'POST')
    return Response.json({ error: 'Method Not Allowed', message: 'Use POST' }, { status: 405 })

  try {
    return await fetch(`${env.ROUTER_URL}/v1/chat/completions`, request)
  } catch {
    return Response.json({ error: 'Router Error', message: 'Unable to complete chat' }, { status: 502 })
  }
}
