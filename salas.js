/* Jogos Enzola — aba "Salas" (estilo Discord): cada grupo vira um servidor com canal de texto e salas de voz.
   Voz e transmissão de tela usam WebRTC direto entre os participantes (malha, até SL.max pessoas por sala).
   A sinalização passa por canais privados do Supabase Realtime ("call:<id do grupo>"), liberados só para membros do grupo.
   Observação: sem servidor TURN, algumas redes (4G de operadora, firewalls rígidos) podem não conectar.
   Para ajudar, coloque ICE_SERVERS no config.js: [{urls:"turn:...", username:"...", credential:"..."}]. */
const SL = {
  max: 6,
  rooms: [{ id: "v1", name: "Sala 1" }, { id: "v2", name: "Sala 2" }, { id: "v3", name: "Sala 3" }],
  ice() { return { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }, ...((typeof CFG !== "undefined" && CFG.ICE_SERVERS) || [])] } },
};
let sl = { gid: null, ch: "geral", room: null, pane: "list", msgs: {}, loaded: {}, chans: {}, roster: {}, tch: null, call: null, speak: {}, draft: "", vel: {}, open: false };

const slMe = () => ({ user_id: user.id, nickname: nick(), username: uname(), avatar: profile && profile.avatar });
const slP = id => id === user.id ? slMe() : pOf(id);
const slName = p => p.nickname || p.username || "alguém";
const slGroup = () => fr.groups.find(g => g.id === sl.gid);
const slSupported = () => !!(sb && sb.channel && window.RTCPeerConnection && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

/* ---------- abrir a aba ---------- */
async function slOpen() {
  const el = $("#salas"); if (!el) return;
  if (!user || !sb) { el.innerHTML = `<div class="panel empty"><b>Entre na sua conta</b>As salas funcionam com grupos de amigos.</div>`; return }
  sl.open = true;
  if (!fr.loaded) { el.innerHTML = `<div class="panel empty"><b>Carregando…</b></div>`; await loadFriends() }
  if (!fr.groups.find(g => g.id === sl.gid)) sl.gid = (fr.groups[0] || {}).id || null;
  slRender(); if (sl.gid) slEnter(sl.gid);
}
function slEnter(gid) {
  sl.gid = gid; slChan(gid); slTextSub(gid);
  if (!sl.loaded[gid]) slLoadMsgs(gid);
}
function slLeaveTab() { sl.open = false }
/* atalho flutuante enquanto você está numa chamada e navega por outras abas */
function slPill() {
  let b = $("#sl-pill"); const on = !!sl.call && tab !== "salas";
  if (!on) { if (b) b.remove(); return }
  const g = fr.groups.find(x => x.id === sl.call.gid);
  if (!b) { b = document.createElement("div"); b.id = "sl-pill"; document.body.appendChild(b) }
  b.innerHTML = `<button class="sl-pill-go" data-slp="go">🟢 Em chamada · ${esc(g ? g.name : "")}</button><button class="sl-pill-x" data-slp="leave" aria-label="Sair da chamada">📞</button>`;
}
document.addEventListener("click", e => { const b = e.target.closest("[data-slp]"); if (!b) return; if (b.dataset.slp === "leave") { slLeave(); slPill() } else { sl.gid = sl.call.gid; sl.ch = sl.call.room; sl.pane = "main"; location.hash = "#salas" } });

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
    <nav class="sl-chs" id="sl-chs" aria-label="Canais"></nav>
    <section class="sl-main" id="sl-main"></section></div>`;
  slRenderList(); slRenderMain();
}
function slRoster(gid) { return sl.roster[gid] || {} }
function slRenderList() {
  const box = $("#sl-chs"); if (!box) return; const g = slGroup(); if (!g) return;
  const ro = slRoster(g.id);
  box.innerHTML = `<div class="sl-gh"><b>${esc(g.name)}</b><button class="iconbtn" data-sl="manage" aria-label="Membros e configurações do grupo">${ic("users")}</button></div>
    <div class="sl-cat">Canal de texto</div>
    <button class="sl-c${sl.ch === "geral" ? " on" : ""}" data-sl="ch:geral"><span class="sl-hash">#</span> geral</button>
    <div class="sl-cat">Salas de voz</div>
    ${SL.rooms.map(r => { const ms = ro[r.id] || []; return `<button class="sl-c${sl.ch === r.id ? " on" : ""}${sl.call && sl.call.gid === g.id && sl.call.room === r.id ? " live" : ""}" data-sl="ch:${r.id}"><span class="sl-hash">🔊</span> ${r.name}${ms.length ? `<small>${ms.length}/${SL.max}</small>` : ""}</button>
      ${ms.length ? `<ul class="sl-who">${ms.map(m => { const p = slP(m.uid); return `<li${sl.speak[m.uid] ? ' class="speaking"' : ""} data-uid="${m.uid}"><span class="av xs">${avatar(p.avatar)}</span><span>${esc(slName(p))}</span>${m.share ? `<i class="sl-live">AO VIVO</i>` : ""}${m.mic === false ? `<i title="Microfone desligado">🔇</i>` : ""}</li>` }).join("")}</ul>` : ""}` }).join("")}
    ${sl.call ? `<div class="sl-bar"><div><b>🟢 Voz conectada</b><small>${esc(((fr.groups.find(x => x.id === sl.call.gid) || {}).name) || "")} · ${SL.rooms.find(r => r.id === sl.call.room).name}</small></div><button class="iconbtn" data-sl="leave" aria-label="Sair da chamada">📞</button></div>` : ""}`;
}
function slRenderMain() {
  const box = $("#sl-main"); if (!box) return; const g = slGroup(); if (!g) return;
  const voice = sl.ch !== "geral", room = SL.rooms.find(r => r.id === sl.ch);
  const head = `<header class="sl-mh"><button class="iconbtn sl-back" data-sl="back" aria-label="Voltar aos canais">${ic("back")}</button><b>${voice ? "🔊 " + room.name : "# geral"}</b><small class="muted">${esc(g.name)}</small></header>`;
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
  const { data } = await sb.from("group_messages").select("*").eq("group_id", gid).order("created_at", { ascending: false }).limit(80);
  sl.msgs[gid] = (data || []).reverse(); sl.loaded[gid] = true; if (gid === sl.gid) slRenderMsgs(true);
}
function slTextSub(gid) {
  if (sl.tch && sl.tch.gid === gid) return;
  if (sl.tch) sb.removeChannel(sl.tch.c);
  const c = sb.channel("gm-" + gid).on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${gid}` }, p => slPush(p.new))
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "group_messages" }, p => { const l = sl.msgs[gid]; if (l && p.old && p.old.id) { sl.msgs[gid] = l.filter(m => m.id !== p.old.id); if (gid === sl.gid) slRenderMsgs(false) } }).subscribe();
  sl.tch = { gid, c };
}
function slPush(m) {
  const l = sl.msgs[m.group_id] = sl.msgs[m.group_id] || [];
  if (l.some(x => x.id === m.id)) return; l.push(m); if (l.length > 200) l.shift();
  if (m.group_id === sl.gid && sl.ch === "geral") slRenderMsgs(false);
}
async function slSendMsg() {
  const i = $("#sl-in"); if (!i) return; const body = i.value.trim(); if (!body || !sl.gid) return;
  i.value = ""; sl.draft = "";
  const { data, error } = await sb.from("group_messages").insert({ group_id: sl.gid, body }).select().single();
  if (error) { i.value = body; toast("Não foi possível enviar a mensagem."); return }
  slPush(data);
}

/* ---------- canal de presença / sinalização por grupo ---------- */
function slChan(gid) {
  if (sl.chans[gid]) return sl.chans[gid];
  const ch = sb.channel("call:" + gid, { config: { private: true, presence: { key: user.id }, broadcast: { self: false } } });
  ch.on("presence", { event: "sync" }, () => slSync(gid)).on("broadcast", { event: "sig" }, ({ payload }) => slSig(gid, payload));
  ch.subscribe(st => { if (st === "SUBSCRIBED" && sl.call && sl.call.gid === gid && !sl.call.tracked) slTrack() });
  return sl.chans[gid] = ch;
}
function slDrop(gid) { if (sl.call && sl.call.gid === gid) return; const c = sl.chans[gid]; if (c) { sb.removeChannel(c); delete sl.chans[gid]; delete sl.roster[gid] } }
function slSync(gid) {
  const st = sl.chans[gid] ? sl.chans[gid].presenceState() : {}, ro = {};
  for (const [uid, arr] of Object.entries(st)) { const m = arr[arr.length - 1]; if (m && m.room) (ro[m.room] = ro[m.room] || []).push({ uid, ...m }) }
  for (const k in ro) ro[k].sort((a, b) => (a.t || 0) - (b.t || 0));
  sl.roster[gid] = ro;
  if (sl.call && sl.call.gid === gid) slReconcile();
  if (sl.open) { slRenderList(); if (sl.gid === gid && sl.ch !== "geral") slRenderVoice() }
}
function slTrack() {
  const c = sl.call; if (!c || !sl.chans[c.gid]) return; c.tracked = true;
  return sl.chans[c.gid].track({ room: c.room, mic: !c.muted && !c.deaf, share: !!c.screen, name: nick(), t: c.t });
}

/* ---------- chamada de voz ---------- */
async function slJoin(room) {
  if (!slSupported()) { toast("Seu navegador não suporta chamadas de voz."); return }
  const gid = sl.gid; if (sl.call) { if (sl.call.gid === gid && sl.call.room === room) return; await slLeave(true) }
  if ((slRoster(gid)[room] || []).filter(m => m.uid !== user.id).length >= SL.max - 1) { toast(`Sala cheia (máx. ${SL.max} pessoas).`); return }
  let mic;
  try { mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false }) }
  catch (e) { toast(e && e.name === "NotAllowedError" ? "Permita o uso do microfone no navegador para entrar na sala." : "Não encontrei um microfone."); return }
  let ac = null; try { ac = new (window.AudioContext || window.webkitAudioContext)(); ac.resume && ac.resume() } catch (e) { }
  sl.call = { gid, room, local: mic, screen: null, pcs: {}, muted: false, deaf: false, ac, an: {}, t: Date.now(), tracked: false, streams: {} };
  slWatch(user.id, mic);
  slChan(gid); const ch = sl.chans[gid];
  if (ch.state === "joined") slTrack();   // senão o track sai no SUBSCRIBED
  if (!sl.speakT) sl.speakT = setInterval(slSpeakTick, 140);
  if (typeof musicPause === "function") musicPause();   // música de fundo para enquanto estiver na chamada
  slRender(); slPill();
}
async function slLeave(silent) {
  const c = sl.call; if (!c) return;
  sl.call = null;
  for (const uid in c.pcs) slClosePeer(c, uid);
  c.local.getTracks().forEach(t => t.stop()); if (c.screen) c.screen.getTracks().forEach(t => t.stop());
  try { if (c.ac) c.ac.close() } catch (e) { }
  try { const ch = sl.chans[c.gid]; if (ch) await ch.untrack() } catch (e) { }
  clearInterval(sl.speakT); sl.speakT = 0; sl.speak = {};
  $$("#sl-audio audio").forEach(a => a.remove()); sl.vel = {};
  if (c.gid !== sl.gid || !sl.open) slDrop(c.gid);
  if (!silent) { slRender() }
  slPill();
  if (!silent && typeof musicPlay === "function" && typeof bgm !== "undefined" && bgm.started && !bgm.userPaused) musicPlay();
}
function slReconcile() {
  const c = sl.call; if (!c) return;
  const mine = (slRoster(c.gid)[c.room] || []).map(m => m.uid).filter(u => u !== user.id);
  for (const uid of mine) if (!c.pcs[uid]) slPeer(uid);
  for (const uid of Object.keys(c.pcs)) if (!mine.includes(uid)) { slClosePeer(c, uid); if (sl.open) slRenderVoice() }
}
const slDesc = pc => ({ type: pc.localDescription.type, sdp: pc.localDescription.sdp });
function slSend(uid, data) { const c = sl.call; if (!c || !sl.chans[c.gid]) return; sl.chans[c.gid].send({ type: "broadcast", event: "sig", payload: { to: uid, from: user.id, room: c.room, ...data } }) }
function slPeer(uid) {
  const c = sl.call; if (c.pcs[uid]) return c.pcs[uid];
  const pc = new RTCPeerConnection(SL.ice()), p = { pc, polite: user.id > uid, making: false, ignore: false, queue: [], streams: {}, state: "new" };
  c.pcs[uid] = p;
  // quem tem o id maior (educado) só adiciona as trilhas depois de receber a oferta do outro: evita o "choque" de ofertas simultâneas
  p.addTracks = () => { if (p.added) return; p.added = true; c.local.getTracks().forEach(t => pc.addTrack(t, c.local)); if (c.screen) c.screen.getTracks().forEach(t => pc.addTrack(t, c.screen)) };
  if (!p.polite) p.addTracks();
  pc.onicecandidate = e => { if (e.candidate) slSend(uid, { c: e.candidate.toJSON() }) };
  pc.onnegotiationneeded = async () => { if (pc.signalingState !== "stable") return; try { p.making = true; await pc.setLocalDescription(); slSend(uid, { d: slDesc(pc) }) } catch (e) { } finally { p.making = false } };
  pc.ontrack = e => {
    const s = e.streams[0]; if (!s) return;
    if (!p.streams[s.id]) { p.streams[s.id] = s; s.onremovetrack = () => { if (!s.getTracks().length) { delete p.streams[s.id]; slPaintMedia(uid) } else slPaintMedia(uid) } }
    slPaintMedia(uid);
    e.track.onunmute = () => slPaintMedia(uid);
  };
  pc.onconnectionstatechange = () => { p.state = pc.connectionState; if (pc.connectionState === "failed") { try { pc.restartIce() } catch (e) { } } if (sl.open) slRenderVoice() };
  return p;
}
function slClosePeer(c, uid) {
  const p = c.pcs[uid]; if (!p) return; delete c.pcs[uid];
  try { p.pc.close() } catch (e) { }
  for (const k of Object.keys(sl.vel)) if (k.startsWith(uid + ":")) { sl.vel[k].remove(); delete sl.vel[k] }
  delete sl.speak[uid]; delete c.an[uid];
}
async function slSig(gid, d) {
  const c = sl.call; if (!c || c.gid !== gid || !d || d.to !== user.id || d.room !== c.room) return;
  const uid = d.from; if (!uid || uid === user.id) return;
  const p = slPeer(uid), pc = p.pc;
  try {
    if (d.d) {
      const collision = d.d.type === "offer" && (p.making || pc.signalingState !== "stable");
      p.ignore = !p.polite && collision; if (p.ignore) return;
      await pc.setRemoteDescription(d.d);
      if (d.d.type === "offer") p.addTracks();
      for (const q of p.queue.splice(0)) { try { await pc.addIceCandidate(q) } catch (e) { } }
      if (d.d.type === "offer") { await pc.setLocalDescription(); slSend(uid, { d: slDesc(pc) }) }
    } else if (d.c) {
      if (!pc.remoteDescription) p.queue.push(d.c); else { try { await pc.addIceCandidate(d.c) } catch (e) { if (!p.ignore) throw e } }
    }
  } catch (e) { }
}

/* ---------- mídia: áudio, vídeo e quem está falando ---------- */
function slAudioBox() { let b = $("#sl-audio"); if (!b) { b = document.createElement("div"); b.id = "sl-audio"; b.hidden = true; document.body.appendChild(b) } return b }
function slPaintMedia(uid) {
  const c = sl.call, p = c && c.pcs[uid]; if (!p) return;
  for (const s of Object.values(p.streams)) {
    const hasV = s.getVideoTracks().length > 0, key = uid + ":" + s.id;
    if (!hasV) {
      if (!sl.vel[key]) { const a = document.createElement("audio"); a.autoplay = true; a.setAttribute("playsinline", ""); a.srcObject = s; a.muted = c.deaf; slAudioBox().appendChild(a); sl.vel[key] = a; slWatch(uid, s); const pr = a.play(); if (pr && pr.catch) pr.catch(() => { }) }
    } else if (!sl.vel[key]) { const v = document.createElement("video"); v.autoplay = true; v.playsinline = true; v.setAttribute("playsinline", ""); v.srcObject = s; v.muted = c.deaf; sl.vel[key] = v; const pr = v.play(); if (pr && pr.catch) pr.catch(() => { }) }
  }
  if (sl.open) slRenderVoice();
}
function slWatch(uid, stream) {
  const c = sl.call; if (!c || !c.ac || !stream.getAudioTracks().length) return;
  try { const src = c.ac.createMediaStreamSource(stream), an = c.ac.createAnalyser(); an.fftSize = 512; src.connect(an); c.an[uid] = { an, buf: new Uint8Array(an.fftSize) } } catch (e) { }
}
function slSpeakTick() {
  const c = sl.call; if (!c) return; let changed = false;
  for (const [uid, o] of Object.entries(c.an)) {
    o.an.getByteTimeDomainData(o.buf); let s = 0; for (const v of o.buf) { const x = (v - 128) / 128; s += x * x }
    let on = Math.sqrt(s / o.buf.length) > 0.035; if (uid === user.id && (c.muted || c.deaf)) on = false;
    if (!!sl.speak[uid] !== on) { sl.speak[uid] = on; changed = true; $$(`[data-uid="${uid}"]`).forEach(e => e.classList.toggle("speaking", on)) }
  }
}

/* ---------- tela da sala de voz ---------- */
function slRenderVoice() {
  const box = $("#sl-voice"); if (!box || sl.ch === "geral") return;
  const c = sl.call, inHere = c && c.gid === sl.gid && c.room === sl.ch, ms = slRoster(sl.gid)[sl.ch] || [], room = SL.rooms.find(r => r.id === sl.ch);
  if (!inHere) {
    box.innerHTML = `<div class="sl-pre"><h3>🔊 ${room.name}</h3>${ms.length ? `<div class="sl-tiles">${ms.map(m => slTile(m, null)).join("")}</div>` : `<p class="muted">Ninguém na sala. Entre e chame o pessoal!</p>`}
      <button class="btn" data-sl="join" ${ms.length >= SL.max ? "disabled" : ""}>🎙 Entrar na sala</button>
      <p class="muted sl-note">Até ${SL.max} pessoas por sala · precisa permitir o microfone · se alguém não conectar, tente outra rede (Wi-Fi).</p></div>`;
    return;
  }
  const shares = [], me = ms.find(m => m.uid === user.id) || { uid: user.id, mic: !c.muted };
  for (const m of ms) {
    if (!m.share) continue;
    if (m.uid === user.id) { if (c.screen) shares.push({ m, el: slLocalShare(c) }) }
    else { const p = c.pcs[m.uid]; if (!p) continue; const k = Object.keys(sl.vel).find(k => k.startsWith(m.uid + ":") && sl.vel[k].tagName === "VIDEO"); if (k) shares.push({ m, el: sl.vel[k] }) }
  }
  const canShare = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  box.innerHTML = `${shares.length ? `<div class="sl-stage">${shares.map((s, i) => `<figure class="sl-share" data-slv="${i}"><figcaption>🖥 ${s.m.uid === user.id ? "Você está transmitindo" : esc(slName(slP(s.m.uid))) + " está transmitindo"}</figcaption><button class="iconbtn sl-fs" data-sl="fs:${i}" aria-label="Tela cheia">⛶</button></figure>`).join("")}</div>` : ""}
    <div class="sl-tiles">${ms.map(m => slTile(m, c.pcs[m.uid] || null)).join("")}</div>
    <div class="sl-ctl" role="toolbar" aria-label="Controles da chamada">
      <button class="sl-b${c.muted ? " off" : ""}" data-sl="mute" aria-pressed="${c.muted}" title="${c.muted ? "Ativar microfone" : "Silenciar microfone"}">${c.muted ? "🔇" : "🎙"}<span>${c.muted ? "Mudo" : "Mic"}</span></button>
      <button class="sl-b${c.deaf ? " off" : ""}" data-sl="deaf" aria-pressed="${c.deaf}" title="Ensurdecer (parar de ouvir)">${c.deaf ? "🔕" : "🎧"}<span>${c.deaf ? "Surdo" : "Áudio"}</span></button>
      ${true ? `<button class="sl-b${c.screen ? " on" : ""}${canShare ? "" : " na"}" data-sl="share" aria-pressed="${!!c.screen}" title="${c.screen ? "Parar transmissão" : "Transmitir tela"}">🖥<span>${c.screen ? "Parar" : "Tela"}</span></button>` : ""}
      <button class="sl-b end" data-sl="leave" title="Sair da chamada">📞<span>Sair</span></button></div>
    ${canShare ? "" : `<p class="muted sl-note">Neste aparelho o navegador não permite transmitir a tela (funciona no computador e no iPhone com iOS 27 ou mais novo).</p>`}`;
  box.querySelectorAll("[data-slv]").forEach(f => { const s = shares[+f.dataset.slv]; if (s && s.el) f.insertBefore(s.el, f.firstChild) });
}
function slLocalShare(c) {
  let v = sl.vel["me:screen"]; if (!v || v.srcObject !== c.screen) { v = document.createElement("video"); v.muted = true; v.autoplay = true; v.setAttribute("playsinline", ""); v.srcObject = c.screen; sl.vel["me:screen"] = v; const pr = v.play(); if (pr && pr.catch) pr.catch(() => { }) }
  return v;
}
function slTile(m, p) {
  const pr = slP(m.uid), st = p && p.state !== "connected" && p.state !== "new" ? p.state : "";
  return `<div class="sl-t${sl.speak[m.uid] ? " speaking" : ""}" data-uid="${m.uid}"><span class="av lg">${avatar(pr.avatar)}</span><b>${esc(slName(pr))}${m.uid === user.id ? " (você)" : ""}</b>
    <small>${m.mic === false ? "🔇 mudo" : ""}${m.share ? " 🖥 ao vivo" : ""}${st === "connecting" || st === "disconnected" ? " conectando…" : st === "failed" ? " ⚠ sem conexão" : ""}</small></div>`;
}

/* ---------- controles ---------- */
function slMute() { const c = sl.call; if (!c) return; if (c.deaf) { c.deaf = false; slApplyDeaf() } c.muted = !c.muted; slApplyMic(); slTrack(); slRenderVoice() }
function slDeaf() { const c = sl.call; if (!c) return; c.deaf = !c.deaf; slApplyDeaf(); slApplyMic(); slTrack(); slRenderVoice() }
function slApplyMic() { const c = sl.call; c.local.getAudioTracks().forEach(t => t.enabled = !c.muted && !c.deaf) }
function slApplyDeaf() { const c = sl.call; Object.values(sl.vel).forEach(e => { if (e !== sl.vel["me:screen"]) e.muted = c.deaf }) }
async function slShare() {
  const c = sl.call; if (!c) return;
  if (c.screen) return slShareStop();
  if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) { toast("Este navegador não permite transmitir a tela. Use o computador ou um iPhone com iOS 27+."); return }
  let s; try { s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true }) } catch (e) { if (e && e.name !== "NotAllowedError") toast("Não consegui iniciar a transmissão de tela."); return }
  if (!sl.call) { s.getTracks().forEach(t => t.stop()); return }
  c.screen = s; const v = s.getVideoTracks()[0]; if (v) { try { v.contentHint = "detail" } catch (e) { } v.onended = () => { if (sl.call && sl.call.screen === s) slShareStop() } }
  for (const p of Object.values(c.pcs)) if (p.added) s.getTracks().forEach(t => p.pc.addTrack(t, s));
  slTrack(); slRenderVoice(); slRenderList();
}
function slShareStop() {
  const c = sl.call; if (!c || !c.screen) return; const s = c.screen; c.screen = null;
  for (const p of Object.values(c.pcs)) p.pc.getSenders().forEach(sn => { if (sn.track && s.getTracks().includes(sn.track)) { try { p.pc.removeTrack(sn) } catch (e) { } } });
  s.getTracks().forEach(t => t.stop()); if (sl.vel["me:screen"]) { sl.vel["me:screen"].remove(); delete sl.vel["me:screen"] }
  slTrack(); slRenderVoice(); slRenderList();
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sl]"); if (!b || !$("#salas") || $("#salas").hidden) return;
  const [a, v] = b.dataset.sl.split(":");
  if (a === "srv") { if (v === sl.gid) { sl.pane = "list"; slRender(); return } const old = sl.gid; sl.gid = v; sl.ch = "geral"; sl.pane = "list"; sl.draft = ""; slEnter(v); if (old) slDrop(old); slRender() }
  else if (a === "ch") { sl.ch = v; sl.pane = "main"; const el = $("#salas .sl"); if (el) el.dataset.pane = "main"; slRenderList(); slRenderMain() }
  else if (a === "back") { sl.pane = "list"; const el = $("#salas .sl"); if (el) el.dataset.pane = "list" }
  else if (a === "newgroup") openNewGroup();
  else if (a === "manage") openGroup(sl.gid);
  else if (a === "join") slJoin(sl.ch);
  else if (a === "leave") slLeave();
  else if (a === "mute") slMute();
  else if (a === "deaf") slDeaf();
  else if (a === "share") slShare();
  else if (a === "fs") { const f = b.closest("figure"), vd = f && f.querySelector("video"); if (vd && vd.requestFullscreen) vd.requestFullscreen().catch(() => { }) }
});
document.addEventListener("submit", e => { if (e.target.id === "sl-form") { e.preventDefault(); slSendMsg() } });
document.addEventListener("keydown", e => { if (e.target.id === "sl-in" && e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); slSendMsg() } });
document.addEventListener("input", e => { if (e.target.id === "sl-in") sl.draft = e.target.value });
window.addEventListener("beforeunload", () => { try { if (sl.call && sl.chans[sl.call.gid]) sl.chans[sl.call.gid].untrack() } catch (e) { } });
/* ao mudar a lista de grupos (criar/sair/excluir) a aba atualiza */
function slGroupsChanged() { if (sl.open) { if (!fr.groups.find(g => g.id === sl.gid)) { if (sl.call && sl.call.gid === sl.gid) slLeave(true); sl.gid = (fr.groups[0] || {}).id || null; if (sl.gid) slEnter(sl.gid) } slRender() } }
function slReset() { if (sl.call) slLeave(true); for (const g of Object.keys(sl.chans)) { try { sb.removeChannel(sl.chans[g]) } catch (e) { } } if (sl.tch) { try { sb.removeChannel(sl.tch.c) } catch (e) { } } sl = { gid: null, ch: "geral", room: null, pane: "list", msgs: {}, loaded: {}, chans: {}, roster: {}, tch: null, call: null, speak: {}, draft: "", vel: {}, open: false } }
