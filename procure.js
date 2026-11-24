/* Jogos Enzola — Cadê o Enzola? (aba "Outros jogos")
   Em cada fase um cenário aleatório (praia, cidade, floresta, festa, espaço, campo) fica lotado de figurinhas.
   Ache o Enzola (o hipopótamo clássico) antes do tempo acabar. Cada fase tem menos tempo, mais bagunça e um Enzola menor.
   Erros custam tempo. Moedas pelo número de fases vencidas (limite diário). */
const FH = { rounds: 8, dayCap: 60, penalty: 2, hintCost: 5, coins: [0, 1, 2, 3, 5, 8, 11, 15, 20] };
const FH_CHR = ["c1", "c2", "c3", "c4", "c5", "c6", "c8", "c9", "c10", "c11", "c12", "c13", "c14", "c15", "c16", "c17"].map(i => `convite/${i}.jpg`).concat(["x-padre", "x-pato", "x-hamster", "x-lagartixa"].map(i => `cards/${i}.webp`));
const FH_SKIN = ["festeiro", "chef", "fone", "pirata", "cauboi", "mago", "cavalheiro", "heroi", "cruzeirense", "rei", "dourado"].map(i => `loja/h-${i}.webp`);
const FH_PIC = ["h02", "h04", "h05", "h07", "h08", "h09", "h13", "h14", "h15", "h16", "h17", "h18", "h19", "h20"].map(i => `cards/p-${i}.webp`);
const FH_THEMES = ["praia", "cidade", "floresta", "festa", "espaco", "campo"];
const fhImgs = {};
const fhImg = s => { if (!fhImgs[s]) { const i = new Image(); i.src = s; fhImgs[s] = i } return fhImgs[s] };
let fh = { view: "menu", round: 1, found: 0, t: 0, left: 0, state: "idle", raf: 0, hint: 1, score: 0, scene: null, flash: null, coins: 0, over: false };
const fhStats = () => { lg = lg || lgLoad(); const s = lg.hunt = lg.hunt || { plays: 0, best: 0, day: "", earned: 0 }; if (s.day !== spDay(0)) { s.day = spDay(0); s.earned = 0 } return s };
const fhTime = r => Math.max(14, 34 - (r - 1) * 2.6);

/* ---------- cenário ---------- */
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
function fhBack(c, W, H, th) {
  const g = c.createLinearGradient(0, 0, 0, H);
  const grad = (a, b) => { g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H) };
  if (th === "praia") {
    grad("#7fd3ff", "#d9f3ff"); c.fillStyle = "#ffe27a"; c.beginPath(); c.arc(W * rnd(.15, .85), H * .16, W * .07, 0, 7); c.fill();
    c.fillStyle = "#2a9ad4"; c.fillRect(0, H * .42, W, H * .26);
    for (let i = 0; i < 40; i++) { c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 2; const x = rnd(0, W), y = rnd(H * .43, H * .66); c.beginPath(); c.arc(x, y, rnd(6, 16), Math.PI, 0); c.stroke() }
    c.fillStyle = "#f3d9a0"; c.fillRect(0, H * .66, W, H * .34);
    for (let i = 0; i < 6; i++) { const x = rnd(0, W), y = H * rnd(.1, .35); c.fillStyle = "rgba(255,255,255,.85)"; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + k * 16, y + (k % 2) * 6, 14 + k % 2 * 4, 0, 7); c.fill() } }
  } else if (th === "cidade") {
    grad("#2b3a6b", "#e98ab0"); for (let i = 0; i < 50; i++) { c.fillStyle = "rgba(255,255,255,.7)"; c.fillRect(rnd(0, W), rnd(0, H * .4), 2, 2) }
    for (let x = -10; x < W; x += rnd(40, 80)) { const w = rnd(40, 80), h = rnd(H * .3, H * .75); c.fillStyle = pick(["#1e2748", "#2a3560", "#352a55", "#233a5c"]); c.fillRect(x, H - h, w, h);
      for (let yy = H - h + 10; yy < H - 12; yy += 16) for (let xx = x + 8; xx < x + w - 10; xx += 14) { c.fillStyle = Math.random() < .5 ? "#ffd86b" : "rgba(255,255,255,.12)"; c.fillRect(xx, yy, 7, 9) } }
    c.fillStyle = "#3d3d52"; c.fillRect(0, H * .9, W, H * .1);
  } else if (th === "floresta") {
    grad("#bfe9a3", "#4c9a4a"); for (let i = 0; i < 7; i++) { const x = rnd(0, W); c.fillStyle = "#6b4b2a"; c.fillRect(x, H * .25, rnd(14, 26), H * .8); c.fillStyle = pick(["#2f7d3a", "#3d9447", "#27693a"]); for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + rnd(-30, 40), H * rnd(.1, .4), rnd(26, 52), 0, 7); c.fill() } }
    c.fillStyle = "#3b7a35"; c.fillRect(0, H * .8, W, H * .2);
  } else if (th === "festa") {
    grad("#ff8fc5", "#6b3fb3"); for (let i = 0; i < 90; i++) { c.fillStyle = pick(["#ffd23f", "#3fd0ff", "#7dff8a", "#fff"]); c.save(); c.translate(rnd(0, W), rnd(0, H)); c.rotate(rnd(0, 6)); c.fillRect(0, 0, 8, 3); c.restore() }
    for (let i = 0; i < 9; i++) { const x = rnd(0, W), y = rnd(H * .05, H * .6); c.fillStyle = pick(["#ff4d6d", "#4dabf7", "#ffd43b", "#69db7c"]); c.beginPath(); c.ellipse(x, y, 18, 23, 0, 0, 7); c.fill(); c.strokeStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.moveTo(x, y + 23); c.lineTo(x + rnd(-8, 8), y + 70); c.stroke() }
  } else if (th === "espaco") {
    grad("#05061f", "#2b1a5e"); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${rnd(.3, 1)})`; c.beginPath(); c.arc(rnd(0, W), rnd(0, H), rnd(.5, 2), 0, 7); c.fill() }
    for (let i = 0; i < 4; i++) { const x = rnd(0, W), y = rnd(0, H), r = rnd(20, 54); const rg = c.createRadialGradient(x - r / 3, y - r / 3, 2, x, y, r); rg.addColorStop(0, pick(["#ffb27a", "#8ad0ff", "#d6a3ff"])); rg.addColorStop(1, "#1b1646"); c.fillStyle = rg; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill() }
  } else {
    grad("#7ed36a", "#3f9a3f"); for (let i = 0; i < 9; i++) { c.fillStyle = i % 2 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"; c.fillRect(0, i * H / 9, W, H / 9) }
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 3; c.strokeRect(W * .06, H * .08, W * .88, H * .84); c.beginPath(); c.moveTo(W / 2, H * .08); c.lineTo(W / 2, H * .92); c.stroke(); c.beginPath(); c.arc(W / 2, H / 2, H * .15, 0, 7); c.stroke();
  }
}
// cenários em "saco": passa pelos 6 antes de repetir e nunca repete o mesmo em fases seguidas
let fhBag = [], fhLast = null;
function fhTheme() {
  if (!fhBag.length) { fhBag = FH_THEMES.slice().sort(() => Math.random() - .5); if (fhBag[fhBag.length - 1] === fhLast) fhBag.unshift(fhBag.pop()) }
  return fhLast = fhBag.pop();
}
function fhBuild(cv, round) {
  const W = cv.clientWidth, H = Math.round(W * .8), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
  const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const th = fhTheme(), lv = (round - 1) / (FH.rounds - 1);
  const hh = W * (.2 - .125 * lv), hip = fhImg("hipopotamo.webp"), ar = (hip.naturalWidth || 480) / (hip.naturalHeight || 562), hw = hh * ar;
  const tx = rnd(hw * .6, W - hw * .6), ty = rnd(hh * .55, H - hh * .55), box = { x: tx - hw / 2, y: ty - hh / 2, w: hw, h: hh };
  fhBack(c, W, H, th);
  const n = Math.round(36 + lv * 120 + W / 14), items = [];
  const skinP = round >= 3 ? .18 + lv * .2 : 0, picP = round >= 5 ? .12 : 0;
  for (let i = 0; i < n; i++) {
    const r = Math.random(); let kind = "chr", src = pick(FH_CHR);
    if (r < skinP) { kind = "skin"; src = pick(FH_SKIN) } else if (r < skinP + picP) { kind = "pic"; src = pick(FH_PIC) }
    items.push({ kind, src, s: kind === "skin" ? hh * rnd(.8, 1.15) : W * rnd(.045, .1) * (1 - lv * .2), x: rnd(0, W), y: rnd(0, H), rot: kind === "skin" ? rnd(-.2, .2) : rnd(-.5, .5) });
  }
  const draw = (it) => {
    const im = fhImg(it.src); if (!(im.complete && im.naturalWidth)) return;
    c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
    if (it.kind === "skin") { const h = it.s, w = h * im.naturalWidth / im.naturalHeight; c.drawImage(im, -w / 2, -h / 2, w, h) }
    else { const s = it.s; c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 4; c.fillStyle = "#fff"; c.beginPath(); (c.roundRect ? c.roundRect(-s / 2 - 2, -s / 2 - 2, s + 4, s + 4, it.kind === "pic" ? s : 6) : c.rect(-s / 2 - 2, -s / 2 - 2, s + 4, s + 4)); c.fill(); c.shadowBlur = 0; c.save(); c.beginPath(); (c.roundRect ? c.roundRect(-s / 2, -s / 2, s, s, it.kind === "pic" ? s : 5) : c.rect(-s / 2, -s / 2, s, s)); c.clip();
      const a = Math.min(im.naturalWidth, im.naturalHeight); c.drawImage(im, (im.naturalWidth - a) / 2, (im.naturalHeight - a) / 2, a, a, -s / 2, -s / 2, s, s); c.restore() }
    c.restore();
  };
  const before = items.slice(0, Math.floor(items.length * .6)), after = items.slice(before.length).filter(it => Math.hypot(it.x - tx, it.y - ty) > Math.max(hw, hh) * .75 + it.s * .5);
  before.forEach(draw);
  if (hip.complete && hip.naturalWidth) { c.save(); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 4; c.drawImage(hip, box.x, box.y, box.w, box.h); c.restore() }
  after.forEach(draw);
  return { W, H, box, th, snap: null };
}

/* ---------- telas ---------- */
function fhHTML() {
  const st = fhStats();
  if (fh.view === "game") return `<div class="fh"><div class="ar-hud"><button class="btn ghost sm" data-fh="quit">✕ Sair</button><div class="ar-sc"><span>Fase</span><b>${fh.round}/${FH.rounds}</b></div><div class="ar-sc"><span>Tempo</span><b id="fh-t">${Math.ceil(fh.left)}</b></div><button class="btn ghost sm" data-fh="hint" id="fh-hint"${fh.hint ? "" : " disabled"}>💡 Dica</button></div>
    <div class="fh-find"><img src="hipopotamo.webp" alt=""><span>Ache o <b>Enzola</b> (o hipopótamo sem fantasia!) · Achou: <b id="fh-f">${fh.found}</b></span></div>
    <div class="fh-stage"><canvas id="fh-cv" aria-label="Cenário com vários personagens. Toque no Enzola." role="img"></canvas><div class="fh-msg" id="fh-m"></div></div>
</div>`;
  return `<div class="cg-menu"><div class="ar-hud"><button class="btn ghost sm" data-ar="back">← Jogos</button><b class="cg-ttl">Cadê o Enzola?</b></div>
    <div class="cg-hero"><img class="fh-hero" src="hipopotamo.webp" alt=""><p class="muted">Cenários lotados de personagens, skins e fotos. Ache o Enzola antes que o tempo acabe: ${FH.rounds} fases, cada uma mais difícil.</p></div>
    <div class="cg-menu-a"><button class="btn" data-fh="play">Jogar</button><button class="btn ghost" data-ar-how="find">❓ Como jogar</button></div>
    <p class="muted ar-tip">Partidas: ${st.plays} · Melhor: ${st.best} fase${st.best === 1 ? "" : "s"} · Moedas hoje: ${st.earned}/${FH.dayCap}</p></div>`;
}
function fhEndHTML() {
  const win = fh.found >= FH.rounds;
  return `<div class="ar-ov on cg-end"><div class="ar-box"><b>${win ? "Você achou todos! 🏆" : fh.found ? "Tempo esgotado!" : "Não achou dessa vez"}</b><div class="ar-res"><div><span>Fases</span><b>${fh.found}</b></div><div><span>Pontos</span><b>${fh.score}</b></div></div>
    <p>${fh.coins ? `+${fh.coins} Enzola Coins` : fh.capped ? "Limite de moedas de hoje atingido." : "Ache pelo menos 1 para ganhar moedas."}</p><button class="btn" data-fh="play">Jogar de novo</button><button class="btn ghost" data-fh="menu">Menu</button></div></div>`;
}
function fhRender() { const r = $("#fh-root"); if (r) { r.innerHTML = fhHTML(); if (fh.view === "game") fhSetup() } }
function fhMount() { cancelAnimationFrame(fh.raf); if (fh.view === "game") fh.view = "menu"; fhRender() }

/* ---------- jogo ---------- */
function fhNew() { fh = { ...fh, view: "game", round: 1, found: 0, score: 0, hint: 1, over: false, coins: 0, capped: false }; fhRender() }
function fhSetup() {
  const cv = $("#fh-cv"); if (!cv) return;
  // espera as imagens para o cenário não sair vazio
  const need = [fhImg("hipopotamo.webp"), ...FH_CHR.slice(0, 3).map(fhImg)], ready = () => need.every(i => i.complete);
  const go = () => {
    if (!document.body.contains(cv)) return;
    fh.scene = fhBuild(cv, fh.round); fh.scene.snap = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height);
    fh.left = fhTime(fh.round); fh.state = "play"; fh.flash = null; fh.hintAt = 0; fh.last = performance.now(); cancelAnimationFrame(fh.raf); fh.raf = requestAnimationFrame(fhTick);
  };
  const tryGo = (n = 0) => (ready() || n > 25) ? go() : setTimeout(() => tryGo(n + 1), 80);
  fh.state = "load"; tryGo();
}
function fhTick(now) {
  const cv = $("#fh-cv"); if (!cv || fh.view !== "game") return;
  const dt = Math.min(.1, (now - fh.last) / 1000); fh.last = now;
  if (fh.state === "play") { fh.left -= dt; const t = $("#fh-t"); if (t) t.textContent = Math.max(0, Math.ceil(fh.left)); if (fh.left <= 0) { fh.left = 0; fhOver(true) } }
  fhPaint(cv, now);
  if (fh.state !== "done") fh.raf = requestAnimationFrame(fhTick);
}
function fhPaint(cv, now) {
  const s = fh.scene; if (!s || !s.snap) return; const c = cv.getContext("2d"), dpr = cv.width / s.W;
  c.setTransform(1, 0, 0, 1, 0, 0); c.putImageData(s.snap, 0, 0); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ring = (x, y, r, col, a = 1) => { c.strokeStyle = col; c.globalAlpha = a; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.globalAlpha = 1 };
  if (fh.hintAt) { const p = (now - fh.hintAt) / 1000; if (p < 6) ring(s.hint.x, s.hint.y, s.hint.r * (1 + Math.sin(now / 160) * .04), "#ffc53d", .9) }
  if (fh.flash) { const f = fh.flash, p = (now - f.t) / 1000;
    if (f.ok) { const b = s.box; ring(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) * (.7 + p * .6), "#69db7c", Math.max(0, 1 - p)); ring(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) * .65, "#fff", Math.max(0, 1 - p)) }
    else if (p < .6) { c.strokeStyle = "#ff5c6a"; c.globalAlpha = 1 - p / .6; c.lineWidth = 5; c.beginPath(); c.moveTo(f.x - 12, f.y - 12); c.lineTo(f.x + 12, f.y + 12); c.moveTo(f.x + 12, f.y - 12); c.lineTo(f.x - 12, f.y + 12); c.stroke(); c.globalAlpha = 1 } }
  if (fh.state === "reveal") { const b = s.box; ring(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) * (.75 + Math.sin(now / 150) * .06), "#ff5c6a") }
}
function fhOver(timeout) {
  const st = fhStats(); st.plays++; st.best = Math.max(st.best || 0, fh.found);
  const want = FH.coins[Math.min(fh.found, FH.rounds)], room = Math.max(0, FH.dayCap - (st.earned || 0));
  fh.coins = Math.min(want, room); fh.capped = want > room;
  if (fh.coins > 0 && typeof lgAward === "function") { st.earned += fh.coins; lgAward(fh.coins, "find") } else lgSave(true);
  fh.state = "reveal"; fh.over = false;
  setTimeout(() => { if (fh.view !== "game" || !$(".fh")) return; fh.over = true; fh.state = "done"; cancelAnimationFrame(fh.raf); $(".fh").insertAdjacentHTML("beforeend", fhEndHTML()) }, 1800);
}
function fhTap(e) {
  const cv = e.target.closest("#fh-cv"); if (!cv || fh.state !== "play") return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (fh.scene.W / r.width), y = (e.clientY - r.top) * (fh.scene.H / r.height), b = fh.scene.box, pad = 6;
  const hit = x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;
  if (hit) {
    fh.found++; fh.score += Math.round(100 + fh.left * 10); fh.flash = { ok: true, t: performance.now() }; fh.state = "won";
    const f = $("#fh-f"); if (f) f.textContent = fh.found; const m = $("#fh-m"); if (m) m.textContent = "Achou! 🎉";
    setTimeout(() => { if (fh.view !== "game") return; if (fh.round >= FH.rounds) { fhOver(false); return } fh.round++; fhRender() }, 1000);
  } else { fh.flash = { ok: false, x, y, t: performance.now() }; fh.left = Math.max(0, fh.left - FH.penalty); const m = $("#fh-m"); if (m) { m.textContent = `−${FH.penalty}s`; m.classList.remove("pop"); void m.offsetWidth; m.classList.add("pop") } }
}
document.addEventListener("pointerdown", e => { if ($("#fh-root")) fhTap(e) });
document.addEventListener("click", e => {
  const b = e.target.closest("[data-fh]"); if (!b || !$("#fh-root")) return;
  const a = b.dataset.fh;
  if (a === "play") { fhNew(); return }
  if (a === "menu" || a === "quit") { cancelAnimationFrame(fh.raf); fh.state = "idle"; fh.view = "menu"; fhRender(); return }
  if (a === "hint" && fh.hint && fh.state === "play") {
    fh.hint = 0; fh.left = Math.max(1, fh.left - FH.hintCost); const bx = fh.scene.box, off = rnd(-.2, .2), R = fh.scene.W * .17;
    fh.scene.hint = { x: Math.max(R * .5, Math.min(fh.scene.W - R * .5, bx.x + bx.w / 2 + R * off)), y: Math.max(R * .5, Math.min(fh.scene.H - R * .5, bx.y + bx.h / 2 + R * rnd(-.2, .2))), r: R }; fh.hintAt = performance.now(); b.disabled = true;
  }
});
