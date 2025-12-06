export const onRequest = async (context: EventContext<unknown, 'filename', unknown>) => {
  const fileMap: Record<string, string> = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf',
  };
  const url = fileMap[context.params.filename as string];

  if (!url) return new Response('File not found', { status: 404 });

  const cacheKey = new Request(context.request.url);
  const cache = (caches as unknown as { default: Cache }).default;
  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(url, { headers: { 'User-Agent': 'SpaceTime-Server' } });
    if (!response.ok) return new Response(`GitHub Error: ${response.statusText}`, { status: response.status });
    response = new Response(response.body, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=600' } });
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
};
