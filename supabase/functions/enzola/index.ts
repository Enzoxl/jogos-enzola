// Jogos Enzola — função única do servidor (Supabase Edge Function "enzola")
//
// O que ela faz:
//   precos         → preços em reais nas lojas do Brasil (IsThereAnyDeal). Precisa do segredo ITAD_KEY.
//   jogo           → dados da Steam em português: sinopse, requisitos, tamanho, preço Steam BR, avaliações de jogadores.
//   busca          → pesquisa na loja da Steam (acha jogos novos que a RAWG ainda não tem, como "Fart Together").
//   videos         → gameplay de youtubers brasileiros e trailer no YouTube. Precisa do segredo YOUTUBE_KEY.
//   push_key/push  → notificações no celular (cutucadas, sugestões, mensagens). As chaves são criadas sozinhas.
//   recuperar      → troca a senha com o código de recuperação (sem e-mail).
//   excluir_conta  → apaga a conta e todos os dados do usuário logado.
//   turn           → servidor TURN para as chamadas da aba Salas (conecta em 4G e redes com firewall).
//                    Segredos: CF_TURN_KEY_ID + CF_TURN_API_TOKEN (Cloudflare) ou TURN_URLS + TURN_USERNAME + TURN_CREDENTIAL.
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
    header: d.header_image || null,
    capsule: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`,
    background: d.background_raw || d.background || null,
    year: ((d.release_date?.date || "").match(/\d{4}/) || [""])[0],
    coming_soon: !!d.release_date?.coming_soon,
    website: d.website || null,
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

// ---------------- busca na Steam (complementa a RAWG com jogos novos/indie) ----------------
async function busca(b: any) {
  const q = String(b.q || "").trim().slice(0, 100);
  if (q.length < 2) return json({ items: [] });
  const s = await getJSON(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=brazilian&cc=BR`);
  const items = (s.items || []).filter((x: any) => x.type === "app" && x.id && x.name).slice(0, 12).map((x: any) => ({
    id: x.id, name: String(x.name), img: x.tiny_image || null,
    metascore: parseInt(x.metascore, 10) || null,
    price: x.price ? { currency: x.price.currency, amount: x.price.final / 100 } : null,
  }));
  return json({ items });
}

// ---------------- vídeos (YouTube) ----------------
async function videos(b: any) {
  const key = env("YOUTUBE_KEY");
  const rawg = parseInt(b.rawg_id, 10), name = String(b.name || "").slice(0, 150);
  if (!name) return json({ error: "nome vazio" }, 400);
  if (rawg && SB() && KEY()) {
    const c = await rest(`video_cache?rawg_id=eq.${rawg}&select=data,updated_at`).then((r) => r.json()).catch(() => []);
    // o cache só vale para o mesmo nome (evita alguém gravar vídeos de outro jogo no id errado)
    if (Array.isArray(c) && c[0] && norm(c[0].data?.name || "") === norm(name) && Date.now() - new Date(c[0].updated_at).getTime() < 7 * 864e5) return json({ ...c[0].data, cached: true });
  }
  if (!key) return json({ error: "sem_chave" }, 501);
  const yt = (q: string, n: number) => getJSON(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=${n}&regionCode=BR&relevanceLanguage=pt&q=${encodeURIComponent(q)}&key=${key}`);
  const [gp, tr] = await Promise.all([yt(`${name} gameplay`, 25), yt(`${name} trailer`, 5)]);
  const pick = (it: any) => it && { id: it.id.videoId, title: strip(it.snippet.title), channel: it.snippet.channelTitle };
  const items = gp.items || [];
  const fav = items.find((it: any) => CHANNELS.some((c: string) => norm(it.snippet.channelTitle).includes(norm(c))));
  const data = { name, gameplay: pick(fav || items[0]), gameplay_br: !!fav, trailer: pick((tr.items || [])[0]) };
  if (rawg && SB() && KEY()) await rest("video_cache", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ rawg_id: rawg, data, updated_at: new Date().toISOString() }) }).catch(() => null);
  return json(data);
}

// ---------------- notificações no celular (Web Push) ----------------
// As chaves VAPID são criadas pela própria função na primeira vez e ficam na tabela privada app_secrets
// (sem acesso pelo site). Nada de chave secreta no GitHub.
const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const a = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ""; for (const c of a) s += String.fromCharCode(c);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const ub64 = (s: string) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a;
};
const cat = (...xs: Uint8Array[]) => { const o = new Uint8Array(xs.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of xs) { o.set(x, i); i += x.length } return o };
const te = new TextEncoder();
const subtle = () => (globalThis.crypto as Crypto).subtle;

async function getSecret(k: string): Promise<string | null> {
  const r = await rest(`app_secrets?k=eq.${encodeURIComponent(k)}&select=v`).then((x) => x.json()).catch(() => null);
  return Array.isArray(r) && r[0] ? r[0].v : null;
}
async function setSecret(k: string, v: string, overwrite = true) {
  await rest("app_secrets", { method: "POST", headers: { Prefer: overwrite ? "resolution=merge-duplicates" : "resolution=ignore-duplicates" }, body: JSON.stringify({ k, v }) });
}
export async function vapidKeys(): Promise<{ pub: string; jwk: JsonWebKey }> {
  let raw = await getSecret("vapid");
  if (!raw) {
    const kp = await subtle().generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]) as CryptoKeyPair;
    const jwk = await subtle().exportKey("jwk", kp.privateKey);
    const pub = b64u(await subtle().exportKey("raw", kp.publicKey));
    await setSecret("vapid", JSON.stringify({ pub, jwk }), false);   // se duas chamadas correrem juntas, vale a primeira
    raw = await getSecret("vapid") || JSON.stringify({ pub, jwk });
  }
  return JSON.parse(raw);
}
export async function vapidAuth(endpoint: string, keys: { pub: string; jwk: JsonWebKey }, now = Date.now()) {
  const aud = new URL(endpoint).origin;
  const head = b64u(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const body = b64u(te.encode(JSON.stringify({ aud, exp: Math.floor(now / 1000) + 12 * 3600, sub: "https://jogos-enzola.vercel.app" })));
  const key = await subtle().importKey("jwk", { ...keys.jwk, key_ops: ["sign"] }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await subtle().sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(`${head}.${body}`));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${keys.pub}`;
}
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const k = await subtle().importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await subtle().deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}
// RFC 8291 (aes128gcm): cifra a mensagem para a assinatura do aparelho
export async function encryptPush(payload: Uint8Array, p256dh: string, auth: string) {
  const ua = ub64(p256dh), secret = ub64(auth);
  const eph = await subtle().generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]) as CryptoKeyPair;
  const as = new Uint8Array(await subtle().exportKey("raw", eph.publicKey));
  const uaKey = await subtle().importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await subtle().deriveBits({ name: "ECDH", public: uaKey } as any, eph.privateKey, 256));
  const ikm = await hkdf(secret, shared, cat(te.encode("WebPush: info\0"), ua, as), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const k = await subtle().importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv: nonce }, k, cat(payload, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return cat(salt, rs, new Uint8Array([as.length]), as, ct);
}
async function sendPush(sub: any, data: unknown, keys: { pub: string; jwk: JsonWebKey }) {
  const body = await encryptPush(te.encode(JSON.stringify(data)), sub.p256dh, sub.auth);
  const r = await fetch(sub.endpoint, {
    method: "POST",
    headers: { Authorization: await vapidAuth(sub.endpoint, keys), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "high" },
    body,
  });
  if (r.status === 404 || r.status === 410) await rest(`push_subscriptions?id=eq.${sub.id}`, { method: "DELETE" });
  return r.status;
}
// O site chama isto para pegar a chave pública (e a função se registra para o gatilho do banco)
async function pushKey() {
  if (!SB() || !KEY()) return json({ error: "sem_servidor" }, 501);
  const keys = await vapidKeys();
  await setSecret("function_url", `${SB()}/functions/v1/enzola`);
  const anon = env("SUPABASE_ANON_KEY"); if (anon) await setSecret("anon_key", anon);
  return json({ key: keys.pub });
}
const NAME = (p: any) => (p && (p.display_name || p.username)) || "Um amigo";
// Chamado pelo gatilho do banco quando entra uma notificação nova
async function push(b: any) {
  const hook = await getSecret("push_hook");
  if (!hook || b.hook !== hook) return json({ error: "não autorizado" }, 401);
  const id = String(b.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "id" }, 400);
  const [n] = await rest(`notifications?id=eq.${id}&select=*`).then((r) => r.json());
  if (!n) return json({ none: true });
  const subs = await rest(`push_subscriptions?user_id=eq.${n.user_id}&select=*`).then((r) => r.json());
  if (!Array.isArray(subs) || !subs.length) return json({ sent: 0 });
  const [actor] = n.actor ? await rest(`profiles?user_id=eq.${n.actor}&select=username,display_name,avatar`).then((r) => r.json()) : [null];
  const who = NAME(actor), P = n.payload || {};
  let title = "Jogos Enzola", body = "", url = "#perfil", tag = n.kind;
  if (n.kind === "poke") { title = `${who} te cutucou 👉`; body = "Bora jogar alguma coisa?"; url = `#amigo/${n.actor}`; tag = `poke-${n.actor}` }
  else if (n.kind === "suggest") { title = `${who} sugeriu um jogo`; body = `${P.name || "Um jogo"}${P.note ? ` — “${String(P.note).slice(0, 90)}”` : ""}`; url = P.rawg_id ? `#jogo/${P.rawg_id}` : P.steam_id ? `#jogo/s${P.steam_id}` : "#desejos" }
  else if (n.kind === "message") {
    const [m] = await rest(`messages?sender=eq.${n.actor}&recipient=eq.${n.user_id}&order=created_at.desc&limit=1&select=body`).then((r) => r.json());
    title = `Mensagem de ${who}`; body = m ? String(m.body).slice(0, 140) : "Nova mensagem"; url = `#amigo/${n.actor}`; tag = `msg-${n.actor}`;
  }
  else if (n.kind === "friend_request") { title = "Novo pedido de amizade"; body = `${who} quer ser seu amigo no Jogos Enzola.`; url = "#amigos" }
  else if (n.kind === "tag") { title = `${who} marcou você`; body = P.text ? `“${String(P.text).slice(0, 100)}”` : (P.in === "comment" ? "Num comentário." : "Numa publicação."); url = P.post_id ? `#post/${P.post_id}` : "#inicio"; tag = `tag-${n.id}` }
  else if (n.kind === "like") { title = `${who} curtiu sua publicação ❤️`; body = "Toque para ver o feed."; url = P.post_id ? `#post/${P.post_id}` : "#inicio"; tag = `like-${n.actor}` }
  else if (n.kind === "comment") { title = `${who} comentou na sua publicação`; body = P.text ? `“${String(P.text).slice(0, 100)}”` : "Novo comentário."; url = P.post_id ? `#post/${P.post_id}` : "#inicio"; tag = `comment-${n.id}` }
  else if (n.kind === "duel") { const ev = P.ev || "invite"; title = ev === "invite" ? `${who} te desafiou ⚔️` : ev === "accept" ? `${who} aceitou o duelo` : `${who} recusou o duelo`; body = ev === "invite" ? "Duelo de Cartas: bora jogar?" : ev === "accept" ? "Sua vez de jogar no Duelo de Cartas." : "Quem sabe da próxima."; url = "#duelo"; tag = `duel-${P.duel || n.id}` }
  else if (n.kind === "transfer") { const ev = P.ev || "gift"; title = ev === "gift" ? `${who} te mandou um presente 🎁` : ev === "trade" ? `${who} propôs uma troca 🔁` : ev === "accept" ? `${who} aceitou sua proposta` : `${who} recusou sua proposta`; body = ev === "gift" ? "Abra o Álbum para aceitar." : ev === "trade" ? "Troca de fotos do álbum: toque para ver." : ev === "accept" ? "Seu item foi trocado." : "O item voltou para você."; url = "#trocas"; tag = `xf-${P.tid || n.id}` }
  else if (n.kind === "friend_accept") { title = "Pedido aceito"; body = `${who} aceitou sua amizade.`; url = `#amigo/${n.actor}` }
  const keys = await vapidKeys();
  const res = await Promise.all(subs.map((s: any) => sendPush(s, { title, body, url, tag, nid: n.id }, keys).catch(() => 0)));
  return json({ sent: res.filter((x) => x >= 200 && x < 300).length });
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

// ---------------- TURN para as chamadas (aba Salas) ----------------
// Só para quem está logado. Cloudflare gera credenciais temporárias; ou usa um TURN fixo dos segredos.
async function turn(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const me = await fetch(`${SB()}/auth/v1/user`, { headers: { apikey: KEY(), Authorization: `Bearer ${token}` } });
  if (!me.ok) return json({ iceServers: [] }, 401);
  const id = env("CF_TURN_KEY_ID"), tok = env("CF_TURN_API_TOKEN");
  if (id && tok) {
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${id}/credentials/generate-ice-servers`, {
      method: "POST", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: JSON.stringify({ ttl: 86400 }),
    });
    if (r.ok) {
      const d = await r.json();
      // as portas 53 costumam travar no navegador
      const list = (d.iceServers || []).map((x: any) => ({ ...x, urls: [].concat(x.urls).filter((u: string) => !/:53\b/.test(u)) })).filter((x: any) => x.urls.length);
      return json({ iceServers: list });
    }
  }
  const urls = env("TURN_URLS").split(",").map((u: string) => u.trim()).filter(Boolean);
  if (urls.length) return json({ iceServers: [{ urls, username: env("TURN_USERNAME"), credential: env("TURN_CREDENTIAL") }] });
  return json({ iceServers: [] });
}

// ---------------- administrador (oculto) ----------------
async function adminId(req: Request): Promise<string | null> {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const me = await fetch(`${SB()}/auth/v1/user`, { headers: { apikey: KEY(), Authorization: `Bearer ${token}` } });
  if (!me.ok) return null;
  const { id } = await me.json();
  if (!id) return null;
  const r = await rest(`admins?user_id=eq.${id}&select=user_id`).then((x) => x.json()).catch(() => []);
  return Array.isArray(r) && r[0] ? id : null;
}
async function admin(req: Request, b: any) {
  const me = await adminId(req);
  if (b.action === "admin_me") return json({ admin: !!me });
  if (!me) return json({ error: "não autorizado" }, 403);
  if (b.action === "admin_list") {
    const [profs, bans, adms, au] = await Promise.all([
      rest("profiles?select=user_id,username,tag,nickname&order=username").then((r) => r.json()),
      rest("bans?select=user_id,reason,created_at").then((r) => r.json()),
      rest("admins?select=user_id").then((r) => r.json()),
      authAdmin("users?per_page=1000").then((r) => r.json()).catch(() => ({})),
    ]);
    const meta: Record<string, any> = {};
    for (const u of (au.users || [])) meta[u.id] = { created: u.created_at, last: u.last_sign_in_at };
    const bm: Record<string, any> = {}; for (const x of (Array.isArray(bans) ? bans : [])) bm[x.user_id] = x;
    const am = new Set((Array.isArray(adms) ? adms : []).map((x: any) => x.user_id));
    return json({ users: (Array.isArray(profs) ? profs : []).map((p: any) => ({ ...p, ...(meta[p.user_id] || {}), banned: !!bm[p.user_id], reason: bm[p.user_id]?.reason || null, admin: am.has(p.user_id) })), me });
  }
  const uid = String(b.user_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(uid)) return json({ error: "id inválido" }, 400);
  if (b.action === "admin_ban") {
    if (uid === me) return json({ error: "Você não pode banir a si mesmo." }, 400);
    const isAdm = await rest(`admins?user_id=eq.${uid}&select=user_id`).then((r) => r.json());
    if (Array.isArray(isAdm) && isAdm[0]) return json({ error: "Não dá para banir um administrador." }, 400);
    await rest("bans", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ user_id: uid, reason: String(b.reason || "").slice(0, 200) || null, banned_by: me }) });
    const r = await authAdmin(`users/${uid}`, { method: "PUT", body: JSON.stringify({ ban_duration: "876000h" }) });
    if (!r.ok) return json({ error: "Não foi possível bloquear o login agora." }, 500);
    return json({ ok: true });
  }
  if (b.action === "admin_unban") {
    await rest(`bans?user_id=eq.${uid}`, { method: "DELETE" });
    const r = await authAdmin(`users/${uid}`, { method: "PUT", body: JSON.stringify({ ban_duration: "none" }) });
    if (!r.ok) return json({ error: "Não foi possível liberar o login agora." }, 500);
    return json({ ok: true });
  }
  return json({ error: "ação desconhecida" }, 400);
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
    del(`push_subscriptions?user_id=eq.${id}`),
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
      case "busca": return await busca(b);
      case "push_key": return await pushKey();
      case "push": return await push(b);
      case "recuperar": return await recuperar(b);
      case "admin_me": case "admin_list": case "admin_ban": case "admin_unban": return await admin(req, b);
      case "excluir_conta": return await excluirConta(req);
      case "turn": return await turn(req);
      case "ping": return json({ ok: true, itad: !!env("ITAD_KEY"), youtube: !!env("YOUTUBE_KEY") });
      default: return json({ error: "ação desconhecida" }, 400);
    }
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 502);
  }
}

(globalThis as any).Deno?.serve(handle);
