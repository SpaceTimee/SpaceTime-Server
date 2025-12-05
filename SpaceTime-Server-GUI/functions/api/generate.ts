export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const domain = (url.searchParams.get('domain') || "wikipedia.org")
    .replace(/^https?:\/\//, '').trim().replace(/\/$/, '');

  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error();

    const data: any = await res.json();
    if (data.Answer?.length > 0) {
      const ip = data.Answer[data.Answer.length - 1].data;
      return new Response(JSON.stringify([[`*${domain}`], "", ip]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }
  } catch {}

  return new Response("生成失败", { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
