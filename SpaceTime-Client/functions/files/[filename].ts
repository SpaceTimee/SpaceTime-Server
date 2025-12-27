export const onRequest = async (context: EventContext<unknown, 'filename', unknown>) => {
  const fileMap: Record<string, string> = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf'
  }
  const url = fileMap[context.params.filename as string]

  if (!url) return new Response('Not found', { status: 404 })

  const cacheKey = new Request(context.request.url)
  const cache = (caches as unknown as { default: Cache }).default

  let response = await cache.match(cacheKey)

  if (!response) {
    try {
      response = await fetch(url)

      if (!response.ok) throw 0

      response = new Response(response.body, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=600'
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
