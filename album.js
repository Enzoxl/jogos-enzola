/* =====================================================================
   Minigames — Álbum de hipopótamos e baús da sorte
   Fotos saem de baús (3 sorteios por baú, podem repetir). Baús: loja (Enzola Coins) ou atividades.
   Para adicionar fotos: coloque o arquivo em album/ e acrescente uma linha em ALBUM.
   ===================================================================== */
const ALBUM = [
  { id: "h01", name: "Mergulhador Rosado", img: "album/h01.webp", ar: 1.507, rar: 1 },
  { id: "h02", name: "Pôr do Sol na Savana", img: "album/h02.webp", ar: 1.53, rar: 1 },
  { id: "h03", name: "Chegou o Chefe", img: "album/h03.webp", ar: 1.272, rar: 1 },
  { id: "h04", name: "Bocejo na Savana", img: "album/h04.webp", ar: 1.504, rar: 1 },
  { id: "h05", name: "Rio de Chocolate", img: "album/h05.webp", ar: 1.682, rar: 1 },
  { id: "h06", name: "Bebê Nadador", img: "album/h06.webp", ar: 0.75, rar: 1 },
  { id: "h07", name: "Rei do Aguapé", img: "album/h07.webp", ar: 1.778, rar: 1 },
  { id: "h08", name: "Bocejo ao Amanhecer", img: "album/h08.webp", ar: 0.8, rar: 1 },
  { id: "h09", name: "Banho de Esguicho", img: "album/h09.webp", ar: 1.779, rar: 1 },
  { id: "h10", name: "Radar de Narinas", img: "album/h10.webp", ar: 2.0, rar: 1 },
  { id: "h11", name: "Mamãe e Filhote", img: "album/h11.webp", ar: 1.599, rar: 1 },
  { id: "h12", name: "Cheguei Molhando", img: "album/h12.webp", ar: 1.779, rar: 1 },
  { id: "h13", name: "Filhote Sentadinho", img: "album/h13.webp", ar: 1.0, rar: 1 },
  { id: "h14", name: "Sorriso do Lago", img: "album/h14.webp", ar: 1.0, rar: 1 },
  { id: "h15", name: "Sorrisão", img: "album/h15.webp", ar: 1.0, rar: 1 },
  { id: "h16", name: "Bocão Gigante", img: "album/h16.webp", ar: 1.0, rar: 1 },
  { id: "h17", name: "Soneca na Lama", img: "album/h17.webp", ar: 1.493, rar: 1 },
  { id: "h18", name: "Olhar de Respeito", img: "album/h18.webp", ar: 0.8, rar: 1 },
  { id: "h19", name: "Amigo dos Peixes", img: "album/h19.webp", ar: 1.593, rar: 1 },
  { id: "h20", name: "Periscópio", img: "album/h20.webp", ar: 0.724, rar: 1 },
  { id: "h21", name: "Dia de Folga na Areia", img: "album/h21.webp", ar: 1.503, rar: 1 },
  { id: "h22", name: "Trio na Lagoa", img: "album/h22.webp", ar: 1.5, rar: 1 },
  { id: "h23", name: "Olhos nos Olhos", img: "album/h23.webp", ar: 1.5, rar: 1 },
  { id: "h24", name: "Reunião da Família", img: "album/h24.webp", ar: 1.468, rar: 1 },
  { id: "h25", name: "Coroa de Aguapé", img: "album/h25.webp", ar: 1.333, rar: 1 },
  { id: "h26", name: "Rosto Redondinho", img: "album/h26.webp", ar: 1.475, rar: 1 },
  { id: "h27", name: "Focinho Gigante", img: "album/h27.webp", ar: 1.5, rar: 1 },
  { id: "h28", name: "Língua de Fora", img: "album/h28.webp", ar: 1.364, rar: 1 },
  { id: "h29", name: "Linguinha Fofa", img: "album/h29.webp", ar: 1.0, rar: 1 },
  { id: "h30", name: "Bocejo Dentuço", img: "album/h30.webp", ar: 1.501, rar: 1 },
  { id: "h31", name: "Banheirinha Azul", img: "album/h31.webp", ar: 1.333, rar: 1 },
  { id: "h32", name: "Hora do Lanche", img: "album/h32.webp", ar: 1.681, rar: 1 },
  { id: "h33", name: "Cochilo no Tanque", img: "album/h33.webp", ar: 0.997, rar: 1 },
  { id: "h34", name: "Briga de Bocões", img: "album/h34.webp", ar: 1.471, rar: 1 },
  { id: "h35", name: "Filhote de Estúdio", img: "album/h35.webp", ar: 1.236, rar: 1 },
  { id: "h36", name: "Banho de Sol", img: "album/h36.webp", ar: 1.5, rar: 1 },
  { id: "h37", name: "Hipopóts Apaixonados", img: "album/h37.webp", ar: 1.247, rar: 1 },
  { id: "h38", name: "Ataque Aquático", img: "album/h38.webp", ar: 1.483, rar: 1 },
  { id: "h39", name: "Bocejo na Lagoa", img: "album/h39.webp", ar: 1.5, rar: 1 },
  { id: "h40", name: "Coroa Verde", img: "album/h40.webp", ar: 1.501, rar: 1 },
  { id: "h41", name: "Língua de Fora Total", img: "album/h41.webp", ar: 1.5, rar: 1 },
  { id: "h42", name: "Olhar Submarino", img: "album/h42.webp", ar: 1.173, rar: 1 },
  { id: "h43", name: "Soneca na Pedra", img: "album/h43.webp", ar: 1.176, rar: 1 },
  { id: "h44", name: "Passeio no Gramado", img: "album/h44.webp", ar: 1.5, rar: 1 },
  { id: "h45", name: "Hora de Beber Água", img: "album/h45.webp", ar: 1.504, rar: 1 },
  { id: "h46", name: "Filhote Curioso", img: "album/h46.webp", ar: 1.501, rar: 1 },
  { id: "h47", name: "Mãe e Filhote Mergulhando", img: "album/h47.webp", ar: 1.0, rar: 1 },
  { id: "h48", name: "Colo de Mãe", img: "album/h48.webp", ar: 1.063, rar: 1 },
  { id: "h49", name: "Dupla na Água", img: "album/h49.webp", ar: 1.0, rar: 1 },
  { id: "h50", name: "Passeio no Zoológico", img: "album/h50.webp", ar: 1.5, rar: 1 },
  { id: "h51", name: "Sonequinha a Dois", img: "album/h51.webp", ar: 2.098, rar: 1 },
  { id: "h52", name: "Merenda de Melancia", img: "album/h52.webp", ar: 0.75, rar: 1 },
  { id: "h53", name: "Bebê de Braços Cruzados", img: "album/h53.webp", ar: 0.692, rar: 1 },
  { id: "h54", name: "Olhos de Fora", img: "album/h54.webp", ar: 1.461, rar: 1 },
  { id: "h55", name: "Banho Coletivo", img: "album/h55.webp", ar: 1.5, rar: 1 },
  { id: "h56", name: "Caminhada na Terra Vermelha", img: "album/h56.webp", ar: 1.779, rar: 1 },
  { id: "h57", name: "Beijo de Hipopótamos", img: "album/h57.webp", ar: 1.5, rar: 1 },
  { id: "h58", name: "Preguiça na Areia", img: "album/h58.webp", ar: 1.918, rar: 1 },
  { id: "h59", name: "Sorriso de Perfil", img: "album/h59.webp", ar: 1.5, rar: 1 },
  { id: "h60", name: "Filhote Pigmeu", img: "album/h60.webp", ar: 1.667, rar: 1 },
  { id: "h61", name: "Bocejo Verde", img: "album/h61.webp", ar: 1.5, rar: 1 },
  { id: "h62", name: "Focinho no Chão", img: "album/h62.webp", ar: 1.0, rar: 1 },
  { id: "h63", name: "Cabeça Pesada", img: "album/h63.webp", ar: 1.599, rar: 1 },
  { id: "h64", name: "Olhando pro Céu", img: "album/h64.webp", ar: 1.6, rar: 1 },
  { id: "h65", name: "Dupla Cansada", img: "album/h65.webp", ar: 1.5, rar: 1 },
  // próximas fotos: { id: "h66", name: "Nome", img: "album/h66.webp", ar: 1.5, rar: 1 },   // rar: 1 comum · 0.4 rara · 0.15 lendária
];
const CHEST_PRICE = 60, CHEST_PRICE_5 = 270, CHEST_DRAWS = 3;
let mgTab = "game";
let chestUid = 0;
const chestSvg = (cls = "") => { const u = "c" + (++chestUid); return `<svg class="chest ${cls}" viewBox="0 0 140 120" aria-hidden="true"><defs>
  <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a4b"/><stop offset=".55" stop-color="#9a5e2c"/><stop offset="1" stop-color="#6e3d1a"/></linearGradient>
  <linearGradient id="${u}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a93a6"/><stop offset=".45" stop-color="#e3e8f2"/><stop offset="1" stop-color="#7c869b"/></linearGradient>
  <linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".5" stop-color="#ffc936"/><stop offset="1" stop-color="#c9850a"/></linearGradient>
  <radialGradient id="${u}l" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff8c4"/><stop offset=".5" stop-color="#ffd24a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="70" cy="112" rx="56" ry="6" fill="rgba(0,0,0,.28)"/>
  <g class="chest-in"><ellipse cx="70" cy="62" rx="52" ry="22" fill="url(#${u}l)"/><g class="chest-coins"><ellipse cx="46" cy="60" rx="9" ry="4.2" fill="#ffc936" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="62" cy="55" rx="9" ry="4.2" fill="#ffd95e" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="80" cy="57" rx="9" ry="4.2" fill="#ffc936" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="95" cy="62" rx="9" ry="4.2" fill="#ffd95e" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="70" cy="52" rx="9" ry="4.2" fill="#fff0a0" stroke="#a86a06" stroke-width="1.4"/></g></g>
  <path d="M14 62 H126 V104 Q126 108 122 108 H18 Q14 108 14 104 Z" fill="url(#${u}w)" stroke="#3d200c" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#3d200c" stroke-width="1.2" opacity=".55"><path d="M14 76 H126"/><path d="M14 91 H126"/><path d="M30 62 V108 M52 62 V108 M88 62 V108 M110 62 V108" opacity=".5"/></g>
  <path d="M20 66 H44 M72 80 H104 M24 96 H50" stroke="#e9b27a" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>
  <g stroke="#3d200c" stroke-width="2"><rect x="14" y="60" width="16" height="48" rx="3" fill="url(#${u}m)"/><rect x="110" y="60" width="16" height="48" rx="3" fill="url(#${u}m)"/><rect x="14" y="98" width="112" height="10" rx="3" fill="url(#${u}m)"/></g>
  <g fill="#4a5163"><circle cx="22" cy="68" r="1.8"/><circle cx="22" cy="84" r="1.8"/><circle cx="22" cy="102" r="1.8"/><circle cx="118" cy="68" r="1.8"/><circle cx="118" cy="84" r="1.8"/><circle cx="118" cy="102" r="1.8"/></g>
  <g class="chest-lid"><path d="M12 62 V46 Q12 14 70 14 Q128 14 128 46 V62 Z" fill="url(#${u}w)" stroke="#3d200c" stroke-width="3" stroke-linejoin="round"/>
    <path d="M26 56 Q30 24 70 22" fill="none" stroke="#e9b27a" stroke-width="2" opacity=".45" stroke-linecap="round"/>
    <g stroke="#3d200c" stroke-width="1.2" opacity=".5"><path d="M20 34 Q70 6 120 34" fill="none"/><path d="M13 48 H127"/></g>
    <g stroke="#3d200c" stroke-width="2"><path d="M12 62 V46 Q12 30 22 22 L32 22 Q20 32 30 62 Z" fill="url(#${u}m)"/><path d="M128 62 V46 Q128 30 118 22 L108 22 Q120 32 110 62 Z" fill="url(#${u}m)"/><path d="M52 15 Q70 12 88 15 V62 H52 Z" fill="url(#${u}g)"/></g>
    <rect x="12" y="56" width="116" height="8" rx="2" fill="url(#${u}m)" stroke="#3d200c" stroke-width="2"/>
    <g fill="#4a5163"><circle cx="21" cy="46" r="1.8"/><circle cx="119" cy="46" r="1.8"/></g><path d="M56 22 V58 M84 22 V58" stroke="#a86a06" stroke-width="1.2" opacity=".6"/></g>
  <g class="chest-lock"><rect x="58" y="62" width="24" height="26" rx="5" fill="url(#${u}g)" stroke="#3d200c" stroke-width="2.4"/><circle cx="70" cy="73" r="4.2" fill="#3d200c"/><path d="M68.4 75 h3.2 l1 8 h-5.2 z" fill="#3d200c"/><path d="M62 66 q8 -4 16 0" stroke="#fff6c8" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/></g>
</svg>` };
function albumLoad() { lg = lg || lgLoad(); lg.album = lg.album || {}; if (ALBUM.length && !lg.bauWelcome) { lg.bauWelcome = true; lg.chests = (lg.chests || 0) + 1; lgSave(true) } return lg }
const albumOwned = () => { albumLoad(); return ALBUM.filter(p => lg.album[p.id] > 0).length };
function chestGive(n, why) {
  if (!user || !n) return 0;
  albumLoad(); lg.chests = (lg.chests || 0) + n; lgSave(true);
  if (why) toast(`🎁 ${why}: você ganhou ${n === 1 ? "um baú da sorte" : n + " baús da sorte"}! Abra em Minigames › Álbum.`);
  return n;
}
const CHEST_COINS = [[5, 44], [10, 28], [20, 14], [35, 8], [60, 4], [100, 1.7], [200, 0.3]];
const CHEST_ODDS = { photo: 35, coins: 53, skin: 12 };   // % por sorteio
const chestSkins = () => LG_SKINS.filter(k => !k.group && k.price > 0);   // fora a skin de metas (Free Fire) e a clássica
function chestPick(list) { const t = list.reduce((a, x) => a + x[1], 0); let r = Math.random() * t; for (const x of list) { r -= x[1]; if (r <= 0) return x[0] } return list[0][0] }
function chestDraw() {
  let r = Math.random() * 100, kind = r < CHEST_ODDS.photo ? "photo" : r < CHEST_ODDS.photo + CHEST_ODDS.coins ? "coins" : "skin";
  if (kind === "photo" && !ALBUM.length) kind = "coins";
  if (kind === "skin") { const pool = chestSkins().filter(k => !skinHas(k.id)); if (pool.length) { const w = pool.map(k => [k, 1 / Math.sqrt(k.price)]); return { t: "skin", sk: chestPick(w) } } kind = "coins" }
  if (kind === "coins") return { t: "coins", n: chestPick(CHEST_COINS) };
  const tot = ALBUM.reduce((a, p) => a + (p.rar || 1), 0); let q = Math.random() * tot, hit = ALBUM[ALBUM.length - 1];
  for (const p of ALBUM) { q -= p.rar || 1; if (q <= 0) { hit = p; break } }
  return { t: "photo", p: hit };
}
function chestBuy(n) {
  albumLoad();
  const price = n === 5 ? CHEST_PRICE_5 : CHEST_PRICE;
  if ((lg.goiabas || 0) < price) { toast(`Faltam ${price - (lg.goiabas || 0)} Enzola Coins.`); return }
  lg.goiabas -= price; lg.chests = (lg.chests || 0) + n; lgSave(true);
  toast(n === 1 ? "Baú comprado! 🎁" : "5 baús comprados! 🎁"); if (typeof lgShopRender === "function" && $("#lgs-ovl")) lgShopRender();
}
function albumOvl() { let b = $("#alb-ovl"); if (!b) { b = document.createElement("div"); b.id = "alb-ovl"; b.className = "alb-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Baú da sorte"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function albumClose() { const b = $("#alb-ovl"); if (b) b.remove(); if (!$("#lgs-ovl") && !$("#sh-ovl")) document.documentElement.classList.remove("lg-open"); if (tab === "idiomas") renderLingo() }
function chestOpen() {
  albumLoad(); if (!(lg.chests > 0)) return;
  lg.chests--; lg.skins = lg.skins || {};
  const got = Array.from({ length: CHEST_DRAWS }, () => {
    const d = chestDraw();
    if (d.t === "photo") { const had = lg.album[d.p.id] > 0; lg.album[d.p.id] = (lg.album[d.p.id] || 0) + 1; d.fresh = !had }
    else if (d.t === "coins") lg.goiabas = (lg.goiabas || 0) + d.n;
    else { if (skinHas(d.sk.id)) { d.dup = Math.round(d.sk.price / 2); lg.goiabas = (lg.goiabas || 0) + d.dup } else { lg.skins[d.sk.id] = true; d.fresh = true } }
    return d;
  });
  lgSave(true);
  const done = ALBUM.length && albumOwned() === ALBUM.length, nf = got.filter(d => d.t === "photo" && d.fresh).length, coins = got.reduce((a, d) => a + (d.t === "coins" ? d.n : d.dup || 0), 0), sk = got.filter(d => d.t === "skin" && d.fresh);
  chestShow = { got, i: -1, done, nf, coins, sk, busy: false };
  albumOvl().innerHTML = `<div class="alb-box rv"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button>
    <div class="alb-stage" id="alb-stage"><div class="chest-w shake">${chestSvg()}</div><p class="muted">Abrindo o baú…</p></div></div>`;
  setTimeout(() => { if ($("#alb-stage")) { $("#alb-stage").innerHTML = `<div class="chest-w open pop">${chestSvg("open")}</div><div class="rv-burst" aria-hidden="true"></div>`; setTimeout(chestNext, 750) } }, 1200);
}
let chestShow = null;
const chestKind = d => d.t === "photo" ? (d.fresh ? "Foto nova!" : "Foto repetida") : d.t === "coins" ? "Enzola Coins" : d.fresh ? "Skin nova!" : "Skin repetida";
function chestCard(d, big) {
  if (d.t === "photo") return `<figure class="alb-c rv-c${d.fresh ? " new" : ""}"><img src="${esc(d.p.img)}" alt="${esc(d.p.name)}"><figcaption>${esc(d.p.name)}</figcaption><span class="alb-tag">${d.fresh ? "NOVA!" : "Repetida"}</span></figure>`;
  if (d.t === "coins") return `<figure class="alb-c rv-c alb-coin"><div class="alb-cb">${gbI("big")}<b>+${d.n}</b></div><figcaption>Enzola Coins</figcaption><span class="alb-tag">Moedas</span></figure>`;
  return `<figure class="alb-c rv-c alb-sk${d.fresh ? " new" : ""}"><div class="alb-sb"><img src="${esc(d.sk.img)}" alt=""></div><figcaption>${esc(d.sk.name)}${d.dup ? ` · +${d.dup} Coins` : ""}</figcaption><span class="alb-tag">${d.fresh ? "SKIN NOVA!" : "Repetida"}</span></figure>`;
}
function chestNext() {
  const s = chestShow, st = $("#alb-stage"); if (!s || !st || s.busy) return;
  s.busy = true;
  const show = () => {
    s.i++;
    if (s.i >= s.got.length) return chestSummary();
    const d = s.got[s.i], rare = d.t === "skin" && d.fresh || d.t === "coins" && d.n >= 60 || d.t === "photo" && d.fresh;
    st.innerHTML = `<div class="rv-step"><div class="rv-burst on${rare ? " rare" : ""}" aria-hidden="true"></div><div class="rv-card">${chestCard(d)}</div>
      <div class="rv-lab">${esc(chestKind(d))}</div><div class="rv-dots" aria-hidden="true">${s.got.map((_, k) => `<i class="${k <= s.i ? "on" : ""}"></i>`).join("")}</div>
      <button class="btn rv-go" data-alb-next>${s.i === s.got.length - 1 ? "Ver resumo" : "Próximo prêmio"}</button></div>`;
    if (typeof lgBeep === "function") lgBeep("ok");
    s.busy = false; const b = $(".rv-go"); if (b) b.focus({ preventScroll: true });
  };
  const old = st.querySelector(".rv-card, .chest-w");
  if (old && s.i >= 0) { old.classList.add("rv-out"); setTimeout(show, 380) } else show();
}
function chestSummary() {
  const s = chestShow, st = $("#alb-stage"); if (!s || !st) return; s.busy = false;
  const parts = []; if (s.sk.length) parts.push(`${s.sk.length > 1 ? "skins novas" : "skin nova"}: ${s.sk.map(d => esc(d.sk.name)).join(", ")} (com avatar e banner!)`);
  if (s.nf) parts.push(`${s.nf} foto${s.nf > 1 ? "s" : ""} nova${s.nf > 1 ? "s" : ""}`); if (s.coins) parts.push(`${s.coins} Enzola Coins`);
  st.innerHTML = `<div class="alb-got">${s.got.map((d, i) => `<div style="--i:${i};display:contents">${chestCard(d).replace("alb-c rv-c", "alb-c")}</div>`).join("")}</div>
    <p class="alb-sum">${parts.length ? "Você ganhou " + parts.join(" · ") + "!" : "Só repetidas desta vez. Tente outro baú!"}${s.done ? " 🎉 Álbum completo!" : ""}</p>
    <div class="alb-acts">${lg.chests > 0 ? `<button class="btn" data-alb-open>Abrir outro (${lg.chests})</button>` : ""}<button class="btn ghost" data-alb-close>Fechar</button></div>`;
}
function albumHTML() {
  albumLoad(); const own = albumOwned(), N = ALBUM.length, pct = N ? Math.round(own / N * 100) : 0;
  if (!N) return `<div class="sec-head"><div><h2 class="h">Álbum de hipopótamos</h2><p class="muted">Junte todas as fotos abrindo baús da sorte.</p></div></div><div class="panel empty"><b>Em breve</b>As primeiras fotos de hipopótamos estão chegando ao álbum.</div>`;
  return `<div class="sec-head"><div><h2 class="h">Álbum de hipopótamos</h2><p class="muted">Abra baús da sorte: fotos, Enzola Coins ou até skins. Fotos podem vir repetidas!</p></div></div>
    <div class="alb-top panel"><div class="alb-prog"><b>${own}/${N} fotos</b><div class="g-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${own}"><i style="width:${pct}%"></i></div>${own === N ? `<small>🎉 Álbum completo!</small>` : `<small class="muted">Faltam ${N - own}</small>`}</div>
      <div class="alb-ch">${chestSvg("sm")}<div><b>${lg.chests || 0} baú${(lg.chests || 0) === 1 ? "" : "s"}</b><small class="muted">Ganhe no Enzolingo e no Show</small></div></div>
      <div class="alb-btns"><button class="btn" data-alb-open${lg.chests > 0 ? "" : " disabled"}>Abrir baú</button><button class="btn ghost" data-lg-shop data-lgs-bau>${gbI()}Comprar baú</button></div></div>
    ${albBookHTML()}`;
}

/* ---------- livro: capa + páginas em mosaico, com virada de página ---------- */
const ALB_PER = 6, ALB_COLS = 8, ALB_ROWS = 10;
// mosaicos: [coluna, linha, largura, altura] numa grade 8×10 (página 4:5)
const ALB_TPL = {
  6: [
    [[0,0,4,3],[4,0,4,3],[0,3,3,4],[3,3,5,4],[0,7,5,3],[5,7,3,3]],
    [[0,0,3,6],[3,0,5,3],[3,3,5,3],[0,6,4,4],[4,6,4,2],[4,8,4,2]],
    [[0,0,8,3],[0,3,3,3],[3,3,5,3],[0,6,5,4],[5,6,3,2],[5,8,3,2]],
    [[0,0,3,5],[3,0,3,5],[6,0,2,5],[0,5,3,5],[3,5,5,3],[3,8,5,2]],
  ],
  5: [[[0,0,5,5],[5,0,3,5],[0,5,3,5],[3,5,5,3],[3,8,5,2]]],
  4: [[[0,0,8,5],[0,5,3,5],[3,5,5,3],[3,8,5,2]]],
  3: [[[0,0,8,5],[0,5,4,5],[4,5,4,5]]],
  2: [[[0,0,8,5],[0,5,8,5]]],
  1: [[[0,0,8,10]]],
};
let albPg = 0, albBusy = false, albLay = {};
const albPages = () => 1 + Math.ceil(ALBUM.length / ALB_PER);
function albLayout(pg) {            // pg >= 1: escolhe o mosaico e encaixa cada foto na célula de proporção mais próxima
  if (albLay[pg]) return albLay[pg];
  const items = ALBUM.slice((pg - 1) * ALB_PER, pg * ALB_PER), n = items.length, tpls = ALB_TPL[n] || ALB_TPL[1];
  let best = null;
  const perm = (arr, k, used, cur, tpl, score) => {
    if (k === arr.length) { if (!best || score < best.score) best = { score, cells: cur.slice(), tpl }; return }
    for (let i = 0; i < arr.length; i++) if (!used[i]) { used[i] = 1; const c = tpl[i], d = Math.abs(Math.log((c[2] / c[3]) / (arr[k].ar || 1.3)));
      cur[k] = c; perm(arr, k + 1, used, cur, tpl, score + d); used[i] = 0 }
  };
  tpls.forEach(tpl => perm(items, 0, [], [], tpl, 0));
  return albLay[pg] = items.map((p, i) => ({ p, c: best.cells[i], idx: (pg - 1) * ALB_PER + i }));
}
function albPageHTML(pg) {
  albumLoad();
  if (pg === 0) { const own = albumOwned(), N = ALBUM.length;
    return `<div class="bk-cover"><img src="album/capa.webp" alt="Capa do álbum de hipopótamos"><div class="bk-ct"><b>Álbum de Hipopótamos</b><span>${own}/${N} fotos</span><button class="btn sm" data-alb-go="1">Abrir o álbum</button></div></div>` }
  const cells = albLayout(pg).map(({ p, c, idx }) => { const n = lg.album[p.id] || 0, st = `grid-column:${c[0] + 1}/span ${c[2]};grid-row:${c[1] + 1}/span ${c[3]}`;
    return n ? `<button class="bk-c own" style="${st}" data-alb-zoom="${p.id}" aria-label="${esc(p.name)}, ${n} cópia${n > 1 ? "s" : ""}"><img src="${esc(p.img)}" alt=""><span class="alb-n">#${idx + 1}</span>${n > 1 ? `<span class="alb-x">×${n}</span>` : ""}</button>`
      : `<div class="bk-c" style="${st}" aria-label="Foto ${idx + 1} ainda não conquistada"><span class="alb-q">?</span><span class="alb-n">#${idx + 1}</span></div>` }).join("");
  return `<div class="bk-page"><div class="bk-mos">${cells}</div><div class="bk-no">${pg + 1}</div></div>`;
}
function albBookHTML() {
  albPg = Math.min(albPg, albPages() - 1);
  return `<div class="bk-wrap"><div class="bk" id="bk" tabindex="0" aria-label="Álbum, página ${albPg + 1} de ${albPages()}"><div class="bk-spine" aria-hidden="true"></div><div class="bk-pg" id="bk-cur">${albPageHTML(albPg)}</div></div>
    <div class="bk-nav"><button class="btn ghost sm" data-alb-go="prev" id="bk-prev"${albPg === 0 ? " disabled" : ""} aria-label="Página anterior">${ic("chev")}Anterior</button><span class="muted" id="bk-ind">${albPg === 0 ? "Capa" : `Página ${albPg} de ${albPages() - 1}`}</span><button class="btn ghost sm" data-alb-go="next" id="bk-next"${albPg >= albPages() - 1 ? " disabled" : ""} aria-label="Próxima página">Próxima${ic("chev")}</button></div></div>`;
}
function albNav() {
  const i = $("#bk-ind"), pv = $("#bk-prev"), nx = $("#bk-next"), bk = $("#bk");
  if (i) i.textContent = albPg === 0 ? "Capa" : `Página ${albPg} de ${albPages() - 1}`;
  if (pv) pv.disabled = albPg === 0; if (nx) nx.disabled = albPg >= albPages() - 1;
  if (bk) bk.setAttribute("aria-label", `Álbum, página ${albPg + 1} de ${albPages()}`);
}
function albGo(to) {
  if (albBusy || to < 0 || to >= albPages() || to === albPg) return;
  const bk = $("#bk"), cur = $("#bk-cur"); if (!bk || !cur) return;
  const fwd = to > albPg;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { cur.innerHTML = albPageHTML(to); albPg = to; albNav(); return }
  albBusy = true;
  const fl = document.createElement("div"); fl.className = "bk-fl " + (fwd ? "fwd" : "bwd");
  fl.innerHTML = `<div class="bk-f front">${albPageHTML(fwd ? albPg : to)}</div><div class="bk-f back"></div><div class="bk-sh" aria-hidden="true"></div>`;
  if (fwd) cur.innerHTML = albPageHTML(to);
  bk.append(fl);
  let done = false; const fin = () => { if (done) return; done = true; if (!fwd) cur.innerHTML = albPageHTML(to); fl.remove(); albPg = to; albBusy = false; albNav() };
  fl.addEventListener("animationend", fin, { once: true }); setTimeout(fin, 1100);
}
let albTx = null;
document.addEventListener("touchstart", e => { const t = e.target.closest && e.target.closest("#bk"); albTx = t ? e.touches[0].clientX : null }, { passive: true });
document.addEventListener("touchend", e => { if (albTx == null) return; const dx = e.changedTouches[0].clientX - albTx; albTx = null; if (Math.abs(dx) > 50) albGo(albPg + (dx < 0 ? 1 : -1)) }, { passive: true });
document.addEventListener("keydown", e => { if (!$("#bk") || $("#alb-ovl") || $("#lgs-ovl") || $("#sh-ovl") || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return; if (e.key === "ArrowRight") albGo(albPg + 1); else if (e.key === "ArrowLeft") albGo(albPg - 1) });
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (b = c("[data-alb-go]")) { const g = b.dataset.albGo; albGo(g === "next" ? albPg + 1 : g === "prev" ? albPg - 1 : +g); return }
  if (b = c("[data-mg]")) { mgTab = b.dataset.mg; renderLingo(); return }
  if (c("[data-alb-next]")) { chestNext(); return }
  if (c("[data-alb-open]") && !c("[data-alb-open]").disabled) { chestOpen(); return }
  if (c("[data-alb-close]") || e.target.id === "alb-ovl") { albumClose(); return }
  if (b = c("[data-alb-zoom]")) { const p = ALBUM.find(x => x.id === b.dataset.albZoom); if (!p) return; const n = (lg.album || {})[p.id] || 0;
    albumOvl().innerHTML = `<div class="alb-box zoom"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button><img src="${esc(p.img)}" alt="${esc(p.name)}"><p><b>${esc(p.name)}</b><span class="muted"> · ${n} cópia${n > 1 ? "s" : ""}</span></p></div>`; return }
  if (c("[data-lgs-buy-chest]")) { chestBuy(+c("[data-lgs-buy-chest]").dataset.lgsBuyChest); return }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#alb-ovl")) albumClose() });
