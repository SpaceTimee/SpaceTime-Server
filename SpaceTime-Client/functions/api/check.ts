export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const targetUrl = 'https://github.com/SpaceTimee/Console-HostChecker/raw/main/CheckResult.txt'
  const cacheKey = new Request(targetUrl)
  const cache = (caches as unknown as { default: Cache }).default

  let response = await cache.match(cacheKey)

  if (!response) {
    try {
      response = await fetch(targetUrl)

      if (!response.ok) throw 0

      response = new Response(response.body, {
        headers: {
          'Cache-Control': 'public, max-age=600',
          'Content-Type': 'text/plain; charset=utf-8'
        }
      })

      context.waitUntil(cache.put(cacheKey, response.clone()))
    } catch {
      return new Response('Fetch Error', {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
  }

  return response
}
