export const onRequest = async (context: EventContext<unknown, 'filename', unknown>) => {
  const { filename } = context.params;
  if (typeof filename !== 'string') return new Response('Invalid filename', { status: 400 });

  const fileMap: Record<string, string> = {
    'Cealing-Host.json': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json',
    'nginx.conf': 'https://github.com/SpaceTimee/Cealing-Host/raw/main/nginx.conf',
  };

  const targetUrl = fileMap[filename];
  if (!targetUrl) return new Response('File not found', { status: 404 });

  const cacheKey = new Request(context.request.url, context.request);
  const cache = (caches as unknown as { default: Cache }).default;

  let response = await cache.match(cacheKey);

  if (!response) {
    try {
      const fetchedResponse = await fetch(targetUrl, { headers: { 'User-Agent': 'Cloudflare-Pages-Function' } });
      if (!fetchedResponse.ok) return new Response(`GitHub Error: ${fetchedResponse.statusText}`, { status: fetchedResponse.status });

      response = new Response(fetchedResponse.body, fetchedResponse);
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Cache-Control', 'public, max-age=600');

      context.waitUntil(cache.put(cacheKey, response.clone()));
    } catch (err) {
      return new Response(`Internal Server Error: ${err}`, { status: 500 });
    }
  }

  return response;
};
