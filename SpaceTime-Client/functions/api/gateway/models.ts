export const onRequest = async ({ request, env }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'GET')
    return Response.json({ error: 'Method Not Allowed', message: 'Use GET' }, { status: 405 })

  try {
    const response = await fetch(`${env.GATEWAY_URL}/models`, {
      headers: {
        Authorization: `Bearer ${env.GATEWAY_KEY}`
      }
    })

    if (!response.ok) throw new Error()

    return Response.json(await response.json())
  } catch {
    return Response.json({ error: 'Gateway Error', message: 'Unable to fetch models' }, { status: 502 })
  }
}
