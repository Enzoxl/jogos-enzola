/* =====================================================================
   Enzolingo — inglês e espanhol rapidinho, com o hipopótamo
   Funciona como o Duolingo, em versão simples:
   - trilha de unidades com lições curtas (8 perguntas), que vão destravando;
   - tipos de pergunta: escolher a tradução, montar a frase com blocos, ligar pares e ouvir;
   - 3 vidas por lição; errou, a pergunta volta no fim;
   - XP, meta diária e ofensiva (dias seguidos);
   - Desafio de 60 segundos para jogar rápido.
   O progresso fica no aparelho e também na conta (perfil → settings.lingo).
   ===================================================================== */

const LG_LANGS = {
  en: { name: "Inglês", flag: "🇺🇸", voice: "en-US", hello: "Bora treinar inglês?" },
  es: { name: "Espanhol", flag: "🇪🇸", voice: "es-ES", hello: "¿Vamos a practicar español?" },
};
// [português, inglês, espanhol]
const LG_UNITS = [
  {
    title: "Primeiros passos", desc: "Cumprimentos e apresentações", color: "#58CC02",
    items: [
      ["Olá!", "Hello!", "¡Hola!"], ["Bom dia.", "Good morning.", "Buenos días."], ["Boa noite.", "Good night.", "Buenas noches."],
      ["Obrigado.", "Thank you.", "Gracias."], ["Por favor.", "Please.", "Por favor."], ["Meu nome é Enzo.", "My name is Enzo.", "Me llamo Enzo."],
      ["Como você está?", "How are you?", "¿Cómo estás?"], ["Eu estou bem.", "I am fine.", "Estoy bien."], ["Tchau!", "Goodbye!", "¡Adiós!"],
      ["Prazer em conhecer você.", "Nice to meet you.", "Mucho gusto."], ["Eu sou do Brasil.", "I am from Brazil.", "Soy de Brasil."], ["Até amanhã.", "See you tomorrow.", "Hasta mañana."],
    ],
    words: [["sim", "yes", "sí"], ["não", "no", "no"], ["água", "water", "agua"], ["amigo", "friend", "amigo"], ["casa", "house", "casa"], ["dia", "day", "día"], ["noite", "night", "noche"], ["nome", "name", "nombre"]],
  },
  {
    title: "Modo gamer", desc: "Frases para jogar com os amigos", color: "#1CB0F6",
    items: [
      ["Eu jogo videogame.", "I play video games.", "Juego videojuegos."], ["Vamos jogar!", "Let's play!", "¡Vamos a jugar!"], ["Eu ganhei.", "I won.", "Gané."],
      ["Eu perdi.", "I lost.", "Perdí."], ["O jogo é divertido.", "The game is fun.", "El juego es divertido."], ["Salve o jogo.", "Save the game.", "Guarda el juego."],
      ["Meu amigo joga comigo.", "My friend plays with me.", "Mi amigo juega conmigo."], ["Esse chefe é muito difícil.", "This boss is very hard.", "Este jefe es muy difícil."],
      ["Eu preciso de mais vidas.", "I need more lives.", "Necesito más vidas."], ["Fim de jogo.", "Game over.", "Fin del juego."],
      ["Eu comprei um jogo novo.", "I bought a new game.", "Compré un juego nuevo."], ["Qual é o seu jogo favorito?", "What is your favorite game?", "¿Cuál es tu juego favorito?"],
    ],
    words: [["jogo", "game", "juego"], ["nível", "level", "nivel"], ["vida", "life", "vida"], ["vitória", "victory", "victoria"], ["chefe", "boss", "jefe"], ["tela", "screen", "pantalla"], ["jogador", "player", "jugador"], ["amigos", "friends", "amigos"]],
  },
  {
    title: "Dia a dia", desc: "Comida, tempo e lugares", color: "#FF9600",
    items: [
      ["Eu estou com fome.", "I am hungry.", "Tengo hambre."], ["Eu gosto de pizza.", "I like pizza.", "Me gusta la pizza."], ["Onde fica o banheiro?", "Where is the bathroom?", "¿Dónde está el baño?"],
      ["Que horas são?", "What time is it?", "¿Qué hora es?"], ["Eu estou cansado.", "I am tired.", "Estoy cansado."], ["Hoje é sexta-feira.", "Today is Friday.", "Hoy es viernes."],
      ["A água está fria.", "The water is cold.", "El agua está fría."], ["Eu tenho um cachorro.", "I have a dog.", "Tengo un perro."], ["Está chovendo.", "It is raining.", "Está lloviendo."],
      ["Eu moro em Belo Horizonte.", "I live in Belo Horizonte.", "Vivo en Belo Horizonte."], ["Quanto custa?", "How much is it?", "¿Cuánto cuesta?"], ["Eu amo música.", "I love music.", "Me encanta la música."],
    ],
    words: [["comida", "food", "comida"], ["pão", "bread", "pan"], ["leite", "milk", "leche"], ["gato", "cat", "gato"], ["cachorro", "dog", "perro"], ["escola", "school", "escuela"], ["livro", "book", "libro"], ["hoje", "today", "hoy"]],
  },
  {
    title: "Hipopótamo", desc: "O mascote do Enzola", color: "#CE82FF",
    items: [
      ["O hipopótamo está feliz.", "The hippo is happy.", "El hipopótamo está feliz."], ["O hipopótamo nada no rio.", "The hippo swims in the river.", "El hipopótamo nada en el río."],
      ["O hipopótamo é meu amigo.", "The hippo is my friend.", "El hipopótamo es mi amigo."], ["O hipopótamo come muito.", "The hippo eats a lot.", "El hipopótamo come mucho."],
      ["O hipopótamo está com sono.", "The hippo is sleepy.", "El hipopótamo tiene sueño."], ["Eu vejo um hipopótamo grande.", "I see a big hippo.", "Veo un hipopótamo grande."],
      ["O filhote é pequeno.", "The baby is small.", "El bebé es pequeño."], ["Os hipopótamos gostam de água.", "Hippos like water.", "A los hipopótamos les gusta el agua."],
      ["O hipopótamo dorme de dia.", "The hippo sleeps during the day.", "El hipopótamo duerme de día."], ["Ele tem uma boca grande.", "He has a big mouth.", "Tiene una boca grande."],
    ],
    words: [["rio", "river", "río"], ["grande", "big", "grande"], ["pequeno", "small", "pequeño"], ["feliz", "happy", "feliz"], ["nadar", "to swim", "nadar"], ["comer", "to eat", "comer"], ["dormir", "to sleep", "dormir"], ["boca", "mouth", "boca"]],
  },
  {
    title: "Viagem", desc: "Hotel, transporte e imprevistos", color: "#E8505B",
    items: [
      ["Eu gostaria de reservar um quarto.", "I would like to book a room.", "Me gustaría reservar una habitación."], ["A que horas sai o próximo trem?", "What time does the next train leave?", "¿A qué hora sale el próximo tren?"],
      ["Perdi minha mala no aeroporto.", "I lost my suitcase at the airport.", "Perdí mi maleta en el aeropuerto."], ["Você pode me ajudar, por favor?", "Could you help me, please?", "¿Podría ayudarme, por favor?"],
      ["Onde fica o ponto de ônibus mais próximo?", "Where is the nearest bus stop?", "¿Dónde está la parada de autobús más cercana?"], ["Eu estou procurando um bom restaurante.", "I am looking for a good restaurant.", "Estoy buscando un buen restaurante."],
      ["Vamos chegar atrasados se não corrermos.", "We will be late if we don't hurry.", "Vamos a llegar tarde si no nos damos prisa."], ["A conta, por favor.", "The check, please.", "La cuenta, por favor."],
      ["Eu nunca visitei essa cidade antes.", "I have never visited this city before.", "Nunca he visitado esta ciudad antes."], ["Posso pagar com cartão?", "Can I pay by card?", "¿Puedo pagar con tarjeta?"],
      ["O voo foi cancelado por causa do tempo.", "The flight was canceled because of the weather.", "El vuelo fue cancelado por el mal tiempo."], ["Quanto tempo leva para chegar lá?", "How long does it take to get there?", "¿Cuánto tiempo se tarda en llegar allí?"],
    ],
    words: [["passaporte", "passport", "pasaporte"], ["bilhete", "ticket", "billete"], ["mala", "suitcase", "maleta"], ["mapa", "map", "mapa"], ["estrada", "road", "carretera"], ["praia", "beach", "playa"], ["ponte", "bridge", "puente"], ["fronteira", "border", "frontera"]],
  },
  {
    title: "Trabalho e estudo", desc: "Reuniões, provas e prazos", color: "#2B7DE9",
    items: [
      ["Eu tenho uma reunião às três horas.", "I have a meeting at three o'clock.", "Tengo una reunión a las tres."], ["Preciso entregar o trabalho até sexta.", "I need to turn in the assignment by Friday.", "Necesito entregar el trabajo para el viernes."],
      ["Ela trabalha como engenheira.", "She works as an engineer.", "Ella trabaja como ingeniera."], ["Estou aprendendo a programar.", "I am learning to code.", "Estoy aprendiendo a programar."],
      ["Você pode repetir mais devagar?", "Can you repeat that more slowly?", "¿Puedes repetir más despacio?"], ["A prova foi mais difícil do que eu esperava.", "The test was harder than I expected.", "El examen fue más difícil de lo que esperaba."],
      ["Eu estudo inglês há dois anos.", "I have been studying English for two years.", "Llevo dos años estudiando inglés."], ["Ele sempre chega antes de todo mundo.", "He always arrives before everyone else.", "Siempre llega antes que todos."],
      ["Se eu tivesse mais tempo, eu estudaria mais.", "If I had more time, I would study more.", "Si tuviera más tiempo, estudiaría más."], ["Qual é a sua opinião sobre o projeto?", "What is your opinion about the project?", "¿Cuál es tu opinión sobre el proyecto?"],
      ["Eu me esqueci de enviar o e-mail.", "I forgot to send the email.", "Me olvidé de enviar el correo."], ["Estamos esperando a resposta deles.", "We are waiting for their answer.", "Estamos esperando su respuesta."],
    ],
    words: [["empresa", "company", "empresa"], ["prova", "test", "examen"], ["nota", "grade", "nota"], ["mesa", "desk", "escritorio"], ["prazo", "deadline", "plazo"], ["salário", "salary", "salario"], ["tarefa", "task", "tarea"], ["reunião", "meeting", "reunión"]],
  },
  {
    title: "Opiniões e sentimentos", desc: "Concordar, discordar e se expressar", color: "#14A38B",
    items: [
      ["Eu acho que você tem razão.", "I think you are right.", "Creo que tienes razón."], ["Não concordo com isso.", "I don't agree with that.", "No estoy de acuerdo con eso."],
      ["Estou muito animado para o fim de semana.", "I am very excited about the weekend.", "Estoy muy emocionado por el fin de semana."], ["Ele ficou chateado porque perdeu o jogo.", "He got upset because he lost the game.", "Se enojó porque perdió el partido."],
      ["Eu prefiro ficar em casa do que sair.", "I prefer staying home to going out.", "Prefiero quedarme en casa que salir."], ["Isso me deixa nervoso.", "That makes me nervous.", "Eso me pone nervioso."],
      ["Apesar de estar cansado, ele continuou jogando.", "Although he was tired, he kept playing.", "Aunque estaba cansado, siguió jugando."], ["Eu me sinto orgulhoso do que conquistei.", "I feel proud of what I have achieved.", "Me siento orgulloso de lo que he logrado."],
      ["Nunca é tarde para recomeçar.", "It is never too late to start over.", "Nunca es tarde para empezar de nuevo."], ["Ela parece estar preocupada.", "She seems to be worried.", "Ella parece estar preocupada."],
      ["Fico feliz que você tenha vindo.", "I am glad that you came.", "Me alegra que hayas venido."], ["Você não deveria desistir agora.", "You shouldn't give up now.", "No deberías rendirte ahora."],
    ],
    words: [["raiva", "anger", "rabia"], ["medo", "fear", "miedo"], ["alegria", "joy", "alegría"], ["orgulho", "pride", "orgullo"], ["dúvida", "doubt", "duda"], ["esperança", "hope", "esperanza"], ["coragem", "courage", "valentía"], ["tristeza", "sadness", "tristeza"]],
  },
  {
    title: "Tempos verbais", desc: "Passado, presente e futuro", color: "#8A4FFF",
    items: [
      ["Ontem eu joguei até tarde.", "Yesterday I played until late.", "Ayer jugué hasta tarde."], ["Amanhã vou terminar esse jogo.", "Tomorrow I am going to finish this game.", "Mañana voy a terminar este juego."],
      ["Quando eu era criança, eu morava no interior.", "When I was a kid, I lived in the countryside.", "Cuando era niño, vivía en el campo."], ["Eu já terminei a lição de casa.", "I have already finished my homework.", "Ya terminé la tarea."],
      ["Ela estava dormindo quando o telefone tocou.", "She was sleeping when the phone rang.", "Ella estaba durmiendo cuando sonó el teléfono."], ["Eu vou te ligar quando chegar.", "I will call you when I arrive.", "Te llamaré cuando llegue."],
      ["Nós nos conhecemos há cinco anos.", "We met five years ago.", "Nos conocimos hace cinco años."], ["Se chover, ficaremos em casa.", "If it rains, we will stay home.", "Si llueve, nos quedaremos en casa."],
      ["Eu nunca tinha visto algo assim.", "I had never seen anything like this.", "Nunca había visto algo así."], ["Ele disse que viria mais tarde.", "He said he would come later.", "Dijo que vendría más tarde."],
      ["O jogo foi lançado no ano passado.", "The game was released last year.", "El juego fue lanzado el año pasado."], ["Estarei jogando às oito da noite.", "I will be playing at eight p.m.", "Estaré jugando a las ocho de la noche."],
    ],
    words: [["ontem", "yesterday", "ayer"], ["amanhã", "tomorrow", "mañana"], ["sempre", "always", "siempre"], ["nunca", "never", "nunca"], ["já", "already", "ya"], ["ainda", "still", "todavía"], ["agora", "now", "ahora"], ["depois", "later", "después"]],
  },
];
const LG_LESSONS = 4;          // lições por unidade
const LG_Q = 10;               // perguntas por lição
const LG_LIVES = 3;
const LG_GOAL = 30;            // meta diária de XP
const LG_CHEERS = ["Mandou bem!", "Isso aí!", "Perfeito!", "Boa!", "Show!", "Arrasou!"];
const LG_IDX = { en: 1, es: 2 };

/* ---------- progresso ---------- */
const lgKey = () => "lingo:" + (user ? user.id : "anon");
const lgToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` };
function lgLoad() {
  const base = { lang: "en", xp: 0, streak: 0, last: "", day: "", dayXp: 0, done: {}, best: {}, sfx: true, goiabas: 0, skins: {}, skin: "classico", rev: 0, chests: 0, album: {}, cx: {}, free: { day: "", n: 0 } };
  const local = lsGet(lgKey()) || {}, remote = (profile && profile.settings && profile.settings.lingo) || {};
  const newer = (remote.rev || 0) !== (local.rev || 0) ? (remote.rev || 0) > (local.rev || 0) : (remote.xp || 0) > (local.xp || 0);
  const s = { ...base, ...(newer ? remote : local) }; s.skins = { ...(s.skins || {}) }; s.album = { ...(s.album || {}) }; s.cx = { ...(s.cx || {}) };
  if (s.day !== lgToday()) { s.day = lgToday(); s.dayXp = 0 }
  // ofensiva quebra se passou mais de um dia sem treinar
  if (s.last && s.last !== lgToday()) { const y = new Date(); y.setDate(y.getDate() - 1); const ys = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`; if (s.last !== ys) s.streak = 0 }
  return s;
}
let lg = null;
function lgSave(sync) {
  lg.rev = (lg.rev || 0) + 1;
  lsSet(lgKey(), lg);
  if (sync && user && profile && caps.v3) { profile.settings = { ...(profile.settings || {}), lingo: lg }; saveProfile({ settings: profile.settings }).catch(() => { }) }
}
const lgDoneKey = (u, l) => `${lg.lang}-${u}-${l}`;
function lgUnlocked(u, l) {
  if (u === 0 && l === 0) return true;
  const pu = l === 0 ? u - 1 : u, pl = l === 0 ? LG_LESSONS - 1 : l - 1;
  return !!lg.done[lgDoneKey(pu, pl)];
}

/* ---------- hipopótamo ---------- */
const lgHippo = (cls = "", say = "") => `<div class="lgh ${cls}">${say ? `<div class="lgh-say">${esc(say)}</div>` : ""}${typeof lgSkinImg === "function" ? lgSkinImg() : `<img class="lgh-img" src="hipopotamo.webp" alt="" draggable="false">`}</div>`;
function lgMood(mood, say) {
  const h = document.querySelector(".lg-lesson .lgh"); if (!h) return;
  h.classList.remove("happy", "sad", "cheer"); void h.offsetWidth; if (mood) h.classList.add(mood);
  const b = h.querySelector(".lgh-say"); if (b && say != null) b.textContent = say;
}

/* ---------- sons curtinhos (sem arquivos) ---------- */
function lgBeep(kind) {
  if (!lg.sfx) return;
  const ctx = typeof audioCtx === "function" ? audioCtx() : null; if (!ctx) return;
  try {
    if (ctx.state !== "running") ctx.resume();
    const notes = kind === "ok" ? [[660, 0], [880, .09]] : kind === "end" ? [[523, 0], [659, .1], [784, .2], [1047, .3]] : [[220, 0], [180, .12]];
    for (const [f, t] of notes) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = kind === "bad" ? "triangle" : "sine"; o.frequency.value = f;
      const t0 = ctx.currentTime + t; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.18, t0 + .015); g.gain.exponentialRampToValueAtTime(.001, t0 + .22);
      o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + .25);
    }
  } catch (e) { }
}
/* ---------- voz (leitura em voz alta pelo próprio aparelho) ---------- */
const lgCanSpeak = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
function lgSpeak(text, slow) {
  if (!lgCanSpeak()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[¡¿]/g, "")), lang = LG_LANGS[lg.lang].voice;
    u.lang = lang; u.rate = slow ? .6 : .92;
    const v = speechSynthesis.getVoices().find(v => v.lang.replace("_", "-").startsWith(lang)) || speechSynthesis.getVoices().find(v => v.lang.startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { }
}

/* ---------- montar perguntas ---------- */
const lgShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const lgTokens = s => s.replace(/[.,!?¡¿]/g, " ").split(/\s+/).filter(Boolean);
const lgNorm = s => norm(String(s).replace(/[¡¿]/g, ""));
function lgPool(units) { return units.flatMap(u => LG_UNITS[u].items) }
function lgMakeQ(type, item, pool, wordsPool) {
  const t = LG_IDX[lg.lang];
  const others = lgShuffle(pool.filter(x => x !== item));
  if (type === "mc") return { type, prompt: "Como se diz isto?", show: item[0], answer: item[t], options: lgShuffle([item[t], others[0][t], others[1][t]]), speak: item[t] };
  if (type === "mcr") return { type: "mc", prompt: "O que significa?", show: item[t], showLang: true, answer: item[0], options: lgShuffle([item[0], others[0][0], others[1][0]]), speak: item[t], speakFirst: true };
  if (type === "listen") return { type, prompt: "Toque no que você ouvir", answer: item[t], options: lgShuffle([item[t], others[0][t], others[1][t]]), speak: item[t] };
  if (type === "build") {
    const words = lgTokens(item[t]);
    const extra = lgShuffle(lgTokens(others.slice(0, 3).map(o => o[t]).join(" ")).filter(w => !words.map(lgNorm).includes(lgNorm(w)))).slice(0, Math.min(3, Math.max(2, 7 - words.length)));
    return { type, prompt: "Monte a tradução", show: item[0], answer: item[t], target: words, bank: lgShuffle([...words, ...extra]).map((w, i) => ({ w, i })), speak: item[t] };
  }
  if (type === "fill") {
    const parts = item[t].split(" "), okIdx = parts.map((w, i) => [w.replace(/[.,!?¡¿]/g, ""), i]).filter(([w, i]) => i > 0 && lgNorm(w).length >= 3);
    const [w, wi] = okIdx.length ? okIdx[Math.floor(Math.random() * okIdx.length)] : [parts[parts.length - 1].replace(/[.,!?¡¿]/g, ""), parts.length - 1];
    const blanked = parts.map((p, i) => i === wi ? p.replace(w, "_____") : p).join(" ");
    const pool2 = [...new Set(pool.filter(x => x !== item).flatMap(x => lgTokens(x[t])).filter(x => lgNorm(x).length >= 3 && lgNorm(x) !== lgNorm(w)).map(x => x.toLowerCase()))];
    const wrong = lgShuffle(pool2).slice(0, 2);
    return { type: "mc", prompt: "Complete a frase", show: blanked, sub: item[0], answer: w, options: lgShuffle([w, ...wrong]), speak: item[t] };
  }
  if (type === "type") return { type, prompt: `Escreva em ${LG_LANGS[lg.lang].name.toLowerCase()}`, show: item[0], answer: item[t], speak: item[t] };
  if (type === "match") {
    const pairs = lgShuffle(wordsPool).slice(0, 4);
    return { type, prompt: "Toque nos pares", pairs, left: lgShuffle(pairs.map((p, i) => ({ i, w: p[t] }))), right: lgShuffle(pairs.map((p, i) => ({ i, w: p[0] }))), answer: pairs.map(p => `${p[t]} = ${p[0]}`).join(" · ") };
  }
}
function lgLesson(u, l) {
  const items = LG_UNITS[u].items, n = items.length, size = Math.ceil(n / LG_LESSONS) + 2;
  const start = Math.min(n - size, Math.floor(l * (n - size) / Math.max(1, LG_LESSONS - 1)));
  const focus = lgShuffle(items.slice(Math.max(0, start), Math.max(0, start) + size));
  const pool = items;
  const listen = lgCanSpeak() ? "listen" : "build";
  const types = lgShuffle(u >= 4 ? ["fill", "fill", "type", "type", "build", "build", "mcr", listen, "type"]
    : u >= 2 ? ["mc", "mcr", "fill", "fill", "build", "build", "type", listen, "build"]
    : ["mc", "mc", "mcr", "fill", "build", "build", "build", listen, "type"]);
  const qs = types.map((ty, i) => lgMakeQ(ty, focus[i % focus.length], pool, LG_UNITS[u].words));
  qs.splice(2 + Math.floor(Math.random() * 4), 0, lgMakeQ("match", null, pool, LG_UNITS[u].words));
  return qs.slice(0, LG_Q);
}

/* ---------- tela inicial (trilha) ---------- */
function renderLingo0() {
  const el = $("#idiomas"); if (!el) return;
  lg = lgLoad();
  const L = LG_LANGS[lg.lang], pct = Math.min(100, Math.round(lg.dayXp / LG_GOAL * 100));
  let cur = null;
  const units = LG_UNITS.map((U, u) => {
    const nodes = Array.from({ length: LG_LESSONS }, (_, l) => {
      const done = !!lg.done[lgDoneKey(u, l)], open = lgUnlocked(u, l);
      const isCur = open && !done && !cur; if (isCur) cur = [u, l];
      const off = [0, 56, -56][l % 3];
      return `<div class="lg-node-w" style="--x:${off}px">
        ${isCur ? `<div class="lg-start">Começar</div>` : ""}
        <button class="lg-node ${done ? "done" : open ? "open" : "locked"}${isCur ? " cur" : ""}" style="--c:${U.color}" ${open ? `data-lg-start="${u}-${l}"` : "disabled"} aria-label="Unidade ${u + 1}, lição ${l + 1}${done ? ", concluída" : open ? "" : ", bloqueada"}">
          ${ic(done ? "check" : open ? "star" : "lock")}</button>
        ${isCur ? lgHippo("lg-path-hippo") : ""}</div>`;
    }).join("");
    return `<section class="lg-unit"><div class="lg-uhead" style="--c:${U.color}"><div><span>Unidade ${u + 1}</span><b>${esc(U.title)}</b><small>${esc(U.desc)}</small></div></div><div class="lg-path">${nodes}</div></section>`;
  }).join("");
  const allDone = !cur;
  const best = lg.best[lg.lang] || 0;
  el.innerHTML = `
    <div class="sec-head"><div><h2 class="h">Enzolingo</h2><p class="muted">Inglês e espanhol em lições de 2 minutos, com o hipopótamo.</p></div>
      <div class="lg-tools"><div class="lg-langs" role="radiogroup" aria-label="Idioma">${Object.entries(LG_LANGS).map(([k, v]) => `<button role="radio" aria-checked="${k === lg.lang}" data-lg-lang="${k}"><span class="lg-flag">${v.flag}</span>${v.name}</button>`).join("")}</div><button class="btn sh-btn lg-show" data-show-open aria-label="Show do Enzolão">🎤<span>Show do<br>Enzolão</span></button><button class="btn ghost lg-shop" data-lg-shop aria-label="Loja de skins" title="Loja de skins">${ic("store")}<span>Loja</span></button></div></div>
    <div class="lg-top">
      <div class="lg-hero">${lgHippo("idle", allDone ? "Você zerou a trilha! Treine no desafio." : L.hello)}</div>
      <div class="lg-stats">
        <div class="lg-stat"><span class="lg-ico fire">🔥</span><b>${lg.streak}</b><small>${lg.streak === 1 ? "dia seguido" : "dias seguidos"}</small></div>
        <div class="lg-stat"><span class="lg-ico">⚡</span><b>${lg.xp}</b><small>XP no total</small></div>
        <button class="lg-stat gb" data-lg-shop aria-label="Abrir a loja"><img class="gb-i big" src="loja/coin.webp" alt=""><b>${lg.goiabas || 0}</b><small>Enzola Coins</small></button>
        <div class="lg-stat goal"><div class="lg-ring" style="--p:${pct}"><span>${lg.dayXp}/${LG_GOAL}</span></div><small>Meta de hoje</small></div>
      </div>
      <div class="lg-quick">
        ${cur ? `<button class="btn lg-go" data-lg-start="${cur[0]}-${cur[1]}">${ic("play")}Continuar: ${esc(LG_UNITS[cur[0]].title)} · lição ${cur[1] + 1}</button>` : ""}
        <button class="btn ghost" data-lg-rush>⏱️ Desafio de 60 segundos${best ? ` · recorde ${best}` : ""}</button>
        <button class="link lg-sfx" data-lg-sfx aria-pressed="${lg.sfx}">${lg.sfx ? "🔊 Sons ligados" : "🔇 Sons desligados"}</button>
      </div>
    </div>
    <div class="lg-units">${units}</div>`;
}

/* ---------- lição ---------- */
let lgS = null;   // estado da lição aberta
function lgOpen(qs, meta) {
  lgS = { qs, i: 0, lives: meta.rush ? Infinity : LG_LIVES, right: 0, wrong: 0, again: new Set(), meta, t0: Date.now(), answered: false, pick: null, built: [], matched: new Set(), sel: null };
  const box = document.createElement("div"); box.className = "lg-lesson"; box.id = "lg-lesson"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", meta.rush ? "Desafio de 60 segundos" : "Lição");
  document.body.append(box); document.documentElement.classList.add("lg-open");
  if (meta.rush) { lgS.end = Date.now() + 60000; lgS.timer = setInterval(lgTick, 200) }
  lgRenderQ();
}
function lgClose() {
  if (lgS && lgS.timer) clearInterval(lgS.timer);
  try { speechSynthesis.cancel() } catch (e) { }
  const b = $("#lg-lesson"); if (b) b.remove(); document.documentElement.classList.remove("lg-open"); lgS = null;
  if (tab === "idiomas") renderLingo();
}
function lgTick() {
  if (!lgS) return; const left = Math.max(0, lgS.end - Date.now());
  const bar = $("#lg-prog i"); if (bar) bar.style.width = (left / 600) + "%";
  const t = $("#lg-clock"); if (t) t.textContent = Math.ceil(left / 1000) + "s";
  if (!left) { clearInterval(lgS.timer); lgS.timer = null; lgFinish() }
}
function lgHead() {
  const s = lgS, prog = s.meta.rush ? 100 : Math.round(s.i / (s.qs.length) * 100);
  return `<div class="lg-bar"><button class="iconbtn" data-lg-quit aria-label="Sair da lição">${ic("x")}</button>
    <div class="lg-prog" id="lg-prog"><i style="width:${prog}%"></i></div>
    ${s.meta.rush ? `<span class="lg-clock" id="lg-clock">60s</span><span class="lg-score">✔ ${s.right}</span>` : `<span class="lg-lives" aria-label="${s.lives} vidas">❤️ ${s.lives}</span>`}</div>`;
}
function lgRenderQ() {
  const s = lgS, q = s.qs[s.i], box = $("#lg-lesson"); if (!q || !box) return;
  s.answered = false; s.pick = null; s.built = []; s.matched = new Set(); s.sel = null;
  let body = "";
  const say = q.show ? `<div class="lg-q-say"><span>${esc(q.show)}</span>${q.speakFirst ? `<button class="lg-spk" data-lg-say aria-label="Ouvir">🔊</button>` : ""}</div>${q.sub ? `<div class="lg-sub">${esc(q.sub)}</div>` : ""}` : "";
  if (q.type === "mc" || q.type === "listen") {
    body = `${q.type === "listen" ? `<div class="lg-listen"><button class="lg-spk big" data-lg-say aria-label="Ouvir de novo">🔊</button><button class="lg-spk slow" data-lg-say="slow" aria-label="Ouvir devagar">🐢</button></div>` : ""}
      <div class="lg-opts">${q.options.map((o, i) => `<button class="lg-opt" data-lg-opt="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join("")}</div>`;
  } else if (q.type === "type") {
    body = `<input type="text" id="lg-in" class="lg-input" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Digite a tradução aqui" aria-label="Sua resposta">`;
  } else if (q.type === "build") {
    body = `<div class="lg-line" id="lg-line" aria-label="Sua resposta"></div><div class="lg-bank" id="lg-bank">${q.bank.map(b => `<button class="lg-tile" data-lg-tile="${b.i}">${esc(b.w)}</button>`).join("")}</div>`;
  } else if (q.type === "match") {
    body = `<div class="lg-match"><div>${q.left.map(x => `<button class="lg-tile m" data-lg-m="L${x.i}">${esc(x.w)}</button>`).join("")}</div><div>${q.right.map(x => `<button class="lg-tile m" data-lg-m="R${x.i}">${esc(x.w)}</button>`).join("")}</div></div>`;
  }
  box.innerHTML = `${lgHead()}
    <div class="lg-body"><h2 class="lg-prompt">${esc(q.prompt)}</h2>
      <div class="lg-q">${lgHippo("idle small")}${say}</div>
      ${body}</div>
    <div class="lg-foot${s.meta.rush ? " rush" : ""}" id="lg-foot"><div class="lg-fb" id="lg-fb">${s.meta.rush ? "<span>Toque na resposta certa. Vale tudo em 60 segundos!</span>" : ""}</div><button class="btn lg-check" id="lg-check" disabled${s.meta.rush ? " hidden" : ""}>${q.type === "match" ? "Ligue os pares" : "Verificar"}</button></div>`;
  if (q.type === "listen" || q.speakFirst) setTimeout(() => lgSpeak(q.speak), 250);
  const first = box.querySelector(".lg-opt, .lg-tile, .lg-input"); if (first) first.focus({ preventScroll: true });
}
function lgReady() { const b = $("#lg-check"); if (b) b.disabled = !(lgS.pick != null || (lgS.built.length && lgS.qs[lgS.i].type === "build") || (lgS.qs[lgS.i].type === "type" && $("#lg-in") && $("#lg-in").value.trim())) }
function lgCheck() {
  const s = lgS, q = s.qs[s.i]; if (!q || s.answered) return;
  let ok;
  if (q.type === "build") ok = lgNorm(s.built.map(i => q.bank.find(b => b.i === i).w).join(" ")) === lgNorm(q.target.join(" "));
  else if (q.type === "type") { const inp = $("#lg-in"); ok = lgNorm(inp.value) === lgNorm(q.answer); inp.disabled = true; inp.classList.add(ok ? "ok" : "bad") }
  else if (q.type === "match") ok = true;
  else ok = lgNorm(q.options[s.pick]) === lgNorm(q.answer);
  lgResult(ok);
}
function lgResult(ok) {
  const s = lgS, q = s.qs[s.i]; s.answered = true;
  const foot = $("#lg-foot"), fb = $("#lg-fb"), btn = $("#lg-check");
  foot.classList.add(ok ? "ok" : "bad");
  if (!s.meta.rush) { const bar = $("#lg-prog i"); if (bar) bar.style.width = Math.round((s.i + 1) / s.qs.length * 100) + "%" }
  if (ok) { s.right++; lgBeep("ok"); lgMood("happy", LG_CHEERS[Math.floor(Math.random() * LG_CHEERS.length)]) }
  else {
    s.wrong++; lgBeep("bad"); lgMood("sad", "Quase! Vamos de novo depois.");
    if (!s.meta.rush) { s.lives--; if (!s.again.has(q)) { s.again.add(q); s.qs.push(q) } }
  }
  fb.innerHTML = ok ? `<b>${LG_CHEERS[Math.floor(Math.random() * LG_CHEERS.length)]}</b>${q.type !== "match" && q.speak ? `<span>${esc(q.answer)}</span>` : ""}`
    : `<b>Resposta certa:</b><span>${esc(q.answer)}</span>`;
  if (q.speak && ok && !q.speakFirst && q.type !== "listen") lgSpeak(q.speak);
  if (s.meta.rush) { setTimeout(() => { if (lgS === s) lgNext() }, ok ? 450 : 1100); btn.hidden = true; return }
  btn.disabled = false; btn.textContent = "Continuar"; btn.focus({ preventScroll: true });
  const lv = document.querySelector(".lg-lives"); if (lv) lv.textContent = `❤️ ${s.lives}`;
}
function lgNext() {
  const s = lgS; if (!s) return;
  if (!s.meta.rush && s.lives <= 0) return lgFinish(true);
  s.i++;
  if (s.meta.rush && s.i >= s.qs.length) s.qs.push(...lgRushBatch());
  if (s.i >= s.qs.length) return lgFinish();
  lgRenderQ();
}
function lgFinish(failed) {
  const s = lgS, box = $("#lg-lesson"); if (!s || !box) return;
  if (s.timer) { clearInterval(s.timer); s.timer = null }
  const secs = Math.round((Date.now() - s.t0) / 1000), total = s.right + s.wrong, acc = total ? Math.round(s.right / total * 100) : 0;
  let xp = 0, msg = "", title = "";
  if (s.meta.rush) {
    xp = s.right; const best = lg.best[lg.lang] || 0, rec = s.right > best;
    if (rec) lg.best[lg.lang] = s.right;
    title = rec ? "Novo recorde!" : "Tempo esgotado!"; msg = `${s.right} ${s.right === 1 ? "acerto" : "acertos"} em 60 segundos.${rec ? "" : ` Seu recorde é ${best}.`}`;
  } else if (failed) {
    title = "Acabaram as vidas"; msg = "Sem problema: o hipopótamo também afunda às vezes. Tente de novo!"; xp = Math.min(5, s.right);
  } else {
    xp = 10 + (s.wrong ? 0 : 5); lg.done[lgDoneKey(s.meta.u, s.meta.l)] = true;
    title = s.wrong ? "Lição concluída!" : "Lição perfeita!"; msg = s.wrong ? "Continue assim para manter a ofensiva." : "Nenhum erro. +5 XP de bônus!";
  }
  let gb = 0;
  if (s.meta.rush) gb = s.right; else if (!failed) gb = 5 + (s.wrong ? 0 : 3);
  if (xp) {
    const was = lg.dayXp; lg.xp += xp; lg.dayXp += xp;
    if (lg.last !== lgToday()) { lg.streak = (lg.streak || 0) + 1; lg.last = lgToday() }
    if (was < LG_GOAL && lg.dayXp >= LG_GOAL) { msg += " Meta de hoje batida! 🎯 +10 Enzola Coins"; gb += 10; if (typeof chestGive === "function" && chestGive(1, null, "raro")) msg += " 🎁 E um baú raro!" }
    else if (!failed && !s.meta.rush && !s.wrong && Math.random() < .3 && typeof chestGive === "function" && chestGive(1)) msg += " 🎁 Lição perfeita rendeu um baú comum!"
  }
  if (gb) lg.goiabas = (lg.goiabas || 0) + gb;
  if (typeof grpLog === "function") grpLog(xp);
  lgSave(true);
  if (typeof rewardsCheck === "function") rewardsCheck();
  const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, "0");
  box.innerHTML = `<div class="lg-end ${failed ? "fail" : ""}">
    ${failed ? "" : `<div class="lg-confetti" aria-hidden="true">${Array.from({ length: 26 }, (_, i) => `<i style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * .8).toFixed(2)}s;--c:${["#58CC02", "#1CB0F6", "#FF9600", "#CE82FF", "#FF4B4B", "#FFC800"][i % 6]}"></i>`).join("")}</div>`}
    ${lgHippo(failed ? "sad" : "cheer")}
    <h2>${title}</h2><p>${msg}</p>
    <div class="lg-res">
      <div style="--c:#FFC800"><small>XP</small><b>+${xp}</b></div>
      ${gb ? `<div style="--c:#8BC34A"><small>Coins</small><b><img class="gb-i" src="loja/coin.webp" alt="">+${gb}</b></div>` : ""}
      <div style="--c:#58CC02"><small>Acertos</small><b>${acc}%</b></div>
      <div style="--c:#1CB0F6"><small>Tempo</small><b>${mm}:${ss}</b></div>
    </div>
    <div class="lg-end-a">${failed ? `<button class="btn ghost" data-lg-retry>Tentar de novo</button>` : ""}${s.meta.rush ? `<button class="btn ghost" data-lg-rush>Jogar de novo</button>` : ""}<button class="btn" data-lg-quit>Continuar</button></div></div>`;
  lgBeep(failed ? "bad" : "end");
  box.querySelector("[data-lg-quit]").focus({ preventScroll: true });
}
function lgRushBatch() {
  const units = LG_UNITS.map((_, u) => u).filter(u => lgUnlocked(u, 0));
  const pool = lgPool(units.length ? units : [0]);
  return lgShuffle(pool).slice(0, 10).map((it, i) => lgMakeQ(i % 4 === 3 ? "fill" : i % 3 === 2 ? "mcr" : "mc", it, pool, []));
}

/* ---------- toques e teclado ---------- */
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (b = c("[data-lg-lang]")) { lg.lang = b.dataset.lgLang; lgSave(false); renderLingo(); return }
  if (c("[data-lg-sfx]")) { lg.sfx = !lg.sfx; lgSave(false); renderLingo(); return }
  if (b = c("[data-lg-start]")) { const [u, l] = b.dataset.lgStart.split("-").map(Number); if (!lgUnlocked(u, l)) return; if (lgS) lgClose(); lgOpen(lgLesson(u, l), { u, l }); return }
  if (c("[data-lg-rush]")) { if (lgS) { const b2 = $("#lg-lesson"); if (b2) b2.remove(); lgS = null } lgOpen(lgRushBatch(), { rush: true }); return }
  if (!lgS) return;
  if (c("[data-lg-retry]")) { const m = lgS.meta; lgClose(); lgOpen(lgLesson(m.u, m.l), m); return }
  if (c("[data-lg-quit]")) { lgClose(); return }
  if (b = c("[data-lg-say]")) { lgSpeak(lgS.qs[lgS.i].speak, b.dataset.lgSay === "slow"); return }
  if (c("#lg-check")) { lgS.answered ? lgNext() : lgCheck(); return }
  if (lgS.answered) return;
  const q = lgS.qs[lgS.i];
  if (b = c("[data-lg-opt]")) {
    lgS.pick = +b.dataset.lgOpt; document.querySelectorAll(".lg-opt").forEach(o => o.classList.toggle("sel", o === b));
    if (q.type === "listen") lgSpeak(q.options[lgS.pick]);
    if (lgS.meta.rush) lgCheck(); else lgReady(); return;
  }
  if (b = c("[data-lg-tile]")) {
    const i = +b.dataset.lgTile, inLine = !!b.closest("#lg-line");
    if (inLine) { lgS.built = lgS.built.filter(x => x !== i); b.remove(); const t = document.querySelector(`#lg-bank [data-lg-tile="${i}"]`); if (t) t.classList.remove("used") }
    else if (!b.classList.contains("used")) { lgS.built.push(i); b.classList.add("used"); const t = b.cloneNode(true); t.classList.remove("used"); $("#lg-line").append(t) }
    lgReady(); return;
  }
  if (b = c("[data-lg-m]")) {
    if (b.classList.contains("ok")) return;
    const id = b.dataset.lgM;
    if (!lgS.sel || lgS.sel[0] === id[0]) { document.querySelectorAll(".lg-tile.m.sel").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); lgS.sel = id; if (id[0] === "L") lgSpeak(b.textContent); return }
    const other = document.querySelector(`[data-lg-m="${lgS.sel}"]`);
    if (lgS.sel.slice(1) === id.slice(1)) {
      [b, other].forEach(x => { x.classList.remove("sel"); x.classList.add("ok"); x.disabled = true }); lgS.matched.add(id.slice(1)); lgBeep("ok");
      if (lgS.matched.size === q.pairs.length) { lgS.pick = 0; lgResult(true) }
    } else {
      [b, other].forEach(x => { x.classList.remove("sel"); x.classList.add("no"); setTimeout(() => x.classList.remove("no"), 450) });
      lgS.wrong++; lgBeep("bad"); lgMood("sad", "Esse não combina!");
    }
    lgS.sel = null; return;
  }
});
document.addEventListener("keydown", e => {
  if (!lgS || !$("#lg-lesson")) return;
  if (e.key === "Escape") { e.preventDefault(); lgClose(); return }
  if (e.key === "Enter" && !e.target.closest("button:not(#lg-check)")) { const b = $("#lg-check"); if (b && !b.disabled && !b.hidden) { e.preventDefault(); b.click() } return }
  if (/^[1-3]$/.test(e.key) && !lgS.answered) { const o = document.querySelector(`[data-lg-opt="${+e.key - 1}"]`); if (o) { e.preventDefault(); o.click() } }
});
if (lgCanSpeak()) { try { speechSynthesis.getVoices(); speechSynthesis.addEventListener("voiceschanged", () => { }) } catch (e) { } }

document.addEventListener("input", e => { if (lgS && e.target.id === "lg-in") lgReady() });

/* aba Minigames: Enzolingo | Álbum */
function renderLingo() {
  const el = $("#idiomas"); if (!el) return;
  if (typeof rewardsCheck === "function") rewardsCheck();
  const seg = `<div class="mg-seg" role="tablist" aria-label="Minigames"><button role="tab" aria-selected="${mgTab === "game"}" data-mg="game">🦛 Enzolingo</button><button role="tab" aria-selected="${mgTab === "album"}" data-mg="album">📖 Álbum${typeof chestBadge === "function" && user && chestBadge() > 0 ? ` <span class="mg-dot">${chestBadge()}</span>` : ""}</button><button role="tab" aria-selected="${mgTab === "arcade"}" data-mg="arcade">🎮 Outros jogos</button></div>`;
  if (mgTab === "arcade" && typeof arcadeHTML === "function") { el.innerHTML = seg + arcadeHTML(); arcadeMount() }
  else if (mgTab === "album" && typeof albumHTML === "function") { lg = lgLoad(); el.innerHTML = seg + albumHTML() + (typeof certHTML === "function" ? certHTML(["album"]) : ""); if (typeof certPreview === "function") certPreview() }
  else { if (typeof snStop === "function") snStop(); renderLingo0(); el.insertAdjacentHTML("afterbegin", seg); if (!lgS && typeof certHTML === "function") { lg = lgLoad(); el.insertAdjacentHTML("beforeend", certHTML(["lingo"])); certPreview() } }
}
