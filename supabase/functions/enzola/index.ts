// Jogos Enzola — função única do servidor (Supabase Edge Function "enzola")
//
// O que ela faz:
//   precos         → preços em reais nas lojas do Brasil (IsThereAnyDeal). Precisa do segredo ITAD_KEY.
//   jogo           → dados da Steam em português: sinopse, requisitos, tamanho, preço Steam BR, avaliações de jogadores.
//   videos         → gameplay de youtubers brasileiros e trailer no YouTube. Precisa do segredo YOUTUBE_KEY.
//   recuperar      → troca a senha com o código de recuperação (sem e-mail).
//   excluir_conta  → apaga a conta e todos os dados do usuário logado.
//
// Como publicar: Supabase > Edge Functions > Deploy a new function > nome "enzola" > cole este arquivo > Deploy.
// Segredos (Edge Functions > Secrets): ITAD_KEY e YOUTUBE_KEY são opcionais.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem automaticamente nas funções.
// Depois, no config.js do site: FUNCTION: "enzola".

const env = (k: string) => (globalThis as any).Deno?.env.get(k) ?? "";
const ITAD = "https://api.isthereanydeal.com";
const CHANNELS = (env("YOUTUBE_CHANNELS") ||
  "alanzoka,BRKsEDU,Zangado,Cellbit,Gameplayrj,Coisa de Nerd,T3ddy,Flakes Power,Jazzghost,Mikezinho")
  .split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "content-type": "application/json" } });
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const strip = (h: string) => String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|li|h\d)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n").trim();
async function getJSON(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${new URL(url).host}`);
  return r.json();
}
async function sha256(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// ---- acesso ao banco com a chave de serviço (só aqui no servidor) ----
const SB = () => env("SUPABASE_URL");
const KEY = () => env("SUPABASE_SERVICE_ROLE_KEY");
const sbHeaders = (extra: Record<string, string> = {}) => ({ apikey: KEY(), Authorization: `Bearer ${KEY()}`, "content-type": "application/json", ...extra });
const rest = (path: string, init: RequestInit = {}) => fetch(`${SB()}/rest/v1/${path}`, { ...init, headers: sbHeaders(init.headers as any) });
const authAdmin = (path: string, init: RequestInit = {}) => fetch(`${SB()}/auth/v1/admin/${path}`, { ...init, headers: sbHeaders(init.headers as any) });

// ---------------- preços (IsThereAnyDeal) ----------------
async function precos(b: any) {
  const key = env("ITAD_KEY");
  if (!key) return json({ error: "sem_chave" }, 501);
  const title = String(b.title || "").slice(0, 200);
  if (!title) return json({ error: "título vazio" }, 400);
  const country = /^[A-Z]{2}$/.test(b.country) ? b.country : "BR";
  const lk = await getJSON(`${ITAD}/games/lookup/v1?key=${key}&title=${encodeURIComponent(title)}`);
  let game = lk?.found ? lk.game : null;
  if (!game) {
    const s = await getJSON(`${ITAD}/games/search/v1?key=${key}&title=${encodeURIComponent(title)}&results=5`);
    game = Array.isArray(s) ? s.find((g: any) => g.type === "game") ?? s[0] : null;
  }
  if (!game) return json({ none: true });
  const pr = await getJSON(`${ITAD}/games/prices/v3?key=${key}&country=${country}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify([game.id]),
  });
  const item = Array.isArray(pr) ? pr[0] : null;
  const page = `https://isthereanydeal.com/game/${game.slug}/info/`;
  const deals = (item?.deals ?? []).map((d: any) => ({
    shop: d.shop?.name ?? "Loja", amount: d.price?.amount ?? null, regular: d.regular?.amount ?? null,
    cut: d.cut ?? 0, currency: d.price?.currency ?? "BRL", url: d.url ?? page,
  })).filter((d: any) => d.amount != null).sort((a: any, c: any) => a.amount - c.amount);
  return json({ title: game.title, url: page, currency: deals[0]?.currency ?? "BRL", low: item?.historyLow?.all?.amount ?? null, deals, none: !deals.length });
}

// ---------------- dados do jogo (Steam, em português) ----------------
async function jogo(b: any) {
  const name = String(b.name || "").slice(0, 200);
  let id = /^\d+$/.test(String(b.steam || "")) ? String(b.steam) : "";
  if (!id && name) {
    const s = await getJSON(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(name)}&l=brazilian&cc=BR`);
    const items = (s.items || []).filter((x: any) => x.type === "app");
    const n = norm(name);
    const m = items.find((x: any) => norm(x.name) === n) || items.find((x: any) => norm(x.name).startsWith(n)) ||
      items.find((x: any) => n.startsWith(norm(x.name)));
    if (m) id = String(m.id);
  }
  if (!id) return json({ none: true });
  const [det, rv, all] = await Promise.all([
    getJSON(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=br&l=brazilian`),
    getJSON(`https://store.steampowered.com/appreviews/${id}?json=1&language=brazilian&num_per_page=6&filter=all&purchase_type=all`).catch(() => null),
    getJSON(`https://store.steampowered.com/appreviews/${id}?json=1&language=all&num_per_page=0&purchase_type=all`).catch(() => null),
  ]);
  const d = det?.[id]?.success ? det[id].data : null;
  if (!d) return json({ none: true });
  const req = (r: any) => (r && typeof r === "object" ? strip(r.minimum || "") : "");
  const reqRec = (r: any) => (r && typeof r === "object" ? strip(r.recommended || "") : "");
  const size = (req(d.pc_requirements).match(/(armazenamento|storage|espa[çc]o em disco|hard drive|disco r[ií]gido)[^:]*:\s*([^\n]+)/i) || [])[2] || null;
  const mv = (d.movies || [])[0];
  return json({
    steam: id,
    title: d.name,
    url: `https://store.steampowered.com/app/${id}/`,
    short: strip(d.short_description),
    about: strip(d.about_the_game).slice(0, 2500),
    release: d.release_date?.date || null,
    developers: d.developers || [],
    publishers: d.publishers || [],
    genres: (d.genres || []).map((g: any) => g.description),
    languages: strip(d.supported_languages || "").replace(/\*/g, "").slice(0, 400),
    size: size ? ((size.match(/\d+(?:[.,]\d+)?\s*[GMT]B/i) || [size])[0]).trim() : null,
    req_min: req(d.pc_requirements).slice(0, 1200),
    req_rec: reqRec(d.pc_requirements).slice(0, 1200),
    free: !!d.is_free,
    price: d.price_overview ? { currency: d.price_overview.currency, amount: d.price_overview.final / 100, regular: d.price_overview.initial / 100, cut: d.price_overview.discount_percent } : null,
    metacritic: d.metacritic?.score ?? null,
    trailer: mv ? { name: mv.name, thumb: mv.thumbnail, mp4: mv.mp4?.max || mv.mp4?.["480"] || null, hls: mv.hls_h264 || null } : null,
    screenshots: (d.screenshots || []).slice(0, 8).map((s: any) => s.path_full),
    reviews_summary: all?.query_summary ? { desc: all.query_summary.review_score_desc, positive: all.query_summary.total_positive, negative: all.query_summary.total_negative, total: all.query_summary.total_reviews } : null,
    reviews_br: rv?.query_summary ? { total: rv.query_summary.total_reviews, positive: rv.query_summary.total_positive } : null,
    reviews: (rv?.reviews || []).filter((r: any) => r.review && r.review.length > 20).slice(0, 5).map((r: any) => ({
      text: strip(r.review).slice(0, 700), up: !!r.voted_up, hours: Math.round((r.author?.playtime_forever || 0) / 60), date: r.timestamp_created, votes: r.votes_up || 0,
    })),
  });
}

// ---------------- vídeos (YouTube) ----------------
async function videos(b: any) {
  const key = env("YOUTUBE_KEY");
  const rawg = parseInt(b.rawg_id, 10), name = String(b.name || "").slice(0, 150);
  if (!name) return json({ error: "nome vazio" }, 400);
  if (rawg && SB() && KEY()) {
    const c = await rest(`video_cache?rawg_id=eq.${rawg}&select=data,updated_at`).then((r) => r.json()).catch(() => []);
    if (Array.isArray(c) && c[0] && Date.now() - new Date(c[0].updated_at).getTime() < 7 * 864e5) return json({ ...c[0].data, cached: true });
  }
  if (!key) return json({ error: "sem_chave" }, 501);
  const yt = (q: string, n: number) => getJSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=${n}&regionCode=BR&relevanceLanguage=pt&q=${encodeURIComponent(q)}&key=${key}`);
  const [gp, tr] = await Promise.all([yt(`${name} gameplay`, 25), yt(`${name} trailer`, 5)]);
  const pick = (it: any) => it && { id: it.id.videoId, title: strip(it.snippet.title), channel: it.snippet.channelTitle };
  const items = gp.items || [];
  const fav = items.find((it: any) => CHANNELS.some((c: string) => norm(it.snippet.channelTitle).includes(norm(c))));
  const data = { gameplay: pick(fav || items[0]), gameplay_br: !!fav, trailer: pick((tr.items || [])[0]) };
  if (rawg && SB() && KEY()) await rest("video_cache", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ rawg_id: rawg, data, updated_at: new Date().toISOString() }) }).catch(() => null);
  return json(data);
}

// ---------------- recuperar senha com código ----------------
async function recuperar(b: any) {
  const username = String(b.username || "").trim().toLowerCase().replace(/^@/, "");
  const code = String(b.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const password = String(b.password || "");
  const bad = () => json({ error: "Usuário ou código inválido." }, 400);
  if (!/^[a-z0-9._-]{3,30}$/.test(username) || code.length !== 16) return bad();
  if (password.length < 6 || password.length > 72) return json({ error: "A senha precisa ter de 6 a 72 caracteres." }, 400);
  const prof = await rest(`profiles?username=eq.${encodeURIComponent(username)}&select=user_id`).then((r) => r.json());
  const uid = Array.isArray(prof) && prof[0]?.user_id;
  if (!uid) return bad();
  const rec = await rest(`account_recovery?user_id=eq.${uid}&select=*`).then((r) => r.json());
  const row = Array.isArray(rec) ? rec[0] : null;
  if (!row || !row.code_hash) return bad();
  if (row.locked_until && new Date(row.locked_until) > new Date()) return json({ error: "Muitas tentativas. Tente de novo em 15 minutos." }, 429);
  if ((await sha256(`${uid}:${code}`)) !== row.code_hash) {
    const failed = (row.failed || 0) + 1;
    await rest(`account_recovery?user_id=eq.${uid}`, { method: "PATCH", body: JSON.stringify({ failed: failed >= 5 ? 0 : failed, locked_until: failed >= 5 ? new Date(Date.now() + 15 * 60e3).toISOString() : null }) });
    return bad();
  }
  const up = await authAdmin(`users/${uid}`, { method: "PUT", body: JSON.stringify({ password }) });
  if (!up.ok) return json({ error: "Não foi possível trocar a senha agora." }, 500);
  const user = await up.json();
  // o código vale uma vez só
  await rest(`account_recovery?user_id=eq.${uid}`, { method: "PATCH", body: JSON.stringify({ code_hash: null, failed: 0, locked_until: null, updated_at: new Date().toISOString() }) });
  return json({ ok: true, email: user.email });
}

// ---------------- excluir conta ----------------
async function excluirConta(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const me = await fetch(`${SB()}/auth/v1/user`, { headers: { apikey: KEY(), Authorization: `Bearer ${token}` } });
  if (!me.ok) return json({ error: "Faça login de novo." }, 401);
  const { id } = await me.json();
  if (!id) return json({ error: "Faça login de novo." }, 401);
  const del = (q: string) => rest(q, { method: "DELETE" });
  await Promise.all([
    del(`notifications?or=(user_id.eq.${id},actor.eq.${id})`),
    del(`messages?or=(sender.eq.${id},recipient.eq.${id})`),
    del(`group_members?user_id=eq.${id}`),
    del(`friendships?or=(requester.eq.${id},addressee.eq.${id})`),
    del(`games?user_id=eq.${id}`),
    del(`account_recovery?user_id=eq.${id}`),
  ]);
  await del(`groups?owner=eq.${id}`);
  await del(`profiles?user_id=eq.${id}`);
  const r = await authAdmin(`users/${id}`, { method: "DELETE" });
  if (!r.ok) return json({ error: "Os dados foram apagados, mas a conta não. Tente de novo." }, 500);
  return json({ ok: true });
}

export async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "use POST" }, 405);
  let b: any = {};
  try { b = await req.json() } catch { return json({ error: "corpo inválido" }, 400) }
  try {
    switch (b.action) {
      case "precos": return await precos(b);
      case "jogo": return await jogo(b);
      case "videos": return await videos(b);
      case "recuperar": return await recuperar(b);
      case "excluir_conta": return await excluirConta(req);
      case "ping": return json({ ok: true, itad: !!env("ITAD_KEY"), youtube: !!env("YOUTUBE_KEY") });
      default: return json({ error: "ação desconhecida" }, 400);
    }
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 502);
  }
}

(globalThis as any).Deno?.serve(handle);
