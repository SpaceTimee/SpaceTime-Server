export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const domain = (url.searchParams.get('domain') || "wikipedia.org")
    .replace(/^https?:\/\//, '').trim().replace(/\/$/, '');

  const targetUrl = 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json';
  const cacheKey = new Request(targetUrl);
  const cache = (caches as any).default;

  let fileResponse = await cache.match(cacheKey);

  if (!fileResponse) {
    try {
      fileResponse = await fetch(targetUrl, { headers: { 'User-Agent': 'Cloudflare-Pages-Function' } });
      if (!fileResponse.ok) return new Response(`Fetch Error: ${fileResponse.statusText}`, { status: 502 });

      fileResponse = new Response(fileResponse.body, fileResponse);
      fileResponse.headers.set('Cache-Control', 'public, max-age=600');
      context.waitUntil(cache.put(cacheKey, fileResponse.clone()));
    } catch (err) {
      return new Response(`Internal Error: ${err}`, { status: 500 });
    }
  }

  try {
    const hostArray: any[] = await fileResponse.json();
    for (const [domains, sni, ip] of hostArray) {
      if (Array.isArray(domains) && domains.some(d => matchesGlob(d, domain))) {
        return new Response(JSON.stringify([domains, sni, ip]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      }
    }
  } catch (err) {
    return new Response(`Parse Error: ${err}`, { status: 500 });
  }

  return new Response("没有找到", { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

const matchesGlob = (pattern: string, text: string): boolean => {
  const regex = new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i');
  return regex.test(text);
};
