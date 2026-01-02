export const onRequest = async (context: EventContext<Env, 'path', { targetUrl?: string }>) => {
  if (!context.data?.targetUrl && !context.params.path?.length) return context.next()

  const cacheKey = new Request(context.request.url)
  const cache = (caches as unknown as { default: Cache }).default

  let response = await cache.match(cacheKey)

  if (!response) {
    try {
      response = await fetch(
        context.data?.targetUrl ??
          `${context.env.API_URL ?? 'http://localhost'}/files/${(context.params.path as string[]).join('/')}`
      )

      if (!response.ok) throw new Error()

      const contentType = response.headers.get('content-type')

      if (contentType?.includes('text/html')) {
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
