/* Jogos Enzola — amigos, página do amigo, mensagens, cutucadas, sugestões e notificações */
function newFr() { return { rows: [], profs: {}, groups: [], members: [], loaded: false, found: null, fmsg: "", q: "", allGames: null, unread: {}, notifs: [], nLoaded: false } }
let fr = newFr(), gBusy = false, rtChans = [], fpv = null, chat = null;
const other = f => f.requester === user.id ? f.addressee : f.requester;
const pOf = id => fr.profs[id] || { user_id: id, username: "usuário", nickname: "" };
const pName = p => p.nickname || p.username || "usuário";
const frAccepted = () => fr.rows.filter(f => f.status === "accepted");
const frIn = () => fr.rows.filter(f => f.status === "pending" && f.addressee === user.id);
const frOut = () => fr.rows.filter(f => f.status === "pending" && f.requester === user.id);
const frRel = id => fr.rows.find(f => other(f) === id);
const isFriend = id => frAccepted().some(f => other(f) === id);
const PCOLS = () => "user_id,username,nickname,avatar,banner,bio,favorites,now_playing" + (caps.v3 ? ",tag" : "");
const tagOf = p => p && p.tag ? ` <span class="idtag">#${esc(p.tag)}</span>` : "";

async function loadProfiles(ids) {
  ids = [...new Set(ids)].filter(x => x && x !== user.id && !fr.profs[x]);
  if (!ids.length) return;
  const p = await sb.from("profiles").select(PCOLS()).in("user_id", ids);
  (p.data || []).forEach(x => fr.profs[x.user_id] = x);
}
async function loadFriends() {
  if (!sb || !user) return;
  const [a, b, c, d, e] = await Promise.all([sb.from("friendships").select("*"), sb.from("groups").select("*"), sb.from("group_members").select("*"), sb.from("group_activity").select("*"), sb.from("group_claims").select("*")]);
  if (a.error || b.error || c.error) { toast("Não foi possível carregar os amigos."); return }
  fr.rows = a.data || []; fr.groups = b.data || []; fr.members = c.data || []; fr.gact = d.data || []; fr.gclaims = e.data || [];
  const ids = [...new Set([...fr.rows.map(other), ...fr.members.map(m => m.user_id), ...fr.groups.map(g => g.owner)])].filter(x => x !== user.id);
  fr.profs = {}; await loadProfiles(ids);
  if (caps.v3) {
    const u = await sb.from("messages").select("sender").eq("recipient", user.id).is("read_at", null);
    fr.unread = {}; (u.data || []).forEach(m => fr.unread[m.sender] = (fr.unread[m.sender] || 0) + 1);
  }
  fr.loaded = true; fr.allGames = null; updateBadge();
  if (tab === "amigos") renderFriends(); if (tab === "amigo") renderFriendPage(); if (tab === "jogo" && gv) renderGame();
}
function updateBadge() {
  const b = $("#fr-badge"); if (!b) return;
  const n = user ? frIn().length + Object.values(fr.unread).reduce((a, x) => a + x, 0) : 0;
  b.hidden = !n; b.textContent = n > 9 ? "9+" : n;
}

/* ---------- lista de amigos ---------- */
function person(p, extra = "", link = true) {
  const unread = fr.unread[p.user_id] || 0;
  return `<div class="fcard">${link && isFriend(p.user_id) ? `<a class="fhead" href="#amigo/${p.user_id}">` : `<div class="fhead">`}<div class="av md">${avatar(p.avatar)}</div><div class="fi"><div class="fn">${esc(pName(p))}${unread ? ` <span class="ubadge">${unread} nova${unread > 1 ? "s" : ""}</span>` : ""}</div><div class="fu">@${esc(p.username || "")}${tagOf(p)}</div></div>${link && isFriend(p.user_id) ? "</a>" : "</div>"}<div class="fa">${extra}</div></div>`;
}
function renderFriends() {
  const el = $("#amigos");
  if (!fr.loaded) { el.innerHTML = `<div class="sec-head"><div><h2 class="h">Amigos</h2></div></div>${hippoLoad("Procurando seus amigos…")}`; return }
  const fl = frAccepted(), inc = frIn(), out = frOut();
  let found = "";
  if (fr.found && fr.found.length) {
    found = `<div class="flist" style="margin-top:8px">${fr.found.map(f => {
      const r2 = frRel(f.user_id);
      const st = f.user_id === user.id ? `<span class="muted">Esse é você</span>` : r2 ? `<span class="muted">${r2.status === "accepted" ? "Já são amigos" : "Pedido pendente"}</span>` : `<button class="btn sm" data-fr="request" data-id="${f.user_id}">${ic("userplus")}Enviar pedido</button>`;
      return person(f, st, false);
    }).join("")}</div>`;
  } else if (fr.fmsg) found = `<div class="muted" style="margin:10px 6px 4px">${esc(fr.fmsg)}</div>`;
  const section = (title, n, body) => `<div class="blk"><div class="blk-h"><h3>${title}${n != null ? ` <span class="muted">· ${n}</span>` : ""}</h3></div>${body}</div>`;
  const incHTML = inc.length ? section(ic("userplus") + "Pedidos recebidos", inc.length, `<div class="flist">${inc.map(f => person(pOf(f.requester), `<button class="btn sm" data-fr="accept" data-id="${f.id}">${ic("check")}Aceitar</button><button class="btn ghost sm" data-fr="remove" data-id="${f.id}">Recusar</button>`)).join("")}</div>`) : "";
  const outHTML = out.length ? section(ic("clock") + "Pedidos enviados", out.length, `<div class="flist">${out.map(f => person(pOf(f.addressee), `<button class="btn ghost sm" data-fr="remove" data-id="${f.id}">Cancelar</button>`)).join("")}</div>`) : "";
  const v3 = caps.v3;
  const friendsHTML = section(ic("users") + "Meus amigos", fl.length, fl.length ? `<div class="flist">${fl.map(f => { const p = pOf(other(f)); return person(p, `${v3 ? `<button class="iconbtn" data-fr="chat" data-id="${p.user_id}" aria-label="Mensagem para ${esc(pName(p))}" title="Mensagem">${ic("message")}</button><button class="iconbtn" data-fr="poke" data-id="${p.user_id}" aria-label="Cutucar ${esc(pName(p))}" title="Cutucar">${ic("hand")}</button>` : ""}<a class="btn ghost sm" href="#amigo/${p.user_id}">Ver perfil</a>`) }).join("")}</div>` : `<div class="panel empty"><b>Nenhum amigo ainda</b>Busque pelo usuário ou pelo #ID de quem usa o site e envie um pedido.</div>`);
  const groupsHTML = section(ic("layers") + "Grupos", fr.groups.length, (fr.groups.length ? `<div class="gwrap">${fr.groups.map(g => { const ms = fr.members.filter(m => m.group_id === g.id); return `<button class="gcard" data-fr="group" data-id="${g.id}"><div class="gn">${esc(g.name)}</div><div class="stackav">${ms.slice(0, 5).map(m => `<div class="av xs">${avatar(m.user_id === user.id ? profile && profile.avatar : pOf(m.user_id).avatar)}</div>`).join("")}</div><div class="muted">${ms.length} membro${ms.length === 1 ? "" : "s"}${g.owner === user.id ? " · você é o dono" : ""}</div>${gSummary(g.id)}</button>` }).join("")}</div>` : `<div class="panel empty"><b>Nenhum grupo</b>Crie um grupo e chame seus amigos.</div>`));
  el.innerHTML = `<div class="sec-head"><div><h2 class="h">Amigos</h2><p class="muted">${profile && profile.tag ? `Seu ID é <button class="idtag big" data-act="copy-id" title="Copiar">${esc(uname())}#${esc(profile.tag)}</button>. Passe para seus amigos te acharem.` : "Adicione quem também usa o Jogos Enzola."}</p></div><button class="btn" data-fr="newgroup">${ic("plus")}Novo grupo</button></div>
  <div class="panel fsearch"><div class="bar" style="margin:0"><span class="inp grow">${ic("search")}<input type="search" id="fq" placeholder="${v3 ? "Usuário ou #ID (ex.: enzola ou #0427)" : "Usuário do seu amigo (ex.: enzola)"}" value="${esc(fr.q)}"></span><button class="btn" data-fr="search">${ic("userplus")}Buscar</button></div>${found}</div>
  ${incHTML}${friendsHTML}${outHTML}${groupsHTML}`;
}
async function frSearch() {
  fr.q = $("#fq").value; const u = fr.q.trim().replace(/^@/, "").toLowerCase();
  if (!u) { toast("Digite o usuário ou o #ID do seu amigo."); return }
  let r = caps.v3 ? await sb.rpc("find_user2", { q: u }) : { error: true };
  if (r.error) r = await sb.rpc("find_user", { uname: u.replace(/#.*$/, "") });
  if (r.error) { toast("Não foi possível buscar agora."); return }
  fr.found = (r.data || []).slice(0, 5); fr.fmsg = fr.found.length ? "" : "Ninguém encontrado. Confira o usuário ou o #ID.";
  for (const f of fr.found) fr.profs[f.user_id] = fr.profs[f.user_id] || f;
  renderFriends();
}
async function frDo(q, ok) {
  const { error } = await q;
  if (error) { toast("Não foi possível concluir. Tente de novo."); return false }
  if (ok) toast(ok); await loadFriends(); return true;
}

/* ---------- interações: cutucar, sugerir, mensagem ---------- */
async function poke(uid) {
  if (!caps.v3) return toast("Rode a migracao.sql para ativar as cutucadas.");
  const { error } = await sb.from("notifications").insert({ user_id: uid, actor: user.id, kind: "poke" });
  if (error) { toast(/minuto/i.test(error.message) ? "Espere um minuto para cutucar de novo." : "Essa pessoa não aceita cutucadas agora."); return }
  toast(`Você cutucou ${pName(pOf(uid))}! 👉`);
}
function openSuggest(uid, game) {
  if (!caps.v3) return toast("Rode a migracao.sql para ativar as sugestões.");
  const friends = frAccepted().map(f => pOf(other(f)));
  if (!friends.length) return toast("Adicione um amigo para sugerir jogos.");
  openSuggest.game = game || null;
  modalShell(`<h2>Sugerir um jogo</h2><p class="sub">Seu amigo recebe uma notificação com o jogo e pode adicionar direto à lista de desejos.</p>
    <div class="f">
      <label>Para<select id="sg-to">${friends.map(p => `<option value="${p.user_id}"${p.user_id === uid ? " selected" : ""}>${esc(pName(p))} (@${esc(p.username)})</option>`).join("")}</select></label>
      <div><div class="fld" style="margin-bottom:6px">Jogo</div><div id="sg-game">${sgGameHTML()}</div></div>
      <label>Recado (opcional)<textarea id="sg-note" rows="2" maxlength="300" placeholder="Ex.: joga esse, a história é incrível!"></textarea></label>
    </div>
    <div class="acts"><button class="btn ghost" data-close>Cancelar</button><button class="btn" data-fr="sg-send">${ic("send")}Enviar sugestão</button></div>`);
}
function sgGameHTML() {
  const g = openSuggest.game;
  if (g) return `<div class="sg-pick"><span class="mini">${cover(g)}</span><b>${esc(g.name)}</b><button class="link" data-fr="sg-change">Trocar</button></div>`;
  return `<span class="inp">${ic("search")}<input type="search" id="sg-q" placeholder="Busque um jogo ou escolha da sua biblioteca" autocomplete="off"></span><div class="sug" id="sg-res">${sorted(games.filter(x => x.status === "Finalizado" && (x.rating ?? 0) >= 8), "rating").slice(0, 4).map((x, i) => `<button class="it sgi" data-sg-lib="${x.id}"><span class="ib"><span class="mini">${cover(x)}</span><span>${esc(x.name)}<small class="meta"> · sua nota ${rateTxt(x)}</small></span></span></button>`).join("")}</div>`;
}
let sgTimer = null, sgFound = [];
document.addEventListener("input", e => {
  if (e.target.id !== "sg-q") return;
  clearTimeout(sgTimer); const q = e.target.value.trim(); if (q.length < 2) return;
  sgTimer = setTimeout(async () => {
    try {
      const r = await searchGames(q, 6); sgFound = r.map(rawgToDraft);
      const lib = games.filter(g => norm(g.name).includes(norm(q))).slice(0, 2);
      $("#sg-res").innerHTML = lib.map(x => `<button class="it sgi" data-sg-lib="${x.id}"><span class="ib"><span class="mini">${cover(x)}</span><span>${esc(x.name)} <small class="meta">· na sua biblioteca</small></span></span></button>`).join("") +
        sgFound.map((x, i) => `<button class="it sgi" data-sg-rawg="${i}"><span class="ib"><span class="mini">${x.cover_url ? `<img class="cv" alt="" referrerpolicy="no-referrer" src="${esc(x.cover_url)}">` : ""}</span><span>${esc(x.name)} <small class="meta">${esc(x.year)}</small></span></span></button>`).join("");
    } catch (er) { if ($("#sg-res")) $("#sg-res").innerHTML = `<p class="muted" style="padding:8px">${esc(er.user ? er.message : "Não foi possível pesquisar agora.")}</p>` }
  }, 350);
});
async function sendSuggest() {
  const g = openSuggest.game; if (!g) { toast("Escolha um jogo para sugerir."); return }
  const to = $("#sg-to").value, note = $("#sg-note").value.trim();
  const { error } = await sb.from("notifications").insert({ user_id: to, actor: user.id, kind: "suggest", payload: { name: g.name, rawg_id: g.rawg_id || null, steam_id: g.steam_id || null, cover_url: g.cover_url || null, note } });
  if (error) { toast("Essa pessoa não aceita sugestões agora."); return }
  closeModal(); toast(`Sugestão enviada para ${pName(pOf(to))}.`);
}
async function openChat(uid) {
  if (!caps.v3) return toast("Rode a migracao.sql para ativar as mensagens.");
  const p = pOf(uid);
  chat = { uid, msgs: null };
  modalShell(`<div class="chat-h"><a class="fhead" href="#amigo/${uid}" data-close><span class="av xs">${avatar(p.avatar)}</span><b>${esc(pName(p))}</b></a></div>
    <div class="chat-list" id="chat-list"><div class="sk" style="height:40px;width:60%;border-radius:14px"></div><div class="sk" style="height:40px;width:50%;border-radius:14px;margin-left:auto"></div></div>
    <form class="chat-form" id="chat-form"><textarea id="chat-in" rows="1" maxlength="1000" placeholder="Escreva uma mensagem…" aria-label="Mensagem"></textarea><button class="btn" aria-label="Enviar">${ic("send")}</button></form>`, false);
  $(".modal").classList.add("chat");
  const [a, b] = await Promise.all([
    sb.from("messages").select("*").eq("sender", user.id).eq("recipient", uid).order("created_at", { ascending: false }).limit(100),
    sb.from("messages").select("*").eq("sender", uid).eq("recipient", user.id).order("created_at", { ascending: false }).limit(100),
  ]);
  if (!chat || chat.uid !== uid) return;
  chat.msgs = [...(a.data || []), ...(b.data || [])].sort((x, y) => new Date(x.created_at) - new Date(y.created_at));
  renderChat();
  if ((b.data || []).some(m => !m.read_at)) {
    await sb.from("messages").update({ read_at: new Date().toISOString() }).eq("sender", uid).eq("recipient", user.id).is("read_at", null);
    delete fr.unread[uid]; updateBadge();
  }
  const ids = fr.notifs.filter(n => n.kind === "message" && n.actor === uid && !n.read_at).map(n => n.id);
  if (ids.length) { await sb.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids); fr.notifs.forEach(n => { if (ids.includes(n.id)) n.read_at = new Date().toISOString() }); updateBell() }
  if (!matchMedia("(pointer:coarse)").matches) $("#chat-in") && $("#chat-in").focus();
}
function renderChat() {
  const box = $("#chat-list"); if (!box || !chat || !chat.msgs) return;
  let lastDay = "";
  box.innerHTML = chat.msgs.length ? chat.msgs.map(m => {
    const day = new Date(m.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
    const sep = day !== lastDay ? `<p class="chat-day">${day}</p>` : ""; lastDay = day;
    return `${sep}<div class="msg ${m.sender === user.id ? "me" : ""}"><p>${esc(m.body).replace(/\n/g, "<br>")}</p><time>${new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div>`;
  }).join("") : `<p class="chat-empty">Comece a conversa. Que tal comentar o jogo que ${esc(pName(pOf(chat.uid)))} está jogando?</p>`;
  box.scrollTop = box.scrollHeight;
}
async function sendChat() {
  const inp = $("#chat-in"), body = inp.value.trim(); if (!body || !chat) return;
  inp.value = ""; inp.style.height = "";
  const tmp = { id: "tmp" + Date.now(), sender: user.id, recipient: chat.uid, body, created_at: new Date().toISOString() };
  chat.msgs.push(tmp); renderChat();
  const { data, error } = await sb.from("messages").insert({ recipient: chat.uid, body }).select().single();
  if (error) { chat.msgs = chat.msgs.filter(m => m !== tmp); renderChat(); inp.value = body; toast("Não foi possível enviar. Essa pessoa pode ter desativado as mensagens."); return }
  Object.assign(tmp, data);
}
document.addEventListener("submit", e => { if (e.target.id === "chat-form") { e.preventDefault(); sendChat() } });
document.addEventListener("keydown", e => { if (e.target.id === "chat-in" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat() } });
document.addEventListener("input", e => { if (e.target.id === "chat-in") { e.target.style.height = "auto"; e.target.style.height = Math.min(120, e.target.scrollHeight) + "px" } });

/* ---------- notificações ---------- */
const NTXT = {
  poke: n => `<b>${esc(pName(pOf(n.actor)))}</b> cutucou você 👉`,
  suggest: n => `<b>${esc(pName(pOf(n.actor)))}</b> sugeriu <b>${esc(n.payload.name || "um jogo")}</b>${n.payload.note ? `<span class="nnote">“${esc(n.payload.note)}”</span>` : ""}`,
  message: n => `<b>${esc(pName(pOf(n.actor)))}</b> mandou uma mensagem`,
  friend_request: n => `<b>${esc(pName(pOf(n.actor)))}</b> quer ser seu amigo`,
  friend_accept: n => `<b>${esc(pName(pOf(n.actor)))}</b> aceitou seu pedido de amizade`,
  tag: n => `<b>${esc(pName(pOf(n.actor)))}</b> marcou você ${n.payload.in === "comment" ? "num comentário" : "numa publicação"}${n.payload.text ? `<span class="nnote">“${esc(n.payload.text)}”</span>` : ""}`,
  like: n => `<b>${esc(pName(pOf(n.actor)))}</b> curtiu sua publicação`,
  comment: n => `<b>${esc(pName(pOf(n.actor)))}</b> comentou na sua publicação${n.payload.text ? `<span class="nnote">“${esc(n.payload.text)}”</span>` : ""}`,
};
const NICON = { poke: "hand", suggest: "gift", message: "message", friend_request: "userplus", friend_accept: "users", tag: "userplus", like: "heart", comment: "message" };
function nActions(n) {
  const a = n.actor;
  if (n.kind === "poke") return `<button class="btn ghost sm" data-fr="poke" data-id="${a}">${ic("hand")}Cutucar de volta</button>`;
  if (n.kind === "message") return `<button class="btn ghost sm" data-fr="chat" data-id="${a}">${ic("message")}Responder</button>`;
  if (n.kind === "suggest") return `${gameHref(n.payload) ? `<a class="btn ghost sm" href="#${gameHref(n.payload)}">Ver jogo</a>` : ""}<button class="btn ghost sm" data-nt="addwish" data-id="${n.id}">${ic("bookmark")}Quero</button>`;
  if (n.kind === "friend_request") { const r = fr.rows.find(f => f.requester === a && f.addressee === user.id && f.status === "pending"); return r ? `<button class="btn sm" data-fr="accept" data-id="${r.id}">${ic("check")}Aceitar</button>` : `<a class="btn ghost sm" href="#amigos">Ver amigos</a>` }
  if (n.kind === "friend_accept") return `<a class="btn ghost sm" href="#amigo/${a}">Ver perfil</a>`;
  if (n.kind === "tag" || n.kind === "like" || n.kind === "comment") return `<button class="btn ghost sm" data-go="inicio">Ver no feed</button>`;
  return "";
}
async function loadNotifs() {
  if (!caps.v3 || !user) { updateBell(); return }
  const { data, error } = await sb.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(40);
  if (error) return;
  fr.notifs = (data || []).sort((x, y) => new Date(y.created_at) - new Date(x.created_at)); fr.nLoaded = true;
  await loadProfiles(fr.notifs.map(n => n.actor)); updateBell();
}
function updateBell() {
  const b = $("#nt-badge"); if (!b) return;
  const n = fr.notifs.filter(x => !x.read_at).length; b.hidden = !n; b.textContent = n > 9 ? "9+" : n;
  $("#bell").hidden = !caps.v3 && !!user;
  if (!$("#npanel").hidden) renderNotifs();
}
function renderNotifs() {
  const el = $("#npanel");
  el.innerHTML = `<div class="np-h"><b>Notificações</b>${fr.notifs.some(n => !n.read_at) ? `<button class="link" data-nt="readall">Marcar todas como lidas</button>` : ""}</div>${pushPromo()}
    <div class="np-list">${fr.notifs.length ? fr.notifs.map(n => `<div class="nt ${n.read_at ? "" : "new"}"><span class="av xs">${avatar(pOf(n.actor).avatar)}</span><span class="nt-ic ${n.kind}">${ic(NICON[n.kind] || "bell")}</span>
      <div class="nt-b"><p>${(NTXT[n.kind] || (() => ""))(n)}</p>${n.kind === "suggest" && n.payload.cover_url ? `<span class="nt-cover"><img alt="" referrerpolicy="no-referrer" loading="lazy" src="${esc(n.payload.cover_url)}"></span>` : ""}<time>${rel(n.created_at)}</time><div class="nt-a">${nActions(n)}</div></div></div>`).join("")
      : `<div class="empty" style="padding:28px 16px"><b>Nada por aqui</b>Cutucadas, sugestões e mensagens dos amigos aparecem aqui.</div>`}</div>`;
}
async function markAllRead() {
  const ids = fr.notifs.filter(n => !n.read_at).map(n => n.id); if (!ids.length) return;
  const now = new Date().toISOString(); fr.notifs.forEach(n => { if (!n.read_at) n.read_at = now });
  updateBell();
  await sb.from("notifications").update({ read_at: now }).eq("user_id", user.id).is("read_at", null);
}
async function sysNotify(title, body) {
  if (lsGet("pref-push") || !lsGet("pref-sysnotif") || !("Notification" in window) || Notification.permission !== "granted" || !document.hidden) return;
  try { const r = await navigator.serviceWorker.ready; r.showNotification(title, { body, icon: "icons/notif.png", badge: "icons/badge.png", tag: "enzola" }) }
  catch (e) { try { new Notification(title, { body, icon: "icons/notif.png" }) } catch (e2) { } }
}
async function onNotif(n) {
  if (fr.notifs.some(x => x.id === n.id)) return;
  await loadProfiles([n.actor]);
  fr.notifs.unshift({ ...n, payload: n.payload || {} }); updateBell();
  const who = pName(pOf(n.actor));
  const txt = { poke: `${who} cutucou você! 👉`, suggest: `${who} sugeriu ${n.payload && n.payload.name || "um jogo"} para você`, message: `Nova mensagem de ${who}`, friend_request: `${who} quer ser seu amigo`, friend_accept: `${who} aceitou seu pedido de amizade`, tag: `${who} marcou você`, like: `${who} curtiu sua publicação`, comment: `${who} comentou na sua publicação` }[n.kind];
  if (n.kind === "message" && chat && chat.uid === n.actor && $("#chat-list")) return;
  if (txt) { toast(txt); sysNotify("Jogos Enzola", txt) }
  if (n.kind === "poke") { const b = $("#bell"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); if (lsGet("pref-vibrate") !== false && navigator.vibrate) navigator.vibrate([90, 60, 90]) }
}
async function onMessage(m) {
  if (chat && chat.uid === m.sender && $("#chat-list")) {
    if (!chat.msgs.some(x => x.id === m.id)) { chat.msgs.push(m); renderChat() }
    await sb.from("messages").update({ read_at: new Date().toISOString() }).eq("id", m.id);
    const nn = fr.notifs.find(n => n.kind === "message" && n.actor === m.sender && !n.read_at); if (nn) { nn.read_at = new Date().toISOString(); updateBell() }
    return;
  }
  fr.unread[m.sender] = (fr.unread[m.sender] || 0) + 1; updateBadge();
  if (tab === "amigos") renderFriends(); if (tab === "amigo") renderFriendPage();
}
function subscribeRT() {
  if (!sb || !sb.channel || !user) return; unsubRT();
  const me = user.id;
  try {
    rtChans.push(sb.channel("amizades-" + me).on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, p => {
      const r = p.new || {};
      if (!caps.v3) {
        if (p.eventType === "INSERT" && r.addressee === me) toast("Você recebeu um pedido de amizade!");
        if (p.eventType === "UPDATE" && r.requester === me && r.status === "accepted") toast("Seu pedido de amizade foi aceito!");
      }
      loadFriends();
    }).subscribe());
    if (caps.v3) {
      rtChans.push(sb.channel("notif-" + me).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${me}` }, p => onNotif(p.new)).subscribe());
      rtChans.push(sb.channel("msg-" + me).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient=eq.${me}` }, p => onMessage(p.new)).subscribe());
    }
  } catch (e) { }
}
function unsubRT() { for (const c of rtChans) { try { sb.removeChannel(c) } catch (e) { } } rtChans = [] }
async function socialStart() { await loadFriends(); await applyInvite(); await loadNotifs(); subscribeRT(); pushSync() }
function socialReset() { if (typeof hmReset === "function") hmReset(); unsubRT(); fr = newFr(); fpv = null; chat = null; updateBadge(); updateBell() }

/* ---------- jogos dos amigos (para "amigos que têm") ---------- */
async function friendsWithGame(name) {
  if (!user) return [];
  if (!fr.loaded) await loadFriends();
  const ids = frAccepted().map(other); if (!ids.length) return [];
  if (!fr.allGames) { const r = await sb.from("games").select("user_id,name,status,rating").in("user_id", ids); fr.allGames = r.data || [] }
  const n = norm(name);
  return fr.allGames.filter(g => norm(g.name) === n).map(g => ({ g, p: pOf(g.user_id) }));
}

/* ---------- página do amigo ---------- */
async function openFriendPage(uid) {
  if (!fr.loaded) { renderFriendPage(); await loadFriends() }
  if (fpv && fpv.uid === uid && fpv.games) { renderFriendPage(); return }
  fpv = { uid, games: null, sub: "geral", q: "", st: "" }; renderFriendPage();
  await loadProfiles([uid]);
  const { data, error } = await sb.from("games").select("*").eq("user_id", uid).order("n");
  if (!fpv || fpv.uid !== uid) return;
  fpv.games = error ? [] : (data || []); fpv.err = !!error; renderFriendPage();
}
function compat(gs) {
  const mine = new Map(games.map(g => [norm(g.name), g]));
  const common = gs.filter(g => mine.has(norm(g.name)));
  const both = common.filter(g => g.rating != null && mine.get(norm(g.name)).rating != null);
  const pct = both.length ? Math.round(100 - both.reduce((a, g) => a + Math.abs(g.rating - mine.get(norm(g.name)).rating), 0) / both.length * 10) : null;
  return { mine, common, both, pct: pct == null ? null : Math.max(0, pct) };
}
function renderFriendPage() {
  const el = $("#amigo"); if (tab !== "amigo") return;
  if (!fpv || !fr.loaded || !fpv.games) { el.innerHTML = hippoLoad("Nadando até o perfil do seu amigo…", "big"); return }
  const uid = fpv.uid, p = pOf(uid), gs = fpv.games, friend = isFriend(uid), rel0 = frRel(uid);
  if (!friend) {
    el.innerHTML = `<button class="btn ghost sm" data-go="amigos">${ic("back")}Amigos</button>${bannerHTML(p, null)}</div><div class="phead"><div class="av lg">${avatar(p.avatar)}</div><div class="pid"><h1>${esc(pName(p))}</h1><div class="un">@${esc(p.username)}${tagOf(p)}</div></div></div>
    <div class="panel empty" style="margin-top:24px"><b>Vocês ainda não são amigos</b>${rel0 ? "O pedido de amizade está pendente." : "Envie um pedido para ver a biblioteca e conversar."}<br>${rel0 ? "" : `<button class="btn sm" data-fr="request" data-id="${uid}">${ic("userplus")}Enviar pedido</button>`}</div>`;
    return;
  }
  const cur = gs.find(g => g.id === p.now_playing) || gs.find(g => g.status === "Jogando");
  const favs = (p.favorites || []).map(id => gs.find(g => g.id === id)).filter(Boolean).slice(0, 5);
  const { fin, avg, hrs } = statsOf(gs), { mine, common, pct } = compat(gs);
  const wl = gs.filter(g => g.wishlist || g.status === "Não comprado");
  const lib = gs.filter(g => !(g.wishlist || g.status === "Não comprado"));
  const since = rel0 && rel0.created_at ? new Date(rel0.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "";
  const unread = fr.unread[uid] || 0, v3 = caps.v3;
  const sub = fpv.sub;
  const subs = [["geral", "Visão geral"], ["biblioteca", `Biblioteca · ${lib.length}`], ["comum", `Em comum · ${common.length}`], ["desejos", `Desejos · ${wl.length}`]];
  gs.forEach(g => qvGames.set("f:" + g.id, { g, owner: pName(p) }));
  const gameCard = g => `<button class="card" data-qv="f:${g.id}" aria-label="Ver resumo de ${esc(g.name)}"><div class="poster"><span class="tag badge ${stClass(g.status)}">${esc(g.status)}</span>${cover(g)}</div><div class="t">${esc(g.name)}</div><div class="meta">${[g.platform, g.rating != null ? "nota " + rateTxt(g) : ""].filter(Boolean).map(esc).join(" · ")}</div></button>`;
  let body = "";
  if (sub === "geral") {
    const tiers = TIERS.map(([t, c]) => [t, c, gs.filter(g => g.tier === t).sort((a, b) => (a.tier_order || 0) - (b.tier_order || 0))]).filter(x => x[2].length);
    const act = activity(gs);
    body = `<div class="pgrid"><div>
      ${cur ? `<div class="blk"><div class="blk-h"><h3>${ic("play")}Jogando agora</h3></div><div class="now nohover"><button class="poster qv-btn" data-qv="f:${cur.id}" aria-label="Ver resumo de ${esc(cur.name)}">${cover(cur)}</button><div class="now-b"><span class="k">Jogando agora</span><span class="t">${esc(cur.name)}</span><span class="m">${[cur.platform, cur.genre, hoursTxt(cur.hours)].filter(Boolean).map(esc).join(" · ")}</span>${cur.review ? `<span class="q">“${esc(cur.review)}”</span>` : ""}${mine.has(norm(cur.name)) ? `<span class="kchip br">você também tem</span>` : ""}</div></div></div>` : ""}
      ${favs.length ? `<div class="blk"><div class="blk-h"><h3>${ic("heart")}Favoritos</h3></div><div class="favgrid">${favs.map((g, i) => `<button class="fav" data-qv="f:${g.id}" aria-label="Ver resumo de ${esc(g.name)}"><div class="poster"><span class="rank">${i + 1}</span>${cover(g)}</div><div class="n">${esc(g.name)}</div><div class="r">${g.rating != null ? "Nota " + rateTxt(g) : ""}</div></button>`).join("")}</div></div>` : ""}
      ${tiers.length ? `<div class="blk"><div class="blk-h"><h3>${ic("layers")}Tier list</h3></div>${tiers.map(([t, c, l]) => `<div class="tier"><div class="lab" style="background:${c}">${t}</div><div class="zone">${l.map(g => `<button class="tc" data-qv="f:${g.id}" title="${esc(g.name)}">${cover(g)}</button>`).join("")}</div></div>`).join("")}</div>` : ""}
      ${!cur && !favs.length && !tiers.length ? `<div class="panel empty"><b>Perfil ainda vazio</b>${esc(pName(p))} ainda não montou favoritos nem tier list.</div>` : ""}
    </div><aside>
      <div class="blk"><div class="blk-h"><h3>${ic("clock")}Atividade recente</h3></div><div class="panel act">${act.length ? act.map(e => { const [c, i] = actIcon(e); return `<div class="actrow"><span class="dot ${c}">${ic(i)}</span><span class="tx">${actText(e)}<span class="tm">${rel(e.t)}</span></span></div>` }).join("") : `<div class="empty" style="padding:24px 12px">Sem atividade ainda.</div>`}</div></div>
    </aside></div>`;
  } else if (sub === "biblioteca") {
    const q = norm(fpv.q), list = lib.filter(g => (!q || norm(g.name).includes(q)) && (!fpv.st || g.status === fpv.st));
    body = `<div class="bar"><span class="inp grow">${ic("search")}<input type="search" id="fpq" placeholder="Buscar na biblioteca de ${esc(pName(p))}" value="${esc(fpv.q)}"></span></div>
      <div class="chips">${[["", "Todos"], ["Finalizado", "Finalizados"], ["Jogando", "Jogando"], ["Não iniciado", "Não iniciados"]].map(([v, l]) => `<button class="chip" data-fpst="${v}" aria-pressed="${fpv.st === v}">${l}</button>`).join("")}</div>
      <div class="grid">${list.length ? list.map(gameCard).join("") : empty("Nada encontrado", "Tente outro nome ou filtro.")}</div>`;
  } else if (sub === "comum") {
    const theyFinished = lib.filter(g => g.status === "Finalizado" && (g.rating ?? 0) >= 8 && !mine.has(norm(g.name))).slice(0, 8);
    body = `${common.length ? `<div class="panel cmp"><div class="cmp-h"><span></span><span>Jogo</span><span>Você</span><span>${esc(pName(p))}</span></div>${common.map(g => { const m = mine.get(norm(g.name)); const diff = g.rating != null && m.rating != null ? Math.abs(g.rating - m.rating) : null; return `<div class="cmp-r"><span class="mini">${cover(g)}</span><span class="cmn-n">${esc(g.name)}${diff != null ? `<small class="${diff <= 1 ? "agree" : diff >= 3 ? "disagree" : ""}">${diff <= 1 ? "Notas parecidas" : diff >= 3 ? "Opiniões bem diferentes" : ""}</small>` : ""}</span><span><b>${rateTxt(m)}</b><small>${esc(m.status)}</small></span><span><b>${rateTxt(g)}</b><small>${esc(g.status)}</small></span></div>` }).join("")}</div>` : `<div class="panel empty"><b>Nenhum jogo em comum ainda</b>Que tal começar por uma recomendação abaixo?</div>`}
      ${theyFinished.length ? `<div class="blk" style="margin-top:28px"><div class="blk-h"><h3>${ic("star")}${esc(pName(p))} recomenda (zerou com nota alta e você não tem)</h3></div><div class="grid">${theyFinished.map(gameCard).join("")}</div></div>` : ""}`;
  } else {
    body = `<p class="hint" style="margin:0 0 14px">Ideias de presente: toque num jogo para ver onde está mais barato.</p><div class="grid">${wl.length ? wl.map(gameCard).join("") : empty("Lista de desejos vazia", `${esc(pName(p))} ainda não guardou jogos para comprar.`)}</div>`;
  }
  el.innerHTML = `<button class="btn ghost sm fp-back" data-go="amigos">${ic("back")}Amigos</button>
  ${bannerHTML(p, cur)}</div>
  <div class="phead">
    <div class="av lg">${avatar(p.avatar)}</div>
    <div class="pid"><h1>${esc(pName(p))}</h1><div class="un">@${esc(p.username)}${tagOf(p)}${since ? ` · amigos desde ${since}` : ""}</div></div>
    <div class="pstats">
      <div class="pstat"><b>${gs.length}</b><span>Jogos</span></div><div class="pstat"><b>${fin}</b><span>Zerados</span></div>
      <div class="pstat"><b>${avg}</b><span>Nota média</span></div>${hrs ? `<div class="pstat"><b>${Math.round(hrs)}</b><span>Horas</span></div>` : ""}
      ${pct != null ? `<div class="pstat hl"><b>${pct}%</b><span>Compatível</span></div>` : ""}
    </div>
  </div>
  ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ""}
  <div class="fp-acts">
    ${v3 ? `<button class="btn" data-fr="chat" data-id="${uid}">${ic("message")}Mensagem${unread ? ` <span class="ubadge light">${unread}</span>` : ""}</button>
    <button class="btn ghost" data-fr="poke" data-id="${uid}">${ic("hand")}Cutucar</button>
    <button class="btn ghost" data-fr="suggest" data-id="${uid}">${ic("gift")}Sugerir jogo</button>` : ""}
    <button class="btn ghost" data-fp-sub="comum">${ic("users")}Comparar</button>
    <button class="btn ghost danger-text" data-fr="unfriend" data-id="${rel0.id}" title="Remover amigo">${ic("trash")}<span>Remover amigo</span></button>
  </div>
  <div class="subtabs" role="tablist">${subs.map(([k, l]) => `<button role="tab" aria-selected="${sub === k}" data-fp-sub="${k}">${l}</button>`).join("")}</div>
  <div class="fp-body">${body}</div>`;
}
document.addEventListener("input", e => { if (e.target.id === "fpq" && fpv) { fpv.q = e.target.value; const pos = e.target.selectionStart; renderFriendPage(); const i = $("#fpq"); if (i) { i.focus(); i.setSelectionRange(pos, pos) } } });

/* ---------- grupos ---------- */
function openNewGroup() {
  const fl = frAccepted();
  modalShell(`<h2>Novo grupo</h2><p class="sub">Dê um nome e escolha amigos para entrar.</p>
  <div class="f"><label>Nome do grupo<input type="text" id="g-name" maxlength="40" placeholder="Ex.: Squad de sábado"></label>
  <div><div class="fld" style="margin-bottom:6px">Amigos</div><div class="picker">${fl.length ? fl.map(f => { const p = pOf(other(f)); return `<label class="pk"><input type="checkbox" data-gk="${p.user_id}"><span class="av xs">${avatar(p.avatar)}</span><span>${esc(pName(p))} <span class="muted">@${esc(p.username || "")}</span></span></label>` }).join("") : `<div class="empty" style="padding:16px">Você ainda não tem amigos. Pode criar o grupo e adicionar depois.</div>`}</div></div></div>
  <div class="acts"><button class="btn ghost" data-close>Cancelar</button><button class="btn" data-fr="gcreate">Criar grupo</button></div>`);
  $("#g-name").focus();
}
/* ---------- ofensiva e metas do grupo (Enzolingo) ---------- */
const GRP_TIERS = [{ pts: 100, coins: 20 }, { pts: 250, coins: 40 }, { pts: 500, coins: 80 }, { pts: 1000, coins: 150 }, { pts: 2000, coins: 300, skin: "ff" }];
const spDay = (off = 0) => { const d = new Date(Date.now() - off * 864e5); return d.toLocaleDateString("sv", { timeZone: "America/Sao_Paulo" }) };
function gStats(gid) {
  const rows = (fr.gact || []).filter(r => r.group_id === gid), byDay = {};
  let total = 0; for (const r of rows) { total += r.points; if (r.points > 0) (byDay[r.day] = byDay[r.day] || new Set()).add(r.user_id) }
  const act = d => (byDay[d] ? byDay[d].size : 0) >= 2;
  let off = act(spDay(0)) ? 0 : 1, streak = 0; while (act(spDay(off))) { streak++; off++ }
  return { total, streak, todayN: byDay[spDay(0)] ? byDay[spDay(0)].size : 0, todayOn: act(spDay(0)) };
}
const gSummary = gid => { const st = gStats(gid); return `<div class="g-sum"><span class="g-fire${st.todayOn ? " on" : ""}">🔥 ${st.streak}</span><span class="muted">${st.total} pts</span></div>` };
async function gClaim(gid, i) {
  const t = GRP_TIERS[i]; if (!t || typeof lgAward !== "function") return;
  const { data, error } = await sb.rpc("group_claim", { gid, p_tier: i });
  if (error || !data) { toast("Meta ainda não liberada ou já resgatada."); return }
  fr.gclaims.push({ group_id: gid, user_id: user.id, tier: i });
  lgAward(t.coins);
  if (t.skin) { lg = lg || lgLoad(); lg.skins = { ...(lg.skins || {}), [t.skin]: true }; lgSave(true) }
  toast(t.skin ? `Meta máxima! +${t.coins} Enzola Coins e a skin “Enzola Free Fire” 🔥` : `+${t.coins} Enzola Coins resgatados!`);
  if (typeof lgBeep === "function") lgBeep("ok"); openGroup(gid);
}
function groupLingoHTML(gid) {
  const st = gStats(gid), done = new Set((fr.gclaims || []).filter(c => c.group_id === gid).map(c => c.tier)), max = GRP_TIERS[GRP_TIERS.length - 1].pts;
  const pct = Math.min(100, st.total / max * 100);
  return `<div class="g-lingo"><div class="g-flame${st.todayOn ? " on" : ""}"><span class="g-fi" aria-hidden="true">🔥</span><div><b>${st.streak} dia${st.streak === 1 ? "" : "s"} de ofensiva</b><small class="muted">${st.todayOn ? "Ofensiva de hoje garantida!" : `Hoje: ${st.todayN}/2 pessoas fizeram atividade no Enzolingo`}</small></div></div>
    <div class="g-pts"><div class="g-ptsh"><b>${st.total} pontos do grupo</b><small class="muted">meta final: ${max}</small></div><div class="g-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${Math.min(st.total, max)}"><i style="width:${pct}%"></i></div></div>
    <div class="g-tiers">${GRP_TIERS.map((t, i) => { const ok = st.total >= t.pts, got = done.has(i);
      return `<div class="g-tier${ok ? " ok" : ""}${got ? " got" : ""}"><b>${t.pts}</b><span class="g-rw">${typeof gbI === "function" ? gbI() : ""}+${t.coins}</span>${t.skin ? `<img class="g-skin" src="loja/h-ff.webp" alt="Skin Enzola Free Fire">` : ""}
      ${got ? `<small>${ic("check")}Resgatado</small>` : ok ? `<button class="btn sm" data-fr="gclaim" data-gid="${gid}" data-i="${i}">Resgatar</button>` : `<small class="muted">${t.pts - st.total} pts</small>`}</div>` }).join("")}</div>
    <p class="muted g-how">Cada lição, desafio ou Show do Enzolão de qualquer membro soma pontos para o grupo. A chama acende quando 2 ou mais pessoas fazem atividade no mesmo dia.</p></div>`;
}
function openGroup(gid) {
  const g = fr.groups.find(x => x.id === gid); if (!g) { closeModal(); return }
  const own = g.owner === user.id, ms = fr.members.filter(m => m.group_id === gid);
  const addable = frAccepted().map(f => pOf(other(f))).filter(p => !ms.some(m => m.user_id === p.user_id));
  modalShell(`<h2>${esc(g.name)}</h2><p class="sub">${ms.length} membro${ms.length === 1 ? "" : "s"}</p>
  ${groupLingoHTML(gid)}
  <div class="flist">${ms.map(m => { const me = m.user_id === user.id, p = me ? { ...(profile || {}), username: uname(), user_id: user.id } : pOf(m.user_id);
    return person(p, `${m.user_id === g.owner ? `<span class="badge st-Jogando">dono</span>` : ""}${own && !me ? `<button class="iconbtn" data-fr="gkick" data-gid="${gid}" data-id="${m.user_id}" aria-label="Remover do grupo">${ic("x")}</button>` : ""}`, !me) }).join("")}</div>
  ${own ? `<div class="bar" style="margin:14px 0 0"><select class="grow" id="g-add"><option value="">Adicionar amigo…</option>${addable.map(p => `<option value="${p.user_id}">${esc(pName(p))} (@${esc(p.username || "")})</option>`).join("")}</select><button class="btn" data-fr="gadd" data-gid="${gid}">Adicionar</button></div>` : ""}
  <div class="acts">${own ? `<button class="btn danger left" data-fr="gdel" data-gid="${gid}">${ic("trash")}Excluir grupo</button>` : `<button class="btn danger left" data-fr="gleave" data-gid="${gid}">Sair do grupo</button>`}<button class="btn ghost" data-close>Fechar</button></div>`);
}

/* ---------- eventos ---------- */
document.addEventListener("click", async e => {
  const c = s => e.target.closest(s);
  if (c("#bell")) { const p = $("#npanel"); p.hidden = !p.hidden; $("#bell").setAttribute("aria-expanded", String(!p.hidden)); $("#menu").hidden = true; if (!p.hidden) { renderNotifs(); if (!fr.nLoaded) loadNotifs() } return }
  let b;
  if (b = c("[data-nt]")) {
    const a = b.dataset.nt;
    if (a === "readall") markAllRead();
    else if (a === "push-on") { if (await enablePush()) renderNotifs() }
    else if (a === "push-no") { lsSet("push-promo-off", true); renderNotifs() }
    else if (a === "addwish") {
      const n = fr.notifs.find(x => x.id === b.dataset.id); if (!n) return;
      $("#npanel").hidden = true;
      if (gameHref(n.payload)) location.hash = gameHref(n.payload);
      else { const ins = await create({ name: n.payload.name, cover_url: n.payload.cover_url, status: "Não comprado", wishlist: true }); if (ins) toast(`${n.payload.name} entrou na sua lista de desejos.`) }
    }
    return;
  }
  if (b = c("[data-fp-sub]")) { fpv.sub = b.dataset.fpSub; renderFriendPage(); $(".subtabs") && $(".subtabs").scrollIntoView({ block: "nearest", behavior: "smooth" }); return }
  if (b = c("[data-fpst]")) { fpv.st = b.dataset.fpst; renderFriendPage(); return }
  if (b = c("[data-sg-lib]")) { const g = gameById(b.dataset.sgLib); openSuggest.game = { name: g.name, rawg_id: g.rawg_id, steam_id: g.steam_id || null, cover_url: g.cover_url }; $("#sg-game").innerHTML = sgGameHTML(); return }
  if (b = c("[data-sg-rawg]")) { const g = sgFound[+b.dataset.sgRawg]; openSuggest.game = { name: g.name, rawg_id: g.rawg_id || null, steam_id: g.steam_id || null, cover_url: g.cover_url }; $("#sg-game").innerHTML = sgGameHTML(); return }
  b = c("[data-fr]"); if (!b) return;
  const a = b.dataset.fr, id = b.dataset.id, gid = b.dataset.gid;
  if (a === "search") return frSearch();
  if (a === "chat") { $("#npanel").hidden = true; return openChat(id) }
  if (a === "poke") return poke(id);
  if (a === "suggest") return openSuggest(id, null);
  if (a === "sg-change") { openSuggest.game = null; $("#sg-game").innerHTML = sgGameHTML(); $("#sg-q").focus(); return }
  if (a === "sg-send") return sendSuggest();
  if (a === "request") { await frDo(sb.from("friendships").insert({ addressee: id }), "Pedido enviado!"); fr.found = null; if (tab === "amigos") renderFriends(); else if (tab === "amigo") renderFriendPage(); return }
  if (a === "accept") { await frDo(sb.from("friendships").update({ status: "accepted" }).eq("id", id), "Agora vocês são amigos!"); if (!$("#npanel").hidden) renderNotifs(); return }
  if (a === "remove") return frDo(sb.from("friendships").delete().eq("id", id));
  if (a === "unfriend") { if (!b.dataset.sure) { b.dataset.sure = 1; b.classList.add("sure"); toast("Toque de novo para remover este amigo."); return } const ok = await frDo(sb.from("friendships").delete().eq("id", id), "Amigo removido."); if (ok && tab === "amigo") location.hash = "amigos"; return }
  if (a === "newgroup") return openNewGroup();
  if (a === "group") return openGroup(id);
  if (a === "gclaim") return gClaim(gid, +b.dataset.i);
  if (a === "gcreate") {
    const name = $("#g-name").value.trim(); if (!name) { toast("Dê um nome ao grupo."); return }
    if (gBusy) return; gBusy = true;
    try {
      const { data, error } = await sb.from("groups").insert({ name }).select().single();
      if (error) { toast("Não foi possível criar o grupo."); return }
      const ids = [user.id, ...$$("[data-gk]:checked").map(x => x.dataset.gk)];
      const r = await sb.from("group_members").insert(ids.map(u => ({ group_id: data.id, user_id: u })));
      if (r.error) toast("Grupo criado, mas alguns membros não entraram."); else toast("Grupo criado!");
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

function pushPromo() {
  if (pushOn() || lsGet("push-promo-off") || !("Notification" in window) || Notification.permission === "denied") return "";
  const ios = isIOS() && !standalone();
  return `<div class="np-push">${ic("phone")}<span><b>Receber no celular</b>${ios ? "No iPhone, instale o app na tela de início para receber cutucadas e mensagens." : "Cutucadas, mensagens e sugestões chegam como notificação, mesmo com o site fechado."}</span>
    <div class="np-push-a">${ios ? `<button class="btn sm" data-act="install">Instalar app</button>` : `<button class="btn sm" data-nt="push-on">Ativar</button>`}<button class="link" data-nt="push-no">Agora não</button></div></div>`;
}
