/* Jogos Enzola — Duelo de Cartas (aba "Outros jogos")
   55 cartas: personagens da intro e da loja, bichos extras, fotos de hipopótamos do álbum, skins de hipopótamo
   (com o fundo do banner) e o Coringa (hipopótamo principal). Regras completas em CG_HELP. */
const CG_ATT = [{ k: "for", n: "Força", i: "💪" }, { k: "fof", n: "Fofura", i: "🥰" }, { k: "sor", n: "Sorte", i: "🍀" }, { k: "esp", n: "Esperteza", i: "🧠" }];
const CG_RAR = ["", "Comum", "Rara", "Épica", "Lendária"];
const CG_BASE = [0, 34, 48, 62, 78];
const CG_REWARD = { levels: [6, 10, 16], mult: { facil: 1, normal: 1.5, dificil: 2 }, dayCap: 80, hand: 5 };
const CG_DIFF = { facil: "Fácil", normal: "Normal", dificil: "Difícil" };
// [id, nome, tipo, imagem, raridade, [atributos fortes]]
const CG_DEF = [
  ["c1", "Cão do zap", "chr", "convite/c1.jpg", 1, ["esp", "sor"]], ["c2", "Galo de casaco", "chr", "convite/c2.jpg", 2, ["fof", "sor"]],
  ["c3", "Leão", "chr", "convite/c3.jpg", 3, ["for"]], ["c4", "Canguru Roger", "chr", "convite/c4.jpg", 3, ["for"]],
  ["c5", "Gamer de fone", "chr", "convite/c5.jpg", 2, ["esp"]], ["c6", "Pica-pau", "chr", "convite/c6.jpg", 2, ["sor", "esp"]],
  ["c8", "Apresentador", "chr", "convite/c8.jpg", 3, ["sor", "esp"]], ["c9", "Cavalo chique", "chr", "convite/c9.jpg", 2, ["for", "fof"]],
  ["c10", "Zé goiaba", "chr", "convite/c10.jpg", 1, ["fof", "sor"]], ["c11", "Cachorro sábio", "chr", "convite/c11.jpg", 2, ["esp"]],
  ["c12", "paiN Alpha", "chr", "convite/c12.jpg", 2, ["sor"]], ["c13", "Vaca esperta", "chr", "convite/c13.jpg", 1, ["esp", "for"]],
  ["c14", "Lata roxa", "chr", "convite/c14.jpg", 1, ["sor"]], ["c15", "Veadinho", "chr", "convite/c15.jpg", 1, ["fof"]],
  ["c16", "CJ", "chr", "convite/c16.jpg", 3, ["for", "esp"]], ["c17", "Gatinho", "chr", "convite/c17.jpg", 1, ["fof"]],
  ["x-padre", "Hulk Padre", "chr", "cards/x-padre.webp", 3, ["for", "sor"]], ["x-pato", "Pato Josefo", "chr", "cards/x-pato.webp", 1, ["fof"]],
  ["x-hamster", "Hamster na câmera", "chr", "cards/x-hamster.webp", 2, ["fof", "sor"]], ["x-lagartixa", "Calango do Mica", "chr", "cards/x-lagartixa.webp", 2, ["esp", "fof"]],
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
  ["pirata", "Pirata", "skin", "", 2, ["for", "sor"]], ["cauboi", "Caubói", "skin", "", 3, ["for", "sor"]], ["mago", "Mago", "skin", "", 3, ["esp"]],
  ["cavalheiro", "Cavalheiro", "skin", "", 3, ["esp", "fof"]], ["heroi", "Super-herói", "skin", "", 3, ["for"]], ["cruzeirense", "Enzola Cruzeirense", "skin", "", 3, ["for", "sor"]], ["rei", "Enzola King", "skin", "", 4, ["for", "esp"]],
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
  if (cg.coins > 0 && user && typeof lgAward === "function") { st.earned += cg.coins; lgAward(cg.coins, "cards") } else lgSave(true);
  cg.phase = "end";
}

/* ---------- telas ---------- */
function cgHTML() {
  if (cg.view === "coll") return cgCollHTML();
  if (cg.view === "game") return cgGameHTML();
  if (cg.view === "pvp") return cgPvHTML();
  const st = cgStats();
  return `<div class="cg-menu"><div class="ar-hud"><button class="btn ghost sm" data-ar="back">← Jogos</button><b class="cg-ttl">Duelo de Cartas</b></div>
    <div class="cg-hero"><div class="cg-fan">${["festeiro", "joker", "rei"].map((id, i) => cgCardHTML(cgById(id), { size: "sm", cls: "fan f" + i })).join("")}</div>
      <p class="muted">Monte sua mão de 5 cartas, escolha o atributo certo e vença 3 de 5 rodadas contra o computador.</p></div>
    <div class="cg-diff" role="group" aria-label="Dificuldade">${Object.keys(CG_DIFF).map(d => `<button class="chip" aria-pressed="${cg.diff === d}" data-cg="diff:${d}">${CG_DIFF[d]}<small> ×${CG_REWARD.mult[d]}</small></button>`).join("")}</div>
    <div class="cg-menu-a"><button class="btn" data-cg="play">Jogar</button><button class="btn ghost" data-ar-how="cards">❓ Como jogar</button><button class="btn ghost" data-cg="coll">🃏 Ver as ${CG_CARDS.length} cartas</button></div>
    ${cgDuelsHTML()}
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
function cgMount() { if (cg.view === "game" && cg.phase === "end" && !cg.you) cg.view = "menu"; cgRender(); cgDuelsLoad() }

document.addEventListener("click", e => {
  const b = e.target.closest("[data-cg]"); if (!b || !$("#cg-root")) return;
  const [a, v] = b.dataset.cg.split(":");
  if (a === "diff") { cg.diff = v }
  else if (a === "play") cgNew();
  else if (a === "menu") { cg.view = "menu"; cg.pv = null; cgDuelsLoad() }
  else if (a === "duel") { cgPicker(); return }
  else if (/^d(pick|acc|dec|open|cancel|leave|sel|ok|next|forfeit)$/.test(a)) { cgDuelClick(a, v); return }
  else if (cg.view === "pvp") { cgDuelClick("p" + a, v); return }
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


/* ---------- duelo com amigos (tempo real, tabela card_duels) ---------- */
const CG_PV_MULT = 1.5;
let cgD = { list: [], loaded: false, rt: false, timer: 0 };
const cgMe = () => user && user.id;
const cgOppName = d => { const o = d.host === cgMe() ? d.guest : d.host; return pName(pOf(o)) };
function cgSeeded(seed) { const r = cgRng(seed), a = CG_CARDS.map(c => c.id); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
function cgPvState(d) {
  const me = cgMe(), isHost = d.host === me, ids = cgSeeded(d.seed), H = CG_REWARD.hand;
  const hands = [ids.slice(0, H).map(cgById), ids.slice(H, 2 * H).map(cgById)], mine = hands[isHost ? 0 : 1];
  const rounds = []; let sy = 0, so = 0, done = 0; const usedMine = new Set(); let oppUsed = 0;
  for (let r = 1; r <= H; r++) {
    const m = (d.moves || {})[r] || {}, atkIsMe = (r % 2 === 1) === isHost;
    const A = m.a ? cgById(m.a.c) : null, D = m.d ? cgById(m.d.c) : null, o = { r, atkIsMe, att: m.a ? m.a.att : null, A, D, complete: !!(A && D), mc: atkIsMe ? A : D, oc: atkIsMe ? D : A };
    if (o.mc) usedMine.add(o.mc.id); if (o.oc) oppUsed++;
    if (o.complete) {
      o.va = cgVal(A, o.att); o.vd = cgVal(D, o.att); const aw = o.va > o.vd, dw = o.vd > o.va;
      o.res = aw || dw ? ((aw && atkIsMe) || (dw && !atkIsMe) ? "me" : "opp") : "draw";
      if (o.res === "me") sy++; else if (o.res === "opp") so++; done++;
    }
    rounds.push(o);
  }
  return { rounds, sy, so, done, hand: mine.filter(c => !usedMine.has(c.id)), oppLeft: H - oppUsed };
}
async function cgDuelsLoad() {
  if (!sb || !user || !(typeof caps !== "undefined" && caps.v3)) return;
  if (typeof fr !== "undefined" && !fr.loaded && typeof loadFriends === "function") { await loadFriends() }
  const { data, error } = await sb.from("card_duels").select("*").in("status", ["pending", "active"]).order("updated_at", { ascending: false });
  if (error) return; cgD.list = data || []; cgD.loaded = true;
  if (!cgD.rt) {
    cgD.rt = true;
    sb.channel("duels-" + cgMe()).on("postgres_changes", { event: "*", schema: "public", table: "card_duels" }, p => cgDuelUpd(p.new && p.new.id ? p.new : null)).subscribe();
  }
  cgRender();
}
function cgDuelUpd(row) {
  if (!row) return cgDuelsLoad();
  const old = cgD.list.find(x => x.id === row.id);
  cgD.list = cgD.list.filter(x => x.id !== row.id); if (row.status === "pending" || row.status === "active") cgD.list.unshift(row);
  if (old && old.status === "pending" && row.status === "active" && row.host === cgMe()) toast(`${cgOppName(row)} aceitou seu duelo! ⚔️`);
  if (old && old.status === "pending" && row.status === "declined" && row.host === cgMe()) toast(`${cgOppName(row)} recusou o duelo.`);
  if (cg.pv && cg.pv.id === row.id) cg.pv.d = row;
  cgRender();
}
function cgDuelsHTML() {
  const me = cgMe(); if (!me) return "";
  const rows = cgD.list.map(d => {
    const nm = esc(cgOppName(d)), mineHost = d.host === me;
    if (d.status === "pending") return mineHost
      ? `<div class="cg-dr"><span>⏳ Aguardando <b>${nm}</b> aceitar</span><button class="btn ghost sm" data-cg="dcancel:${d.id}">Cancelar</button></div>`
      : `<div class="cg-dr hot"><span>⚔️ <b>${nm}</b> desafiou você!</span><span class="cg-da"><button class="btn sm" data-cg="dacc:${d.id}">Aceitar</button><button class="btn ghost sm" data-cg="ddec:${d.id}">Recusar</button></span></div>`;
    const S = cgPvState(d), r = Math.min(S.done + 1, CG_REWARD.hand), o = S.rounds[r - 1];
    const turn = o.complete || (o.atkIsMe ? !o.A : !!o.A && !o.D);
    return `<div class="cg-dr${turn ? " hot" : ""}"><span>🃏 Duelo com <b>${nm}</b> · ${S.sy}×${S.so} · ${turn ? "<b>sua vez</b>" : "aguardando"}</span><span class="cg-da"><button class="btn sm" data-cg="dopen:${d.id}">Jogar</button><button class="btn ghost sm" data-cg="dleave:${d.id}">Desistir</button></span></div>`;
  }).join("");
  return `<div class="cg-duels"><button class="btn cg-vsb" data-cg="duel">⚔️ Desafiar um amigo</button>${rows ? `<div class="cg-dl">${rows}</div>` : ""}</div>`;
}
function cgPicker() {
  if (!user || typeof frAccepted !== "function") return toast("Entre na sua conta para desafiar amigos.");
  const go = () => {
    const fl = frAccepted().map(f => pOf(other(f)));
    const busy = new Set(cgD.list.map(d => d.host === cgMe() ? d.guest : d.host));
    modal2(`<button class="iconbtn mclose" data-close2 aria-label="Fechar">✕</button><h2>⚔️ Desafiar um amigo</h2><p class="sub">O amigo recebe uma notificação. Vocês jogam 5 rodadas com mãos sorteadas, valendo Enzola Coins.</p>
      ${fl.length ? `<div class="flist cg-fl">${fl.map(p => `<div class="fcard"><div class="fhead"><div class="av md">${avatar(p.avatar)}</div><div class="fi"><div class="fn">${esc(pName(p))}</div><div class="fu">@${esc(p.username || "")}</div></div></div><div class="fa">${busy.has(p.user_id) ? `<span class="muted">Em andamento</span>` : `<button class="btn sm" data-cg="dpick:${p.user_id}">Desafiar</button>`}</div></div>`).join("")}</div>` : `<div class="panel empty"><b>Nenhum amigo ainda</b>Adicione amigos na aba Amigos para desafiar.</div>`}`, "cg-pk");
  };
  if (!fr.loaded) loadFriends().then(go); else go();
}
async function cgChallenge(uid) {
  if (!sb || !user) return;
  const { data, error } = await sb.rpc("duel_create", { p_guest: uid });
  if (error) { toast(/andamento/i.test(error.message) ? "Já existe um duelo em andamento com esse amigo." : "Não foi possível enviar o desafio."); return }
  toast(`Desafio enviado para ${pName(pOf(uid))}! ⚔️`); closeModal2 && closeModal2();
  await cgDuelsLoad(); cgGoMenu();
}
function cgGoMenu() { mgTab = "arcade"; if (typeof arSel !== "undefined") arSel = "cards"; cg.view = "menu"; cg.pv = null; if (location.hash.replace("#", "") === "idiomas") renderLingo(); else location.hash = "#idiomas" }
function cgPvOpen(d) {
  const S = cgPvState(d); cg.view = "pvp"; cg.pv = { id: d.id, d, r: Math.min(S.done + 1, CG_REWARD.hand + (d.status === "done" ? 1 : 0)), sel: null, fin: null };
  clearInterval(cgD.timer); cgD.timer = setInterval(async () => {
    if (cg.view !== "pvp" || !cg.pv || !$("#cg-root")) { clearInterval(cgD.timer); return }
    const { data } = await sb.from("card_duels").select("*").eq("id", cg.pv.id).maybeSingle();
    if (data && (data.updated_at !== cg.pv.d.updated_at || data.status !== cg.pv.d.status)) { cg.pv.d = data; cgRender() }
  }, 7000);
  cgRender();
}
async function cgDuelClick(a, v) {
  const pv = cg.pv;
  const rpc = async (fn, args) => { const { data, error } = await sb.rpc(fn, args); if (error) { toast("Não deu certo: " + (error.message || "tente de novo")); return null } return data };
  if (a === "dpick") { const id = await rpc("duel_create", { p_guest: v }); if (id) { toast(`Desafio enviado para ${pName(pOf(v))}! ⚔️`); closeModal2(); await cgDuelsLoad() } return }
  if (a === "dacc") { const d = await rpc("duel_respond", { p_id: v, p_accept: true }); if (d) { await cgDuelsLoad(); cgPvOpen(d) } return }
  if (a === "ddec") { await rpc("duel_respond", { p_id: v, p_accept: false }); return cgDuelsLoad() }
  if (a === "dcancel" || a === "dleave") { await rpc("duel_leave", { p_id: v }); return cgDuelsLoad() }
  if (a === "dopen") { const d = cgD.list.find(x => x.id === v); if (d) cgPvOpen(d); return }
  if (!pv) return;
  const S = cgPvState(pv.d), H = CG_REWARD.hand, o = S.rounds[Math.min(pv.r, H) - 1];
  if (a === "pcard") { const c = S.hand.find(x => x.id === v); if (c && pv.r <= H && !o.complete) { pv.sel = pv.sel === c ? null : c; pv.fx = "sel" } return cgRender() }
  if (a === "patt" && pv.sel && o.atkIsMe && !o.A) {
    const d = await rpc("duel_move", { p_id: pv.id, p_round: pv.r, p_card: pv.sel.id, p_att: v }); if (d) { pv.d = d; pv.sel = null }
    return cgRender();
  }
  if (a === "pconfirm" && pv.sel && !o.atkIsMe && o.A && !o.D) {
    const d = await rpc("duel_move", { p_id: pv.id, p_round: pv.r, p_card: pv.sel.id }); if (d) { pv.d = d; pv.sel = null }
    return cgRender();
  }
  if (a === "pnext" && o.complete) { pv.r++; pv.sel = null; if (pv.r > H) cgPvFinish(); return cgRender() }
  if (a === "pforfeit") { const d = await rpc("duel_leave", { p_id: pv.id }); if (d) { pv.d = d; pv.fin = { left: true, coins: 0 } } return cgRender() }
  if (a === "prematch") return cgChallenge(pv.d.host === cgMe() ? pv.d.guest : pv.d.host).then(() => { cg.view = "menu"; cg.pv = null; cgRender() });
}
function cgPvFinish() {
  const pv = cg.pv, d = pv.d, S = cgPvState(d); if (pv.fin) return;
  const st = cgStats(); st.pv = st.pv || {}; const claimed = !!st.pv[d.id];
  const oppLeft = d.forfeit && d.forfeit !== cgMe(), win = oppLeft || S.sy > S.so, draw = !oppLeft && S.sy === S.so;
  const level = win ? (oppLeft ? 1 : S.sy >= 5 ? 3 : S.sy === 4 ? 2 : 1) : 0;
  const base = win ? CG_REWARD.levels[level - 1] : draw ? 2 : 1, want = Math.round(base * CG_PV_MULT), room = Math.max(0, CG_REWARD.dayCap - (st.earned || 0));
  const coins = claimed ? 0 : Math.min(want, room);
  pv.fin = { win, draw, level, coins, capped: !claimed && want > room, oppLeft };
  if (!claimed) { st.plays++; if (win) { st.wins++; st.best = Math.max(st.best || 0, level) } st.pv[d.id] = 1; const k = Object.keys(st.pv); if (k.length > 30) delete st.pv[k[0]];
    if (coins > 0 && typeof lgAward === "function") { st.earned += coins; lgAward(coins, "cards") } else lgSave(true) }
}
function cgPvHTML() {
  const pv = cg.pv; if (!pv) return "";
  const d = pv.d, H = CG_REWARD.hand, S = cgPvState(d), opp = esc(cgOppName(d).slice(0, 12)), oppFull = esc(cgOppName(d));
  const ended = d.status === "done" && d.forfeit || pv.r > H || d.status === "cancelled";
  if (ended && !pv.fin) cgPvFinish();
  const o = S.rounds[Math.min(pv.r, H) - 1];
  const phase = ended ? "end" : o.complete ? "reveal" : o.atkIsMe ? (o.A ? "wait" : "pick") : (!o.A ? "wait" : "pick");
  const att = o.att ? CG_ATT.find(x => x.k === o.att) : null, pill = att ? `<span class="cg-pill">${att.i} ${att.n}</span>` : "";
  const myTurnAtk = phase === "pick" && o.atkIsMe;
  const sel = pv.sel;
  const mine = o.mc || (phase === "pick" && sel) || null;
  const rv = phase === "reveal";
  const ySlot = mine ? cgCardHTML(mine, { size: "md", cls: (pv.fx === "sel" ? "pop " : "") + (rv ? "flip " + (o.res === "me" ? "win" : o.res === "opp" ? "lose" : "") : ""), hl: o.att, pick: myTurnAtk && !o.mc }) : `<div class="cg-empty">Sua carta</div>`;
  const cSlot = rv && o.oc ? cgCardHTML(o.oc, { size: "md", cls: "flip " + (o.res === "opp" ? "win" : o.res === "me" ? "lose" : ""), hl: o.att }) : !o.atkIsMe && o.A ? cgBackHTML("md") : `<div class="cg-empty">${opp}</div>`;
  let msg = "", acts = "";
  if (phase === "pick") {
    if (o.atkIsMe) msg = sel ? `Escolha o atributo da <b>${esc(sel.name)}</b> (toque na barra).` : "<b>Sua vez de atacar!</b> Escolha uma carta da sua mão.";
    else { msg = sel ? `Jogar <b>${esc(sel.name)}</b> contra ${pill}?` : `<b>${opp} atacou com ${pill}.</b> Escolha uma carta (a dele está virada).`; if (sel) acts = `<button class="btn" data-cg="confirm">Jogar esta carta</button>` }
  } else if (phase === "wait") msg = o.atkIsMe ? `Carta jogada! Aguardando <b>${opp}</b> responder…` : `Aguardando <b>${opp}</b> escolher o ataque…`;
  else if (rv) {
    const t = o.res === "me" ? "Você venceu a rodada! 🎉" : o.res === "opp" ? `${opp} venceu a rodada.` : "Empate!";
    msg = `<b>${t}</b> <span class="muted">${o.atkIsMe ? o.va : o.vd} × ${o.atkIsMe ? o.vd : o.va} em ${pill}</span>`;
    acts = `<button class="btn" data-cg="next">${pv.r >= H ? "Ver resultado" : "Próxima rodada"}</button>`;
  }
  const hand = S.hand.map(c => `<button class="cg-hc${sel === c ? " sel" : ""}" data-cg="card:${c.id}" ${phase !== "pick" ? "disabled" : ""} aria-label="Carta ${esc(c.name)}">${cgCardHTML(c, { size: "sm" })}</button>`).join("");
  pv.fx = "";
  let end = "";
  if (ended && pv.fin) {
    const f = pv.fin, t = f.left ? "Você desistiu" : f.oppLeft ? `${oppFull} desistiu 🏳️` : f.win ? (f.level === 3 ? "Vitória perfeita! 🏆" : "Você venceu! 🎉") : f.draw ? "Empate" : `${oppFull} venceu`;
    end = `<div class="ar-ov on cg-end"><div class="ar-box"><b>${t}</b><div class="ar-res"><div><span>Você</span><b>${S.sy}</b></div><div><span>${opp}</span><b>${S.so}</b></div></div>
      <p>${f.coins ? `+${f.coins} Enzola Coins (×${CG_PV_MULT} de duelo)` : f.capped ? "Limite de moedas de hoje atingido." : ""}</p>
      ${d.status === "cancelled" ? "" : `<button class="btn" data-cg="rematch">Desafiar de novo</button>`}<button class="btn ghost" data-cg="menu">Menu</button></div></div>`;
  }
  return `<div class="cg-game"><div class="ar-hud"><button class="btn ghost sm" data-cg="menu" aria-label="Voltar ao menu (o duelo continua)">← Menu</button>
      <div class="ar-sc"><span>Rodada</span><b>${Math.min(pv.r, H)}/${H}</b></div><div class="ar-sc cg-scr"><span>Você × ${opp}</span><b>${S.sy} × ${S.so}</b></div><button class="iconbtn" data-ar-how="cards" aria-label="Como jogar">❓</button></div>
    <div class="cg-cpuh" aria-label="Cartas de ${oppFull}">${Array(Math.max(0, S.oppLeft)).fill("<i></i>").join("")}<small>${opp} · ${S.oppLeft} carta${S.oppLeft === 1 ? "" : "s"}</small></div>
    <div class="cg-arena"><div class="cg-slot"><small class="cg-who">${opp}</small>${cSlot}</div><div class="cg-vs">VS</div><div class="cg-slot"><small class="cg-who you">Você</small>${ySlot}</div></div>
    <p class="cg-msg" aria-live="polite">${msg}</p><div class="cg-acts">${acts}</div>
    ${phase === "pick" || phase === "wait" ? `<div class="cg-hl">Sua mão</div><div class="cg-hand">${hand}</div>` : ""}
    ${!ended ? `<p class="ar-tip"><button class="link" data-cg="forfeit">Desistir do duelo</button></p>` : ""}${end}</div>`;
}
