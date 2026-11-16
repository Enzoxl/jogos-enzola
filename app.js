/* Jogos Enzola — app (Supabase + RAWG + preços CheapShark/IsThereAnyDeal) */
const CFG = window.APP_CONFIG || {};
const STATUS = ["Finalizado", "Jogando", "Não iniciado", "Não comprado"];
const EXPS = ["Perfeito", "Ótimo", "Muito bom", "Bom", "Ok", "Meh", "Chumbos"];
const EXPCOL = { "Perfeito": "#2E8B6A", "Ótimo": "#4C9F7A", "Muito bom": "#6FA8DC", "Bom": "#4B6B9E", "Ok": "#C9A227", "Meh": "#D98A3D", "Chumbos": "#B14A47" };
const TIERS = [["S", "#F28B82"], ["A", "#F6B26B"], ["B", "#F5DC78"], ["C", "#A8D5A2"], ["D", "#9CC0F5"]];
const PLATS = ["PC", "PlayStation", "Xbox", "Switch", "Outro"];
const PLATCOL = { "PC": "#6C93FF", "PlayStation": "#4F8BE8", "Xbox": "#4ADE9B", "Switch": "#FF7A7A", "Outro": "#A88BFA" };
const TABS = ["perfil", "catalogo", "galeria", "tier", "desejos", "amigos", "resumo"];
const NEW_COLS = ["hours", "metacritic", "playtime", "rawg_id", "target_price", "price", "price_checked_at"];
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
let tab = "perfil", fStatus = "", gStatus = "", tStatus = "played", selected = null, wlSort = "n";
let found = [], busy = false, pe = null, rt = null, priceRun = false, usdRate = null, searchTimer = null;
const caps = { games: true, pub: true };
const priceState = {};

function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 3800) }
const uname = () => { if (!user) return ""; const l = (user.email || "").split("@")[0]; return l.includes("+") ? l.split("+").pop() : l };
const nick = () => (profile && profile.nickname) || uname();
const gameById = id => games.find(g => g.id === id);
const wishlist = () => games.filter(g => g.wishlist || g.status === "Não comprado");
const shareUrl = u => location.origin + location.pathname + "#u/" + encodeURIComponent(u);
const hoursTxt = h => h == null || h === "" ? "" : `${Number(h).toLocaleString("pt-BR")} h`;

/* ---------- tema ---------- */
function setTheme(t) {
  if (t === "light") document.documentElement.dataset.theme = "light"; else delete document.documentElement.dataset.theme;
  lsSet("theme", t); try { localStorage.setItem("theme", t) } catch (e) { }
  const b = $("#theme-btn"); if (b) b.innerHTML = ic(t === "light" ? "moon" : "sun");
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#EDF0F8" : "#0B1129";
}
const curTheme = () => document.documentElement.dataset.theme === "light" ? "light" : "dark";

/* ---------- visuais reutilizáveis ---------- */
function cover(g) {
  if (g.cover_url) return `<img class="cv" alt="" referrerpolicy="no-referrer" loading="lazy" src="${esc(g.cover_url)}">`;
  const h = hue(g.name || "");
  return `<div class="cvf" style="background:linear-gradient(160deg,hsl(${h} 45% 38%),hsl(${(h + 40) % 360} 50% 20%))">${esc(g.name)}</div>`;
}
function avatar(a) {
  if (a && /^https?:/.test(a)) return `<img alt="" src="${esc(a)}">`;
  const k = a && a.startsWith("preset:") ? a.slice(7) : "p1";
  const p = PRESETS.find(x => x.k === k) || PRESETS[0];
  return `<div class="av-preset" style="background:${p.bg}">${ic(p.icon)}</div>`;
}
function bannerHTML(p, cur, extraCls = "") {
  if (p.banner) return `<div class="banner ${extraCls}" style="background-image:url('${esc(p.banner)}')">`;
  if (cur && cur.cover_url) return `<div class="banner auto ${extraCls}"><div class="bgauto" style="background-image:url('${esc(cur.cover_url)}')"></div><span class="logo wm" aria-hidden="true"></span>`;
  return `<div class="banner ${extraCls}"><span class="logo wm" aria-hidden="true"></span>`;
}
const skRows = n => Array.from({ length: n }, () => `<div class="row skrow"><span class="sk" style="width:18px;height:12px"></span><span class="sk" style="width:44px;aspect-ratio:2/3"></span><span><span class="sk" style="width:55%;height:14px"></span><span class="sk" style="width:35%;height:10px;margin-top:8px"></span></span><span class="sk" style="height:30px;border-radius:999px"></span><span class="sk" style="height:30px"></span><span class="sk" style="height:18px"></span><span></span></div>`).join("");
const skGrid = n => Array.from({ length: n }, () => `<div><div class="sk" style="aspect-ratio:2/3;border-radius:10px"></div><div class="sk" style="height:12px;width:70%;margin-top:12px"></div></div>`).join("");

/* ---------- imagens ---------- */
function resizeImage(file, w, h, q = 0.86) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d"), r = Math.max(w / img.width, h / img.height), dw = img.width * r, dh = img.height * r;
      x.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh); URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error("blob")), "image/jpeg", q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")) };
    img.src = url;
  });
}
async function uploadImage(file, kind) {
  if (file.size > 15 * 1024 * 1024) throw new Error("grande");
  const dims = { avatar: [320, 320], banner: [1400, 460], cover: [480, 720] }[kind];
  const blob = await resizeImage(file, dims[0], dims[1]);
  const path = `${user.id}/${kind}-${Date.now()}.jpg`;
  const { error } = await sb.storage.from("media").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/* ---------- dados ---------- */
async function checkSchema() {
  const [a, b] = await Promise.all([
    sb.from("games").select(NEW_COLS.join(",")).limit(1),
    sb.from("profiles").select("is_public").limit(1),
  ]);
  caps.games = !a.error; caps.pub = !b.error;
  const m = $("#mig"); m.hidden = caps.games && caps.pub;
  if (!m.hidden) m.innerHTML = `${ic("shield")}<span><b>Falta um passo no banco.</b> Rode o arquivo <code>migracao.sql</code> no SQL Editor do Supabase para salvar horas, preços, preço-alvo e perfil público. Até lá, o resto funciona normalmente.</span>`;
}
function clean(patch) { if (caps.games) return patch; const p = { ...patch }; for (const k of NEW_COLS) delete p[k]; return p }

async function loadAll() {
  const [g, p] = await Promise.all([
    sb.from("games").select("*").eq("user_id", user.id).order("n", { ascending: true }),
    sb.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    checkSchema(),
  ]);
  if (g.error) { toast("Não foi possível carregar os jogos."); return }
  games = g.data; profile = p.data || null; loaded = true; render();
  if (!profile || profile.username !== uname()) saveProfile({});
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
  const row = { user_id: user.id, username: uname(), nickname: next.nickname ?? null, bio: next.bio ?? null, avatar: next.avatar ?? null, banner: next.banner ?? null, favorites: next.favorites || [], now_playing: next.now_playing ?? null, updated_at: new Date().toISOString() };
  if (caps.pub) row.is_public = !!next.is_public;
  const { data, error } = await sb.from("profiles").upsert(row, { onConflict: "user_id" }).select().single();
  if (error) { toast("Não foi possível salvar o perfil."); return false }
  profile = data; render(); return true;
}

/* ---------- comemoração ao zerar ---------- */
function celebrate(name) {
  toast(`🏆 Você zerou ${name}!`);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
function chipsHTML(cur, prefix) {
  return [["", "Todos"], ...STATUS.map(s => [s, s])].map(([v, l]) => {
    const c = v ? games.filter(g => g.status === v).length : games.length;
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
  else if (mode === "price") a.sort((x, y) => (bestOf(x)?.amount ?? 1e9) - (bestOf(y)?.amount ?? 1e9));
  else if (mode === "cut") a.sort((x, y) => (bestOf(y)?.cut ?? -1) - (bestOf(x)?.cut ?? -1));
  else a.sort((x, y) => (x.n || 0) - (y.n || 0));
  return a;
}

/* ---------- perfil ---------- */
function activity() {
  const ev = [];
  for (const g of games) {
    if (g.created_at) ev.push({ t: g.created_at, k: "add", g });
    if (g.finished_at) ev.push({ t: g.finished_at, k: "fin", g });
    if (g.rated_at) ev.push({ t: g.rated_at, k: "rate", g });
  }
  return ev.sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 8);
}
function renderProfile() {
  const el = $("#perfil");
  if (!loaded) {
    el.innerHTML = `<div class="banner sk"></div><div class="phead"><div class="av lg sk"></div><div class="pid"><span class="sk" style="width:220px;height:30px"></span><span class="sk" style="width:120px;height:12px;margin-top:10px"></span></div></div>
    <div class="pgrid"><div><div class="sk" style="height:170px;border-radius:20px"></div><div class="favgrid" style="margin-top:30px">${skGrid(5)}</div></div><div class="sk" style="height:380px;border-radius:20px"></div></div>`;
    return;
  }
  const p = profile || {};
  const favIds = (p.favorites || []).filter(id => gameById(id)).slice(0, 5);
  const favs = favIds.map(gameById);
  const cur = gameById(p.now_playing) || games.find(g => g.status === "Jogando");
  const fin = games.filter(g => g.status === "Finalizado").length;
  const rated = games.filter(g => g.rating != null && g.rating !== "");
  const avg = rated.length ? (rated.reduce((a, g) => a + Number(g.rating), 0) / rated.length).toFixed(1) : "—";
  const hrs = games.reduce((a, g) => a + (+g.hours || 0), 0);
  const revs = games.filter(g => g.review && g.review.trim()).sort((a, b) => new Date(b.rated_at || 0) - new Date(a.rated_at || 0)).slice(0, 4);
  const wl = wishlist(), act = activity();
  const slots = [];
  for (let i = 0; i < 5; i++) {
    const g = favs[i];
    slots.push(g ? `<button class="fav" data-open="${g.id}"><div class="poster"><span class="rank">${i + 1}</span>${cover(g)}</div><div class="n">${esc(g.name)}</div><div class="r">${g.exp ? esc(g.exp) : "Sem experiência"}${g.rating != null ? " · " + rateTxt(g) : ""}</div></button>`
      : `<button class="fav slot" data-act="edit-profile" aria-label="Escolher um favorito"><div class="poster">${ic("plus")}</div></button>`);
  }
  const actText = e => e.k === "fin" ? `Zerou <b>${esc(e.g.name)}</b>` : e.k === "rate" ? `Avaliou <b>${esc(e.g.name)}</b>${e.g.rating != null ? " com nota " + rateTxt(e.g) : ""}` : `Adicionou <b>${esc(e.g.name)}</b>`;
  const actIcon = e => e.k === "fin" ? ["fin", "trophy"] : e.k === "rate" ? ["rate", "star"] : ["add", "plus"];
  el.innerHTML = `
  ${bannerHTML(p, cur)}
    <div class="ban-acts">${p.is_public ? `<button class="btn ghost sm" data-act="share-profile">${ic("share")}Compartilhar</button>` : ""}<button class="btn ghost sm" data-act="edit-profile">${ic("pencil")}Editar perfil</button></div></div>
  <div class="phead">
    <div class="av lg">${avatar(p.avatar)}</div>
    <div class="pid"><h1>${esc(nick())}</h1><div class="un">@${esc(uname())}${p.is_public ? ` <span class="pubtag">${ic("globe")}Perfil público</span>` : ""}</div></div>
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
        <div class="panel">${wl.length ? `<div class="wmini">${wl.slice(0, 6).map(g => { const b = bestOf(g); return `<button data-open="${g.id}" title="${esc(g.name)}"><div class="poster">${cover(g)}${b ? `<span class="ptag">${money(b.amount, g.price.currency)}</span>` : ""}</div></button>` }).join("")}</div>`
      : `<div class="empty" style="padding:24px 12px"><b>Lista vazia</b>Guarde aqui o que quer jogar depois.</div>`}</div></div>
    </aside>
  </div>`;
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
  if (!loaded) { box.innerHTML = skRows(6); return }
  if (!games.length) { box.innerHTML = `<div class="empty"><b>Nenhum jogo ainda</b>Adicione o primeiro jogo ou importe uma planilha.<br><button class="btn sm" data-act="add">${ic("plus")}Adicionar jogo</button></div>`; return }
  if (!list.length) { box.innerHTML = `<div class="empty"><b>Nada encontrado</b>Tente outro nome ou filtro.</div>`; return }
  box.innerHTML = `<div class="row head"><span>Nº</span><span></span><span>Jogo</span><span>Status</span><span>Experiência</span><span style="text-align:center">Nota</span><span></span></div>` +
    list.map(g => {
      const meta = [g.platform, g.genre, g.year, hoursTxt(g.hours)].filter(Boolean).map(esc);
      if (g.notes) meta.push(esc(g.notes));
      return `<div class="row" data-id="${g.id}">
      <span class="num">${g.n ?? ""}</span><div class="mini">${cover(g)}</div>
      <div class="nmbox" style="min-width:0"><div class="nm">${esc(g.name)}${favs.includes(g.id) ? ic("heart", "fill") : ""}${g.wishlist ? ic("bookmark", "w") : ""}</div>
        <div class="meta">${meta.join(" · ")}</div></div>
      <div class="stbox"><select class="stsel ${stClass(g.status)}" data-f="status" aria-label="Status de ${esc(g.name)}">${STATUS.map(s => `<option${s === g.status ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="exbox"><select data-f="exp" aria-label="Experiência de ${esc(g.name)}"><option value="">—</option>${EXPS.map(s => `<option${s === g.exp ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <span class="rate">${rateTxt(g)}</span>
      <button class="iconbtn" data-open="${g.id}" aria-label="Editar ${esc(g.name)}">${ic("pencil")}</button></div>`;
    }).join("");
}

/* ---------- galeria ---------- */
function renderGallery() {
  $("#gchips").innerHTML = chipsHTML(gStatus, "g");
  const list = sorted(games.filter(g => !gStatus || g.status === gStatus), "n");
  $("#grid").innerHTML = !loaded ? skGrid(12) : !list.length
    ? `<div class="panel empty" style="grid-column:1/-1"><b>Galeria vazia</b>Adicione jogos para ver as capas aqui.</div>`
    : list.map(g => `<button class="card" data-open="${g.id}"><div class="poster"><span class="tag badge ${stClass(g.status)}">${esc(g.status)}</span>${g.metacritic ? `<span class="mc" title="Metacritic">${g.metacritic}</span>` : ""}${cover(g)}<div class="ov"><span class="badge st-Finalizado" style="visibility:${g.exp ? "visible" : "hidden"}">${esc(g.exp)}</span><span class="rate">${rateTxt(g)}</span></div></div><div class="t">${esc(g.name)}</div></button>`).join("");
}

/* ---------- preços ---------- */
const bestOf = g => g.price && !g.price.none && g.price.best ? g.price.best : null;
const priceFresh = g => g.price && g.price_checked_at && Date.now() - new Date(g.price_checked_at).getTime() < PRICE_TTL;
let csStoreMap = null;
async function csStores() {
  if (csStoreMap) return csStoreMap;
  const c = lsGet("cs-stores"); if (c && Date.now() - c.t < 7 * 864e5) return csStoreMap = c.m;
  const r = await fetch("https://www.cheapshark.com/api/1.0/stores"); const j = await r.json();
  csStoreMap = {}; for (const s of j) csStoreMap[s.storeID] = s.storeName;
  lsSet("cs-stores", { t: Date.now(), m: csStoreMap }); return csStoreMap;
}
async function getRate() {
  if (usdRate) return usdRate;
  const c = lsGet("usdbrl"); if (c && Date.now() - c.t < PRICE_TTL) return usdRate = c.r;
  for (const u of ["https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL", "https://api.frankfurter.app/latest?from=USD&to=BRL"]) {
    try { const j = await (await fetch(u)).json(); if (j.rates && j.rates.BRL) { usdRate = j.rates.BRL; lsSet("usdbrl", { t: Date.now(), r: usdRate }); return usdRate } } catch (e) { }
  }
  return null;
}
async function fetchPrice(g) {
  const checked = new Date().toISOString();
  if (CFG.PRICE_FUNCTION && sb) {
    const { data, error } = await sb.functions.invoke(CFG.PRICE_FUNCTION, { body: { title: g.name, country: "BR" } });
    if (error || !data || data.error) throw new Error("preço");
    const deals = (data.deals || []).filter(d => d.amount != null).sort((a, b) => a.amount - b.amount).slice(0, 8);
    if (data.none || !deals.length) return { none: true, source: "itad", checked };
    return { source: "itad", currency: data.currency || deals[0].currency || "BRL", best: deals[0], deals, low: data.low ?? null, title: data.title || g.name, url: data.url || null, checked };
  }
  const base = "https://www.cheapshark.com/api/1.0";
  const r = await fetch(`${base}/games?title=${encodeURIComponent(g.name)}&limit=10`);
  if (!r.ok) throw new Error("preço " + r.status);
  const list = await r.json();
  if (!list.length) return { none: true, source: "cheapshark", checked };
  const n = norm(g.name);
  const m = list.find(x => norm(x.external) === n) || list.find(x => norm(x.external).startsWith(n)) || list[0];
  const [dr, stores] = await Promise.all([fetch(`${base}/games?id=${m.gameID}`), csStores()]);
  const det = await dr.json();
  const deals = (det.deals || []).map(d => ({
    shop: stores[d.storeID] || "Loja", amount: +d.price, regular: +d.retailPrice, cut: Math.round(+d.savings),
    url: `https://www.cheapshark.com/redirect?dealID=${String(d.dealID).includes("%") ? d.dealID : encodeURIComponent(d.dealID)}`
  })).sort((a, b) => a.amount - b.amount).slice(0, 8);
  if (!deals.length) return { none: true, source: "cheapshark", checked };
  return { source: "cheapshark", currency: "USD", best: deals[0], deals, low: det.cheapestPriceEver ? +det.cheapestPriceEver.price : null, steam: m.steamAppID || (det.info && det.info.steamAppID) || null, title: (det.info && det.info.title) || m.external, checked };
}
async function refreshPrices(force, onlyId) {
  if (priceRun || !sb) return; priceRun = true;
  try {
    const list = onlyId ? [gameById(onlyId)].filter(Boolean) : wishlist().filter(g => force || !priceFresh(g));
    if (!list.length) return;
    for (const g of list) priceState[g.id] = "loading";
    render();
    for (const g of list) {
      try { const p = await fetchPrice(g); delete priceState[g.id]; await save(g.id, { price: p, price_checked_at: p.checked }, true) }
      catch (e) { priceState[g.id] = "error"; render() }
      await sleep(350);
    }
    if (list.some(g => g.price && g.price.currency === "USD")) { await getRate(); render() }
  } finally { priceRun = false; if (tab === "desejos") render() }
}
function storeLinks(name, platform) {
  const q = encodeURIComponent(name);
  const all = [
    ["PlayStation", "PlayStation Store", `https://store.playstation.com/pt-br/search/${q}`],
    ["Xbox", "Xbox / Microsoft Store", `https://www.xbox.com/pt-BR/search/results/games?q=${q}`],
    ["Switch", "Nintendo eShop", `https://www.nintendo.com/pt-br/search/?q=${q}`],
    ["PC", "Steam", `https://store.steampowered.com/search/?term=${q}`],
    ["PC", "Nuuvem", `https://www.nuuvem.com/br-pt/catalog/search/${q}`],
    ["PC", "Epic Games Store", `https://store.epicgames.com/pt-BR/browse?q=${q}&sortBy=relevancy&sortDir=DESC`],
  ];
  return all.sort((a, b) => (b[0] === platform) - (a[0] === platform));
}
const approx = (v, cur) => cur === "USD" && usdRate ? `<span class="approx" title="Conversão aproximada pelo câmbio do dia. O preço em lojas brasileiras pode ser outro.">≈ ${money(v * usdRate, "BRL")}</span>` : "";
function priceBox(g) {
  const st = priceState[g.id], b = bestOf(g);
  if (st === "loading") return `<div class="pbox"><span class="sk" style="width:60%;height:20px"></span><span class="sk" style="width:40%;height:11px;margin-top:8px"></span></div>`;
  if (st === "error" && !b) return `<div class="pbox none">Não consegui buscar o preço agora.<button class="link" data-refresh-price="${g.id}">Tentar de novo</button></div>`;
  if (!g.price) return `<div class="pbox none">Preço ainda não buscado.<button class="link" data-refresh-price="${g.id}">Buscar preço</button></div>`;
  if (!b) return `<div class="pbox none">Sem oferta encontrada para PC.<button class="link" data-prices="${g.id}">Ver nas lojas</button></div>`;
  const hit = g.target_price != null && b.amount <= Number(g.target_price);
  return `<div class="pbox ${hit ? "hit" : ""}">
    ${hit ? `<span class="hitlbl">${ic("check")}Abaixo do seu preço-alvo</span>` : ""}
    <div class="pnow"><b>${money(b.amount, g.price.currency)}</b>${b.cut > 0 ? `<s>${money(b.regular, g.price.currency)}</s>` : ""}</div>
    <div class="pshop">${esc(b.shop)}${g.price.source === "cheapshark" ? " · PC" : ""}${approx(b.amount, g.price.currency)}</div>
    <div class="pacts"><a class="btn sm" href="${esc(b.url || "#")}" target="_blank" rel="noopener">${ic("cart")}Comprar</a><button class="btn ghost sm" data-prices="${g.id}">Lojas</button></div>
  </div>`;
}

/* ---------- lista de desejos ---------- */
function renderWishlist() {
  const list = sorted(wishlist(), wlSort);
  const priced = list.filter(bestOf);
  const tot = {}; for (const g of priced) { const c = g.price.currency; tot[c] = (tot[c] || 0) + bestOf(g).amount }
  const src = CFG.PRICE_FUNCTION ? "Preços em reais de lojas brasileiras (IsThereAnyDeal)." : "Menor preço de PC em lojas digitais, em dólar (CheapShark). Para consoles, use os atalhos das lojas oficiais.";
  const checkedTimes = list.map(g => g.price_checked_at).filter(Boolean).sort();
  $("#wl-sub").textContent = loaded ? `${list.length} ${list.length === 1 ? "jogo" : "jogos"} que você quer jogar ou comprar.` : "";
  $("#wl-refresh").disabled = priceRun || !list.length;
  $("#wl-bar").innerHTML = !loaded || !list.length ? "" : `
    <div class="wl-sum">
      <div><span class="k">Total no menor preço</span><b>${Object.keys(tot).length ? Object.entries(tot).map(([c, v]) => money(v, c)).join(" + ") : "—"}</b>${tot.USD ? approx(tot.USD, "USD") : ""}</div>
      <div><span class="k">Com preço</span><b>${priced.length}/${list.length}</b></div>
      <div><span class="k">Em promoção</span><b>${priced.filter(g => bestOf(g).cut > 0).length}</b></div>
    </div>
    <div class="wl-tools"><p class="hint">${esc(src)}${checkedTimes.length ? ` Conferido ${rel(checkedTimes[0])}.` : ""}</p>
      <select id="wl-sort" aria-label="Ordenar lista de desejos">${[["n", "Ordem da lista"], ["price", "Menor preço"], ["cut", "Maior desconto"], ["name", "Nome (A–Z)"]].map(([v, l]) => `<option value="${v}"${v === wlSort ? " selected" : ""}>${l}</option>`).join("")}</select></div>`;
  $("#wgrid").innerHTML = !loaded ? skGrid(6) : !list.length
    ? `<div class="panel empty" style="grid-column:1/-1"><b>Sua lista está vazia</b>Adicione jogos que você quer jogar ou comprar e veja onde estão mais baratos.<br><button class="btn sm" id="add-wish2">${ic("plus")}Adicionar à lista</button></div>`
    : list.map(g => { const b = bestOf(g); return `<div class="wcard"><button class="card" data-open="${g.id}"><div class="poster">${b && b.cut > 0 ? `<span class="cut">-${b.cut}%</span>` : ""}${cover(g)}</div><div class="t">${esc(g.name)}</div>${g.platform ? `<div class="meta">${esc(g.platform)}</div>` : ""}</button>
      ${priceBox(g)}
      <div class="wact"><button class="btn ghost sm" data-bought="${g.id}">${ic("check")}Já comprei</button></div></div>` }).join("");
}
function openPrices(id) {
  const g = gameById(id); if (!g) return;
  const p = g.price || {}, b = bestOf(g), cur = p.currency;
  const deals = (p.deals || []).map((d, i) => `<div class="deal"><span class="ds">${esc(d.shop)}</span><span class="dp">${d.cut > 0 ? `<s>${money(d.regular, cur)}</s>` : ""}<b>${money(d.amount, cur)}</b>${d.cut > 0 ? `<i class="dc">-${d.cut}%</i>` : ""}</span><a class="btn sm${i === 0 ? "" : " ghost"}" href="${esc(d.url || "#")}" target="_blank" rel="noopener">${ic("external")}Abrir</a></div>`).join("");
  const links = storeLinks(g.name, g.platform).map(([pl, n, u]) => `<a class="slink${pl === g.platform ? " mine" : ""}" href="${esc(u)}" target="_blank" rel="noopener"><span>${esc(n)}</span><small>${esc(pl)}</small>${ic("external")}</a>`).join("");
  modalShell(`<h2>Onde comprar</h2><p class="sub">${esc(g.name)}${p.title && norm(p.title) !== norm(g.name) ? ` <span class="hint">· resultado encontrado: ${esc(p.title)}</span>` : ""}</p>
    ${b ? `<div class="pmhead"><div><span class="k">Menor preço agora</span><b>${money(b.amount, cur)}</b>${approx(b.amount, cur)}</div>${p.low != null ? `<div><span class="k">Menor preço já registrado</span><b>${money(p.low, cur)}</b></div>` : ""}</div>
      <div class="deals">${deals}</div>
      <p class="hint" style="margin-top:8px">${p.source === "itad" ? "Preços em lojas brasileiras via IsThereAnyDeal." : "Preços de PC em dólar via CheapShark. Os links passam pelo CheapShark e levam direto à página da loja."} Atualizado ${p.checked ? rel(p.checked) : ""}.</p>
      ${p.steam ? `<a class="btn ghost sm" style="margin-top:10px" href="https://store.steampowered.com/app/${esc(p.steam)}/" target="_blank" rel="noopener">${ic("external")}Ver na Steam com preço em reais</a>` : ""}`
      : `<div class="panel empty" style="padding:22px"><b>Sem oferta encontrada</b>${g.price ? "Nenhuma loja de PC acompanhada vende esse jogo agora." : "O preço ainda não foi buscado."}</div>`}
    <h3 class="h3" style="margin-top:22px">Lojas oficiais</h3>
    <div class="slinks">${links}</div>
    <div class="f" style="margin-top:20px"><label>Preço-alvo${cur ? ` (${cur === "USD" ? "em dólar" : "em reais"})` : ""} <span class="hint">· avisamos na lista quando o menor preço ficar abaixo disso</span>
      <span class="bar" style="margin:0"><input type="number" id="tp" min="0" step="0.01" value="${g.target_price ?? ""}" placeholder="Ex.: 49.90" class="grow"><button class="btn ghost" data-target-save="${g.id}">Salvar</button></span></label></div>
    <div class="acts"><button class="btn ghost left" data-refresh-price="${g.id}">${ic("refresh")}Atualizar agora</button><button class="btn" data-close>Fechar</button></div>`, true);
}

/* ---------- tier list ---------- */
function tc(g) { return `<button class="tc" draggable="true" data-tc="${g.id}" aria-pressed="${selected === g.id}" title="${esc(g.name)}" aria-label="${esc(g.name)}">${cover(g)}</button>` }
function renderTier() {
  $("#tiers").innerHTML = TIERS.map(([t, c]) => {
    const l = games.filter(g => g.tier === t).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0));
    return `<div class="tier"><div class="lab" style="background:${c}">${t}</div><div class="zone" data-tier="${t}">${l.map(tc).join("")}</div></div>`;
  }).join("");
  $("#tchips").innerHTML = [["played", "Jogados"], ["", "Todos"], ["Não iniciado", "Não iniciados"]].map(([v, l]) => `<button class="chip" data-t="${esc(v)}" aria-pressed="${tStatus === v}">${l}</button>`).join("") +
    (selected ? `<button class="chip" data-t="__clear">Tirar da tier / cancelar</button>` : "");
  let pool = games.filter(g => !g.tier);
  if (tStatus === "played") pool = pool.filter(g => g.status === "Finalizado" || g.status === "Jogando");
  else if (tStatus) pool = pool.filter(g => g.status === tStatus);
  $("#pool").innerHTML = pool.length ? sorted(pool, "n").map(tc).join("") : `<div class="meta" style="padding:8px">Nenhum jogo para classificar neste filtro.</div>`;
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
function loadImg(src, cors) {
  return new Promise(res => {
    if (!src) return res(null);
    const im = new Image(); if (cors) im.crossOrigin = "anonymous";
    const t = setTimeout(() => res(null), 7000);
    im.onload = () => { clearTimeout(t); res(im) }; im.onerror = () => { clearTimeout(t); res(null) };
    im.src = src;
  });
}
function rr(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath() }
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
  x.fillText(`@${uname()} · ${games.filter(g => g.tier).length} jogos classificados`, tx, 110);
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
      x.save(); rr(x, cx, cy, CW, CH, 8); x.clip();
      const im = imap[g.id];
      if (im) { const s = Math.max(CW / im.width, CH / im.height); x.drawImage(im, cx + (CW - im.width * s) / 2, cy + (CH - im.height * s) / 2, im.width * s, im.height * s) }
      else {
        const h0 = hue(g.name || ""), gr = x.createLinearGradient(cx, cy, cx + CW, cy + CH);
        gr.addColorStop(0, `hsl(${h0} 45% 38%)`); gr.addColorStop(1, `hsl(${(h0 + 40) % 360} 50% 20%)`); x.fillStyle = gr; x.fillRect(cx, cy, CW, CH);
        x.fillStyle = "#fff"; x.font = "700 11px 'Chakra Petch', system-ui, sans-serif";
        const words = String(g.name).split(/\s+/), lines = []; let ln = "";
        for (const w of words) { const t = ln ? ln + " " + w : w; if (x.measureText(t).width > CW - 12 && ln) { lines.push(ln); ln = w } else ln = t }
        lines.push(ln); lines.slice(-4).forEach((l, j, a) => x.fillText(l, cx + 6, cy + CH - 8 - (a.length - 1 - j) * 13));
      }
      x.restore();
    });
    y += h + 12;
  });
  x.fillStyle = "#7F8DB5"; x.font = "500 16px Figtree, system-ui, sans-serif"; x.fillText("Feito no Jogos Enzola · Movimento Enzola", PAD, H - 28);
  return cv;
}
async function exportTier() {
  if (!games.some(g => g.tier)) { toast("Coloque pelo menos um jogo numa linha antes de salvar a imagem."); return }
  const b = $("#tier-img"); b.disabled = true; const old = b.innerHTML; b.innerHTML = `${ic("image")}Gerando…`;
  try {
    const cv = await tierCanvas();
    const blob = await new Promise(r => cv.toBlob(r, "image/png"));
    const file = new File([blob], `tier-list-${uname() || "enzola"}.png`, { type: "image/png" });
    if (matchMedia("(pointer:coarse)").matches && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Minha tier list" }); return } catch (e) { if (e.name === "AbortError") return }
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast("Imagem da tier list salva.");
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
  if (!loaded) { el.innerHTML = `<div class="tiles">${Array.from({ length: 4 }, () => `<div class="sk" style="height:96px;border-radius:20px"></div>`).join("")}</div>`; return }
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
function closeModal() { $("#modal").innerHTML = ""; pe = null; clearTimeout(searchTimer) }
function modalShell(inner, wide) { $("#modal").innerHTML = `<div class="ovl" data-ovl><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${inner}</div></div>` }

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
    const r = await fetch(`https://api.rawg.io/api/games?key=${encodeURIComponent(CFG.RAWG_KEY)}&search=${encodeURIComponent(q)}&page_size=8`);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    if (!$("#s-res") || $("#s-q").value.trim() !== q) return;
    found = j.results.map(x => ({ name: x.name, year: (x.released || "").slice(0, 4), genre: (x.genres || []).map(g => g.name).slice(0, 2).join(", "), platform: mapPlat(x.platforms), cover_url: x.background_image || "", rawg_id: x.id || null, metacritic: x.metacritic || null, playtime: x.playtime || null }));
    const have = new Set(games.map(g => norm(g.name)));
    res.innerHTML = found.map((s, i) => `<div class="it"><div class="ib"><div class="mini">${s.cover_url ? `<img class="cv" alt="" referrerpolicy="no-referrer" src="${esc(s.cover_url)}">` : ""}</div><div style="min-width:0"><div class="nm">${esc(s.name)}${s.metacritic ? `<span class="mc sm" title="Metacritic">${s.metacritic}</span>` : ""}</div><div class="meta">${esc([s.year, s.genre, s.platform].filter(Boolean).join(" · "))}${have.has(norm(s.name)) ? ` · <b class="dup">já está na sua biblioteca</b>` : ""}</div></div></div><button class="btn ghost sm" data-pick="${i}">Usar</button></div>`).join("") || `<div class="muted">Nada encontrado. Use “Adicionar manualmente”.</div>`;
  } catch (e) { if ($("#s-res")) res.innerHTML = `<div class="muted">Não foi possível buscar agora. Você pode adicionar manualmente.</div>` }
}
function mapPlat(list) {
  const t = (list || []).map(p => p.platform.name).join(" ");
  return /PC/.test(t) ? "PC" : /PlayStation/.test(t) ? "PlayStation" : /Xbox/.test(t) ? "Xbox" : /Nintendo/.test(t) ? "Switch" : "";
}

function openForm(id, draft = {}) {
  const g = id ? gameById(id) : { name: "", status: "Não iniciado", exp: "", rating: "", platform: "", notes: "", genre: "", year: "", cover_url: "", review: "", wishlist: false, hours: "", finished_at: null, ...draft };
  if (!g) return;
  const favs = (profile && profile.favorites) || [];
  const info = [g.metacritic ? `<span class="chipinfo"><span class="mc sm">${g.metacritic}</span>Metacritic</span>` : "", g.playtime ? `<span class="chipinfo">${ic("clock")}Duração média ~${g.playtime} h</span>` : "", bestOf(g) ? `<button type="button" class="chipinfo link-like" data-prices="${g.id}">${ic("tag")}${money(bestOf(g).amount, g.price.currency)} em ${esc(bestOf(g).shop)}</button>` : ""].filter(Boolean).join("");
  modalShell(`<h2>${id ? "Editar jogo" : "Novo jogo"}</h2><p class="sub">${id ? esc(g.name) : "Preencha os dados do jogo."}</p>
  ${info ? `<div class="infos">${info}</div>` : ""}
  <div class="f" data-id="${id || ""}">
    <div class="coverrow"><div class="mini" id="m-prev">${cover(g)}</div>
      <div class="col"><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost sm" id="m-up">${ic("upload")}Enviar capa</button><button type="button" class="btn ghost sm" id="m-rm">${ic("trash")}Remover</button></div>
        <input type="file" id="m-file" accept="image/png,image/jpeg,image/webp" hidden>
        <input type="text" id="m-cover" value="${esc(g.cover_url)}" placeholder="ou cole o link de uma imagem" aria-label="Link da capa"><span class="hint" id="m-cmsg">A capa é recortada em 2:3 (formato pôster).</span></div></div>
    <label>Nome<input type="text" id="m-name" value="${esc(g.name)}"></label>
    <div class="f2"><label>Status<select id="m-status">${STATUS.map(s => `<option${s === g.status ? " selected" : ""}>${s}</option>`).join("")}</select></label>
      <label>Experiência<select id="m-exp"><option value="">—</option>${EXPS.map(s => `<option${s === g.exp ? " selected" : ""}>${s}</option>`).join("")}</select></label></div>
    <div class="f2"><label>Nota (0 a 10)<input type="number" id="m-rating" min="0" max="10" step="0.5" value="${g.rating ?? ""}"></label>
      <label>Plataforma<select id="m-plat"><option value="">—</option>${PLATS.map(s => `<option${s === g.platform ? " selected" : ""}>${s}</option>`).join("")}</select></label></div>
    <div class="f2"><label>Gênero<input type="text" id="m-genre" value="${esc(g.genre)}"></label><label>Ano<input type="text" id="m-year" value="${esc(g.year)}" inputmode="numeric"></label></div>
    <div class="f2"><label>Horas jogadas<input type="number" id="m-hours" min="0" step="0.5" value="${g.hours ?? ""}" placeholder="${g.playtime ? "média: " + g.playtime + " h" : "ex.: 42"}"></label>
      <label>Zerado em<input type="date" id="m-fin" value="${g.finished_at ? String(g.finished_at).slice(0, 10) : ""}"></label></div>
    <label>Sua avaliação<textarea id="m-review" rows="3" maxlength="500" placeholder="Escreva uma pequena análise sobre o jogo">${esc(g.review)}</textarea></label>
    <label>Observações<input type="text" id="m-notes" value="${esc(g.notes)}"></label>
    <div class="toggles">
      <label class="tg"><input type="checkbox" id="m-fav"${id && favs.includes(id) ? " checked" : ""}>${ic("heart")}Favorito</label>
      <label class="tg"><input type="checkbox" id="m-cur"${id && profile && profile.now_playing === id ? " checked" : ""}>${ic("play")}Jogo do momento</label>
      <label class="tg"><input type="checkbox" id="m-wish"${g.wishlist ? " checked" : ""}>${ic("bookmark")}Lista de desejos</label>
    </div></div>
  <div class="acts">${id ? `<button class="btn danger left" id="m-del">${ic("trash")}Remover jogo</button>` : ""}<button class="btn ghost" data-close>Cancelar</button><button class="btn" id="m-save">Salvar</button></div>`);
  modalShell.draft = id ? null : { rawg_id: draft.rawg_id ?? null, metacritic: draft.metacritic ?? null, playtime: draft.playtime ?? null };
  $("#m-name").focus();
}
function refreshPrev() { const g = { name: $("#m-name").value, cover_url: $("#m-cover").value.trim() }; $("#m-prev").innerHTML = cover(g) }
async function doSave() {
  if (busy) return;
  const box = $("#modal .f"), id = box.dataset.id, r = $("#m-rating").value, fin = $("#m-fin").value;
  const data = { name: $("#m-name").value.trim(), status: $("#m-status").value, exp: $("#m-exp").value, rating: r === "" ? null : Math.min(10, Math.max(0, Number(r))), platform: $("#m-plat").value, genre: $("#m-genre").value.trim(), year: $("#m-year").value.trim(), notes: $("#m-notes").value.trim(), review: $("#m-review").value.trim() || null, cover_url: $("#m-cover").value.trim() || null, wishlist: $("#m-wish").checked, hours: num($("#m-hours").value) };
  if (fin) data.finished_at = new Date(fin + "T12:00:00").toISOString(); else if (data.status !== "Finalizado") data.finished_at = null;
  if (!id && modalShell.draft) Object.assign(data, modalShell.draft);
  if (!data.name) { toast("Informe o nome do jogo."); return }
  if (data.hours != null && data.hours < 0) { toast("As horas não podem ser negativas."); return }
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
    const ng = gameById(gid); if (!id && ng && (ng.wishlist || ng.status === "Não comprado")) refreshPrices(false, gid);
  } finally { busy = false; const b2 = $("#m-save"); if (b2) { b2.disabled = false; b2.textContent = "Salvar" } }
}

function openProfileEditor() {
  const p = profile || {};
  pe = { avatar: p.avatar || "preset:p1", banner: p.banner || "", favorites: ((p.favorites) || []).filter(x => gameById(x)).slice(0, 5) };
  modalShell(`<h2>Editar perfil</h2><p class="sub">@${esc(uname())}</p>
  <div class="f">
    <div class="pe-av"><div class="av md" id="pe-av">${avatar(pe.avatar)}</div>
      <div style="display:grid;gap:8px"><button class="btn ghost sm" id="pe-up">${ic("upload")}Enviar minha foto</button><input type="file" id="pe-file" accept="image/png,image/jpeg,image/webp" hidden><span class="hint">ou escolha um avatar abaixo</span></div></div>
    <div class="presets" id="pe-presets">${PRESETS.map(x => `<button type="button" data-preset="${x.k}" aria-label="Avatar ${x.k}" aria-pressed="${pe.avatar === "preset:" + x.k}"><div class="av-preset" style="background:${x.bg}">${ic(x.icon)}</div></button>`).join("")}</div>
    <div><div class="fld" style="margin-bottom:6px">Banner <span class="hint">· sem banner, usamos a capa do jogo do momento</span></div><div class="pe-ban" id="pe-ban" style="${pe.banner ? `background-image:url('${esc(pe.banner)}')` : ""}"></div>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn ghost sm" id="pe-bup">${ic("image")}Enviar banner</button><button class="btn ghost sm" id="pe-brm">${ic("trash")}Remover</button><input type="file" id="pe-bfile" accept="image/png,image/jpeg,image/webp" hidden></div></div>
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
async function peUpload(file, kind) {
  try {
    toast("Enviando imagem…");
    const url = await uploadImage(file, kind);
    if (kind === "avatar") { pe.avatar = url; $("#pe-av").innerHTML = avatar(url); for (const b of $$("#pe-presets button")) b.setAttribute("aria-pressed", "false") }
    else { pe.banner = url; $("#pe-ban").style.backgroundImage = `url('${url}')` }
    toast("Imagem enviada. Clique em Salvar perfil.");
  } catch (e) { toast("Não foi possível enviar a imagem. Use JPG, PNG ou WebP de até 15 MB.") }
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast("Link copiado.") }
  catch (e) { const i = $("#pe-link"); if (i) { i.select(); document.execCommand && document.execCommand("copy") } toast("Link copiado.") }
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
  el.innerHTML = `<div class="banner sk"></div><div class="phead"><div class="av lg sk"></div></div>`;
  if (!sb) { el.innerHTML = `<div class="panel empty"><b>Site sem configuração</b>Configure o Supabase no config.js.</div>`; return }
  const { data, error } = await sb.rpc("public_profile", { uname: u.toLowerCase() });
  const p = data && data.profile;
  if (error || !p) { el.innerHTML = `<div class="panel empty" style="margin-top:40px"><b>Perfil não encontrado</b>O usuário @${esc(u)} não existe ou deixou o perfil privado.</div>`; return }
  const gs = data.games || [], by = id => gs.find(g => g.id === id);
  const cur = by(p.now_playing) || gs.find(g => g.status === "Jogando");
  const favs = (p.favorites || []).map(by).filter(Boolean).slice(0, 5);
  const fin = gs.filter(g => g.status === "Finalizado");
  const rated = gs.filter(g => g.rating != null);
  const avg = rated.length ? (rated.reduce((a, g) => a + Number(g.rating), 0) / rated.length).toFixed(1) : "—";
  const tiers = TIERS.map(([t, c]) => [t, c, gs.filter(g => g.tier === t).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0))]).filter(x => x[2].length);
  document.title = `${p.nickname || p.username} · Jogos Enzola`;
  el.innerHTML = `${bannerHTML(p, cur)}</div>
  <div class="phead"><div class="av lg">${avatar(p.avatar)}</div><div class="pid"><h1>${esc(p.nickname || p.username)}</h1><div class="un">@${esc(p.username)}</div></div>
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
}
function emailFor(u) {
  const b = String(CFG.EMAIL_BASE || "").trim();
  if (/^[^@\s+]+@[^@\s]+\.[^@\s]+$/.test(b)) { const [l, d] = b.split("@"); return `${l}+${u}@${d}` }
  return u + "@gmail.com";
}
async function doAuth(signup) {
  if (!sb) return;
  const u = $("#a-email").value.trim().toLowerCase().replace(/^@/, ""), pass = $("#a-pass").value, m = $("#auth-msg");
  m.className = "auth-msg";
  if (!/^[a-z0-9._-]{3,30}$/.test(u)) { m.textContent = "Usuário com 3 a 30 letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços ou acentos."; return }
  if (pass.length < 6) { m.textContent = "A senha precisa ter pelo menos 6 caracteres."; return }
  m.textContent = "Aguarde…"; for (const b of $$(".auth-acts .btn")) b.disabled = true;
  try {
    let r;
    if (signup) {
      const t = await sb.rpc("username_taken", { uname: u });
      if (!t.error && t.data === true) { m.textContent = "Esse usuário já existe. Escolha outro."; return }
      r = await sb.auth.signUp({ email: emailFor(u), password: pass });
    } else {
      r = await sb.auth.signInWithPassword({ email: emailFor(u), password: pass });
      const legacy = u + "@gmail.com";
      if (r.error && emailFor(u) !== legacy) r = await sb.auth.signInWithPassword({ email: legacy, password: pass });
    }
    if (r.error) { m.textContent = signup ? (/registered|exists/i.test(r.error.message) ? "Esse usuário já existe. Escolha outro." : "Não foi possível criar a conta: " + r.error.message) : "Usuário ou senha incorretos."; return }
    if (signup && !r.data.session) m.textContent = "Conta criada, mas o Supabase ainda exige confirmação por e-mail. Desligue “Confirm email” em Authentication > Providers > Email e tente de novo.";
    else m.textContent = "";
  } finally { for (const b of $$(".auth-acts .btn")) b.disabled = false }
}
async function onSession(session) {
  const was = user && user.id;
  user = session ? session.user : null; sessionKnown = true;
  if (!user) { games = []; profile = null; loaded = false; fr = newFr(); unsubRT(); route(); return }
  if (was === user.id) return;
  loaded = false; route(); await loadAll(); loadFriends(); subscribeRT();
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
function show(t) {
  tab = TABS.includes(t) ? t : "perfil";
  for (const b of $$("nav.tabs button")) b.setAttribute("aria-selected", b.dataset.tab === tab);
  $("#who-btn").classList.toggle("on", tab === "perfil");
  for (const s of $$("main.wrap > section")) s.hidden = s.id !== tab;
  if (tab === "amigos" && user) loadFriends();
  if (tab === "desejos" && loaded) refreshPrices(false);
  render(); window.scrollTo({ top: 0 });
}
function render() {
  if ($("#app").hidden) return;
  $("#who-av").innerHTML = avatar(profile && profile.avatar); $("#who-name").textContent = nick();
  if (tab === "perfil") renderProfile(); else if (tab === "catalogo") renderCatalog(); else if (tab === "galeria") renderGallery();
  else if (tab === "amigos") renderFriends(); else if (tab === "tier") renderTier(); else if (tab === "desejos") renderWishlist(); else renderSummary();
}

/* ---------- eventos ---------- */
document.addEventListener("click", async e => {
  const t = e.target, c = s => t.closest(s); let b;
  if (b = c("nav.tabs button")) { location.hash = b.dataset.tab; return }
  if (c("#who-btn")) { location.hash = "perfil"; return }
  if (c("#theme-btn")) { setTheme(curTheme() === "light" ? "dark" : "light"); return }
  if (c("#logout")) { await sb.auth.signOut(); location.hash = ""; return }
  if (b = c("[data-go]")) { location.hash = b.dataset.go; return }
  if (b = c("[data-prices]")) { openPrices(b.dataset.prices); return }
  if (b = c("[data-refresh-price]")) { const id = b.dataset.refreshPrice, inModal = !!c(".modal"); await refreshPrices(true, id); if (inModal && $("#modal .modal")) openPrices(id); return }
  if (b = c("[data-target-save]")) { const v = num($("#tp").value); await save(b.dataset.targetSave, { target_price: v }); toast(v == null ? "Preço-alvo removido." : `Preço-alvo salvo: ${money(v, (gameById(b.dataset.targetSave).price || {}).currency || "BRL")}.`); closeModal(); return }
  if (b = c("[data-open]")) { openForm(b.dataset.open); return }
  if (b = c("[data-act]")) {
    const a = b.dataset.act;
    if (a === "edit-profile") openProfileEditor(); else if (a === "add") openSearch();
    else if (a === "manual") { const q = $("#s-q"); openForm(null, { ...(modalShell.preset || {}), name: q ? q.value.trim() : "" }) }
    else if (a === "copy-link") copyText($("#pe-link").value);
    else if (a === "share-profile") shareProfile();
    return;
  }
  if (c("#add")) { openSearch(); return }
  if (c("#add-wish") || c("#add-wish2")) { openSearch({ wishlist: true, status: "Não comprado" }); return }
  if (c("#wl-refresh")) { refreshPrices(true); return }
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
  if (t.hasAttribute && t.hasAttribute("data-ovl") || c("[data-close]")) { closeModal(); return }
  if (c("#s-go")) { runSearch(); return }
  if (b = c("[data-pick]")) { const s = found[+b.dataset.pick]; openForm(null, { ...(modalShell.preset || {}), ...s }); return }
  if (c("#m-save")) { doSave(); return }
  if (c("#m-up")) { $("#m-file").click(); return }
  if (c("#m-rm")) { $("#m-cover").value = ""; refreshPrev(); return }
  if (c("#m-del")) { const d = c("#m-del"); if (!d.dataset.sure) { d.dataset.sure = 1; d.textContent = "Confirmar remoção"; return } await removeGame($("#modal .f").dataset.id); closeModal(); return }
  if (b = c("[data-preset]")) { pe.avatar = "preset:" + b.dataset.preset; $("#pe-av").innerHTML = avatar(pe.avatar); for (const x of $$("#pe-presets button")) x.setAttribute("aria-pressed", x === b); return }
  if (c("#pe-up")) { $("#pe-file").click(); return }
  if (c("#pe-bup")) { $("#pe-bfile").click(); return }
  if (c("#pe-brm")) { pe.banner = ""; $("#pe-ban").style.backgroundImage = ""; return }
  if (c("#pe-save")) {
    if (busy) return; busy = true;
    const patch = { nickname: $("#pe-nick").value.trim() || null, bio: $("#pe-bio").value.trim() || null, avatar: pe.avatar, banner: pe.banner || null, favorites: pe.favorites, now_playing: $("#pe-cur").value || null };
    if ($("#pe-pub")) patch.is_public = $("#pe-pub").checked;
    const ok = await saveProfile(patch);
    busy = false; if (ok) { closeModal(); if (patch.is_public) toast("Perfil público. Use “Compartilhar” para enviar o link.") } return;
  }
});
document.addEventListener("change", e => {
  const s = e.target;
  if (s.matches(".row select[data-f]")) save(s.closest(".row").dataset.id, { [s.dataset.f]: s.value });
  else if (s.id === "sort" || s.id === "plat") render();
  else if (s.id === "wl-sort") { wlSort = s.value; render() }
  else if (s.id === "csv-file" && s.files[0]) { importCSV(s.files[0]); s.value = "" }
  else if (s.id === "m-file" && s.files[0]) {
    const msg = $("#m-cmsg"); msg.textContent = "Enviando…";
    uploadImage(s.files[0], "cover").then(u => { $("#m-cover").value = u; refreshPrev(); msg.textContent = "Capa enviada." }).catch(() => msg.textContent = "Não foi possível enviar. Use JPG, PNG ou WebP de até 15 MB.");
  }
  else if (s.id === "m-status" && s.value === "Finalizado" && !$("#m-fin").value) $("#m-fin").value = new Date().toISOString().slice(0, 10);
  else if (s.id === "pe-file" && s.files[0]) peUpload(s.files[0], "avatar");
  else if (s.id === "pe-bfile" && s.files[0]) peUpload(s.files[0], "banner");
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
  else if (id === "pe-q") renderPicker();
  else if (id === "m-cover" || id === "m-name") refreshPrev();
  else if (id === "s-q") { clearTimeout(searchTimer); if (e.target.value.trim().length >= 3) searchTimer = setTimeout(runSearch, 450) }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("#modal").innerHTML) closeModal();
  if (e.key === "Enter" && e.target.id === "s-q") { e.preventDefault(); clearTimeout(searchTimer); runSearch() }
});
$("#auth-form").addEventListener("submit", e => { e.preventDefault(); doAuth(false) });
$("#a-signup").addEventListener("click", () => doAuth(true));

/* arrastar e soltar (tier list) */
let dragId = null;
document.addEventListener("dragstart", e => { const b = e.target.closest && e.target.closest("#tier [data-tc]"); if (b) { dragId = b.dataset.tc; e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move" } });
document.addEventListener("dragover", e => { const z = e.target.closest && e.target.closest("#tier .zone"); if (z && dragId) { e.preventDefault(); for (const o of $$(".zone.over")) if (o !== z) o.classList.remove("over"); z.classList.add("over") } });
document.addEventListener("dragleave", e => { const z = e.target.closest && e.target.closest(".zone"); if (z && !z.contains(e.relatedTarget)) z.classList.remove("over") });
document.addEventListener("drop", e => { const z = e.target.closest && e.target.closest("#tier .zone"); if (!z || !dragId) return; e.preventDefault(); z.classList.remove("over"); const bf = e.target.closest("[data-tc]"); setTier(dragId, z.dataset.tier || null, bf && bf.dataset.tc !== dragId ? bf.dataset.tc : null); dragId = null; selected = null });
document.addEventListener("dragend", () => { dragId = null; for (const o of $$(".zone.over")) o.classList.remove("over") });
window.addEventListener("hashchange", route);

/* ---------- amigos e grupos ---------- */
function newFr() { return { rows: [], profs: {}, groups: [], members: [], loaded: false, found: null, fmsg: "", q: "" } }
let fr = newFr(), gBusy = false;
const other = f => f.requester === user.id ? f.addressee : f.requester;
const pOf = id => fr.profs[id] || { user_id: id, username: "usuário", nickname: "" };
const pName = p => p.nickname || p.username || "usuário";
const frAccepted = () => fr.rows.filter(f => f.status === "accepted");
const frIn = () => fr.rows.filter(f => f.status === "pending" && f.addressee === user.id);
const frOut = () => fr.rows.filter(f => f.status === "pending" && f.requester === user.id);
const frRel = id => fr.rows.find(f => other(f) === id);

async function loadFriends() {
  if (!sb || !user) return;
  const [a, b, c] = await Promise.all([sb.from("friendships").select("*"), sb.from("groups").select("*"), sb.from("group_members").select("*")]);
  if (a.error || b.error || c.error) { toast("Não foi possível carregar os amigos."); return }
  fr.rows = a.data || []; fr.groups = b.data || []; fr.members = c.data || [];
  const ids = [...new Set([...fr.rows.map(other), ...fr.members.map(m => m.user_id), ...fr.groups.map(g => g.owner)])].filter(x => x !== user.id);
  fr.profs = {};
  if (ids.length) {
    const p = await sb.from("profiles").select("user_id,username,nickname,avatar,banner,bio,favorites,now_playing").in("user_id", ids);
    (p.data || []).forEach(x => fr.profs[x.user_id] = x);
  }
  fr.loaded = true; updateBadge(); if (tab === "amigos") renderFriends();
}
function updateBadge() { const b = $("#fr-badge"); if (!b) return; const n = user ? frIn().length : 0; b.hidden = !n; b.textContent = n }
function subscribeRT() {
  if (!sb || !sb.channel || !user) return; unsubRT();
  try {
    rt = sb.channel("amigos-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, p => {
        const r = p.new || {};
        if (p.eventType === "INSERT" && r.addressee === user.id) toast("Você recebeu um pedido de amizade!");
        if (p.eventType === "UPDATE" && r.requester === user.id && r.status === "accepted") toast("Seu pedido de amizade foi aceito!");
        loadFriends();
      }).subscribe();
  } catch (e) { rt = null }
}
function unsubRT() { if (rt && sb) { try { sb.removeChannel(rt) } catch (e) { } } rt = null; updateBadge() }

function person(p, extra = "", attrs = "") {
  return `<div class="fcard"><div class="av md"${attrs}>${avatar(p.avatar)}</div><div class="fi"><div class="fn">${esc(pName(p))}</div><div class="fu">@${esc(p.username || "")}</div></div><div class="fa">${extra}</div></div>`;
}
function renderFriends() {
  const el = $("#amigos");
  if (!fr.loaded) { el.innerHTML = `<div class="sec-head"><div><h2 class="h">Amigos</h2></div></div><div class="flist">${Array.from({ length: 3 }, () => `<div class="sk" style="height:74px;border-radius:16px"></div>`).join("")}</div>`; return }
  const fl = frAccepted(), inc = frIn(), out = frOut();
  let found = "";
  if (fr.found) {
    const f = fr.found, rr2 = frRel(f.user_id);
    const st = f.user_id === user.id ? `<span class="muted">Esse é você</span>` : rr2 ? `<span class="muted">${rr2.status === "accepted" ? "Já são amigos" : "Pedido pendente"}</span>` : `<button class="btn sm" data-fr="request" data-id="${f.user_id}">${ic("userplus")}Enviar pedido</button>`;
    found = `<div style="margin-top:8px">${person(f, st)}</div>`;
  } else if (fr.fmsg) found = `<div class="muted" style="margin:10px 6px 4px">${esc(fr.fmsg)}</div>`;
  const section = (title, n, body) => `<div class="blk"><div class="blk-h"><h3>${title}${n != null ? ` <span class="muted">· ${n}</span>` : ""}</h3></div>${body}</div>`;
  const incHTML = inc.length ? section(ic("userplus") + "Pedidos recebidos", inc.length, `<div class="flist">${inc.map(f => person(pOf(f.requester), `<button class="btn sm" data-fr="accept" data-id="${f.id}">${ic("check")}Aceitar</button><button class="btn ghost sm" data-fr="remove" data-id="${f.id}">Recusar</button>`)).join("")}</div>`) : "";
  const outHTML = out.length ? section(ic("clock") + "Pedidos enviados", out.length, `<div class="flist">${out.map(f => person(pOf(f.addressee), `<button class="btn ghost sm" data-fr="remove" data-id="${f.id}">Cancelar</button>`)).join("")}</div>`) : "";
  const friendsHTML = section(ic("users") + "Meus amigos", fl.length, fl.length ? `<div class="flist">${fl.map(f => { const p = pOf(other(f)); return person(p, `<button class="btn ghost sm" data-fr="view" data-id="${p.user_id}">Ver perfil</button><button class="iconbtn" data-fr="unfriend" data-id="${f.id}" aria-label="Remover ${esc(pName(p))}" title="Remover amigo">${ic("trash")}</button>`) }).join("")}</div>` : `<div class="panel empty"><b>Nenhum amigo ainda</b>Busque pelo usuário de quem usa o site e envie um pedido.</div>`);
  const groupsHTML = section(ic("layers") + "Grupos", fr.groups.length, (fr.groups.length ? `<div class="gwrap">${fr.groups.map(g => { const ms = fr.members.filter(m => m.group_id === g.id); return `<button class="gcard" data-fr="group" data-id="${g.id}"><div class="gn">${esc(g.name)}</div><div class="stackav">${ms.slice(0, 5).map(m => `<div class="av xs">${avatar(m.user_id === user.id ? profile && profile.avatar : pOf(m.user_id).avatar)}</div>`).join("")}</div><div class="muted">${ms.length} membro${ms.length === 1 ? "" : "s"}${g.owner === user.id ? " · você é o dono" : ""}</div></button>` }).join("")}</div>` : `<div class="panel empty"><b>Nenhum grupo</b>Crie um grupo e chame seus amigos.</div>`));
  el.innerHTML = `<div class="sec-head"><div><h2 class="h">Amigos</h2><p class="muted">Adicione quem também usa o Jogos Enzola.</p></div><button class="btn" data-fr="newgroup">${ic("plus")}Novo grupo</button></div>
  <div class="panel"><div class="bar" style="margin:0"><span class="inp grow">${ic("search")}<input type="search" id="fq" placeholder="Usuário do seu amigo (ex.: enzola)" value="${esc(fr.q)}"></span><button class="btn" data-fr="search">${ic("userplus")}Buscar</button></div>${found}</div>
  ${incHTML}${friendsHTML}${outHTML}${groupsHTML}`;
}

async function frSearch() {
  fr.q = $("#fq").value; const u = fr.q.trim().replace(/^@/, "").toLowerCase();
  if (!u) { toast("Digite o usuário do seu amigo."); return }
  const { data, error } = await sb.rpc("find_user", { uname: u });
  if (error) { toast("Não foi possível buscar agora."); return }
  fr.found = data && data[0] ? data[0] : null; fr.fmsg = fr.found ? "" : "Nenhum usuário encontrado com esse nome. Confira se ele já entrou no site.";
  if (fr.found) fr.profs[fr.found.user_id] = fr.profs[fr.found.user_id] || fr.found;
  renderFriends();
}
async function frDo(q, ok) {
  const { error } = await q;
  if (error) { toast("Não foi possível concluir. Tente de novo."); return false }
  if (ok) toast(ok); await loadFriends(); return true;
}

async function openFriend(uid) {
  const p = pOf(uid);
  modalShell(`<div class="banner sm sk"></div><div class="fv-head"><div class="av lg sk"></div></div><div class="sk" style="height:120px;border-radius:14px;margin-top:20px"></div>`, true);
  const { data } = await sb.from("games").select("*").eq("user_id", uid).order("n");
  if (!$("#modal .modal")) return;
  const gs = data || [], fin = gs.filter(g => g.status === "Finalizado").length;
  const favs = (p.favorites || []).map(id => gs.find(g => g.id === id)).filter(Boolean).slice(0, 5);
  const cur = gs.find(g => g.id === p.now_playing) || gs.find(g => g.status === "Jogando");
  const mine = new Map(games.map(g => [norm(g.name), g]));
  const common = gs.filter(g => mine.has(norm(g.name)));
  const both = common.filter(g => g.rating != null && mine.get(norm(g.name)).rating != null);
  const agree = both.length ? Math.round(both.filter(g => Math.abs(g.rating - mine.get(norm(g.name)).rating) <= 1).length / both.length * 100) : null;
  modalShell(`${bannerHTML(p, cur, "sm")}</div>
  <div class="fv-head"><div class="av lg">${avatar(p.avatar)}</div><div><h2 style="margin:0">${esc(pName(p))}</h2><div class="muted">@${esc(p.username || "")}</div></div></div>
  ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ""}
  <div class="pstats" style="margin:14px 0"><div class="pstat"><b>${gs.length}</b><span>Jogos</span></div><div class="pstat"><b>${fin}</b><span>Zerados</span></div><div class="pstat"><b>${common.length}</b><span>Em comum</span></div>${agree != null ? `<div class="pstat"><b>${agree}%</b><span>Notas parecidas</span></div>` : ""}</div>
  ${cur ? `<div class="muted" style="margin-bottom:12px">Jogando agora: <b style="color:var(--fg)">${esc(cur.name)}</b></div>` : ""}
  ${favs.length ? `<div class="fld" style="margin-bottom:8px">Favoritos</div><div class="wmini" style="grid-template-columns:repeat(5,minmax(0,1fr));padding:0 0 16px">${favs.map(g => `<div title="${esc(g.name)}"><div class="poster">${cover(g)}</div></div>`).join("")}</div>` : ""}
  ${common.length ? `<div class="fld" style="margin-bottom:8px">Jogos em comum · ${common.length}</div><div class="cmn">${common.slice(0, 12).map(g => { const m = mine.get(norm(g.name)); return `<div class="cmr"><span class="mini">${cover(g)}</span><span class="cmn-n">${esc(g.name)}</span><span class="cmn-s"><span>Você <b>${rateTxt(m)}</b></span><span>${esc(pName(p))} <b>${rateTxt(g)}</b></span></span></div>` }).join("")}</div>` : `<div class="muted">Vocês ainda não têm jogos em comum.</div>`}
  <div class="acts"><button class="btn ghost" data-close>Fechar</button></div>`, true);
}

function openNewGroup() {
  const fl = frAccepted();
  modalShell(`<h2>Novo grupo</h2><p class="sub">Dê um nome e escolha amigos para entrar.</p>
  <div class="f"><label>Nome do grupo<input type="text" id="g-name" maxlength="40" placeholder="Ex.: Squad de sábado"></label>
  <div><div class="fld" style="margin-bottom:6px">Amigos</div><div class="picker">${fl.length ? fl.map(f => { const p = pOf(other(f)); return `<label class="pk"><input type="checkbox" data-gk="${p.user_id}"><span class="av xs">${avatar(p.avatar)}</span><span>${esc(pName(p))} <span class="muted">@${esc(p.username || "")}</span></span></label>` }).join("") : `<div class="empty" style="padding:16px">Você ainda não tem amigos. Pode criar o grupo e adicionar depois.</div>`}</div></div></div>
  <div class="acts"><button class="btn ghost" data-close>Cancelar</button><button class="btn" data-fr="gcreate">Criar grupo</button></div>`);
  $("#g-name").focus();
}
function openGroup(gid) {
  const g = fr.groups.find(x => x.id === gid); if (!g) { closeModal(); return }
  const own = g.owner === user.id, ms = fr.members.filter(m => m.group_id === gid);
  const addable = frAccepted().map(f => pOf(other(f))).filter(p => !ms.some(m => m.user_id === p.user_id));
  modalShell(`<h2>${esc(g.name)}</h2><p class="sub">${ms.length} membro${ms.length === 1 ? "" : "s"}</p>
  <div class="flist">${ms.map(m => { const me = m.user_id === user.id, p = me ? { ...(profile || {}), username: uname() } : pOf(m.user_id); const isF = !me && frAccepted().some(f => other(f) === m.user_id);
    return person(p, `${m.user_id === g.owner ? `<span class="badge st-Jogando">dono</span>` : ""}${isF ? `<button class="btn ghost sm" data-fr="view" data-id="${m.user_id}">Perfil</button>` : ""}${own && !me ? `<button class="iconbtn" data-fr="gkick" data-gid="${gid}" data-id="${m.user_id}" aria-label="Remover do grupo">${ic("x")}</button>` : ""}`) }).join("")}</div>
  ${own ? `<div class="bar" style="margin:14px 0 0"><select class="grow" id="g-add"><option value="">Adicionar amigo…</option>${addable.map(p => `<option value="${p.user_id}">${esc(pName(p))} (@${esc(p.username || "")})</option>`).join("")}</select><button class="btn" data-fr="gadd" data-gid="${gid}">Adicionar</button></div>` : ""}
  <div class="acts">${own ? `<button class="btn danger left" data-fr="gdel" data-gid="${gid}">${ic("trash")}Excluir grupo</button>` : `<button class="btn danger left" data-fr="gleave" data-gid="${gid}">Sair do grupo</button>`}<button class="btn ghost" data-close>Fechar</button></div>`);
}

document.addEventListener("click", async e => {
  const b = e.target.closest("[data-fr]"); if (!b) return;
  const a = b.dataset.fr, id = b.dataset.id, gid = b.dataset.gid;
  if (a === "search") return frSearch();
  if (a === "request") { await frDo(sb.from("friendships").insert({ addressee: id }), "Pedido enviado!"); fr.found = null; renderFriends(); return }
  if (a === "accept") return frDo(sb.from("friendships").update({ status: "accepted" }).eq("id", id), "Agora vocês são amigos!");
  if (a === "remove") return frDo(sb.from("friendships").delete().eq("id", id));
  if (a === "unfriend") { if (!b.dataset.sure) { b.dataset.sure = 1; b.classList.add("sure"); toast("Clique de novo para remover este amigo."); return } return frDo(sb.from("friendships").delete().eq("id", id), "Amigo removido.") }
  if (a === "view") return openFriend(id);
  if (a === "newgroup") return openNewGroup();
  if (a === "group") return openGroup(id);
  if (a === "gcreate") {
    const name = $("#g-name").value.trim(); if (!name) { toast("Dê um nome ao grupo."); return }
    if (gBusy) return; gBusy = true;
    try {
      const { data, error } = await sb.from("groups").insert({ name }).select().single();
      if (error) { toast("Não foi possível criar o grupo."); return }
      const ids = [user.id, ...$$("[data-gk]:checked").map(x => x.dataset.gk)];
      const r = await sb.from("group_members").insert(ids.map(u => ({ group_id: data.id, user_id: u })));
      if (r.error) toast("Grupo criado, mas alguns membros não entraram.");
      else toast("Grupo criado!");
      await loadFriends(); openGroup(data.id);
    } finally { gBusy = false }
    return;
  }
  if (a === "gadd") { const u = $("#g-add").value; if (!u) return; if (await frDo(sb.from("group_members").insert({ group_id: gid, user_id: u }), "Membro adicionado.")) openGroup(gid); return }
  if (a === "gkick") { if (await frDo(sb.from("group_members").delete().eq("group_id", gid).eq("user_id", id))) openGroup(gid); return }
  if (a === "gleave") { if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "Confirmar saída"; return } await frDo(sb.from("group_members").delete().eq("group_id", gid).eq("user_id", user.id), "Você saiu do grupo."); closeModal(); return }
  if (a === "gdel") { if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "Confirmar exclusão"; return } await frDo(sb.from("groups").delete().eq("id", gid), "Grupo excluído."); closeModal(); return }
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "fq") { e.preventDefault(); frSearch() } });

/* ---------- início ---------- */
setTheme(curTheme());
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => { }));
if (!window.supabase || !CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes("COLE_AQUI")) {
  sessionKnown = true; showAuth(true, "Configure o endereço e a chave do Supabase no arquivo config.js.");
} else {
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  sb.auth.onAuthStateChange((_ev, session) => { setTimeout(() => onSession(session), 0) });
  sb.auth.getSession().then(({ data }) => { if (!data.session && !sessionKnown) onSession(null) });
  route();
}
