export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const targetUrl = 'https://github.com/SpaceTimee/Console-HostChecker/raw/main/CheckResult.txt'
  const cacheKey = new Request(targetUrl)
  const cache = (caches as unknown as { default: Cache }).default

  const response = await cache.match(cacheKey)
  if (response) return response

  try {
    const freshResponse = await fetch(targetUrl)

    if (!freshResponse.ok) throw new Error()

    const cached = new Response(freshResponse.body, {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })

    context.waitUntil(cache.put(cacheKey, cached.clone()))

    return cached
  } catch {
    return new Response('Fetch Error', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
