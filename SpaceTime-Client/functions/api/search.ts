export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || "wikipedia.org")
    .replace(/^https?:\/\//, '').trim().replace(/\/$/, '');

  const targetUrl = 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json';
  const cacheKey = new Request(targetUrl);
  const cache = (caches as unknown as { default: Cache }).default;

  let res = await cache.match(cacheKey);
  if (!res) {
    try {
      res = await fetch(targetUrl, { headers: { 'User-Agent': 'Cloudflare-Pages-Function' } });
      if (!res.ok) throw 0;
      res = new Response(res.body, { headers: { 'Cache-Control': 'public, max-age=600' } });
      context.waitUntil(cache.put(cacheKey, res.clone()));
    } catch {
      return new Response("Fetch Error", { status: 502 });
    }
  }

  try {
    const data: [string[], string, string][] = await res.json();
    const match = data.find(([domains]) => Array.isArray(domains) && domains.some(pattern => matchesGlob(pattern, domain)));
    if (match) return new Response(JSON.stringify(match), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  } catch { }

  return new Response("没有找到", { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

const matchesGlob = (pattern: string, text: string) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`, 'i').test(text);
