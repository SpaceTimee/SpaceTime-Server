export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || "wikipedia.org")
    .replace(/^https?:\/\//, '').trim().replace(/\/$/, '');

  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw 0;
    const { Answer } = await res.json() as { Answer?: { data: string }[] };
    if (Answer?.length) {
      return new Response(JSON.stringify([[`*${domain}`], "", Answer[Answer.length - 1].data]), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  } catch { }
  return new Response("生成失败", { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
