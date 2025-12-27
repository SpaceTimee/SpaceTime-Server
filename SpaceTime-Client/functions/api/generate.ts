export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || 'wikipedia.org')
    .replace(/^https?:\/\//, '')
    .trim()
    .replace(/\/$/, '')

  let result: string

  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}`)

    if (!response.ok) throw 0

    const { Answer: dnsAnswers } = (await response.json()) as { Answer?: { data: string }[] }

    if (!dnsAnswers?.length) throw 0

    result = dnsAnswers[dnsAnswers.length - 1].data
  } catch {
    return new Response(JSON.stringify({ error: 'Generation Failed', message: 'Unable to resolve domain' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  }

  return new Response(JSON.stringify([[`*${domain}`], '', result]), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}
