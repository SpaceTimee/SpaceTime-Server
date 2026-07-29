export const onRequest = ({ request, env }: EventContext<Env, 'code', unknown>) => {
  if (request.method !== 'GET')
    return Response.json(
      { error: 'Method Not Allowed', message: 'Use GET' },
      { status: 405, headers: { Allow: 'GET' } }
    )

  try {
    const requestUrl = new URL(request.url)
    const targetUrl = new URL(env.LINK_URL)
    targetUrl.pathname = requestUrl.pathname.slice('/api/verifier'.length) || '/'
    targetUrl.search = requestUrl.search

    return new Response(null, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store',
        Location: targetUrl.href,
        'Referrer-Policy': 'no-referrer'
      }
    })
  } catch {
    return Response.json({ error: 'Verifier Error', message: 'Unable to verify identity' }, { status: 502 })
  }
}
