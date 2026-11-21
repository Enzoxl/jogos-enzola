/* Jogos Enzola — aba "Outros jogos": lista de minigames. Primeiro: Cobra do Hipopótamo (estilo Snake). */
const AR_GAMES = [
  { id: "snake", emoji: "🍉", name: "Cobra do Hipopótamo", desc: "Guie o hipopótamo, coma melancias e cresça sem bater na parede nem em si mesmo." },
  { id: "soon1", emoji: "🫧", name: "Em breve", desc: "Mais um minigame chegando.", soon: true },
  { id: "soon2", emoji: "🎯", name: "Em breve", desc: "Mais um minigame chegando.", soon: true },
];
let arSel = null;
const SN = { N: 16, dayCap: 40 };
let sn = null, snRaf = 0, snHead = null, snKeysBound = false;
snHead = new Image(); snHead.src = "hipopotamo.webp";

const snStats = () => { lg = lg || lgLoad(); const s = lg.snake = lg.snake || { best: 0, day: "", earned: 0, plays: 0 }; if (s.day !== spDay(0)) { s.day = spDay(0); s.earned = 0 } return s };

function arcadeHTML() {
  if (arSel === "snake") {
    const st = snStats();
    return `<div class="ar-game">
      <div class="ar-hud"><button class="btn ghost sm" data-ar="back" aria-label="Voltar à lista de jogos">← Jogos</button>
        <div class="ar-sc"><span>Pontos</span><b id="sn-score">0</b></div><div class="ar-sc"><span>Recorde</span><b id="sn-best">${st.best}</b></div>
        <button class="iconbtn" data-sn="pause" aria-label="Pausar">⏸</button></div>
      <div class="ar-stage"><canvas id="sn-cv" aria-label="Jogo da cobra do hipopótamo" role="img"></canvas><div class="ar-ov" id="sn-ov"></div></div>
      <div class="ar-pad" aria-label="Controles"><button data-sn-dir="up" aria-label="Cima">▲</button><button data-sn-dir="left" aria-label="Esquerda">◀</button><button data-sn-dir="down" aria-label="Baixo">▼</button><button data-sn-dir="right" aria-label="Direita">▶</button></div>
      <p class="muted ar-tip">Setas ou WASD no teclado · deslize no celular. A cada 2 pontos você ganha 1 Enzola Coin (até ${SN.dayCap} por dia). Melancia dourada vale 3!</p></div>`;
  }
  return `<div class="sec-head"><div><h2 class="h">Outros jogos</h2><p class="muted">Escolha um minigame para jogar e ganhar Enzola Coins.</p></div></div>
    <div class="ar-grid">${AR_GAMES.map(g => `<button class="ar-card${g.soon ? " soon" : ""}" ${g.soon ? "disabled" : `data-ar="${g.id}"`}><span class="ar-em" aria-hidden="true">${g.emoji}</span><b>${g.name}</b><small>${g.desc}</small>${g.soon ? "" : `<span class="ar-play">Jogar ▶</span>`}</button>`).join("")}</div>`;
}
function arcadeMount() { if (arSel === "snake") { if (!sn) snNew(); snFit(); snUI(); snLoop() } else { snStop() } }

/* ---------- lógica ---------- */
function snNew() {
  const N = SN.N, m = Math.floor(N / 2);
  const body = [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }];
  sn = { body, prev: body.map(b => ({ ...b })), dir: { x: 1, y: 0 }, q: [], score: 0, state: "ready", acc: 0, t: 0, fruit: null, parts: [], ang: 0, shake: 0, coins: 0, newBest: false, pops: [], golden: false };
  snFruit();
}
const snFree = (x, y) => !sn.body.some(b => b.x === x && b.y === y);
function snFruit() {
  const N = SN.N, cells = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (snFree(x, y)) cells.push({ x, y });
  if (!cells.length) { sn.fruit = null; return }
  const c = cells[Math.floor(Math.random() * cells.length)]; sn.fruit = { ...c, gold: sn.score >= 4 && Math.random() < .12, born: performance.now() };
}
const snSpeed = () => Math.max(72, 150 - sn.score * 2.2);
function snDir(d) {
  if (!sn || sn.state === "over") return;
  const last = sn.q.length ? sn.q[sn.q.length - 1] : sn.dir;
  if ((d.x === -last.x && d.y === -last.y) || (d.x === last.x && d.y === last.y)) return;
  if (sn.q.length < 2) sn.q.push(d);
  if (sn.state === "ready") snStart(); else if (sn.state === "paused") snPause(false);
}
function snStart() { sn.state = "play"; sn.t = performance.now(); sn.acc = 0; snUI() }
function snPause(on) { if (!sn || (sn.state !== "play" && sn.state !== "paused")) return; sn.state = on ? "paused" : "play"; sn.t = performance.now(); snUI() }
function snTick() {
  const N = SN.N; if (sn.q.length) sn.dir = sn.q.shift();
  const h = sn.body[0], nh = { x: h.x + sn.dir.x, y: h.y + sn.dir.y };
  const eat = sn.fruit && nh.x === sn.fruit.x && nh.y === sn.fruit.y;
  const tail = sn.body.length - (eat ? 0 : 1);
  if (nh.x < 0 || nh.y < 0 || nh.x >= N || nh.y >= N || sn.body.slice(0, tail).some(b => b.x === nh.x && b.y === nh.y)) return snOver();
  sn.prev = sn.body.map(b => ({ ...b })); sn.body.unshift(nh); if (!eat) sn.body.pop(); else sn.prev.push({ ...sn.prev[sn.prev.length - 1] });
  sn.prev.unshift({ ...h }); sn.prev.length = sn.body.length;
  if (eat) {
    const g = sn.fruit.gold, add = g ? 3 : 1; sn.score += add;
    for (let i = 0; i < 12; i++) { const a = Math.random() * 6.283, v = .5 + Math.random() * 1.6; sn.parts.push({ x: nh.x + .5, y: nh.y + .5, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: g ? "#ffd84a" : (i % 2 ? "#ff5c7a" : "#4ade80") }) }
    sn.pops.push({ x: nh.x + .5, y: nh.y, t: 1, txt: "+" + add, gold: g }); snFruit(); snUI();
    if (!sn.fruit) snOver(true);
  }
}
function snOver(won) {
  sn.state = "over"; sn.shake = 1; const st = snStats(); st.plays = (st.plays || 0) + 1;
  sn.newBest = sn.score > (st.best || 0); if (sn.newBest) st.best = sn.score;
  const want = Math.floor(sn.score / 2), room = Math.max(0, SN.dayCap - (st.earned || 0)); sn.coins = Math.min(want, room); sn.capped = want > room;
  if (sn.coins > 0 && typeof lgAward === "function" && user) { st.earned += sn.coins; lgAward(sn.coins) } else lgSave(true);
  sn.won = !!won; snUI();
}
function snUI() {
  const ov = $("#sn-ov"); if (!ov || !sn) return;
  const sc = $("#sn-score"); if (sc) sc.textContent = sn.score; const bs = $("#sn-best"); if (bs) bs.textContent = Math.max(snStats().best || 0, sn.score);
  const pb = document.querySelector('[data-sn="pause"]'); if (pb) pb.textContent = sn.state === "paused" ? "▶" : "⏸";
  if (sn.state === "play") { ov.className = "ar-ov"; ov.innerHTML = ""; return }
  ov.className = "ar-ov on";
  if (sn.state === "ready") ov.innerHTML = `<div class="ar-box"><div class="ar-big">🦛</div><b>Cobra do Hipopótamo</b><p>Toque, deslize ou use uma seta para começar.</p><button class="btn" data-sn="start">Jogar</button></div>`;
  else if (sn.state === "paused") ov.innerHTML = `<div class="ar-box"><b>Pausado</b><button class="btn" data-sn="resume">Continuar</button></div>`;
  else ov.innerHTML = `<div class="ar-box"><b>${sn.won ? "Tabuleiro completo! 🏆" : "Fim de jogo"}</b><div class="ar-res"><div><span>Pontos</span><b>${sn.score}</b></div><div><span>Recorde</span><b>${Math.max(snStats().best || 0, sn.score)}</b></div></div>
    ${sn.newBest && sn.score ? `<p class="ar-nb">🎉 Novo recorde!</p>` : ""}<p>${sn.coins ? `+${sn.coins} Enzola Coins` : sn.capped ? "Limite de moedas de hoje atingido." : "Faça 2 pontos ou mais para ganhar moedas."}</p><button class="btn" data-sn="again">Jogar de novo</button></div>`;
}
function snFit() {
  const cv = $("#sn-cv"); if (!cv) return; const w = Math.min(cv.parentElement.clientWidth || 360, 460), d = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.style.width = cv.style.height = w + "px"; cv.width = cv.height = Math.round(w * d);
}
function snStop() { cancelAnimationFrame(snRaf); snRaf = 0 }
function snLoop() { if (snRaf) return; const f = now => { snRaf = requestAnimationFrame(f); const cv = $("#sn-cv"); if (!cv || !sn) { snStop(); if (sn && sn.state === "play") sn.state = "paused"; return } snFrame(cv, now) }; snRaf = requestAnimationFrame(f) }
function snFrame(cv, now) {
  if (sn.state === "play") { sn.acc += now - sn.t; sn.t = now; const sp = snSpeed(); let g = 0; while (sn.acc >= sp && sn.state === "play" && g++ < 4) { sn.acc -= sp; snTick() } if (sn.state !== "play") sn.acc = 0 }
  const k = sn.state === "play" ? Math.min(1, sn.acc / snSpeed()) : 1;
  snDraw(cv, k, now);
}
function snDraw(cv, k, now) {
  const c = cv.getContext("2d"), W = cv.width, N = SN.N, u = W / N; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, W);
  if (sn.shake > 0) { sn.shake = Math.max(0, sn.shake - .04); c.translate((Math.random() - .5) * u * .5 * sn.shake, (Math.random() - .5) * u * .5 * sn.shake) }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { c.fillStyle = (x + y) % 2 ? "#13264f" : "#102146"; c.fillRect(x * u, y * u, u + .5, u + .5) }
  const P = sn.body.map((b, i) => { const p = sn.prev[i] || b; return { x: (p.x + (b.x - p.x) * k + .5) * u, y: (p.y + (b.y - p.y) * k + .5) * u } });
  // fruta
  const fr = sn.fruit; if (fr) {
    const t = (now - fr.born) / 1000, cx = (fr.x + .5) * u, cy = (fr.y + .5) * u, pulse = 1 + Math.sin(t * 5) * .06, r = u * .46 * pulse, sp = Math.min(1, t * 6);
    c.save(); c.translate(cx, cy); c.scale(sp, sp);
    if (fr.gold) { const g = c.createRadialGradient(0, 0, r * .2, 0, 0, r * 1.9); g.addColorStop(0, "rgba(255,216,74,.55)"); g.addColorStop(1, "rgba(255,216,74,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 1.9, 0, 7); c.fill();
      c.fillStyle = "#f2b72a"; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.fillStyle = "#ffe27a"; c.beginPath(); c.arc(-r * .15, -r * .15, r * .72, 0, 7); c.fill();
      c.fillStyle = "#a35a00"; c.font = `700 ${r * 1.1}px "Chakra Petch",sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("E", 0, r * .05) }
    else { c.rotate(-.25); c.fillStyle = "#1f8a4c"; c.beginPath(); c.arc(0, -r * .2, r * 1.05, 0, Math.PI); c.closePath(); c.fill();
      c.fillStyle = "#b9f5c6"; c.beginPath(); c.arc(0, -r * .2, r * .92, 0, Math.PI); c.closePath(); c.fill();
      c.fillStyle = "#ff4f6d"; c.beginPath(); c.arc(0, -r * .2, r * .8, 0, Math.PI); c.closePath(); c.fill();
      c.fillStyle = "#2a1020"; for (const [sx, sy] of [[-.4, .25], [0, .4], [.4, .25]]) { c.beginPath(); c.ellipse(sx * r, (sy - .2) * r, r * .07, r * .11, 0, 0, 7); c.fill() } }
    c.restore() }
  // corpo
  if (P.length > 1) {
    const path = () => { c.beginPath(); c.moveTo(P[P.length - 1].x, P[P.length - 1].y); for (let i = P.length - 2; i >= 0; i--) c.lineTo(P[i].x, P[i].y) };
    c.lineCap = c.lineJoin = "round";
    c.strokeStyle = "rgba(0,0,0,.28)"; c.lineWidth = u * .86; c.save(); c.translate(0, u * .07); path(); c.stroke(); c.restore();
    c.strokeStyle = "#5f6676"; c.lineWidth = u * .84; path(); c.stroke();
    c.strokeStyle = "#7b8396"; c.lineWidth = u * .6; path(); c.stroke();
    c.strokeStyle = "rgba(190,200,220,.35)"; c.lineWidth = u * .22; c.save(); c.translate(0, -u * .1); path(); c.stroke(); c.restore();
  }
  // cabeça (foto do hipopótamo, girando suave)
  const h = P[0], d = sn.dir, target = Math.atan2(d.y, d.x); let diff = target - sn.ang; while (diff > Math.PI) diff -= 6.283; while (diff < -Math.PI) diff += 6.283; sn.ang += diff * .28;
  c.save(); c.translate(h.x + d.x * u * .12, h.y + d.y * u * .12); c.rotate(sn.ang); if (Math.cos(sn.ang) < 0) c.scale(1, -1);
  const hw = u * 2.15, hh = hw * 280 / 350;
  if (snHead.complete && snHead.naturalWidth) c.drawImage(snHead, 130, 0, 350, 280, -hw * .5, -hh * .5, hw, hh); else { c.fillStyle = "#8a93a6"; c.beginPath(); c.arc(0, 0, u * .6, 0, 7); c.fill() }
  c.restore();
  // partículas e +pontos
  sn.parts = sn.parts.filter(p => (p.life -= .035) > 0); for (const p of sn.parts) { p.x += p.vx * .03; p.y += p.vy * .03; c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.c; c.beginPath(); c.arc(p.x * u, p.y * u, u * .1 * p.life + 1, 0, 7); c.fill() }
  c.globalAlpha = 1; sn.pops = sn.pops.filter(p => (p.t -= .025) > 0);
  for (const p of sn.pops) { c.globalAlpha = Math.min(1, p.t * 1.6); c.fillStyle = p.gold ? "#ffd84a" : "#fff"; c.font = `700 ${u * .62}px "Chakra Petch",sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(p.txt, p.x * u, (p.y - (1 - p.t) * 1.4) * u) }
  c.globalAlpha = 1;
}

/* ---------- entrada ---------- */
const SN_KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
const SN_V = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
if (!snKeysBound) {
  snKeysBound = true;
  document.addEventListener("keydown", e => {
    if (!sn || arSel !== "snake" || !$("#sn-cv") || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target; if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    if (e.key === " " || e.key === "p" || e.key === "P") { e.preventDefault(); if (sn.state === "ready") snStart(); else if (sn.state === "over") { snNew(); snUI(); snStart() } else snPause(sn.state === "play"); return }
    const d = SN_KEYS[e.key]; if (d) { e.preventDefault(); if (sn.state === "over") return; snDir(SN_V[d]) }
  });
  let sx = 0, sy = 0, sid = null;
  document.addEventListener("pointerdown", e => { const cv = e.target.closest && e.target.closest("#sn-cv"); if (!cv) return; sx = e.clientX; sy = e.clientY; sid = e.pointerId; if (sn && sn.state === "ready") snStart() }, { passive: true });
  document.addEventListener("pointermove", e => {
    if (sid !== e.pointerId || !sn) return; const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    snDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? SN_V.right : SN_V.left) : (dy > 0 ? SN_V.down : SN_V.up)); sx = e.clientX; sy = e.clientY;
  }, { passive: true });
  document.addEventListener("pointerup", e => { if (e.pointerId === sid) sid = null }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden && sn && sn.state === "play") snPause(true) });
  window.addEventListener("resize", () => { if ($("#sn-cv")) snFit() });
  document.addEventListener("click", e => {
    let b;
    if (b = e.target.closest("[data-ar]")) { const v = b.dataset.ar; if (v === "back") { arSel = null; snStop(); if (sn && sn.state === "play") sn.state = "paused" } else { arSel = v; if (v === "snake") snNew() } renderLingo(); return }
    if (b = e.target.closest("[data-sn-dir]")) { snDir(SN_V[b.dataset.snDir]); return }
    if (b = e.target.closest("[data-sn]")) { const a = b.dataset.sn; if (!sn) return;
      if (a === "start") snStart(); else if (a === "resume") snPause(false); else if (a === "pause") snPause(sn.state === "play"); else if (a === "again") { snNew(); snUI(); snStart() } }
  });
}
