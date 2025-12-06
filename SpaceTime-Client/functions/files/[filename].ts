export const onRequest = async (context: EventContext<unknown, 'filename', unknown>) => {
  const url = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf',
  }[context.params.filename as string];

  if (!url) return new Response('File not found', { status: 404 });

  const cacheKey = new Request(context.request.url);
  const cache = (caches as unknown as { default: Cache }).default;
  let res = await cache.match(cacheKey);

  if (!res) {
    res = await fetch(url, { headers: { 'User-Agent': 'Cloudflare-Pages-Function' } });
    if (!res.ok) return new Response(`GitHub Error: ${res.statusText}`, { status: res.status });
    res = new Response(res.body, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=600' } });
    context.waitUntil(cache.put(cacheKey, res.clone()));
  }
  return res;
};
