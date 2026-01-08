export const onRequest = async (context: EventContext<Env, 'path', unknown>) => {
  const url = new URL(context.request.url)
  const pathSegments = context.params.path as string[] | undefined
  const targetPath = pathSegments?.join('/') || ''
  const targetUrl = `${context.env.PROX_URL.replace(/\/$/, '')}/${targetPath}${url.search}`

  const headers = new Headers(context.request.headers)
  headers.delete('host')

  try {
    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers,
      body: context.request.body
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  } catch {
    return new Response('Fetch Error', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
