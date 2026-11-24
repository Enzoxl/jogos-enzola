/* =====================================================================
   Enzolingo — Enzola Coins (pontos) e loja de skins do mascote
   Goiabas vêm das lições, do desafio de 60 s, da meta diária e do Show do Enzolão.
   ===================================================================== */
const LG_SKINS = [
  { id: "classico", kind: "hip", name: "Enzola", img: "hipopotamo.webp", price: 0 },
  { id: "festeiro", kind: "hip", name: "Festeiro", img: "loja/h-festeiro.webp", price: 50 },
  { id: "chef", kind: "hip", name: "Chef", img: "loja/h-chef.webp", price: 75 },
  { id: "fone", kind: "hip", name: "DJ de fone", img: "loja/h-fone.webp", price: 100 },
  { id: "pirata", kind: "hip", name: "Pirata", img: "loja/h-pirata.webp", price: 100 },
  { id: "cauboi", kind: "hip", name: "Caubói", img: "loja/h-cauboi.webp", price: 125 },
  { id: "mago", kind: "hip", name: "Mago", img: "loja/h-mago.webp", price: 150 },
  { id: "cavalheiro", kind: "hip", name: "Cavalheiro", img: "loja/h-cavalheiro.webp", price: 190 },
  { id: "heroi", kind: "hip", name: "Super-herói", img: "loja/h-heroi.webp", price: 225 },
  { id: "cruzeirense", kind: "hip", name: "Enzola Cruzeirense", img: "loja/h-cruzeirense.webp", price: 250 },
  { id: "rei", kind: "hip", name: "Enzola King", img: "loja/h-rei.webp", price: 310 },
  { id: "dourado", kind: "hip", name: "Hipopótamo de ouro", img: "loja/h-dourado.webp", price: 500 },
  { id: "ff", kind: "hip", name: "Enzola Free Fire", img: "loja/h-ff.webp", price: 0, group: true, lock: "Meta de grupo · 2000 pts" },
  { id: "ave", kind: "hip", name: "Enzola Pássaro", img: "loja/h-ave.webp", price: 0, group: true, lock: "Conclua todo o Enzolingo" },
  { id: "colecionador", kind: "hip", name: "Colecionador", img: "loja/h-colecionador.webp", price: 0, group: true, lock: "Complete o álbum de hipopótamos" },
  { id: "c10", kind: "chr", name: "Zé goiaba", img: "convite/c10.jpg", price: 75 },
  { id: "c1", kind: "chr", name: "Cão do zap", img: "convite/c1.jpg", price: 90 },
  { id: "c11", kind: "chr", name: "Cachorro sábio", img: "convite/c11.jpg", price: 90 },
  { id: "c17", kind: "chr", name: "Gatinho", img: "convite/c17.jpg", price: 90 },
  { id: "c14", kind: "chr", name: "Lata roxa", img: "convite/c14.jpg", price: 100 },
  { id: "c2", kind: "chr", name: "Galo de casaco", img: "convite/c2.jpg", price: 110 },
  { id: "c9", kind: "chr", name: "Cavalo chique", img: "convite/c9.jpg", price: 110 },
  { id: "c13", kind: "chr", name: "Vaca esperta", img: "convite/c13.jpg", price: 110 },
  { id: "c3", kind: "chr", name: "Leão", img: "convite/c3.jpg", price: 125 },
  { id: "c15", kind: "chr", name: "Veadinho", img: "convite/c15.jpg", price: 125 },
  { id: "c4", kind: "chr", name: "Canguru Roger", img: "convite/c4.jpg", price: 140 },
  { id: "c6", kind: "chr", name: "Pica-pau", img: "convite/c6.jpg", price: 150 },
  { id: "c12", kind: "chr", name: "paiN Alpha", img: "convite/c12.jpg", price: 160 },
  { id: "x-pato", kind: "chr", name: "Pato Josefo", img: "cards/x-pato.webp", price: 90 },
  { id: "x-hamster", kind: "chr", name: "Hamster na câmera", img: "cards/x-hamster.webp", price: 110 },
  { id: "x-lagartixa", kind: "chr", name: "Calango do Mica", img: "cards/x-lagartixa.webp", price: 125 },
  { id: "x-padre", kind: "chr", name: "Hulk Padre", img: "cards/x-padre.webp", price: 150 },
  { id: "c16", kind: "chr", name: "CJ", img: "convite/c16.jpg", price: 175 },
];
const skinAvatarSrc = id => { const s = LG_SKINS.find(x => x.id === id); return s ? (s.kind === "hip" ? `loja/a-${s.id}.webp` : s.img) : null };
const skinOf = id => LG_SKINS.find(s => s.id === id) || LG_SKINS[0];
const skinHas = id => id === "classico" || !!(lg && lg.skins && lg.skins[id]);
function lgSkinImg() {
  const sk = skinOf(lg && lg.skin), own = skinHas(sk.id) ? sk : LG_SKINS[0];
  return `<img class="lgh-img${own.kind === "chr" ? " chr" : ""}" src="${own.img}" alt="" draggable="false">`;
}
const gbI = (cls = "") => `<img class="gb-i ${cls}" src="loja/coin.webp" alt="Enzola Coins">`;
/* ---------- carteira no servidor ----------
   Enzola Coins, skins, fotos do álbum e baús ficam na tabela "wallets" do Supabase. O site só mostra:
   ganhar, comprar, abrir baú, apostar e trocar passam por funções do banco, com limites por jogada e por dia.
   lg.goiabas / lg.skins / lg.album / lg.cx viram um espelho do que veio do servidor. */
const W = { ok: false, data: null, loading: null, missing: false };
const ECON_KEYS = ["goiabas", "skins", "album", "cx", "chests", "free", "bauWelcome", "xf", "freeLeft"];
function walletMirror(s) {
  const w = W.data; if (!w || !s) return s;
  s.goiabas = w.coins | 0; s.skins = { ...(w.skins || {}) }; s.album = { ...(w.album || {}) }; s.cx = { ...(w.chests || {}) };
  s.freeLeft = w.free_left; s.chests = 0; s.bauWelcome = true;
  return s;
}
function walletApply(w) { if (!w || typeof w !== "object" || !("coins" in w)) return; W.data = w; W.ok = true; lg = lg || lgLoad(); walletMirror(lg); try { lsSet(lgKey(), lg) } catch (e) { } }
const walletMsg = e => /does not exist|Could not find the function|schema cache/i.test((e && e.message) || "") ? "Falta rodar o migracao.sql no Supabase (carteira)." : String((e && e.message) || "Não deu certo agora. Tente de novo.").replace(/^.*?ERROR:\s*/, "");
function walletLoad(force) {
  if (!user || !sb) return Promise.resolve(null);
  if (W.loading && !force) return W.loading;
  W.loading = sb.rpc("wallet_get").then(({ data, error }) => {
    if (error) { W.missing = /does not exist|Could not find the function|schema cache/i.test(error.message || ""); return null }
    walletApply(data); return data;
  }, () => null).finally(() => { setTimeout(() => { W.loading = null }, 0) });
  return W.loading;
}
function walletReset() { W.ok = false; W.data = null; W.loading = null; W.missing = false }
/* chama uma função da carteira; devolve a resposta (ou null com aviso) e já atualiza o saldo na tela */
async function walletCall(fn, args, opts = {}) {
  if (!user || !sb) return null;
  const { data, error } = await sb.rpc(fn, args || {});
  if (error) { if (!opts.quiet) toast(walletMsg(error)); return null }
  const w = data && data.wallet ? data.wallet : data && typeof data === "object" && "coins" in data ? data : null;
  if (w) walletApply(w);
  return data;
}
const walletRefresh = () => { if (typeof tab !== "undefined" && tab === "idiomas" && !$("#lg-lesson") && !$("#alb-ovl") && !$("#sh-ovl") && typeof renderLingo === "function") renderLingo(); if ($("#lgs-ovl") && typeof lgShopRender === "function") lgShopRender() };
/* ganhar Enzola Coins jogando (o servidor confere o limite de cada jogo) */
function grpLog(pts) { try { if (sb && user && pts > 0) sb.rpc("group_log", { p_points: Math.min(100, Math.round(pts)) }).then(() => { if (typeof fr !== "undefined" && fr) fr.gloaded = false }, () => {}) } catch (e) {} }
function lgAward(n, source = "lingo", opts = {}) {
  if (!user || !n || n < 0) return 0;
  if (opts.group !== false) grpLog(n);
  lg = lg || lgLoad();
  if (W.missing) { lg.goiabas = (lg.goiabas || 0) + n; lgSave(true); return n }   // banco ainda sem a carteira
  lg.goiabas = (lg.goiabas || 0) + n; lgSave(true);   // aparece na hora (e salva as estatísticas do jogo); o servidor confirma em seguida
  walletCall("wallet_earn", { p_source: source, p_coins: Math.round(n) }, { quiet: true }).then(d => {
    if (!d) { walletLoad(true).then(walletRefresh); return }
    if (d.got < n) toast(d.got ? `Limite de moedas de hoje: entraram ${d.got} de ${n}.` : "Limite de moedas de hoje atingido neste jogo.");
    walletRefresh();
  });
  return n;
}

let lgsTab = "hip";
function lgShopBox() { let b = $("#lgs-ovl"); if (!b) { b = document.createElement("div"); b.id = "lgs-ovl"; b.className = "lgs-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Loja de skins"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function lgShopClose() { const b = $("#lgs-ovl"); if (b) b.remove(); document.documentElement.classList.remove("lg-open"); if (tab === "idiomas") renderLingo() }
function lgShopRender() {
  lg = lg || lgLoad(); const cur = skinOf(lg.skin), bal = lg.goiabas || 0;
  const list = LG_SKINS.filter(s => s.kind === lgsTab);
  lgShopBox().innerHTML = `<div class="lgs"><button class="iconbtn lgs-x" data-lgs-close aria-label="Fechar a loja">${ic("x")}</button>
    <header class="lgs-h"><div class="lgs-t"><h2>${ic("store")}Loja de skins</h2><p class="muted">Cada skin é um pacote: mascote, avatar e banner temáticos para o perfil.</p></div>
      <div class="lgs-bal" aria-label="Seu saldo">${gbI("big")}<b>${bal}</b></div></header>
    <div class="lgs-prev"><div class="lgs-pv${cur.kind === "chr" ? " chr" : ""}"><img src="${cur.img}" alt=""></div><div><small class="muted">Equipado agora</small><b>${esc(cur.name)}</b></div></div>
    ${typeof chestShopHTML === "function" ? chestShopHTML(bal) : ""}
    <div class="lgs-tabs" role="tablist"><button role="tab" aria-selected="${lgsTab === "hip"}" data-lgs-tab="hip">🦛 Hipopótamo</button><button role="tab" aria-selected="${lgsTab === "chr"}" data-lgs-tab="chr">🫧 Personagens</button></div>
    <div class="lgs-grid">${list.map(sk => {
      const own = skinHas(sk.id), on = lg.skin === sk.id || (!lg.skin && sk.id === "classico"), can = bal >= sk.price;
      return `<div class="lgs-card${on ? " on" : ""}"><div class="lgs-img${sk.kind === "chr" ? " chr" : ""}"><img src="${sk.img}" alt=""></div><b>${esc(sk.name)}</b>
        <div class="lgs-pack" title="O pacote inclui skin, avatar e banner"><img src="${skinAvatarSrc(sk.id)}" alt="" class="pk-av"><img src="loja/b-${sk.id}.webp" alt="" class="pk-ban" loading="lazy"></div>
        ${on ? `<span class="lgs-eq">${ic("check")}Equipado</span>` : own ? `<button class="btn sm" data-lgs-equip="${sk.id}">Equipar</button>` : sk.group ? `<span class="lgs-lock">🔒 ${esc(sk.lock || "Conquista especial")}</span>` : `<button class="btn sm lgs-buy${can ? "" : " lack"}" data-lgs-buy="${sk.id}" aria-label="Comprar ${esc(sk.name)} por ${sk.price} Enzola Coins">${gbI()}${sk.price}</button>`}
        ${sk.price > 0 && !sk.group && typeof xfStart === "function" ? `<button class="btn ghost sm lgs-gift" data-xf="giftskin:${sk.id}" aria-label="Presentear um amigo com ${esc(sk.name)}">🎁 Presentear</button>` : ""}
        ${own ? `<button class="btn ghost sm lgs-av${profile && profile.avatar === "skin:" + sk.id && profile.banner === "skin:" + sk.id ? " on" : ""}" data-lgs-avatar="${sk.id}">${profile && profile.avatar === "skin:" + sk.id && profile.banner === "skin:" + sk.id ? "Pacote no perfil" : "Usar pacote no perfil"}</button>` : ""}</div>`;
    }).join("")}</div>
    <p class="muted lgs-how">Como ganhar Enzola Coins: lições (+5, +3 se perfeitas), desafio de 60 s (1 por acerto), meta diária (+10) e o Show do Enzolão (quanto mais acertos, mais Enzola Coins).</p></div>`;
}
function lgShopOpen() { if (!user || !loaded) return; lg = lg || lgLoad(); lgShopRender() }
async function lgBuy(id) {
  const sk = skinOf(id); lg = lg || lgLoad();
  if (skinHas(id) || sk.group || lgBuy.busy) return;
  if (!W.missing) {
    if ((lg.goiabas || 0) < sk.price) { toast(`Faltam ${sk.price - (lg.goiabas || 0)} Enzola Coins para essa skin.`); return }
    lgBuy.busy = true; const d = await walletCall("wallet_buy_skin", { p_id: id }); lgBuy.busy = false; if (!d) return;
    lg.skin = id; lgSave(true); toast(`Skin “${sk.name}” comprada e equipada! 🛍️`); if (typeof lgBeep === "function") lgBeep("ok"); lgShopRender(); return;
  }
  if ((lg.goiabas || 0) < sk.price) { toast(`Faltam ${sk.price - (lg.goiabas || 0)} Enzola Coins para essa skin.`); return }
  lg.goiabas -= sk.price; lg.skins = { ...(lg.skins || {}), [id]: true }; lg.skin = id; lgSave(true);
  toast(`Skin “${sk.name}” comprada e equipada! 🛍️`); if (typeof lgBeep === "function") lgBeep("ok"); lgShopRender();
}
async function lgAvatar(id) {
  if (!skinHas(id) || !profile) return;
  if (await saveProfile({ avatar: "skin:" + id, banner: "skin:" + id })) { toast("Avatar e banner do pacote aplicados no perfil! ✨"); lgShopRender() }
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
  if (b = c("[data-lgs-avatar]")) { lgAvatar(b.dataset.lgsAvatar); return }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#lgs-ovl") && !$("#sh-ovl")) lgShopClose() });

/* editor de perfil: skins da loja como avatar */
function skinsHTML() {
  try { lg = lg || lgLoad() } catch (e) { return "" }
  const own = LG_SKINS.filter(s => skinHas(s.id));
  return `<div class="rw-box"><div class="fld" style="margin-bottom:6px">Pacotes de skin <span class="hint">· compre na loja do Enzolingo com Enzola Coins</span></div>
    <div class="sk-row">${own.map(s => `<button type="button" class="sk-b" data-equip-pack="avatar:${s.id}" title="Avatar: ${esc(s.name)}" aria-label="Usar o avatar ${esc(s.name)}"><img src="${skinAvatarSrc(s.id)}" alt="" width="52" height="52"></button>`).join("")}</div>
    <div class="sk-row sk-ban">${own.map(s => `<button type="button" class="sk-bn" data-equip-pack="banner:${s.id}" title="Banner: ${esc(s.name)}" aria-label="Usar o banner ${esc(s.name)}"><img src="loja/b-${s.id}.webp" alt="" loading="lazy"></button>`).join("")}</div>
    <div class="sk-row">${own.map(s => `<button type="button" class="btn ghost sm" data-equip-pack="both:${s.id}">Pacote ${esc(s.name)}</button>`).join("")}</div></div>`;
}
