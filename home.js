/* =====================================================================
   Jogos Enzola — tela inicial: feed, curtidas, comentários, stories (24 h)
   e a página do Instagram do Movimento Enzola.
   Só quem é amigo (ou você mesmo) vê posts e stories.
   ===================================================================== */
const HM_IG = "https://www.instagram.com/movimento.enzola";
const HM_BG = ["linear-gradient(160deg,#6C93FF,#A88BFA)", "linear-gradient(160deg,#ff9a3c,#e8505b)", "linear-gradient(160deg,#13895D,#0b4f6c)", "linear-gradient(160deg,#f5c542,#e0742a)", "linear-gradient(160deg,#2B7DE9,#0B1129)", "linear-gradient(160deg,#c04fd8,#4b2a9c)"];
const HM_STORY_MS = 5500;
const hm = { loaded: false, loading: false, posts: [], likes: {}, comments: {}, stories: [], open: new Set(), img: null, imgUrl: "", busy: false, sc: null, sv: null };
const hmSeen = () => { try { return new Set(JSON.parse(localStorage.getItem("seen:" + user.id) || "[]")) } catch (e) { return new Set() } };
const hmMarkSeen = id => { try { const s = hmSeen(); s.add(id); localStorage.setItem("seen:" + user.id, JSON.stringify([...s].slice(-300))) } catch (e) { } };
const hmWho = id => id === user.id ? { user_id: user.id, nickname: nick(), username: uname(), avatar: profile && profile.avatar } : pOf(id);

function hmReset() { hm.loaded = false; hm.posts = []; hm.likes = {}; hm.comments = {}; hm.stories = []; hm.open = new Set(); hm.img = null; hm.imgUrl = "" }

/* ---------- imagens ---------- */
function hmResize(file, max = 1080) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas");
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error("img")), "image/jpeg", .82);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")) }; im.src = url;
  });
}
async function hmUpload(blob) {
  const id = (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "" + Math.random().toString(16).slice(2));
  const path = `${user.id}/${id}.jpg`;
  const { error } = await sb.storage.from("social").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw error;
  return sb.storage.from("social").getPublicUrl(path).data.publicUrl;
}
const hmPath = url => { const i = String(url || "").indexOf("/social/"); return i < 0 ? null : decodeURIComponent(url.slice(i + 8).split("?")[0]) };
async function hmRemoveFile(url) { const p = hmPath(url); if (p && p.startsWith(user.id + "/")) { try { await sb.storage.from("social").remove([p]) } catch (e) { } } }

/* ---------- carregar ---------- */
async function hmLoad(force) {
  if (!sb || !user || hm.loading) return;
  if (hm.loaded && !force) return;
  hm.loading = true;
  try {
    if (!fr.loaded) await loadFriends();
    const [p, s] = await Promise.all([
      sb.from("posts").select("*").order("created_at", { ascending: false }).limit(40),
      sb.from("stories").select("*").order("created_at", { ascending: true }),
    ]);
    if (p.error || s.error) { hm.error = true; toast("Não foi possível carregar o feed."); hm.loading = false; hm.loaded = true; return renderHome() }
    hm.error = false; hm.posts = p.data || [];
    const now = Date.now(), all = s.data || [];
    hm.stories = all.filter(x => new Date(x.expires_at).getTime() > now);
    const old = all.filter(x => x.user_id === user.id && new Date(x.expires_at).getTime() <= now);   // limpa seus stories vencidos
    if (old.length) { old.forEach(o => hmRemoveFile(o.image)); sb.from("stories").delete().in("id", old.map(o => o.id)).then(() => { }) }
    const ids = hm.posts.map(x => x.id); hm.likes = {}; hm.comments = {};
    if (ids.length) {
      const [l, c] = await Promise.all([sb.from("post_likes").select("post_id,user_id").in("post_id", ids), sb.from("post_comments").select("*").in("post_id", ids).order("created_at", { ascending: true })]);
      (l.data || []).forEach(x => (hm.likes[x.post_id] = hm.likes[x.post_id] || []).push(x.user_id));
      (c.data || []).forEach(x => (hm.comments[x.post_id] = hm.comments[x.post_id] || []).push(x));
    }
    await loadProfiles([...hm.posts.map(x => x.user_id), ...hm.stories.map(x => x.user_id), ...Object.values(hm.comments).flat().map(x => x.user_id)]);
    hm.loaded = true;
  } catch (e) { toast("Não foi possível carregar o feed.") }
  hm.loading = false; if (tab === "inicio") renderHome();
}

/* ---------- tela ---------- */
function hmAv(id, cls = "sm") { const p = hmWho(id); return `<span class="av ${cls}">${avatar(p.avatar)}</span>` }
function hmStoryBar() {
  const seen = hmSeen(), by = {};
  hm.stories.forEach(s => (by[s.user_id] = by[s.user_id] || []).push(s));
  const order = Object.keys(by).filter(id => id !== user.id).sort((a, b) => {
    const ua = by[a].every(s => seen.has(s.id)), ub = by[b].every(s => seen.has(s.id));
    return ua - ub || new Date(by[b].at(-1).created_at) - new Date(by[a].at(-1).created_at);
  });
  const mine = by[user.id] || [];
  const bub = (id, label) => { const all = by[id].every(s => seen.has(s.id)); return `<button class="hm-st${all ? " seen" : ""}" data-hm="story" data-u="${id}"><span class="hm-ring">${hmAv(id, "md")}</span><span class="hm-sn">${esc(label)}</span></button>` };
  return `<div class="hm-stories" aria-label="Stories">
    <div class="hm-st me"><button class="hm-ring${mine.length ? " has" : ""}" data-hm="${mine.length ? "story" : "newstory"}" data-u="${user.id}" aria-label="${mine.length ? "Ver seu story" : "Criar story"}">${hmAv(user.id, "md")}</button><button class="hm-plus" data-hm="newstory" aria-label="Novo story">${ic("plus")}</button><span class="hm-sn">Seu story</span></div>
    ${order.map(id => bub(id, pName(hmWho(id)))).join("")}</div>`;
}
function hmPostHTML(p) {
  const w = hmWho(p.user_id), likes = hm.likes[p.id] || [], cm = hm.comments[p.id] || [], liked = likes.includes(user.id), open = hm.open.has(p.id);
  const name = isFriend(p.user_id) ? `<a class="hm-nm" href="#amigo/${p.user_id}">${esc(pName(w))}</a>` : `<span class="hm-nm">${esc(pName(w))}</span>`;
  const comments = open ? `<div class="hm-cl">${cm.map(c => `<div class="hm-c">${hmAv(c.user_id, "xs")}<div class="hm-cb"><b>${esc(pName(hmWho(c.user_id)))}</b> ${esc(c.body)}<span class="muted"> · ${rel(c.created_at)}</span></div>${c.user_id === user.id || p.user_id === user.id ? `<button class="iconbtn sm" data-hm="delc" data-id="${c.id}" data-p="${p.id}" aria-label="Apagar comentário">${ic("x")}</button>` : ""}</div>`).join("") || `<p class="muted hm-nc">Seja o primeiro a comentar.</p>`}
    <form class="hm-cf" data-hm-form="${p.id}"><input type="text" maxlength="500" placeholder="Escreva um comentário…" aria-label="Comentário" autocomplete="off"><button class="btn sm" type="submit">${ic("send")}</button></form></div>` : "";
  return `<article class="hm-post panel" data-pid="${p.id}"><header class="hm-ph">${hmAv(p.user_id, "md")}<div class="hm-pn">${name}<span class="muted">${rel(p.created_at)}</span></div>${p.user_id === user.id ? `<button class="iconbtn" data-hm="delp" data-id="${p.id}" aria-label="Apagar publicação">${ic("trash")}</button>` : ""}</header>
    ${p.body ? `<p class="hm-body">${esc(p.body)}</p>` : ""}${p.image ? `<img class="hm-img" src="${esc(p.image)}" alt="Foto da publicação" loading="lazy" data-hm="zoom" data-src="${esc(p.image)}">` : ""}
    <div class="hm-acts"><button class="hm-act${liked ? " on" : ""}" data-hm="like" data-id="${p.id}" aria-pressed="${liked}" aria-label="Curtir">${ic("heart")}<span>${likes.length || ""}</span></button>
      <button class="hm-act" data-hm="cm" data-id="${p.id}" aria-expanded="${open}" aria-label="Comentários">${ic("message")}<span>${cm.length || ""}</span></button></div>${comments}</article>`;
}
function renderHome() {
  const el = $("#inicio"); if (!el || !user) return;
  if (!hm.loaded) { el.innerHTML = hmPromo() + hippoLoad("Carregando o feed…"); hmLoad(); return }
  const kc = document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-hm-form]");
  if (kc && kc.querySelector("input").value) return;      // não apaga o comentário que a pessoa está digitando
  el.innerHTML = `${hmPromo()}${hmStoryBar()}
    <div class="hm-compose panel"><div class="hm-cr">${hmAv(user.id, "md")}<textarea id="hm-text" rows="2" maxlength="2000" placeholder="O que você está jogando ou pensando, ${esc(nick())}?" aria-label="Nova publicação"></textarea></div>
      ${hm.imgUrl ? `<div class="hm-prev"><img src="${hm.imgUrl}" alt="Prévia"><button class="iconbtn" data-hm="rmimg" aria-label="Remover foto">${ic("x")}</button></div>` : ""}
      <div class="hm-cb2"><label class="btn ghost sm hm-file">${ic("image")}Foto<input type="file" id="hm-file" accept="image/*" hidden></label><button class="btn sm" data-hm="post"${hm.busy ? " disabled" : ""}>${ic("send")}Publicar</button></div></div>
    <div class="hm-feed">${hm.posts.length ? hm.posts.map(hmPostHTML).join("") : `<div class="panel empty"><b>Nada por aqui ainda</b>Publique algo ou adicione amigos para ver as novidades deles.<br><a class="btn sm" href="#amigos">Encontrar amigos</a></div>`}</div>`;
}
function hmPromo() {
  return `<a class="hm-promo" href="#movimento"><span class="hm-pl"><img src="movimento/h1.webp" alt="" width="52" height="52"></span><span class="hm-pt"><b>Movimento Enzola</b><span>${ic("insta")}Conheça mais no nosso Instagram</span></span><span class="hm-go">${ic("chev")}</span></a>`;
}

/* ---------- ações ---------- */
async function hmPost() {
  if (hm.busy) return; const t = ($("#hm-text") || {}).value || "";
  if (!t.trim() && !hm.img) { toast("Escreva algo ou escolha uma foto."); return }
  hm.busy = true; renderHome();
  try {
    const image = hm.img ? await hmUpload(hm.img) : null;
    const { data, error } = await sb.from("posts").insert({ body: t.trim(), image }).select().single();
    if (error) throw error;
    hm.posts.unshift(data); hm.img = null; hm.imgUrl = ""; toast("Publicado!");
  } catch (e) { toast("Não foi possível publicar agora.") }
  hm.busy = false; renderHome();
}
async function hmLike(id) {
  const l = hm.likes[id] = hm.likes[id] || [], had = l.includes(user.id);
  if (had) l.splice(l.indexOf(user.id), 1); else l.push(user.id); renderHome();
  const r = had ? await sb.from("post_likes").delete().eq("post_id", id).eq("user_id", user.id) : await sb.from("post_likes").insert({ post_id: id });
  if (r.error) { if (had) l.push(user.id); else l.splice(l.indexOf(user.id), 1); renderHome(); toast("Não foi possível curtir agora.") }
}
async function hmComment(id, input) {
  const body = input.value.trim(); if (!body) return; input.disabled = true;
  const { data, error } = await sb.from("post_comments").insert({ post_id: id, body }).select().single();
  if (error) { input.disabled = false; toast("Não foi possível comentar agora."); return }
  (hm.comments[id] = hm.comments[id] || []).push(data); input.value = ""; renderHome();
}
async function hmDelComment(id, pid) {
  const { error } = await sb.from("post_comments").delete().eq("id", id); if (error) { toast("Não foi possível apagar."); return }
  hm.comments[pid] = (hm.comments[pid] || []).filter(c => c.id !== id); renderHome();
}
async function hmDelPost(id) {
  const p = hm.posts.find(x => x.id === id); if (!p || !confirm("Apagar esta publicação?")) return;
  const { error } = await sb.from("posts").delete().eq("id", id); if (error) { toast("Não foi possível apagar."); return }
  if (p.image) hmRemoveFile(p.image); hm.posts = hm.posts.filter(x => x.id !== id); renderHome();
}

/* ---------- stories ---------- */
function hmOvl() { let b = $("#hm-ovl"); if (!b) { b = document.createElement("div"); b.id = "hm-ovl"; b.className = "hm-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function hmCloseOvl() { if (hm.sv && hm.sv.t) clearTimeout(hm.sv.t); hm.sv = null; hm.sc = null; const b = $("#hm-ovl"); if (b) b.remove(); document.documentElement.classList.remove("lg-open"); if (tab === "inicio") renderHome() }
function hmNewStory() {
  hm.sc = { img: null, url: "", bg: 0, busy: false };
  hmOvl().innerHTML = `<div class="hm-sc"><button class="iconbtn hm-x" data-hm="close" aria-label="Fechar">${ic("x")}</button><h3>Novo story</h3><p class="muted">Some em 24 horas. Só seus amigos veem.</p>
    <div class="hm-scv" id="hm-scv" style="background:${HM_BG[0]}"><textarea id="hm-sct" maxlength="300" rows="4" placeholder="Escreva algo…" aria-label="Texto do story"></textarea></div>
    <div class="hm-bgs">${HM_BG.map((b, i) => `<button class="hm-bg${i ? "" : " on"}" style="background:${b}" data-hm="bg" data-i="${i}" aria-label="Cor ${i + 1}"></button>`).join("")}</div>
    <div class="hm-cb2"><label class="btn ghost sm hm-file">${ic("camera")}Usar foto<input type="file" id="hm-sfile" accept="image/*" hidden></label><button class="btn" data-hm="poststory" id="hm-sgo">Postar story</button></div></div>`;
}
function hmScPaint() {
  const v = $("#hm-scv"), s = hm.sc; if (!v) return;
  v.style.background = s.url ? `#000 url('${s.url}') center/cover` : HM_BG[s.bg];
  document.querySelectorAll(".hm-bg").forEach((b, i) => b.classList.toggle("on", i === s.bg));
}
async function hmPostStory() {
  const s = hm.sc; if (!s || s.busy) return; const cap = ($("#hm-sct") || {}).value || "";
  if (!cap.trim() && !s.img) { toast("Escreva algo ou escolha uma foto."); return }
  s.busy = true; const g = $("#hm-sgo"); if (g) { g.disabled = true; g.textContent = "Postando…" }
  try {
    const image = s.img ? await hmUpload(s.img) : null;
    const { data, error } = await sb.from("stories").insert({ image, caption: cap.trim(), bg: s.bg }).select().single();
    if (error) throw error; hm.stories.push(data); toast("Story publicado por 24 horas!");
    hmCloseOvl();
  } catch (e) { s.busy = false; if (g) { g.disabled = false; g.textContent = "Postar story" } toast("Não foi possível postar agora.") }
}
function hmOpenStory(uid) {
  const list = hm.stories.filter(s => s.user_id === uid); if (!list.length) return;
  const seen = hmSeen(); let i = list.findIndex(s => !seen.has(s.id)); if (i < 0 || uid === user.id) i = 0;
  hm.sv = { uid, list, i, t: null }; hmShowStory();
}
function hmShowStory() {
  const v = hm.sv; if (!v) return; clearTimeout(v.t);
  const s = v.list[v.i]; if (!s) return hmStoryNextUser();
  hmMarkSeen(s.id);
  const w = hmWho(v.uid);
  hmOvl().innerHTML = `<div class="hm-sv"><div class="hm-bars">${v.list.map((_, j) => `<i class="${j < v.i ? "done" : j === v.i ? "run" : ""}"><b style="${j === v.i ? `animation-duration:${HM_STORY_MS}ms` : ""}"></b></i>`).join("")}</div>
    <div class="hm-svh">${hmAv(v.uid, "sm")}<div><b>${esc(pName(w))}</b><span>${rel(s.created_at)}</span></div><span class="grow"></span>${v.uid === user.id ? `<button class="iconbtn" data-hm="delstory" aria-label="Apagar story">${ic("trash")}</button>` : ""}<button class="iconbtn" data-hm="close" aria-label="Fechar">${ic("x")}</button></div>
    <div class="hm-svb" style="background:${s.image ? "#000" : HM_BG[s.bg % HM_BG.length]}">${s.image ? `<img src="${esc(s.image)}" alt="Story">` : ""}${s.caption ? `<p class="${s.image ? "cap" : "txt"}">${esc(s.caption)}</p>` : ""}</div>
    <button class="hm-prevz" data-hm="sprev" aria-label="Anterior"></button><button class="hm-nextz" data-hm="snext" aria-label="Próximo"></button></div>`;
  v.t = setTimeout(hmStoryNext, HM_STORY_MS);
}
function hmStoryNext() { const v = hm.sv; if (!v) return; v.i++; if (v.i >= v.list.length) return hmStoryNextUser(); hmShowStory() }
function hmStoryNextUser() {
  const v = hm.sv; if (!v) return;
  const seen = hmSeen(), users = [...new Set(hm.stories.map(s => s.user_id))].filter(u => u !== user.id && u !== v.uid && hm.stories.some(s => s.user_id === u && !seen.has(s.id)));
  if (users.length) { const nu = users[0]; clearTimeout(v.t); hm.sv = null; hmOpenStory(nu) } else hmCloseOvl();
}
function hmStoryPrev() { const v = hm.sv; if (!v) return; v.i = Math.max(0, v.i - 1); hmShowStory() }
async function hmDelStory() {
  const v = hm.sv; if (!v) return; const s = v.list[v.i]; if (!s || !confirm("Apagar este story?")) return;
  clearTimeout(v.t); const { error } = await sb.from("stories").delete().eq("id", s.id); if (error) { toast("Não foi possível apagar."); hmShowStory(); return }
  if (s.image) hmRemoveFile(s.image); hm.stories = hm.stories.filter(x => x.id !== s.id); v.list.splice(v.i, 1);
  if (!v.list.length) hmCloseOvl(); else { v.i = Math.min(v.i, v.list.length - 1); hmShowStory() }
}

/* ---------- Instagram do Movimento Enzola ---------- */
const HM_TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function renderMovimento() {
  const el = $("#movimento"); if (!el) return;
  el.innerHTML = `<div class="ig"><div class="ig-top"><a class="iconbtn light" href="#inicio" aria-label="Voltar">${ic("back")}</a><b>movimento.enzola</b><a class="iconbtn light" href="${HM_IG}" target="_blank" rel="noopener" aria-label="Abrir no Instagram">${ic("external")}</a></div>
    <div class="ig-head"><img class="ig-pic" src="movimento/h1.webp" alt="Logo do Movimento Enzola" width="86" height="86"><div class="ig-info"><b>Movimento Enzola</b><span>Valorização dos hipopótamos desde 13 de setembro de 2026.<br>“This is Enzola, Gênio Contemporâneo”</span></div></div>
    <div class="ig-btns"><a class="btn ig-go" href="${HM_IG}" target="_blank" rel="noopener">${ic("insta")}Seguir no Instagram</a><a class="btn ghost" href="${HM_IG}" target="_blank" rel="noopener">Abrir perfil</a></div>
    <div class="ig-hl"><a href="${HM_IG}" target="_blank" rel="noopener"><span><img src="movimento/h1.webp" alt=""></span>Redes Sociais</a><a href="${HM_IG}" target="_blank" rel="noopener"><span><img src="movimento/h2.webp" alt=""></span>Enzola</a></div>
    <div class="ig-tabs" role="tablist"><span class="on" aria-label="Publicações">${ic("grid")}</span><a href="${HM_IG}/reels/" target="_blank" rel="noopener" aria-label="Reels">${ic("play")}</a><a href="${HM_IG}/tagged/" target="_blank" rel="noopener" aria-label="Marcações">${ic("user")}</a></div>
    <div class="ig-grid">${HM_TILES.map(n => `<button class="ig-t" data-hm="igzoom" data-n="${n}" aria-label="Publicação ${n}"><img src="movimento/p${n}.webp" alt=""></button>`).join("")}</div>
    <p class="ig-foot muted">Mostrando algumas publicações. Para ver tudo e as novidades, abra o perfil no Instagram.</p></div>`;
}
function hmIgZoom(n) {
  hmOvl().innerHTML = `<div class="hm-zoom"><button class="iconbtn hm-x" data-hm="close" aria-label="Fechar">${ic("x")}</button><img src="movimento/p${n}.webp" alt="Publicação do Movimento Enzola"><a class="btn" href="${HM_IG}" target="_blank" rel="noopener">${ic("insta")}Ver no Instagram</a></div>`;
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-hm]"); if (!b || !user) return;
  const a = b.dataset.hm, id = b.dataset.id;
  if (a === "like") hmLike(id); else if (a === "cm") { hm.open.has(id) ? hm.open.delete(id) : hm.open.add(id); renderHome() }
  else if (a === "post") hmPost(); else if (a === "delp") hmDelPost(id); else if (a === "delc") hmDelComment(id, b.dataset.p);
  else if (a === "rmimg") { hm.img = null; hm.imgUrl = ""; renderHome() }
  else if (a === "newstory") hmNewStory(); else if (a === "story") hmOpenStory(b.dataset.u);
  else if (a === "bg") { if (hm.sc) { hm.sc.bg = +b.dataset.i; hmScPaint() } }
  else if (a === "poststory") hmPostStory(); else if (a === "close") hmCloseOvl();
  else if (a === "snext") hmStoryNext(); else if (a === "sprev") hmStoryPrev(); else if (a === "delstory") hmDelStory();
  else if (a === "zoom") { hmOvl().innerHTML = `<div class="hm-zoom"><button class="iconbtn hm-x" data-hm="close" aria-label="Fechar">${ic("x")}</button><img src="${esc(b.dataset.src)}" alt="Foto"></div>` }
  else if (a === "igzoom") hmIgZoom(b.dataset.n);
});
document.addEventListener("submit", e => { const f = e.target.closest("[data-hm-form]"); if (!f) return; e.preventDefault(); hmComment(f.dataset.hmForm, f.querySelector("input")) });
document.addEventListener("change", async e => {
  if (e.target.id === "hm-file" || e.target.id === "hm-sfile") {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { toast("Escolha uma imagem."); return }
    try {
      const blob = await hmResize(f), url = URL.createObjectURL(blob);
      if (e.target.id === "hm-file") { hm.img = blob; hm.imgUrl = url; const t = ($("#hm-text") || {}).value; renderHome(); if (t) $("#hm-text").value = t }
      else if (hm.sc) { hm.sc.img = blob; hm.sc.url = url; hmScPaint() }
    } catch (er) { toast("Não foi possível usar essa imagem.") }
  }
});
document.addEventListener("keydown", e => {
  if (!$("#hm-ovl")) return;
  if (e.key === "Escape") hmCloseOvl(); else if (hm.sv && e.key === "ArrowRight") hmStoryNext(); else if (hm.sv && e.key === "ArrowLeft") hmStoryPrev();
});
