export const onRequest = async (context: EventContext<unknown, string, unknown>) => {
  const domain = (new URL(context.request.url).searchParams.get('domain') || "wikipedia.org")
    .replace(/^https?:\/\//, '').trim().replace(/\/$/, '');

  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw 0;
    const { Answer: dnsAnswers } = await response.json() as { Answer?: { data: string }[] };
    if (dnsAnswers?.length) {
      return new Response(JSON.stringify([[`*${domain}`], "", dnsAnswers[dnsAnswers.length - 1].data]), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  } catch { }

  return new Response(JSON.stringify({ error: "Generation Failed", message: "Unable to resolve domain" }), {
    status: 500,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
