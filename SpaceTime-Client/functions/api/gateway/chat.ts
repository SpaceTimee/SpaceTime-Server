export const onRequest = async ({ request, env }: EventContext<Env, string, unknown>) => {
  if (request.method !== 'POST')
    return Response.json({ error: 'Method Not Allowed', message: 'Use POST' }, { status: 405 })

  const { messages } = await request
    .json<{ messages?: { role: string; content: string }[] }>()
    .catch(() => ({ messages: undefined }))

  if (!Array.isArray(messages) || !messages.length)
    return Response.json({ error: 'Bad Request', message: 'Invalid or missing messages' }, { status: 400 })

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

    const { choices } = await response.json<{ choices?: { message?: { content?: string } }[] }>()
    const content = choices?.[0]?.message?.content

    if (!content) throw new Error()

    return Response.json({ content })
  } catch {
    return Response.json({ error: 'Gateway Error', message: 'Unable to complete chat' }, { status: 502 })
  }
}
