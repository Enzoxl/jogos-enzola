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
const chestSvg = (cls = "") => `<svg class="chest ${cls}" viewBox="0 0 120 100" aria-hidden="true"><g class="chest-lid"><path d="M12 44 Q12 12 60 12 Q108 12 108 44 Z" fill="#a8662f" stroke="#4a2810" stroke-width="3"/><rect x="50" y="12" width="20" height="32" fill="#f2bd2c" stroke="#4a2810" stroke-width="2"/><path d="M12 44 H108" stroke="#4a2810" stroke-width="3"/></g>
  <rect x="12" y="44" width="96" height="46" rx="5" fill="#a8662f" stroke="#4a2810" stroke-width="3"/><rect x="50" y="44" width="20" height="46" fill="#f2bd2c" stroke="#4a2810" stroke-width="2"/><rect x="54" y="52" width="12" height="14" rx="3" fill="#fff4c2" stroke="#4a2810" stroke-width="2"/><circle cx="60" cy="59" r="2.2" fill="#4a2810"/></svg>`;
function albumLoad() { lg = lg || lgLoad(); lg.album = lg.album || {}; if (ALBUM.length && !lg.bauWelcome) { lg.bauWelcome = true; lg.chests = (lg.chests || 0) + 1; lgSave(true) } return lg }
const albumOwned = () => { albumLoad(); return ALBUM.filter(p => lg.album[p.id] > 0).length };
function chestGive(n, why) {
  if (!user || !ALBUM.length || !n) return 0;
  albumLoad(); lg.chests = (lg.chests || 0) + n; lgSave(true);
  if (why) toast(`🎁 ${why}: você ganhou ${n === 1 ? "um baú da sorte" : n + " baús da sorte"}! Abra em Minigames › Álbum.`);
  return n;
}
function chestDraw() {
  const tot = ALBUM.reduce((a, p) => a + (p.rar || 1), 0); let r = Math.random() * tot;
  for (const p of ALBUM) { r -= p.rar || 1; if (r <= 0) return p } return ALBUM[ALBUM.length - 1];
}
function chestBuy(n) {
  albumLoad(); if (!ALBUM.length) { toast("O álbum chega em breve!"); return }
  const price = n === 5 ? CHEST_PRICE_5 : CHEST_PRICE;
  if ((lg.goiabas || 0) < price) { toast(`Faltam ${price - (lg.goiabas || 0)} Enzola Coins.`); return }
  lg.goiabas -= price; lg.chests = (lg.chests || 0) + n; lgSave(true);
  toast(n === 1 ? "Baú comprado! 🎁" : "5 baús comprados! 🎁"); if (typeof lgShopRender === "function" && $("#lgs-ovl")) lgShopRender();
}
function albumOvl() { let b = $("#alb-ovl"); if (!b) { b = document.createElement("div"); b.id = "alb-ovl"; b.className = "alb-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Baú da sorte"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function albumClose() { const b = $("#alb-ovl"); if (b) b.remove(); if (!$("#lgs-ovl") && !$("#sh-ovl")) document.documentElement.classList.remove("lg-open"); if (tab === "idiomas") renderLingo() }
function chestOpen() {
  albumLoad(); if (!(lg.chests > 0) || !ALBUM.length) return;
  lg.chests--; const got = Array.from({ length: CHEST_DRAWS }, chestDraw);
  const fresh = got.map(p => !(lg.album[p.id] > 0) ? (lg.album[p.id] = 1, true) : (lg.album[p.id]++, false));
  // se a mesma foto nova sair duas vezes no mesmo baú, só a primeira é "nova"
  const seen = new Set(); got.forEach((p, i) => { if (fresh[i]) { if (seen.has(p.id)) fresh[i] = false; seen.add(p.id) } });
  lgSave(true);
  const done = albumOwned() === ALBUM.length;
  albumOvl().innerHTML = `<div class="alb-box"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button>
    <div class="alb-stage" id="alb-stage"><div class="chest-w shake">${chestSvg()}</div><p class="muted">Abrindo o baú…</p></div></div>`;
  setTimeout(() => {
    const st = $("#alb-stage"); if (!st) return;
    st.innerHTML = `<div class="chest-w open">${chestSvg("open")}</div><div class="alb-got">${got.map((p, i) => `<figure class="alb-c${fresh[i] ? " new" : ""}" style="--i:${i}"><img src="${esc(p.img)}" alt="${esc(p.name)}"><figcaption>${esc(p.name)}</figcaption><span class="alb-tag">${fresh[i] ? "NOVA!" : "Repetida"}</span></figure>`).join("")}</div>
      <p class="alb-sum">${fresh.filter(Boolean).length ? `${fresh.filter(Boolean).length} foto${fresh.filter(Boolean).length > 1 ? "s" : ""} nova${fresh.filter(Boolean).length > 1 ? "s" : ""} no álbum!` : "Só repetidas desta vez. Tente outro baú!"}${done ? " 🎉 Álbum completo!" : ""}</p>
      <div class="alb-acts">${lg.chests > 0 ? `<button class="btn" data-alb-open>Abrir outro (${lg.chests})</button>` : ""}<button class="btn ghost" data-alb-close>Fechar</button></div>`;
    if (typeof lgBeep === "function") lgBeep("ok");
  }, 1300);
}
function albumHTML() {
  albumLoad(); const own = albumOwned(), N = ALBUM.length, pct = N ? Math.round(own / N * 100) : 0;
  if (!N) return `<div class="sec-head"><div><h2 class="h">Álbum de hipopótamos</h2><p class="muted">Junte todas as fotos abrindo baús da sorte.</p></div></div><div class="panel empty"><b>Em breve</b>As primeiras fotos de hipopótamos estão chegando ao álbum.</div>`;
  return `<div class="sec-head"><div><h2 class="h">Álbum de hipopótamos</h2><p class="muted">Abra baús da sorte para ganhar fotos. Podem vir repetidas!</p></div></div>
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
  if (c("[data-alb-open]") && !c("[data-alb-open]").disabled) { chestOpen(); return }
  if (c("[data-alb-close]") || e.target.id === "alb-ovl") { albumClose(); return }
  if (b = c("[data-alb-zoom]")) { const p = ALBUM.find(x => x.id === b.dataset.albZoom); if (!p) return; const n = (lg.album || {})[p.id] || 0;
    albumOvl().innerHTML = `<div class="alb-box zoom"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button><img src="${esc(p.img)}" alt="${esc(p.name)}"><p><b>${esc(p.name)}</b><span class="muted"> · ${n} cópia${n > 1 ? "s" : ""}</span></p></div>`; return }
  if (c("[data-lgs-buy-chest]")) { chestBuy(+c("[data-lgs-buy-chest]").dataset.lgsBuyChest); return }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#alb-ovl")) albumClose() });
