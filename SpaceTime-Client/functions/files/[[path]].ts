export const onRequest = async (context: EventContext<Env, 'path', { targetUrl?: string }>) => {
  if (!context.data?.targetUrl && !context.params.path?.length) return context.next()

  const cacheKey = context.request.url
  const cache = (caches as unknown as { default: Cache }).default

  const response = await cache.match(cacheKey)
  if (response) return response

  try {
    const freshResponse = await fetch(
      context.data?.targetUrl ??
        `${context.env.API_URL ?? 'http://localhost'}/files/${(context.params.path as string[]).join('/')}`
    )

    if (!freshResponse.ok) throw new Error()

    const contentType = freshResponse.headers.get('content-type')

    if (contentType?.includes('text/html')) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    const cached = new Response(freshResponse.body, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=600',
        'Content-Type': contentType || 'application/octet-stream'
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
