export const onRequest = async ({ request, env, params }: EventContext<Env, 'path', unknown>) => {
  const targetPath = (params.path as string[] | undefined)?.join('/') || ''
  const targetUrl = `${env.PROX_URL.replace(/\/$/, '')}/${targetPath}${new URL(request.url).search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  try {
    const {
      status,
      statusText,
      headers: responseHeaders,
      body
    } = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.body
    })

    return new Response(body, { status, statusText, headers: responseHeaders })
  } catch {
    return new Response('Fetch Error', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
