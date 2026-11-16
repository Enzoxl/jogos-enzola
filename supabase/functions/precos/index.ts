// Jogos Enzola — preços em reais via IsThereAnyDeal (Steam BR, Nuuvem, GOG, Epic, etc.)
//
// Como publicar (uma vez):
//   1. Crie uma chave grátis em https://isthereanydeal.com/apps/my/ (menu "API").
//   2. No Supabase: Edge Functions > Deploy a new function > nome "precos" > cole este arquivo.
//      (ou pelo terminal: supabase functions deploy precos)
//   3. Em Edge Functions > Secrets, crie ITAD_KEY com a sua chave.
//   4. No config.js do site, coloque PRICE_FUNCTION: "precos".
// A chave fica só no servidor; o site nunca vê a chave.

const KEY = Deno.env.get("ITAD_KEY") ?? "";
const API = "https://api.isthereanydeal.com";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (!KEY) return json({ error: "ITAD_KEY não configurada" }, 500);
  try {
    const { title, country = "BR" } = await req.json();
    if (!title || typeof title !== "string" || title.length > 200) return json({ error: "título inválido" }, 400);

    // 1) acha o jogo pelo nome
    const lk = await fetch(`${API}/games/lookup/v1?key=${KEY}&title=${encodeURIComponent(title)}`).then((r) => r.json());
    let game = lk?.found ? lk.game : null;
    if (!game) {
      const s = await fetch(`${API}/games/search/v1?key=${KEY}&title=${encodeURIComponent(title)}&results=5`).then((r) => r.json());
      game = Array.isArray(s) ? s.find((g: any) => g.type === "game") ?? s[0] : null;
    }
    if (!game) return json({ none: true });

    // 2) preços atuais no país pedido (padrão: Brasil, em reais)
    const pr = await fetch(`${API}/games/prices/v3?key=${KEY}&country=${encodeURIComponent(country)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([game.id]),
    }).then((r) => r.json());
    const item = Array.isArray(pr) ? pr[0] : null;
    const page = `https://isthereanydeal.com/game/${game.slug}/info/`;
    const deals = (item?.deals ?? [])
      .map((d: any) => ({
        shop: d.shop?.name ?? "Loja",
        amount: d.price?.amount ?? null,
        regular: d.regular?.amount ?? null,
        cut: d.cut ?? 0,
        currency: d.price?.currency ?? "BRL",
        url: d.url ?? page,
        platforms: (d.platforms ?? []).map((p: any) => p.name),
      }))
      .filter((d: any) => d.amount != null)
      .sort((a: any, b: any) => a.amount - b.amount);

    return json({
      title: game.title,
      url: page,
      currency: deals[0]?.currency ?? "BRL",
      low: item?.historyLow?.all?.amount ?? null,
      deals,
      none: deals.length === 0,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
