/* Jogos Enzola — Corrida de Hipopótamos (aba "Outros jogos")
   Escolha o hipopótamo que vai vencer, aposte Enzola Coins e receba o DOBRO se ele ganhar.
   5 hipopótamos por corrida, sorteados entre as skins da loja. Cada um tem uma "forma" (1–5 ★) que muda o ritmo,
   mas a corrida tem arrancadas e cansaço aleatórios, então ninguém é favorito garantido.
   Ganhos de aposta NÃO contam para os pontos de grupo (só moeda). */
const RC_POOL = [
  { id: "classico", name: "Enzola", img: "hipopotamo.webp" }, { id: "festeiro", name: "Festeiro", img: "loja/h-festeiro.webp" },
  { id: "chef", name: "Chef", img: "loja/h-chef.webp" }, { id: "fone", name: "DJ de fone", img: "loja/h-fone.webp" },
  { id: "pirata", name: "Pirata", img: "loja/h-pirata.webp" }, { id: "cauboi", name: "Caubói", img: "loja/h-cauboi.webp" },
  { id: "mago", name: "Mago", img: "loja/h-mago.webp" }, { id: "cavalheiro", name: "Cavalheiro", img: "loja/h-cavalheiro.webp" },
  { id: "heroi", name: "Super-herói", img: "loja/h-heroi.webp" }, { id: "cruzeirense", name: "Enzola Cruzeirense", img: "loja/h-cruzeirense.webp" },
  { id: "rei", name: "Enzola King", img: "loja/h-rei.webp" }, { id: "dourado", name: "Hipopótamo de ouro", img: "loja/h-dourado.webp" },
];
const RC = { n: 5, chips: [5, 10, 25, 50, 100], min: 5, max: 100, mult: 2, lane: ["#3b7a3f", "#357238"] };
const rcImgs = {};
const rcImg = src => { if (!rcImgs[src]) { const i = new Image(); i.src = src; rcImgs[src] = i } return rcImgs[src] };
let rc = { view: "bet", runners: null, pick: null, bet: 10, res: null, raf: 0 };
const rcStats = () => { lg = lg || lgLoad(); const s = lg.race = lg.race || { plays: 0, wins: 0, streak: 0, best: 0, net: 0 }; return s };
const rcBal = () => { lg = lg || lgLoad(); return lg.goiabas || 0 };

/* ---------- simulação ---------- */
// velocidade média em unidades de pista por segundo (pista = 100). Forma 1..5 ★ pesa pouco: a sorte decide muito.
function rcSim(runners, dt, keep) {
  const N = runners.length, pos = Array(N).fill(0), fin = Array(N).fill(null), sp = runners.map(() => ({ m: 1, left: 0, tir: 0.8 + Math.random() * 0.4 })), frames = [];
  let t = 0;
  while (fin.some(x => x === null) && t < 40) {
    for (let i = 0; i < N; i++) {
      if (fin[i] !== null) continue; const s = sp[i];
      if (s.left <= 0) { s.m = 0.3 + Math.random() * 1.4; s.left = 1.5 + Math.random() * 2.5 }
      s.left -= dt; const base = 9.2 + runners[i].form * 0.3, late = pos[i] > 70 ? s.tir : 1;
      const v = base * s.m * late, np = pos[i] + v * dt;
      if (np >= 100) fin[i] = t + dt * (100 - pos[i]) / (np - pos[i]); pos[i] = Math.min(100, np);
    }
    t += dt; if (keep) frames.push(pos.slice());
  }
  const order = runners.map((_, i) => i).sort((a, b) => (fin[a] ?? 99) - (fin[b] ?? 99));
  return { order, frames, T: t, fin };
}
function rcChances(runners) {
  const w = Array(runners.length).fill(0), K = 500;
  for (let k = 0; k < K; k++) w[rcSim(runners, 0.1, false).order[0]]++;
  return w.map(x => x / K);
}
// com a carteira no servidor, quem sorteia os corredores (e depois o vencedor) é o banco; a corrida na tela só mostra o resultado
const rcServer = () => typeof W !== "undefined" && !W.missing && !!user;
async function rcDealServer() {
  if (rc.dealing) return; rc.dealing = true; rc.runners = null; rc.round = null; rc.pick = null; rc.res = null; rcRender();
  const d = await walletCall("race_deal"); rc.dealing = false;
  if (!d || !Array.isArray(d.runners)) { rc.failed = true; rcRender(); return }
  rc.failed = false; rc.round = d.id;
  rc.runners = d.runners.map((r, i) => ({ ...(RC_POOL.find(p => p.id === r.id) || RC_POOL[0]), form: r.form | 0, chance: +r.chance || 0, num: i + 1 }));
  rcRender();
}
// simula até o vencedor da tela ser o que o servidor sorteou (se demorar, troca as raias de lugar)
function rcSimFor(R, win) {
  let sim; for (let k = 0; k < 120; k++) { sim = rcSim(R, 1 / 60, true); if (sim.order[0] === win) return sim }
  const a = sim.order[0]; sim.frames = sim.frames.map(f => { const g = f.slice(); [g[a], g[win]] = [g[win], g[a]]; return g });
  sim.order = sim.order.map(i => i === a ? win : i === win ? a : i); return sim;
}
function rcDeal() {
  if (rcServer()) { rcDealServer(); return }
  const pool = RC_POOL.slice().sort(() => Math.random() - .5).slice(0, RC.n);
  let forms; do { forms = pool.map(() => 1 + Math.floor(Math.random() * 5)) } while (new Set(forms).size < 3);
  const runners = pool.map((p, i) => ({ ...p, form: forms[i], num: i + 1 }));
  const ch = rcChances(runners); runners.forEach((r, i) => r.chance = ch[i]);
  rc.runners = runners; rc.pick = null; rc.res = null;
}

/* ---------- telas ---------- */
const rcStar = n => "★".repeat(n) + `<i>${"★".repeat(5 - n)}</i>`;
function rcHTML() {
  if (!rc.runners && !rc.dealing && !rc.failed) rcDeal();
  if (!rc.runners) return `<div class="rc"><div class="ar-hud"><button class="btn ghost sm" data-ar="back" aria-label="Voltar à lista de jogos">← Jogos</button></div>${rc.failed ? `<p class="muted ar-tip">Não foi possível sortear os corredores agora.</p><div class="cg-menu-a"><button class="btn" data-rcg="new">Tentar de novo</button></div>` : (typeof hippoLoad === "function" ? hippoLoad("Sorteando os corredores…") : "<p>Sorteando…</p>")}</div>`;
  const st = rcStats(), bal = rcBal();
  if (bal >= RC.min) rc.bet = Math.max(RC.min, Math.min(rc.bet, RC.max, bal));
  if (rc.view === "race") return `<div class="rc"><div class="ar-hud"><button class="btn ghost sm" data-rcg="skip">⏭ Pular</button><div class="ar-sc"><span>Aposta</span><b>${rc.bet}</b></div><div class="ar-sc"><span>Seu hipopótamo</span><b>#${rc.runners[rc.pick].num}</b></div></div>
    <div class="rc-stage"><canvas id="rc-cv" aria-label="Corrida de hipopótamos" role="img"></canvas></div><p class="cg-msg" id="rc-msg" aria-live="polite">Preparar…</p>${rc.res && rc.view === "race" ? "" : ""}</div>`;
  const R = rc.runners, ok = rc.pick !== null && rc.bet >= RC.min && rc.bet <= bal;
  const res = rc.res ? rcResHTML() : "";
  return `<div class="rc"><div class="ar-hud"><button class="btn ghost sm" data-ar="back" aria-label="Voltar à lista de jogos">← Jogos</button><div class="ar-sc"><span>Seu saldo</span><b>${gbI()} ${bal}</b></div><button class="iconbtn" data-ar-how="race" aria-label="Como jogar">❓</button></div>
    <h3 class="rc-h">1. Escolha o vencedor</h3>
    <div class="rc-list">${R.map((r, i) => `<button class="rc-r${rc.pick === i ? " on" : ""}" data-rcg="pick:${i}" aria-pressed="${rc.pick === i}"><span class="rc-n">${r.num}</span><img src="${r.img}" alt=""><span class="rc-i"><b>${esc(r.name)}</b><small class="rc-f" aria-label="Forma ${r.form} de 5">${rcStar(r.form)}</small></span><span class="rc-p"><b>${Math.round(r.chance * 100)}%</b><small>chance</small></span></button>`).join("")}</div>
    <h3 class="rc-h">2. Quanto apostar?</h3>
    <div class="rc-chips" role="group" aria-label="Valor da aposta">${RC.chips.map(c => `<button class="chip" data-rcg="bet:${c}" aria-pressed="${rc.bet === c}"${c > bal ? " disabled" : ""}>${c}</button>`).join("")}<button class="chip" data-rcg="bet:max" aria-pressed="${rc.bet === Math.min(RC.max, bal) && !RC.chips.includes(rc.bet)}"${bal < RC.min ? " disabled" : ""}>Máx.</button></div>
    <p class="muted rc-note">Se o seu hipopótamo ganhar você recebe <b>${rc.bet * RC.mult}</b> Enzola Coins (o dobro). Se perder, a aposta se vai.</p>
    <div class="cg-menu-a"><button class="btn" data-rcg="go"${ok ? "" : " disabled"}>🏁 Largar!</button><button class="btn ghost" data-rcg="new">🔀 Outros corredores</button></div>
    ${bal < RC.min ? `<p class="muted ar-tip">Você precisa de pelo menos ${RC.min} Enzola Coins para apostar. Ganhe moedas nas lições, no Cobra e no Duelo de Cartas.</p>` : ""}
    <p class="muted ar-tip">Corridas: ${st.plays} · Vitórias: ${st.wins} · Sequência: ${st.streak} · Saldo das apostas: ${st.net > 0 ? "+" : ""}${st.net}</p>${res}</div>`;
}
function rcResHTML() {
  const r = rc.res, w = rc.runners[r.order[0]];
  const pod = r.order.map((i, k) => `<li class="${i === rc.pick ? "me" : ""}"><b>${k + 1}º</b><span>${esc(rc.runners[i].name)} <small>#${rc.runners[i].num}</small></span></li>`).join("");
  return `<div class="ar-ov on cg-end"><div class="ar-box"><b>${r.win ? "Seu hipopótamo ganhou! 🏆" : "Não foi dessa vez"}</b><p><img class="rc-win" src="${w.img}" alt=""><br>Venceu <b>${esc(w.name)}</b> (#${w.num})</p><ol class="rc-pod">${pod}</ol>
    <p>${r.win ? `+${r.pay} Enzola Coins (aposta ${rc.bet}×${RC.mult})` : `−${rc.bet} Enzola Coins`}</p>
    <button class="btn" data-rcg="again">Correr de novo</button><button class="btn ghost" data-rcg="close">Fechar</button></div></div>`;
}
function rcRender() { const r = $("#rc-root"); if (r) { r.innerHTML = rcHTML(); if (rc.view === "race") rcStart() } }
function rcMount() { cancelAnimationFrame(rc.raf); if (rc.view === "race") rc.view = "bet"; rcRender() }

/* ---------- corrida (canvas) ---------- */
function rcStart() {
  const cv = $("#rc-cv"); if (!cv) return;
  const R = rc.runners, N = R.length, sim = rc.forced ? rcSimFor(R, rc.forced.winner) : rcSim(R, 1 / 60, true), dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.min(560, cv.parentElement.clientWidth || 360), LH = 58, HDR = 8, H = HDR + LH * N + 8;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  const c = cv.getContext("2d"); c.scale(dpr, dpr);
  const x0 = 34, x1 = W - 40, t0 = performance.now(), COUNT = 2200; let skipped = false, doneAt = 0;
  rc.skip = () => { skipped = true };
  const msg = $("#rc-msg");
  const frame = now => {
    if (!document.body.contains(cv) || rc.view !== "race") return;
    const el = skipped ? 1e9 : now - t0;
    const k = Math.min(sim.frames.length - 1, Math.max(0, Math.floor((el - COUNT) / 1000 * 60))), P = sim.frames[k];
    c.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      const y = HDR + i * LH; c.fillStyle = i % 2 ? RC.lane[0] : RC.lane[1]; c.fillRect(0, y, W, LH);
      c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(0, y + LH - 2, W, 2);
    }
    // largada e chegada
    c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(x0 - 4, HDR, 3, LH * N);
    const cs = 9; for (let r = 0; r < Math.ceil(LH * N / cs); r++) for (let q = 0; q < 2; q++) { c.fillStyle = (r + q) % 2 ? "#111" : "#fff"; c.fillRect(x1 + 12 + q * cs, HDR + r * cs, cs, Math.min(cs, LH * N - r * cs)) }
    const lead = P.indexOf(Math.max(...P));
    for (let i = 0; i < N; i++) {
      const y = HDR + i * LH, px = x0 + (P[i] / 100) * (x1 - x0), im = rcImg(R[i].img), spd = k > 0 ? P[i] - sim.frames[k - 1][i] : 0;
      const bob = el > COUNT && P[i] < 100 ? Math.sin(el / 70 + i * 1.7) * 3 * Math.min(1, spd * 6) : 0, h = LH - 8, w = im.naturalWidth ? h * im.naturalWidth / im.naturalHeight : h * .7;
      c.fillStyle = "rgba(0,0,0,.28)"; c.beginPath(); c.ellipse(px, y + LH - 6, w * .45, 4, 0, 0, 7); c.fill();
      if (el > COUNT && P[i] < 100 && spd > 0) { c.fillStyle = "rgba(230,220,190,.45)"; for (let d = 1; d <= 3; d++) { c.beginPath(); c.arc(px - w * .45 - d * 7, y + LH - 8 - (d % 2) * 3, 2.4 + d * .6, 0, 7); c.fill() } }
      if (im.complete && im.naturalWidth) c.drawImage(im, px - w * .5, y + 4 + bob, w, h);
      c.fillStyle = i === rc.pick ? "#ffc53d" : "rgba(255,255,255,.9)"; c.beginPath(); c.arc(8 + 0, y + LH / 2, 11, 0, 7); c.fill();
      c.fillStyle = "#1a2040"; c.font = "700 13px Inter,system-ui,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(R[i].num, 8, y + LH / 2 + 1);
      if (i === rc.pick) { c.strokeStyle = "rgba(255,197,61,.9)"; c.lineWidth = 2; c.strokeRect(1, y + 1, W - 2, LH - 2) }
    }
    if (el < COUNT) {
      const n = 3 - Math.floor(el / (COUNT / 3)), pr = (el % (COUNT / 3)) / (COUNT / 3);
      c.fillStyle = "rgba(5,8,20,.45)"; c.fillRect(0, 0, W, H); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `800 ${70 - pr * 14}px Inter,system-ui,sans-serif`; c.fillText(n > 0 ? n : "JÁ!", W / 2, H / 2);
      if (msg) msg.textContent = "Preparar…";
    } else if (msg) msg.textContent = P[lead] >= 100 ? "Chegou!" : `Na frente: #${R[lead].num} ${R[lead].name}`;
    if (k >= sim.frames.length - 1 && !doneAt) { doneAt = now; rcFinish(sim) }
    if (doneAt && now - doneAt > 900) return;
    rc.raf = requestAnimationFrame(frame);
  };
  cancelAnimationFrame(rc.raf); rc.raf = requestAnimationFrame(frame);
}
function rcFinish(sim) {
  const F = rc.forced, win = F ? F.winner === rc.pick : sim.order[0] === rc.pick, pay = F ? F.pay : win ? rc.bet * RC.mult : 0, st = rcStats();
  st.plays++; if (win) { st.wins++; st.streak++; st.best = Math.max(st.best || 0, st.streak) } else st.streak = 0; st.net += pay - rc.bet;
  if (F) { rc.forced = null; rc.round = null; if (F.wallet) walletApply(F.wallet) }   // prêmio já foi pago pelo servidor; a próxima corrida sorteia novos corredores
  else if (pay) lg.goiabas = (lg.goiabas || 0) + pay;      // direto na carteira: aposta não conta pontos de grupo
  lgSave(true);
  rc.res = { order: sim.order, win, pay }; rc.view = "bet";
  setTimeout(() => { if ($("#rc-root")) rcRender() }, 900);
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-rcg]"); if (!b || !$("#rc-root")) return;
  const [a, v] = b.dataset.rcg.split(":"), bal = rcBal();
  if (a === "pick") rc.pick = +v;
  else if (a === "bet") { rc.bet = v === "max" ? Math.min(RC.max, bal) : +v; if (rc.bet > bal) rc.bet = Math.max(RC.min, Math.min(RC.max, bal)) }
  else if (a === "new") { rcDeal() }
  else if (a === "close") { rc.res = null; if (rcServer() && !rc.round) { rcDeal(); return } }
  else if (a === "again") { rc.res = null; rcDeal() }
  else if (a === "skip") { if (rc.skip) rc.skip(); return }
  else if (a === "go") {
    if (rc.pick === null || rc.bet < RC.min || rc.bet > bal) return;
    if (rcServer()) {
      if (rc.betting || !rc.round) return; rc.betting = true; b.disabled = true;
      sb.rpc("race_bet", { p_round: rc.round, p_pick: rc.pick, p_bet: rc.bet }).then(({ data, error }) => {
        rc.betting = false;
        if (error) { toast(walletMsg(error)); rc.runners = null; rcRender(); return }
        // a aposta sai do saldo na largada; o prêmio aparece quando a corrida termina
        lg.goiabas = Math.max(0, (lg.goiabas || 0) - rc.bet);
        rc.forced = { winner: data.winner | 0, pay: data.pay | 0, wallet: data.wallet, runners: rc.runners }; rc.res = null; rc.view = "race"; rcRender();
      });
      return;
    }
    lg.goiabas = bal - rc.bet; lgSave(true); rc.res = null; rc.view = "race";
  }
  rcRender();
});
