export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || 'wikipedia.org')
    .replace(/^https?:\/\//, '')
    .trim()
    .replace(/\/$/, '')

  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}`)

    if (!response.ok) throw new Error()

    const { Answer: dnsAnswers } = await response.json<{ Answer?: { data: string }[] }>()

    if (!dnsAnswers?.length) throw new Error()

    return Response.json([[`*${domain}`], '', dnsAnswers[dnsAnswers.length - 1].data])
  } catch {
    return Response.json({ error: 'Generation Error', message: 'Unable to resolve domain' }, { status: 500 })
  }
}
