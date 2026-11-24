/* Jogos Enzola — aba "Salas" (estilo Discord): cada grupo vira um servidor com canal de texto e salas de voz.
   Voz, câmera e transmissão de tela usam WebRTC direto entre os participantes (malha, até SL.max pessoas por sala).
   A sinalização passa por canais privados do Supabase Realtime ("call:<id do grupo>"), liberados só para membros do grupo
   (políticas em realtime.messages, ver migracao.sql).
   Conexão em redes difíceis (4G, firewalls): o site pede um servidor TURN à função "enzola" (ação "turn") ou usa
   CFG.ICE_SERVERS do config.js: [{urls:"turn:...", username:"...", credential:"..."}].
   Celular: os navegadores de Android e iPhone não permitem transmitir a tela; lá o botão oferece a câmera. */
const SL = {
  max: 6,
  rooms: [{ id: "v1", name: "Sala 1" }, { id: "v2", name: "Sala 2" }, { id: "v3", name: "Sala 3" }],
  stun: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
  turn: null, turnAt: 0,
  grace: 12000,   // quem some da presença com a conexão ainda ativa ganha esse tempo para voltar (queda rápida de internet)
  ice() { return { iceServers: [...this.stun, ...((typeof CFG !== "undefined" && CFG.ICE_SERVERS) || []), ...(this.turn || [])] } },
};
const SL_DEV = Math.random().toString(36).slice(2, 10);   // identifica esta aba/aparelho
const slNew = () => ({ gid: null, ch: "geral", pane: "list", msgs: {}, loaded: {}, chans: {}, chst: {}, roster: {}, live: {}, hide: {}, tch: null, call: null, speak: {}, draft: "", vel: {}, open: false, blocked: false, elsewhere: null });
let sl = slNew();

const slMe = () => ({ user_id: user.id, nickname: nick(), username: uname(), avatar: profile && profile.avatar });
const slP = id => id === user.id ? slMe() : pOf(id);
const slName = p => p.nickname || p.username || "alguém";
const slGroup = () => fr.groups.find(g => g.id === sl.gid);
const slRoomName = id => (SL.rooms.find(r => r.id === id) || {}).name || "";
const slSupported = () => !!(sb && sb.channel && window.RTCPeerConnection && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
// Android e iPhone/iPad: o navegador não transmite a tela (mesmo quando a função existe, ela sempre recusa)
const slMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const slCanScreen = () => !slMobile() && !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
const SL_HANG = `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15.5c5-4.7 13-4.7 18 0l-2.4 2.4a1 1 0 0 1-1.3.1l-2.2-1.6a1 1 0 0 1-.4-.9l.2-1.9a11 11 0 0 0-5.8 0l.2 1.9a1 1 0 0 1-.4.9l-2.2 1.6a1 1 0 0 1-1.3-.1z" fill="currentColor" stroke="none"/></svg>`;

/* ---------- abrir a aba ---------- */
async function slOpen() {
  const el = $("#salas"); if (!el) return;
  document.documentElement.classList.add("on-salas");
  if (!user || !sb) { el.innerHTML = `<div class="panel empty"><b>Entre na sua conta</b>As salas funcionam com grupos de amigos.</div>`; return }
  sl.open = true;
  if (!fr.loaded) { el.innerHTML = `<div class="panel empty"><b>Carregando…</b></div>`; await loadFriends() }
  if (!sl.open) return;
  if (!fr.groups.find(g => g.id === sl.gid)) sl.gid = (fr.groups[0] || {}).id || null;
  slRender(); if (sl.gid) slEnter(sl.gid);
}
function slEnter(gid) {
  sl.gid = gid; slChan(gid); slTextSub(gid);
  if (!sl.loaded[gid]) slLoadMsgs(gid);
}
function slLeaveTab() { sl.open = false; document.documentElement.classList.remove("on-salas") }
/* atalho flutuante enquanto você está numa chamada e navega por outras abas */
function slPill() {
  let b = $("#sl-pill"); const on = !!sl.call && (tab !== "salas" || !sl.open);
  if (!on) { if (b) b.remove(); return }
  const g = fr.groups.find(x => x.id === sl.call.gid);
  if (!b) { b = document.createElement("div"); b.id = "sl-pill"; document.body.appendChild(b) }
  b.innerHTML = `${sl.blocked ? `<button class="sl-pill-snd" data-slp="sound">🔈 Ativar som</button>` : ""}<button class="sl-pill-go" data-slp="go">🟢 Em chamada · ${esc(g ? g.name : "")}</button><button class="sl-pill-x" data-slp="leave" aria-label="Sair da chamada" title="Sair da chamada">${SL_HANG}<span>Sair</span></button>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-slp]"); if (!b) return;
  const a = b.dataset.slp;
  if (a === "leave") slLeave();
  else if (a === "sound") slUnblock();
  else if (sl.call) { sl.gid = sl.call.gid; sl.ch = sl.call.room; sl.pane = "main"; if (location.hash === "#salas") slOpen(); else location.hash = "#salas" }
});

/* ---------- tamanho da área (no celular cabe entre o topo e a barra de abas) ---------- */
function slFit() {
  const el = $("#salas .sl"); if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const nav = $("nav.tabs"); let bottom = window.innerHeight;
  if (nav && getComputedStyle(nav).position === "fixed") { const r = nav.getBoundingClientRect(); if (r.top > window.innerHeight / 2) bottom = r.top }
  el.style.height = Math.max(360, Math.floor(bottom - top - 12)) + "px";
}
window.addEventListener("resize", () => { if (sl.open) slFit() });
if (window.visualViewport) window.visualViewport.addEventListener("resize", () => { if (sl.open) slFit() });

/* ---------- renderização ---------- */
function slRender() {
  const el = $("#salas"); if (!el || !sl.open) return;
  if (!fr.groups.length) {
    el.innerHTML = `<div class="sec-head"><div><h2 class="h">Salas</h2><p class="muted">Converse por texto, entre em chamadas de voz e transmita sua tela com seus amigos.</p></div></div>
      <div class="panel empty"><b>Você ainda não está em nenhum grupo</b>Cada grupo vira uma "sala" com chat e chamadas de voz. Crie um grupo com seus amigos para começar.<div class="acts" style="margin-top:12px"><button class="btn" data-sl="newgroup">Criar grupo</button></div></div>`;
    return;
  }
  const keep = $("#sl-in") ? $("#sl-in").value : sl.draft; sl.draft = keep || "";
  el.innerHTML = `<div class="sl" data-pane="${sl.pane}">
    <aside class="sl-rail" aria-label="Grupos">${fr.groups.map(g => `<button class="sl-srv${g.id === sl.gid ? " on" : ""}${sl.call && sl.call.gid === g.id ? " live" : ""}" data-sl="srv:${g.id}" title="${esc(g.name)}" aria-label="${esc(g.name)}" aria-pressed="${g.id === sl.gid}">${esc([...g.name.trim()][0] || "?").toUpperCase()}</button>`).join("")}<button class="sl-srv add" data-sl="newgroup" title="Novo grupo" aria-label="Novo grupo">+</button></aside>
    <nav class="sl-chs" aria-label="Canais"><div class="sl-chl" id="sl-chs"></div><div id="sl-barbox"></div></nav>
    <section class="sl-main" id="sl-main"></section></div>`;
  slRenderList(); slRenderMain(); slFit();
}
function slRoster(gid) { return sl.roster[gid] || {} }
function slRenderBar() {
  const box = $("#sl-barbox"); if (!box) return; const c = sl.call;
  box.innerHTML = c ? `<div class="sl-bar"><div><b>🟢 Voz conectada</b><small>${esc(((fr.groups.find(x => x.id === c.gid) || {}).name) || "")} · ${slRoomName(c.room)}</small></div>
    <div class="sl-bar-b"><button class="iconbtn${c.muted || c.deaf ? " off" : ""}" data-sl="mute" aria-label="${c.muted || c.deaf ? "Ativar microfone" : "Silenciar microfone"}" title="${c.muted || c.deaf ? "Ativar microfone" : "Silenciar microfone"}">${c.muted || c.deaf ? "🔇" : "🎙"}</button><button class="sl-bar-x" data-sl="leave" aria-label="Sair da chamada" title="Sair da chamada">${SL_HANG}<span>Sair</span></button></div></div>` : "";
}
function slRenderList() {
  const box = $("#sl-chs"); if (!box) return; const g = slGroup(); if (!g) return;
  const ro = slRoster(g.id);
  box.innerHTML = `<div class="sl-gh"><b>${esc(g.name)}</b><button class="iconbtn" data-sl="manage" aria-label="Membros e configurações do grupo">${ic("users")}</button></div>
    <div class="sl-cat">Canal de texto</div>
    <button class="sl-c${sl.ch === "geral" ? " on" : ""}" data-sl="ch:geral"><span class="sl-hash">#</span> geral</button>
    <div class="sl-cat">Salas de voz</div>
    ${SL.rooms.map(r => { const ms = ro[r.id] || []; return `<button class="sl-c${sl.ch === r.id ? " on" : ""}${sl.call && sl.call.gid === g.id && sl.call.room === r.id ? " live" : ""}" data-sl="ch:${r.id}"><span class="sl-hash">🔊</span> ${r.name}${ms.length ? `<small>${ms.length}/${SL.max}</small>` : ""}</button>
      ${ms.length ? `<ul class="sl-who">${ms.map(m => { const p = slP(m.uid); return `<li${sl.speak[m.uid] ? ' class="speaking"' : ""} data-uid="${m.uid}"><span class="av xs">${avatar(p.avatar)}</span><span>${esc(slName(p))}</span>${m.share ? `<i class="sl-live">AO VIVO</i>` : m.cam ? `<i class="sl-live cam">CÂMERA</i>` : ""}${m.mic === false ? `<i title="Microfone desligado">🔇</i>` : ""}</li>` }).join("")}</ul>` : ""}` }).join("")}`;
  slRenderBar();
}
function slRenderMain() {
  const box = $("#sl-main"); if (!box) return; const g = slGroup(); if (!g) return;
  const voice = sl.ch !== "geral";
  const head = `<header class="sl-mh"><button class="iconbtn sl-back" data-sl="back" aria-label="Voltar aos canais">${ic("back")}</button><b>${voice ? "🔊 " + slRoomName(sl.ch) : "# geral"}</b><small class="muted">${esc(g.name)}</small></header>`;
  if (!voice) {
    box.innerHTML = `${head}<div class="sl-msgs" id="sl-msgs" aria-live="polite"></div>
      <form class="sl-form" id="sl-form"><input id="sl-in" type="text" maxlength="1000" autocomplete="off" placeholder="Mensagem em #geral" aria-label="Mensagem" value="${esc(sl.draft)}"><button class="btn" aria-label="Enviar">${ic("send")}</button></form>`;
    slRenderMsgs(true); return;
  }
  box.innerHTML = `${head}<div class="sl-voice" id="sl-voice"></div>`;
  slRenderVoice();
}
function slRenderMsgs(scroll) {
  const box = $("#sl-msgs"); if (!box) return; const list = sl.msgs[sl.gid] || [];
  const atEnd = scroll || box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  if (!sl.loaded[sl.gid]) { box.innerHTML = `<p class="muted sl-empty">Carregando mensagens…</p>`; return }
  if (sl.loaded[sl.gid] === "erro") { box.innerHTML = `<p class="muted sl-empty">Não foi possível carregar as mensagens.</p>`; return }
  if (!list.length) { box.innerHTML = `<p class="muted sl-empty">Ninguém falou ainda. Seja o primeiro! 🦛</p>`; return }
  let last = null, lastT = 0;
  box.innerHTML = list.map(m => {
    const t = new Date(m.created_at), p = slP(m.user_id), head = last !== m.user_id || t - lastT > 5 * 60000; last = m.user_id; lastT = +t;
    const hh = t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), dd = t.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `<div class="sl-m${head ? " head" : ""}${m.user_id === user.id ? " me" : ""}">${head ? `<span class="av sm">${avatar(p.avatar)}</span><div><b>${esc(slName(p))}</b> <small class="muted">${dd} ${hh}</small><p>${esc(m.body)}</p></div>` : `<div class="sl-c2"><p>${esc(m.body)}</p></div>`}</div>`;
  }).join("");
  if (atEnd) box.scrollTop = box.scrollHeight;
}

/* ---------- texto ---------- */
async function slLoadMsgs(gid) {
  const { data, error } = await sb.from("group_messages").select("*").eq("group_id", gid).order("created_at", { ascending: false }).limit(80);
  if (error) { sl.loaded[gid] = "erro"; if (gid === sl.gid) slRenderMsgs(true); setTimeout(() => { if (sl.loaded[gid] === "erro") { delete sl.loaded[gid]; if (sl.gid === gid) slLoadMsgs(gid) } }, 8000); return }
  sl.msgs[gid] = (data || []).reverse(); sl.loaded[gid] = true; if (gid === sl.gid) slRenderMsgs(true);
}
function slTextSub(gid) {
  if (sl.tch && sl.tch.gid === gid) return;
  if (sl.tch) sb.removeChannel(sl.tch.c);
  const c = sb.channel("gm-" + gid).on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${gid}` }, p => slPush(p.new))
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "group_messages" }, p => { const l = sl.msgs[gid]; if (l && p.old && p.old.id) { sl.msgs[gid] = l.filter(m => m.id !== p.old.id); if (gid === sl.gid) slRenderMsgs(false) } })
    .subscribe(st => { if (st === "SUBSCRIBED" && sl.loaded[gid] === true && sl.tch && sl.tch.gid === gid && sl.tch.n++) slLoadMsgs(gid) });   // reconectou: busca o que chegou enquanto estava fora
  sl.tch = { gid, c, n: 0 };
}
function slPush(m) {
  if (!m || !m.group_id) return;
  const l = sl.msgs[m.group_id] = sl.msgs[m.group_id] || [];
  if (l.some(x => x.id === m.id)) return; l.push(m); if (l.length > 200) l.shift();
  if (m.group_id === sl.gid && sl.ch === "geral") slRenderMsgs(false);
}
async function slSendMsg() {
  const i = $("#sl-in"); if (!i) return; const body = i.value.trim(); if (!body || !sl.gid || sl.sending) return;
  const gid = sl.gid; i.value = ""; sl.draft = ""; sl.sending = true;
  const { data, error } = await sb.from("group_messages").insert({ group_id: gid, body }).select().single();
  sl.sending = false;
  if (error) { const j = $("#sl-in"); if (j && !j.value) j.value = body; toast("Não foi possível enviar a mensagem."); return }
  slPush(data);
}

/* ---------- canal de presença / sinalização por grupo ---------- */
function slChan(gid) {
  if (sl.chans[gid]) return sl.chans[gid];
  const ch = sb.channel("call:" + gid, { config: { private: true, presence: { key: user.id }, broadcast: { self: false } } });
  ch.on("presence", { event: "sync" }, () => slSync(gid))
    .on("broadcast", { event: "sig" }, ({ payload }) => slSig(gid, payload))
    .on("broadcast", { event: "st" }, ({ payload }) => slLive(gid, payload))
    .on("broadcast", { event: "bye" }, ({ payload }) => slBye(gid, payload))
    .on("broadcast", { event: "kick" }, ({ payload }) => slKicked(gid, payload));
  ch.subscribe(st => {
    sl.chst[gid] = st;
    // a cada (re)conexão o servidor esquece a presença: anuncia de novo quem está na chamada
    if (st === "SUBSCRIBED" && sl.call && sl.call.gid === gid) slTrack();
    if (sl.open && sl.gid === gid && sl.ch !== "geral") slRenderVoice();
  });
  return sl.chans[gid] = ch;
}
function slDrop(gid) { if (sl.call && sl.call.gid === gid) return; const c = sl.chans[gid]; if (c) { sb.removeChannel(c); delete sl.chans[gid]; delete sl.roster[gid]; delete sl.chst[gid] } }
function slSync(gid) {
  const st = sl.chans[gid] ? sl.chans[gid].presenceState() : {}, ro = {}, c = sl.call && sl.call.gid === gid ? sl.call : null;
  let elsewhere = null;
  for (const [uid, arr] of Object.entries(st)) {
    // mesma pessoa pode estar com o site aberto em mais de um aparelho: vale quem está numa sala, o mais recente
    const cand = arr.filter(m => m && m.room && !sl.hide[uid + ":" + m.t]).sort((a, b) => (a.t || 0) - (b.t || 0) || (a.v || 0) - (b.v || 0));
    if (uid === user.id) {
      const other = cand.filter(m => m.dev !== SL_DEV && (!c || m.t !== c.t)).pop();
      if (other) elsewhere = other;
      continue;   // eu mesmo: mostrado pelo estado local
    }
    let m = cand.pop(); if (!m) continue;
    const lv = sl.live[uid]; if (lv && lv.t === m.t && (lv.v || 0) > (m.v || 0)) m = { ...m, ...lv };
    (ro[m.room] = ro[m.room] || []).push({ uid, ...m });
  }
  if (c) (ro[c.room] = ro[c.room] || []).push(slMine());
  for (const k in ro) ro[k].sort((a, b) => (a.t || 0) - (b.t || 0));
  sl.roster[gid] = ro;
  if (gid === sl.gid || (c && c.gid === gid)) sl.elsewhere = elsewhere && !c ? { gid, ...elsewhere } : null;
  if (c) slReconcile();
  if (sl.open) { slRenderList(); if (sl.gid === gid && sl.ch !== "geral") slRenderVoice() }
}
function slMine() { const c = sl.call; return { uid: user.id, room: c.room, mic: !c.muted && !c.deaf, share: c.vidKind === "screen", cam: c.vidKind === "cam", t: c.t, v: c.v, dev: SL_DEV } }
function slTrack() {
  const c = sl.call; const ch = c && sl.chans[c.gid]; if (!ch) return;
  c.v = (c.v || 0) + 1;
  const st = { room: c.room, mic: !c.muted && !c.deaf, share: c.vidKind === "screen", cam: c.vidKind === "cam", name: nick(), t: c.t, v: c.v, dev: SL_DEV };
  // presença (para quem chegar depois) + aviso imediato (para quem já está na sala ver a mudança na hora)
  ch.track(st).catch(() => { });
  try { ch.send({ type: "broadcast", event: "st", payload: { from: user.id, ...st } }) } catch (e) { }
}
function slLive(gid, d) {
  if (!d || !d.from || d.from === user.id) return;
  const cur = sl.live[d.from];
  if (cur && cur.t === d.t && (cur.v || 0) >= (d.v || 0)) return;
  sl.live[d.from] = { room: d.room, mic: d.mic, share: d.share, cam: d.cam, t: d.t, v: d.v };
  slSync(gid);
}
function slBye(gid, d) {
  if (!d || !d.from || d.from === user.id) return;
  sl.hide[d.from + ":" + d.t] = true; delete sl.live[d.from];
  const c = sl.call, p = c && c.gid === gid && c.pcs[d.from]; if (p && (!p.rt || p.rt === d.t)) slClosePeer(c, d.from)   // só a conexão daquela chamada (a pessoa pode ter entrado de novo por outro aparelho)
  slSync(gid);
}
function slKicked(gid, d) {
  // a mesma conta entrou numa sala em outro aparelho (ou pediu para desconectar este)
  if (!d || d.from !== user.id || d.dev === SL_DEV) return;
  if (d.target && d.target !== SL_DEV) return;
  if (sl.call && sl.call.gid === gid) { slLeave(); toast(d.target ? "Sua chamada foi encerrada pelo outro aparelho." : "Você entrou na chamada em outro aparelho, então ela foi encerrada aqui.") }
}

/* ---------- servidores de conexão (TURN) ---------- */
async function slLoadTurn() {
  if (SL.turn && Date.now() - SL.turnAt < 6 * 3600e3) return;
  if (typeof FN !== "function" || !FN()) return;
  try {
    const r = await Promise.race([sb.functions.invoke(FN(), { body: { action: "turn" } }), new Promise(res => setTimeout(() => res({ error: "tempo" }), 4000))]);
    const s = r && r.data && r.data.iceServers;
    if (Array.isArray(s) && s.length) { SL.turn = s; SL.turnAt = Date.now() }
  } catch (e) { }
}

/* ---------- chamada de voz ---------- */
async function slJoin(room) {
  if (!slSupported()) { toast("Seu navegador não suporta chamadas de voz."); return }
  if (sl.joining) return;
  const gid = sl.gid; if (sl.call) { if (sl.call.gid === gid && sl.call.room === room) return; slLeave(true) }
  if ((slRoster(gid)[room] || []).filter(m => m.uid !== user.id).length >= SL.max) { toast(`Sala cheia (máx. ${SL.max} pessoas).`); return }
  sl.joining = true;
  // o áudio do navegador precisa ser criado no próprio toque (Safari/iPhone), antes de esperar o microfone
  let ac = null; try { ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.resume) ac.resume().catch(() => { }) } catch (e) { }
  let mic;
  try { mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false }) }
  catch (e) { sl.joining = false; try { ac && ac.close() } catch (er) { } toast(e && e.name === "NotAllowedError" ? "Permita o uso do microfone no navegador para entrar na sala." : "Não encontrei um microfone."); return }
  await slLoadTurn();
  sl.joining = false;
  if (sl.call) slLeave(true);
  sl.call = { gid, room, local: mic, vid: null, vidKind: null, facing: "user", pcs: {}, muted: false, deaf: false, ac, an: {}, t: Date.now(), v: 0, gone: {} };
  slWatch(user.id, mic);
  const ch = slChan(gid);
  if (ch.state === "joined") slTrack();   // senão o track sai no SUBSCRIBED
  try { ch.send({ type: "broadcast", event: "kick", payload: { from: user.id, dev: SL_DEV } }) } catch (e) { }   // encerra a chamada desta conta em outro aparelho
  if (!sl.speakT) sl.speakT = setInterval(slSpeakTick, 140);
  if (!sl.recT) sl.recT = setInterval(slReconcile, 2000);
  if (typeof musicPause === "function") musicPause();   // música de fundo para enquanto estiver na chamada
  slSync(gid); slRender(); slPill();
}
function slLeave(silent) {
  const c = sl.call; if (!c) return;
  sl.call = null;
  const ch = sl.chans[c.gid];
  sl.hide[user.id + ":" + c.t] = true;
  // avisa os outros na hora (sem esperar a presença) e tira a presença em segundo plano
  try { if (ch) ch.send({ type: "broadcast", event: "bye", payload: { from: user.id, room: c.room, t: c.t } }) } catch (e) { }
  try { if (ch) ch.untrack().catch(() => { }) } catch (e) { }
  for (const uid in c.pcs) slClosePeer(c, uid);
  c.local.getTracks().forEach(t => t.stop()); if (c.vid) c.vid.getTracks().forEach(t => t.stop());
  try { if (c.ac) c.ac.close() } catch (e) { }
  clearInterval(sl.speakT); sl.speakT = 0; clearInterval(sl.recT); sl.recT = 0; sl.speak = {};
  for (const el of Object.values(sl.vel)) { try { el.pause(); el.srcObject = null; el.remove() } catch (e) { } }
  const box = $("#sl-audio"); if (box) box.innerHTML = "";
  sl.vel = {}; sl.blocked = false;
  if (c.gid !== sl.gid || !sl.open) slDrop(c.gid); else slSync(c.gid);
  if (!silent) slRender();
  slPill();
  if (!silent && typeof musicPlay === "function" && typeof bgm !== "undefined" && bgm.started && !bgm.userPaused) musicPlay();
}
function slReconcile() {
  const c = sl.call; if (!c) return;
  const here = (slRoster(c.gid)[c.room] || []).map(m => m.uid).filter(u => u !== user.id);
  for (const uid of here) { delete c.gone[uid]; if (!c.pcs[uid]) slPeer(uid) }
  for (const uid of Object.keys(c.pcs)) {
    if (here.includes(uid)) continue;
    const p = c.pcs[uid], alive = !["failed", "closed"].includes(p.pc.connectionState);
    // sumiu da presença mas a conexão está viva: pode ser só uma queda rápida do servidor; espera um pouco
    if (alive) { c.gone[uid] = c.gone[uid] || Date.now(); if (Date.now() - c.gone[uid] < SL.grace) continue }
    delete c.gone[uid]; slClosePeer(c, uid); if (sl.open) slRenderVoice();
  }
}
const slDesc = pc => ({ type: pc.localDescription.type, sdp: pc.localDescription.sdp });
function slSend(uid, data) { const c = sl.call; if (!c || !sl.chans[c.gid]) return; const p = c.pcs[uid]; try { sl.chans[c.gid].send({ type: "broadcast", event: "sig", payload: { to: uid, from: user.id, room: c.room, t: c.t, pid: p && p.id, ...data } }) } catch (e) { } }
function slPeer(uid) {
  const c = sl.call; if (c.pcs[uid]) return c.pcs[uid];
  const pc = new RTCPeerConnection(SL.ice()), p = { pc, id: Math.random().toString(36).slice(2, 10), rid: null, polite: user.id > uid, making: false, ignore: false, queue: [], streams: {}, state: "new" };
  c.pcs[uid] = p;
  // quem tem o id maior (educado) só adiciona as trilhas depois de receber a oferta do outro: evita o "choque" de ofertas simultâneas
  p.addTracks = () => { if (p.added) return; p.added = true; c.local.getTracks().forEach(t => pc.addTrack(t, c.local)); if (c.vid) c.vid.getTracks().forEach(t => pc.addTrack(t, c.vid)) };
  pc.onicecandidate = e => { if (e.candidate) slSend(uid, { c: e.candidate.toJSON() }) };
  pc.onnegotiationneeded = async () => { try { p.making = true; await pc.setLocalDescription(); slSend(uid, { d: slDesc(pc) }) } catch (e) { } finally { p.making = false } };
  pc.ontrack = e => {
    const s = e.streams[0] || new MediaStream([e.track]);
    if (!p.streams[s.id]) { p.streams[s.id] = s; s.onremovetrack = () => slPaintMedia(uid) }
    e.track.onunmute = () => slPaintMedia(uid); e.track.onended = () => slPaintMedia(uid);
    slPaintMedia(uid);
  };
  pc.onconnectionstatechange = () => {
    p.state = pc.connectionState;
    if (pc.connectionState === "failed" && !p.polite) { try { pc.restartIce() } catch (e) { } }
    if (sl.open) slRenderVoice();
  };
  slSend(uid, { hi: 1 });   // "esta é a minha conexão nova": se o outro tinha uma antiga, ele recomeça
  if (!p.polite) p.addTracks();
  return p;
}
function slClosePeer(c, uid) {
  const p = c.pcs[uid]; if (!p) return; delete c.pcs[uid];
  try { p.pc.close() } catch (e) { }
  for (const k of Object.keys(sl.vel)) if (k.startsWith(uid + ":")) { try { sl.vel[k].srcObject = null; sl.vel[k].remove() } catch (e) { } delete sl.vel[k] }
  delete sl.speak[uid]; delete c.an[uid];
}
async function slSig(gid, d) {
  const c = sl.call; if (!c || c.gid !== gid || !d || d.to !== user.id || d.room !== c.room) return;
  const uid = d.from; if (!uid || uid === user.id) return;
  let p = c.pcs[uid];
  // mensagem de uma conexão diferente da que conhecemos: o outro lado recomeçou, então recomeçamos também
  const other = p && ((p.rid && d.pid && d.pid !== p.rid) || (p.rt && d.t && d.t !== p.rt));
  if (other && (d.hi || (d.d && d.d.type === "offer") || (p.rt && d.t > p.rt))) { slClosePeer(c, uid); p = null }
  else if (other) return;   // resto de uma conexão antiga
  if (!p) p = slPeer(uid);
  if (!p.rid && d.pid) p.rid = d.pid;
  if (!p.rt && d.t) p.rt = d.t;
  if (d.hi) return;
  const pc = p.pc;
  try {
    if (d.d) {
      const collision = d.d.type === "offer" && (p.making || pc.signalingState !== "stable");
      p.ignore = !p.polite && collision; if (p.ignore) return;
      await pc.setRemoteDescription(d.d);
      if (d.d.type === "offer") p.addTracks();
      for (const q of p.queue.splice(0)) { try { await pc.addIceCandidate(q) } catch (e) { } }
      if (d.d.type === "offer") { await pc.setLocalDescription(); slSend(uid, { d: slDesc(pc) }) }
    } else if (d.c) {
      if (!pc.remoteDescription) p.queue.push(d.c); else { try { await pc.addIceCandidate(d.c) } catch (e) { } }
    }
  } catch (e) { }
}

/* ---------- mídia: áudio, vídeo e quem está falando ---------- */
function slAudioBox() { let b = $("#sl-audio"); if (!b) { b = document.createElement("div"); b.id = "sl-audio"; b.hidden = true; document.body.appendChild(b) } return b }
function slPlay(el) {
  const pr = el.play();
  if (pr && pr.catch) pr.catch(e => { if (e && e.name === "NotAllowedError" && sl.call) { sl.blocked = true; slPill(); if (sl.open) slRenderVoice() } });
}
function slUnblock() {
  sl.blocked = false;
  for (const el of Object.values(sl.vel)) slPlay(el);
  try { sl.call && sl.call.ac && sl.call.ac.resume() } catch (e) { }
  slPill(); if (sl.open) slRenderVoice();
}
function slPaintMedia(uid) {
  const c = sl.call, p = c && c.pcs[uid]; if (!p) return;
  for (const [id, s] of Object.entries(p.streams)) {
    const vt = s.getVideoTracks().filter(t => t.readyState === "live"), key = uid + ":" + id;
    if (!s.getTracks().some(t => t.readyState === "live")) { delete p.streams[id]; if (sl.vel[key]) { sl.vel[key].srcObject = null; sl.vel[key].remove(); delete sl.vel[key] } continue }
    const want = vt.length ? "VIDEO" : "AUDIO";
    if (sl.vel[key] && sl.vel[key].tagName !== want) { sl.vel[key].srcObject = null; sl.vel[key].remove(); delete sl.vel[key] }   // trilha de vídeo saiu ou entrou
    if (!sl.vel[key]) {
      const el = document.createElement(want === "VIDEO" ? "video" : "audio");
      el.autoplay = true; el.setAttribute("playsinline", ""); el.srcObject = s; el.muted = c.deaf; el.dataset.uid = uid; el.dataset.at = Date.now();
      if (want === "AUDIO") { slAudioBox().appendChild(el); slWatch(uid, s) }
      sl.vel[key] = el; slPlay(el);
    }
  }
  if (sl.open) slRenderVoice();
}
function slWatch(uid, stream) {
  const c = sl.call; if (!c || !c.ac || !stream.getAudioTracks().length) return;
  try { const src = c.ac.createMediaStreamSource(stream), an = c.ac.createAnalyser(); an.fftSize = 512; src.connect(an); c.an[uid] = { an, buf: new Uint8Array(an.fftSize) } } catch (e) { }
}
function slSpeakTick() {
  const c = sl.call; if (!c) return;
  if (c.ac && c.ac.state === "suspended") c.ac.resume().catch(() => { });
  for (const [uid, o] of Object.entries(c.an)) {
    o.an.getByteTimeDomainData(o.buf); let s = 0; for (const v of o.buf) { const x = (v - 128) / 128; s += x * x }
    let on = Math.sqrt(s / o.buf.length) > 0.035; if (uid === user.id && (c.muted || c.deaf)) on = false;
    if (!!sl.speak[uid] !== on) { sl.speak[uid] = on; $$(`[data-uid="${uid}"]`).forEach(e => { if (!/^(AUDIO|VIDEO)$/.test(e.tagName)) e.classList.toggle("speaking", on) }) }
  }
}
/* vídeo (tela ou câmera) que cada um está mandando agora */
function slVideoOf(uid) {
  const c = sl.call; if (!c) return null;
  if (uid === user.id) {
    if (!c.vid) return null;
    let v = sl.vel["me:vid"]; if (!v || v.srcObject !== c.vid) { if (v) v.remove(); v = document.createElement("video"); v.muted = true; v.autoplay = true; v.setAttribute("playsinline", ""); v.srcObject = c.vid; if (c.vidKind === "cam" && c.facing === "user") v.classList.add("mirror"); sl.vel["me:vid"] = v; slPlay(v) }
    return v;
  }
  const vs = Object.entries(sl.vel).filter(([k, e]) => k.startsWith(uid + ":") && e.tagName === "VIDEO" && e.srcObject && e.srcObject.getVideoTracks().some(t => t.readyState === "live" && !t.muted));
  vs.sort((a, b) => a[1].dataset.at - b[1].dataset.at);
  return vs.length ? vs[vs.length - 1][1] : null;
}

/* ---------- tela da sala de voz ---------- */
function slRenderVoice() {
  const box = $("#sl-voice"); if (!box || sl.ch === "geral") return;
  const c = sl.call, inHere = !!(c && c.gid === sl.gid && c.room === sl.ch), ms = slRoster(sl.gid)[sl.ch] || [];
  const k = inHere ? "in" : "out";
  if (box.dataset.k !== k) {
    box.dataset.k = k;
    box.innerHTML = inHere ? `<div class="sl-snd" id="sl-snd"></div><div class="sl-stage" id="sl-stage"></div><div class="sl-tiles" id="sl-tiles"></div><div class="sl-ctl" id="sl-ctl" role="toolbar" aria-label="Controles da chamada"></div>`
      : `<div class="sl-pre"><h3>🔊 ${slRoomName(sl.ch)}</h3><div id="sl-tiles" class="sl-tiles"></div><div id="sl-prei"></div></div>`;
  }
  const tiles = $("#sl-tiles");
  if (!inHere) {
    const full = ms.length >= SL.max, st = sl.chst[sl.gid], el = sl.elsewhere && sl.elsewhere.gid === sl.gid ? sl.elsewhere : null;
    tiles.innerHTML = ms.length ? ms.map(m => slTile(m, null)).join("") : "";
    $("#sl-prei").innerHTML = `${ms.length ? "" : `<p class="muted">Ninguém na sala. Entre e chame o pessoal!</p>`}
      ${el ? `<div class="sl-warn">📱 Você está na ${slRoomName(el.room)} em outro aparelho.<button class="btn sm ghost" data-sl="kick">Desconectar lá</button></div>` : ""}
      <button class="btn" data-sl="join" ${full || sl.joining ? "disabled" : ""}>🎙 ${sl.call ? "Trocar para esta sala" : "Entrar na sala"}</button>
      ${st && st !== "SUBSCRIBED" ? `<p class="sl-note sl-err">${st === "CHANNEL_ERROR" ? "Não foi possível conectar ao servidor de chamadas. Tentando de novo…" : "Conectando ao servidor de chamadas…"}</p>` : ""}
      <p class="muted sl-note">Até ${SL.max} pessoas por sala · precisa permitir o microfone · se alguém não conectar, tente outra rede (Wi-Fi).</p>`;
    return;
  }
  // transmissões (tela ou câmera): só recria o palco quando muda quem está transmitindo, para o vídeo não piscar
  const shares = [];
  for (const m of ms) { if (!m.share && !m.cam) continue; const v = slVideoOf(m.uid); if (v) shares.push({ m, v }) }
  const stage = $("#sl-stage"), sk = shares.map(s => s.m.uid + (s.m.share ? "s" : "c") + (s.v.dataset.at || "")).join("|");
  if (stage.dataset.k !== sk) {
    stage.dataset.k = sk;
    stage.innerHTML = shares.map((s, i) => `<figure class="sl-share${s.m.cam ? " cam" : ""}" data-slv="${i}"><figcaption>${s.m.cam ? "📷" : "🖥"} ${s.m.uid === user.id ? (s.m.cam ? "Sua câmera" : "Você está transmitindo") : esc(slName(slP(s.m.uid))) + (s.m.cam ? " · câmera" : " está transmitindo")}</figcaption><button class="iconbtn sl-fs" data-sl="fs:${i}" aria-label="Tela cheia">⛶</button></figure>`).join("");
    stage.querySelectorAll("[data-slv]").forEach(f => { const s = shares[+f.dataset.slv]; f.insertBefore(s.v, f.firstChild) });
  }
  shares.forEach(s => { if (s.v.paused) slPlay(s.v) });   // vídeo tirado da tela pausa sozinho: volta a tocar
  tiles.innerHTML = ms.map(m => slTile(m, c.pcs[m.uid] || null)).join("");
  $("#sl-snd").innerHTML = sl.blocked ? `<button class="btn" data-sl="sound">🔈 O navegador bloqueou o som. Toque aqui para ouvir</button>` : "";
  const scr = c.vidKind === "screen", cam = c.vidKind === "cam";
  $("#sl-ctl").innerHTML = `
      <button class="sl-b${c.muted || c.deaf ? " off" : ""}" data-sl="mute" aria-pressed="${c.muted || c.deaf}" title="${c.muted || c.deaf ? "Ativar microfone" : "Silenciar microfone"}">${c.muted || c.deaf ? "🔇" : "🎙"}<span>${c.muted || c.deaf ? "Mudo" : "Mic"}</span></button>
      <button class="sl-b${c.deaf ? " off" : ""}" data-sl="deaf" aria-pressed="${c.deaf}" title="${c.deaf ? "Voltar a ouvir" : "Ensurdecer (parar de ouvir)"}">${c.deaf ? "🔕" : "🎧"}<span>${c.deaf ? "Surdo" : "Áudio"}</span></button>
      <button class="sl-b${cam ? " on" : ""}" data-sl="cam" aria-pressed="${cam}" title="${cam ? "Desligar câmera" : "Ligar câmera"}">📷<span>${cam ? "Parar" : "Câmera"}</span></button>
      ${cam && slMobile() ? `<button class="sl-b" data-sl="flip" title="Trocar câmera (frente/trás)">🔄<span>Virar</span></button>` : ""}
      <button class="sl-b${scr ? " on" : ""}${slCanScreen() ? "" : " na"}" data-sl="share" aria-pressed="${scr}" title="${scr ? "Parar transmissão" : "Transmitir tela"}">🖥<span>${scr ? "Parar" : "Tela"}</span></button>
      <button class="sl-b end" data-sl="leave" title="Sair da chamada">${SL_HANG}<span>Sair</span></button>`;
}
function slTile(m, p) {
  const pr = slP(m.uid), st = p ? p.pc.connectionState : "";
  return `<div class="sl-t${sl.speak[m.uid] ? " speaking" : ""}" data-uid="${m.uid}"><span class="av lg">${avatar(pr.avatar)}</span><b>${esc(slName(pr))}${m.uid === user.id ? " (você)" : ""}</b>
    <small>${m.mic === false ? "🔇 mudo" : ""}${m.share ? " 🖥 ao vivo" : m.cam ? " 📷 câmera" : ""}${st === "connecting" || st === "new" && sl.call && sl.call.pcs[m.uid] ? " conectando…" : st === "disconnected" ? " reconectando…" : st === "failed" ? " ⚠ sem conexão" : ""}</small></div>`;
}

/* ---------- controles ---------- */
function slMute() {
  const c = sl.call; if (!c) return;
  // surdo + tocar no microfone = voltar a ouvir E falar (como no Discord)
  if (c.deaf) { c.deaf = false; c.muted = false } else c.muted = !c.muted;
  slApply()
}
function slDeaf() { const c = sl.call; if (!c) return; c.deaf = !c.deaf; slApply() }
function slApply() {
  const c = sl.call;
  c.local.getAudioTracks().forEach(t => t.enabled = !c.muted && !c.deaf);
  Object.entries(sl.vel).forEach(([k, e]) => { if (k !== "me:vid") e.muted = c.deaf });
  slTrack(); slSync(c.gid); if (sl.open) { slRenderVoice(); slRenderBar() }
}
async function slShare() {
  const c = sl.call; if (!c) return;
  if (c.vidKind === "screen") return slVidStop();
  if (!slCanScreen()) { slAsk("📱 Tela do celular", "Os navegadores de celular (Android e iPhone) não deixam sites transmitirem a tela — é uma limitação do próprio sistema. No computador funciona normalmente.<br><br>Pelo celular você pode transmitir a <b>câmera</b> (frontal ou traseira).", "Transmitir câmera", () => slCam()); return }
  let s; try { s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true }) } catch (e) { if (e && e.name !== "NotAllowedError" && e.name !== "AbortError") toast("Não consegui iniciar a transmissão de tela."); return }
  const v = s.getVideoTracks()[0]; if (v) { try { v.contentHint = "detail" } catch (e) { } }
  slVidStart(s, "screen");
}
async function slCam() {
  const c = sl.call; if (!c) return;
  if (c.vidKind === "cam") return slVidStop();
  let s; try { s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: c.facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }) }
  catch (e) { toast(e && e.name === "NotAllowedError" ? "Permita o uso da câmera no navegador." : "Não encontrei uma câmera."); return }
  slVidStart(s, "cam");
}
function slVidStart(s, kind) {
  const c = sl.call; if (!c) { s.getTracks().forEach(t => t.stop()); return }
  if (c.vid) slVidStop(true);
  c.vid = s; c.vidKind = kind;
  const v = s.getVideoTracks()[0]; if (v) v.onended = () => { if (sl.call && sl.call.vid === s) slVidStop() };
  for (const p of Object.values(c.pcs)) if (p.added) s.getTracks().forEach(t => p.pc.addTrack(t, s));
  slTrack(); slSync(c.gid); if (sl.open) { slRenderVoice(); slRenderList() }
}
function slVidStop(quiet) {
  const c = sl.call; if (!c || !c.vid) return; const s = c.vid; c.vid = null; c.vidKind = null;
  for (const p of Object.values(c.pcs)) p.pc.getSenders().forEach(sn => { if (sn.track && s.getTracks().includes(sn.track)) { try { p.pc.removeTrack(sn) } catch (e) { } } });
  s.getTracks().forEach(t => t.stop()); if (sl.vel["me:vid"]) { sl.vel["me:vid"].remove(); delete sl.vel["me:vid"] }
  if (quiet) return;
  slTrack(); slSync(c.gid); if (sl.open) { slRenderVoice(); slRenderList() }
}
async function slFlip() {
  const c = sl.call; if (!c || c.vidKind !== "cam") return;
  c.facing = c.facing === "user" ? "environment" : "user";
  let s; try { s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: c.facing }, audio: false }) } catch (e) { toast("Não consegui trocar de câmera."); c.facing = c.facing === "user" ? "environment" : "user"; return }
  const nt = s.getVideoTracks()[0], old = c.vid;
  for (const p of Object.values(c.pcs)) p.pc.getSenders().forEach(sn => { if (sn.track && old.getVideoTracks().includes(sn.track)) sn.replaceTrack(nt).catch(() => { }) });
  old.getVideoTracks().forEach(t => { old.removeTrack(t); t.stop() }); old.addTrack(nt);
  nt.onended = () => { if (sl.call && sl.call.vid === old) slVidStop() };
  if (sl.vel["me:vid"]) { sl.vel["me:vid"].remove(); delete sl.vel["me:vid"] }
  const st = $("#sl-stage"); if (st) st.dataset.k = "";
  slRenderVoice();
}
/* janelinha simples de aviso com uma ação */
function slAsk(title, html, label, fn) {
  const old = $("#sl-ask"); if (old) old.remove();
  const d = document.createElement("div"); d.id = "sl-ask"; d.className = "sl-ask-bg";
  d.innerHTML = `<div class="sl-ask" role="dialog" aria-modal="true" aria-label="${esc(title)}"><b>${title}</b><p>${html}</p><div class="acts"><button class="btn ghost" data-ask="0">Fechar</button><button class="btn" data-ask="1">${label}</button></div></div>`;
  d.addEventListener("click", e => { const b = e.target.closest("[data-ask]"); if (b || e.target === d) { d.remove(); if (b && b.dataset.ask === "1") fn() } });
  document.body.appendChild(d); const f = d.querySelector('[data-ask="1"]'); if (f) f.focus();
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sl]"); if (!b || !$("#salas") || $("#salas").hidden) return;
  const [a, v] = b.dataset.sl.split(":");
  if (a === "srv") { if (v === sl.gid) { sl.pane = "list"; slRender(); return } const old = sl.gid; sl.gid = v; sl.ch = "geral"; sl.pane = "list"; sl.draft = ""; sl.elsewhere = null; slEnter(v); if (old) slDrop(old); slSync(v); slRender() }
  else if (a === "ch") { sl.ch = v; sl.pane = "main"; const el = $("#salas .sl"); if (el) el.dataset.pane = "main"; slRenderList(); slRenderMain() }
  else if (a === "back") { sl.pane = "list"; const el = $("#salas .sl"); if (el) el.dataset.pane = "list" }
  else if (a === "newgroup") openNewGroup();
  else if (a === "manage") openGroup(sl.gid);
  else if (a === "join") slJoin(sl.ch);
  else if (a === "leave") slLeave();
  else if (a === "mute") slMute();
  else if (a === "deaf") slDeaf();
  else if (a === "share") slShare();
  else if (a === "cam") slCam();
  else if (a === "flip") slFlip();
  else if (a === "sound") slUnblock();
  else if (a === "kick") { const el = sl.elsewhere, ch = el && sl.chans[el.gid]; if (ch) { try { ch.send({ type: "broadcast", event: "kick", payload: { from: user.id, dev: SL_DEV, target: el.dev } }) } catch (er) { } sl.hide[user.id + ":" + el.t] = true; sl.elsewhere = null; slSync(el.gid); toast("Pedido enviado para o outro aparelho.") } }
  else if (a === "fs") { const f = b.closest("figure"), vd = f && f.querySelector("video"); if (vd) { const go = vd.requestFullscreen || vd.webkitRequestFullscreen || vd.webkitEnterFullscreen; if (go) { const r = go.call(vd); if (r && r.catch) r.catch(() => { }) } } }
});
document.addEventListener("submit", e => { if (e.target.id === "sl-form") { e.preventDefault(); slSendMsg() } });
document.addEventListener("keydown", e => { if (e.target.id === "sl-in" && e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); slSendMsg() } });
document.addEventListener("input", e => { if (e.target.id === "sl-in") sl.draft = e.target.value });
// fechar a aba / sair do app: avisa os outros na hora (pagehide funciona também no iPhone)
window.addEventListener("pagehide", e => { if (!e.persisted && sl.call) slLeave(true) });
/* ao mudar a lista de grupos (criar/sair/excluir) a aba atualiza */
function slGroupsChanged() {
  if (sl.call && !fr.groups.find(g => g.id === sl.call.gid)) slLeave(true);
  if (sl.open) { if (!fr.groups.find(g => g.id === sl.gid)) { sl.gid = (fr.groups[0] || {}).id || null; sl.ch = "geral"; if (sl.gid) slEnter(sl.gid) } slRender() }
}
function slReset() {
  if (sl.call) slLeave(true);
  for (const g of Object.keys(sl.chans)) { try { sb.removeChannel(sl.chans[g]) } catch (e) { } }
  if (sl.tch) { try { sb.removeChannel(sl.tch.c) } catch (e) { } }
  const p = $("#sl-pill"); if (p) p.remove();
  sl = slNew(); document.documentElement.classList.remove("on-salas");
}
