export const onRequest = async (context: EventContext<Env, 'filename', unknown>) => {
  const filename = context.params.filename as string
  const fileMap: Record<string, string> = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf'
  }

  const url = fileMap[filename] || `${context.env.API_URL ?? 'http://localhost'}/files/${filename}`
  const cacheKey = new Request(context.request.url)
  const cache = (caches as unknown as { default: Cache }).default

  let response = await cache.match(cacheKey)

  if (!response) {
    try {
      response = await fetch(url)

      if (!response.ok) throw 0

      const contentType = response.headers.get('content-type')

      if (!fileMap[filename] && contentType?.includes('text/html')) {
        return new Response('Not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      }

      response = new Response(response.body, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=600',
          'Content-Type': contentType || 'application/octet-stream'
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
