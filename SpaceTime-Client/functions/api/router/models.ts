export const onRequest = async ({ request, env }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'GET')
    return Response.json({ error: 'Method Not Allowed', message: 'Use GET' }, { status: 405 })

  try {
    return await fetch(`${env.ROUTER_URL}/v1/models`, request)
  } catch {
    return Response.json({ error: 'Router Error', message: 'Unable to fetch models' }, { status: 502 })
  }
}
