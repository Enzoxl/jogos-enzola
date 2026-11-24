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
// LG_UNITS (o banco de frases) fica em lingo-banco.js
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
  const base = { lang: "en", xp: 0, streak: 0, last: "", day: "", dayXp: 0, done: {}, best: {}, sfx: true, goiabas: 0, skins: {}, skin: "classico", rev: 0, chests: 0, album: {}, cx: {}, xf: {}, free: { day: "", n: 0 } };
  const local = lsGet(lgKey()) || {}, remote = (profile && profile.settings && profile.settings.lingo) || {};
  const newer = (remote.rev || 0) !== (local.rev || 0) ? (remote.rev || 0) > (local.rev || 0) : (remote.xp || 0) > (local.xp || 0);
  const s = { ...base, ...(newer ? remote : local) }; s.skins = { ...(s.skins || {}) }; s.album = { ...(s.album || {}) }; s.cx = { ...(s.cx || {}) }; s.xf = { ...(s.xf || {}) };
  if (s.skins.oculos) { s.skins.pirata = s.skins.oculos; delete s.skins.oculos; } if (s.skin === "oculos") s.skin = "pirata";
  if (s.day !== lgToday()) { s.day = lgToday(); s.dayXp = 0 }
  if (typeof walletMirror === "function") walletMirror(s);   // moedas, skins, fotos e baús vêm do servidor
  // ofensiva quebra se passou mais de um dia sem treinar
  if (s.last && s.last !== lgToday()) { const y = new Date(); y.setDate(y.getDate() - 1); const ys = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`; if (s.last !== ys) s.streak = 0 }
  return s;
}
let lg = null;
function lgSave(sync) {
  lg.rev = (lg.rev || 0) + 1;
  lsSet(lgKey(), lg);
  if (user && profile) profile.settings = { ...(profile.settings || {}), lingo: { ...lg } };   // o perfil sempre leva o progresso mais novo deste aparelho
  if (sync && user && profile && caps.v3) { clearTimeout(lgSave.t); lgSave.t = setTimeout(() => saveProfile({}), 600) }   // várias mudanças seguidas viram um salvamento só
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
// "a|b": a primeira é a forma principal (blocos, alternativas, voz); todas valem na digitação
const lgMain = s => String(s).split("|")[0];
const lgAlts = s => String(s).split("|");
const lgShuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const lgTokens = s => s.replace(/[.,!?¡¿]/g, " ").split(/\s+/).filter(Boolean);
const lgNorm = s => norm(String(s).replace(/[¡¿]/g, "").replace(/['’`´]/g, ""));   // "I'm" = "Im" (apóstrofo não conta)
function lgPool(units) { return units.flatMap(u => LG_UNITS[u].items) }
/* ---------- dificuldade ----------
   d = unidade + lição/4 (0 a ~14). Quanto maior: mais digitação e ditado, 4 alternativas parecidas,
   mais blocos-armadilha (inclusive formas quase iguais: was/were, es/está…) e lições um pouco mais longas. */
const lgLevel = (u, l) => u + l / LG_LESSONS;
const LG_TWINS = {
  en: { is: "are", are: "is", was: "were", were: "was", has: "have", have: "has", do: "does", does: "do", did: "does", a: "an", an: "a", the: "a", would: "will", will: "would", had: "has", can: "could", could: "can", "don't": "doesn't", "doesn't": "don't", me: "my", my: "me", to: "for", for: "to", in: "on", on: "in", at: "in", been: "being", than: "then", then: "than", their: "there", there: "their", your: "you're", its: "it's", "it's": "its", should: "would", if: "when", when: "if", since: "for", ago: "before" },
  es: { es: "está", está: "es", estoy: "soy", soy: "estoy", fue: "era", era: "fue", ha: "he", he: "ha", el: "la", la: "el", un: "una", una: "un", que: "qué", habría: "había", había: "habría", por: "para", para: "por", me: "mi", mi: "me", tu: "tú", tú: "tu", si: "sí", sí: "si", hay: "ha", se: "sé", de: "del", del: "de", muy: "mucho", mucho: "muy", pero: "sino", sino: "pero", aunque: "porque", porque: "aunque" },
};
// forma "quase certa" de uma palavra (para blocos e alternativas de completar)
function lgTwin(w) {
  const L = lg.lang, low = w.toLowerCase(), T = LG_TWINS[L] || {};
  if (T[low]) return w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() ? T[low][0].toUpperCase() + T[low].slice(1) : T[low];
  if (L === "es") { if (/[aeiou]s$/.test(low) && low.length > 4) return w.slice(0, -1); if (/a$/.test(low) && low.length > 4) return w.slice(0, -1) + "e"; if (/e$/.test(low) && low.length > 4) return w.slice(0, -1) + "a"; if (/ó$/.test(low)) return w.slice(0, -1) + "aba" }
  if (L === "en") { if (/ed$/.test(low) && low.length > 4) return w.slice(0, -2); if (/[^su]s$/.test(low) && low.length > 4 && !/(ous|ics|ness|less|this|his|was|has|is)$/.test(low)) return w.slice(0, -1) }
  return null;
}
function lgMakeQ(type, item, pool, wordsPool, d = 0) {
  const t = LG_IDX[lg.lang], main = it => lgMain(it[t]);
  const nOpt = d >= 5 ? 4 : 3;
  // alternativas: no começo, qualquer frase; depois, as de tamanho parecido (mais difíceis de eliminar)
  let others = item ? lgShuffle(pool.filter(x => x !== item && main(x) !== main(item))) : [];
  if (d >= 4 && item) { const len = lgTokens(main(item)).length; others = others.sort((a, b) => Math.abs(lgTokens(main(a)).length - len) - Math.abs(lgTokens(main(b)).length - len)).slice(0, 8); others = lgShuffle(others) }
  const ans = item ? main(item) : "";
  if (type === "mc") return { type, prompt: "Como se diz isto?", show: item[0], answer: ans, options: lgShuffle([ans, ...others.slice(0, nOpt - 1).map(main)]), speak: ans };
  if (type === "mcr") return { type: "mc", prompt: "O que significa?", show: ans, showLang: true, answer: item[0], options: lgShuffle([item[0], ...others.slice(0, nOpt - 1).map(o => o[0])]), speak: ans, speakFirst: true };
  if (type === "listen") return { type, prompt: "Toque no que você ouvir", answer: ans, options: lgShuffle([ans, ...others.slice(0, nOpt - 1).map(main)]), speak: ans };
  if (type === "build") {
    const words = lgTokens(ans), nx = d < 2 ? 2 : d < 5 ? 3 : d < 9 ? 4 : 5;
    const twins = d >= 6 ? lgShuffle(words.map(lgTwin).filter(w => w && !words.map(lgNorm).includes(lgNorm(w)))).slice(0, d >= 9 ? 3 : 2) : [];
    const extra = lgShuffle(lgTokens(others.slice(0, 4).map(main).join(" ")).filter(w => !words.map(lgNorm).includes(lgNorm(w)) && !twins.map(lgNorm).includes(lgNorm(w)))).slice(0, Math.max(1, nx - twins.length));
    return { type, prompt: "Monte a tradução", show: item[0], answer: ans, target: words, bank: lgShuffle([...words, ...twins, ...extra]).map((w, i) => ({ w, i })), speak: ans };
  }
  if (type === "fill") {
    const parts = ans.split(" "), okIdx = parts.map((w, i) => [w.replace(/[.,!?¡¿;]/g, ""), i]).filter(([w, i]) => (i > 0 || d >= 6) && lgNorm(w).length >= (d >= 6 ? 2 : 3));
    // nos níveis altos, prefere lacunas em palavras que têm "gêmea" (verbo/artigo/preposição): aí a gramática decide
    const pickable = d >= 6 ? okIdx.filter(([w]) => lgTwin(w)) : [];
    const src = pickable.length ? pickable : okIdx;
    const [w, wi] = src.length ? src[Math.floor(Math.random() * src.length)] : [parts[parts.length - 1].replace(/[.,!?¡¿;]/g, ""), parts.length - 1];
    const blanked = parts.map((p, i) => i === wi ? p.replace(w, "_____") : p).join(" ");
    const pool2 = [...new Set(pool.filter(x => x !== item).flatMap(x => lgTokens(main(x))).filter(x => lgNorm(x).length >= 3 && lgNorm(x) !== lgNorm(w)).map(x => x.toLowerCase()))];
    const tw = d >= 6 ? lgTwin(w) : null, wrong = [...(tw && lgNorm(tw) !== lgNorm(w) ? [tw] : []), ...lgShuffle(pool2)].filter((x, i, a) => a.findIndex(y => lgNorm(y) === lgNorm(x)) === i).slice(0, nOpt - 1);
    return { type: "mc", prompt: "Complete a frase", show: blanked, sub: d >= 9 ? "" : item[0], answer: w, options: lgShuffle([w, ...wrong]), speak: ans };
  }
  if (type === "type") return { type, prompt: `Escreva em ${LG_LANGS[lg.lang].name.toLowerCase()}`, show: item[0], answer: ans, alts: lgAlts(item[t]), speak: ans };
  if (type === "dict") {
    if (!lgCanSpeak()) return lgMakeQ("type", item, pool, wordsPool, d);
    return { type: "type", dict: true, prompt: "Escreva o que você ouvir", answer: ans, alts: lgAlts(item[t]), speak: ans, speakFirst: true, hint: d < 10 ? item[0] : "" };
  }
  if (type === "match") {
    const pairs = lgShuffle(wordsPool).slice(0, d >= 4 ? 5 : 4);
    return { type, prompt: "Toque nos pares", pairs, left: lgShuffle(pairs.map((p, i) => ({ i, w: p[t] }))), right: lgShuffle(pairs.map((p, i) => ({ i, w: p[0] }))), answer: pairs.map(p => `${p[t]} = ${p[0]}`).join(" · ") };
  }
}
// quais tipos de pergunta entram em cada faixa de dificuldade (sem contar o "ligar pares")
const LG_MIX = [
  [0, ["mc", "mc", "mcr", "fill", "build", "build", "build", "listen", "type"]],
  [2, ["mc", "mcr", "fill", "fill", "build", "build", "build", "listen", "type", "type"]],
  [4, ["mcr", "fill", "fill", "build", "build", "type", "type", "type", "listen", "dict"]],
  [7, ["mcr", "fill", "fill", "build", "build", "type", "type", "type", "type", "dict", "dict"]],
  [10, ["fill", "fill", "build", "build", "type", "type", "type", "type", "type", "dict", "dict"]],
];
function lgLesson(u, l) {
  const d = lgLevel(u, l), items = LG_UNITS[u].items, n = items.length;
  // cada lição foca num trecho diferente da unidade (com sobreposição) e, depois da 1ª unidade, revisa as anteriores
  const size = Math.min(n, Math.max(7, Math.ceil(n / LG_LESSONS) + 4));
  const start = Math.floor(l * (n - size) / Math.max(1, LG_LESSONS - 1));
  if (!lgLesson.id) { lgLesson.id = new Map(); LG_UNITS.forEach((U, uu) => U.items.forEach((it, i) => lgLesson.id.set(it, uu + "." + i))) }
  const seen = lg.seen || {}, key = it => lg.lang + lgLesson.id.get(it);   // ex.: "en3.12" = inglês, unidade 4, frase 13
  // dentro do trecho, as frases menos vistas vêm primeiro (para não repetir sempre as mesmas)
  let focus = lgShuffle(items.slice(start, start + size)).sort((a, b) => (seen[key(a)] || 0) - (seen[key(b)] || 0));
  const prev = LG_UNITS.slice(Math.max(0, u - 3), u).flatMap(x => x.items);
  const review = prev.length ? lgShuffle(prev).sort((a, b) => (seen[key(a)] || 0) - (seen[key(b)] || 0)).slice(0, d >= 6 ? 3 : 2) : [];
  const mix = LG_MIX.filter(([min]) => d >= min).pop()[1];
  const types = lgShuffle(mix.map(x => x === "listen" && !lgCanSpeak() ? "build" : x));
  const list = [...focus, ...review], pool = [...items, ...review];
  const qs = types.map((ty, i) => lgMakeQ(ty, i >= types.length - review.length && review.length ? review[i % review.length] : list[i % focus.length], pool, LG_UNITS[u].words, d));
  if (d < 7) qs.splice(2 + Math.floor(Math.random() * 4), 0, lgMakeQ("match", null, pool, LG_UNITS[u].words, d));
  for (const it of [...focus.slice(0, types.length), ...review]) seen[key(it)] = (seen[key(it)] || 0) + 1;
  for (const k of Object.keys(seen)) if (!/^(en|es)\d+\.\d+$/.test(k)) delete seen[k];
  lg.seen = seen;
  return qs.slice(0, LG_Q + (d >= 4 ? 1 : 0) + (d >= 8 ? 1 : 0));
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
    body = `${q.dict ? `<div class="lg-listen"><button class="lg-spk big" data-lg-say aria-label="Ouvir de novo">🔊</button><button class="lg-spk slow" data-lg-say="slow" aria-label="Ouvir devagar">🐢</button></div>${q.hint ? `<div class="lg-sub">Dica: ${esc(q.hint)}</div>` : ""}` : ""}<input type="text" id="lg-in" class="lg-input" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="${q.dict ? "Digite o que você ouviu" : "Digite a tradução aqui"}" aria-label="Sua resposta">`;
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
  else if (q.type === "type") { const inp = $("#lg-in"), v = lgNorm(inp.value); ok = (q.alts || [q.answer]).some(a => lgNorm(a) === v); inp.disabled = true; inp.classList.add(ok ? "ok" : "bad") }
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
    if (was < LG_GOAL && lg.dayXp >= LG_GOAL) { msg += " Meta de hoje batida! 🎯 +10 Enzola Coins"; gb += 10; if (typeof chestGive === "function" && chestGive(1, null, "raro", "lingo_goal")) msg += " 🎁 E um baú raro!" }
    else if (!failed && !s.meta.rush && !s.wrong && Math.random() < .3 && typeof chestGive === "function" && chestGive(1, null, "comum", "lingo_perfect")) msg += " 🎁 Lição perfeita rendeu um baú comum!"
  }
  if (gb) lgAward(gb, "lingo", { group: false });   // pontos de grupo já contam pelo XP abaixo
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
  const units = LG_UNITS.map((_, u) => u).filter(u => lgUnlocked(u, 0)), top = units.length ? units[units.length - 1] : 0;
  // o desafio puxa mais frases das unidades recentes e fica mais difícil conforme você avança na trilha
  const pool = lgPool(units.length ? units : [0]), recent = lgPool(units.slice(-3).length ? units.slice(-3) : [0]);
  const pick = lgShuffle([...lgShuffle(recent).slice(0, 7), ...lgShuffle(pool).slice(0, 3)]);
  return pick.map((it, i) => lgMakeQ(i % 4 === 3 ? "fill" : i % 3 === 2 ? "mcr" : "mc", it, recent.length >= 6 ? recent : pool, [], top));
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
  if (/^[1-4]$/.test(e.key) && !lgS.answered && e.target.id !== "lg-in") { const o = document.querySelector(`[data-lg-opt="${+e.key - 1}"]`); if (o) { e.preventDefault(); o.click() } }
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
