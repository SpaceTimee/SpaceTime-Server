export const onRequest = async ({ request, env, params }: EventContext<Env, 'path', unknown>) => {
  const targetPath = (params.path as string[] | undefined)?.join('/') || ''

  const headers = new Headers(request.headers)
  headers.delete('host')

  try {
    return await fetch(`${env.PROX_URL.replace(/\/$/, '')}/${targetPath}${new URL(request.url).search}`, {
      method: request.method,
      headers,
      body: request.body
    })
  } catch {
    return new Response('Fetch Error', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
