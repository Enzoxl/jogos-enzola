/* Jogos Enzola — trocas de fotos repetidas e presentes entre amigos
   - Troca: você oferece uma foto repetida e pede uma foto do álbum do amigo. Ele aceita se tiver a foto repetida.
   - Presente: foto repetida (de graça) ou skin da loja (você paga o preço em Enzola Coins).
   O item sai do seu inventário ao enviar (fica "reservado") e volta se a proposta for recusada ou cancelada.
   Tabela item_transfers (Supabase), funções transfer_create / transfer_respond / transfer_cancel. */
let xf = { list: [], loaded: false, rt: false, st: null };
const xfMe = () => user && user.id;
const xfPhoto = id => ALBUM.find(p => p.id === id);
const xfSpare = id => Math.max(0, ((lg && lg.album && lg.album[id]) || 0) - 1);
const xfGiftSkins = () => LG_SKINS.filter(s => s.price > 0 && !s.group);
const xfName = uid => pName(pOf(uid));
const xfIn = () => xf.list.filter(t => t.to_user === xfMe() && t.status === "pending");
const xfOut = () => xf.list.filter(t => t.from_user === xfMe() && t.status === "pending");

/* ---------- inventário local ---------- */
function xfAdd(it, n = 1) {
  lg = lg || lgLoad(); lg.album = lg.album || {}; lg.skins = lg.skins || {};
  if (it.t === "photo") lg.album[it.id] = Math.max(0, (lg.album[it.id] || 0) + n);
  else if (it.t === "skin") { if (n > 0) { if (lg.skins[it.id]) lg.goiabas = (lg.goiabas || 0) + (skinOf(it.id).price || 0); else lg.skins[it.id] = true } }
}
function xfMark(k) { lg.xf = lg.xf || {}; lg.xf[k] = 1; const ks = Object.keys(lg.xf); if (ks.length > 120) delete lg.xf[ks[0]] }
// recebe o item da proposta aceita (quem recebe) e entrega a foto pedida (troca)
function xfApplyRecv(t) {
  lg = lg || lgLoad(); lg.xf = lg.xf || {}; if (lg.xf["r" + t.id]) return false;
  xfAdd(t.give, 1); if (t.kind === "trade" && t.want) xfAdd(t.want, -1);
  xfMark("r" + t.id); return true;
}
// acerta as contas de quem enviou: devolve se recusada/cancelada, recebe a foto pedida se aceita
function xfSettle() {
  if (!user || !lg) return;
  lg.xf = lg.xf || {}; let ch = false; const me = xfMe();
  for (const t of xf.list) {
    if (t.from_user === me && t.status !== "pending" && !lg.xf["s" + t.id]) {
      if (t.status === "declined" || t.status === "cancelled") { if (t.give.t === "skin") lg.goiabas = (lg.goiabas || 0) + (skinOf(t.give.id).price || 0); else xfAdd(t.give, 1) }
      else if (t.status === "accepted" && t.kind === "trade" && t.want) xfAdd(t.want, 1);
      xfMark("s" + t.id); ch = true;
    }
    if (t.to_user === me && t.status === "accepted" && !lg.xf["r" + t.id]) { xfApplyRecv(t); ch = true }
  }
  if (ch) { lgSave(true); try { rewardsCheck() } catch (e) { } if (typeof tab !== "undefined" && tab === "idiomas" && !$("#xf-ovl") && !$("#lgs-ovl")) renderLingo() }
}
async function xfLoad() {
  if (!sb || !user || !(typeof caps !== "undefined" && caps.v3)) return;
  lg = lg || lgLoad();
  const me = xfMe(), since = new Date(Date.now() - 60 * 864e5).toISOString();
  const { data, error } = await sb.from("item_transfers").select("*").or(`from_user.eq.${me},to_user.eq.${me}`).gt("updated_at", since).order("updated_at", { ascending: false }).limit(80);
  if (error) return; xf.list = data || []; xf.loaded = true;
  if (typeof fr !== "undefined" && !fr.loaded && typeof loadFriends === "function") await loadFriends();
  xfSettle();
  if (!xf.rt) {
    xf.rt = true;
    sb.channel("xf-" + me).on("postgres_changes", { event: "*", schema: "public", table: "item_transfers" }, p => {
      const r = p.new; if (!r || !r.id) return xfLoad();
      xf.list = xf.list.filter(x => x.id !== r.id); xf.list.unshift(r); xfSettle();
      if ($("#xf-ovl") && xf.st && xf.st.step === "inbox") xfRender();
    }).subscribe();
  }
  if ($("#xf-ovl") && xf.st && xf.st.step === "inbox") xfRender();
}

/* ---------- apresentação ---------- */
const xfItem = (it, big) => {
  if (!it) return "";
  if (it.t === "photo") { const p = xfPhoto(it.id); return p ? `<div class="xf-it${big ? " big" : ""}"><img src="${esc(p.img)}" alt=""><span>${esc(p.name)}</span></div>` : "" }
  const s = LG_SKINS.find(x => x.id === it.id); return s ? `<div class="xf-it skin${s.kind === "chr" ? " chr" : ""}${big ? " big" : ""}"><img src="${esc(s.img)}" alt=""><span>${esc(s.name)}</span></div>` : ""
};
function xfBox(inner) {
  let b = $("#xf-ovl");
  if (!b) { b = document.createElement("div"); b.id = "xf-ovl"; b.className = "alb-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); document.body.appendChild(b); document.documentElement.classList.add("lg-open") }
  b.innerHTML = `<div class="alb-box xf"><button class="iconbtn lgs-x" data-xf="close" aria-label="Fechar">${ic("x")}</button>${inner}</div>`;
}
function xfClose() {
  const b = $("#xf-ovl"); if (b) b.remove(); xf.st = null;
  if (!$("#lgs-ovl") && !$("#alb-ovl") && !$("#sh-ovl")) document.documentElement.classList.remove("lg-open");
  if (typeof tab !== "undefined" && tab === "idiomas" && !$("#lgs-ovl")) renderLingo();
}
function xfSectionHTML() {
  if (!user) return "";
  lg = lg || lgLoad(); const dup = ALBUM.reduce((a, p) => a + xfSpare(p.id), 0), inn = xfIn().length;
  return `<div class="alb-cx panel xf-sec"><div class="alb-free"><div><b>🔁 Trocas e presentes</b><small class="muted">Você tem ${dup} foto${dup === 1 ? "" : "s"} repetida${dup === 1 ? "" : "s"}. Troque ou presenteie amigos.</small></div></div>
    <div class="xf-btns"><button class="btn sm" data-xf="start:trade">🔁 Propor troca</button><button class="btn sm" data-xf="start:gift">🎁 Presentear</button><button class="btn ghost sm" data-xf="inbox">📥 Propostas${inn ? ` <span class="ubadge light">${inn}</span>` : ""}</button></div></div>`;
}
function xfRender() {
  const s = xf.st; if (!s) return;
  lg = lg || lgLoad(); const back = (to) => `<button class="btn ghost sm" data-xf="step:${to}">← Voltar</button>`;
  const title = s.mode === "trade" ? "🔁 Propor troca" : "🎁 Presentear";
  if (s.step === "inbox") return xfBox(xfInboxHTML());
  if (s.step === "friend") {
    const fl = typeof frAccepted === "function" ? frAccepted().map(f => pOf(other(f))) : [];
    return xfBox(`<h2>${title}</h2><p class="sub">Escolha o amigo.</p>${fl.length ? `<div class="flist xf-fl">${fl.map(p => `<div class="fcard"><div class="fhead"><div class="av md">${avatar(p.avatar)}</div><div class="fi"><div class="fn">${esc(pName(p))}</div><div class="fu">@${esc(p.username || "")}</div></div></div><div class="fa"><button class="btn sm" data-xf="to:${p.user_id}">Escolher</button></div></div>`).join("")}</div>` : `<div class="panel empty"><b>Nenhum amigo ainda</b>Adicione amigos na aba Amigos.</div>`}`);
  }
  const who = esc(xfName(s.to));
  if (s.step === "give") {
    const photos = ALBUM.filter(p => xfSpare(p.id) > 0), skins = xfGiftSkins(), bal = lg.goiabas || 0;
    const showTabs = s.mode === "gift";
    const pgrid = photos.length ? `<div class="xf-grid">${photos.map(p => `<button class="xf-pick" data-xf="give:photo:${p.id}"><img src="${esc(p.img)}" alt=""><b>${esc(p.name)}</b><small>${xfSpare(p.id)} repetida${xfSpare(p.id) > 1 ? "s" : ""}</small></button>`).join("")}</div>` : `<div class="panel empty"><b>Sem fotos repetidas</b>Abra baús na aba Álbum: quando vier uma foto que você já tem, ela aparece aqui.</div>`;
    const sgrid = `<div class="xf-grid skins">${skins.map(k => `<button class="xf-pick${k.kind === "chr" ? " chr" : ""}" data-xf="give:skin:${k.id}"${bal < k.price ? " disabled" : ""}><img src="${esc(k.img)}" alt=""><b>${esc(k.name)}</b><small>${gbI()}${k.price}${bal < k.price ? " · faltam moedas" : ""}</small></button>`).join("")}</div>`;
    return xfBox(`<h2>${title} · ${who}</h2><p class="sub">${s.mode === "trade" ? "Escolha a foto repetida que você oferece." : "Escolha o presente."}</p>
      ${showTabs ? `<div class="lgs-tabs" role="tablist"><button role="tab" aria-selected="${s.gtab === "photo"}" data-xf="gtab:photo">📸 Fotos repetidas</button><button role="tab" aria-selected="${s.gtab === "skin"}" data-xf="gtab:skin">🛍️ Skins da loja</button></div>` : ""}
      ${s.mode === "trade" || s.gtab === "photo" ? pgrid : sgrid}<div class="acts">${back("friend")}</div>`);
  }
  if (s.step === "want") {
    const list = ALBUM.filter(p => p.id !== s.give.id).sort((a, b) => ((lg.album[a.id] || 0) > 0) - ((lg.album[b.id] || 0) > 0) || a.id.localeCompare(b.id));
    return xfBox(`<h2>🔁 Troca com ${who}</h2><p class="sub">Qual foto você quer em troca? Ele só aceita se tiver essa foto repetida. As que faltam no seu álbum vêm primeiro.</p>
      <div class="xf-grid">${list.map(p => { const n = lg.album[p.id] || 0; return `<button class="xf-pick" data-xf="want:${p.id}"><img src="${esc(p.img)}" alt=""><b>${esc(p.name)}</b><small>${n ? `Você tem ×${n}` : "⭐ Falta no álbum"}</small></button>` }).join("")}</div><div class="acts">${back("give")}</div>`);
  }
  if (s.step === "confirm") {
    const skin = s.give.t === "skin", price = skin ? skinOf(s.give.id).price : 0;
    return xfBox(`<h2>${s.mode === "trade" ? "Confirmar troca" : "Confirmar presente"}</h2>
      <div class="xf-sum"><div><small>Você ${s.mode === "trade" ? "oferece" : "dá"}</small>${xfItem(s.give, true)}</div>${s.mode === "trade" ? `<div class="xf-ar">⇄</div><div><small>Você quer</small>${xfItem({ t: "photo", id: s.want }, true)}</div>` : `<div class="xf-ar">→</div><div><small>Para</small><div class="xf-who"><div class="av md">${avatar(pOf(s.to).avatar)}</div><b>${who}</b></div></div>`}</div>
      <p class="muted xf-note">${skin ? `Você paga <b>${price} Enzola Coins</b> agora. Se ${who} recusar, as moedas voltam.` : s.mode === "trade" ? `A sua foto fica reservada até ${who} responder. Se ele recusar, ela volta pra você.` : `A foto fica reservada até ${who} responder. Se ele recusar, ela volta pra você.`}</p>
      <div class="acts">${back(s.mode === "trade" ? "want" : "give")}<button class="btn" data-xf="send">${s.mode === "trade" ? "Enviar proposta" : "Enviar presente"}</button></div>`);
  }
}
function xfInboxHTML() {
  const me = xfMe(), inc = xfIn(), out = xfOut(), hist = xf.list.filter(t => t.status !== "pending").slice(0, 8);
  const row = (t, mine) => {
    const other = mine ? t.to_user : t.from_user, trade = t.kind === "trade";
    return `<div class="xf-row"><div class="xf-rh"><b>${esc(xfName(other))}</b> <span class="muted">${mine ? (trade ? "recebe a sua oferta" : "vai receber seu presente") : (trade ? "propôs uma troca" : "enviou um presente")}</span></div>
      <div class="xf-sum sm"><div>${xfItem(t.give)}</div>${trade ? `<div class="xf-ar">⇄</div><div>${xfItem(t.want)}</div>` : ""}</div>${mine ? `<div class="acts"><button class="btn ghost sm" data-xf="cancel:${t.id}">Cancelar proposta</button></div>` : acts(t)}</div>`;
  };
  const acts = t => {
    let note = "", ok = true;
    if (t.kind === "trade") { const n = (lg.album[t.want.id] || 0); if (n < 2) { ok = false; note = `<small class="muted">Você precisa de uma cópia repetida de ${esc((xfPhoto(t.want.id) || {}).name || "essa foto")} para aceitar.</small>` } else note = `<small class="muted">Você entrega ${esc((xfPhoto(t.want.id) || {}).name || "a foto")}.</small>` }
    else if (t.give.t === "skin" && lg.skins && lg.skins[t.give.id]) note = `<small class="muted">Você já tem essa skin: ao aceitar ela vira ${skinOf(t.give.id).price} moedas.</small>`;
    return `${note}<div class="acts"><button class="btn sm" data-xf="acc:${t.id}"${ok ? "" : " disabled"}>Aceitar</button><button class="btn ghost sm" data-xf="dec:${t.id}">Recusar</button></div>`;
  };
  const stTxt = t => ({ accepted: "aceita ✅", declined: "recusada", cancelled: "cancelada" }[t.status]);
  return `<h2>📥 Propostas</h2>
    <h3 class="xf-h">Recebidas${inc.length ? ` (${inc.length})` : ""}</h3>${inc.length ? inc.map(t => row(t, false)).join("") : `<p class="muted">Nenhuma proposta pra você agora.</p>`}
    <h3 class="xf-h">Enviadas${out.length ? ` (${out.length})` : ""}</h3>${out.length ? out.map(t => row(t, true)).join("") : `<p class="muted">Você não tem propostas em aberto.</p>`}
    ${hist.length ? `<h3 class="xf-h">Recentes</h3><div class="xf-hist">${hist.map(t => { const mine = t.from_user === me; return `<div class="xf-hr"><span>${mine ? "Para" : "De"} <b>${esc(xfName(mine ? t.to_user : t.from_user))}</b> · ${t.kind === "trade" ? "troca" : "presente"} ${stTxt(t)}</span></div>` }).join("")}</div>` : ""}
    <div class="acts"><button class="btn ghost sm" data-xf="start:trade">🔁 Nova troca</button><button class="btn ghost sm" data-xf="start:gift">🎁 Novo presente</button></div>`;
}

/* ---------- ações ---------- */
async function xfStart(mode, o = {}) {
  if (!user) return toast("Entre na sua conta para trocar e presentear.");
  lg = lg || lgLoad();
  if (typeof fr !== "undefined" && !fr.loaded && typeof loadFriends === "function") await loadFriends();
  xf.st = { mode, step: o.to ? (o.give ? "confirm" : "give") : "friend", to: o.to || null, give: o.give || null, want: null, gtab: o.gtab || "photo" };
  if (o.give && o.give.t === "skin") xf.st.gtab = "skin";
  xfRender();
}
async function xfSend() {
  const s = xf.st; if (!s || !s.to || !s.give) return;
  lg = lg || lgLoad(); const g = s.give, price = g.t === "skin" ? skinOf(g.id).price : 0;
  if (g.t === "photo" && xfSpare(g.id) < 1) return toast("Essa foto não está mais repetida.");
  if (g.t === "skin" && (lg.goiabas || 0) < price) return toast("Você não tem Enzola Coins suficientes.");
  if (s.mode === "trade" && !s.want) return;
  if (g.t === "photo") xfAdd(g, -1); else lg.goiabas -= price;
  lgSave(true);
  const { data, error } = await sb.rpc("transfer_create", { p_to: s.to, p_kind: s.mode, p_give: g, p_want: s.mode === "trade" ? { t: "photo", id: s.want } : null });
  if (error) {
    if (g.t === "photo") xfAdd(g, 1); else lg.goiabas += price; lgSave(true);
    return toast(/demais|em aberto/i.test(error.message) ? error.message : "Não foi possível enviar agora.");
  }
  xf.list.unshift(data); const nm = xfName(s.to);
  toast(s.mode === "trade" ? `Proposta de troca enviada para ${nm}! 🔁` : `Presente enviado para ${nm}! 🎁`);
  xfClose();
}
async function xfAnswer(id, ok) {
  const t = xf.list.find(x => x.id === id); if (!t) return;
  lg = lg || lgLoad();
  if (ok && t.kind === "trade" && (lg.album[t.want.id] || 0) < 2) return toast("Você não tem essa foto repetida.");
  const { data, error } = await sb.rpc("transfer_respond", { p_id: id, p_accept: ok });
  if (error) return toast("Essa proposta não está mais disponível."), xfLoad();
  xf.list = xf.list.map(x => x.id === id ? data : x);
  if (ok) { xfApplyRecv(data); lgSave(true); try { rewardsCheck() } catch (e) { } toast(data.give.t === "skin" ? "Skin recebida! 🎁" : "Foto recebida! 📸") }
  xfRender();
}
async function xfCancel(id) {
  const { data, error } = await sb.rpc("transfer_cancel", { p_id: id });
  if (error) return toast("Essa proposta não está mais disponível."), xfLoad();
  xf.list = xf.list.map(x => x.id === id ? data : x); xfSettle(); toast("Proposta cancelada. O item voltou pra você."); xfRender();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-xf]"); if (!b) return;
  const [a, v, w] = b.dataset.xf.split(":"), s = xf.st;
  if (a === "close") return xfClose();
  if (a === "start") return xfStart(v);
  if (a === "giftskin") return xfStart("gift", { give: { t: "skin", id: v }, gtab: "skin" });
  if (a === "inbox") { xf.st = { step: "inbox" }; xfRender(); return xfLoad() }
  if (a === "acc") return xfAnswer(v, true);
  if (a === "dec") return xfAnswer(v, false);
  if (a === "cancel") return xfCancel(v);
  if (!s) return;
  if (a === "step") { s.step = v; return xfRender() }
  if (a === "to") { s.to = v; s.step = s.give ? "confirm" : "give"; return xfRender() }
  if (a === "gtab") { s.gtab = v; return xfRender() }
  if (a === "give") { s.give = { t: v, id: w }; s.step = s.mode === "trade" ? "want" : "confirm"; return xfRender() }
  if (a === "want") { s.want = v; s.step = "confirm"; return xfRender() }
  if (a === "send") return xfSend();
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#xf-ovl")) xfClose() });
