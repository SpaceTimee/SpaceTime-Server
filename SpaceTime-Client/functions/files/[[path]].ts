export const onRequest = async (context: EventContext<Env, 'path', unknown>) => {
  const filePath = (context.params.path as string[] | undefined)?.join('/') || 'Cealing-Host.json'
  const fileMap: Record<string, string> = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf'
  }

  const url = fileMap[filePath] || `${context.env.API_URL ?? 'http://localhost'}/files/${filePath}`
  const cacheKey = new Request(context.request.url)
  const cache = (caches as unknown as { default: Cache }).default

  let response = await cache.match(cacheKey)

  if (!response) {
    try {
      response = await fetch(url)

      if (!response.ok) throw 0

      const contentType = response.headers.get('content-type')

      if (!fileMap[filePath] && contentType?.includes('text/html')) {
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
