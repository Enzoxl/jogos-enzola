/* Jogos Enzola — aba "Outros jogos": lista de minigames. Primeiro: Cobra do Hipopótamo (estilo Snake). */
const AR_GAMES = [
  { id: "snake", emoji: "🍉", name: "Cobra do Hipopótamo", desc: "Guie o hipopótamo, coma melancias e cresça sem bater na parede nem em si mesmo." },
  { id: "cards", emoji: "🃏", name: "Duelo de Cartas", desc: "55 cartas de hipopótamos, personagens e skins. Escolha o atributo certo e vença a CPU em 5 rodadas." },
  { id: "race", emoji: "🏁", name: "Corrida de Hipopótamos", desc: "Escolha o hipopótamo vencedor, aposte Enzola Coins e receba o dobro se ele ganhar." },
  { id: "find", emoji: "🔎", name: "Cadê o Enzola?", desc: "Ache o hipopótamo escondido em cenários lotados de personagens, antes do tempo acabar." },
  { id: "puzzle", emoji: "🧩", name: "Quebra-cabeça de Hipopótamos", desc: "Monte as fotos do álbum: 3 tamanhos, dicas e moedas na primeira vez que completar cada foto." },
  { id: "soon2", emoji: "🎯", name: "Em breve", desc: "Mais um minigame chegando.", soon: true },
];
let arSel = null;
// recompensa por nível: a pessoa recebe as moedas do MAIOR nível alcançado na partida (não soma)
const SN = { N: 16, full: 8, dayCap: 80, levels: [{ pts: 3, coins: 2 }, { pts: 8, coins: 5 }, { pts: 15, coins: 10 }, { pts: 25, coins: 16 }, { pts: 40, coins: 24 }, { pts: 60, coins: 35 }, { pts: 90, coins: 50 }] };
const snLevel = pts => SN.levels.reduce((l, x, i) => pts >= x.pts ? i + 1 : l, 0);
const snCoinsFor = pts => { const l = snLevel(pts); return l ? SN.levels[l - 1].coins : 0 };
let sn = null, snRaf = 0, snHead = null, snKeysBound = false;
snHead = new Image(); snHead.src = "hipopotamo.webp";
let snPat = null, snPatU = 0, snHeadCv = null;
function snHeadSprite() {
  if (snHeadCv || !(snHead.complete && snHead.naturalWidth)) return snHeadCv;
  const t = document.createElement("canvas"); t.width = 350; t.height = 280; const x = t.getContext("2d");
  x.drawImage(snHead, 130, 0, 350, 280, 0, 0, 350, 280);
  x.globalCompositeOperation = "destination-in"; const g = x.createLinearGradient(0, 0, 110, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.75, "#000"); x.fillStyle = g; x.fillRect(0, 0, 350, 280);
  const g2 = x.createLinearGradient(0, 215, 0, 280); g2.addColorStop(0, "#000"); g2.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g2; x.fillRect(0, 0, 350, 280);
  return (snHeadCv = t);
}
// textura da pele do hipopótamo, recortada da própria foto (barriga/peito)
function snSkin(c, u) {
  if (!(snHead.complete && snHead.naturalWidth)) return "#7b8396";
  if (!snPat || snPatU !== u) { const t = document.createElement("canvas"); t.width = t.height = Math.max(8, Math.round(u * 2.2)); const x = t.getContext("2d"); x.drawImage(snHead, 120, 290, 220, 220, 0, 0, t.width, t.height); snPat = c.createPattern(t, "repeat"); snPatU = u }
  return snPat || "#7b8396";
}

const snStats = () => { lg = lg || lgLoad(); const s = lg.snake = lg.snake || { best: 0, day: "", earned: 0, plays: 0 }; if (s.day !== spDay(0)) { s.day = spDay(0); s.earned = 0 } return s };

function arcadeHTML() {
  if (arSel === "cards") return `<div id="cg-root"></div>`;
  if (arSel === "race") return `<div id="rc-root"></div>`;
  if (arSel === "find") return `<div id="fh-root"></div>`;
  if (arSel === "puzzle") return `<div id="pz-root"></div>`;
  if (arSel === "snake") {
    const st = snStats();
    return `<div class="ar-game">
      <div class="ar-hud"><button class="btn ghost sm" data-ar="back" aria-label="Voltar à lista de jogos">← Jogos</button>
        <div class="ar-sc"><span>Pontos</span><b id="sn-score">0</b></div><div class="ar-sc"><span>Nível</span><b id="sn-lv">0</b></div><div class="ar-sc"><span>Recorde</span><b id="sn-best">${st.best}</b></div>
        <button class="iconbtn" data-sn="pause" aria-label="Pausar">⏸</button></div>
      <div class="ar-stage"><canvas id="sn-cv" aria-label="Jogo da cobra do hipopótamo" role="img"></canvas><div class="ar-ov" id="sn-ov"></div></div>
      <div class="ar-pad" aria-label="Controles"><button data-sn-dir="up" aria-label="Cima">▲</button><button data-sn-dir="left" aria-label="Esquerda">◀</button><button data-sn-dir="down" aria-label="Baixo">▼</button><button data-sn-dir="right" aria-label="Direita">▶</button></div>
      <div class="ar-how-row"><button class="btn ghost sm" data-ar-how="snake">❓ Como jogar</button></div><p class="muted ar-tip">Setas ou WASD no teclado · deslize no celular. Quanto mais alto o nível, mais Enzola Coins (até ${SN.dayCap} por dia). Melancia dourada vale 3!</p></div>`;
  }
  return `<div class="sec-head"><div><h2 class="h">Outros jogos</h2><p class="muted">Escolha um minigame para jogar e ganhar Enzola Coins.</p></div></div>
    <div class="ar-grid">${AR_GAMES.map(g => g.soon ? `<div class="ar-card soon"><span class="ar-em" aria-hidden="true">${g.emoji}</span><b>${g.name}</b><small>${g.desc}</small></div>` : `<div class="ar-card"><span class="ar-em" aria-hidden="true">${g.emoji}</span><b>${g.name}</b><small>${g.desc}</small><div class="ar-cacts"><button class="btn sm" data-ar="${g.id}">Jogar ▶</button><button class="btn ghost sm" data-ar-how="${g.id}">❓ Como jogar</button></div></div>`).join("")}</div>`;
}
function arcadeMount() { if (arSel === "snake") { if (!sn) snNew(); snFit(); snUI(); snLoop() } else { snStop(); if (arSel === "cards" && typeof cgMount === "function") cgMount(); if (arSel === "race" && typeof rcMount === "function") rcMount(); if (arSel === "find" && typeof fhMount === "function") fhMount(); if (arSel === "puzzle" && typeof pzMount === "function") pzMount() } }

/* ---------- lógica ---------- */
function snNew() {
  const N = SN.N, m = Math.floor(N / 2);
  const body = [{ x: m, y: m }, { x: m - 1, y: m }];
  sn = { body, prev: body.map(b => ({ ...b })), dir: { x: 1, y: 0 }, q: [], score: 0, state: "ready", acc: 0, t: 0, fruit: null, parts: [], ang: 0, shake: 0, coins: 0, newBest: false, pops: [], golden: false, lv: 0, level: 0, done: false };
  snFruit();
}
const snFree = (x, y) => !sn.body.some(b => b.x === x && b.y === y);
function snFruit() {
  const N = SN.N, cells = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (snFree(x, y)) cells.push({ x, y });
  if (!cells.length) { sn.fruit = null; return }
  const c = cells[Math.floor(Math.random() * cells.length)]; sn.fruit = { ...c, gold: sn.score >= 4 && Math.random() < .12, born: performance.now() };
}
const snSpeed = () => Math.max(125, 235 - sn.score * 2.2);      // devagar no começo; acelera pouco
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
    sn.pops.push({ x: nh.x + .5, y: nh.y, t: 1, txt: "+" + add, gold: g });
    const lv = snLevel(sn.score); if (lv > sn.lv) { sn.lv = lv; sn.pops.push({ x: SN.N / 2, y: 2.2, t: 1.6, txt: "Nível " + lv + "! +" + SN.levels[lv - 1].coins + " 🪙", gold: true, big: true }) }
    if (!sn.done && sn.body.length >= SN.full) { sn.done = true; sn.pops.push({ x: SN.N / 2, y: 4.2, t: 1.6, txt: "Corpo completo!", gold: false, big: true }) }
    snFruit(); snUI();
    if (!sn.fruit) snOver(true);
  }
}
function snOver(won) {
  sn.state = "over"; sn.shake = 1; const st = snStats(); st.plays = (st.plays || 0) + 1;
  sn.newBest = sn.score > (st.best || 0); if (sn.newBest) st.best = sn.score;
  sn.level = snLevel(sn.score); const want = snCoinsFor(sn.score), room = Math.max(0, SN.dayCap - (st.earned || 0)); sn.coins = Math.min(want, room); sn.capped = want > room;
  if (sn.coins > 0 && typeof lgAward === "function" && user) { st.earned += sn.coins; lgAward(sn.coins) } else lgSave(true);
  sn.won = !!won; snUI();
}
function snUI() {
  const ov = $("#sn-ov"); if (!ov || !sn) return;
  const sc = $("#sn-score"); if (sc) sc.textContent = sn.score; const lvE = $("#sn-lv"); if (lvE) lvE.textContent = snLevel(sn.score); const bs = $("#sn-best"); if (bs) bs.textContent = Math.max(snStats().best || 0, sn.score);
  const pb = document.querySelector('[data-sn="pause"]'); if (pb) pb.textContent = sn.state === "paused" ? "▶" : "⏸";
  if (sn.state === "play") { ov.className = "ar-ov"; ov.innerHTML = ""; return }
  ov.className = "ar-ov on";
  if (sn.state === "ready") ov.innerHTML = `<div class="ar-box"><div class="ar-big">🦛</div><b>Cobra do Hipopótamo</b><p>Toque, deslize ou use uma seta para começar.</p><div class="ar-lv">${SN.levels.map((l, i) => `<span><i>Nv ${i + 1}</i>${l.pts}+ pts<b>${l.coins} 🪙</b></span>`).join("")}</div><button class="btn" data-sn="start">Jogar</button></div>`;
  else if (sn.state === "paused") ov.innerHTML = `<div class="ar-box"><b>Pausado</b><button class="btn" data-sn="resume">Continuar</button></div>`;
  else ov.innerHTML = `<div class="ar-box"><b>${sn.won ? "Tabuleiro completo! 🏆" : "Fim de jogo"}</b><div class="ar-res"><div><span>Pontos</span><b>${sn.score}</b></div><div><span>Nível</span><b>${sn.level || 0}</b></div><div><span>Recorde</span><b>${Math.max(snStats().best || 0, sn.score)}</b></div></div>
    ${sn.newBest && sn.score ? `<p class="ar-nb">🎉 Novo recorde!</p>` : ""}<p>${sn.coins ? `+${sn.coins} Enzola Coins` : sn.capped ? "Limite de moedas de hoje atingido." : "Chegue a 3 pontos (nível 1) para ganhar moedas."}</p><button class="btn" data-sn="again">Jogar de novo</button></div>`;
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
  const sizeK = 1 + Math.min(.18, Math.max(0, sn.body.length - SN.full) * .012);   // depois de completo, cresce de tamanho a cada fruta
  // corpo: tubo com a pele da foto + detalhes que "completam" o hipopótamo conforme cresce
  if (P.length > 1) {
    const path = () => { c.beginPath(); c.moveTo(P[P.length - 1].x, P[P.length - 1].y); for (let i = P.length - 2; i >= 0; i--) c.lineTo(P[i].x, P[i].y) };
    const dirAt = i => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = a.x - b.x, dy = a.y - b.y, m = Math.hypot(dx, dy) || 1; return { x: dx / m, y: dy / m } };
    const paw = (i, off, rx, ry) => { const d = dirAt(i), nx = -d.y, ny = d.x, p = P[i]; for (const sg of [-1, 1]) { c.save(); c.translate(p.x + nx * sg * u * off, p.y + ny * sg * u * off); c.rotate(Math.atan2(d.y, d.x)); c.fillStyle = snSkin(c, u); c.strokeStyle = "#39403a"; c.lineWidth = u * .06; c.beginPath(); c.ellipse(0, 0, u * rx, u * ry, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(120,130,110,.16)"; c.fill(); c.fillStyle = "rgba(20,24,32,.55)"; for (const t of [-.5, 0, .5]) { c.beginPath(); c.arc(u * rx * .62, u * ry * t, u * .035, 0, 7); c.fill() } c.restore() } };
    c.lineCap = c.lineJoin = "round";
    const L = P.length;
    if (L >= 4) paw(Math.min(2, L - 1), .5 * sizeK, .3, .18);                 // patinhas da frente
    if (L >= 7) paw(L - 2, .48 * sizeK, .3, .18);                              // patinhas de trás
    c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = u * .94 * sizeK; c.save(); c.translate(0, u * .07); path(); c.stroke(); c.restore();
    c.strokeStyle = "#39403a"; c.lineWidth = u * .92 * sizeK; path(); c.stroke();
    c.strokeStyle = snSkin(c, u); c.lineWidth = u * .84 * sizeK; path(); c.stroke();
    c.strokeStyle = "rgba(120,130,110,.14)"; c.lineWidth = u * .84 * sizeK; path(); c.stroke();
    c.strokeStyle = "rgba(210,220,200,.2)"; c.lineWidth = u * .3 * sizeK; c.save(); c.translate(0, -u * .14); path(); c.stroke(); c.restore();
    for (let i = 1; i <= Math.min(3, L - 1); i++) { const d = dirAt(i), nx = -d.y, ny = d.x, p = P[i]; c.strokeStyle = "rgba(25,30,40,.4)"; c.lineWidth = u * .045; c.beginPath(); c.moveTo(p.x + nx * u * .38 + d.x * u * .05, p.y + ny * u * .38 + d.y * u * .05); c.quadraticCurveTo(p.x + d.x * u * .16, p.y + d.y * u * .16, p.x - nx * u * .38 + d.x * u * .05, p.y - ny * u * .38 + d.y * u * .05); c.stroke() }   // dobrinhas do pescoço
    if (L >= 6) { const t = P[L - 1], d = dirAt(L - 1); c.fillStyle = "#4b5160"; c.strokeStyle = "#2f3441"; c.lineWidth = u * .04; c.beginPath(); c.ellipse(t.x - d.x * u * .5, t.y - d.y * u * .5, u * .12, u * .09, Math.atan2(d.y, d.x), 0, 7); c.fill(); c.stroke() }   // rabinho
  }
  // cabeça (foto do hipopótamo, girando suave)
  const h = P[0], d = sn.dir, target = Math.atan2(d.y, d.x); let diff = target - sn.ang; while (diff > Math.PI) diff -= 6.283; while (diff < -Math.PI) diff += 6.283; sn.ang += diff * .28;
  c.save(); c.translate(h.x + d.x * u * .12, h.y + d.y * u * .12); c.rotate(sn.ang); if (Math.cos(sn.ang) < 0) c.scale(1, -1);
  const hw = u * 2.15 * sizeK, hh = hw * 280 / 350;
  const hs = snHeadSprite(); if (hs) c.drawImage(hs, -hw * .5, -hh * .5, hw, hh); else { c.fillStyle = "#8a93a6"; c.beginPath(); c.arc(0, 0, u * .6, 0, 7); c.fill() }
  c.restore();
  // partículas e +pontos
  sn.parts = sn.parts.filter(p => (p.life -= .035) > 0); for (const p of sn.parts) { p.x += p.vx * .03; p.y += p.vy * .03; c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.c; c.beginPath(); c.arc(p.x * u, p.y * u, u * .1 * p.life + 1, 0, 7); c.fill() }
  c.globalAlpha = 1; sn.pops = sn.pops.filter(p => (p.t -= .025) > 0);
  for (const p of sn.pops) { c.globalAlpha = Math.min(1, p.t * 1.6); c.fillStyle = p.gold ? "#ffd84a" : "#fff"; c.font = `700 ${u * (p.big ? .8 : .62)}px "Chakra Petch",sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(p.txt, p.x * u, (p.y - (1 - p.t) * 1.4) * u) }
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
    if (b = e.target.closest("[data-ar]")) { const v = b.dataset.ar; if (v === "back") { arSel = null; snStop(); if (sn && sn.state === "play") sn.state = "paused" } else { arSel = v; if (v === "snake") snNew(); if (v === "cards") cg.view = "menu"; if (v === "find") { fh.view = "menu" } if (v === "puzzle") { pz.view = "menu"; pz.state = "idle" } if (v === "race") { rc.view = "bet"; rc.runners = null; rc.res = null } } renderLingo(); return }
    if (b = e.target.closest("[data-ar-how]")) { arHow(b.dataset.arHow); return }
    if (b = e.target.closest("[data-sn-dir]")) { snDir(SN_V[b.dataset.snDir]); return }
    if (b = e.target.closest("[data-sn]")) { const a = b.dataset.sn; if (!sn) return;
      if (a === "start") snStart(); else if (a === "resume") snPause(false); else if (a === "pause") snPause(sn.state === "play"); else if (a === "again") { snNew(); snUI(); snStart() } }
  });
}

/* ---------- "Como jogar" (vale para todos os minigames) ---------- */
const AR_HELP = {
  puzzle: { title: "Quebra-cabeça de Hipopótamos", body: `
    <h3>Objetivo</h3><p>Escolha uma foto do álbum e remonte a imagem. Ela é cortada em peças e embaralhada.</p>
    <h3>Como jogar</h3><ul><li>Toque numa peça e depois em outra para <b>trocar</b> as duas de lugar.</li><li>Peça no lugar certo fica <b>verde</b> e trava.</li><li><b>👁 Ver foto</b> mostra a imagem completa; <b>💡 Dica</b> (3 por partida) coloca uma peça no lugar.</li><li>Tamanhos: Fácil (3 colunas), Médio (5) e Difícil (7).</li></ul>
    <h3>Moedas</h3><ul><li>Você ganha Enzola Coins só na <b>primeira vez</b> que completa cada foto em cada tamanho: ${PZ.coins.facil}, ${PZ.coins.medio} e ${PZ.coins.dificil} 🪙.</li><li>Limite de ${PZ.dayCap} moedas por dia neste jogo. As estrelas ★ na miniatura mostram em quantos tamanhos você já montou a foto.</li></ul>` },
  find: { title: "Cadê o Enzola?", body: `
    <h3>Objetivo</h3><p>Em cada fase aparece um cenário diferente (praia, cidade, floresta, festa, espaço ou campo) cheio de figurinhas. Ache o <b>Enzola</b>, o hipopótamo clássico, sem fantasia, e toque nele.</p>
    <h3>Regras</h3><ul><li>São <b>${FH.rounds} fases</b>. A cada fase o tempo diminui, o cenário fica mais lotado e o Enzola fica menor.</li><li>Nas fases mais avançadas aparecem outros hipopótamos <b>com fantasia</b> e fotos de hipopótamos para confundir. Só o Enzola sem fantasia vale.</li><li>Cada toque errado custa <b>${FH.penalty} segundos</b>.</li><li>Você tem <b>1 dica por partida</b>: ela circula uma área grande onde o Enzola está e custa ${FH.hintCost} segundos.</li><li>Se o tempo acabar, a partida termina e o Enzola é mostrado.</li></ul>
    <h3>Enzola Coins</h3><p>Você ganha moedas pelo número de fases que achou. Limite de ${FH.dayCap} moedas por dia.</p>
    <table class="ar-tb"><tr><th>Fases achadas</th><th>Moedas</th></tr>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<tr><td>${n}</td><td>${FH.coins[n]}</td></tr>`).join("")}</table>` },
  race: { title: "Corrida de Hipopótamos", body: `
    <h3>Objetivo</h3><p>Descubra qual hipopótamo vai cruzar a linha de chegada primeiro e aposte nele.</p>
    <h3>Como jogar</h3><ol><li>Cinco hipopótamos (skins da loja) entram na corrida. Toque no que você acha que vai ganhar.</li><li>Escolha o valor da aposta (de ${RC.min} a ${RC.max} Enzola Coins) e toque em <b>Largar!</b></li><li>Se o seu hipopótamo vencer, você recebe o <b>dobro</b> da aposta. Se perder, a aposta se vai.</li></ol>
    <h3>Forma e chance</h3><p>Cada hipopótamo tem uma <b>forma</b> de 1 a 5 estrelas e uma <b>chance</b> estimada de vitória. Quem tem mais estrelas corre mais, mas a corrida tem arrancadas e cansaço aleatórios, então até o mais fraco pode surpreender.</p>
    <h3>Dicas</h3><ul><li>Sem sorte, o prêmio de 2× não compensa sempre: com 5 corredores o favorito ganha em torno de 1 de cada 4 corridas. Aposte só o que você aceita perder.</li><li>Os ganhos da corrida não entram nos pontos de grupo.</li><li>Quer outros corredores? Toque em <b>Outros corredores</b> antes de largar.</li></ul>` },
  snake: { title: "Cobra do Hipopótamo", body: `
    <h3>Objetivo</h3><p>Guie o hipopótamo pelo tabuleiro, coma melancias e chegue o mais longe que puder sem bater.</p>
    <h3>Como jogar</h3><ul><li><b>Computador:</b> setas ou WASD. Espaço pausa e continua.</li><li><b>Celular:</b> deslize o dedo no tabuleiro ou use os 4 botões.</li><li>O hipopótamo anda sozinho, você só escolhe a direção. Não dá para voltar para trás.</li></ul>
    <h3>Regras</h3><ul><li>Cada melancia vale <b>1 ponto</b> e faz o corpo crescer. A <b>dourada</b> (com um “E”) vale <b>3</b>.</li><li>O corpo vai se completando: pescoço, patinhas e rabinho. Com 8 segmentos o corpo está completo e, daí em diante, ele cresce de tamanho a cada fruta.</li><li>A partida acaba se bater na parede ou no próprio corpo. A velocidade sobe aos poucos.</li></ul>
    <h3>Enzola Coins</h3><p>Você ganha as moedas do <b>maior nível</b> da partida (não soma). Limite de ${SN.dayCap} moedas por dia.</p>
    <table class="ar-tb"><tr><th>Nível</th><th>Pontos</th><th>Moedas</th></tr>${SN.levels.map((l, i) => `<tr><td>${i + 1}</td><td>${l.pts}+</td><td>${l.coins}</td></tr>`).join("")}</table>` },
  cards: { title: "Duelo de Cartas", body: `
    <h3>Objetivo</h3><p>Vença mais rodadas que a CPU em uma partida de <b>5 rodadas</b>. Quem ganhar mais rodadas vence a partida (3 rodadas já garantem a vitória).</p>
    <h3>As cartas</h3><ul><li>Cada carta tem 4 atributos de 0 a 100: <b>💪 Força</b>, <b>🥰 Fofura</b>, <b>🍀 Sorte</b> e <b>🧠 Esperteza</b>.</li><li>Raridades: Comum, Rara, Épica e Lendária. As raras costumam ter valores maiores, mas toda carta tem algum ponto forte.</li><li>Há ${CG_CARDS.length} cartas: personagens, bichos, fotos de hipopótamos do álbum e as skins de hipopótamo. Toque em “Ver as cartas” no menu para conferir todas.</li><li>O <b>Coringa</b> (o hipopótamo principal) vale <b>100 em todos os atributos</b>: ganha qualquer rodada. Só existe um no baralho e pode cair para você ou para a CPU.</li></ul>
    <h3>Como é uma partida</h3><ol><li>Você e a CPU recebem <b>5 cartas</b> sorteadas. Cada carta só pode ser jogada uma vez.</li><li><b>Rodadas 1, 3 e 5: você ataca.</b> Toque numa carta da sua mão e depois na barra do atributo que quer usar. A CPU responde com uma carta dela.</li><li><b>Rodadas 2 e 4: a CPU ataca.</b> Ela escolhe o atributo e joga uma carta virada para baixo. Você escolhe uma carta da sua mão e toca em “Jogar esta carta”.</li><li>As duas cartas viram e vence quem tiver o <b>maior valor naquele atributo</b>. Valores iguais empatam a rodada.</li></ol>
    <h3>Duelo com amigos</h3><p>Toque em <b>⚔️ Desafiar um amigo</b>: ele recebe uma notificação e, ao aceitar, vocês jogam as mesmas 5 rodadas, cada um com sua mão sorteada. As jogadas chegam em tempo real e você pode sair e voltar depois, o duelo continua. Quem desistir entrega a vitória. As moedas de duelo valem <b>×1,5</b> (derrota ou empate também rendem um pouco) e contam no mesmo limite diário.</p>
    <h3>Dicas</h3><ul><li>Ao atacar, escolha o atributo em que a carta é mais forte.</li><li>Ao defender, você só sabe o atributo: gaste cartas fracas nas rodadas que parecem perdidas e guarde as fortes.</li><li>Guarde o Coringa para uma rodada importante, mas não esqueça de usar.</li></ul>
    <h3>Dificuldade e Enzola Coins</h3><p>No modo Fácil a CPU joga quase ao acaso; no Normal ela escolhe bem o atributo; no Difícil ela guarda as melhores cartas para a hora certa. Só a vitória paga moedas, conforme o <b>nível da vitória</b>, multiplicado pela dificuldade (Fácil ×1, Normal ×1,5, Difícil ×2). Limite de ${CG_REWARD.dayCap} moedas por dia.</p>
    <table class="ar-tb"><tr><th>Nível</th><th>Rodadas ganhas</th><th>Moedas (×1)</th></tr><tr><td>1</td><td>3 (vitória apertada)</td><td>${CG_REWARD.levels[0]}</td></tr><tr><td>2</td><td>4</td><td>${CG_REWARD.levels[1]}</td></tr><tr><td>3</td><td>5 (vitória perfeita)</td><td>${CG_REWARD.levels[2]}</td></tr></table><p class="muted">Empate rende 2 moedas (×dificuldade).</p>` },
};
function arHow(id) { const h = AR_HELP[id]; if (!h) return; modalShell(`<h2>❓ ${h.title}</h2><p class="sub">Como jogar</p><div class="ar-help">${h.body}</div>`, false) }
