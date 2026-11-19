/* Jogos Enzola — núcleo: dados, perfil, catálogo, galeria, tier list, lista de desejos, resumo, rotas.
   Outros arquivos: jogo.js (busca e página do jogo, preços), social.js (amigos, mensagens, notificações),
   extras.js (configurações, senha, PDF, instalar app, recorte de imagem). */
const CFG = window.APP_CONFIG || {};
const VERSION = "3.4";
const STATUS = ["Finalizado", "Jogando", "Não iniciado", "Não comprado"];
const EXPS = ["Perfeito", "Ótimo", "Muito bom", "Bom", "Ok", "Meh", "Chumbos"];
const EXPCOL = { "Perfeito": "#2E8B6A", "Ótimo": "#4C9F7A", "Muito bom": "#6FA8DC", "Bom": "#4B6B9E", "Ok": "#C9A227", "Meh": "#D98A3D", "Chumbos": "#B14A47" };
const TIERS = [["S", "#F28B82"], ["A", "#F6B26B"], ["B", "#F5DC78"], ["C", "#A8D5A2"], ["D", "#9CC0F5"]];
const PLATS = ["PC", "PlayStation", "Xbox", "Switch", "Outro"];
const PLATCOL = { "PC": "#6C93FF", "PlayStation": "#4F8BE8", "Xbox": "#4ADE9B", "Switch": "#FF7A7A", "Outro": "#A88BFA" };
const TABS = ["inicio", "movimento", "perfil", "catalogo", "galeria", "tier", "desejos", "amigos", "resumo", "idiomas", "config"];
const CAT_SUBS = ["catalogo", "desejos", "resumo"];   // Lista de desejos e Resumo agora ficam dentro do Catálogo
const NEW_COLS = ["hours", "metacritic", "playtime", "rawg_id", "steam_id", "target_price", "price", "price_checked_at"];
const PRICE_TTL = 12 * 3600 * 1000;
const PRESETS = [
  { k: "p1", icon: "gamepad", bg: "linear-gradient(135deg,#2F5FA8,#14213D)" },
  { k: "p2", icon: "trophy", bg: "linear-gradient(135deg,#C9A227,#7A5B0F)" },
  { k: "p3", icon: "star", bg: "linear-gradient(135deg,#6FA8DC,#2F5FA8)" },
  { k: "p4", icon: "heart", bg: "linear-gradient(135deg,#B14A47,#5A1F1D)" },
  { k: "p5", icon: "play", bg: "linear-gradient(135deg,#4C9F7A,#1D4E3C)" },
  { k: "p6", icon: "layers", bg: "linear-gradient(135deg,#8E6FD0,#3D2A73)" },
  { k: "p7", icon: "chart", bg: "linear-gradient(135deg,#D98A3D,#7A3F0F)" },
  { k: "p8", icon: "bookmark", bg: "linear-gradient(135deg,#3B7F8C,#173F47)" },
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// links e imagens vindos de fora (APIs, perfis): só http(s); bloqueia "javascript:" e quebra de CSS
const hrefOk = u => esc(/^(https?:\/\/|#|mailto:)/i.test(String(u || "")) ? u : "#");
const REWARDS = { silvio: { name: "Hipopótamo apresentador", avatar: "premios/silvio-avatar.webp", banner: "premios/silvio-banner.webp" } };
const rewardOf = v => { const m = /^reward:([a-z0-9_-]+)$/.exec(String(v || "")); return m && REWARDS[m[1]] ? REWARDS[m[1]] : null };
const cssUrl = u => rewardOf(u) ? rewardOf(u).banner : /^(https?:\/\/|data:image\/|blob:)/i.test(String(u || "")) ? String(u).replace(/['"()\\\s<>]/g, c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")) : "";
const ic = (n, cls = "") => `<svg class="ic ${cls}"><use href="#i-${n}"/></svg>`;
const sk = s => s.replace("ã", "a").replace(/ /g, "-");
const stClass = s => "st-" + sk(s || "Não iniciado");
const rateTxt = g => g.rating == null || g.rating === "" ? "—" : Number(g.rating).toFixed(1).replace(".0", "");
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const num = v => v === "" || v == null || isNaN(Number(v)) ? null : Number(v);
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)) } catch (e) { return null } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } }
function money(v, cur) { try { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur || "BRL" }).format(v) } catch (e) { return (cur || "") + " " + Number(v).toFixed(2) } }
function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
function rel(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "agora há pouco";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `há ${Math.floor(s / 86400)} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

let sb = null, user = null, games = [], profile = null, loaded = false, sessionKnown = false;
let tab = "perfil", routeArg = "", fStatus = "", gStatus = "", tStatus = "played", selected = null, wlSort = "n";
let found = [], busy = false, pe = null, searchTimer = null;
const caps = { games: true, pub: true, v3: true };

function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 3800) }
// Nome de usuário: vem do cadastro (contas novas) ou, nas contas antigas, da parte antes do @ do e-mail interno.
const uname = () => { if (!user) return ""; const md = user.user_metadata || {}; if (md.username) return md.username; if (profile && profile.username) return profile.username; return (user.email || "").split("@")[0] };
// Conta antiga, criada só com usuário (e-mail interno usuario@gmail.com, que não é da pessoa).
const isLegacy = () => !!user && !(user.user_metadata || {}).real_email && (user.email || "").toLowerCase() === uname() + "@gmail.com";
const siteUrl = () => location.origin + location.pathname;
const nick = () => (profile && profile.nickname) || uname();
const myTag = () => profile && profile.tag ? "#" + profile.tag : "";
const gameById = id => games.find(g => g.id === id);
const wishlist = () => games.filter(g => g.wishlist || g.status === "Não comprado");
const shareUrl = u => location.origin + location.pathname + "#u/" + encodeURIComponent(u);
const hoursTxt = h => h == null || h === "" ? "" : `${Number(h).toLocaleString("pt-BR")} h`;
const setting = (k, d) => { const s = (profile && profile.settings) || {}; return s[k] === undefined ? d : s[k] };
const isConsole = p => p === "PlayStation" || p === "Xbox" || p === "Switch";

/* ---------- visuais reutilizáveis ---------- */
function cover(g) {
  if (g.cover_url) return `<img class="cv" alt="" referrerpolicy="no-referrer" loading="lazy" src="${esc(g.cover_url)}">`;
  const h = hue(g.name || "");
  return `<div class="cvf" style="background:linear-gradient(160deg,hsl(${h} 45% 38%),hsl(${(h + 40) % 360} 50% 20%))">${esc(g.name)}</div>`;
}
function avatar(a) {
  if (/^skin:/.test(a || "") && typeof skinAvatarSrc === "function") { const s = skinAvatarSrc(String(a).slice(5)); if (s) return `<img alt="" src="${s}">` }
  if (rewardOf(a)) return `<img alt="" src="${rewardOf(a).avatar}">`;
  if (a && /^https?:/.test(a)) return `<img alt="" src="${esc(a)}">`;
  const k = a && a.startsWith("preset:") ? a.slice(7) : "p1";
  const p = PRESETS.find(x => x.k === k) || PRESETS[0];
  return `<div class="av-preset" style="background:${p.bg}">${ic(p.icon)}</div>`;
}
function bannerHTML(p, cur, extraCls = "") {
  if (p.banner) return `<div class="banner ${extraCls}" style="background-image:url('${cssUrl(p.banner)}')">`;
  if (cur && cur.cover_url) return `<div class="banner auto ${extraCls}"><div class="bgauto" style="background-image:url('${cssUrl(cur.cover_url)}')"></div><span class="logo wm" aria-hidden="true"></span>`;
  return `<div class="banner ${extraCls}"><span class="logo wm" aria-hidden="true"></span>`;
}
// tela de carregamento: o hipopótamo nadando de um lado para o outro
const hippoLoad = (msg = "Carregando…", cls = "") => `<div class="hload ${cls}" role="status" aria-live="polite"><div class="hl-pool" aria-hidden="true"><div class="hl-swim"><img src="hipopotamo.webp" alt="" draggable="false"></div><i class="hl-b"></i><i class="hl-b"></i><i class="hl-b"></i><div class="hl-wave"></div></div><p>${esc(msg)}</p></div>`;
const skRows = n => Array.from({ length: n }, () => `<div class="row skrow"><span class="sk" style="width:18px;height:12px"></span><span class="sk" style="width:44px;aspect-ratio:2/3"></span><span><span class="sk" style="width:55%;height:14px"></span><span class="sk" style="width:35%;height:10px;margin-top:8px"></span></span><span class="sk" style="height:30px;border-radius:999px"></span><span class="sk" style="height:30px"></span><span class="sk" style="height:18px"></span><span></span></div>`).join("");
const skGrid = n => Array.from({ length: n }, () => `<div><div class="sk" style="aspect-ratio:2/3;border-radius:10px"></div><div class="sk" style="height:12px;width:70%;margin-top:12px"></div></div>`).join("");
const empty = (t, d, extra = "") => `<div class="panel empty" style="grid-column:1/-1"><b>${t}</b>${d}${extra}</div>`;

/* ---------- imagens (recorte em extras.js) ---------- */
async function uploadBlob(blob, kind) {
  const path = `${user.id}/${kind}-${Date.now()}.jpg`;
  const { error } = await sb.storage.from("media").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}
async function pickAndUpload(kind) {
  const file = await pickImage(); if (!file) return null;
  const blob = await openCropper(file, kind); if (!blob) return null;
  toast("Enviando imagem…");
  try { return await uploadBlob(blob, kind) } catch (e) { toast("Não foi possível enviar a imagem. Tente de novo."); return null }
}

/* ---------- dados ---------- */
async function checkSchema() {
  const [a, b, c] = await Promise.all([
    sb.from("games").select(NEW_COLS.join(",")).limit(1),
    sb.from("profiles").select("is_public").limit(1),
    sb.from("profiles").select("tag,settings").limit(1),
  ]);
  caps.games = !a.error; caps.pub = !b.error; caps.v3 = !c.error;
  $("#bell").hidden = !caps.v3;
  const m = $("#mig"); m.hidden = caps.games && caps.pub && caps.v3;
  if (!m.hidden) m.innerHTML = `${ic("shield")}<span><b>Falta um passo no banco.</b> Rode o arquivo <code>migracao.sql</code> no SQL Editor do Supabase para ativar ID de usuário, mensagens, notificações, preços salvos e perfil público. Até lá, o resto funciona normalmente.</span>`;
}
function clean(patch) { if (caps.games) return patch; const p = { ...patch }; for (const k of NEW_COLS) delete p[k]; return p }

async function loadAll() {
  const [g, p] = await Promise.all([
    sb.from("games").select("*").eq("user_id", user.id).order("n", { ascending: true }),
    sb.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    checkSchema(),
  ]);
  if (g.error) { toast("Não foi possível carregar os jogos."); return }
  sb.from("bans").select("user_id").eq("user_id", user.id).maybeSingle().then(async r => { if (r.data) { await sb.auth.signOut(); toast("Esta conta foi suspensa."); showAuth(true, "Esta conta foi suspensa pelo administrador.") } });
  games = g.data; profile = p.data || null; loaded = true; applyLocalPrefs(); render();
  if (!profile || profile.username !== uname() || (caps.v3 && !profile.tag)) await saveProfile({});
  if (tab === "desejos") refreshPrices(false);
}
async function save(id, patch, quiet) {
  const g = gameById(id); if (!g) return;
  const now = new Date().toISOString();
  const finishing = patch.status === "Finalizado" && g.status !== "Finalizado";
  if (finishing && !patch.finished_at) patch.finished_at = now;
  const ratingChanged = "rating" in patch && patch.rating != null && patch.rating !== g.rating;
  const reviewChanged = "review" in patch && patch.review && patch.review !== g.review;
  if (ratingChanged || reviewChanged) patch.rated_at = now;
  Object.assign(g, patch); render();
  if (finishing && !quiet) celebrate(g.name);
  const send = clean(patch); if (!Object.keys(send).length) return;
  const { error } = await sb.from("games").update(send).eq("id", id);
  if (error) { toast("Erro ao salvar. Recarregando…"); loadAll() }
}
async function create(data) {
  const n = games.reduce((m, g) => Math.max(m, g.n || 0), 0) + 1;
  const row = { n, name: "", status: "Não iniciado", exp: "", ...data };
  if (row.status === "Finalizado" && !row.finished_at) row.finished_at = new Date().toISOString();
  if (row.rating != null || row.review) row.rated_at = new Date().toISOString();
  const { data: ins, error } = await sb.from("games").insert(clean(row)).select().single();
  if (error) { toast("Erro ao adicionar o jogo."); return null }
  games.push(ins); render(); return ins;
}
async function removeGame(id) {
  const { error } = await sb.from("games").delete().eq("id", id);
  if (error) { toast("Erro ao remover."); return }
  games = games.filter(g => g.id !== id);
  if (profile) {
    const patch = {};
    if ((profile.favorites || []).includes(id)) patch.favorites = profile.favorites.filter(x => x !== id);
    if (profile.now_playing === id) patch.now_playing = null;
    if (Object.keys(patch).length) await saveProfile(patch);
  }
  render();
}
async function saveProfile(patch) {
  const next = { ...(profile || {}), ...patch };
  profile = next;   // atualiza na hora: mudanças seguidas não se sobrescrevem
  const row = { user_id: user.id, username: uname(), nickname: next.nickname ?? null, bio: next.bio ?? null, avatar: next.avatar ?? null, banner: next.banner ?? null, favorites: next.favorites || [], now_playing: next.now_playing ?? null, updated_at: new Date().toISOString() };
  if (caps.pub) row.is_public = !!next.is_public;
  if (caps.v3) row.settings = next.settings || {};
  const { data, error } = await sb.from("profiles").upsert(row, { onConflict: "user_id" }).select().single();
  if (error) { toast("Não foi possível salvar o perfil."); return false }
  profile = data; if (!caps.v3) profile.settings = next.settings || {}; render(); return true;
}

/* ---------- comemoração ao zerar ---------- */
function celebrate(name) {
  toast(`🏆 Você zerou ${name}!`);
  if (!setting("confetti", true) || document.documentElement.classList.contains("calm") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.createElement("div"); box.className = "confetti"; box.setAttribute("aria-hidden", "true");
  const cols = ["#6C93FF", "#A88BFA", "#F2C14E", "#4ADE9B", "#FF8A80", "#fff"];
  for (let i = 0; i < 70; i++) {
    const s = document.createElement("i");
    s.style.cssText = `--l:${Math.random() * 100}vw;--x:${(Math.random() - .5) * 30}vw;--r:${Math.random() * 900 - 450}deg;--d:${1.4 + Math.random() * 1.4}s;--w:${6 + Math.random() * 6}px;background:${cols[i % cols.length]};animation-delay:${Math.random() * .25}s`;
    box.append(s);
  }
  document.body.append(box); setTimeout(() => box.remove(), 3200);
}

/* ---------- filtros ---------- */
function chipsHTML(cur, prefix, list = games) {
  return [["", "Todos"], ...STATUS.map(s => [s, s])].map(([v, l]) => {
    const c = v ? list.filter(g => g.status === v).length : list.length;
    return `<button class="chip" data-${prefix}="${esc(v)}" aria-pressed="${cur === v}">${esc(l)} · ${c}</button>`;
  }).join("");
}
function sorted(list, mode) {
  const a = [...list];
  if (mode === "name") a.sort((x, y) => x.name.localeCompare(y.name, "pt"));
  else if (mode === "rating") a.sort((x, y) => (y.rating ?? -1) - (x.rating ?? -1));
  else if (mode === "exp") a.sort((x, y) => { const i = v => EXPS.indexOf(v) < 0 ? 99 : EXPS.indexOf(v); return i(x.exp) - i(y.exp) });
  else if (mode === "recent") a.sort((x, y) => new Date(y.created_at || 0) - new Date(x.created_at || 0));
  else if (mode === "hours") a.sort((x, y) => (+y.hours || 0) - (+x.hours || 0));
  else if (mode === "price") a.sort((x, y) => (brl(bestOf(x)) ?? 1e9) - (brl(bestOf(y)) ?? 1e9));
  else if (mode === "cut") a.sort((x, y) => (bestOf(y)?.cut ?? -1) - (bestOf(x)?.cut ?? -1));
  else a.sort((x, y) => (x.n || 0) - (y.n || 0));
  return a;
}

/* ---------- perfil ---------- */
function activity(list = games) {
  const ev = [];
  for (const g of list) {
    if (g.created_at) ev.push({ t: g.created_at, k: "add", g });
    if (g.finished_at) ev.push({ t: g.finished_at, k: "fin", g });
    if (g.rated_at) ev.push({ t: g.rated_at, k: "rate", g });
  }
  return ev.sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 8);
}
const actText = e => e.k === "fin" ? `Zerou <b>${esc(e.g.name)}</b>` : e.k === "rate" ? `Avaliou <b>${esc(e.g.name)}</b>${e.g.rating != null ? " com nota " + rateTxt(e.g) : ""}` : `Adicionou <b>${esc(e.g.name)}</b>`;
const actIcon = e => e.k === "fin" ? ["fin", "trophy"] : e.k === "rate" ? ["rate", "star"] : ["add", "plus"];
function statsOf(list) {
  const fin = list.filter(g => g.status === "Finalizado").length;
  const rated = list.filter(g => g.rating != null && g.rating !== "");
  const avg = rated.length ? (rated.reduce((a, g) => a + Number(g.rating), 0) / rated.length).toFixed(1) : "—";
  const hrs = list.reduce((a, g) => a + (+g.hours || 0), 0);
  return { fin, avg, hrs };
}
function renderProfile() {
  const el = $("#perfil");
  if (!loaded) {
    el.innerHTML = hippoLoad("Carregando seu perfil…", "big");
    return;
  }
  const p = profile || {};
  const favs = (p.favorites || []).filter(id => gameById(id)).slice(0, 5).map(gameById);
  const cur = gameById(p.now_playing) || games.find(g => g.status === "Jogando");
  const { fin, avg, hrs } = statsOf(games);
  const revs = games.filter(g => g.review && g.review.trim()).sort((a, b) => new Date(b.rated_at || 0) - new Date(a.rated_at || 0)).slice(0, 4);
  const wl = wishlist(), act = activity();
  const slots = [];
  for (let i = 0; i < 5; i++) {
    const g = favs[i];
    slots.push(g ? `<button class="fav" data-open="${g.id}"><div class="poster"><span class="rank">${i + 1}</span>${cover(g)}</div><div class="n">${esc(g.name)}</div><div class="r">${g.exp ? esc(g.exp) : "Sem experiência"}${g.rating != null ? " · " + rateTxt(g) : ""}</div></button>`
      : `<button class="fav slot" data-act="edit-profile" aria-label="Escolher um favorito"><div class="poster">${ic("plus")}</div></button>`);
  }
  el.innerHTML = `
  ${bannerHTML(p, cur)}
    <div class="ban-acts">
      <button class="btn ghost sm" data-act="quick-banner" title="Escolher uma imagem da sua galeria">${ic("image")}<span>Trocar banner</span></button>
      ${p.is_public ? `<button class="btn ghost sm" data-act="share-profile">${ic("share")}<span>Compartilhar</span></button>` : ""}
      <button class="btn ghost sm" data-act="edit-profile">${ic("pencil")}<span>Editar perfil</span></button></div></div>
  <div class="phead">
    <button class="av lg av-edit" data-act="quick-avatar" aria-label="Trocar foto de perfil" title="Trocar foto">${avatar(p.avatar)}<span class="av-cam">${ic("camera")}</span></button>
    <div class="pid"><h1>${esc(nick())}</h1><div class="un">@${esc(uname())}${p.tag ? ` <button class="idtag" data-act="copy-id" title="Copiar seu ID">#${esc(p.tag)}</button>` : ""}${p.is_public ? ` <span class="pubtag">${ic("globe")}Perfil público</span>` : ""}</div></div>
    <div class="pstats">
      <div class="pstat"><b>${games.length}</b><span>Jogos</span></div>
      <div class="pstat"><b>${fin}</b><span>Zerados</span></div>
      <div class="pstat"><b>${avg}</b><span>Nota média</span></div>
      ${hrs ? `<div class="pstat"><b>${Math.round(hrs).toLocaleString("pt-BR")}</b><span>Horas</span></div>` : ""}
    </div>
  </div>
  <p class="bio ${p.bio ? "" : "empty-bio"}">${p.bio ? esc(p.bio) : "Escreva uma pequena descrição sobre você em “Editar perfil”."}</p>

  <div class="pgrid">
    <div>
      <div class="blk"><div class="blk-h"><h3>${ic("play")}Jogo do momento</h3><button class="link" data-act="edit-profile">Alterar</button></div>
        ${cur ? `<button class="now" data-open="${cur.id}"><div class="poster">${cover(cur)}</div><div class="now-b"><span class="k">Jogando agora</span><span class="t">${esc(cur.name)}</span>
          <span class="m">${[cur.platform, cur.genre, cur.year, hoursTxt(cur.hours)].filter(Boolean).map(esc).join(" · ") || "&nbsp;"}</span>
          <span><span class="badge ${stClass(cur.status)}">${esc(cur.status)}</span></span>
          ${cur.review ? `<span class="q">“${esc(cur.review)}”</span>` : ""}</div></button>`
      : `<div class="panel empty"><b>Nenhum jogo no momento</b>Escolha o que você está jogando agora.<br><button class="btn sm" data-act="edit-profile">Escolher jogo</button></div>`}</div>

      <div class="blk"><div class="blk-h"><h3>${ic("heart")}Jogos favoritos</h3><button class="link" data-act="edit-profile">Escolher (até 5)</button></div>
        <div class="favgrid">${slots.join("")}</div></div>

      <div class="blk"><div class="blk-h"><h3>${ic("message")}Avaliações e comentários</h3></div>
        ${revs.length ? `<div class="revs">${revs.map(g => `<button class="rev" data-open="${g.id}"><div class="mini">${cover(g)}</div><div class="rev-b"><div class="rev-t"><span>${esc(g.name)}</span><span class="sc">${rateTxt(g)}</span></div><div class="rev-q">${esc(g.review)}</div></div></button>`).join("")}</div>`
      : `<div class="panel empty"><b>Nenhuma análise ainda</b>Abra um jogo e escreva o que você achou dele.</div>`}</div>
    </div>

    <aside>
      <div class="blk"><div class="blk-h"><h3>${ic("clock")}Atividade recente</h3></div>
        <div class="panel act">${act.length ? act.map(e => { const [c, i] = actIcon(e); return `<button data-open="${e.g.id}"><span class="dot ${c}">${ic(i)}</span><span class="tx">${actText(e)}<span class="tm">${rel(e.t)}</span></span></button>` }).join("")
      : `<div class="empty" style="padding:24px 12px"><b>Sem atividade</b>Adicione, zere ou avalie um jogo.</div>`}</div></div>

      <div class="blk"><div class="blk-h"><h3>${ic("bookmark")}Lista de desejos</h3><button class="link" data-go="desejos">Ver preços</button></div>
        <div class="panel">${wl.length ? `<div class="wmini">${wl.slice(0, 6).map(g => { const b = bestOf(g); return `<button data-open="${g.id}" title="${esc(g.name)}"><div class="poster">${cover(g)}${b ? `<span class="ptag">${money(brl(b), "BRL")}</span>` : ""}</div></button>` }).join("")}</div>`
      : `<div class="empty" style="padding:24px 12px"><b>Lista vazia</b>Guarde aqui o que quer jogar depois.</div>`}</div></div>
    </aside>
  </div>`;
}
async function quickImage(kind) {
  const url = await pickAndUpload(kind); if (!url) return;
  if (await saveProfile(kind === "avatar" ? { avatar: url } : { banner: url })) toast(kind === "avatar" ? "Foto atualizada." : "Banner atualizado.");
}

/* ---------- catálogo ---------- */
function renderCatalog() {
  $("#fchips").innerHTML = chipsHTML(fStatus, "f");
  $("#cat-sub").textContent = loaded ? `${games.length} jogos na sua biblioteca` : "";
  const ps = $("#plat"), pv = ps.value, all = [...new Set([...PLATS, ...games.map(g => g.platform).filter(Boolean)])];
  const opts = `<option value="">Todas as plataformas</option>` + all.map(p => `<option${p === pv ? " selected" : ""}>${esc(p)}</option>`).join("");
  if (ps.dataset.sig !== opts) { ps.innerHTML = opts; ps.dataset.sig = opts }
  const q = norm($("#q").value), favs = (profile && profile.favorites) || [];
  const list = sorted(games.filter(g => (!fStatus || g.status === fStatus) && (!pv || g.platform === pv) && (!q || norm(g.name).includes(q))), $("#sort").value);
  const box = $("#list");
  if (!loaded) { box.innerHTML = hippoLoad("Carregando sua biblioteca…"); return }
  if (!games.length) { box.innerHTML = `<div class="empty"><b>Nenhum jogo ainda</b>Adicione o primeiro jogo ou importe uma planilha.<br><button class="btn sm" data-act="add">${ic("plus")}Adicionar jogo</button></div>`; return }
  if (!list.length) { box.innerHTML = `<div class="empty"><b>Nada encontrado</b>Tente outro nome ou filtro.<br><button class="btn ghost sm" data-act="clear-cat">Limpar filtros</button></div>`; return }
  box.innerHTML = `<div class="row head"><span>Nº</span><span></span><span>Jogo</span><span>Status</span><span>Experiência</span><span style="text-align:center">Nota</span><span></span></div>` +
    list.map(g => {
      const meta = [g.platform, g.genre, g.year, hoursTxt(g.hours)].filter(Boolean).map(esc);
      if (g.notes) meta.push(esc(g.notes));
      return `<div class="row" data-id="${g.id}">
      <span class="num">${g.n ?? ""}</span><button class="mini qv-btn" data-qv="m:${g.id}" aria-label="Ver resumo de ${esc(g.name)}" title="Ver resumo do jogo">${cover(g)}</button>
      <div class="nmbox" style="min-width:0"><div class="nm">${gameHref(g) ? `<a class="glink" href="#${gameHref(g)}" title="Ver ficha do jogo">${esc(g.name)}</a>` : esc(g.name)}${favs.includes(g.id) ? ic("heart", "fill") : ""}${g.wishlist ? ic("bookmark", "w") : ""}</div>
        <div class="meta">${meta.join(" · ")}</div></div>
      <div class="stbox"><select class="stsel ${stClass(g.status)}" data-f="status" aria-label="Status de ${esc(g.name)}">${STATUS.map(s => `<option${s === g.status ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="exbox"><select data-f="exp" aria-label="Experiência de ${esc(g.name)}"><option value="">—</option>${EXPS.map(s => `<option${s === g.exp ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <span class="rate">${rateTxt(g)}</span>
      <button class="iconbtn" data-open="${g.id}" aria-label="Editar ${esc(g.name)}">${ic("pencil")}</button></div>`;
    }).join("");
}

/* ---------- galeria ---------- */
function renderGallery() {
  const q = norm($("#gq").value);
  const base = games.filter(g => !q || norm(g.name).includes(q));
  $("#gchips").innerHTML = chipsHTML(gStatus, "g", base);
  const list = sorted(base.filter(g => !gStatus || g.status === gStatus), "n");
  $("#grid").innerHTML = !loaded ? hippoLoad("Carregando as capas…") : !list.length
    ? empty(games.length ? "Nada encontrado" : "Galeria vazia", games.length ? "Tente outro nome ou filtro." : "Adicione jogos para ver as capas aqui.")
    : list.map(g => `<button class="card" data-open="${g.id}"><div class="poster"><span class="tag badge ${stClass(g.status)}">${esc(g.status)}</span>${g.metacritic ? `<span class="mc" title="Metacritic">${g.metacritic}</span>` : ""}${cover(g)}<div class="ov"><span class="badge st-Finalizado" style="visibility:${g.exp ? "visible" : "hidden"}">${esc(g.exp)}</span><span class="rate">${rateTxt(g)}</span></div></div><div class="t">${esc(g.name)}</div></button>`).join("");
}

/* ---------- lista de desejos ---------- */
function renderWishlist() {
  const q = norm($("#wq").value);
  const all = wishlist(), list = sorted(all.filter(g => !q || norm(g.name).includes(q)), wlSort);
  const priced = all.filter(bestOf);
  const tot = priced.reduce((a, g) => a + (brl(bestOf(g)) || 0), 0), totUsd = priced.filter(g => g.price.currency === "USD").reduce((a, g) => a + bestOf(g).amount, 0);
  const checkedTimes = all.map(g => g.price_checked_at).filter(Boolean).sort();
  $("#wl-sub").textContent = loaded ? `${all.length} ${all.length === 1 ? "jogo" : "jogos"} que você quer jogar ou comprar.` : "";
  $("#wl-refresh").disabled = priceRun || !all.length; $("#wl-pdf").disabled = !all.length;
  $("#wl-bar").innerHTML = !loaded || !all.length ? "" : `
    <div class="wl-sum">
      <div><span class="k">Total no menor preço</span><b>${priced.length ? money(tot, "BRL") : "—"}</b>${totUsd && usdRate ? `<span class="usd">inclui ${money(totUsd, "USD")} convertidos pela cotação de hoje (US$ 1 = ${money(usdRate, "BRL")})</span>` : ""}</div>
      <div><span class="k">Com preço</span><b>${priced.length}/${all.length}</b></div>
      <div><span class="k">Em promoção</span><b>${priced.filter(g => bestOf(g).cut > 0).length}</b></div>
    </div>
    <div class="wl-tools"><p class="hint">${esc(priceSourceText())}${checkedTimes.length ? ` Conferido ${rel(checkedTimes[checkedTimes.length - 1])}.` : ""}</p>
      <select id="wl-sort" aria-label="Ordenar lista de desejos">${[["n", "Ordem da lista"], ["price", "Menor preço"], ["cut", "Maior desconto"], ["name", "Nome (A–Z)"]].map(([v, l]) => `<option value="${v}"${v === wlSort ? " selected" : ""}>${l}</option>`).join("")}</select></div>`;
  $("#wgrid").innerHTML = !loaded ? hippoLoad("Carregando sua lista de desejos…") : !all.length
    ? empty("Sua lista está vazia", "Use a busca no topo para achar um jogo e veja onde ele está mais barato.", `<br><button class="btn sm" id="add-wish2">${ic("plus")}Adicionar à lista</button>`)
    : !list.length ? empty("Nada encontrado", "Nenhum jogo da lista tem esse nome.")
    : list.map(g => { const b = bestOf(g); return `<div class="wcard"><button class="card" data-open="${g.id}"><div class="poster">${b && b.cut > 0 ? `<span class="cut">-${b.cut}%</span>` : ""}${cover(g)}</div><div class="t">${esc(g.name)}</div><div class="meta">${platLabel(g.platform)}</div></button>
      ${priceBox(g)}
      <div class="wact"><button class="btn ghost sm" data-bought="${g.id}">${ic("check")}Já comprei</button></div></div>` }).join("");
}

/* ---------- tier list ---------- */
function tc(g) { return `<button class="tc" draggable="true" data-tc="${g.id}" aria-pressed="${selected === g.id}" title="${esc(g.name)}" aria-label="${esc(g.name)}">${cover(g)}</button>` }
function renderTier() {
  $("#tiers").innerHTML = TIERS.map(([t, c]) => {
    const l = games.filter(g => g.tier === t).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0));
    return `<div class="tier"><div class="lab" style="background:${c}">${t}</div><div class="zone" data-tier="${t}">${l.map(tc).join("") || `<span class="zhint">Solte um jogo aqui</span>`}</div></div>`;
  }).join("");
  $("#tchips").innerHTML = [["played", "Jogados"], ["", "Todos"], ["Não iniciado", "Não iniciados"]].map(([v, l]) => `<button class="chip" data-t="${esc(v)}" aria-pressed="${tStatus === v}">${l}</button>`).join("") +
    (selected ? `<button class="chip warn" data-t="__clear">${ic("x")}Tirar da tier</button>` : "");
  let pool = games.filter(g => !g.tier);
  if (tStatus === "played") pool = pool.filter(g => g.status === "Finalizado" || g.status === "Jogando");
  else if (tStatus) pool = pool.filter(g => g.status === tStatus);
  $("#pool").innerHTML = pool.length ? sorted(pool, "n").map(tc).join("") : `<div class="meta" style="padding:8px">Nenhum jogo para classificar neste filtro.</div>`;
  $("#tier .sel-hint").hidden = !selected;
}
function setTier(id, tier, beforeId) {
  const g = gameById(id); if (!g) return;
  if (!tier) { if (g.tier) save(id, { tier: null, tier_order: null }); return }
  const list = games.filter(x => x.tier === tier && x.id !== id).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0));
  const i = beforeId ? list.findIndex(x => x.id === beforeId) : -1;
  let ord;
  if (i >= 0) { const nx = list[i], pv = list[i - 1]; ord = pv ? (pv.tier_order + nx.tier_order) / 2 : nx.tier_order - 1 }
  else ord = list.length ? list[list.length - 1].tier_order + 1 : 1;
  save(id, { tier, tier_order: ord });
}
function loadImg1(src, cors) {
  return new Promise(res => {
    if (!src) return res(null);
    const im = new Image(); if (cors) im.crossOrigin = "anonymous";
    const t = setTimeout(() => res(null), 8000);
    im.onload = () => { clearTimeout(t); res(im.naturalWidth ? im : null) }; im.onerror = () => { clearTimeout(t); res(null) };
    im.src = src;
  });
}
// Para desenhar capas em imagens e PDFs. No celular, a capa que já está na tela fica guardada sem a
// permissão de uso (CORS) e o navegador recusa; por isso pedimos uma cópia separada e, se ainda falhar,
// buscamos pelo wsrv.nl (serviço público de imagens que libera o uso).
async function loadImg(src, cors) {
  if (!src || !cors) return loadImg1(src, false);
  if (/^(data|blob):/.test(src)) return loadImg1(src, true);
  const sep = src.includes("?") ? "&" : "?";
  return (await loadImg1(src + sep + "jecors=1", true))
    || (await loadImg1("https://wsrv.nl/?url=" + encodeURIComponent(src.replace(/^https?:\/\//, "")) + "&w=480&output=jpg", true));
}
function rr(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath() }
function fallbackCover(x, g, cx, cy, CW, CH, fs = 11) {
  const h0 = hue(g.name || ""), gr = x.createLinearGradient(cx, cy, cx + CW, cy + CH);
  gr.addColorStop(0, `hsl(${h0} 45% 38%)`); gr.addColorStop(1, `hsl(${(h0 + 40) % 360} 50% 20%)`); x.fillStyle = gr; x.fillRect(cx, cy, CW, CH);
  x.fillStyle = "#fff"; x.font = `700 ${fs}px 'Chakra Petch', system-ui, sans-serif`;
  const words = String(g.name).split(/\s+/), lines = []; let ln = "";
  for (const w of words) { const t = ln ? ln + " " + w : w; if (x.measureText(t).width > CW - 12 && ln) { lines.push(ln); ln = w } else ln = t }
  lines.push(ln); lines.slice(-4).forEach((l, j, a) => x.fillText(l, cx + 6, cy + CH - 8 - (a.length - 1 - j) * (fs + 2)));
}
function drawCover(x, im, g, cx, cy, CW, CH, fs) {
  if (im) { const s = Math.max(CW / im.width, CH / im.height); x.drawImage(im, cx + (CW - im.width * s) / 2, cy + (CH - im.height * s) / 2, im.width * s, im.height * s) }
  else fallbackCover(x, g, cx, cy, CW, CH, fs);
}
async function tierCanvas() {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const W = 1200, PAD = 40, LAB = 96, CW = 84, CH = 126, GAP = 10, HEAD = 150, FOOT = 64;
  const perRow = Math.floor((W - PAD * 2 - LAB - GAP) / (CW + GAP));
  const rows = TIERS.map(([t, c]) => ({ t, c, list: games.filter(g => g.tier === t).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0)) }));
  const hs = rows.map(r => Math.max(1, Math.ceil(r.list.length / perRow)) * (CH + GAP) + GAP);
  const H = HEAD + hs.reduce((a, b) => a + b + 12, 0) + FOOT, S = 2;
  const cv = document.createElement("canvas"); cv.width = W * S; cv.height = H * S;
  const x = cv.getContext("2d"); x.scale(S, S);
  const bg = x.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#0B1129"); bg.addColorStop(1, "#172A66"); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const gl = x.createRadialGradient(W - 120, 40, 10, W - 120, 40, 420); gl.addColorStop(0, "rgba(168,139,250,.35)"); gl.addColorStop(1, "rgba(168,139,250,0)"); x.fillStyle = gl; x.fillRect(0, 0, W, H);
  const logo = await loadImg("logo.png");
  if (logo) x.drawImage(logo, PAD, 30, 297 * 90 / 388, 90);
  const tx = PAD + (logo ? 297 * 90 / 388 + 22 : 0);
  x.fillStyle = "#fff"; x.font = "700 40px 'Chakra Petch', system-ui, sans-serif"; x.textBaseline = "alphabetic";
  x.fillText(`Tier list de ${nick()}`, tx, 78);
  x.fillStyle = "#AEBBDD"; x.font = "500 20px Figtree, system-ui, sans-serif";
  x.fillText(`@${uname()}${myTag() ? " " + myTag() : ""} · ${games.filter(g => g.tier).length} jogos classificados`, tx, 110);
  const imgs = await Promise.all(rows.flatMap(r => r.list).map(g => loadImg(g.cover_url, true).then(im => [g.id, im])));
  const imap = Object.fromEntries(imgs);
  let y = HEAD;
  rows.forEach((r, i) => {
    const h = hs[i];
    x.fillStyle = "rgba(20,29,61,.92)"; rr(x, PAD, y, W - PAD * 2, h, 14); x.fill();
    x.save(); rr(x, PAD, y, W - PAD * 2, h, 14); x.clip(); x.fillStyle = r.c; x.fillRect(PAD, y, LAB, h); x.restore();
    x.fillStyle = "#121A33"; x.font = "700 42px 'Chakra Petch', system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(r.t, PAD + LAB / 2, y + h / 2); x.textAlign = "left"; x.textBaseline = "alphabetic";
    r.list.forEach((g, k) => {
      const cx = PAD + LAB + GAP + (k % perRow) * (CW + GAP), cy = y + GAP + Math.floor(k / perRow) * (CH + GAP);
      x.save(); rr(x, cx, cy, CW, CH, 8); x.clip(); drawCover(x, imap[g.id], g, cx, cy, CW, CH); x.restore();
    });
    y += h + 12;
  });
  x.fillStyle = "#7F8DB5"; x.font = "500 16px Figtree, system-ui, sans-serif"; x.fillText("Feito no Jogos Enzola · Movimento Enzola", PAD, H - 28);
  return cv;
}
async function shareOrDownload(blob, name, title) {
  const file = new File([blob], name, { type: blob.type });
  if (matchMedia("(pointer:coarse)").matches && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return true } catch (e) { if (e.name === "AbortError") return true }
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000); return false;
}
async function exportTier() {
  if (!games.some(g => g.tier)) { toast("Coloque pelo menos um jogo numa linha antes de salvar a imagem."); return }
  const b = $("#tier-img"); b.disabled = true; const old = b.innerHTML; b.innerHTML = `${ic("image")}Gerando…`;
  try {
    const cv = await tierCanvas();
    const blob = await new Promise(r => cv.toBlob(r, "image/png"));
    if (!(await shareOrDownload(blob, `tier-list-${uname() || "enzola"}.png`, "Minha tier list"))) toast("Imagem da tier list salva.");
  } catch (e) { toast("Não foi possível gerar a imagem.") }
  finally { b.disabled = false; b.innerHTML = old }
}

/* ---------- resumo ---------- */
function bars(rows, color) {
  const mx = Math.max(1, ...rows.map(r => r[1]));
  return `<div class="bars">${rows.map(([l, n, c]) => `<div class="br"><span>${esc(l)}</span><div class="tr"><div class="fl" style="width:${n / mx * 100}%;background:${c || color}"></div></div><b>${n}</b></div>`).join("")}</div>`;
}
function renderSummary() {
  const el = $("#resumo");
  if (!loaded) { el.innerHTML = hippoLoad("Calculando seus números…"); return }
  if (!games.length) { el.innerHTML = `<div class="panel empty"><b>Sem dados ainda</b>Adicione jogos para ver os gráficos.</div>`; return }
  const cnt = s => games.filter(g => g.status === s).length;
  const rated = games.filter(g => g.rating != null && g.rating !== "");
  const avg = rated.length ? rated.reduce((a, g) => a + Number(g.rating), 0) / rated.length : null;
  const hrs = games.reduce((a, g) => a + (+g.hours || 0), 0);
  const colors = { "Finalizado": "var(--fin)", "Jogando": "var(--play)", "Não iniciado": "var(--todo)", "Não comprado": "var(--nobuy)" };
  let acc = 0; const segs = STATUS.map(s => { const p = cnt(s) / games.length * 100; const r = `${colors[s]} ${acc}% ${acc + p}%`; acc += p; return r }).join(",");
  const ec = EXPS.map(e => [e, games.filter(g => g.exp === e).length, EXPCOL[e]]);
  const top = sorted(rated, "rating").slice(0, 6);
  const plats = [...new Set(games.map(g => g.platform).filter(Boolean))].map(p => [p, games.filter(g => g.platform === p).length, PLATCOL[p] || "var(--accent)"]).sort((a, b) => b[1] - a[1]);
  const years = {}; for (const g of games) if (g.status === "Finalizado" && g.finished_at) { const y = new Date(g.finished_at).getFullYear(); years[y] = (years[y] || 0) + 1 }
  const yrows = Object.entries(years).sort((a, b) => b[0] - a[0]).slice(0, 6);
  const topH = games.filter(g => +g.hours > 0).sort((a, b) => b.hours - a.hours).slice(0, 5);
  el.innerHTML = `<div class="sec-head"><div><h2 class="h">Resumo</h2><p class="muted">Seus números em um só lugar.</p></div></div>
  <div class="tiles">
    <div class="tilec"><div class="k">Jogos</div><div class="v">${games.length}</div></div>
    <div class="tilec"><div class="k">Finalizados</div><div class="v">${cnt("Finalizado")}</div></div>
    <div class="tilec"><div class="k">Concluído</div><div class="v">${Math.round(cnt("Finalizado") / games.length * 100)}%</div></div>
    <div class="tilec"><div class="k">Nota média</div><div class="v">${avg == null ? "—" : avg.toFixed(1)}</div></div>
    ${hrs ? `<div class="tilec"><div class="k">Horas jogadas</div><div class="v">${Math.round(hrs).toLocaleString("pt-BR")}</div></div>` : ""}
  </div>
  <div class="two">
    <div class="panel"><h3>Por status</h3><div class="donutw"><div class="donut" role="img" aria-label="Distribuição por status" style="background:conic-gradient(${segs})"></div>
      <div class="legend">${STATUS.map(s => `<div><i style="background:${colors[s]}"></i>${s} · <b>${cnt(s)}</b></div>`).join("")}</div></div></div>
    <div class="panel"><h3>Experiência</h3>${bars(ec)}</div>
    <div class="panel"><h3>Maiores notas</h3>${top.length ? top.map(g => `<div class="toprow"><span class="nm">${esc(g.name)}</span><span class="rate">${rateTxt(g)}</span></div>`).join("") : `<div class="muted">Dê notas aos jogos para ver o ranking.</div>`}</div>
    <div class="panel"><h3>Por plataforma</h3>${plats.length ? bars(plats) : `<div class="muted">Informe a plataforma dos jogos para ver este gráfico.</div>`}</div>
    <div class="panel"><h3>Zerados por ano</h3>${yrows.length ? bars(yrows, "var(--fin)") : `<div class="muted">Zere um jogo para começar a contagem.</div>`}</div>
    <div class="panel"><h3>Mais horas jogadas</h3>${topH.length ? topH.map(g => `<div class="toprow"><span class="nm">${esc(g.name)}</span><span class="rate">${hoursTxt(g.hours)}</span></div>`).join("") : `<div class="muted">Registre as horas no cadastro do jogo.</div>`}</div>
  </div>`;
}

/* ---------- modais ---------- */
function closeModal() { $("#modal").innerHTML = ""; pe = null; clearTimeout(searchTimer); document.body.classList.toggle("noscroll", !!$("#modal2").innerHTML) }
function modalShell(inner, wide) { $("#modal").innerHTML = `<div class="ovl" data-ovl><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true"><button class="iconbtn mclose" data-close aria-label="Fechar">${ic("x")}</button>${inner}</div></div>`; document.body.classList.add("noscroll") }
function closeModal2() { $("#modal2").innerHTML = ""; document.body.classList.toggle("noscroll", !!$("#modal").innerHTML) }
function modal2(inner, cls = "") { $("#modal2").innerHTML = `<div class="ovl top" data-ovl2><div class="modal ${cls}" role="dialog" aria-modal="true">${inner}</div></div>`; document.body.classList.add("noscroll") }

function openSearch(preset = {}) {
  if (!CFG.RAWG_KEY) return openForm(null, preset);
  modalShell(`<h2>${preset.wishlist ? "Adicionar à lista de desejos" : "Adicionar jogo"}</h2><p class="sub">Digite o nome. A capa e os dados vêm automaticamente.</p>
    <div class="bar" style="margin-bottom:0"><span class="inp grow">${ic("search")}<input type="search" id="s-q" placeholder="Nome do jogo" value="${esc(preset.name || "")}" autocomplete="off"></span><button class="btn" id="s-go">Buscar</button></div>
    <div class="sug" id="s-res"></div>
    <div class="acts"><button class="btn ghost left" data-act="manual">${ic("pencil")}Não achei, adicionar manualmente</button><button class="btn ghost" data-close>Cancelar</button></div>`);
  modalShell.preset = preset; $("#s-q").focus();
}
async function runSearch() {
  const inp = $("#s-q"); if (!inp) return;
  const q = inp.value.trim(); if (!q) { toast("Digite o nome do jogo."); return }
  const res = $("#s-res"); res.innerHTML = `<div class="it sk" style="height:66px"></div><div class="it sk" style="height:66px"></div>`;
  try {
    const j = await searchGames(q, 8);
    if (!$("#s-res") || $("#s-q").value.trim() !== q) return;
    found = j.map(rawgToDraft);
    const have = new Set(games.map(g => norm(g.name)));
    res.innerHTML = found.map((s, i) => `<div class="it"><div class="ib"><div class="mini">${s.cover_url ? `<img class="cv" alt="" referrerpolicy="no-referrer" src="${esc(s.cover_url)}">` : ""}</div><div style="min-width:0"><div class="nm">${esc(s.name)}${s.metacritic ? `<span class="mc sm" title="Metacritic">${s.metacritic}</span>` : ""}</div><div class="meta">${esc([s.year, s.genre, s._plats].filter(Boolean).join(" · "))}${have.has(norm(s.name)) ? ` · <b class="dup">já está na sua biblioteca</b>` : ""}</div></div></div><button class="btn ghost sm" data-pick="${i}">Usar</button></div>`).join("") || `<div class="muted">Nada encontrado. Use “Adicionar manualmente”.</div>`;
  } catch (e) { if ($("#s-res")) res.innerHTML = `<div class="muted">${esc(e.user ? e.message : "Não foi possível buscar agora.")} Você pode adicionar manualmente.</div>` }
}

function openForm(id, draft = {}) {
  const g = id ? gameById(id) : { name: "", status: "Não iniciado", exp: "", rating: "", platform: "", notes: "", genre: "", year: "", cover_url: "", review: "", wishlist: false, hours: "", finished_at: null, ...draft };
  if (!g) return;
  const favs = (profile && profile.favorites) || [];
  const b = bestOf(g);
  const info = [gameHref(g) ? `<a class="chipinfo link-like" href="#${gameHref(g)}" data-close>${ic("search")}Ficha completa do jogo</a>` : "", g.metacritic ? `<span class="chipinfo"><span class="mc sm">${g.metacritic}</span>Metacritic</span>` : "", g.playtime ? `<span class="chipinfo">${ic("clock")}Duração média ~${g.playtime} h</span>` : "", b ? `<button type="button" class="chipinfo link-like" data-prices="${g.id}">${ic("tag")}${money(brl(b), "BRL")} em ${esc(b.shop)}</button>` : ""].filter(Boolean).join("");
  modalShell(`<h2>${id ? "Editar jogo" : "Novo jogo"}</h2><p class="sub">${id ? esc(g.name) : "Preencha os dados do jogo."}</p>
  ${info ? `<div class="infos">${info}</div>` : ""}
  <div class="f" data-id="${id || ""}">
    <div class="coverrow"><div class="mini" id="m-prev">${cover(g)}</div>
      <div class="col"><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost sm" id="m-up">${ic("image")}Escolher da galeria</button><button type="button" class="btn ghost sm" id="m-rm">${ic("trash")}Remover</button></div>
        <input type="text" id="m-cover" value="${esc(g.cover_url)}" placeholder="ou cole o link de uma imagem" aria-label="Link da capa"><span class="hint" id="m-cmsg">A capa é recortada em formato pôster.</span></div></div>
    <label>Nome<input type="text" id="m-name" value="${esc(g.name)}"></label>
    <div class="f2"><label>Status<select id="m-status">${STATUS.map(s => `<option${s === g.status ? " selected" : ""}>${s}</option>`).join("")}</select></label>
      <label>Experiência<select id="m-exp"><option value="">—</option>${EXPS.map(s => `<option${s === g.exp ? " selected" : ""}>${s}</option>`).join("")}</select></label></div>
    <div class="f2"><label>Nota (0 a 10)<input type="number" id="m-rating" min="0" max="10" step="0.5" value="${g.rating ?? ""}" inputmode="decimal"></label>
      <label>Plataforma<select id="m-plat"><option value="">—</option>${PLATS.map(s => `<option${s === g.platform ? " selected" : ""}>${s}</option>`).join("")}</select></label></div>
    <div class="f2"><label>Gênero<input type="text" id="m-genre" value="${esc(g.genre)}"></label><label>Ano<input type="text" id="m-year" value="${esc(g.year)}" inputmode="numeric"></label></div>
    <div class="f2"><label>Horas jogadas<input type="number" id="m-hours" min="0" step="0.5" value="${g.hours ?? ""}" inputmode="decimal" placeholder="${g.playtime ? "média: " + g.playtime + " h" : "ex.: 42"}"></label>
      <label>Zerado em<input type="date" id="m-fin" value="${g.finished_at ? String(g.finished_at).slice(0, 10) : ""}"></label></div>
    <label>Sua avaliação<textarea id="m-review" rows="3" maxlength="500" placeholder="Escreva uma pequena análise sobre o jogo">${esc(g.review)}</textarea></label>
    <label>Observações<input type="text" id="m-notes" value="${esc(g.notes)}"></label>
    <div class="toggles">
      <label class="tg"><input type="checkbox" id="m-fav"${id && favs.includes(id) ? " checked" : ""}>${ic("heart")}Favorito</label>
      <label class="tg"><input type="checkbox" id="m-cur"${id && profile && profile.now_playing === id ? " checked" : ""}>${ic("play")}Jogo do momento</label>
      <label class="tg"><input type="checkbox" id="m-wish"${g.wishlist ? " checked" : ""}>${ic("bookmark")}Lista de desejos</label>
    </div></div>
  <div class="acts">${id ? `<button class="btn danger left" id="m-del">${ic("trash")}Remover jogo</button>` : ""}<button class="btn ghost" data-close>Cancelar</button><button class="btn" id="m-save">Salvar</button></div>`);
  modalShell.draft = id ? null : { rawg_id: draft.rawg_id ?? null, steam_id: draft.steam_id ?? null, metacritic: draft.metacritic ?? null, playtime: draft.playtime ?? null, price: draft.price ?? null };
  if (!matchMedia("(pointer:coarse)").matches) $("#m-name").focus();
}
function refreshPrev() { const g = { name: $("#m-name").value, cover_url: $("#m-cover").value.trim() }; $("#m-prev").innerHTML = cover(g) }
async function doSave() {
  if (busy) return;
  const box = $("#modal .f"), id = box.dataset.id, r = $("#m-rating").value, fin = $("#m-fin").value;
  const data = { name: $("#m-name").value.trim(), status: $("#m-status").value, exp: $("#m-exp").value, rating: r === "" ? null : Math.min(10, Math.max(0, Number(r))), platform: $("#m-plat").value, genre: $("#m-genre").value.trim(), year: $("#m-year").value.trim(), notes: $("#m-notes").value.trim(), review: $("#m-review").value.trim() || null, cover_url: $("#m-cover").value.trim() || null, wishlist: $("#m-wish").checked, hours: num($("#m-hours").value) };
  if (fin) data.finished_at = new Date(fin + "T12:00:00").toISOString(); else if (data.status !== "Finalizado") data.finished_at = null;
  if (!id && modalShell.draft) { for (const [k, v] of Object.entries(modalShell.draft)) if (v != null) data[k] = v }
  if (!data.name) { toast("Informe o nome do jogo."); $("#m-name").focus(); return }
  if (data.hours != null && data.hours < 0) { toast("As horas não podem ser negativas."); return }
  if (!id && games.some(x => norm(x.name) === norm(data.name) && (x.platform || "") === (data.platform || "")) && !doSave.dupOk) { doSave.dupOk = true; toast("Esse jogo já está na sua biblioteca nessa plataforma. Clique em Salvar de novo para adicionar mesmo assim."); return }
  doSave.dupOk = false;
  busy = true; const b = $("#m-save"); b.disabled = true; b.textContent = "Salvando…";
  try {
    let gid = id;
    if (id) await save(id, data); else { const ins = await create(data); if (!ins) return; gid = ins.id }
    const wantFav = $("#m-fav").checked, wantCur = $("#m-cur").checked;
    let favs = ((profile && profile.favorites) || []).filter(x => gameById(x)), patch = {};
    if (wantFav && !favs.includes(gid)) { if (favs.length >= 5) toast("Você já tem 5 favoritos. Remova um no perfil."); else { favs = [...favs, gid]; patch.favorites = favs } }
    if (!wantFav && favs.includes(gid)) { patch.favorites = favs.filter(x => x !== gid) }
    if (wantCur) patch.now_playing = gid; else if (profile && profile.now_playing === gid) patch.now_playing = null;
    if (Object.keys(patch).length) await saveProfile(patch);
    closeModal();
    const ng = gameById(gid); if (!id && ng && (ng.wishlist || ng.status === "Não comprado") && !isConsole(ng.platform)) refreshPrices(false, gid);
  } finally { busy = false; const b2 = $("#m-save"); if (b2) { b2.disabled = false; b2.textContent = "Salvar" } }
}

function openProfileEditor() {
  const p = profile || {};
  pe = { avatar: p.avatar || "preset:p1", banner: p.banner || "", favorites: ((p.favorites) || []).filter(x => gameById(x)).slice(0, 5) };
  modalShell(`<h2>Editar perfil</h2><p class="sub">@${esc(uname())}${p.tag ? " #" + esc(p.tag) : ""}</p>
  <div class="f">
    <div class="pe-av"><button type="button" class="av md av-edit" id="pe-av" aria-label="Escolher foto">${avatar(pe.avatar)}<span class="av-cam">${ic("camera")}</span></button>
      <div style="display:grid;gap:8px"><button class="btn ghost sm" id="pe-up">${ic("image")}Escolher foto da galeria</button><span class="hint">Você pode recortar e ajustar antes de salvar. Ou escolha um avatar:</span></div></div>
    <div class="presets" id="pe-presets">${PRESETS.map(x => `<button type="button" data-preset="${x.k}" aria-label="Avatar ${x.k}" aria-pressed="${pe.avatar === "preset:" + x.k}"><div class="av-preset" style="background:${x.bg}">${ic(x.icon)}</div></button>`).join("")}</div>
    ${typeof rewardsHTML === "function" ? rewardsHTML() : ""}
    <div><div class="fld" style="margin-bottom:6px">Banner <span class="hint">· sem banner, usamos a capa do jogo do momento</span></div><div class="pe-ban" id="pe-ban" style="${pe.banner ? `background-image:url('${cssUrl(pe.banner)}')` : ""}"></div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn ghost sm" id="pe-bup">${ic("image")}Escolher banner da galeria</button><button class="btn ghost sm" id="pe-brm">${ic("trash")}Remover</button></div></div>
    <div class="f2"><label>Nickname<input type="text" id="pe-nick" maxlength="30" value="${esc(p.nickname || "")}" placeholder="${esc(uname())}"></label>
      <label>Jogo do momento<select id="pe-cur"><option value="">Automático (jogando agora)</option>${sorted(games, "name").map(g => `<option value="${g.id}"${p.now_playing === g.id ? " selected" : ""}>${esc(g.name)}</option>`).join("")}</select></label></div>
    <label>Biografia<textarea id="pe-bio" rows="3" maxlength="200" placeholder="Conte um pouco sobre você como gamer">${esc(p.bio || "")}</textarea></label>
    ${caps.pub ? `<div class="pubbox"><label class="tg"><input type="checkbox" id="pe-pub"${p.is_public ? " checked" : ""}>${ic("globe")}Perfil público</label>
      <span class="hint">Qualquer pessoa com o link vê seu perfil, favoritos, tier list e jogos zerados. A lista de desejos e as observações não aparecem.</span>
      <span class="bar" style="margin:0"><input type="text" readonly value="${esc(shareUrl(uname()))}" class="grow" id="pe-link" aria-label="Link do perfil"><button class="btn ghost sm" data-act="copy-link">Copiar link</button></span></div>` : ""}
    <div><div class="fld" style="margin-bottom:6px">Jogos favoritos <span class="hint" id="pe-count"></span></div>
      <span class="inp" style="margin-bottom:8px">${ic("search")}<input type="search" id="pe-q" placeholder="Filtrar jogos"></span><div class="picker" id="pe-list"></div></div>
  </div>
  <div class="acts"><button class="btn ghost" data-close>Cancelar</button><button class="btn" id="pe-save">Salvar perfil</button></div>`, true);
  renderPicker();
}
function renderPicker() {
  const q = norm($("#pe-q").value);
  $("#pe-count").textContent = `${pe.favorites.length}/5 selecionados`;
  const list = sorted(games, "name").filter(g => !q || norm(g.name).includes(q));
  $("#pe-list").innerHTML = list.map(g => `<label class="pk"><input type="checkbox" data-pk="${g.id}"${pe.favorites.includes(g.id) ? " checked" : ""}><span class="mini">${cover(g)}</span><span>${esc(g.name)}</span></label>`).join("") || `<div class="empty" style="padding:16px">Nenhum jogo encontrado.</div>`;
}
async function peImage(kind) {
  const url = await pickAndUpload(kind); if (!url || !pe) return;
  if (kind === "avatar") { pe.avatar = url; $("#pe-av").innerHTML = avatar(url) + `<span class="av-cam">${ic("camera")}</span>`; for (const b of $$("#pe-presets button")) b.setAttribute("aria-pressed", "false") }
  else { pe.banner = url; $("#pe-ban").style.backgroundImage = `url('${cssUrl(url)}')` }
  toast("Imagem pronta. Clique em Salvar perfil.");
}
async function copyText(t, msg = "Link copiado.") {
  try { await navigator.clipboard.writeText(t); toast(msg) }
  catch (e) { const i = document.createElement("textarea"); i.value = t; document.body.append(i); i.select(); try { document.execCommand("copy") } catch (e2) { } i.remove(); toast(msg) }
}
async function shareProfile() {
  const url = shareUrl(uname());
  if (navigator.share && matchMedia("(pointer:coarse)").matches) { try { await navigator.share({ title: `Perfil de ${nick()} no Jogos Enzola`, url }); return } catch (e) { if (e.name === "AbortError") return } }
  copyText(url);
}

/* ---------- CSV ---------- */
const CSV_COLS = ["n", "name", "status", "exp", "rating", "platform", "genre", "year", "hours", "finished_at", "review", "notes", "wishlist", "tier", "cover_url"];
const CSV_ALIAS = { "n": "n", "no": "n", "numero": "n", "name": "name", "nome": "name", "jogo": "name", "titulo": "name", "status": "status", "situacao": "status", "exp": "exp", "experiencia": "exp", "rating": "rating", "nota": "rating", "platform": "platform", "plataforma": "platform", "genre": "genre", "genero": "genre", "year": "year", "ano": "year", "hours": "hours", "horas": "hours", "finished at": "finished_at", "finished_at": "finished_at", "zerado em": "finished_at", "review": "review", "avaliacao": "review", "analise": "review", "notes": "notes", "observacoes": "notes", "obs": "notes", "wishlist": "wishlist", "lista de desejos": "wishlist", "desejo": "wishlist", "tier": "tier", "cover url": "cover_url", "cover_url": "cover_url", "capa": "cover_url" };
function toCSV() {
  const q = v => { v = v == null ? "" : String(v); return /[",;\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v };
  return "﻿" + [CSV_COLS.join(","), ...sorted(games, "n").map(g => CSV_COLS.map(c => q(c === "finished_at" && g[c] ? String(g[c]).slice(0, 10) : g[c])).join(","))].join("\r\n");
}
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const first = text.split(/\r?\n/)[0] || "", d = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : ",";
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++ } else q = false } else f += c }
    else if (c === '"') q = true;
    else if (c === d) { row.push(f); f = "" }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = "" }
    else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row) }
  return rows.filter(r => r.some(x => x.trim() !== ""));
}
function exportCSV() {
  if (!games.length) { toast("Sua biblioteca está vazia."); return }
  const blob = new Blob([toCSV()], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `jogos-enzola-${uname()}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(`${games.length} jogos exportados.`);
}
async function importCSV(file) {
  let rows;
  try { rows = parseCSV(await file.text()) } catch (e) { toast("Não consegui ler esse arquivo."); return }
  if (rows.length < 2) { toast("A planilha precisa de um cabeçalho e pelo menos uma linha."); return }
  const head = rows[0].map(h => CSV_ALIAS[norm(h)] || null);
  if (!head.includes("name")) { toast("Não achei a coluna “nome” (ou “name”) na planilha."); return }
  const have = new Set(games.map(g => norm(g.name)));
  let n = games.reduce((m, g) => Math.max(m, g.n || 0), 0), skipped = 0;
  const out = [];
  for (const r of rows.slice(1)) {
    const o = {}; head.forEach((k, i) => { if (k) o[k] = (r[i] ?? "").trim() });
    if (!o.name) continue;
    if (have.has(norm(o.name))) { skipped++; continue }
    have.add(norm(o.name));
    const st = STATUS.find(s => norm(s) === norm(o.status)) || "Não iniciado";
    const ex = EXPS.find(s => norm(s) === norm(o.exp)) || "";
    const rating = num(String(o.rating || "").replace(",", "."));
    const fin = o.finished_at && !isNaN(new Date(o.finished_at)) ? new Date(o.finished_at.length === 10 ? o.finished_at + "T12:00:00" : o.finished_at).toISOString() : (st === "Finalizado" ? new Date().toISOString() : null);
    const row = { n: ++n, name: o.name.slice(0, 200), status: st, exp: ex, rating: rating == null ? null : Math.min(10, Math.max(0, rating)), platform: o.platform || "", genre: o.genre || "", year: o.year || "", notes: o.notes || "", review: o.review || null, cover_url: /^https?:/.test(o.cover_url || "") ? o.cover_url : null, wishlist: /^(1|true|sim|s|x|yes)$/i.test(o.wishlist || ""), tier: TIERS.some(t => t[0] === (o.tier || "").toUpperCase()) ? o.tier.toUpperCase() : null, finished_at: fin, hours: num(String(o.hours || "").replace(",", ".")) };
    if (row.tier) row.tier_order = n;
    if (row.rating != null || row.review) row.rated_at = new Date().toISOString();
    out.push(clean(row));
  }
  if (!out.length) { toast(skipped ? `Nada novo: os ${skipped} jogos já estavam na biblioteca.` : "Nenhuma linha válida encontrada."); return }
  const { data, error } = await sb.from("games").insert(out).select();
  if (error) { toast("Erro ao importar. Confira o arquivo e tente de novo."); return }
  games.push(...data); render();
  toast(`${data.length} ${data.length === 1 ? "jogo importado" : "jogos importados"}${skipped ? `, ${skipped} já estavam na biblioteca` : ""}.`);
}

/* ---------- perfil público ---------- */
async function showPublic(u) {
  $("#auth").hidden = true; $("#app").hidden = true; $("#pub").hidden = false; hideSplash();
  const cta = $("#pub-cta"); cta.textContent = user ? "Voltar ao meu perfil" : "Criar meu perfil"; cta.setAttribute("href", user ? "#perfil" : "#entrar");
  const el = $("#pub-body");
  el.innerHTML = hippoLoad("Carregando o perfil…", "big");
  if (!sb) { el.innerHTML = `<div class="panel empty"><b>Site sem configuração</b>Configure o Supabase no config.js.</div>`; return }
  const { data, error } = await sb.rpc("public_profile", { uname: u.toLowerCase() });
  const p = data && data.profile;
  if (error || !p) { el.innerHTML = `<div class="panel empty" style="margin-top:40px"><b>Perfil não encontrado</b>O usuário @${esc(u)} não existe ou deixou o perfil privado.</div>`; return }
  const gs = data.games || [], by = id => gs.find(g => g.id === id);
  const cur = by(p.now_playing) || gs.find(g => g.status === "Jogando");
  const favs = (p.favorites || []).map(by).filter(Boolean).slice(0, 5);
  const fin = gs.filter(g => g.status === "Finalizado");
  const { avg } = statsOf(gs);
  const tiers = TIERS.map(([t, c]) => [t, c, gs.filter(g => g.tier === t).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0))]).filter(x => x[2].length);
  document.title = `${p.nickname || p.username} · Jogos Enzola`;
  el.innerHTML = `${bannerHTML(p, cur)}</div>
  <div class="phead"><div class="av lg">${avatar(p.avatar)}</div><div class="pid"><h1>${esc(p.nickname || p.username)}</h1><div class="un">@${esc(p.username)}${p.tag ? ` <span class="idtag">#${esc(p.tag)}</span>` : ""}</div></div>
    <div class="pstats"><div class="pstat"><b>${gs.length}</b><span>Jogos</span></div><div class="pstat"><b>${fin.length}</b><span>Zerados</span></div><div class="pstat"><b>${avg}</b><span>Nota média</span></div></div></div>
  ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ""}
  <div class="pub-grid">
    ${cur ? `<div class="blk"><div class="blk-h"><h3>${ic("play")}Jogando agora</h3></div><div class="now nohover"><div class="poster">${cover(cur)}</div><div class="now-b"><span class="k">Jogando agora</span><span class="t">${esc(cur.name)}</span><span class="m">${[cur.platform, cur.genre, cur.year].filter(Boolean).map(esc).join(" · ")}</span>${cur.review ? `<span class="q">“${esc(cur.review)}”</span>` : ""}</div></div></div>` : ""}
    ${favs.length ? `<div class="blk"><div class="blk-h"><h3>${ic("heart")}Favoritos</h3></div><div class="favgrid">${favs.map((g, i) => `<div class="fav"><div class="poster"><span class="rank">${i + 1}</span>${cover(g)}</div><div class="n">${esc(g.name)}</div><div class="r">${g.exp ? esc(g.exp) : ""}${g.rating != null ? " · " + rateTxt(g) : ""}</div></div>`).join("")}</div></div>` : ""}
    ${tiers.length ? `<div class="blk"><div class="blk-h"><h3>${ic("layers")}Tier list</h3></div>${tiers.map(([t, c, l]) => `<div class="tier"><div class="lab" style="background:${c}">${t}</div><div class="zone">${l.map(g => `<div class="tc" title="${esc(g.name)}">${cover(g)}</div>`).join("")}</div></div>`).join("")}</div>` : ""}
    ${fin.length ? `<div class="blk"><div class="blk-h"><h3>${ic("trophy")}Zerados · ${fin.length}</h3></div><div class="grid">${fin.map(g => `<div class="card"><div class="poster">${cover(g)}</div><div class="t">${esc(g.name)}</div><div class="meta">${g.rating != null ? "Nota " + rateTxt(g) : ""}</div></div>`).join("")}</div></div>` : ""}
  </div>`;
}

/* ---------- login ---------- */
function hideSplash() { const s = $("#splash"); if (s && !s.hidden) { s.classList.add("out"); setTimeout(() => s.hidden = true, 350) } }
function showAuth(show, msg) {
  $("#pub").hidden = true; $("#auth").hidden = !show; $("#app").hidden = show; hideSplash();
  if (msg !== undefined) { const m = $("#auth-msg"); m.textContent = msg; m.className = "auth-msg" }
  updateInstallUI();
}
function emailFor(u) {
  const b = String(CFG.EMAIL_BASE || "").trim();
  if (/^[^@\s+]+@[^@\s]+\.[^@\s]+$/.test(b)) { const [l, d] = b.split("@"); return `${l}+${u}@${d}` }
  return u + "@gmail.com";
}
async function signInUser(u, pass) {
  let r = await sb.auth.signInWithPassword({ email: emailFor(u), password: pass });
  const legacy = u + "@gmail.com";
  if (r.error && emailFor(u) !== legacy) r = await sb.auth.signInWithPassword({ email: legacy, password: pass });
  return r;
}
let authMode = "login", authBusy = false, availT = 0;
function setAuthMode(mode) {
  authMode = mode === "signup" ? "signup" : "login";
  const s = authMode === "signup";
  $("#auth-title").textContent = s ? "Criar sua conta" : "Bem-vindo de volta";
  $("#auth-sub").textContent = s ? "Escolha um usuário e uma senha. Leva menos de um minuto." : "Entre com seu usuário e senha.";
  $("#a-login").textContent = s ? "Criar conta" : "Entrar";
  $("#a-signup").textContent = s ? "Já tenho conta" : "Criar conta";
  $("#f-pass2").hidden = !s; $("#a-forgot").hidden = s;
  $("#a-pass").autocomplete = s ? "new-password" : "current-password";
  $("#a-pass2").value = ""; $("#auth-msg").textContent = ""; $("#auth-msg").className = "auth-msg";
  const av = $("#a-avail"); av.hidden = true; av.textContent = "";
  $("#auth-form").dataset.mode = authMode;
  if (s) checkAvail(); $("#a-email").focus({ preventScroll: true });
}
function checkAvail() {
  clearTimeout(availT); const av = $("#a-avail"); if (authMode !== "signup" || !sb) return;
  const u = $("#a-email").value.trim().toLowerCase().replace(/^@/, "");
  if (!u) { av.hidden = true; return }
  av.hidden = false;
  if (!/^[a-z0-9._-]{3,30}$/.test(u)) { av.className = "avail bad"; av.textContent = "Use 3 a 30 letras minúsculas, números, ponto, hífen ou sublinhado."; return }
  av.className = "avail"; av.textContent = "Verificando…";
  availT = setTimeout(async () => {
    const t = await sb.rpc("username_taken", { uname: u });
    if ($("#a-email").value.trim().toLowerCase().replace(/^@/, "") !== u || authMode !== "signup") return;
    if (t.error) { av.hidden = true; return }
    av.className = "avail " + (t.data ? "bad" : "ok"); av.textContent = t.data ? `@${u} já existe. Escolha outro.` : `@${u} está disponível.`;
  }, 400);
}
async function doAuth(signup) {
  if (!sb || authBusy) return;
  const u = $("#a-email").value.trim().toLowerCase().replace(/^@/, ""), pass = $("#a-pass").value, m = $("#auth-msg");
  m.className = "auth-msg";
  if (!/^[a-z0-9._-]{3,30}$/.test(u)) { m.textContent = "Usuário com 3 a 30 letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços ou acentos."; return }
  if (pass.length < 6) { m.textContent = "A senha precisa ter pelo menos 6 caracteres."; return }
  if (signup && pass !== $("#a-pass2").value) { m.textContent = "As duas senhas não são iguais."; return }
  authBusy = true; m.textContent = signup ? "Criando sua conta…" : "Entrando…"; for (const b of $$(".auth-acts .btn")) b.disabled = true;
  try {
    let r;
    if (signup) {
      const t = await sb.rpc("username_taken", { uname: u });
      if (!t.error && t.data === true) { m.textContent = "Esse usuário já existe. Escolha outro."; return }
      newSignup = true;
      r = await sb.auth.signUp({ email: emailFor(u), password: pass });
    } else r = await signInUser(u, pass);
    if (r.error) {
      newSignup = false;
      if (signup) m.textContent = /registered|exists/i.test(r.error.message) ? "Esse usuário já existe. Escolha outro." : "Não foi possível criar a conta: " + r.error.message;
      else {
        const t = await sb.rpc("username_taken", { uname: u });
        m.textContent = !t.error && t.data === false ? "Não encontramos esse usuário. Toque em “Criar conta” para cadastrar." : "Usuário ou senha incorretos.";
      }
      return;
    }
    if (signup && !r.data.session) m.textContent = "Conta criada, mas o Supabase ainda exige confirmação por e-mail. Desligue “Confirm email” em Authentication > Providers > Email e tente de novo.";
    else m.textContent = "";
  } finally { authBusy = false; for (const b of $$(".auth-acts .btn")) b.disabled = false }
}
let newSignup = false;
async function onSession(session, ev) {
  const was = user && user.id;
  user = session ? session.user : null; sessionKnown = true;
  if (!user) { games = []; profile = null; loaded = false; socialReset(); route(); return }
  if (was === user.id) return;
  loaded = false; route(); await loadAll(); socialStart();
  if (newSignup) { newSignup = false; setTimeout(() => offerRecoveryCode(true), 600) }
  maybeShowInstallBar();
}

/* ---------- navegação ---------- */
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("u/") && h.length > 2) { showPublic(h.slice(2)); return }
  document.title = "Jogos Enzola";
  if (!sessionKnown) return;
  if (!user) { showAuth(true); return }
  showAuth(false); show(h);
}
function show(h) {
  const [t, ...rest] = h.split("/"); routeArg = rest.join("/");
  const prev = tab;
  tab = (t === "jogo" && routeArg) || (t === "amigo" && routeArg) ? t : TABS.includes(t) ? t : "inicio";
  const hl = tab === "movimento" ? "inicio" : tab === "amigo" ? "amigos" : CAT_SUBS.includes(tab) ? "catalogo" : tab;
  const cn = $("#cat-nav"); cn.hidden = !CAT_SUBS.includes(tab);
  for (const b of cn.querySelectorAll("[data-sub]")) { const on = b.dataset.sub === tab; b.classList.toggle("on", on); on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current") }
  for (const b of $$("nav.tabs button")) b.setAttribute("aria-selected", b.dataset.tab === hl);
  $("#who-btn").classList.toggle("on", tab === "perfil" || tab === "config");
  for (const s of $$("main.wrap > section")) s.hidden = s.id !== tab;
  if (tab === "idiomas") { renderLingo(); window.scrollTo({ top: 0 }); return }
  closeMenus();
  if (tab === "amigos" && user) loadFriends();
  if (tab === "desejos" && loaded) refreshPrices(false);
  if (tab === "jogo") { openGame(routeArg); window.scrollTo({ top: 0 }); return }
  if (tab === "amigo") { openFriendPage(routeArg); window.scrollTo({ top: 0 }); return }
  if (tab === "inicio" && prev !== "inicio" && typeof hm !== "undefined" && hm.loaded) hmLoad(true);
  render(); if (prev !== tab || tab !== "perfil") window.scrollTo({ top: 0 });
}
function render() {
  if ($("#app").hidden) return;
  $("#who-av").innerHTML = avatar(profile && profile.avatar); $("#who-name").textContent = nick();
  const w = $("#sn-wish"); if (w) { const n = loaded ? wishlist().length : 0; w.textContent = n || ""; w.hidden = !n }
  if (tab === "idiomas") return;
  if (tab === "inicio") renderHome(); else if (tab === "movimento") renderMovimento(); else if (tab === "perfil") renderProfile(); else if (tab === "catalogo") renderCatalog(); else if (tab === "galeria") renderGallery();
  else if (tab === "amigos") renderFriends(); else if (tab === "tier") renderTier(); else if (tab === "desejos") renderWishlist();
  else if (tab === "config") renderConfig(); else if (tab === "jogo") renderGameIfLibraryChanged(); else if (tab === "amigo") renderFriendPage(); else renderSummary();
}
function closeMenus() {
  $("#menu").hidden = true; $("#who-btn").setAttribute("aria-expanded", "false");
  $("#npanel").hidden = true; $("#bell").setAttribute("aria-expanded", "false");
}

/* ---------- eventos ---------- */
document.addEventListener("click", async e => {
  const t = e.target, c = s => t.closest(s); let b;
  if (!c("#menu") && !c("#who-btn") && !$("#menu").hidden) { $("#menu").hidden = true; $("#who-btn").setAttribute("aria-expanded", "false") }
  if (!c("#npanel") && !c("#bell") && !$("#npanel").hidden) { $("#npanel").hidden = true; $("#bell").setAttribute("aria-expanded", "false") }
  if (b = c("nav.tabs button")) { location.hash = b.dataset.tab; return }
  if (c("#who-btn")) { const m = $("#menu"); m.hidden = !m.hidden; $("#who-btn").setAttribute("aria-expanded", String(!m.hidden)); return }
  if (c("#theme-btn")) { closeMenus(); setTheme(curTheme() === "light" ? "dark" : "light"); return }
  if (c("#logout")) { closeMenus(); await pushLogout(); await sb.auth.signOut(); location.hash = ""; return }
  if (b = c("[data-go]")) { closeMenus(); const h = b.dataset.go; if (location.hash.slice(1) === h) route(); else location.hash = h; return }
  if (b = c("[data-prices]")) { openPrices(b.dataset.prices); return }
  if (b = c("[data-refresh-price]")) { const id = b.dataset.refreshPrice, inModal = !!c(".modal"); await refreshPrices(true, id); if (inModal && $("#modal .modal")) openPrices(id); return }
  if (b = c("[data-target-save]")) { const v = num($("#tp").value); await save(b.dataset.targetSave, { target_price: v }); toast(v == null ? "Preço-alvo removido." : `Preço-alvo salvo: ${money(v, "BRL")}.`); closeModal(); return }
  if (b = c("[data-open]")) { openForm(b.dataset.open); return }
  if (b = c("[data-act]")) {
    const a = b.dataset.act;
    if (a === "edit-profile") openProfileEditor(); else if (a === "add") openSearch();
    else if (a === "manual") { const q = $("#s-q"); openForm(null, { ...(modalShell.preset || {}), name: q ? q.value.trim() : "" }) }
    else if (a === "copy-link") copyText($("#pe-link").value);
    else if (a === "copy-id") copyText(`${uname()}#${profile.tag}`, "ID copiado. Seus amigos podem buscar por ele.");
    else if (a === "share-profile") shareProfile();
    else if (a === "quick-avatar") quickImage("avatar");
    else if (a === "quick-banner") quickImage("banner");
    else if (a === "clear-cat") { fStatus = ""; $("#q").value = ""; $("#plat").value = ""; render() }
    else if (a === "install") { closeMenus(); installApp() }
    return;
  }
  if (c("#add")) { openSearch(); return }
  if (c("#add-wish") || c("#add-wish2")) { openSearch({ wishlist: true, status: "Não comprado" }); return }
  if (c("#wl-refresh")) { refreshPrices(true); return }
  if (c("#wl-pdf")) { exportWishlistPDF(); return }
  if (c("#tier-img")) { exportTier(); return }
  if (c("#csv-out")) { exportCSV(); return }
  if (c("#csv-in")) { $("#csv-file").click(); return }
  if (b = c("[data-bought]")) { save(b.dataset.bought, { wishlist: false, status: "Não iniciado" }); toast("Movido para o catálogo como “Não iniciado”."); return }
  if (b = c("#fchips .chip")) { fStatus = b.dataset.f; render(); return }
  if (b = c("#gchips .chip")) { gStatus = b.dataset.g; render(); return }
  if (b = c("#tchips .chip")) { if (b.dataset.t === "__clear") { if (selected) setTier(selected, null); selected = null } else tStatus = b.dataset.t; render(); return }
  if (b = c("#tier [data-tc]")) { selected = selected === b.dataset.tc ? null : b.dataset.tc; renderTier(); return }
  if (b = c("#tier .zone")) { if (selected) { setTier(selected, b.dataset.tier || null); selected = null } return }
  /* modal */
  if ((t.hasAttribute && t.hasAttribute("data-ovl2"))) { closeModal2(); return }
  if (t.hasAttribute && t.hasAttribute("data-ovl") || c("[data-close]")) { if (c("#modal2")) closeModal2(); else closeModal(); return }
  if (c("#s-go")) { runSearch(); return }
  if (b = c("[data-pick]")) { const s = found[+b.dataset.pick]; openForm(null, { ...(modalShell.preset || {}), ...s }); return }
  if (c("#m-save")) { doSave(); return }
  if (c("#m-up")) { const url = await pickAndUpload("cover"); if (url && $("#m-cover")) { $("#m-cover").value = url; refreshPrev(); $("#m-cmsg").textContent = "Capa enviada." } return }
  if (c("#m-rm")) { $("#m-cover").value = ""; refreshPrev(); return }
  if (c("#m-del")) { const d = c("#m-del"); if (!d.dataset.sure) { d.dataset.sure = 1; d.textContent = "Confirmar remoção"; return } await removeGame($("#modal .f").dataset.id); closeModal(); return }
  if (b = c("[data-preset]")) { pe.avatar = "preset:" + b.dataset.preset; $("#pe-av").innerHTML = avatar(pe.avatar) + `<span class="av-cam">${ic("camera")}</span>`; for (const x of $$("#pe-presets button")) x.setAttribute("aria-pressed", x === b); return }
  if (b = c("[data-equip-skin]")) { const id = b.dataset.equipSkin; if (!pe || typeof skinHas !== "function" || !skinHas(id)) return;
    pe.avatar = "skin:" + id; $("#pe-av").innerHTML = avatar(pe.avatar) + `<span class="av-cam">${ic("camera")}</span>`; for (const x of $$("#pe-presets button")) x.setAttribute("aria-pressed", "false")
    toast("Equipado. Clique em Salvar perfil."); return }
  if (b = c("[data-equip]")) { const [kind, k] = b.dataset.equip.split(":"); if (!pe || !rewardsHas(k)) return;
    if (kind === "avatar") { pe.avatar = "reward:" + k; $("#pe-av").innerHTML = avatar(pe.avatar) + `<span class="av-cam">${ic("camera")}</span>`; for (const x of $$("#pe-presets button")) x.setAttribute("aria-pressed", "false") }
    else { pe.banner = "reward:" + k; $("#pe-ban").style.backgroundImage = `url('${cssUrl(pe.banner)}')` }
    toast("Equipado. Clique em Salvar perfil."); return }
  if (c("#pe-up") || c("#pe-av")) { peImage("avatar"); return }
  if (c("#pe-bup") || c("#pe-ban")) { peImage("banner"); return }
  if (c("#pe-brm")) { pe.banner = ""; $("#pe-ban").style.backgroundImage = ""; return }
  if (c("#pe-save")) {
    if (busy) return; busy = true;
    const patch = { nickname: $("#pe-nick").value.trim() || null, bio: $("#pe-bio").value.trim() || null, avatar: pe.avatar, banner: pe.banner || null, favorites: pe.favorites, now_playing: $("#pe-cur").value || null };
    if ($("#pe-pub")) patch.is_public = $("#pe-pub").checked;
    const ok = await saveProfile(patch);
    busy = false; if (ok) { closeModal(); toast(patch.is_public && !(profile && profile.is_public === false) ? "Perfil salvo." : "Perfil salvo.") } return;
  }
});
document.addEventListener("change", e => {
  const s = e.target;
  if (s.matches(".row select[data-f]")) save(s.closest(".row").dataset.id, { [s.dataset.f]: s.value });
  else if (s.id === "sort" || s.id === "plat") render();
  else if (s.id === "wl-sort") { wlSort = s.value; render() }
  else if (s.id === "csv-file" && s.files[0]) { importCSV(s.files[0]); s.value = "" }
  else if (s.id === "m-status" && s.value === "Finalizado" && !$("#m-fin").value) $("#m-fin").value = new Date().toISOString().slice(0, 10);
  else if (s.matches("[data-pk]")) {
    const id = s.dataset.pk;
    if (s.checked) { if (pe.favorites.length >= 5) { s.checked = false; toast("Você pode escolher até 5 favoritos."); return } pe.favorites.push(id) }
    else pe.favorites = pe.favorites.filter(x => x !== id);
    $("#pe-count").textContent = `${pe.favorites.length}/5 selecionados`;
  }
});
document.addEventListener("input", e => {
  const id = e.target.id;
  if (id === "q") renderCatalog();
  else if (id === "gq") renderGallery();
  else if (id === "wq") renderWishlist();
  else if (id === "pe-q") renderPicker();
  else if (id === "m-cover" || id === "m-name") refreshPrev();
  else if (id === "s-q") { clearTimeout(searchTimer); if (e.target.value.trim().length >= 3) searchTimer = setTimeout(runSearch, 450) }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if ($("#modal2").innerHTML) { closeModal2(); return }
    if (!$("#gsearch").hidden) { closeGlobalSearch(); return }
    if ($("#modal").innerHTML) { closeModal(); return }
    closeMenus();
  }
  if (e.key === "Enter" && e.target.id === "s-q") { e.preventDefault(); clearTimeout(searchTimer); runSearch() }
});
$("#auth-form").addEventListener("submit", e => { e.preventDefault(); doAuth(authMode === "signup") });
$("#a-signup").addEventListener("click", () => setAuthMode(authMode === "signup" ? "login" : "signup"));
$("#a-email").addEventListener("input", checkAvail);

/* arrastar e soltar (tier list) */
let dragId = null;
document.addEventListener("dragstart", e => { const b = e.target.closest && e.target.closest("#tier [data-tc]"); if (b) { dragId = b.dataset.tc; e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move" } });
document.addEventListener("dragover", e => { const z = e.target.closest && e.target.closest("#tier .zone"); if (z && dragId) { e.preventDefault(); for (const o of $$(".zone.over")) if (o !== z) o.classList.remove("over"); z.classList.add("over") } });
document.addEventListener("dragleave", e => { const z = e.target.closest && e.target.closest(".zone"); if (z && !z.contains(e.relatedTarget)) z.classList.remove("over") });
document.addEventListener("drop", e => { const z = e.target.closest && e.target.closest("#tier .zone"); if (!z || !dragId) return; e.preventDefault(); z.classList.remove("over"); const bf = e.target.closest("[data-tc]"); setTier(dragId, z.dataset.tier || null, bf && bf.dataset.tc !== dragId ? bf.dataset.tc : null); dragId = null; selected = null });
document.addEventListener("dragend", () => { dragId = null; for (const o of $$(".zone.over")) o.classList.remove("over") });
window.addEventListener("hashchange", route);

/* ---------- início (depois que todos os arquivos carregaram) ---------- */
function boot() {
  applyLocalPrefs();
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(r => {
    // procura versão nova do site ao abrir e ao voltar para o app (ícones, notificações e correções chegam mais rápido)
    r.update().catch(() => { });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) r.update().catch(() => { }) });
  }).catch(() => { });
  if (!window.supabase || !CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes("COLE_AQUI")) {
    sessionKnown = true; showAuth(true, "Configure o endereço e a chave do Supabase no arquivo config.js."); return;
  }
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  sb.auth.onAuthStateChange((ev, session) => { setTimeout(() => { if (ev === "PASSWORD_RECOVERY") toast("Defina sua nova senha em Configurações."); onSession(session, ev) }, 0) });
  sb.auth.getSession().then(({ data }) => { if (!data.session && !sessionKnown) onSession(null) });
  route();
}
window.addEventListener("DOMContentLoaded", boot);
