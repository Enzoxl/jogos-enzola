/* =====================================================================
   Enzolingo — goiabas (pontos) e loja de skins do mascote
   Goiabas vêm das lições, do desafio de 60 s, da meta diária e do Show do Enzolão.
   ===================================================================== */
const LG_SKINS = [
  { id: "classico", kind: "hip", name: "Hipopótamo clássico", img: "hipopotamo.webp", price: 0 },
  { id: "festeiro", kind: "hip", name: "Festeiro", img: "loja/h-festeiro.webp", price: 40 },
  { id: "chef", kind: "hip", name: "Chef", img: "loja/h-chef.webp", price: 60 },
  { id: "fone", kind: "hip", name: "DJ de fone", img: "loja/h-fone.webp", price: 80 },
  { id: "oculos", kind: "hip", name: "Óculos escuros", img: "loja/h-oculos.webp", price: 80 },
  { id: "cauboi", kind: "hip", name: "Caubói", img: "loja/h-cauboi.webp", price: 100 },
  { id: "mago", kind: "hip", name: "Mago", img: "loja/h-mago.webp", price: 120 },
  { id: "cavalheiro", kind: "hip", name: "Cavalheiro", img: "loja/h-cavalheiro.webp", price: 150 },
  { id: "heroi", kind: "hip", name: "Super-herói", img: "loja/h-heroi.webp", price: 180 },
  { id: "rei", kind: "hip", name: "Rei Hipopótamo", img: "loja/h-rei.webp", price: 250 },
  { id: "dourado", kind: "hip", name: "Hipopótamo de ouro", img: "loja/h-dourado.webp", price: 400 },
  { id: "c10", kind: "chr", name: "Goiabinha", img: "convite/c10.jpg", price: 60 },
  { id: "c1", kind: "chr", name: "Cão do zap", img: "convite/c1.jpg", price: 70 },
  { id: "c11", kind: "chr", name: "Cachorro sábio", img: "convite/c11.jpg", price: 70 },
  { id: "c17", kind: "chr", name: "Gatinho", img: "convite/c17.jpg", price: 70 },
  { id: "c14", kind: "chr", name: "Lata roxa", img: "convite/c14.jpg", price: 80 },
  { id: "c2", kind: "chr", name: "Galo de casaco", img: "convite/c2.jpg", price: 90 },
  { id: "c9", kind: "chr", name: "Cavalo chique", img: "convite/c9.jpg", price: 90 },
  { id: "c13", kind: "chr", name: "Vaca esperta", img: "convite/c13.jpg", price: 90 },
  { id: "c3", kind: "chr", name: "Leão", img: "convite/c3.jpg", price: 100 },
  { id: "c15", kind: "chr", name: "Veadinho", img: "convite/c15.jpg", price: 100 },
  { id: "c4", kind: "chr", name: "Canguru sarado", img: "convite/c4.jpg", price: 110 },
  { id: "c6", kind: "chr", name: "Pássaro de óculos", img: "convite/c6.jpg", price: 120 },
  { id: "c12", kind: "chr", name: "Boné azul", img: "convite/c12.jpg", price: 130 },
  { id: "c16", kind: "chr", name: "CJ", img: "convite/c16.jpg", price: 140 },
];
const skinOf = id => LG_SKINS.find(s => s.id === id) || LG_SKINS[0];
const skinHas = id => id === "classico" || !!(lg && lg.skins && lg.skins[id]);
function lgSkinImg() {
  const sk = skinOf(lg && lg.skin), own = skinHas(sk.id) ? sk : LG_SKINS[0];
  return `<img class="lgh-img${own.kind === "chr" ? " chr" : ""}" src="${own.img}" alt="" draggable="false">`;
}
const gbI = (cls = "") => `<img class="gb-i ${cls}" src="loja/goiaba.webp" alt="goiabas">`;
/* ganhar goiabas fora das lições (Show do Enzolão) */
function lgAward(n) {
  if (!user || !n) return 0;
  lg = lg || lgLoad(); lg.goiabas = (lg.goiabas || 0) + n; lgSave(true); return n;
}

let lgsTab = "hip";
function lgShopBox() { let b = $("#lgs-ovl"); if (!b) { b = document.createElement("div"); b.id = "lgs-ovl"; b.className = "lgs-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Loja de skins"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function lgShopClose() { const b = $("#lgs-ovl"); if (b) b.remove(); document.documentElement.classList.remove("lg-open"); if (tab === "idiomas") renderLingo() }
function lgShopRender() {
  lg = lg || lgLoad(); const cur = skinOf(lg.skin), bal = lg.goiabas || 0;
  const list = LG_SKINS.filter(s => s.kind === lgsTab);
  lgShopBox().innerHTML = `<div class="lgs"><button class="iconbtn lgs-x" data-lgs-close aria-label="Fechar a loja">${ic("x")}</button>
    <header class="lgs-h"><div class="lgs-t"><h2>${ic("store")}Loja de skins</h2><p class="muted">Troque goiabas por visuais para o seu mascote do Enzolingo.</p></div>
      <div class="lgs-bal" aria-label="Seu saldo">${gbI("big")}<b>${bal}</b></div></header>
    <div class="lgs-prev"><div class="lgs-pv${cur.kind === "chr" ? " chr" : ""}"><img src="${cur.img}" alt=""></div><div><small class="muted">Equipado agora</small><b>${esc(cur.name)}</b></div></div>
    <div class="lgs-tabs" role="tablist"><button role="tab" aria-selected="${lgsTab === "hip"}" data-lgs-tab="hip">🦛 Hipopótamo</button><button role="tab" aria-selected="${lgsTab === "chr"}" data-lgs-tab="chr">🫧 Personagens</button></div>
    <div class="lgs-grid">${list.map(sk => {
      const own = skinHas(sk.id), on = lg.skin === sk.id || (!lg.skin && sk.id === "classico"), can = bal >= sk.price;
      return `<div class="lgs-card${on ? " on" : ""}"><div class="lgs-img${sk.kind === "chr" ? " chr" : ""}"><img src="${sk.img}" alt=""></div><b>${esc(sk.name)}</b>
        ${on ? `<span class="lgs-eq">${ic("check")}Equipado</span>` : own ? `<button class="btn sm" data-lgs-equip="${sk.id}">Equipar</button>` : `<button class="btn sm lgs-buy${can ? "" : " lack"}" data-lgs-buy="${sk.id}" aria-label="Comprar ${esc(sk.name)} por ${sk.price} goiabas">${gbI()}${sk.price}</button>`}</div>`;
    }).join("")}</div>
    <p class="muted lgs-how">Como ganhar goiabas: lições (+5, +3 se perfeitas), desafio de 60 s (1 por acerto), meta diária (+10) e o Show do Enzolão (quanto mais acertos, mais goiabas).</p></div>`;
}
function lgShopOpen() { if (!user || !loaded) return; lg = lg || lgLoad(); lgShopRender() }
function lgBuy(id) {
  const sk = skinOf(id); lg = lg || lgLoad();
  if (skinHas(id)) return;
  if ((lg.goiabas || 0) < sk.price) { toast(`Faltam ${sk.price - (lg.goiabas || 0)} goiabas para essa skin.`); return }
  lg.goiabas -= sk.price; lg.skins = { ...(lg.skins || {}), [id]: true }; lg.skin = id; lgSave(true);
  toast(`Skin “${sk.name}” comprada e equipada! 🛍️`); if (typeof lgBeep === "function") lgBeep("ok"); lgShopRender();
}
function lgEquip(id) { if (!skinHas(id)) return; lg.skin = id; lgSave(true); lgShopRender(); toast("Skin equipada!") }
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (c("[data-lg-shop]")) { lgShopOpen(); return }
  if (!$("#lgs-ovl")) return;
  if (c("[data-lgs-close]") || e.target.id === "lgs-ovl") { lgShopClose(); return }
  if (b = c("[data-lgs-tab]")) { lgsTab = b.dataset.lgsTab; lgShopRender(); return }
  if (b = c("[data-lgs-buy]")) { lgBuy(b.dataset.lgsBuy); return }
  if (b = c("[data-lgs-equip]")) { lgEquip(b.dataset.lgsEquip); return }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#lgs-ovl") && !$("#sh-ovl")) lgShopClose() });
