export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || "wikipedia.org")
    .replace(/^https?:\/\//, '').trim().replace(/\/$/, '');

  const targetUrl = 'https://github.com/SpaceTimee/Cealing-Host/raw/main/Cealing-Host.json';
  const cacheKey = new Request(targetUrl);
  const cache = (caches as unknown as { default: Cache }).default;

  let response = await cache.match(cacheKey);
  if (!response) {
    try {
      response = await fetch(targetUrl, { headers: { 'User-Agent': 'SpaceTime-Server' } });
      if (!response.ok) throw 0;
      response = new Response(response.body, { headers: { 'Cache-Control': 'public, max-age=600' } });
      context.waitUntil(cache.put(cacheKey, response.clone()));
    } catch {
      return new Response("Fetch Error", { status: 502 });
    }
  }

  try {
    const data: TypeData = await response.json();
    const match = data.find(([domains]) => Array.isArray(domains) && domains.some(pattern => matchesGlob(pattern, domain)));
    if (match) return new Response(JSON.stringify(match), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  } catch { }

  return new Response(JSON.stringify({ error: "Not Found", message: "Domain not found in database" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};

type TypeData = [string[], string, string][];

const matchesGlob = (pattern: string, text: string) => {
  if (pattern.startsWith('^')) return false;
  const [includePattern, excludePattern] = pattern.replace(/^([#$])/, '').split('^');
  const createRegExp = (segment: string) => new RegExp(`^${segment.replace(/[.+^${}()|[\]\\?]/g, '\\$&').replace(/\*/g, '.*')}$`, 'i');
  return createRegExp(includePattern).test(text) && (!excludePattern || !createRegExp(excludePattern).test(text));
};
