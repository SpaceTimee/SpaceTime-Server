const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age': '86400'
} as const

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })

  const response = await context.next()
  const newResponse = new Response(response.body, response)

  for (const [key, value] of Object.entries(corsHeaders)) newResponse.headers.set(key, value)

  return newResponse
}
