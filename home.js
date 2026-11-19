/* =====================================================================
   Jogos Enzola — tela inicial: feed, curtidas, comentários, stories (24 h)
   e a página do Instagram do Movimento Enzola.
   Só quem é amigo (ou você mesmo) vê posts e stories.
   ===================================================================== */
const HM_IG = "https://www.instagram.com/movimento.enzola";
const HM_BG = ["linear-gradient(160deg,#6C93FF,#A88BFA)", "linear-gradient(160deg,#ff9a3c,#e8505b)", "linear-gradient(160deg,#13895D,#0b4f6c)", "linear-gradient(160deg,#f5c542,#e0742a)", "linear-gradient(160deg,#2B7DE9,#0B1129)", "linear-gradient(160deg,#c04fd8,#4b2a9c)"];
const HM_STORY_MS = 5500;
const hm = { loaded: false, loading: false, posts: [], likes: {}, comments: {}, stories: [], open: new Set(), img: null, imgUrl: "", tags: [], tagOpen: false, busy: false, sc: null, sv: null };
const hmSeen = () => { try { return new Set(JSON.parse(localStorage.getItem("seen:" + user.id) || "[]")) } catch (e) { return new Set() } };
const hmMarkSeen = id => { try { const s = hmSeen(); s.add(id); localStorage.setItem("seen:" + user.id, JSON.stringify([...s].slice(-300))) } catch (e) { } };
const hmWho = id => id === user.id ? { user_id: user.id, nickname: nick(), username: uname(), avatar: profile && profile.avatar } : pOf(id);

function hmReset() { hm.loaded = false; hm.posts = []; hm.likes = {}; hm.comments = {}; hm.stories = []; hm.open = new Set(); hm.img = null; hm.imgUrl = ""; hm.tags = []; hm.tagOpen = false }

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

/* ---------- @menções ---------- */
const hmUsers = () => { const m = {}; [...Object.values(fr.profs), { user_id: user.id, username: uname() }].forEach(p => { if (p && p.username) m[p.username.toLowerCase()] = p.user_id }); return m };
function hmRich(t) {
  const m = hmUsers();
  return esc(t).replace(/@([\w.\-]+)/g, (all, u) => { const id = m[u.toLowerCase().replace(/[.\-]+$/, "")]; if (!id) return all; const tail = u.length - u.replace(/[.\-]+$/, "").length; return `<a class="hm-at" href="${isFriend(id) ? "#amigo/" + id : "#inicio"}">@${esc(u.slice(0, u.length - tail))}</a>${u.slice(u.length - tail)}` });
}
const hmMentioned = t => { const m = hmUsers(), ids = new Set(); (String(t).match(/@[\w.\-]+/g) || []).forEach(x => { const id = m[x.slice(1).toLowerCase().replace(/[.\-]+$/, "")]; if (id && id !== user.id) ids.add(id) }); return ids };
let hmMn = null;
function hmMnClose() { const b = $("#hm-mn"); if (b) b.remove(); hmMn = null }
function hmMnCheck(el) {
  const v = el.value, c = el.selectionStart, m = /(^|\s)@([\w.\-]{0,30})$/.exec(v.slice(0, c)); if (!m) return hmMnClose();
  const q = m[2].toLowerCase(), list = frAccepted().map(f => pOf(other(f))).filter(p => p.username && ((p.username || "").toLowerCase().includes(q) || (p.nickname || "").toLowerCase().includes(q))).slice(0, 6);
  if (!list.length) return hmMnClose();
  hmMnClose(); const par = el.parentElement; par.classList.add("hm-rel");
  const b = document.createElement("div"); b.id = "hm-mn"; b.className = "hm-mn"; b.setAttribute("role", "listbox");
  b.style.cssText = `left:${el.offsetLeft}px;width:${Math.max(el.offsetWidth, 200)}px;top:${el.offsetTop + el.offsetHeight + 4}px`;
  b.innerHTML = list.map((p, i) => `<button type="button" role="option" class="hm-mo${i ? "" : " on"}" data-u="${esc(p.username)}">${hmAv(p.user_id, "xs")}<span><b>${esc(pName(p))}</b><i>@${esc(p.username)}</i></span></button>`).join("");
  par.append(b); hmMn = { el, at: m.index + m[1].length };
}
function hmMnPick(u) {
  if (!hmMn) return; const { el, at } = hmMn, v = el.value, c = el.selectionStart, ins = "@" + u + " ";
  el.value = v.slice(0, at) + ins + v.slice(c); const pos = at + ins.length; el.focus(); el.setSelectionRange(pos, pos); hmMnClose();
}
document.addEventListener("input", e => { if (user && e.target.matches && e.target.matches("#hm-text,.hm-cf input")) hmMnCheck(e.target) });
document.addEventListener("pointerdown", e => { const o = e.target.closest && e.target.closest(".hm-mo"); if (o) { e.preventDefault(); hmMnPick(o.dataset.u) } else if (hmMn && !e.target.closest("#hm-mn")) hmMnClose() });
document.addEventListener("keydown", e => {
  if (!hmMn || !$("#hm-mn")) return; const os = [...document.querySelectorAll(".hm-mo")], i = os.findIndex(o => o.classList.contains("on"));
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); os[i].classList.remove("on"); os[(i + (e.key === "ArrowDown" ? 1 : os.length - 1)) % os.length].classList.add("on") }
  else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.stopImmediatePropagation(); hmMnPick(os[Math.max(i, 0)].dataset.u) }
  else if (e.key === "Escape") { e.stopImmediatePropagation(); hmMnClose() }
}, true);

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
    await loadProfiles([...hm.posts.flatMap(x => x.tags || []), ...hm.posts.map(x => x.user_id), ...hm.stories.map(x => x.user_id), ...Object.values(hm.comments).flat().map(x => x.user_id)]);
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
  const ment = hmMentioned(p.body), tg = (p.tags || []).filter(t => !ment.has(t));
  const w = hmWho(p.user_id), likes = hm.likes[p.id] || [], cm = hm.comments[p.id] || [], liked = likes.includes(user.id), open = hm.open.has(p.id);
  const name = isFriend(p.user_id) ? `<a class="hm-nm" href="#amigo/${p.user_id}">${esc(pName(w))}</a>` : `<span class="hm-nm">${esc(pName(w))}</span>`;
  const comments = open ? `<div class="hm-cl">${cm.map(c => `<div class="hm-c">${hmAv(c.user_id, "xs")}<div class="hm-cb"><b>${esc(pName(hmWho(c.user_id)))}</b> ${hmRich(c.body)}<span class="muted"> · ${rel(c.created_at)}</span></div>${c.user_id === user.id || p.user_id === user.id ? `<button class="iconbtn sm" data-hm="delc" data-id="${c.id}" data-p="${p.id}" aria-label="Apagar comentário">${ic("x")}</button>` : ""}</div>`).join("") || `<p class="muted hm-nc">Seja o primeiro a comentar.</p>`}
    <form class="hm-cf" data-hm-form="${p.id}"><input type="text" maxlength="500" placeholder="Escreva um comentário…" aria-label="Comentário" autocomplete="off"><button class="btn sm" type="submit">${ic("send")}</button></form></div>` : "";
  return `<article class="hm-post panel" data-pid="${p.id}"><header class="hm-ph">${hmAv(p.user_id, "md")}<div class="hm-pn">${name}<span class="muted">${rel(p.created_at)}</span></div>${p.user_id === user.id ? `<button class="iconbtn" data-hm="delp" data-id="${p.id}" aria-label="Apagar publicação">${ic("trash")}</button>` : ""}</header>
    ${tg.length ? `<p class="hm-tags">${ic("users")}com ${tg.map(t => `<a href="${isFriend(t) ? "#amigo/" + t : "#inicio"}">${esc(pName(hmWho(t)))}</a>`).join(", ")}</p>` : ""}${p.body ? `<p class="hm-body">${hmRich(p.body)}</p>` : ""}${p.image ? `<img class="hm-img" src="${esc(p.image)}" alt="Foto da publicação" loading="lazy" data-hm="zoom" data-src="${esc(p.image)}">` : ""}
    <div class="hm-acts"><button class="hm-act${liked ? " on" : ""}" data-hm="like" data-id="${p.id}" aria-pressed="${liked}" aria-label="Curtir">${ic("heart")}<span>${likes.length || ""}</span></button>
      <button class="hm-act" data-hm="cm" data-id="${p.id}" aria-expanded="${open}" aria-label="Comentários">${ic("message")}<span>${cm.length || ""}</span></button></div>${comments}</article>`;
}
/* ---------- medidor de aura diário ---------- */
const AU_TIERS = [
  { min: 0, name: "Aura em manutenção", emoji: "🌧️", c1: "#5b6b8c", c2: "#2b3350", msgs: ["O universo está em atualização. Evite decisões importantes e proteja seu Wi-Fi hoje.", "Dia de ficar quietinho: o lag da vida está alto. Amanhã a gente reinicia.", "Sua sorte foi pra loja trocar a bateria. Jogue só o que você já domina."] },
  { min: 20, name: "Aura nublada", emoji: "☁️", c1: "#7a8fb8", c2: "#39466e", msgs: ["Nem tudo vai dar certo hoje, mas dá pra tirar um ranked sem perder a paz.", "A sorte está de óculos escuros: te vê, mas finge que não. Vá com calma.", "Dia de jogar casual e guardar a ousadia pra amanhã."] },
  { min: 40, name: "Aura estável", emoji: "🌤️", c1: "#38b6a8", c2: "#1d5a7a", msgs: ["Equilibrado como um Wi-Fi de 5G: sem milagres, sem tragédias.", "Um dia normal com chance de pequenas boas surpresas. Bora jogar.", "A sorte está do seu lado, mas sentada no banco de reservas."] },
  { min: 60, name: "Aura brilhante", emoji: "✨", c1: "#ffb347", c2: "#e8505b", msgs: ["A sorte te notou hoje! Bom dia pra começar aquele jogo que está na fila.", "Sua aura está brilhando: tudo tende a dar certo, até o drop raro.", "Dia ótimo pra arriscar uma jogada ousada e ainda sair rindo."] },
  { min: 80, name: "Aura lendária", emoji: "🔥", c1: "#ff7a18", c2: "#af002d", msgs: ["Hoje é o seu dia: clutch, loot e vitória garantidos (quase).", "Os hipopótamos se curvam. Qualquer partida hoje tem cheiro de vitória.", "Sorte nível lendário! Chame a galera, hoje o servidor é seu."] },
  { min: 95, name: "Aura do Enzolão", emoji: "👑", c1: "#ffd23f", c2: "#b8860b", msgs: ["AURA MÁXIMA! Compre o bilhete, aposte tudo, ligue pro Silvio: hoje você é imbatível.", "Nível Enzolão: o universo inteiro torce por você. Aproveite cada minuto.", "Você é a lenda do dia. Os amigos precisam saber disso agora."] },
];
const AU_COLORS = ["verde", "azul", "roxo", "laranja", "dourado", "vermelho", "rosa", "branco"];
const auTier = v => { let t = AU_TIERS[0]; for (const x of AU_TIERS) if (v >= x.min) t = x; return t };
const auKey = () => "aura:" + user.id + ":" + spDay(0);
function auGet() { try { return JSON.parse(localStorage.getItem(auKey()) || "null") } catch (e) { return null } }
function auSet(o) { try { localStorage.setItem(auKey(), JSON.stringify(o)) } catch (e) {} }
function auMeasure() {
  if (auGet()) return;
  const v = Math.floor(Math.random() * 101), t = auTier(v);
  auSet({ v, m: Math.floor(Math.random() * t.msgs.length), n: 1 + Math.floor(Math.random() * 99), col: AU_COLORS[Math.floor(Math.random() * AU_COLORS.length)], posted: false });
  hm.auraFresh = true; renderHome();
  const n = $("#au-n"), f = $("#au-f"), a = auGet(); if (!a || !n) return;
  requestAnimationFrame(() => { if (f) f.style.width = a.v + "%" });
  const t0 = performance.now(), dur = 1400;
  const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3), x = $("#au-n"); if (!x) return; x.textContent = Math.round(a.v * e); if (k < 1) requestAnimationFrame(step); else hm.auraFresh = false };
  requestAnimationFrame(step);
}
function hmAura() {
  const a = auGet();
  if (!a) return `<div class="au panel au-empty"><div class="au-orb" aria-hidden="true">🔮</div><div class="au-tx"><b>Medidor de aura diário</b><span class="muted">Descubra como está a sua sorte hoje.</span></div><button class="btn sm" data-hm="aura">Medir minha aura</button></div>`;
  const t = auTier(a.v), fresh = !!hm.auraFresh;
  return `<div class="au panel" style="--c1:${t.c1};--c2:${t.c2}"><div class="au-h"><span class="au-e" aria-hidden="true">${t.emoji}</span><div><small>Sua aura de hoje</small><b>${t.name}</b></div><div class="au-v"><span id="au-n">${fresh ? 0 : a.v}</span><i>%</i></div></div>
    <div class="au-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${a.v}" aria-label="Nível de aura"><i id="au-f" style="width:${fresh ? 0 : a.v}%"></i></div>
    <p class="au-m">${esc(t.msgs[a.m % t.msgs.length])}</p>
    <div class="au-x"><span>🍀 Número da sorte: <b>${a.n}</b></span><span>🎨 Cor do dia: <b>${a.col}</b></span></div>
    <div class="au-a">${a.posted ? `<span class="au-done">${ic("check")}Publicado para seus amigos</span>` : `<button class="btn sm" data-hm="aurapost"${hm.busy ? " disabled" : ""}>${ic("send")}Publique pra seus amigos</button>`}<small class="muted">Nova medição amanhã</small></div></div>`;
}
function auCard(a, t) {
  return new Promise(res => {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 1080; const x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, 1080, 1080); g.addColorStop(0, t.c1); g.addColorStop(1, t.c2); x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
      x.fillStyle = "rgba(255,255,255,.07)"; for (let i = -1080; i < 1080; i += 120) { x.beginPath(); x.moveTo(i, 1080); x.lineTo(i + 60, 1080); x.lineTo(i + 60 + 1080, 0); x.lineTo(i + 1080, 0); x.fill() }
      x.textAlign = "center"; x.fillStyle = "#fff"; const F = "Inter, Poppins, system-ui, sans-serif";
      x.font = `700 44px ${F}`; x.globalAlpha = .9; x.fillText("MEDIDOR DE AURA · " + spDay(0).split("-").reverse().join("/"), 540, 130); x.globalAlpha = 1;
      x.font = "180px serif"; x.fillText(t.emoji, 540, 340);
      x.font = `800 300px ${F}`; x.shadowColor = "rgba(0,0,0,.3)"; x.shadowBlur = 30; x.fillText(a.v + "%", 540, 640); x.shadowBlur = 0;
      x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.roundRect(140, 700, 800, 36, 18); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.roundRect(140, 700, Math.max(36, 800 * a.v / 100), 36, 18); x.fill();
      x.font = `800 70px ${F}`; x.fillText(t.name, 540, 830);
      x.font = `500 38px ${F}`; const words = t.msgs[a.m % t.msgs.length].split(" "); let line = "", y = 900;
      for (const w of words) { const test = line + w + " "; if (x.measureText(test).width > 860 && line) { x.fillText(line.trim(), 540, y); line = w + " "; y += 50 } else line = test }
      x.fillText(line.trim(), 540, y);
      x.font = `700 34px ${F}`; x.globalAlpha = .85; x.fillText("jogos-enzola.vercel.app", 540, 1040);
      c.toBlob(b => res(b), "image/jpeg", .88);
    } catch (e) { res(null) }
  });
}
async function auPost() {
  const a = auGet(); if (!a || a.posted || hm.busy) return;
  hm.busy = true; renderHome(); const t = auTier(a.v);
  try {
    const blob = await auCard(a, t), image = blob ? await hmUpload(blob).catch(() => null) : null;
    const body = `${t.emoji} Minha aura de hoje: ${a.v}% — ${t.name}\n${t.msgs[a.m % t.msgs.length]}\n🍀 Número da sorte: ${a.n} · 🎨 Cor do dia: ${a.col}`;
    const { data, error } = await sb.from("posts").insert({ body, image, tags: [] }).select().single();
    if (error) throw error;
    hm.posts.unshift(data); a.posted = true; auSet(a); toast("Aura publicada para seus amigos!");
  } catch (e) { toast("Não foi possível publicar agora.") }
  hm.busy = false; renderHome();
}
function renderHome() {
  const el = $("#inicio"); if (!el || !user) return;
  if (!hm.loaded) { el.innerHTML = hmPromo() + hippoLoad("Carregando o feed…"); hmLoad(); return }
  const kc = document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-hm-form]");
  if (kc && kc.querySelector("input").value) return;      // não apaga o comentário que a pessoa está digitando
  el.innerHTML = `${hmPromo()}${hmStoryBar()}${hmAura()}
    <div class="hm-compose panel"><div class="hm-cr">${hmAv(user.id, "md")}<textarea id="hm-text" rows="2" maxlength="2000" placeholder="O que você está jogando ou pensando, ${esc(nick())}?" aria-label="Nova publicação"></textarea></div>
      ${hm.imgUrl ? `<div class="hm-prev"><img src="${hm.imgUrl}" alt="Prévia"><button class="iconbtn" data-hm="rmimg" aria-label="Remover foto">${ic("x")}</button></div>` : ""}
      ${hm.tags.length ? `<div class="hm-chips">${hm.tags.map(t => `<button class="hm-chip" data-hm="tag" data-id="${t}" aria-label="Remover marcação">${esc(pName(hmWho(t)))} ${ic("x")}</button>`).join("")}</div>` : ""}
      ${hm.tagOpen ? `<div class="hm-pick" role="group" aria-label="Marcar amigos">${frAccepted().length ? frAccepted().map(f => { const id = other(f), on = hm.tags.includes(id); return `<button class="hm-pk${on ? " on" : ""}" data-hm="tag" data-id="${id}" aria-pressed="${on}">${hmAv(id, "xs")}<span>${esc(pName(pOf(id)))}</span>${on ? ic("check") : ""}</button>` }).join("") : `<span class="muted">Adicione amigos para poder marcá-los.</span>`}</div>` : ""}
      <div class="hm-cb2"><div class="hm-l"><label class="btn ghost sm hm-file">${ic("image")}Foto<input type="file" id="hm-file" accept="image/*" hidden></label><button class="btn ghost sm" data-hm="tagtoggle" aria-expanded="${hm.tagOpen}">${ic("userplus")}Marcar</button></div><button class="btn sm" data-hm="post"${hm.busy ? " disabled" : ""}>${ic("send")}Publicar</button></div></div>
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
    const { data, error } = await sb.from("posts").insert({ body: t.trim(), image, tags: [...new Set([...hm.tags, ...hmMentioned(t)])] }).select().single();
    if (error) throw error;
    hm.posts.unshift(data); hm.img = null; hm.imgUrl = ""; hm.tags = []; hm.tagOpen = false; toast("Publicado!");
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
    <div class="ig-head"><img class="ig-pic" src="movimento/h1.webp" alt="Logo do Movimento Enzola" width="86" height="86"><div class="ig-info"><b>Movimento Enzola</b><span>Valorização dos hipopótamos desde 13 de setembro de 2023.<br>“This is Enzola, Gênio Contemporâneo”</span></div></div>
    <div class="ig-btns"><a class="btn ig-go" href="${HM_IG}" target="_blank" rel="noopener">${ic("insta")}Seguir no Instagram</a><a class="btn ghost" href="${HM_IG}" target="_blank" rel="noopener">Abrir perfil</a></div>
    <div class="ig-hl"><a href="${HM_IG}" target="_blank" rel="noopener"><span><img src="movimento/h1.webp" alt=""></span>Redes Sociais</a><a href="${HM_IG}" target="_blank" rel="noopener"><span><img src="movimento/h2.webp" alt=""></span>Enzola</a></div>
    <div class="ig-tabs" role="tablist"><span class="on" aria-label="Publicações">${ic("grid")}</span><a href="${HM_IG}/reels/" target="_blank" rel="noopener" aria-label="Reels">${ic("play")}</a><a href="${HM_IG}/tagged/" target="_blank" rel="noopener" aria-label="Marcações">${ic("user")}</a></div>
    <div class="ig-grid">${HM_TILES.map(n => `<button class="ig-t" data-hm="igzoom" data-n="${n}" aria-label="Publicação ${n}"><img src="movimento/p${n}.webp" alt=""></button>`).join("")}</div>
    <p class="ig-foot muted">Mostrando algumas publicações. Para ver tudo e as novidades, abra o perfil no Instagram.</p></div>`;
}
function hmIgZoom(n) {
  hmOvl().innerHTML = `<div class="hm-zoom"><button class="iconbtn hm-x" data-hm="close" aria-label="Fechar">${ic("x")}</button><img src="movimento/p${n}.webp" alt="Publicação do Movimento Enzola"><a class="btn" href="${HM_IG}" target="_blank" rel="noopener">${ic("insta")}Ver no Instagram</a></div>`;
}

let hmTxt = "";
function hmKeepText() { hmTxt = ($("#hm-text") || {}).value || "" }
function hmRestoreText() { const t = $("#hm-text"); if (t && hmTxt) t.value = hmTxt }
/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-hm]"); if (!b || !user) return;
  const a = b.dataset.hm, id = b.dataset.id;
  if (a === "tagtoggle") { hmKeepText(); hm.tagOpen = !hm.tagOpen; renderHome(); hmRestoreText() }
  else if (a === "tag") { hmKeepText(); hm.tags = hm.tags.includes(id) ? hm.tags.filter(x => x !== id) : hm.tags.length < 10 ? [...hm.tags, id] : hm.tags; renderHome(); hmRestoreText() }
  else if (a === "like") hmLike(id); else if (a === "cm") { hm.open.has(id) ? hm.open.delete(id) : hm.open.add(id); renderHome() }
  else if (a === "aura") auMeasure(); else if (a === "aurapost") auPost();
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
