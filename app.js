/* Jogos Enzola — app (Supabase + RAWG) */
const CFG = window.APP_CONFIG || {};
const STATUS = ["Finalizado", "Jogando", "Não iniciado", "Não comprado"];
const EXPS = ["Perfeito", "Ótimo", "Muito bom", "Bom", "Ok", "Meh", "Chumbos"];
const EXPCOL = { "Perfeito": "#2E8B6A", "Ótimo": "#4C9F7A", "Muito bom": "#6FA8DC", "Bom": "#4B6B9E", "Ok": "#C9A227", "Meh": "#D98A3D", "Chumbos": "#B14A47" };
const TIERS = [["S", "#F28B82"], ["A", "#F6B26B"], ["B", "#F5DC78"], ["C", "#A8D5A2"], ["D", "#9CC0F5"]];
const PLATS = ["PC", "PlayStation", "Xbox", "Switch", "Outro"];
const TABS = ["perfil", "catalogo", "galeria", "tier", "desejos", "resumo"];
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
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ic = (n, cls = "") => `<svg class="ic ${cls}"><use href="#i-${n}"/></svg>`;
const sk = s => s.replace("ã", "a").replace(/ /g, "-");
const stClass = s => "st-" + sk(s || "Não iniciado");
const rateTxt = g => g.rating == null || g.rating === "" ? "—" : Number(g.rating).toFixed(1).replace(".0", "");
function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
function rel(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "agora há pouco";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  if (s < 86400 * 30) return `há ${Math.floor(s / 86400)} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

let sb = null, user = null, games = [], profile = null, loaded = false;
let tab = "perfil", fStatus = "", gStatus = "", tStatus = "played", selected = null;
let found = [], busy = false, pe = null;

function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 3800) }
const uname = () => user ? (user.email || "").split("@")[0] : "";
const nick = () => (profile && profile.nickname) || uname();
const gameById = id => games.find(g => g.id === id);
const wishlist = () => games.filter(g => g.wishlist || g.status === "Não comprado");

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
  const dims = { avatar: [320, 320], banner: [1400, 460], cover: [480, 720] }[kind];
  const blob = await resizeImage(file, dims[0], dims[1]);
  const path = `${user.id}/${kind}-${Date.now()}.jpg`;
  const { error } = await sb.storage.from("media").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/* ---------- dados ---------- */
async function loadAll() {
  const [g, p] = await Promise.all([
    sb.from("games").select("*").order("n", { ascending: true }),
    sb.from("profiles").select("*").maybeSingle(),
  ]);
  if (g.error) { toast("Não foi possível carregar os jogos."); return }
  games = g.data; profile = p.data || null; loaded = true; render();
}
async function save(id, patch) {
  const g = gameById(id); if (!g) return;
  const now = new Date().toISOString();
  if (patch.status === "Finalizado" && g.status !== "Finalizado") patch.finished_at = now;
  const ratingChanged = "rating" in patch && patch.rating != null && patch.rating !== g.rating;
  const reviewChanged = "review" in patch && patch.review && patch.review !== g.review;
  if (ratingChanged || reviewChanged) patch.rated_at = now;
  Object.assign(g, patch); render();
  const { error } = await sb.from("games").update(patch).eq("id", id);
  if (error) { toast("Erro ao salvar. Recarregando…"); loadAll() }
}
async function create(data) {
  const n = games.reduce((m, g) => Math.max(m, g.n || 0), 0) + 1;
  const row = { n, name: "", status: "Não iniciado", exp: "", ...data };
  if (row.status === "Finalizado") row.finished_at = new Date().toISOString();
  if (row.rating != null || row.review) row.rated_at = new Date().toISOString();
  const { data: ins, error } = await sb.from("games").insert(row).select().single();
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
  const row = { user_id: user.id, nickname: next.nickname ?? null, bio: next.bio ?? null, avatar: next.avatar ?? null, banner: next.banner ?? null, favorites: next.favorites || [], now_playing: next.now_playing ?? null, updated_at: new Date().toISOString() };
  const { data, error } = await sb.from("profiles").upsert(row, { onConflict: "user_id" }).select().single();
  if (error) { toast("Não foi possível salvar o perfil."); return false }
  profile = data; render(); return true;
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
  if (!loaded) { el.innerHTML = `<div class="panel empty"><b>Carregando seu perfil…</b></div>`; return }
  const p = profile || {};
  const favIds = (p.favorites || []).filter(id => gameById(id)).slice(0, 5);
  const favs = favIds.map(gameById);
  const cur = gameById(p.now_playing) || games.find(g => g.status === "Jogando");
  const fin = games.filter(g => g.status === "Finalizado").length;
  const rated = games.filter(g => g.rating != null && g.rating !== "");
  const avg = rated.length ? (rated.reduce((a, g) => a + Number(g.rating), 0) / rated.length).toFixed(1) : "—";
  const revs = games.filter(g => g.review && g.review.trim()).sort((a, b) => new Date(b.rated_at || 0) - new Date(a.rated_at || 0)).slice(0, 4);
  const wl = wishlist(), act = activity();
  const bannerStyle = p.banner ? `style="background-image:url('${esc(p.banner)}')"` : "";
  const slots = [];
  for (let i = 0; i < 5; i++) {
    const g = favs[i];
    slots.push(g ? `<button class="fav" data-open="${g.id}"><div class="poster"><span class="rank">${i + 1}</span>${cover(g)}</div><div class="n">${esc(g.name)}</div><div class="r">${g.exp ? esc(g.exp) : "Sem experiência"}${g.rating != null ? " · " + rateTxt(g) : ""}</div></button>`
      : `<button class="fav slot" data-act="edit-profile" aria-label="Escolher um favorito"><div class="poster">${ic("plus")}</div></button>`);
  }
  const actText = e => e.k === "fin" ? `Zerou <b>${esc(e.g.name)}</b>` : e.k === "rate" ? `Avaliou <b>${esc(e.g.name)}</b>${e.g.rating != null ? " com nota " + rateTxt(e.g) : ""}` : `Adicionou <b>${esc(e.g.name)}</b>`;
  const actIcon = e => e.k === "fin" ? ["fin", "trophy"] : e.k === "rate" ? ["rate", "star"] : ["add", "plus"];
  el.innerHTML = `
  <div class="banner" ${bannerStyle}>${p.banner ? "" : `<span class="logo wm" aria-hidden="true"></span>`}
    <button class="btn ghost sm edit" data-act="edit-profile">${ic("pencil")}Editar perfil</button></div>
  <div class="phead">
    <div class="av lg">${avatar(p.avatar)}</div>
    <div class="pid"><h1>${esc(nick())}</h1><div class="un">@${esc(uname())}</div></div>
    <div class="pstats">
      <div class="pstat"><b>${games.length}</b><span>Jogos</span></div>
      <div class="pstat"><b>${fin}</b><span>Zerados</span></div>
      <div class="pstat"><b>${avg}</b><span>Nota média</span></div>
    </div>
  </div>
  <p class="bio ${p.bio ? "" : "empty-bio"}">${p.bio ? esc(p.bio) : "Escreva uma pequena descrição sobre você em “Editar perfil”."}</p>

  <div class="pgrid">
    <div>
      <div class="blk"><div class="blk-h"><h3>${ic("play")}Jogo do momento</h3><button class="link" data-act="edit-profile">Alterar</button></div>
        ${cur ? `<button class="now" data-open="${cur.id}"><div class="poster">${cover(cur)}</div><div class="now-b"><span class="k">Jogando agora</span><span class="t">${esc(cur.name)}</span>
          <span class="m">${[cur.platform, cur.genre, cur.year].filter(Boolean).map(esc).join(" · ") || "&nbsp;"}</span>
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

      <div class="blk"><div class="blk-h"><h3>${ic("bookmark")}Lista de desejos</h3><button class="link" data-go="desejos">Ver tudo</button></div>
        <div class="panel">${wl.length ? `<div class="wmini">${wl.slice(0, 6).map(g => `<button data-open="${g.id}" title="${esc(g.name)}"><div class="poster">${cover(g)}</div></button>`).join("")}</div>`
      : `<div class="empty" style="padding:24px 12px"><b>Lista vazia</b>Guarde aqui o que quer jogar depois.</div>`}</div></div>
    </aside>
  </div>`;
}

/* ---------- catálogo ---------- */
function renderCatalog() {
  $("#fchips").innerHTML = chipsHTML(fStatus, "f");
  $("#cat-sub").textContent = loaded ? `${games.length} jogos na sua biblioteca` : "";
  const q = $("#q").value.trim().toLowerCase(), favs = (profile && profile.favorites) || [];
  const list = sorted(games.filter(g => (!fStatus || g.status === fStatus) && (!q || g.name.toLowerCase().includes(q))), $("#sort").value);
  const box = $("#list");
  if (!loaded) { box.innerHTML = `<div class="empty"><b>Carregando sua biblioteca…</b></div>`; return }
  if (!games.length) { box.innerHTML = `<div class="empty"><b>Nenhum jogo ainda</b>Adicione o primeiro jogo da sua biblioteca.<br><button class="btn sm" data-act="add">${ic("plus")}Adicionar jogo</button></div>`; return }
  if (!list.length) { box.innerHTML = `<div class="empty"><b>Nada encontrado</b>Tente outro nome ou filtro.</div>`; return }
  box.innerHTML = `<div class="row head"><span>Nº</span><span></span><span>Jogo</span><span>Status</span><span>Experiência</span><span style="text-align:center">Nota</span><span></span></div>` +
    list.map(g => `<div class="row" data-id="${g.id}">
      <span class="num">${g.n ?? ""}</span><div class="mini">${cover(g)}</div>
      <div class="nmbox" style="min-width:0"><div class="nm">${esc(g.name)}${favs.includes(g.id) ? ic("heart", "fill") : ""}${g.wishlist ? ic("bookmark", "w") : ""}</div>
        <div class="meta">${[g.platform, g.genre, g.year].filter(Boolean).map(esc).join(" · ")}${g.notes ? ([g.platform, g.genre, g.year].some(Boolean) ? " · " : "") + esc(g.notes) : ""}</div></div>
      <div class="stbox"><select class="stsel ${stClass(g.status)}" data-f="status" aria-label="Status de ${esc(g.name)}">${STATUS.map(s => `<option${s === g.status ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="exbox"><select data-f="exp" aria-label="Experiência de ${esc(g.name)}"><option value="">—</option>${EXPS.map(s => `<option${s === g.exp ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <span class="rate">${rateTxt(g)}</span>
      <button class="iconbtn" data-open="${g.id}" aria-label="Editar ${esc(g.name)}">${ic("pencil")}</button></div>`).join("");
}

/* ---------- galeria e desejos ---------- */
function renderGallery() {
  $("#gchips").innerHTML = chipsHTML(gStatus, "g");
  const list = sorted(games.filter(g => !gStatus || g.status === gStatus), "n");
  $("#grid").innerHTML = !loaded ? `<div class="empty"><b>Carregando…</b></div>` : !list.length
    ? `<div class="panel empty" style="grid-column:1/-1"><b>Galeria vazia</b>Adicione jogos para ver as capas aqui.</div>`
    : list.map(g => `<button class="card" data-open="${g.id}"><div class="poster"><span class="tag badge ${stClass(g.status)}">${esc(g.status)}</span>${cover(g)}<div class="ov"><span class="badge st-Finalizado" style="visibility:${g.exp ? "visible" : "hidden"}">${esc(g.exp)}</span><span class="rate">${rateTxt(g)}</span></div></div><div class="t">${esc(g.name)}</div></button>`).join("");
}
function renderWishlist() {
  const list = wishlist();
  $("#wgrid").innerHTML = !loaded ? `<div class="empty"><b>Carregando…</b></div>` : !list.length
    ? `<div class="panel empty" style="grid-column:1/-1"><b>Sua lista está vazia</b>Adicione jogos que você quer jogar ou comprar depois.</div>`
    : list.map(g => `<div><button class="card" data-open="${g.id}"><div class="poster">${cover(g)}</div><div class="t">${esc(g.name)}</div></button>
      <div class="wact"><button class="btn ghost sm" data-bought="${g.id}">${ic("check")}Já comprei</button></div></div>`).join("");
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

/* ---------- resumo ---------- */
function renderSummary() {
  const el = $("#resumo");
  if (!loaded || !games.length) { el.innerHTML = `<div class="panel empty"><b>${loaded ? "Sem dados ainda" : "Carregando…"}</b>${loaded ? "Adicione jogos para ver os gráficos." : ""}</div>`; return }
  const cnt = s => games.filter(g => g.status === s).length;
  const rated = games.filter(g => g.rating != null && g.rating !== "");
  const avg = rated.length ? rated.reduce((a, g) => a + Number(g.rating), 0) / rated.length : null;
  const colors = { "Finalizado": "var(--fin)", "Jogando": "var(--play)", "Não iniciado": "var(--todo)", "Não comprado": "var(--nobuy)" };
  let acc = 0; const segs = STATUS.map(s => { const p = cnt(s) / games.length * 100; const r = `${colors[s]} ${acc}% ${acc + p}%`; acc += p; return r }).join(",");
  const ec = EXPS.map(e => [e, games.filter(g => g.exp === e).length]), mx = Math.max(1, ...ec.map(x => x[1]));
  const top = sorted(rated, "rating").slice(0, 6);
  el.innerHTML = `<div class="sec-head"><div><h2 class="h">Resumo</h2><p class="muted">Seus números em um só lugar.</p></div></div>
  <div class="tiles">
    <div class="tilec"><div class="k">Jogos</div><div class="v">${games.length}</div></div>
    <div class="tilec"><div class="k">Finalizados</div><div class="v">${cnt("Finalizado")}</div></div>
    <div class="tilec"><div class="k">Concluído</div><div class="v">${Math.round(cnt("Finalizado") / games.length * 100)}%</div></div>
    <div class="tilec"><div class="k">Nota média</div><div class="v">${avg == null ? "—" : avg.toFixed(1)}</div></div>
  </div>
  <div class="two">
    <div class="panel"><h3>Por status</h3><div class="donutw"><div class="donut" role="img" aria-label="Distribuição por status" style="background:conic-gradient(${segs})"></div>
      <div class="legend">${STATUS.map(s => `<div><i style="background:${colors[s]}"></i>${s} · <b>${cnt(s)}</b></div>`).join("")}</div></div></div>
    <div class="panel"><h3>Experiência</h3><div class="bars">${ec.map(([e, n]) => `<div class="br"><span>${e}</span><div class="tr"><div class="fl" style="width:${n / mx * 100}%;background:${EXPCOL[e]}"></div></div><b>${n}</b></div>`).join("")}</div></div>
    <div class="panel"><h3>Maiores notas</h3>${top.length ? top.map(g => `<div class="toprow"><span class="nm">${esc(g.name)}</span><span class="rate">${rateTxt(g)}</span></div>`).join("") : `<div class="muted">Dê notas aos jogos para ver o ranking.</div>`}</div>
  </div>`;
}

/* ---------- modais ---------- */
function closeModal() { $("#modal").innerHTML = ""; pe = null }
function modalShell(inner, wide) { $("#modal").innerHTML = `<div class="ovl" data-ovl><div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${inner}</div></div>` }

function openSearch(preset = {}) {
  if (!CFG.RAWG_KEY) return openForm(null, preset);
  modalShell(`<h2>Adicionar jogo</h2><p class="sub">Busque o jogo para trazer capa e dados automaticamente.</p>
    <div class="bar" style="margin-bottom:0"><span class="inp grow">${ic("search")}<input type="search" id="s-q" placeholder="Nome do jogo" value="${esc(preset.name || "")}"></span><button class="btn" id="s-go">Buscar</button></div>
    <div class="sug" id="s-res"></div>
    <div class="acts"><button class="btn ghost left" data-act="manual">${ic("pencil")}Não achei, adicionar manualmente</button><button class="btn ghost" data-close>Cancelar</button></div>`);
  modalShell.preset = preset; $("#s-q").focus();
}
async function runSearch() {
  const q = $("#s-q").value.trim(); if (!q) { toast("Digite o nome do jogo."); return }
  const res = $("#s-res"); res.innerHTML = `<div class="muted">Buscando…</div>`;
  try {
    const r = await fetch(`https://api.rawg.io/api/games?key=${encodeURIComponent(CFG.RAWG_KEY)}&search=${encodeURIComponent(q)}&page_size=8`);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    found = j.results.map(x => ({ name: x.name, year: (x.released || "").slice(0, 4), genre: (x.genres || []).map(g => g.name).slice(0, 2).join(", "), platform: mapPlat(x.platforms), cover_url: x.background_image || "" }));
    res.innerHTML = found.map((s, i) => `<div class="it"><div class="ib"><div class="mini">${s.cover_url ? `<img class="cv" alt="" referrerpolicy="no-referrer" src="${esc(s.cover_url)}">` : ""}</div><div style="min-width:0"><div class="nm">${esc(s.name)}</div><div class="meta">${esc([s.year, s.genre, s.platform].filter(Boolean).join(" · "))}</div></div></div><button class="btn ghost sm" data-pick="${i}">Usar</button></div>`).join("") || `<div class="muted">Nada encontrado. Use “Adicionar manualmente”.</div>`;
  } catch (e) { res.innerHTML = `<div class="muted">Não foi possível buscar agora. Você pode adicionar manualmente.</div>` }
}
function mapPlat(list) {
  const t = (list || []).map(p => p.platform.name).join(" ");
  return /PC/.test(t) ? "PC" : /PlayStation/.test(t) ? "PlayStation" : /Xbox/.test(t) ? "Xbox" : /Nintendo/.test(t) ? "Switch" : "";
}

function openForm(id, draft = {}) {
  const g = id ? gameById(id) : { name: "", status: "Não iniciado", exp: "", rating: "", platform: "", notes: "", genre: "", year: "", cover_url: "", review: "", wishlist: false, ...draft };
  if (!g) return;
  const favs = (profile && profile.favorites) || [];
  modalShell(`<h2>${id ? "Editar jogo" : "Novo jogo"}</h2><p class="sub">${id ? esc(g.name) : "Preencha os dados do jogo."}</p>
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
    <div class="f2"><label>Gênero<input type="text" id="m-genre" value="${esc(g.genre)}"></label><label>Ano<input type="text" id="m-year" value="${esc(g.year)}"></label></div>
    <label>Sua avaliação<textarea id="m-review" rows="3" maxlength="500" placeholder="Escreva uma pequena análise sobre o jogo">${esc(g.review)}</textarea></label>
    <label>Observações<input type="text" id="m-notes" value="${esc(g.notes)}"></label>
    <div class="toggles">
      <label class="tg"><input type="checkbox" id="m-fav"${id && favs.includes(id) ? " checked" : ""}>${ic("heart")}Favorito</label>
      <label class="tg"><input type="checkbox" id="m-cur"${id && profile && profile.now_playing === id ? " checked" : ""}>${ic("play")}Jogo do momento</label>
      <label class="tg"><input type="checkbox" id="m-wish"${g.wishlist ? " checked" : ""}>${ic("bookmark")}Lista de desejos</label>
    </div></div>
  <div class="acts">${id ? `<button class="btn danger left" id="m-del">${ic("trash")}Remover jogo</button>` : ""}<button class="btn ghost" data-close>Cancelar</button><button class="btn" id="m-save">Salvar</button></div>`);
  $("#m-name").focus();
}
function refreshPrev() { const g = { name: $("#m-name").value, cover_url: $("#m-cover").value.trim() }; $("#m-prev").innerHTML = cover(g) }
async function doSave() {
  if (busy) return;
  const box = $("#modal .f"), id = box.dataset.id, r = $("#m-rating").value;
  const data = { name: $("#m-name").value.trim(), status: $("#m-status").value, exp: $("#m-exp").value, rating: r === "" ? null : Math.min(10, Math.max(0, Number(r))), platform: $("#m-plat").value, genre: $("#m-genre").value.trim(), year: $("#m-year").value.trim(), notes: $("#m-notes").value.trim(), review: $("#m-review").value.trim() || null, cover_url: $("#m-cover").value.trim() || null, wishlist: $("#m-wish").checked };
  if (!data.name) { toast("Informe o nome do jogo."); return }
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
  } finally { busy = false }
}

function openProfileEditor() {
  const p = profile || {};
  pe = { avatar: p.avatar || "preset:p1", banner: p.banner || "", favorites: ((p.favorites) || []).filter(x => gameById(x)).slice(0, 5) };
  modalShell(`<h2>Editar perfil</h2><p class="sub">@${esc(uname())}</p>
  <div class="f">
    <div class="pe-av"><div class="av md" id="pe-av">${avatar(pe.avatar)}</div>
      <div style="display:grid;gap:8px"><button class="btn ghost sm" id="pe-up">${ic("upload")}Enviar minha foto</button><input type="file" id="pe-file" accept="image/png,image/jpeg,image/webp" hidden><span class="hint">ou escolha um avatar abaixo</span></div></div>
    <div class="presets" id="pe-presets">${PRESETS.map(x => `<button type="button" data-preset="${x.k}" aria-label="Avatar ${x.k}" aria-pressed="${pe.avatar === "preset:" + x.k}"><div class="av-preset" style="background:${x.bg}">${ic(x.icon)}</div></button>`).join("")}</div>
    <div><div class="fld" style="margin-bottom:6px">Banner</div><div class="pe-ban" id="pe-ban" style="${pe.banner ? `background-image:url('${esc(pe.banner)}')` : ""}"></div>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn ghost sm" id="pe-bup">${ic("image")}Enviar banner</button><button class="btn ghost sm" id="pe-brm">${ic("trash")}Remover</button><input type="file" id="pe-bfile" accept="image/png,image/jpeg,image/webp" hidden></div></div>
    <div class="f2"><label>Nickname<input type="text" id="pe-nick" maxlength="30" value="${esc(p.nickname || "")}" placeholder="${esc(uname())}"></label>
      <label>Jogo do momento<select id="pe-cur"><option value="">Automático (jogando agora)</option>${sorted(games, "name").map(g => `<option value="${g.id}"${p.now_playing === g.id ? " selected" : ""}>${esc(g.name)}</option>`).join("")}</select></label></div>
    <label>Biografia<textarea id="pe-bio" rows="3" maxlength="200" placeholder="Conte um pouco sobre você como gamer">${esc(p.bio || "")}</textarea></label>
    <div><div class="fld" style="margin-bottom:6px">Jogos favoritos <span class="hint" id="pe-count"></span></div>
      <span class="inp" style="margin-bottom:8px">${ic("search")}<input type="search" id="pe-q" placeholder="Filtrar jogos"></span><div class="picker" id="pe-list"></div></div>
  </div>
  <div class="acts"><button class="btn ghost" data-close>Cancelar</button><button class="btn" id="pe-save">Salvar perfil</button></div>`, true);
  renderPicker();
}
function renderPicker() {
  const q = ($("#pe-q").value || "").toLowerCase();
  $("#pe-count").textContent = `${pe.favorites.length}/5 selecionados`;
  const list = sorted(games, "name").filter(g => !q || g.name.toLowerCase().includes(q));
  $("#pe-list").innerHTML = list.map(g => `<label class="pk"><input type="checkbox" data-pk="${g.id}"${pe.favorites.includes(g.id) ? " checked" : ""}><span class="mini">${cover(g)}</span><span>${esc(g.name)}</span></label>`).join("") || `<div class="empty" style="padding:16px">Nenhum jogo encontrado.</div>`;
}
async function peUpload(file, kind) {
  try {
    toast("Enviando imagem…");
    const url = await uploadImage(file, kind);
    if (kind === "avatar") { pe.avatar = url; $("#pe-av").innerHTML = avatar(url); for (const b of document.querySelectorAll("#pe-presets button")) b.setAttribute("aria-pressed", "false") }
    else { pe.banner = url; $("#pe-ban").style.backgroundImage = `url('${url}')` }
    toast("Imagem enviada. Clique em Salvar perfil.");
  } catch (e) { toast("Não foi possível enviar a imagem. Use JPG, PNG ou WebP de até 5 MB.") }
}

/* ---------- login ---------- */
function showAuth(show, msg) {
  $("#auth").hidden = !show; $("#app").hidden = show;
  if (msg !== undefined) { const m = $("#auth-msg"); m.textContent = msg; m.className = "auth-msg" }
}
async function doAuth(signup) {
  const u = $("#a-email").value.trim().toLowerCase(), pass = $("#a-pass").value, m = $("#auth-msg");
  m.className = "auth-msg";
  if (!/^[a-z0-9._-]{3,30}$/.test(u)) { m.textContent = "Usuário com 3 a 30 letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços ou acentos."; return }
  if (pass.length < 6) { m.textContent = "A senha precisa ter pelo menos 6 caracteres."; return }
  m.textContent = "Aguarde…";
  const email = u + "@gmail.com";
  const r = signup ? await sb.auth.signUp({ email, password: pass }) : await sb.auth.signInWithPassword({ email, password: pass });
  if (r.error) { m.textContent = signup ? (/registered|exists/i.test(r.error.message) ? "Esse usuário já existe. Escolha outro." : "Não foi possível criar a conta: " + r.error.message) : "Usuário ou senha incorretos."; return }
  if (signup && !r.data.session) m.textContent = "Conta criada, mas o Supabase ainda exige confirmação por e-mail. Desligue “Confirm email” em Authentication > Providers > Email e tente de novo.";
}
async function onSession(session) {
  user = session ? session.user : null;
  if (!user) { games = []; profile = null; loaded = false; showAuth(true, ""); return }
  showAuth(false); loaded = false; render(); await loadAll();
}

/* ---------- navegação ---------- */
function show(t) {
  tab = TABS.includes(t) ? t : "perfil";
  for (const b of document.querySelectorAll("nav.tabs button")) b.setAttribute("aria-selected", b.dataset.tab === tab);
  for (const s of document.querySelectorAll("main > section")) s.hidden = s.id !== tab;
  render(); window.scrollTo({ top: 0 });
}
function render() {
  $("#who-av").innerHTML = avatar(profile && profile.avatar); $("#who-name").textContent = nick();
  if (tab === "perfil") renderProfile(); else if (tab === "catalogo") renderCatalog(); else if (tab === "galeria") renderGallery();
  else if (tab === "tier") renderTier(); else if (tab === "desejos") renderWishlist(); else renderSummary();
}

/* ---------- eventos ---------- */
document.addEventListener("click", async e => {
  const t = e.target, c = s => t.closest(s); let b;
  if (b = c("nav.tabs button")) { location.hash = b.dataset.tab; return }
  if (c("#who-btn")) { location.hash = "perfil"; return }
  if (c("#logout")) { await sb.auth.signOut(); return }
  if (b = c("[data-go]")) { location.hash = b.dataset.go; return }
  if (b = c("[data-open]")) { openForm(b.dataset.open); return }
  if (b = c("[data-act]")) {
    const a = b.dataset.act;
    if (a === "edit-profile") openProfileEditor(); else if (a === "add") openSearch();
    else if (a === "manual") { const q = $("#s-q"); openForm(null, { name: q ? q.value.trim() : "", ...(modalShell.preset || {}) }) }
    return;
  }
  if (c("#add")) { openSearch(); return }
  if (c("#add-wish")) { openSearch({ wishlist: true, status: "Não comprado" }); return }
  if (b = c("[data-bought]")) { save(b.dataset.bought, { wishlist: false, status: "Não iniciado" }); toast("Movido para o catálogo como “Não iniciado”."); return }
  if (b = c("#fchips .chip")) { fStatus = b.dataset.f; render(); return }
  if (b = c("#gchips .chip")) { gStatus = b.dataset.g; render(); return }
  if (b = c("#tchips .chip")) { if (b.dataset.t === "__clear") { if (selected) setTier(selected, null); selected = null } else tStatus = b.dataset.t; render(); return }
  if (b = c("[data-tc]")) { selected = selected === b.dataset.tc ? null : b.dataset.tc; renderTier(); return }
  if (b = c(".zone")) { if (selected) { setTier(selected, b.dataset.tier || null); selected = null } return }
  /* modal */
  if (t.hasAttribute && t.hasAttribute("data-ovl") || c("[data-close]")) { closeModal(); return }
  if (c("#s-go")) { runSearch(); return }
  if (b = c("[data-pick]")) { const s = found[+b.dataset.pick]; openForm(null, { ...(modalShell.preset || {}), ...s }); return }
  if (c("#m-save")) { doSave(); return }
  if (c("#m-up")) { $("#m-file").click(); return }
  if (c("#m-rm")) { $("#m-cover").value = ""; refreshPrev(); return }
  if (c("#m-del")) { const d = c("#m-del"); if (!d.dataset.sure) { d.dataset.sure = 1; d.textContent = "Confirmar remoção"; return } await removeGame($("#modal .f").dataset.id); closeModal(); return }
  if (b = c("[data-preset]")) { pe.avatar = "preset:" + b.dataset.preset; $("#pe-av").innerHTML = avatar(pe.avatar); for (const x of document.querySelectorAll("#pe-presets button")) x.setAttribute("aria-pressed", x === b); return }
  if (c("#pe-up")) { $("#pe-file").click(); return }
  if (c("#pe-bup")) { $("#pe-bfile").click(); return }
  if (c("#pe-brm")) { pe.banner = ""; $("#pe-ban").style.backgroundImage = ""; return }
  if (c("#pe-save")) {
    if (busy) return; busy = true;
    const ok = await saveProfile({ nickname: $("#pe-nick").value.trim() || null, bio: $("#pe-bio").value.trim() || null, avatar: pe.avatar, banner: pe.banner || null, favorites: pe.favorites, now_playing: $("#pe-cur").value || null });
    busy = false; if (ok) closeModal(); return;
  }
});
document.addEventListener("change", e => {
  const s = e.target;
  if (s.matches(".row select[data-f]")) save(s.closest(".row").dataset.id, { [s.dataset.f]: s.value });
  else if (s.id === "sort") render();
  else if (s.id === "m-file" && s.files[0]) {
    const msg = $("#m-cmsg"); msg.textContent = "Enviando…";
    uploadImage(s.files[0], "cover").then(u => { $("#m-cover").value = u; refreshPrev(); msg.textContent = "Capa enviada." }).catch(() => msg.textContent = "Não foi possível enviar. Use JPG, PNG ou WebP de até 5 MB.");
  }
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
  if (e.target.id === "q") renderCatalog();
  else if (e.target.id === "pe-q") renderPicker();
  else if (e.target.id === "m-cover" || e.target.id === "m-name") refreshPrev();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && e.target.id === "s-q") { e.preventDefault(); runSearch() }
});
$("#auth-form").addEventListener("submit", e => { e.preventDefault(); doAuth(false) });
$("#a-signup").addEventListener("click", () => doAuth(true));

/* arrastar e soltar (tier list) */
let dragId = null;
document.addEventListener("dragstart", e => { const b = e.target.closest && e.target.closest("[data-tc]"); if (b) { dragId = b.dataset.tc; e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move" } });
document.addEventListener("dragover", e => { const z = e.target.closest && e.target.closest(".zone"); if (z && dragId) { e.preventDefault(); for (const o of document.querySelectorAll(".zone.over")) if (o !== z) o.classList.remove("over"); z.classList.add("over") } });
document.addEventListener("dragleave", e => { const z = e.target.closest && e.target.closest(".zone"); if (z && !z.contains(e.relatedTarget)) z.classList.remove("over") });
document.addEventListener("drop", e => { const z = e.target.closest && e.target.closest(".zone"); if (!z || !dragId) return; e.preventDefault(); z.classList.remove("over"); const bf = e.target.closest("[data-tc]"); setTier(dragId, z.dataset.tier || null, bf && bf.dataset.tc !== dragId ? bf.dataset.tc : null); dragId = null; selected = null });
document.addEventListener("dragend", () => { dragId = null; for (const o of document.querySelectorAll(".zone.over")) o.classList.remove("over") });
window.addEventListener("hashchange", () => show(location.hash.slice(1)));

/* ---------- início ---------- */
show(location.hash.slice(1));
if (!window.supabase || !CFG.SUPABASE_URL || CFG.SUPABASE_URL.includes("COLE_AQUI")) {
  showAuth(true, "Configure o endereço e a chave do Supabase no arquivo config.js.");
} else {
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  sb.auth.onAuthStateChange((_ev, session) => { setTimeout(() => onSession(session), 0) });
  sb.auth.getSession().then(({ data }) => { if (!data.session) showAuth(true, "") });
}
