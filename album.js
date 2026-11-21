/* =====================================================================
   Minigames — Álbum de hipopótamos e baús da sorte
   Fotos saem de baús (3 sorteios por baú, podem repetir). Baús: loja (Enzola Coins) ou atividades.
   Para adicionar fotos: coloque o arquivo em album/ e acrescente uma linha em ALBUM.
   ===================================================================== */
const ALBUM = [
  { id: "h01", name: "Mergulhador Rosado", img: "album/h01.webp", rar: 1 },
  { id: "h02", name: "Pôr do Sol na Savana", img: "album/h02.webp", rar: 1 },
  { id: "h03", name: "Chegou o Chefe", img: "album/h03.webp", rar: 1 },
  { id: "h04", name: "Bocejo na Savana", img: "album/h04.webp", rar: 1 },
  { id: "h05", name: "Rio de Chocolate", img: "album/h05.webp", rar: 1 },
  { id: "h06", name: "Bebê Nadador", img: "album/h06.webp", rar: 1 },
  { id: "h07", name: "Rei do Aguapé", img: "album/h07.webp", rar: 1 },
  { id: "h08", name: "Bocejo ao Amanhecer", img: "album/h08.webp", rar: 1 },
  { id: "h09", name: "Banho de Esguicho", img: "album/h09.webp", rar: 1 },
  { id: "h10", name: "Radar de Narinas", img: "album/h10.webp", rar: 1 },
  { id: "h11", name: "Mamãe e Filhote", img: "album/h11.webp", rar: 1 },
  { id: "h12", name: "Cheguei Molhando", img: "album/h12.webp", rar: 1 },
  { id: "h13", name: "Filhote Sentadinho", img: "album/h13.webp", rar: 1 },
  { id: "h14", name: "Sorriso do Lago", img: "album/h14.webp", rar: 1 },
  { id: "h15", name: "Sorrisão", img: "album/h15.webp", rar: 1 },
  { id: "h16", name: "Bocão Gigante", img: "album/h16.webp", rar: 1 },
  { id: "h17", name: "Soneca na Lama", img: "album/h17.webp", rar: 1 },
  { id: "h18", name: "Olhar de Respeito", img: "album/h18.webp", rar: 1 },
  { id: "h19", name: "Amigo dos Peixes", img: "album/h19.webp", rar: 1 },
  { id: "h20", name: "Periscópio", img: "album/h20.webp", rar: 1 },
  { id: "h21", name: "Dia de Folga na Areia", img: "album/h21.webp", rar: 1 },
  { id: "h22", name: "Trio na Lagoa", img: "album/h22.webp", rar: 1 },
  { id: "h23", name: "Olhos nos Olhos", img: "album/h23.webp", rar: 1 },
  { id: "h24", name: "Reunião da Família", img: "album/h24.webp", rar: 1 },
  { id: "h25", name: "Coroa de Aguapé", img: "album/h25.webp", rar: 1 },
  { id: "h26", name: "Rosto Redondinho", img: "album/h26.webp", rar: 1 },
  { id: "h27", name: "Focinho Gigante", img: "album/h27.webp", rar: 1 },
  { id: "h28", name: "Língua de Fora", img: "album/h28.webp", rar: 1 },
  { id: "h29", name: "Linguinha Fofa", img: "album/h29.webp", rar: 1 },
  { id: "h30", name: "Bocejo Dentuço", img: "album/h30.webp", rar: 1 },
  { id: "h31", name: "Banheirinha Azul", img: "album/h31.webp", rar: 1 },
  { id: "h32", name: "Hora do Lanche", img: "album/h32.webp", rar: 1 },
  { id: "h33", name: "Cochilo no Tanque", img: "album/h33.webp", rar: 1 },
  { id: "h34", name: "Briga de Bocões", img: "album/h34.webp", rar: 1 },
  { id: "h35", name: "Filhote de Estúdio", img: "album/h35.webp", rar: 1 },
  { id: "h36", name: "Banho de Sol", img: "album/h36.webp", rar: 1 },
  { id: "h37", name: "Hipopóts Apaixonados", img: "album/h37.webp", rar: 1 },
  { id: "h38", name: "Ataque Aquático", img: "album/h38.webp", rar: 1 },
  { id: "h39", name: "Bocejo na Lagoa", img: "album/h39.webp", rar: 1 },
  { id: "h40", name: "Coroa Verde", img: "album/h40.webp", rar: 1 },
  { id: "h41", name: "Língua de Fora Total", img: "album/h41.webp", rar: 1 },
  { id: "h42", name: "Olhar Submarino", img: "album/h42.webp", rar: 1 },
  { id: "h43", name: "Soneca na Pedra", img: "album/h43.webp", rar: 1 },
  { id: "h44", name: "Passeio no Gramado", img: "album/h44.webp", rar: 1 },
  { id: "h45", name: "Hora de Beber Água", img: "album/h45.webp", rar: 1 },
  { id: "h46", name: "Filhote Curioso", img: "album/h46.webp", rar: 1 },
  { id: "h47", name: "Mãe e Filhote Mergulhando", img: "album/h47.webp", rar: 1 },
  { id: "h48", name: "Colo de Mãe", img: "album/h48.webp", rar: 1 },
  { id: "h49", name: "Dupla na Água", img: "album/h49.webp", rar: 1 },
  { id: "h50", name: "Passeio no Zoológico", img: "album/h50.webp", rar: 1 },
  { id: "h51", name: "Sonequinha a Dois", img: "album/h51.webp", rar: 1 },
  { id: "h52", name: "Merenda de Melancia", img: "album/h52.webp", rar: 1 },
  { id: "h53", name: "Bebê de Braços Cruzados", img: "album/h53.webp", rar: 1 },
  { id: "h54", name: "Olhos de Fora", img: "album/h54.webp", rar: 1 },
  { id: "h55", name: "Banho Coletivo", img: "album/h55.webp", rar: 1 },
  { id: "h56", name: "Caminhada na Terra Vermelha", img: "album/h56.webp", rar: 1 },
  { id: "h57", name: "Beijo de Hipopótamos", img: "album/h57.webp", rar: 1 },
  { id: "h58", name: "Preguiça na Areia", img: "album/h58.webp", rar: 1 },
  { id: "h59", name: "Sorriso de Perfil", img: "album/h59.webp", rar: 1 },
  { id: "h60", name: "Filhote Pigmeu", img: "album/h60.webp", rar: 1 },
  // próximas fotos: { id: "h61", name: "Nome", img: "album/h61.webp", rar: 1 },   // rar: 1 comum · 0.4 rara · 0.15 lendária
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
    <div class="alb-grid">${ALBUM.map((p, i) => { const n = lg.album[p.id] || 0;
      return n ? `<button class="alb-s own" data-alb-zoom="${p.id}" aria-label="${esc(p.name)}, ${n} cópia${n > 1 ? "s" : ""}"><img src="${esc(p.img)}" alt="" loading="lazy"><span class="alb-n">#${i + 1}</span>${n > 1 ? `<span class="alb-x">×${n}</span>` : ""}</button>` : `<div class="alb-s" aria-label="Foto ${i + 1} ainda não conquistada"><span class="alb-q">?</span><span class="alb-n">#${i + 1}</span></div>` }).join("")}</div>`;
}
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (b = c("[data-mg]")) { mgTab = b.dataset.mg; renderLingo(); return }
  if (c("[data-alb-open]") && !c("[data-alb-open]").disabled) { chestOpen(); return }
  if (c("[data-alb-close]") || e.target.id === "alb-ovl") { albumClose(); return }
  if (b = c("[data-alb-zoom]")) { const p = ALBUM.find(x => x.id === b.dataset.albZoom); if (!p) return; const n = (lg.album || {})[p.id] || 0;
    albumOvl().innerHTML = `<div class="alb-box zoom"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button><img src="${esc(p.img)}" alt="${esc(p.name)}"><p><b>${esc(p.name)}</b><span class="muted"> · ${n} cópia${n > 1 ? "s" : ""}</span></p></div>`; return }
  if (c("[data-lgs-buy-chest]")) { chestBuy(+c("[data-lgs-buy-chest]").dataset.lgsBuyChest); return }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#alb-ovl")) albumClose() });
