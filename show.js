/* =====================================================================
   Show do Enzolão — quiz de 20 perguntas dentro do Enzolingo
   5 dos seus jogos · 3 gerais · 3 inglês · 2 espanhol · 3 hipopótamos · 2 Movimento Enzola · 2 finais (confusas de propósito)
   Acertou as 20? Ganha o avatar e o banner do hipopótamo apresentador.
   Áudios em premios/audio/ (se faltar algum, o show segue sem ele).
   ===================================================================== */
const SH_TOTAL = 20, SH_TIME = 25, SH_AUDIO = "premios/audio/";
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
const SH_HIPPO = [
  ["Qual destes animais é o parente vivo mais próximo do hipopótamo?", "Baleia", ["Porco", "Rinoceronte", "Elefante"]],
  ["“Hipopótamo” vem do grego e significa…", "cavalo do rio", ["boi d’água", "porco do pântano", "gigante da lama"]],
  ["Em qual continente vivem hipopótamos selvagens?", "África", ["Ásia", "América do Sul", "Oceania"]],
  ["A secreção avermelhada que cobre a pele do hipopótamo funciona como…", "protetor solar natural", ["sangue", "perfume", "veneno"]],
  ["Por cerca de quanto tempo um hipopótamo consegue prender a respiração debaixo d’água?", "uns 5 minutos", ["10 segundos", "30 minutos", "2 horas"]],
  ["Qual é a base da alimentação do hipopótamo?", "capim e plantas", ["peixes", "carne", "frutas do mar"]],
  ["Um hipopótamo macho adulto pesa, em média…", "mais de 1.500 kg", ["150 kg", "500 kg", "50 kg"]],
  ["Em qual país vive uma população de hipopótamos descendentes dos trazidos por Pablo Escobar?", "Colômbia", ["México", "Peru", "Argentina"]],
];
const SH_MOV = [
  ["Em que data foi criado o Movimento Enzola?", "13 de setembro de 2026", ["13 de setembro de 2025", "7 de setembro de 2026", "31 de outubro de 2026"]],
  ["Qual é o foco do Movimento Enzola?", "valorização dos hipopótamos", ["valorização das girafas", "preservação das capivaras", "campeonatos de games"]],
  ["Quem criou o Movimento Enzola?", "Enzola, o gênio contemporâneo", ["Silvio Santos", "Datena", "Neymar"]],
];
/* as 2 finais: sempre estas, sempre nesta ordem, de propósito sem sentido */
const SH_FINAL = [
  { cat: "Pergunta final", q: "qual o dia oficial que se comemora os batuques do cebolonha a morei", options: ["Datenas", "Posso perguntar", "13 tacarulhas", "32 de trezembro", "batuques"], labels: ["a", "b", "c", "d", "h"], answers: ["batuques"], answer: "batuques", fixed: true },
  { cat: "Pergunta final", q: "quantos tacarulhas são necessários pra preencher o rio bananada", options: ["neymar", "0,5 xilitros", "esfolamentos", "muitos cebolonhas", "alternativa b"], labels: ["a", "b", "g", "h", "e"], answers: ["0,5 xilitros", "alternativa b"], answer: "0,5 xilitros", fixed: true },
];
const SH_FAMOUS = ["The Witcher 3", "God of War", "Red Dead Redemption 2", "Hollow Knight", "Celeste", "Hades", "Elden Ring", "Dark Souls", "Cyberpunk 2077", "Portal 2", "Half-Life 2", "BioShock", "Mass Effect", "Dishonored", "Horizon Zero Dawn", "The Last of Us", "Resident Evil 4", "Doom Eternal", "Stardew Valley", "Cuphead", "Undertale", "Sekiro", "Control", "Death Stranding", "Persona 5", "Fallout 4", "Skyrim", "Terraria", "Limbo", "Inside"];
const SH_GENRE_PT = { Action: "Ação", Adventure: "Aventura", RPG: "RPG", Shooter: "Tiro", Strategy: "Estratégia", Puzzle: "Quebra-cabeça", Platformer: "Plataforma", Racing: "Corrida", Sports: "Esportes", Simulation: "Simulação", Fighting: "Luta", Indie: "Indie", Casual: "Casual", Family: "Família", Arcade: "Arcade" };
const SH_GENRES_ALL = ["Action", "Adventure", "RPG", "Shooter", "Strategy", "Puzzle", "Platformer", "Racing", "Sports", "Simulation", "Fighting", "Arcade"];

const shShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const shPick = (a, n) => shShuffle(a).slice(0, n);
const shMC = (cat, q, answer, wrong, extra = {}) => ({ cat, q, answer, answers: [answer], options: shShuffle([answer, ...wrong.slice(0, 3)]), ...extra });

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
    <div class="rw-row${has ? "" : " locked"}"><img class="rw-av" src="${R.avatar}" alt="" width="56" height="56"><div class="rw-t"><b>${esc(R.name)}</b><span class="hint">${has ? "Avatar e banner desbloqueados." : "Acerte as 20 perguntas para desbloquear."}</span></div>
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
    if (g.platform) out.push(shMC(cat, `Em qual plataforma você jogou ${g.name}?`, g.platform, shPick(PLATS.filter(p => p !== g.platform), 3), { k: "plat:" + g.id }));
    if (g.exp) out.push(shMC(cat, `Que nota de experiência você deu para ${g.name}?`, g.exp, shPick(EXPS.filter(x => x !== g.exp), 3), { k: "exp:" + g.id }));
    const gens = String(g.genre || "").split(",").map(x => x.trim()).filter(Boolean);
    if (gens.length) { const c = gens[Math.floor(Math.random() * gens.length)], lab = x => SH_GENRE_PT[x] || x; out.push(shMC(cat, `Qual destes é um gênero de ${g.name}?`, lab(c), shPick(SH_GENRES_ALL.filter(x => !gens.includes(x)), 3).map(lab), { k: "gen:" + g.id })) }
    out.push(shMC(cat, `Qual é o seu status em ${g.name}?`, "Finalizado", shPick(STATUS.filter(x => x !== "Finalizado"), 3), { k: "st:" + g.id }));
    if (g.rating != null && g.rating !== "" && !isNaN(g.rating)) { const r = Number(g.rating), v = new Set([r]); for (const d of shShuffle([-3, -2, -1, 1, 2, 3])) if (v.size < 4 && r + d >= 0 && r + d <= 10) v.add(r + d); out.push(shMC(cat, `Que nota você deu para ${g.name}?`, rateTxt(g), [...v].filter(x => x !== r).map(x => String(x).replace(".", ",")), { k: "rate:" + g.id })) }
    const hh = Math.round(Number(g.hours));
    if (hh > 0) { const v = new Set([hh]); for (const m of shShuffle([.5, .7, 1.4, 1.8, 2.5])) { const x = Math.max(1, Math.round(hh * m)); if (v.size < 4) v.add(x) } if (v.size >= 3) out.push(shMC(cat, `Quantas horas, aproximadamente, você tem em ${g.name}?`, `${hh} h`, [...v].filter(x => x !== hh).map(x => `${x} h`), { k: "hrs:" + g.id })) }
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
  { const n = fin.length, v = new Set([n]); for (const d of shShuffle([-3, -2, -1, 1, 2, 3, 4])) if (v.size < 4 && n + d >= 0) v.add(n + d); out.push(shMC(cat, "Quantos jogos você já finalizou na sua conta?", String(n), [...v].filter(x => x !== n).map(String), { k: "count:all" })) }
  // extras que só dependem dos jogos finalizados (garantem as 5 mesmo com poucos jogos)
  if (fin.length >= 3 && famous.length) out.push(shMC(cat, "Qual destes jogos você NÃO marcou como Finalizado?", shPick(famous, 1)[0], shPick(fin, 3).map(g => g.name), { k: "notfin" }));
  // só uma pergunta de cada tipo+jogo; primeiro no máximo 2 do mesmo tipo, depois completa sem esse limite
  const seen = new Set(), kinds = {}, res = [], rest = [];
  for (const q of shShuffle(out)) { const kind = q.k.split(":")[0]; if (seen.has(q.k)) continue; seen.add(q.k); if ((kinds[kind] || 0) >= 2) { rest.push(q); continue } kinds[kind] = (kinds[kind] || 0) + 1; res.push(q) }
  res.push(...rest);
  return res;
}
function shLangQs() {
  const pick = (f, n) => shShuffle(SH_LANG.filter(x => x[0] === f)).slice(0, n).map(([fl, q, a, w]) => shMC(`${fl} Idiomas`, q, a, w));
  return [...pick("🇺🇸", 3), ...pick("🇪🇸", 2)];
}
function shBuild() {
  const g = shGameQs().slice(0, 5), l = shLangQs();
  const hip = shShuffle(SH_HIPPO).slice(0, 3).map(([q, a, w]) => shMC("🦛 Hipopótamos", q, a, w));
  const mov = shShuffle(SH_MOV).slice(0, 2).map(([q, a, w]) => shMC("Movimento Enzola", q, a, w));
  const gen = shShuffle(SH_GEN).map(([q, a, w]) => shMC("Conhecimentos gerais", q, a, w));
  const need = SH_TOTAL - SH_FINAL.length - l.length - g.length - hip.length - mov.length;
  const main = shShuffle([...l, ...g, ...hip, ...mov, ...gen.slice(0, need)]);
  return { qs: [...main, ...SH_FINAL.map(q => ({ ...q }))], games: g.length };
}

/* ---------- áudio ---------- */
function shSnd(name, o = {}) {
  try {
    const a = new Audio(SH_AUDIO + name); a.volume = o.vol == null ? 1 : o.vol; a.loop = !!o.loop;
    let failed = false; const bad = () => { if (failed) return; failed = true; if (o.fb) o.fb() };
    a.addEventListener("error", bad); if (o.onend) a.addEventListener("ended", o.onend);
    const p = a.play(); if (p && p.catch) p.catch(bad);
    (sh ? (sh.snd = sh.snd || []) : (shLoose = shLoose || [])).push(a); return a;
  } catch (e) { if (o.fb) o.fb(); return null }
}
let shLoose = null;
function shStop(list) { (list || []).forEach(a => { try { a.pause(); a.currentTime = 0 } catch (e) { } }) }
/* música de fundo: começa ao abrir o show e só para ao sair */
let shBg = null;
function shMusic(vol) {
  try {
    if (!shBg) { shBg = new Audio(SH_AUDIO + "fundo.mp3"); shBg.loop = true; shBg.volume = vol; const p = shBg.play(); if (p && p.catch) p.catch(() => { }); return }
    shBg.volume = vol; if (shBg.paused) { const p = shBg.play(); if (p && p.catch) p.catch(() => { }) }
  } catch (e) { }
}
function shMusicOff() { if (shBg) { try { shBg.pause() } catch (e) { } shBg = null } }
function shStopAll() { if (sh) { shStop(sh.snd); sh.snd = [] } shStop(shLoose); shLoose = [] }
function shBeep(k) { if (typeof lgBeep === "function") { try { lg = lg || lgLoad(); lgBeep(k) } catch (e) { } } }

/* ---------- telas ---------- */
let sh = null;
const shLabel = (q, i) => String((q.labels || ["A", "B", "C", "D"])[i]).toUpperCase();
function shBox() { let b = $("#sh-ovl"); if (!b) { b = document.createElement("div"); b.id = "sh-ovl"; b.className = "sh-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Show do Enzolão"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function shClose() { if (sh) { if (sh.timer) clearInterval(sh.timer); if (sh.introT) clearTimeout(sh.introT) } shStopAll(); shMusicOff(); sh = null; const b = $("#sh-ovl"); if (b) b.remove(); document.documentElement.classList.remove("lg-open"); try { if (bgm.started && !bgm.userPaused) musicPlay() } catch (e) { } if (tab === "idiomas") renderLingo() }
function shIntro() {
  const R = REWARDS.silvio, has = rewardsHas("silvio");
  shBox().innerHTML = `<div class="sh-in"><button class="iconbtn sh-x" data-sh-close aria-label="Fechar">${ic("x")}</button>
    <div class="sh-ban" style="background-image:url('${R.banner}')"></div>
    <h2>Show do Enzolão</h2>
    <p class="sh-sub">${SH_TOTAL} perguntas valendo um prêmio. ${SH_TIME} segundos para cada uma. Escolha a alternativa e confirme.</p>
    <ul class="sh-rules"><li><b>5</b> sobre os jogos que você zerou</li><li><b>3</b> de conhecimentos gerais</li><li><b>3</b> de inglês e <b>2</b> de espanhol</li><li><b>3</b> sobre hipopótamos 🦛</li><li><b>2</b> sobre o Movimento Enzola</li><li><b>2</b> perguntas finais… diferentes</li></ul>
    <div class="sh-prize"><img src="${R.avatar}" alt="" width="72" height="72"><div><b>Prêmio: ${esc(R.name)}</b><span>${has ? "Você já ganhou! Pode jogar de novo por diversão." : "Acertou todas? Avatar e banner exclusivos para o seu perfil."}</span></div></div>
    <div class="sh-acts"><button class="btn sh-go" data-sh-start>${ic("play")}Começar o show</button>${has ? `<button class="btn ghost" data-sh-equip="both">Equipar o prêmio</button>` : ""}</div></div>`;
}
function shStart() {
  shStopAll();
  const { qs, games: ng } = shBuild();
  sh = { qs, i: 0, right: 0, wrong: 0, answered: false, sel: null, games: ng, end: 0, timer: null, log: [], snd: [], introT: null, playing: false };
  shEntrance();
}
/* entrada do hipopótamo apresentador, com a música ao fundo, antes das perguntas */
function shEntrance() {
  const s = sh, box = shBox(); shMusic(.06);
  box.innerHTML = `<div class="sh-stage"><button class="btn ghost sm sh-skip" data-sh-skip>Pular</button>
    <div class="sh-rays" aria-hidden="true"></div><div class="sh-curt l" aria-hidden="true"></div><div class="sh-curt r" aria-hidden="true"></div>
    <div class="sh-host"><img src="premios/apresentador.webp" alt="Hipopótamo apresentador" width="420" height="492"></div>
    <div class="sh-title"><span>Bem-vindo ao</span><b>Show do Enzolão</b></div></div>`;
  let done = false; const go = () => { if (done || sh !== s) return; done = true; clearTimeout(s.introT); shStop(s.snd); shQ() };
  s.skip = go;
  s.introT = setTimeout(go, 9000);
  const a = shSnd("tacarulhas.mp3", { vol: .9, onend: go, fb: () => { clearTimeout(s.introT); s.introT = setTimeout(go, 4500); shBeep("ok") } });
  if (a) a.addEventListener("loadedmetadata", () => { if (isFinite(a.duration)) { clearTimeout(s.introT); s.introT = setTimeout(go, Math.min(a.duration * 1000 + 400, 14000)) } });
}
function shQ() {
  const s = sh, q = s.qs[s.i], box = shBox(); if (!q) return shEnd();
  shStopAll(); shMusic(.22);
  s.answered = false; s.sel = null; s.end = Date.now() + SH_TIME * 1000;
  clearInterval(s.timer); s.timer = setInterval(shTick, 100);
  box.innerHTML = `<div class="sh-q"><div class="sh-top"><button class="iconbtn sh-x" data-sh-close aria-label="Sair">${ic("x")}</button>
      <div class="sh-meter"><span>Pergunta ${s.i + 1}/${s.qs.length}</span><div class="sh-dots">${s.qs.map((_, i) => `<i class="${i < s.log.length ? (s.log[i] ? "ok" : "bad") : i === s.i ? "cur" : ""}"></i>`).join("")}</div></div>
      <span class="sh-clock" id="sh-clock">${SH_TIME}</span></div>
    <div class="sh-tbar"><i id="sh-tbar"></i></div>
    <div class="sh-body"><span class="sh-cat">${esc(q.cat)}</span><h2 class="sh-prompt">${esc(q.q)}</h2>
      <div class="sh-opts">${q.options.map((o, i) => `<button class="sh-opt" data-sh-opt="${i}"><kbd>${shLabel(q, i)}</kbd><span>${esc(o)}</span></button>`).join("")}</div>
      <div class="sh-fb" id="sh-fb" aria-live="polite"></div></div>
    <div class="sh-foot"><button class="btn sh-go" id="sh-ok" data-sh-ok disabled>Confirmar</button><button class="btn" id="sh-next" hidden>Próxima</button></div></div>`;
}
function shTick() {
  if (!sh || sh.answered) return; const left = Math.max(0, sh.end - Date.now());
  const bar = $("#sh-tbar"); if (bar) bar.style.width = (left / (SH_TIME * 10)) + "%";
  const c = $("#sh-clock"); if (c) { c.textContent = Math.ceil(left / 1000); c.classList.toggle("low", left < 6000) }
  if (!left) shAnswer(-1);
}
/* escolher (ainda sem confirmar): toca um dos áudios de suspense */
function shSelect(i) {
  const s = sh; if (!s || s.answered || !s.qs[s.i].options[i]) return;
  s.sel = i;
  document.querySelectorAll(".sh-opt").forEach((b, j) => b.classList.toggle("sel", j === i));
  const ok = $("#sh-ok"); if (ok) { ok.disabled = false; ok.focus({ preventScroll: true }) }
  shStop(s.snd); s.snd = [];
  shSnd(Math.random() < .5 ? "possoperguntar.mp3" : "estacertodisso.mp3");
}
function shAnswer(i) {
  const s = sh; if (!s || s.answered) return; s.answered = true; clearInterval(s.timer);
  const q = s.qs[s.i], ok = i >= 0 && q.answers.includes(q.options[i]);
  if (ok) s.right++; else s.wrong++;
  s.log.push(ok);
  shStop(s.snd); s.snd = [];
  if (!ok) return shLose(q, i);
  shSnd("certa.resposta.mp3", { fb: () => shBeep("ok") });
  document.querySelectorAll(".sh-opt").forEach((b, j) => { b.disabled = true; b.classList.remove("sel"); if (q.answers.includes(q.options[j])) b.classList.add("right"); else if (j === i) b.classList.add("wrong") });
  $("#sh-fb").innerHTML = ok ? `<b>Certa resposta!</b>` : `<b>${i < 0 ? "O tempo acabou." : "Você errou!"}</b><span>Resposta: ${q.answers.map(esc).join(" ou ")}</span>`;
  $("#sh-fb").className = "sh-fb " + (ok ? "ok" : "bad");
  const dots = document.querySelectorAll(".sh-dots i"); if (dots[s.i]) dots[s.i].className = ok ? "ok" : "bad";
  const okb = $("#sh-ok"); if (okb) okb.hidden = true;
  const n = $("#sh-next"); n.hidden = false; n.textContent = s.i + 1 >= s.qs.length ? "Ver resultado" : "Próxima"; n.focus({ preventScroll: true });
}
/* errou: acabou o show. Tela própria, áudio e botão de reiniciar */
function shLose(q, i) {
  const s = sh; clearInterval(s.timer); shStopAll();
  shMusic(.1); shSnd("vcerrou.mp3", { fb: () => shBeep("bad") });
  try { if (profile && user) { const old = (profile.settings && profile.settings.show) || {}, show = { best: Math.max(old.best || 0, s.right), plays: (old.plays || 0) + 1 }; saveProfile({ settings: { ...(profile.settings || {}), show } }) } } catch (e) { }
  shBox().innerHTML = `<div class="sh-end lose"><div class="sh-sad" aria-hidden="true">😢</div><h2>Que pena, você errou!</h2>
    <p>${i < 0 ? "O tempo acabou na pergunta " : "Você caiu na pergunta "}${s.i + 1} de ${s.qs.length}.</p>
    <div class="sh-wrongq"><span>${esc(q.q)}</span><b>Resposta: ${q.answers.map(esc).join(" ou ")}</b></div>
    <div class="sh-score"><b>${s.right}</b><span>acertos</span></div>
    <div class="sh-acts"><button class="btn sh-go" data-sh-start>Reiniciar</button><button class="btn ghost" data-sh-close>Voltar ao Enzolingo</button></div></div>`;
}
async function shEnd() {
  const s = sh; clearInterval(s.timer); shStopAll();
  const total = s.qs.length, perfect = s.right === total, first = perfect && !rewardsHas("silvio"), R = REWARDS.silvio;
  shMusic(.12);
  if (perfect) { shSnd("maoe.mp3", { fb: () => shBeep("ok") }); await rewardsGive("silvio") }
  try { if (profile && user) { const old = (profile.settings && profile.settings.show) || {}, show = { best: Math.max(old.best || 0, s.right), plays: (old.plays || 0) + 1 }; if (!perfect) saveProfile({ settings: { ...(profile.settings || {}), show } }); else saveProfile({ settings: { ...(profile.settings || {}), rewards: { ...shReward(), silvio: true }, show } }) } } catch (e) { }
  const msg = perfect ? (first ? "Você acertou TUDO! O prêmio é seu." : "Gabaritou de novo! Que show.") : s.right >= total - 3 ? "Passou raspando! Tente de novo para levar o prêmio." : s.right >= total / 2 ? "Foi bem! Falta pouco para o prêmio." : "O hipopótamo apresentador acredita em você. Tente de novo!";
  const conf = n => Array.from({ length: n }, () => `<i style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 1.2).toFixed(2)}s;--c:${["#FFC800", "#E8505B", "#fff", "#2B7DE9"][Math.floor(Math.random() * 4)]}"></i>`).join("");
  shBox().innerHTML = `<div class="sh-end ${perfect ? "win" : ""}">
    ${perfect ? `<div class="sh-rays win" aria-hidden="true"></div><div class="lg-confetti" aria-hidden="true">${conf(60)}</div>` : ""}
    <div class="sh-score"><b>${s.right}</b><span>/ ${total}</span></div><h2>${perfect ? "Gabaritou!" : "Fim do show"}</h2><p>${msg}</p>
    ${s.games < 5 ? `<p class="sh-note">Dica: marque mais jogos como Finalizado para ganhar perguntas só sobre eles.</p>` : ""}
    ${perfect ? `<div class="sh-win"><div class="sh-medal"><img src="${R.avatar}" alt="" width="96" height="96"></div><div class="sh-winb" style="background-image:url('${R.banner}')"></div></div>
      <div class="sh-acts"><button class="btn sh-go" data-sh-equip="both">Equipar avatar e banner</button></div>` : ""}
    <div class="sh-acts"><button class="btn ghost" data-sh-start>Jogar de novo</button><button class="btn ghost" data-sh-close>Voltar ao Enzolingo</button></div></div>`;
}
async function shEquip(which) {
  const patch = {}; if (which === "both" || which === "avatar") patch.avatar = "reward:silvio"; if (which === "both" || which === "banner") patch.banner = "reward:silvio";
  if (await saveProfile(patch)) toast("Prêmio equipado no seu perfil! 🎤");
}
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (c("[data-show-open]")) { if (!user || !loaded) return; shIntro(); try { musicPause(false) } catch (e) { } shMusic(.3); return }
  if (c("[data-sh-close]")) { shClose(); return }
  if (c("[data-sh-start]")) { shStart(); return }
  if (b = c("[data-sh-equip]")) { shEquip(b.dataset.shEquip); return }
  if (!sh) return;
  if (c("[data-sh-skip]")) { if (sh.skip) sh.skip(); return }
  if (b = c("[data-sh-opt]")) { shSelect(+b.dataset.shOpt); return }
  if (c("#sh-ok")) { if (sh.sel != null) shAnswer(sh.sel); return }
  if (c("#sh-next")) { sh.i++; shQ(); return }
});
document.addEventListener("keydown", e => {
  if (!$("#sh-ovl")) return;
  if (e.key === "Escape") { e.preventDefault(); shClose(); return }
  if (!sh || !sh.qs[sh.i]) return;
  const q = sh.qs[sh.i];
  if (!sh.answered && e.key.length === 1 && /[0-9a-z]/i.test(e.key)) {
    let i = /\d/.test(e.key) ? +e.key - 1 : q.options.findIndex((_, j) => shLabel(q, j) === e.key.toUpperCase());
    if (q.options[i] != null) { e.preventDefault(); shSelect(i) }
  } else if (e.key === "Enter") {
    if (!sh.answered && sh.sel != null) { e.preventDefault(); shAnswer(sh.sel) }
    else if (sh.answered) { const n = $("#sh-next"); if (n && !n.hidden) { e.preventDefault(); n.click() } }
  }
});
