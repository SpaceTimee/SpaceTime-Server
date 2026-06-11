export const onRequest = async ({ request, env }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'POST')
    return new Response(JSON.stringify({ error: 'Method Not Allowed', message: 'Use POST' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })

  let messages: { role: string; content: string }[]

  try {
    const body = (await request.json()) as { messages?: unknown }

    if (!Array.isArray(body.messages) || body.messages.length === 0) throw new Error()

    messages = body.messages
  } catch {
    return new Response(JSON.stringify({ error: 'Bad Request', message: 'Invalid or missing messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  }

  try {
    const response = await fetch(`${env.GATEWAY_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GATEWAY_KEY}`
      },
      body: JSON.stringify({ model: env.GATEWAY_MODEL, messages })
    })

    if (!response.ok) throw new Error()

    const content = ((await response.json()) as { choices?: { message?: { content?: string } }[] })
      .choices?.[0]?.message?.content

    if (!content) throw new Error()

    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Gateway Error', message: 'Unable to complete chat' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  }
}
