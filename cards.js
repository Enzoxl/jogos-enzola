/* Jogos Enzola — Duelo de Cartas (aba "Outros jogos")
   49 cartas: personagens da intro e da loja, bichos extras, fotos de hipopótamos do álbum, skins de hipopótamo
   (com o fundo do banner) e o Coringa (hipopótamo principal). Regras completas em CG_HELP. */
const CG_ATT = [{ k: "for", n: "Força", i: "💪" }, { k: "fof", n: "Fofura", i: "🥰" }, { k: "sor", n: "Sorte", i: "🍀" }, { k: "esp", n: "Esperteza", i: "🧠" }];
const CG_RAR = ["", "Comum", "Rara", "Épica", "Lendária"];
const CG_BASE = [0, 34, 48, 62, 78];
const CG_REWARD = { levels: [6, 10, 16], mult: { facil: 1, normal: 1.5, dificil: 2 }, dayCap: 80, hand: 5 };
const CG_DIFF = { facil: "Fácil", normal: "Normal", dificil: "Difícil" };
// [id, nome, tipo, imagem, raridade, [atributos fortes]]
const CG_DEF = [
  ["c1", "Cão do zap", "chr", "convite/c1.jpg", 1, ["esp", "sor"]], ["c2", "Galo de casaco", "chr", "convite/c2.jpg", 2, ["fof", "sor"]],
  ["c3", "Leão", "chr", "convite/c3.jpg", 3, ["for"]], ["c4", "Canguru sarado", "chr", "convite/c4.jpg", 3, ["for"]],
  ["c5", "Gamer de fone", "chr", "convite/c5.jpg", 2, ["esp"]], ["c6", "Pássaro de óculos", "chr", "convite/c6.jpg", 2, ["sor", "esp"]],
  ["c8", "Apresentador", "chr", "convite/c8.jpg", 3, ["sor", "esp"]], ["c9", "Cavalo chique", "chr", "convite/c9.jpg", 2, ["for", "fof"]],
  ["c10", "Goiabinha", "chr", "convite/c10.jpg", 1, ["fof", "sor"]], ["c11", "Cachorro sábio", "chr", "convite/c11.jpg", 2, ["esp"]],
  ["c12", "Boné azul", "chr", "convite/c12.jpg", 2, ["sor"]], ["c13", "Vaca esperta", "chr", "convite/c13.jpg", 1, ["esp", "for"]],
  ["c14", "Lata roxa", "chr", "convite/c14.jpg", 1, ["sor"]], ["c15", "Veadinho", "chr", "convite/c15.jpg", 1, ["fof"]],
  ["c16", "CJ", "chr", "convite/c16.jpg", 3, ["for", "esp"]], ["c17", "Gatinho", "chr", "convite/c17.jpg", 1, ["fof"]],
  ["x-padre", "Padre Hulk", "chr", "cards/x-padre.webp", 3, ["for", "sor"]], ["x-pato", "Patinho", "chr", "cards/x-pato.webp", 1, ["fof"]],
  ["x-hamster", "Hamster na câmera", "chr", "cards/x-hamster.webp", 2, ["fof", "sor"]], ["x-lagartixa", "Lagartixa dançarina", "chr", "cards/x-lagartixa.webp", 2, ["esp", "fof"]],
  ["h42", "Hipo submerso", "pic", "cards/p-h42.webp", 2, ["esp"]], ["h02", "Hipo de perfil", "pic", "cards/p-h02.webp", 1, ["for"]],
  ["h07", "Hipo na plantação", "pic", "cards/p-h07.webp", 1, ["sor"]], ["h09", "Hipo turbo", "pic", "cards/p-h09.webp", 3, ["for", "sor"]],
  ["h08", "Bocão", "pic", "cards/p-h08.webp", 3, ["for"]], ["h46", "Bebê nadador", "pic", "cards/p-h46.webp", 2, ["fof"]],
  ["h15", "Hipo sorridente", "pic", "cards/p-h15.webp", 2, ["fof", "sor"]], ["h16", "Bocejo real", "pic", "cards/p-h16.webp", 3, ["for", "esp"]],
  ["h52", "Hipo do zoológico", "pic", "cards/p-h52.webp", 1, ["for"]], ["h53", "Bebê gordinho", "pic", "cards/p-h53.webp", 2, ["fof"]],
  ["h18", "Hipo imponente", "pic", "cards/p-h18.webp", 3, ["for", "esp"]], ["h19", "Hipo e os peixes", "pic", "cards/p-h19.webp", 2, ["esp", "fof"]],
  ["h38", "Hipo furacão", "pic", "cards/p-h38.webp", 3, ["for"]], ["h20", "Hipo curioso", "pic", "cards/p-h20.webp", 1, ["esp"]],
  ["h05", "Hipo do rio", "pic", "cards/p-h05.webp", 1, ["sor"]],
  ["h17", "Hipo sonolento", "pic", "cards/p-h17.webp", 1, ["sor"]], ["h14", "Hipo do lago verde", "pic", "cards/p-h14.webp", 2, ["fof", "sor"]],
  ["h13", "Bebê sentadinho", "pic", "cards/p-h13.webp", 2, ["fof"]], ["h04", "Hipo e o passarinho", "pic", "cards/p-h04.webp", 3, ["for", "esp"]],
  ["h44", "Hipo no gramado", "pic", "cards/p-h44.webp", 1, ["for"]],
  ["festeiro", "Festeiro", "skin", "", 2, ["fof", "sor"]], ["chef", "Chef", "skin", "", 2, ["esp", "fof"]], ["fone", "DJ de fone", "skin", "", 2, ["sor", "esp"]],
  ["oculos", "Óculos escuros", "skin", "", 2, ["sor"]], ["cauboi", "Caubói", "skin", "", 3, ["for", "sor"]], ["mago", "Mago", "skin", "", 3, ["esp"]],
  ["cavalheiro", "Cavalheiro", "skin", "", 3, ["esp", "fof"]], ["heroi", "Super-herói", "skin", "", 3, ["for"]], ["rei", "Rei Hipopótamo", "skin", "", 4, ["for", "esp"]],
  ["dourado", "Hipopótamo de ouro", "skin", "", 4, ["sor", "fof"]], ["ff", "Enzola Free Fire", "skin", "", 4, ["for", "sor"]],
  ["ave", "Enzola Pássaro", "skin", "", 4, ["esp", "fof"]], ["colecionador", "Colecionador", "skin", "", 4, ["sor", "esp"]],
];
function cgRng(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19 } return () => { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 } }
const CG_CARDS = [{ id: "joker", name: "Coringa", type: "joker", rar: 5, img: "hipopotamo.webp", s: { for: 100, fof: 100, sor: 100, esp: 100 } }].concat(CG_DEF.map(([id, name, type, img, rar, focus]) => {
  const r = cgRng(id), s = {};
  for (const a of CG_ATT) s[a.k] = Math.max(8, Math.min(97, Math.round(CG_BASE[rar] + (r() - .5) * 22 + (focus.includes(a.k) ? 15 : 0))));
  return { id, name, type, img: type === "skin" ? `loja/h-${id}.webp` : img, bg: type === "skin" ? `cards/bg-${id}.webp` : "", rar, s };
}));
const cgVal = (c, k) => c.joker || c.type === "joker" ? 100 : c.s[k];
const cgById = id => CG_CARDS.find(c => c.id === id);

/* ---------- carta (HTML) ---------- */
function cgCardHTML(c, o = {}) {
  const rc = c.type === "joker" ? "rj" : "r" + c.rar;
  const art = c.type === "skin" ? `<div class="cg-art skin" style="background-image:url(${c.bg})"><img src="${c.img}" alt="" draggable="false" loading="lazy"></div>`
    : c.type === "joker" ? `<div class="cg-art joker"><img src="${c.img}" alt="" draggable="false"><span class="cg-jr">CORINGA</span></div>`
    : `<div class="cg-art ${c.type}"><img src="${c.img}" alt="" draggable="false" loading="lazy"></div>`;
  const rows = CG_ATT.map(a => {
    const v = cgVal(c, a.k), tag = o.pick ? "button" : "div", on = o.hl === a.k;
    return `<${tag} class="cg-st${on ? " hl" : ""}"${o.pick ? ` data-cg="att:${a.k}"` : ""}><i>${a.i}</i><span>${a.n}</span><u><s style="width:${v}%"></s></u><b>${v}</b></${tag}>`;
  }).join("");
  return `<div class="cg-card ${rc} ${o.size || ""} ${o.cls || ""}" data-cid="${c.id}">${art}<div class="cg-top"><b>${esc(c.name)}</b><em>${c.type === "joker" ? "Coringa" : CG_RAR[c.rar]}</em></div><div class="cg-stats">${rows}</div></div>`;
}
const cgBackHTML = (cls = "") => `<div class="cg-card cg-bk ${cls}"><div class="cg-bkin"><img src="hipopotamo.webp" alt="" draggable="false"><span>ENZOLA</span></div></div>`;

/* ---------- estado ---------- */
let cg = { view: "menu", diff: "normal" };
const cgShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const cgStats = () => { lg = lg || lgLoad(); const s = lg.cards = lg.cards || { plays: 0, wins: 0, best: 0, day: "", earned: 0 }; if (s.day !== spDay(0)) { s.day = spDay(0); s.earned = 0 } return s };
function cgNew() {
  const p = cgShuffle(CG_CARDS), H = CG_REWARD.hand;
  cg = { ...cg, view: "game", you: p.slice(0, H), cpu: p.slice(H, 2 * H), round: 1, sy: 0, sc: 0, phase: "pick", sel: null, att: null, yc: null, cc: null, res: null, fx: "", coins: 0, level: 0 };
  cgStartRound();
}
function cgStartRound() { cg.atk = cg.round % 2 ? "you" : "cpu"; cg.sel = null; cg.att = null; cg.yc = null; cg.cc = null; cg.res = null; cg.phase = "pick"; if (cg.atk === "cpu") cgCpuAttack() }
const cgBehind = () => cg.sc < cg.sy;
function cgCpuAttack() {
  const h = cg.cpu, d = cg.diff; let card, att;
  if (d === "facil") { card = h[Math.floor(Math.random() * h.length)]; att = CG_ATT[Math.floor(Math.random() * 4)].k }
  else if (d === "normal") { card = h[Math.floor(Math.random() * h.length)]; att = CG_ATT.map(a => a.k).sort((x, y) => card.s[y] - card.s[x])[0] }
  else {
    const useJ = cg.round >= 4 || cgBehind(), pool = h.filter(c => c.type !== "joker" || useJ); const opts = [];
    for (const c of (pool.length ? pool : h)) for (const a of CG_ATT) opts.push({ c, a: a.k, v: cgVal(c, a.k) + Math.random() * 3 });
    opts.sort((x, y) => y.v - x.v); const top = opts[0], good = opts.filter(o => o.v >= 82 && o.c !== top.c).sort((x, y) => x.v - y.v)[0];
    card = (good && cg.round < 4 ? good : top).c; att = (good && cg.round < 4 ? good : top).a;
  }
  cg.cc = card; cg.att = att;
}
function cgCpuDefend(att) {
  const h = cg.cpu, d = cg.diff, best = () => { const useJ = cg.round >= 4 || cgBehind(), pool = h.filter(c => c.type !== "joker" || useJ); return (pool.length ? pool : h).slice().sort((x, y) => cgVal(y, att) - cgVal(x, att))[0] };
  if (d === "facil") return h[Math.floor(Math.random() * h.length)];
  if (d === "normal") return Math.random() < .6 ? best() : h[Math.floor(Math.random() * h.length)];
  // difícil: gasta a menor carta que ainda é forte no atributo; se nenhuma presta, sacrifica a mais fraca e guarda as boas
  const useJ = cg.round >= 4 || cgBehind(), pool = h.filter(c => c.type !== "joker" || useJ), L = (pool.length ? pool : h).slice().sort((x, y) => cgVal(x, att) - cgVal(y, att));
  const strong = L.filter(c => cgVal(c, att) >= 72); if (strong.length) return strong[0];
  return cg.round >= 4 ? L[L.length - 1] : L[0];
}
function cgResolve() {
  const a = cgVal(cg.yc, cg.att), b = cgVal(cg.cc, cg.att); cg.res = a > b ? "you" : a < b ? "cpu" : "draw";
  if (cg.res === "you") cg.sy++; else if (cg.res === "cpu") cg.sc++;
  cg.you = cg.you.filter(c => c !== cg.yc); cg.cpu = cg.cpu.filter(c => c !== cg.cc); cg.phase = "reveal"; cg.fx = "flip"; cg.va = a; cg.vb = b;
}
function cgFinish() {
  const st = cgStats(); st.plays++; const win = cg.sy > cg.sc, draw = cg.sy === cg.sc;
  cg.won = win; cg.draw = draw; cg.level = win ? (cg.sy >= 5 ? 3 : cg.sy === 4 ? 2 : 1) : 0;
  if (win) { st.wins++; st.best = Math.max(st.best || 0, cg.level) }
  const base = win ? CG_REWARD.levels[cg.level - 1] : draw ? 2 : 0, want = Math.round(base * CG_REWARD.mult[cg.diff]), room = Math.max(0, CG_REWARD.dayCap - (st.earned || 0));
  cg.coins = Math.min(want, room); cg.capped = want > room;
  if (cg.coins > 0 && user && typeof lgAward === "function") { st.earned += cg.coins; lgAward(cg.coins) } else lgSave(true);
  cg.phase = "end";
}

/* ---------- telas ---------- */
function cgHTML() {
  if (cg.view === "coll") return cgCollHTML();
  if (cg.view === "game") return cgGameHTML();
  const st = cgStats();
  return `<div class="cg-menu"><div class="ar-hud"><button class="btn ghost sm" data-ar="back">← Jogos</button><b class="cg-ttl">Duelo de Cartas</b></div>
    <div class="cg-hero"><div class="cg-fan">${["festeiro", "joker", "rei"].map((id, i) => cgCardHTML(cgById(id), { size: "sm", cls: "fan f" + i })).join("")}</div>
      <p class="muted">Monte sua mão de 5 cartas, escolha o atributo certo e vença 3 de 5 rodadas contra o computador.</p></div>
    <div class="cg-diff" role="group" aria-label="Dificuldade">${Object.keys(CG_DIFF).map(d => `<button class="chip" aria-pressed="${cg.diff === d}" data-cg="diff:${d}">${CG_DIFF[d]}<small> ×${CG_REWARD.mult[d]}</small></button>`).join("")}</div>
    <div class="cg-menu-a"><button class="btn" data-cg="play">Jogar</button><button class="btn ghost" data-ar-how="cards">❓ Como jogar</button><button class="btn ghost" data-cg="coll">🃏 Ver as ${CG_CARDS.length} cartas</button></div>
    <p class="muted ar-tip">Partidas: ${st.plays} · Vitórias: ${st.wins}${st.best ? ` · Melhor nível: ${st.best}` : ""} · Moedas hoje: ${st.earned}/${CG_REWARD.dayCap}</p></div>`;
}
function cgCollHTML() {
  const order = [...CG_CARDS].sort((a, b) => (b.rar === 5 ? 9 : b.rar) - (a.rar === 5 ? 9 : a.rar) || a.name.localeCompare(b.name));
  return `<div class="cg-menu"><div class="ar-hud"><button class="btn ghost sm" data-cg="menu">← Voltar</button><b class="cg-ttl">Todas as cartas</b></div>
    <p class="muted ar-tip">Toque numa carta para ampliar. ${CG_CARDS.length} cartas: ${CG_CARDS.filter(c => c.type === "chr").length} personagens, ${CG_CARDS.filter(c => c.type === "pic").length} hipopótamos do álbum, ${CG_CARDS.filter(c => c.type === "skin").length} skins e o Coringa.</p>
    <div class="cg-coll">${order.map(c => `<button class="cg-cb" data-cg="zoom:${c.id}" aria-label="Ampliar ${esc(c.name)}">${cgCardHTML(c, { size: "sm" })}</button>`).join("")}</div></div>`;
}
function cgGameHTML() {
  const g = cg, you = g.atk === "you", over = g.phase === "end";
  const slotY = g.yc || (g.phase === "pick" && g.sel) || null, showC = g.phase === "reveal" || over;
  const ySlot = slotY ? cgCardHTML(slotY, { size: "md", cls: (g.fx === "sel" ? "pop " : "") + (g.phase === "reveal" ? "flip " + (g.res === "you" ? "win" : g.res === "cpu" ? "lose" : "") : ""), hl: g.att, pick: you && g.phase === "pick" }) : `<div class="cg-empty">Sua carta</div>`;
  const cSlot = showC && g.cc ? cgCardHTML(g.cc, { size: "md", cls: "flip " + (g.res === "cpu" ? "win" : g.res === "you" ? "lose" : ""), hl: g.att }) : g.cc && !you ? cgBackHTML("md") : `<div class="cg-empty">CPU</div>`;
  const attPill = g.att ? (() => { const a = CG_ATT.find(x => x.k === g.att); return `<span class="cg-pill">${a.i} ${a.n}</span>` })() : "";
  let msg = "", acts = "";
  if (g.phase === "pick") {
    if (you) { msg = g.sel ? `Escolha o atributo da <b>${esc(g.sel.name)}</b> (toque na barra).` : "<b>Sua vez de atacar!</b> Escolha uma carta da sua mão."; }
    else msg = g.sel ? `Jogar <b>${esc(g.sel.name)}</b> contra ${attPill}?` : `<b>A CPU atacou com ${attPill}.</b> Escolha uma carta da sua mão (a dela está virada).`;
    if (!you && g.sel) acts = `<button class="btn" data-cg="confirm">Jogar esta carta</button>`;
  } else if (g.phase === "reveal") {
    const t = g.res === "you" ? "Você venceu a rodada! 🎉" : g.res === "cpu" ? "A CPU venceu a rodada." : "Empate!";
    msg = `<b>${t}</b> <span class="muted">${g.va} × ${g.vb} em ${attPill}</span>`;
    acts = `<button class="btn" data-cg="next">${g.round >= CG_REWARD.hand ? "Ver resultado" : "Próxima rodada"}</button>`;
  }
  const hand = g.you.map(c => `<button class="cg-hc${g.sel === c ? " sel" : ""}" data-cg="card:${c.id}" ${g.phase !== "pick" ? "disabled" : ""} aria-label="Carta ${esc(c.name)}">${cgCardHTML(c, { size: "sm" })}</button>`).join("");
  g.fx = "";
  return `<div class="cg-game"><div class="ar-hud"><button class="btn ghost sm" data-cg="menu" aria-label="Sair da partida">✕ Sair</button>
      <div class="ar-sc"><span>Rodada</span><b>${Math.min(g.round, 5)}/5</b></div><div class="ar-sc cg-scr"><span>Você × CPU</span><b>${g.sy} × ${g.sc}</b></div><button class="iconbtn" data-ar-how="cards" aria-label="Como jogar">❓</button></div>
    <div class="cg-cpuh" aria-label="Cartas da CPU">${g.cpu.map(() => `<i></i>`).join("")}<small>CPU · ${g.cpu.length} carta${g.cpu.length === 1 ? "" : "s"}</small></div>
    <div class="cg-arena"><div class="cg-slot"><small class="cg-who">CPU</small>${cSlot}</div><div class="cg-vs">VS</div><div class="cg-slot"><small class="cg-who you">Você</small>${ySlot}</div></div>
    <p class="cg-msg" aria-live="polite">${msg}</p><div class="cg-acts">${acts}</div>
    ${g.phase === "pick" ? `<div class="cg-hl">Sua mão</div><div class="cg-hand">${hand}</div>` : ""}
    ${over ? cgEndHTML() : ""}</div>`;
}
function cgEndHTML() {
  const g = cg, t = g.won ? (g.level === 3 ? "Vitória perfeita! 🏆" : "Você venceu! 🎉") : g.draw ? "Empate" : "A CPU venceu";
  return `<div class="ar-ov on cg-end"><div class="ar-box"><b>${t}</b><div class="ar-res"><div><span>Você</span><b>${g.sy}</b></div><div><span>CPU</span><b>${g.sc}</b></div>${g.won ? `<div><span>Nível</span><b>${g.level}</b></div>` : ""}</div>
    <p>${g.coins ? `+${g.coins} Enzola Coins${g.won ? ` (nível ${g.level} · ×${CG_REWARD.mult[g.diff]})` : ""}` : g.capped ? "Limite de moedas de hoje atingido." : g.won ? "" : "Vença para ganhar moedas."}</p>
    <button class="btn" data-cg="play">Jogar de novo</button><button class="btn ghost" data-cg="menu">Menu</button></div></div>`;
}
function cgRender() { const r = $("#cg-root"); if (r) r.innerHTML = cgHTML() }
function cgMount() { if (cg.view === "game" && cg.phase === "end" && !cg.you) cg.view = "menu"; cgRender() }

document.addEventListener("click", e => {
  const b = e.target.closest("[data-cg]"); if (!b || !$("#cg-root")) return;
  const [a, v] = b.dataset.cg.split(":");
  if (a === "diff") { cg.diff = v }
  else if (a === "play") cgNew();
  else if (a === "menu") { cg.view = "menu" }
  else if (a === "coll") cg.view = "coll";
  else if (a === "zoom") { const c = cgById(v); if (c) modal2(`<button class="iconbtn mclose" data-close2 aria-label="Fechar">✕</button><div class="cg-zoom">${cgCardHTML(c, { size: "lg" })}</div>`, "cg-zm"); return }
  else if (cg.view === "game") {
    if (a === "card" && cg.phase === "pick") { const c = cg.you.find(x => x.id === v); if (!c) return; cg.sel = cg.sel === c ? null : c; cg.fx = "sel" }
    else if (a === "att" && cg.phase === "pick" && cg.atk === "you" && cg.sel) { cg.att = v; cg.yc = cg.sel; cg.cc = cgCpuDefend(v); cgResolve() }
    else if (a === "confirm" && cg.phase === "pick" && cg.atk === "cpu" && cg.sel) { cg.yc = cg.sel; cgResolve() }
    else if (a === "next" && cg.phase === "reveal") { if (cg.round >= CG_REWARD.hand) cgFinish(); else { cg.round++; cgStartRound() } }
  }
  cgRender();
});
document.addEventListener("click", e => { if (e.target.closest("[data-close2]") || e.target.matches("[data-ovl2]")) closeModal2() });
