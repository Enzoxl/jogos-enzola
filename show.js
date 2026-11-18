/* =====================================================================
   Show do Enzolão — quiz de 15 perguntas dentro do Enzolingo
   5 de inglês/espanhol, 5 sobre os jogos que você zerou e 5 de conhecimentos gerais.
   Acertou as 15? Ganha o avatar e o banner do hipopótamo apresentador.
   ===================================================================== */
const SH_TOTAL = 15, SH_TIME = 25;
const SH_GEN = [
  ["Qual é o maior planeta do Sistema Solar?", "Júpiter", ["Saturno", "Netuno", "Terra"]],
  ["Qual é a capital da Austrália?", "Camberra", ["Sydney", "Melbourne", "Perth"]],
  ["Quantos lados tem um hexágono?", "6", ["5", "7", "8"]],
  ["Quem pintou a Mona Lisa?", "Leonardo da Vinci", ["Michelangelo", "Rafael", "Van Gogh"]],
  ["Qual país venceu a Copa do Mundo de 2002?", "Brasil", ["Alemanha", "França", "Itália"]],
  ["Qual é o maior oceano do mundo?", "Pacífico", ["Atlântico", "Índico", "Ártico"]],
  ["Qual elemento químico tem o símbolo O?", "Oxigênio", ["Ouro", "Ósmio", "Ozônio"]],
  ["Quantos jogadores de cada time ficam em campo numa partida de futebol?", "11", ["9", "10", "12"]],
  ["Quem escreveu o romance “Dom Casmurro”?", "Machado de Assis", ["José de Alencar", "Clarice Lispector", "Monteiro Lobato"]],
  ["Qual é o rio mais extenso do Brasil?", "Amazonas", ["São Francisco", "Paraná", "Tocantins"]],
  ["Qual é a capital do Brasil?", "Brasília", ["Rio de Janeiro", "São Paulo", "Salvador"]],
  ["Quantos ossos tem o corpo de um adulto, aproximadamente?", "206", ["156", "256", "306"]],
  ["Qual planeta é conhecido como Planeta Vermelho?", "Marte", ["Vênus", "Mercúrio", "Júpiter"]],
  ["Qual é o animal terrestre mais rápido?", "Guepardo", ["Leão", "Cavalo", "Avestruz"]],
  ["Qual língua tem mais falantes nativos no mundo?", "Mandarim", ["Inglês", "Espanhol", "Hindi"]],
  ["Quem comandou a esquadra que chegou ao Brasil em 1500?", "Pedro Álvares Cabral", ["Cristóvão Colombo", "Vasco da Gama", "Américo Vespúcio"]],
  ["Qual é o menor país do mundo?", "Vaticano", ["Mônaco", "Malta", "San Marino"]],
  ["A quantos graus Celsius a água ferve ao nível do mar?", "100", ["90", "110", "120"]],
  ["Qual é o maior animal do planeta?", "Baleia-azul", ["Elefante-africano", "Girafa", "Tubarão-baleia"]],
  ["Qual destes animais é o parente vivo mais próximo do hipopótamo?", "Baleia", ["Porco", "Rinoceronte", "Elefante"]],
  ["Em que continente fica o Egito?", "África", ["Ásia", "Europa", "Oceania"]],
  ["Quem foi o primeiro ser humano a pisar na Lua?", "Neil Armstrong", ["Buzz Aldrin", "Yuri Gagarin", "John Glenn"]],
  ["Qual é o maior deserto quente do mundo?", "Saara", ["Gobi", "Atacama", "Kalahari"]],
  ["Quanto é 12 × 12?", "144", ["124", "134", "154"]],
  ["Qual é a raiz quadrada de 81?", "9", ["7", "8", "11"]],
  ["Qual gás as plantas absorvem na fotossíntese?", "Gás carbônico", ["Oxigênio", "Nitrogênio", "Hélio"]],
  ["Qual país tem o formato de uma bota no mapa?", "Itália", ["Grécia", "Espanha", "Portugal"]],
  ["Qual empresa criou o Mario?", "Nintendo", ["Sega", "Sony", "Atari"]],
  ["Qual é o nome do irmão do Mario?", "Luigi", ["Wario", "Toad", "Yoshi"]],
  ["Qual criatura do Minecraft explode quando chega perto do jogador?", "Creeper", ["Enderman", "Zumbi", "Esqueleto"]],
  ["O jogo “The Legend of Zelda” se passa em qual reino?", "Hyrule", ["Mordor", "Azeroth", "Tamriel"]],
  ["Qual é o nome do protagonista da série Zelda?", "Link", ["Zelda", "Ganon", "Navi"]],
  ["Qual mascote da Sega é um ouriço azul?", "Sonic", ["Tails", "Knuckles", "Crash"]],
  ["Em GTA San Andreas, qual cidade fictícia é a casa do CJ?", "Los Santos", ["Vice City", "Liberty City", "San Fierro"]],
  ["Qual console a Sony lançou em 1994?", "PlayStation", ["Dreamcast", "Nintendo 64", "Xbox"]],
  ["Que empresa criou o console Xbox?", "Microsoft", ["Sony", "Nintendo", "Sega"]],
  ["Qual Pokémon é o número 25 da Pokédex?", "Pikachu", ["Charmander", "Eevee", "Squirtle"]],
  ["Em Among Us, como se chamam os traidores?", "Impostores", ["Assassinos", "Espiões", "Sabotadores"]],
  ["Qual destes jogos foi criado pela FromSoftware?", "Elden Ring", ["Hades", "Celeste", "Cuphead"]],
  ["Em Fortnite, como se chama a moeda do jogo?", "V-Bucks", ["Robux", "Gemas", "Moedas"]],
  ["De que país era o criador do Tetris, Alexey Pajitnov?", "União Soviética (Rússia)", ["Japão", "Estados Unidos", "Polônia"]],
];
const SH_LANG = [
  ["🇺🇸", "Complete: “She ___ to school every day.”", "goes", ["go", "going", "gone"]],
  ["🇺🇸", "Complete: “I have lived here ___ 2020.”", "since", ["for", "from", "during"]],
  ["🇺🇸", "O que significa “although”?", "embora", ["durante", "enquanto", "através"]],
  ["🇺🇸", "Qual é o passado de “buy”?", "bought", ["buyed", "boughten", "buyt"]],
  ["🇺🇸", "“He hardly studies” quer dizer…", "Ele quase não estuda", ["Ele estuda muito", "Ele estuda com dificuldade", "Ele estuda sempre"]],
  ["🇺🇸", "Qual palavra é sinônimo de “huge”?", "enormous", ["tiny", "weak", "quick"]],
  ["🇺🇸", "Qual frase está correta?", "There are two apples.", ["There is two apples.", "They is two apples.", "There am two apples."]],
  ["🇺🇸", "“Library” em português é…", "biblioteca", ["livraria", "livro", "laboratório"]],
  ["🇺🇸", "“Actually” significa…", "na verdade", ["atualmente", "ativamente", "antigamente"]],
  ["🇺🇸", "Complete: “If I ___ rich, I would travel the world.”", "were", ["am", "will be", "be"]],
  ["🇺🇸", "Qual é o plural de “child”?", "children", ["childs", "childrens", "childes"]],
  ["🇺🇸", "“I used to play” significa…", "Eu costumava jogar", ["Eu estou usando para jogar", "Eu vou jogar", "Eu jogo agora"]],
  ["🇪🇸", "“Embarazada” em espanhol significa…", "grávida", ["envergonhada", "ocupada", "cansada"]],
  ["🇪🇸", "Complete: “Ayer ___ al cine.” (ir)", "fui", ["voy", "iré", "iría"]],
  ["🇪🇸", "“Exquisito” em espanhol significa…", "delicioso", ["esquisito", "exigente", "exótico"]],
  ["🇪🇸", "Como se diz “estou pronto” em espanhol?", "Estoy listo", ["Estoy pronto", "Estoy prontamente", "Estoy listado"]],
  ["🇪🇸", "“Hace frío” significa…", "Está frio", ["Está quente", "Está chovendo", "Está nublado"]],
  ["🇪🇸", "“Mucho gusto” usa-se para…", "conhecer alguém", ["despedir-se", "pedir comida", "agradecer"]],
  ["🇪🇸", "“El problema” é uma palavra…", "masculina", ["feminina", "neutra", "sempre plural"]],
  ["🇪🇸", "Complete: “Mañana ___ a trabajar.” (voy)", "voy", ["fui", "iba", "ido"]],
  ["🇪🇸", "Qual é a tradução de “obrigado” (dito por um homem)?", "gracias", ["por favor", "de nada", "perdón"]],
  ["🇪🇸", "“Hay un gato” significa…", "Há um gato", ["Ele é um gato", "Eu tenho um gato", "Ali vai um gato"]],
];
const SH_FAMOUS = ["The Witcher 3", "God of War", "Red Dead Redemption 2", "Hollow Knight", "Celeste", "Hades", "Elden Ring", "Dark Souls", "Cyberpunk 2077", "Portal 2", "Half-Life 2", "BioShock", "Mass Effect", "Dishonored", "Horizon Zero Dawn", "The Last of Us", "Resident Evil 4", "Doom Eternal", "Stardew Valley", "Cuphead", "Undertale", "Sekiro", "Control", "Death Stranding", "Persona 5", "Fallout 4", "Skyrim", "Terraria", "Limbo", "Inside"];
const SH_GENRE_PT = { Action: "Ação", Adventure: "Aventura", RPG: "RPG", Shooter: "Tiro", Strategy: "Estratégia", Puzzle: "Quebra-cabeça", Platformer: "Plataforma", Racing: "Corrida", Sports: "Esportes", Simulation: "Simulação", Fighting: "Luta", Indie: "Indie", Casual: "Casual", Family: "Família", Arcade: "Arcade" };
const SH_GENRES_ALL = ["Action", "Adventure", "RPG", "Shooter", "Strategy", "Puzzle", "Platformer", "Racing", "Sports", "Simulation", "Fighting", "Arcade"];

const shShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const shPick = (a, n) => shShuffle(a).slice(0, n);
const shMC = (cat, q, answer, wrong, extra = {}) => ({ cat, q, answer, options: shShuffle([answer, ...wrong.slice(0, 3)]), ...extra });

/* ---------- prêmios ---------- */
const shReward = () => (profile && profile.settings && profile.settings.rewards) || {};
function rewardsHas(k) { try { return !!(shReward()[k] || (user && (lsGet("rewards:" + user.id) || {})[k])) } catch (e) { return false } }
async function rewardsGive(k) {
  try { lsSet("rewards:" + user.id, { ...(lsGet("rewards:" + user.id) || {}), [k]: true }) } catch (e) { }
  if (profile) { const settings = { ...(profile.settings || {}), rewards: { ...shReward(), [k]: true } }; await saveProfile({ settings }) }
}
function rewardsHTML() {
  const k = "silvio", R = REWARDS[k], has = rewardsHas(k);
  return `<div class="rw-box"><div class="fld" style="margin-bottom:6px">Prêmios <span class="hint">· ganhos no Show do Enzolão (aba Idiomas)</span></div>
    <div class="rw-row${has ? "" : " locked"}"><img class="rw-av" src="${R.avatar}" alt="" width="56" height="56"><div class="rw-t"><b>${esc(R.name)}</b><span class="hint">${has ? "Avatar e banner desbloqueados." : "Acerte as 15 perguntas para desbloquear."}</span></div>
    ${has ? `<div class="rw-b"><button type="button" class="btn ghost sm" data-equip="avatar:${k}">Usar avatar</button><button type="button" class="btn ghost sm" data-equip="banner:${k}">Usar banner</button></div>` : `<span class="rw-lock">🔒</span>`}</div></div>`;
}

/* ---------- montar as perguntas ---------- */
function shGameQs() {
  const fin = games.filter(g => g.status === "Finalizado"), out = [];
  if (!fin.length) return out;
  const have = games.map(g => norm(g.name)), famous = SH_FAMOUS.filter(n => !have.some(h => h.length > 2 && (h.includes(norm(n)) || norm(n).includes(h))));
  const cat = "Os seus jogos";
  for (const g of fin) out.push(shMC(cat, "Qual destes jogos você já zerou?", g.name, shPick(famous, 3), { k: "fin:" + g.id }));
  const plats = new Set(fin.map(g => g.platform).filter(Boolean));
  for (const g of fin) {
    if (g.platform && plats.size >= 2) out.push(shMC(cat, `Em qual plataforma você jogou ${g.name}?`, g.platform, shPick(PLATS.filter(p => p !== g.platform), 3), { k: "plat:" + g.id }));
    if (g.exp) out.push(shMC(cat, `Que nota de experiência você deu para ${g.name}?`, g.exp, shPick(EXPS.filter(x => x !== g.exp), 3), { k: "exp:" + g.id }));
    const gens = String(g.genre || "").split(",").map(x => x.trim()).filter(Boolean);
    if (gens.length) { const c = gens[Math.floor(Math.random() * gens.length)], lab = x => SH_GENRE_PT[x] || x; out.push(shMC(cat, `Qual destes é um gênero de ${g.name}?`, lab(c), shPick(SH_GENRES_ALL.filter(x => !gens.includes(x)), 3).map(lab), { k: "gen:" + g.id })) }
    const y = parseInt(g.year, 10);
    if (y > 1970) { const ys = new Set([y]); for (const d of shShuffle([-3, -2, -1, 1, 2, 3, 4])) { if (ys.size < 4 && y + d <= new Date().getFullYear()) ys.add(y + d) } out.push(shMC(cat, `Em que ano ${g.name} foi lançado?`, String(y), [...ys].filter(v => v !== y).map(String), { k: "year:" + g.id })) }
  }
  const dated = fin.filter(g => parseInt(g.year, 10) > 1970);
  for (let n = 0; n < 3 && dated.length >= 2; n++) {
    const [a, b] = shPick(dated, 2); if (a.year === b.year) continue;
    const first = parseInt(a.year, 10) < parseInt(b.year, 10) ? a : b, second = first === a ? b : a;
    out.push(shMC(cat, "Qual destes jogos que você zerou foi lançado primeiro?", first.name, [second.name], { k: `cmp:${a.id}:${b.id}` }));
  }
  const mc = fin.filter(g => g.metacritic > 0);
  for (let n = 0; n < 2 && mc.length >= 2; n++) {
    const [a, b] = shPick(mc, 2); if (a.metacritic === b.metacritic) continue;
    const top = a.metacritic > b.metacritic ? a : b, low = top === a ? b : a;
    out.push(shMC(cat, "Qual destes tem a nota mais alta no Metacritic?", top.name, [low.name], { k: `mc:${a.id}:${b.id}` }));
  }
  // só uma pergunta de cada tipo+jogo, e no máximo 2 do mesmo tipo
  const seen = new Set(), kinds = {}, res = [];
  for (const q of shShuffle(out)) { const kind = q.k.split(":")[0]; if (seen.has(q.k) || (kinds[kind] || 0) >= 2) continue; seen.add(q.k); kinds[kind] = (kinds[kind] || 0) + 1; res.push(q) }
  return res;
}
function shLangQs() {
  const out = [];
  for (const [flag, q, a, w] of shShuffle(SH_LANG).slice(0, 3)) out.push(shMC(`${flag} Idiomas`, q, a, w));
  // duas de tradução tiradas das unidades mais difíceis do Enzolingo
  for (let n = 0; n < 2; n++) {
    const lang = Math.random() < .5 ? "en" : "es", t = lang === "en" ? 1 : 2, u = LG_UNITS[2 + Math.floor(Math.random() * (LG_UNITS.length - 2))];
    const [it, ...rest] = shShuffle(u.items); const wrong = rest.slice(0, 3).map(x => x[t]);
    out.push(shMC(`${lang === "en" ? "🇺🇸" : "🇪🇸"} Idiomas`, `Como se diz em ${lang === "en" ? "inglês" : "espanhol"}: “${it[0]}”`, it[t], wrong));
  }
  return out;
}
function shBuild() {
  const g = shGameQs().slice(0, 5), l = shLangQs();
  const gen = shShuffle(SH_GEN).map(([q, a, w]) => shMC("Conhecimentos gerais", q, a, w));
  const need = SH_TOTAL - l.length - g.length;
  return { qs: shShuffle([...l, ...g, ...gen.slice(0, need)]), games: g.length };
}

/* ---------- telas ---------- */
let sh = null;
function shBox() { let b = $("#sh-ovl"); if (!b) { b = document.createElement("div"); b.id = "sh-ovl"; b.className = "sh-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Show do Enzolão"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function shClose() { if (sh && sh.timer) clearInterval(sh.timer); sh = null; const b = $("#sh-ovl"); if (b) b.remove(); document.documentElement.classList.remove("lg-open"); if (tab === "idiomas") renderLingo() }
function shIntro() {
  const R = REWARDS.silvio, has = rewardsHas("silvio");
  shBox().innerHTML = `<div class="sh-in"><button class="iconbtn sh-x" data-sh-close aria-label="Fechar">${ic("x")}</button>
    <div class="sh-ban" style="background-image:url('${R.banner}')"></div>
    <h2>Show do Enzolão</h2>
    <p class="sh-sub">${SH_TOTAL} perguntas valendo um prêmio. ${SH_TIME} segundos para cada uma.</p>
    <ul class="sh-rules"><li><b>5</b> de inglês e espanhol</li><li><b>5</b> sobre os jogos que você zerou</li><li><b>5</b> de conhecimentos gerais</li></ul>
    <div class="sh-prize"><img src="${R.avatar}" alt="" width="72" height="72"><div><b>Prêmio: ${esc(R.name)}</b><span>${has ? "Você já ganhou! Pode jogar de novo por diversão." : "Acertou todas? Avatar e banner exclusivos para o seu perfil."}</span></div></div>
    <div class="sh-acts"><button class="btn sh-go" data-sh-start>${ic("play")}Começar o show</button>${has ? `<button class="btn ghost" data-sh-equip="both">Equipar o prêmio</button>` : ""}</div></div>`;
}
function shStart() {
  const { qs, games: ng } = shBuild();
  sh = { qs, i: 0, right: 0, wrong: 0, answered: false, games: ng, end: 0, timer: null, log: [] };
  shQ();
}
function shQ() {
  const s = sh, q = s.qs[s.i], box = shBox(); if (!q) return shEnd();
  s.answered = false; s.end = Date.now() + SH_TIME * 1000;
  clearInterval(s.timer); s.timer = setInterval(shTick, 100);
  box.innerHTML = `<div class="sh-q"><div class="sh-top"><button class="iconbtn sh-x" data-sh-close aria-label="Sair">${ic("x")}</button>
      <div class="sh-meter"><span>Pergunta ${s.i + 1}/${s.qs.length}</span><div class="sh-dots">${s.qs.map((_, i) => `<i class="${i < s.log.length ? (s.log[i] ? "ok" : "bad") : i === s.i ? "cur" : ""}"></i>`).join("")}</div></div>
      <span class="sh-clock" id="sh-clock">${SH_TIME}</span></div>
    <div class="sh-tbar"><i id="sh-tbar"></i></div>
    <div class="sh-body"><span class="sh-cat">${esc(q.cat)}</span><h2 class="sh-prompt">${esc(q.q)}</h2>
      <div class="sh-opts">${q.options.map((o, i) => `<button class="sh-opt" data-sh-opt="${i}"><kbd>${"ABCD"[i]}</kbd><span>${esc(o)}</span></button>`).join("")}</div>
      <div class="sh-fb" id="sh-fb" aria-live="polite"></div></div>
    <div class="sh-foot"><button class="btn" id="sh-next" hidden>Próxima</button></div></div>`;
}
function shTick() {
  if (!sh || sh.answered) return; const left = Math.max(0, sh.end - Date.now());
  const bar = $("#sh-tbar"); if (bar) bar.style.width = (left / (SH_TIME * 10)) + "%";
  const c = $("#sh-clock"); if (c) { c.textContent = Math.ceil(left / 1000); c.classList.toggle("low", left < 6000) }
  if (!left) shAnswer(-1);
}
function shAnswer(i) {
  const s = sh; if (!s || s.answered) return; s.answered = true; clearInterval(s.timer);
  const q = s.qs[s.i], ok = i >= 0 && q.options[i] === q.answer;
  if (ok) s.right++; else s.wrong++;
  s.log.push(ok);
  if (typeof lgBeep === "function") { try { lg = lg || lgLoad(); lgBeep(ok ? "ok" : "bad") } catch (e) { } }
  document.querySelectorAll(".sh-opt").forEach((b, j) => { b.disabled = true; if (q.options[j] === q.answer) b.classList.add("right"); else if (j === i) b.classList.add("wrong") });
  $("#sh-fb").innerHTML = ok ? `<b>Certa resposta!</b>` : `<b>${i < 0 ? "O tempo acabou." : "Ops, não foi dessa vez."}</b><span>Resposta: ${esc(q.answer)}</span>`;
  $("#sh-fb").className = "sh-fb " + (ok ? "ok" : "bad");
  const dots = document.querySelectorAll(".sh-dots i"); if (dots[s.i]) dots[s.i].className = ok ? "ok" : "bad";
  const n = $("#sh-next"); n.hidden = false; n.textContent = s.i + 1 >= s.qs.length ? "Ver resultado" : "Próxima"; n.focus({ preventScroll: true });
}
async function shEnd() {
  const s = sh; clearInterval(s.timer);
  const total = s.qs.length, perfect = s.right === total, first = perfect && !rewardsHas("silvio"), R = REWARDS.silvio;
  if (perfect) await rewardsGive("silvio");
  try { if (profile && user) { const old = (profile.settings && profile.settings.show) || {}, show = { best: Math.max(old.best || 0, s.right), plays: (old.plays || 0) + 1 }; if (!perfect) saveProfile({ settings: { ...(profile.settings || {}), show } }); else saveProfile({ settings: { ...(profile.settings || {}), rewards: { ...shReward(), silvio: true }, show } }) } } catch (e) { }
  const msg = perfect ? (first ? "Você acertou TUDO! O prêmio é seu." : "Gabaritou de novo! Que show.") : s.right >= total - 3 ? "Passou raspando! Tente de novo para levar o prêmio." : s.right >= total / 2 ? "Foi bem! Falta pouco para o prêmio." : "O hipopótamo apresentador acredita em você. Tente de novo!";
  shBox().innerHTML = `<div class="sh-end ${perfect ? "win" : ""}">
    ${perfect ? `<div class="lg-confetti" aria-hidden="true">${Array.from({ length: 34 }, () => `<i style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * .8).toFixed(2)}s;--c:${["#FFC800", "#E8505B", "#fff", "#2B7DE9"][Math.floor(Math.random() * 4)]}"></i>`).join("")}</div>` : ""}
    <div class="sh-score"><b>${s.right}</b><span>/ ${total}</span></div><h2>${perfect ? "Gabaritou!" : "Fim do show"}</h2><p>${msg}</p>
    ${s.games < 5 ? `<p class="sh-note">Dica: marque mais jogos como Finalizado para ganhar perguntas só sobre eles.</p>` : ""}
    ${perfect ? `<div class="sh-win"><img src="${R.avatar}" alt="" width="96" height="96"><div class="sh-winb" style="background-image:url('${R.banner}')"></div></div>
      <div class="sh-acts"><button class="btn sh-go" data-sh-equip="both">Equipar avatar e banner</button></div>` : ""}
    <div class="sh-acts"><button class="btn ghost" data-sh-start>Jogar de novo</button><button class="btn ghost" data-sh-close>Voltar ao Enzolingo</button></div></div>`;
}
async function shEquip(which) {
  const patch = {}; if (which === "both" || which === "avatar") patch.avatar = "reward:silvio"; if (which === "both" || which === "banner") patch.banner = "reward:silvio";
  if (await saveProfile(patch)) toast("Prêmio equipado no seu perfil! 🎤");
}
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (c("[data-show-open]")) { if (!user || !loaded) return; shIntro(); return }
  if (c("[data-sh-close]")) { shClose(); return }
  if (c("[data-sh-start]")) { shStart(); return }
  if (b = c("[data-sh-equip]")) { shEquip(b.dataset.shEquip); return }
  if (!sh) return;
  if (b = c("[data-sh-opt]")) { shAnswer(+b.dataset.shOpt); return }
  if (c("#sh-next")) { sh.i++; shQ(); return }
});
document.addEventListener("keydown", e => {
  if (!$("#sh-ovl")) return;
  if (e.key === "Escape") { e.preventDefault(); shClose(); return }
  if (!sh) return;
  if (!sh.answered && /^[1-4a-dA-D]$/.test(e.key)) { const i = /\d/.test(e.key) ? +e.key - 1 : "abcd".indexOf(e.key.toLowerCase()); if (sh.qs[sh.i].options[i] != null) { e.preventDefault(); shAnswer(i) } }
  else if (sh.answered && e.key === "Enter") { const n = $("#sh-next"); if (n && !n.hidden) { e.preventDefault(); n.click() } }
});
