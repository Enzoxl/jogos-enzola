/* Jogos Enzola — Quebra-cabeça de Hipopótamos (aba "Outros jogos")
   Todas as fotos do álbum viram quebra-cabeças. A foto é cortada em peças e embaralhada: toque numa peça e depois em outra
   para trocá-las de lugar. Peças no lugar certo ficam travadas. 3 tamanhos (Fácil/Médio/Difícil).
   Moedas só na PRIMEIRA vez que você completa cada foto em cada tamanho (limite diário). */
const PZ = { cols: { facil: 3, medio: 5, dificil: 7 }, coins: { facil: 1, medio: 3, dificil: 6 }, dayCap: 60, hints: 3 };
const PZ_NAME = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };
let pz = { view: "menu", id: null, diff: "facil", tiles: [], sel: null, moves: 0, t0: 0, sec: 0, state: "idle", hints: PZ.hints, peek: false, timer: 0, cols: 3, rows: 2, coins: 0, first: false };
const pzStats = () => { lg = lg || lgLoad(); const s = lg.puz = lg.puz || { done: {}, plays: 0, day: "", earned: 0 }; if (s.day !== spDay(0)) { s.day = spDay(0); s.earned = 0 } return s };
const pzDoneN = () => Object.keys(pzStats().done).length;
const pzPhoto = id => ALBUM.find(p => p.id === id);
const pzFmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function pzHTML() {
  if (pz.view === "game") return pzGameHTML();
  const st = pzStats(), N = ALBUM.length;
  return `<div class="cg-menu"><div class="ar-hud"><button class="btn ghost sm" data-ar="back">← Jogos</button><b class="cg-ttl">Quebra-cabeça</b></div>
    <p class="muted ar-tip">Escolha o tamanho e uma foto. ${pzDoneN()}/${N} fotos já montadas · Moedas hoje: ${st.earned}/${PZ.dayCap}</p>
    <div class="cg-diff" role="group" aria-label="Tamanho">${Object.keys(PZ_NAME).map(d => `<button class="chip" aria-pressed="${pz.diff === d}" data-pz="diff:${d}">${PZ_NAME[d]}<small> ${PZ.cols[d]}×${Math.max(2, Math.round(PZ.cols[d] / 1.5))} · ${PZ.coins[d]}🪙</small></button>`).join("")}</div>
    <div class="cg-menu-a"><button class="btn" data-pz="rand">🎲 Foto aleatória</button><button class="btn ghost" data-ar-how="puzzle">❓ Como jogar</button></div>
    <div class="pz-grid">${ALBUM.map(p => { const d = st.done[p.id] || {}; const n = (d.facil ? 1 : 0) + (d.medio ? 1 : 0) + (d.dificil ? 1 : 0); return `<button class="pz-th" data-pz="play:${p.id}" aria-label="${esc(p.name)}${n ? `, montada em ${n} tamanho${n > 1 ? "s" : ""}` : ""}"><img src="${esc(p.img)}" alt="" loading="lazy" decoding="async"><span>${esc(p.name)}</span>${n ? `<i class="pz-ok" title="Montada">${"★".repeat(n)}</i>` : ""}</button>` }).join("")}</div></div>`;
}
function pzGameHTML() {
  const p = pzPhoto(pz.id), c = pz.cols, r = pz.rows;
  const tiles = pz.tiles.map((t, i) => {
    const x = t % c, y = Math.floor(t / c), ok = t === i;
    return `<button class="pz-t${ok ? " ok" : ""}${pz.sel === i ? " sel" : ""}" data-pz="tile:${i}" style="background-image:url(${esc(p.img)});background-size:${c * 100}% ${r * 100}%;background-position:${c > 1 ? x / (c - 1) * 100 : 0}% ${r > 1 ? y / (r - 1) * 100 : 0}%" aria-label="Peça ${i + 1}${ok ? ", no lugar certo" : ""}"${ok ? " tabindex=-1" : ""}></button>`;
  }).join("");
  return `<div class="pz"><div class="ar-hud"><button class="btn ghost sm" data-pz="menu">✕ Sair</button><div class="ar-sc"><span>Tempo</span><b id="pz-t">${pzFmt(pz.sec)}</b></div><div class="ar-sc"><span>Trocas</span><b id="pz-m">${pz.moves}</b></div><button class="iconbtn" data-ar-how="puzzle" aria-label="Como jogar">❓</button></div>
    <p class="muted pz-name"><b>${esc(p.name)}</b> · ${PZ_NAME[pz.diff]}</p>
    <div class="pz-board${pz.peek ? " peek" : ""}" style="aspect-ratio:${p.ar || 1.5};--ar:${p.ar};--c:${c};--r:${r}"><div class="pz-tiles" style="grid-template-columns:repeat(${c},1fr);grid-template-rows:repeat(${r},1fr)">${tiles}</div><img class="pz-full" src="${esc(p.img)}" alt="Foto completa"></div>
    <div class="cg-menu-a"><button class="btn ghost sm" data-pz="peek">👁 Ver foto</button><button class="btn ghost sm" data-pz="hint"${pz.hints ? "" : " disabled"}>💡 Dica (${pz.hints})</button><button class="btn ghost sm" data-pz="shuffle">🔀 Reembaralhar</button></div>
    ${pz.state === "done" ? pzEndHTML() : ""}</div>`;
}
function pzEndHTML() {
  return `<div class="ar-ov on cg-end"><div class="ar-box"><b>Montado! 🧩</b><div class="ar-res"><div><span>Tempo</span><b>${pzFmt(pz.sec)}</b></div><div><span>Trocas</span><b>${pz.moves}</b></div></div>
    <p>${pz.coins ? `+${pz.coins} Enzola Coins (primeira vez nesse tamanho)` : pz.first ? "Limite de moedas de hoje atingido." : "Você já tinha montado essa foto neste tamanho. Experimente outro tamanho ou outra foto!"}</p>
    <button class="btn" data-pz="rand">Outra foto</button><button class="btn ghost" data-pz="again">Repetir</button><button class="btn ghost" data-pz="menu">Menu</button></div></div>`;
}
function pzRender() { const r = $("#pz-root"); if (r) r.innerHTML = pzHTML() }
function pzMount() { clearInterval(pz.timer); if (pz.view === "game" && pz.state !== "done") pz.view = "menu"; pzRender() }

/* ---------- jogo ---------- */
function pzNew(id) {
  const p = pzPhoto(id); if (!p) return;
  const c = PZ.cols[pz.diff], r = Math.max(2, Math.round(c / (p.ar || 1.5)));
  pz = { ...pz, view: "game", id, cols: c, rows: r, sel: null, moves: 0, sec: 0, state: "play", hints: PZ.hints, peek: false, coins: 0, first: false };
  pzShuffle(); pz.t0 = Date.now(); clearInterval(pz.timer);
  pz.timer = setInterval(() => { if (pz.state !== "play" || !$("#pz-t")) { if (!$("#pz-t")) clearInterval(pz.timer); return } pz.sec = Math.floor((Date.now() - pz.t0) / 1000); $("#pz-t").textContent = pzFmt(pz.sec) }, 500);
  pzRender();
}
function pzShuffle() {
  const n = pz.cols * pz.rows; let a;
  do { a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } } while (a.filter((t, i) => t === i).length > Math.floor(n / 6));
  pz.tiles = a; pz.sel = null;
}
function pzCheck() {
  if (!pz.tiles.every((t, i) => t === i)) return;
  pz.state = "done"; pz.sec = Math.floor((Date.now() - pz.t0) / 1000); clearInterval(pz.timer);
  const st = pzStats(), d = st.done[pz.id] = st.done[pz.id] || {}; st.plays++;
  pz.first = !d[pz.diff];
  if (pz.first) { d[pz.diff] = pz.sec || 1; const room = Math.max(0, PZ.dayCap - (st.earned || 0)); pz.coins = Math.min(PZ.coins[pz.diff], room); if (pz.coins > 0 && typeof lgAward === "function") { st.earned += pz.coins; lgAward(pz.coins) } else lgSave(true) }
  else { d[pz.diff] = Math.min(d[pz.diff], pz.sec || 1); lgSave(true) }
}
function pzTile(i) {
  if (pz.state !== "play" || pz.tiles[i] === i) return;
  if (pz.sel === null) { pz.sel = i; return }
  if (pz.sel === i) { pz.sel = null; return }
  const j = pz.sel; [pz.tiles[i], pz.tiles[j]] = [pz.tiles[j], pz.tiles[i]]; pz.sel = null; pz.moves++; pzCheck();
}
function pzHint() {
  if (pz.state !== "play" || !pz.hints) return;
  const wrong = pz.tiles.map((t, i) => i).filter(i => pz.tiles[i] !== i); if (!wrong.length) return;
  const i = wrong[Math.floor(Math.random() * wrong.length)], j = pz.tiles.indexOf(i);
  [pz.tiles[i], pz.tiles[j]] = [pz.tiles[j], pz.tiles[i]]; pz.hints--; pz.moves++; pz.sel = null; pzCheck();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pz]"); if (!b || !$("#pz-root")) return;
  const [a, v] = b.dataset.pz.split(":");
  if (a === "diff") pz.diff = v;
  else if (a === "play") return pzNew(v);
  else if (a === "rand") return pzNew(ALBUM[Math.floor(Math.random() * ALBUM.length)].id);
  else if (a === "again") return pzNew(pz.id);
  else if (a === "menu") { clearInterval(pz.timer); pz.view = "menu"; pz.state = "idle" }
  else if (a === "tile") pzTile(+v);
  else if (a === "hint") pzHint();
  else if (a === "shuffle") { if (pz.state === "play") { pzShuffle(); pz.moves++ } }
  else if (a === "peek") { pz.peek = !pz.peek; const bd = $(".pz-board"); if (bd) { bd.classList.toggle("peek", pz.peek); return } }
  pzRender();
});
