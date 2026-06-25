export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || 'wikipedia.org')
    .replace(/^https?:\/\//, '')
    .trim()
    .replace(/\/$/, '')

  const targetUrl = 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json'
  const cacheKey = new Request(targetUrl)
  const cache = (caches as unknown as { default: Cache }).default

  let response = await cache.match(cacheKey)

  if (!response) {
    try {
      response = await fetch(targetUrl)

      if (!response.ok) throw new Error()

      response = new Response(response.body, { headers: { 'Cache-Control': 'public, max-age=600' } })

      context.waitUntil(cache.put(cacheKey, response.clone()))
    } catch {
      return Response.json({ error: 'Fetch Error', message: 'Unable to fetch data' }, { status: 502 })
    }
  }

  try {
    const data = await response.json<[string[], string, string][]>()

    const match = data.find(
      ([domains]) => Array.isArray(domains) && domains.some((pattern) => glob(pattern, domain))
    )

    if (!match) throw new Error()

    return Response.json(match)
  } catch {
    return Response.json({ error: 'Not Found', message: 'Domain not found in database' }, { status: 404 })
  }
}

const glob = (pattern: string, text: string) => {
  if (pattern.startsWith('^')) return false

  const [includePattern, excludePattern] = pattern.replace(/^[#$]/, '').split('^')
  const createRegExp = (segment: string) =>
    new RegExp(`^${segment.replace(/[.+^${}()|[\]\\?]/g, '\\$&').replace(/\*/g, '.*')}$`, 'i')

  return (
    createRegExp(includePattern).test(text) && (!excludePattern || !createRegExp(excludePattern).test(text))
  )
}
