/* Jogos Enzola — busca global, página do jogo e preços (lojas confiáveis, em reais) */

/* ---------- servidor (função "enzola") ---------- */
const FN = () => CFG.FUNCTION || CFG.PRICE_FUNCTION || "";
async function api(action, body = {}) {
  if (!FN() || !sb) { const e = new Error("sem_funcao"); e.code = "sem_funcao"; throw e }
  const { data, error } = await sb.functions.invoke(FN(), { body: { action, ...body } });
  if (error) {
    let msg = error.message || "erro";
    try { const j = await error.context.json(); msg = j.error || msg } catch (e) { }
    const er = new Error(msg); er.code = msg; throw er;
  }
  return data;
}

/* link da ficha do jogo: RAWG (#jogo/123) ou só Steam (#jogo/s123) */
const gameHref = g => g && g.rawg_id ? `jogo/${g.rawg_id}` : g && g.steam_id ? `jogo/s${g.steam_id}` : "";

/* ---------- RAWG ---------- */
const RAWG = "https://api.rawg.io/api";
async function rawg(path, params = {}, signal) {
  const u = new URL(RAWG + path); u.searchParams.set("key", CFG.RAWG_KEY || "");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  let r;
  try { r = await fetch(u, { signal }) } catch (e) { if (e.name === "AbortError") throw e; const er = new Error("rede"); er.kind = "net"; throw er }
  if (!r.ok) { const er = new Error("rawg " + r.status); er.kind = r.status === 401 || r.status === 403 ? "key" : r.status === 429 ? "limit" : "server"; er.status = r.status; throw er }
  return r.json();
}

/* ---------- pesquisa de jogos: RAWG + Steam, com ordem de relevância ---------- */
const STEAM_IMG = id => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}`;
const searchCache = new Map();
const JUNK = /\b(soundtrack|ost|dlc|season pass|expansion pack|bundle|demo|artbook|wallpaper|costume|skin pack|upgrade|playtest)\b/i;
function nameScore(name, q) {
  const n = norm(name), qq = norm(q), words = qq.split(" ").filter(Boolean), nw = n.split(" ");
  if (!qq) return 0;
  if (n === qq) return 120;
  if (n.replace(/ /g, "") === qq.replace(/ /g, "")) return 110;
  if (n.startsWith(qq + " ") || n.startsWith(qq)) return 80 - Math.min(20, (n.length - qq.length) / 3);
  if (words.every(w => nw.includes(w))) return 60 - Math.min(20, nw.length - words.length);
  if (words.every(w => n.includes(w))) return 40;
  return words.filter(w => n.includes(w)).length / words.length * 25;
}
function rankItems(items, q) {
  return items.map(x => {
    let sc = nameScore(x.name, q);
    sc += Math.log10(1 + (x.pop || 0)) * 9;          // quantas pessoas têm o jogo (RAWG) ou destaque na Steam
    if (x.mc) sc += (x.mc - 60) / 4;                  // nota da crítica
    if (x.rating) sc += x.rating * 2;
    if (JUNK.test(x.name) && !JUNK.test(q)) sc -= 45; // trilha sonora, DLC, demo...
    return { ...x, score: sc };
  }).sort((a, b) => b.score - a.score);
}
function fromRawg(x) {
  const pp = parentPlats(x);
  return { key: "r" + x.id, go: `jogo/${x.id}`, name: x.name, img: x.background_image || "", year: (x.released || "").slice(0, 4), plats: pp, mc: x.metacritic || null, rating: x.rating || 0, pop: x.added || x.ratings_count || 0,
    draft: { name: x.name, year: (x.released || "").slice(0, 4), genre: (x.genres || []).map(g => g.name).slice(0, 2).join(", "), platform: preferredOf(pp), cover_url: x.background_image || "", rawg_id: x.id || null, metacritic: x.metacritic || null, playtime: x.playtime || null, _plats: pp.join(", ") } };
}
function fromSteam(x, rank) {
  return { key: "s" + x.id, go: `jogo/s${x.id}`, name: x.name, img: x.img || `${STEAM_IMG(x.id)}/capsule_231x87.jpg`, year: "", plats: ["PC"], mc: x.metascore || null, rating: 0, pop: Math.max(0, 400 - rank * 40), steam: x.id,
    draft: { name: x.name, year: "", genre: "", platform: "PC", cover_url: `${STEAM_IMG(x.id)}/library_600x900.jpg`, steam_id: x.id, metacritic: x.metascore || null, _plats: "PC" } };
}
function searchError(errs) {
  if (navigator.onLine === false) return "Você está sem internet. Conecte-se e tente de novo.";
  const k = errs.map(e => e && e.kind);
  if (k.includes("limit")) return "Muitas pesquisas em pouco tempo. Espere alguns segundos e tente de novo.";
  if (k.includes("key")) return "A base de jogos (RAWG) recusou a chave do site. Avise o administrador para trocar a RAWG_KEY no config.js.";
  if (k.includes("server")) return "A base de jogos está instável agora. Tente de novo em instantes.";
  return "Não foi possível pesquisar agora. Tente de novo em instantes.";
}
async function searchGames(q, n = 10, signal) {
  const key = norm(q) + "|" + n; if (searchCache.has(key)) return searchCache.get(key);
  const errs = [];
  const [r, st] = await Promise.all([
    CFG.RAWG_KEY ? rawg("/games", { search: q, page_size: 20, search_precise: "true" }, signal).catch(e => { if (e.name === "AbortError") throw e; errs.push(e); return null }) : null,
    FN() ? api("busca", { q }).catch(e => { errs.push(e); return null }) : null,
  ]);
  if (!r && !st) { const e = new Error(searchError(errs)); e.user = true; throw e }
  const items = ((r && r.results) || []).map(fromRawg);
  const seen = new Map(items.map(x => [norm(x.name), x]));
  ((st && st.items) || []).forEach((x, i) => {
    const m = seen.get(norm(x.name));
    if (m) { m.steam = x.id; m.pop += 50 } else { const it = fromSteam(x, i); items.push(it); seen.set(norm(x.name), it) }
  });
  // a base principal (RAWG) falhou e a Steam não achou nada: mostra o motivo em vez de "nenhum jogo"
  if (!items.length && errs.length) { const e = new Error(searchError(errs)); e.user = true; throw e }
  const out = rankItems(items, q).slice(0, n);
  searchCache.set(key, out); if (searchCache.size > 60) searchCache.delete(searchCache.keys().next().value);
  return out;
}
async function rawgSearch(q, n = 8) { return searchGames(q, n) }
const PSLUG = { pc: "PC", playstation: "PlayStation", xbox: "Xbox", nintendo: "Switch" };
function parentPlats(x) {
  let s = (x.parent_platforms || []).map(p => PSLUG[p.platform.slug]).filter(Boolean);
  if (!s.length) {
    const t = (x.platforms || []).map(p => p.platform.name).join(" ");
    s = [/PC/.test(t) && "PC", /PlayStation/.test(t) && "PlayStation", /Xbox/.test(t) && "Xbox", /Nintendo/.test(t) && "Switch"].filter(Boolean);
  }
  return [...new Set(s)];
}
const preferredOf = pp => pp.includes(setting("platform", "PC")) ? setting("platform", "PC") : pp.includes("PC") ? "PC" : pp[0] || "";
function rawgToDraft(x) {
  if (x.draft) return x.draft;
  const pp = parentPlats(x);
  return { name: x.name, year: (x.released || "").slice(0, 4), genre: (x.genres || []).map(g => g.name).slice(0, 2).join(", "), platform: preferredOf(pp), cover_url: x.background_image || "", rawg_id: x.id || null, metacritic: x.metacritic || null, playtime: x.playtime || null, _plats: pp.join(", ") };
}
const platLabel = p => p ? esc(p) : "Plataforma não informada";
const platIcon = p => p === "PC" ? "monitor" : "gamepad";

/* ---------- lojas confiáveis ---------- */
const OFICIAIS = [/^steam/i, /epic/i, /^gog/i, /microsoft/i, /xbox/i, /playstation/i, /nintendo/i, /ubisoft|uplay/i, /^ea\b|origin|ea app/i, /blizzard|battle\.?net/i];
const REVENDAS = [/nuuvem/i, /humble/i, /fanatical/i, /green ?man ?gaming|greenmangaming/i, /gamesplanet/i, /gamersgate/i];
function shopKind(n) { n = String(n || ""); return OFICIAIS.some(r => r.test(n)) ? "oficial" : REVENDAS.some(r => r.test(n)) ? "revenda" : null }
const isBRshop = n => /nuuvem/i.test(n || "");
let usdRate = (lsGet("usdbrl") || {}).r || null, priceRun = false;
const priceState = {};
const brl = d => !d ? null : d.currency === "USD" ? (usdRate ? d.amount * usdRate : null) : d.amount;
const sortVal = d => brl(d) ?? d.amount * 6;
function dealsOf(p) {
  if (!p || p.none || !Array.isArray(p.deals)) return [];
  const res = setting("resellers", true);
  return p.deals.map(d => ({ ...d, currency: d.currency || p.currency || "BRL", kind: shopKind(d.shop), br: isBRshop(d.shop) || d.br }))
    .filter(d => d.kind && d.amount != null && (res || d.kind === "oficial")).sort((a, b) => sortVal(a) - sortVal(b));
}
const bestOf = g => g && !isConsole(g.platform) ? dealsOf(g.price)[0] || null : null;
const priceFresh = g => g.price && g.price_checked_at && Date.now() - new Date(g.price_checked_at).getTime() < PRICE_TTL;
function priceHTML(d, field = "amount") {
  const v = d[field]; if (v == null) return "";
  if (d.currency === "USD") return usdRate ? `${money(v * usdRate, "BRL")} <span class="usd">(${money(v, "USD")})</span>` : money(v, "USD");
  return money(v, d.currency);
}
const kindChip = d => `<span class="kchip ${d.kind}">${d.kind === "oficial" ? "Loja oficial" : "Revenda autorizada"}</span>${d.br ? `<span class="kchip br">BR</span>` : ""}`;
const priceSourceText = () => FN() ? "Menor preço em lojas confiáveis, em reais. Itens em dólar são convertidos pela cotação do dia." : "Menor preço de PC em lojas confiáveis. Os valores em dólar são convertidos para reais pela cotação do dia (o valor original fica entre parênteses).";

let csStoreMap = null;
async function csStores() {
  if (csStoreMap) return csStoreMap;
  const c = lsGet("cs-stores"); if (c && Date.now() - c.t < 7 * 864e5) return csStoreMap = c.m;
  const r = await fetch("https://www.cheapshark.com/api/1.0/stores"); const j = await r.json();
  csStoreMap = {}; for (const s of j) csStoreMap[s.storeID] = s.storeName;
  lsSet("cs-stores", { t: Date.now(), m: csStoreMap }); return csStoreMap;
}
async function getRate() {
  const c = lsGet("usdbrl"); if (c && Date.now() - c.t < PRICE_TTL) return usdRate = c.r;
  for (const u of ["https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL", "https://api.frankfurter.app/latest?from=USD&to=BRL"]) {
    try { const j = await (await fetch(u)).json(); if (j.rates && j.rates.BRL) { usdRate = j.rates.BRL; lsSet("usdbrl", { t: Date.now(), r: usdRate }); return usdRate } } catch (e) { }
  }
  return usdRate;
}
async function fetchPrice(name) {
  const checked = new Date().toISOString();
  if (FN() && sb) {
    try {
      const r = await api("precos", { title: name, country: "BR" });
      if (r && !r.error) {
        const deals = (r.deals || []).filter(d => shopKind(d.shop)).slice(0, 10);
        if (r.none || !deals.length) return { none: true, source: "itad", checked };
        return { source: "itad", currency: r.currency || "BRL", deals, low: r.low ?? null, title: r.title || name, checked };
      }
    } catch (e) { /* sem chave do IsThereAnyDeal: usa o CheapShark */ }
  }
  const base = "https://www.cheapshark.com/api/1.0";
  const res = await fetch(`${base}/games?title=${encodeURIComponent(name)}&limit=10`);
  if (!res.ok) throw new Error("preço " + res.status);
  const list = await res.json();
  if (!list.length) return { none: true, source: "cheapshark", checked };
  const n = norm(name);
  const m = list.find(x => norm(x.external) === n) || list.find(x => norm(x.external).startsWith(n)) || list[0];
  const [dr, stores] = await Promise.all([fetch(`${base}/games?id=${m.gameID}`), csStores()]);
  const det = await dr.json();
  const deals = (det.deals || []).map(d => ({
    shop: stores[d.storeID] || "Loja", amount: +d.price, regular: +d.retailPrice, cut: Math.round(+d.savings), currency: "USD",
    url: `https://www.cheapshark.com/redirect?dealID=${String(d.dealID).includes("%") ? d.dealID : encodeURIComponent(d.dealID)}`
  })).filter(d => shopKind(d.shop)).sort((a, b) => a.amount - b.amount).slice(0, 10);
  if (!deals.length) return { none: true, source: "cheapshark", checked };
  await getRate();
  return { source: "cheapshark", currency: "USD", deals, low: det.cheapestPriceEver ? +det.cheapestPriceEver.price : null, steam: m.steamAppID || (det.info && det.info.steamAppID) || null, title: (det.info && det.info.title) || m.external, checked };
}
async function refreshPrices(force, onlyId) {
  if (priceRun || !sb) return; priceRun = true;
  try {
    getRate();
    const list = (onlyId ? [gameById(onlyId)].filter(Boolean) : wishlist().filter(g => force || !priceFresh(g))).filter(g => !isConsole(g.platform));
    if (!list.length) return;
    for (const g of list) priceState[g.id] = "loading";
    render();
    for (const g of list) {
      try { const p = await fetchPrice(g.name); delete priceState[g.id]; await save(g.id, { price: p, price_checked_at: p.checked }, true) }
      catch (e) { priceState[g.id] = "error"; render() }
      await sleep(350);
    }
  } finally { priceRun = false; if (tab === "desejos") render() }
}

/* ---------- links das lojas oficiais ---------- */
const STORE_NAMES = { 1: ["PC", "Steam"], 2: ["Xbox", "Xbox Store"], 3: ["PlayStation", "PlayStation Store"], 5: ["PC", "GOG"], 6: ["Switch", "Nintendo eShop"], 11: ["PC", "Epic Games Store"] };
function localizeStore(url) {
  return String(url || "")
    .replace(/store\.playstation\.com\/[a-z]{2}-[a-z]{2}\//i, "store.playstation.com/pt-br/")
    .replace(/xbox\.com\/[a-z]{2}-[a-z]{2}\//i, "xbox.com/pt-BR/")
    .replace(/microsoft\.com\/[a-z]{2}-[a-z]{2}\//i, "microsoft.com/pt-br/");
}
function storeSearch(name, platform) {
  const q = encodeURIComponent(name);
  return {
    PlayStation: ["PlayStation Store", `https://store.playstation.com/pt-br/search/${q}`],
    Xbox: ["Xbox / Microsoft Store", `https://www.xbox.com/pt-BR/search/results/games?q=${q}`],
    Switch: ["Nintendo eShop", `https://www.nintendo.com/pt-br/search/?q=${q}`],
  }[platform] || ["Steam", `https://store.steampowered.com/search/?term=${q}`];
}
function storeLinks(name, platform, rawgStores = []) {
  const q = encodeURIComponent(name);
  const direct = {};
  for (const s of rawgStores) { const m = STORE_NAMES[s.store_id]; if (m && s.url) direct[m[1]] = [m[0], m[1], localizeStore(s.url), true] }
  const all = [
    ["PlayStation", "PlayStation Store", `https://store.playstation.com/pt-br/search/${q}`],
    ["Xbox", "Xbox Store", `https://www.xbox.com/pt-BR/search/results/games?q=${q}`],
    ["Switch", "Nintendo eShop", `https://www.nintendo.com/pt-br/search/?q=${q}`],
    ["PC", "Steam", `https://store.steampowered.com/search/?term=${q}`],
    ["PC", "Nuuvem", `https://www.nuuvem.com/br-pt/catalog/search/${q}`],
    ["PC", "Epic Games Store", `https://store.epicgames.com/pt-BR/browse?q=${q}&sortBy=relevancy&sortDir=DESC`],
    ["PC", "GOG", `https://www.gog.com/pt/games?query=${q}`],
  ].map(x => direct[x[1]] || [...x, false]);
  return all.sort((a, b) => (b[0] === platform) - (a[0] === platform));
}

/* ---------- caixinha de preço da lista de desejos ---------- */
function priceBox(g) {
  if (isConsole(g.platform)) {
    const [store, url] = g.price && g.price.url ? [g.price.store, g.price.url] : storeSearch(g.name, g.platform);
    return `<div class="pbox console"><span class="pshop">${ic("gamepad")}${esc(g.platform)}</span>
      <div class="pacts"><a class="btn sm" href="${hrefOk(url)}" target="_blank" rel="noopener">${ic("external")}Ver preço na ${esc(store)}</a></div>
      <span class="hint">As lojas de console não liberam preços automáticos. O link abre a página oficial, com o preço em reais.</span>
      ${gameHref(g) ? `<a class="link" href="#${gameHref(g)}">Comparar com o preço no PC</a>` : ""}</div>`;
  }
  const st = priceState[g.id], b = bestOf(g);
  if (st === "loading") return `<div class="pbox"><span class="sk" style="width:60%;height:20px"></span><span class="sk" style="width:40%;height:11px;margin-top:8px"></span></div>`;
  if (st === "error" && !b) return `<div class="pbox none">Não consegui buscar o preço agora.<button class="link" data-refresh-price="${g.id}">Tentar de novo</button></div>`;
  if (!g.price) return `<div class="pbox none">Preço ainda não buscado.<button class="link" data-refresh-price="${g.id}">Buscar preço</button></div>`;
  if (!b) return `<div class="pbox none">Sem oferta em lojas confiáveis agora.<button class="link" data-prices="${g.id}">Ver nas lojas oficiais</button></div>`;
  const hit = g.target_price != null && brl(b) != null && brl(b) <= Number(g.target_price);
  return `<div class="pbox ${hit ? "hit" : ""}">
    ${hit ? `<span class="hitlbl">${ic("check")}Abaixo do seu preço-alvo</span>` : ""}
    <div class="pnow"><b>${priceHTML(b)}</b>${b.cut > 0 ? `<s>${b.currency === "USD" && usdRate ? money(b.regular * usdRate, "BRL") : money(b.regular, b.currency)}</s>` : ""}</div>
    <div class="pshop">${esc(b.shop)} · PC ${kindChip(b)}</div>
    <div class="pacts"><a class="btn sm" href="${hrefOk(b.url || "#")}" target="_blank" rel="noopener">${ic("cart")}Comprar</a><button class="btn ghost sm" data-prices="${g.id}">Lojas</button></div>
  </div>`;
}
function openPrices(id) {
  const g = gameById(id); if (!g) return;
  const p = g.price || {}, deals = isConsole(g.platform) ? [] : dealsOf(p), b = deals[0];
  const dl = deals.map((d, i) => `<div class="deal"><span class="ds">${esc(d.shop)} ${kindChip(d)}</span><span class="dp">${d.cut > 0 ? `<i class="dc">-${d.cut}%</i>` : ""}<b>${priceHTML(d)}</b></span><a class="btn sm${i === 0 ? "" : " ghost"}" href="${hrefOk(d.url || "#")}" target="_blank" rel="noopener">${ic("external")}Abrir</a></div>`).join("");
  const links = storeLinks(g.name, g.platform).map(([pl, n, u, direct]) => `<a class="slink${pl === g.platform ? " mine" : ""}" href="${hrefOk(u)}" target="_blank" rel="noopener"><span>${esc(n)}</span><small>${esc(pl)}${direct ? " · página do jogo" : " · busca"}</small>${ic("external")}</a>`).join("");
  modalShell(`<h2>Onde comprar</h2><p class="sub">${esc(g.name)} · ${platLabel(g.platform)}${p.title && norm(p.title) !== norm(g.name) ? ` <span class="hint">· resultado encontrado: ${esc(p.title)}</span>` : ""}</p>
    ${b ? `<div class="pmhead"><div><span class="k">Menor preço agora</span><b>${priceHTML(b)}</b></div>${p.low != null ? `<div><span class="k">Menor preço já registrado</span><b>${priceHTML({ amount: p.low, currency: p.currency })}</b></div>` : ""}</div>
      <div class="deals">${dl}</div>
      <p class="hint" style="margin-top:8px">Só mostramos lojas oficiais e revendas autorizadas conhecidas. ${p.currency === "USD" ? `Cotação de hoje: US$ 1 = ${usdRate ? money(usdRate, "BRL") : "—"}. O valor final pode variar com IOF e impostos.` : ""} Atualizado ${p.checked ? rel(p.checked) : ""}.</p>
      ${p.steam ? `<a class="btn ghost sm" style="margin-top:10px" href="https://store.steampowered.com/app/${esc(p.steam)}/" target="_blank" rel="noopener">${ic("external")}Ver na Steam com preço em reais</a>` : ""}`
      : isConsole(g.platform) ? `<div class="panel empty" style="padding:22px"><b>Preço na loja oficial</b>As lojas de console não liberam preços automáticos. Use o atalho da ${esc(g.platform)} abaixo.</div>`
      : `<div class="panel empty" style="padding:22px"><b>Sem oferta encontrada</b>${g.price ? "Nenhuma loja confiável vende esse jogo para PC agora." : "O preço ainda não foi buscado."}</div>`}
    <h3 class="h3" style="margin-top:22px">Lojas oficiais</h3>
    <div class="slinks">${links}</div>
    ${isConsole(g.platform) ? "" : `<div class="f" style="margin-top:20px"><label>Preço-alvo em reais <span class="hint">· avisamos na lista quando o menor preço ficar abaixo disso</span>
      <span class="bar" style="margin:0"><input type="number" id="tp" min="0" step="0.01" value="${g.target_price ?? ""}" placeholder="Ex.: 49,90" class="grow" inputmode="decimal"><button class="btn ghost" data-target-save="${g.id}">Salvar</button></span></label></div>`}
    <div class="acts">${isConsole(g.platform) ? "" : `<button class="btn ghost left" data-refresh-price="${g.id}">${ic("refresh")}Atualizar agora</button>`}${gameHref(g) ? `<a class="btn ghost" href="#${gameHref(g)}" data-close>Ficha do jogo</a>` : ""}<button class="btn" data-close>Fechar</button></div>`, true);
}

/* ---------- busca global (lupa no topo) ---------- */
let gsTimer = null, gsItems = [], gsIdx = -1;
function openGlobalSearch() {
  closeMenus();
  const el = $("#gsearch"); el.hidden = false;
  el.innerHTML = `<div class="gs-box" role="dialog" aria-modal="true" aria-label="Pesquisar jogos">
    <div class="gs-in">${ic("search")}<input id="gs-q" type="search" placeholder="Pesquisar qualquer jogo…" autocomplete="off" enterkeyhint="search" aria-controls="gs-res"><button class="iconbtn" data-gs-close aria-label="Fechar">${ic("x")}</button></div>
    <div class="gs-res" id="gs-res" role="listbox"><p class="gs-tip">Busque por nome. Você vê a ficha completa, avaliações, vídeos e onde comprar mais barato.</p></div></div>`;
  document.body.classList.add("noscroll");
  setTimeout(() => $("#gs-q") && $("#gs-q").focus(), 30);
}
function closeGlobalSearch() { const el = $("#gsearch"); el.hidden = true; el.innerHTML = ""; clearTimeout(gsTimer); document.body.classList.toggle("noscroll", !!($("#modal").innerHTML || $("#modal2").innerHTML)) }
let gsAbort = null;
async function runGlobalSearch(q) {
  const box = $("#gs-res"); if (!box) return;
  const mine = games.filter(g => norm(g.name).includes(norm(q))).slice(0, 3);
  box.innerHTML = `${mine.length ? `<p class="gs-h">Na sua biblioteca</p>${mine.map(g => gsRow(gameHref(g), g.id, g.cover_url, g.name, [g.platform, g.status].filter(Boolean).join(" · "))).join("")}` : ""}<p class="gs-h">Todos os jogos</p><div class="gs-sk"><div class="it sk" style="height:56px"></div><div class="it sk" style="height:56px"></div></div>`;
  try {
    if (gsAbort) gsAbort.abort(); gsAbort = new AbortController();
    const r = await searchGames(q, 10, gsAbort.signal);
    if (!$("#gs-q") || $("#gs-q").value.trim() !== q) return;
    const html = r.map(x => gsRow(x.go, "", x.img, x.name, [x.year, x.plats.join(", "), x.key[0] === "s" ? "Steam" : ""].filter(Boolean).join(" · "), x.mc)).join("")
      || `<p class="gs-tip">Nenhum jogo encontrado com “${esc(q)}”. Confira a grafia${FN() ? "" : " ou tente o nome em inglês"}.<br><button class="btn ghost sm" data-gs-manual="${esc(q)}">${ic("plus")}Adicionar “${esc(q)}” manualmente</button></p>`;
    const sk = box.querySelector(".gs-sk"); if (sk) sk.outerHTML = html;
  } catch (e) { if (e.name === "AbortError") return; const s = box.querySelector(".gs-sk"); if (s) s.outerHTML = `<p class="gs-tip err">${esc(e.user ? e.message : "Não foi possível pesquisar agora. Tente de novo em instantes.")}</p>` }
  gsItems = $$("#gs-res .gs-item"); gsIdx = -1;
}
function gsRow(go, openId, img, name, meta, mc) {
  return `<button class="gs-item" ${go ? `data-gs-go="${go}"` : `data-gs-open="${openId}"`} role="option"><span class="gs-img">${img ? `<img alt="" referrerpolicy="no-referrer" loading="lazy" src="${esc(img)}">` : ""}</span><span class="gs-t"><b>${esc(name)}</b><small>${esc(meta || "")}</small></span>${mc ? `<span class="mc sm">${mc}</span>` : ""}</button>`;
}
document.addEventListener("input", e => {
  if (e.target.id !== "gs-q") return;
  clearTimeout(gsTimer); const q = e.target.value.trim();
  if (q.length < 2) { $("#gs-res").innerHTML = `<p class="gs-tip">Digite pelo menos 2 letras.</p>`; return }
  gsTimer = setTimeout(() => runGlobalSearch(q), 350);
});
document.addEventListener("keydown", e => {
  if ((e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) && user && $("#gsearch").hidden && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); openGlobalSearch(); return }
  if ($("#gsearch").hidden) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    gsItems = $$("#gs-res .gs-item"); if (!gsItems.length) return; e.preventDefault();
    gsIdx = (gsIdx + (e.key === "ArrowDown" ? 1 : -1) + gsItems.length) % gsItems.length;
    gsItems.forEach((x, i) => x.classList.toggle("on", i === gsIdx)); gsItems[gsIdx].scrollIntoView({ block: "nearest" });
  }
  if (e.key === "Enter" && e.target.id === "gs-q") { e.preventDefault(); const it = gsItems[gsIdx] || $("#gs-res .gs-item"); if (it) it.click(); else if (e.target.value.trim().length >= 2) runGlobalSearch(e.target.value.trim()) }
});
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (c("#search-btn")) { openGlobalSearch(); return }
  if (!$("#gsearch").hidden && (c("[data-gs-close]") || e.target.id === "gsearch")) { closeGlobalSearch(); return }
  if (b = c("[data-gs-go]")) { closeGlobalSearch(); location.hash = b.dataset.gsGo; return }
  if (b = c("[data-gs-open]")) { closeGlobalSearch(); openForm(b.dataset.gsOpen); return }
  if (b = c("[data-gs-manual]")) { closeGlobalSearch(); openForm(null, { name: b.dataset.gsManual }); return }
});

/* ---------- página do jogo ---------- */
let gv = null;          // dados da página aberta
const RATING_PT = { exceptional: "Excepcional", recommended: "Recomendado", meh: "Mais ou menos", skip: "Não vale a pena" };
const RATING_COL = { exceptional: "var(--fin)", recommended: "var(--accent)", meh: "var(--play)", skip: "var(--nobuy)" };
function steamToD(s) {
  return { id: null, steam_only: true, name: s.title, background_image: s.header || s.capsule || "", description_raw: "", released: s.year || "", tba: s.coming_soon, metacritic: s.metacritic,
    genres: (s.genres || []).map(name => ({ name })), developers: (s.developers || []).map(name => ({ name })), publishers: (s.publishers || []).map(name => ({ name })),
    platforms: [{ platform: { name: "PC", slug: "pc" } }], website: s.website || "", rating: 0, ratings: [], ratings_count: 0, playtime: null };
}
async function openGame(id) {
  if (/^s\d+$/.test(id || "")) {
    if (gv && gv.id === id && !gv.error) { renderGame(); return }
    gv = { id, loading: true }; renderGame();
    try {
      const s = await api("jogo", { steam: id.slice(1) });
      if (!gv || gv.id !== id) return;
      if (!s || s.none) throw new Error("none");
      const d = steamToD(s);
      Object.assign(gv, { d, steam: s, stores: [], shots: [], movies: [], loading: false, plats: ["PC"], plat: "PC" });
      renderGame();
      fetchPrice(d.name).then(p => { if (gv && gv.id === id) { gv.price = p; renderGame() } }).catch(() => { if (gv && gv.id === id) { gv.price = { error: true }; renderGame() } });
      loadVideos(id, d.name).then(v => { if (gv && gv.id === id) { gv.videos = v; renderGame() } });
      friendsWithGame(d.name).then(f => { if (gv && gv.id === id) { gv.friends = f; renderGame() } });
    } catch (e) { if (gv && gv.id === id) { gv.error = true; gv.loading = false; renderGame() } }
    return;
  }
  if (!/^\d+$/.test(id || "")) { $("#jogo").innerHTML = empty("Jogo não encontrado", "Use a busca no topo para encontrar um jogo."); return }
  if (gv && gv.id === id && !gv.error) { renderGame(); return }
  gv = { id, loading: true }; renderGame();
  try {
    const [d, st, sh, mv] = await Promise.all([rawg(`/games/${id}`), rawg(`/games/${id}/stores`).catch(() => ({})), rawg(`/games/${id}/screenshots`).catch(() => ({})), rawg(`/games/${id}/movies`).catch(() => ({}))]);
    if (!gv || gv.id !== id) return;
    const plats = parentPlats(d);
    Object.assign(gv, { d, stores: st.results || [], shots: (sh.results || []).map(s => s.image).filter(Boolean), movies: mv.results || [], loading: false, plats, plat: preferredOf(plats) || "PC" });
    renderGame();
    const name = d.name;
    if (plats.includes("PC") || !plats.length) fetchPrice(name).then(p => { if (gv && gv.id === id) { gv.price = p; renderGame() } }).catch(() => { if (gv && gv.id === id) { gv.price = { error: true }; renderGame() } });
    api("jogo", { name }).then(s => { if (gv && gv.id === id && s && !s.none) { gv.steam = s; renderGame() } }).catch(() => { });
    loadVideos(id, name).then(v => { if (gv && gv.id === id) { gv.videos = v; renderGame() } });
    friendsWithGame(name).then(f => { if (gv && gv.id === id) { gv.friends = f; renderGame() } });
  } catch (e) { if (gv && gv.id === id) { gv.error = true; gv.loading = false; renderGame() } }
}
async function loadVideos(id, name) {
  try { const v = await api("videos", { rawg_id: +id, name }); if (v && !v.error) return v } catch (e) { }
  if (!CFG.YOUTUBE_KEY) return null;
  const ck = "yt-" + id, c = lsGet(ck); if (c && Date.now() - c.t < 7 * 864e5) return c.v;
  try {
    const yt = q => fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=20&regionCode=BR&relevanceLanguage=pt&q=${encodeURIComponent(q)}&key=${CFG.YOUTUBE_KEY}`).then(r => r.json());
    const [gp, tr] = await Promise.all([yt(name + " gameplay"), yt(name + " trailer")]);
    const fav = (CFG.YOUTUBERS || ["alanzoka", "BRKsEDU", "Zangado", "Cellbit", "Gameplayrj", "Coisa de Nerd", "T3ddy", "Flakes Power", "Jazzghost"]).map(norm);
    const items = gp.items || [], f = items.find(it => fav.some(c => norm(it.snippet.channelTitle).includes(c)));
    const pick = it => it && { id: it.id.videoId, title: it.snippet.title, channel: it.snippet.channelTitle };
    const v = { gameplay: pick(f || items[0]), gameplay_br: !!f, trailer: pick((tr.items || [])[0]) };
    lsSet(ck, { t: Date.now(), v }); return v;
  } catch (e) { return null }
}
function renderGameIfLibraryChanged() { if (gv) renderGame() }
const fmtDate = s => { if (!s) return ""; const d = new Date(s + "T12:00:00"); return isNaN(d) ? s : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) };
function sizeFromReq(t) { const m = String(t || "").match(/(storage|hard ?drive|hdd|disk space|armazenamento)[^:]*:\s*([^\n]*?\d+(?:[.,]\d+)?\s*[GMT]B)/i); return m ? (m[2].match(/\d+(?:[.,]\d+)?\s*[GMT]B/i) || [""])[0] : null }
function renderGame() {
  const el = $("#jogo"); if (!gv) return;
  if (gv.loading) { el.innerHTML = hippoLoad("Buscando o jogo…", "big"); return }
  if (gv.error) { el.innerHTML = empty("Não foi possível abrir este jogo", "Verifique sua conexão e tente de novo.", `<br><button class="btn sm" data-gp="retry">Tentar de novo</button>`); return }
  const d = gv.d, s = gv.steam || {}, plat = gv.plat;
  const own = games.filter(g => (d.id && g.rawg_id === d.id) || (s.steam && String(g.steam_id || "") === String(s.steam)) || norm(g.name) === norm(d.name));
  const ownPlat = own.find(g => (g.platform || "") === plat);
  const pcReq = (d.platforms || []).find(p => p.platform && p.platform.slug === "pc");
  const reqMin = s.req_min || (pcReq && pcReq.requirements && (pcReq.requirements.minimum || "")) || (pcReq && pcReq.requirements_en && pcReq.requirements_en.minimum) || "";
  const reqRec = s.req_rec || (pcReq && pcReq.requirements && pcReq.requirements.recommended) || "";
  const size = s.size || sizeFromReq(reqMin);
  const synPt = s.about || s.short, synEn = d.description_raw;
  const ratings = (d.ratings || []).filter(r => RATING_PT[r.title]);
  const ratingsTotal = ratings.reduce((a, r) => a + r.count, 0);
  const steamPct = s.reviews_summary && s.reviews_summary.total ? Math.round(s.reviews_summary.positive / s.reviews_summary.total * 100) : null;
  const facts = [
    ["Lançamento", s.release || fmtDate(d.released) || (d.tba ? "A anunciar" : "")],
    ["Gênero", (s.genres && s.genres.length ? s.genres : (d.genres || []).map(g => g.name)).join(", ")],
    ["Desenvolvedora", (s.developers && s.developers.length ? s.developers : (d.developers || []).map(x => x.name)).join(", ")],
    ["Publicadora", (s.publishers && s.publishers.length ? s.publishers : (d.publishers || []).map(x => x.name)).join(", ")],
    ["Plataformas", (d.platforms || []).map(p => p.platform.name).join(", ")],
    ["Classificação", d.esrb_rating ? d.esrb_rating.name + " (ESRB)" : ""],
    ["Duração média", d.playtime ? `${d.playtime} h` : ""],
    ["Tamanho (PC)", size || ""],
    ["Idiomas", s.languages || ""],
    ["Site oficial", d.website ? `<a href="${hrefOk(d.website)}" target="_blank" rel="noopener">${esc(d.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : ""],
  ].filter(f => f[1]);
  const v = gv.videos || {};
  const trailerRawg = gv.movies && gv.movies[0] && gv.movies[0].data ? gv.movies[0] : null;
  const trailerSteam = s.trailer && s.trailer.mp4 ? s.trailer : null;
  const ytq = encodeURIComponent(d.name + " gameplay pt-br");
  const videosHTML = `
    ${v.gameplay ? `<div class="vid"><div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.gameplay.id)}" title="${esc(v.gameplay.title)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p class="vcap"><b>Gameplay</b> · ${esc(v.gameplay.channel)}${v.gameplay_br ? ` <span class="kchip br">youtuber BR</span>` : ""}</p></div>` : ""}
    ${v.trailer ? `<div class="vid"><div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.trailer.id)}" title="${esc(v.trailer.title)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p class="vcap"><b>Trailer</b> · ${esc(v.trailer.channel)}</p></div>`
      : trailerSteam ? `<div class="vid"><div class="vframe"><video controls preload="none" poster="${esc(trailerSteam.thumb || "")}" src="${esc(trailerSteam.mp4)}"></video></div><p class="vcap"><b>Trailer</b> · ${esc(trailerSteam.name || "Steam")}</p></div>`
      : trailerRawg ? `<div class="vid"><div class="vframe"><video controls preload="none" poster="${esc(trailerRawg.preview || "")}" src="${esc(trailerRawg.data.max || trailerRawg.data["480"])}"></video></div><p class="vcap"><b>Trailer</b> · ${esc(trailerRawg.name || "")}</p></div>` : ""}
    ${!v.gameplay ? `<div class="ytlinks"><a class="btn ghost" href="https://www.youtube.com/results?search_query=${ytq}" target="_blank" rel="noopener">${ic("play")}Ver gameplays em português no YouTube</a></div>` : ""}`;
  const shots = (s.screenshots && s.screenshots.length ? s.screenshots : gv.shots || []).slice(0, 8);
  el.innerHTML = `
  <div class="gp">
    <div class="gp-hero"${d.background_image ? ` style="--gbg:url('${esc(d.background_image)}')"` : ""}>
      <button class="btn ghost sm gp-back" data-gp="back">${ic("back")}Voltar</button>
      <div class="gp-head">
        <div class="poster gp-cover">${d.background_image ? `<img class="cv" alt="" referrerpolicy="no-referrer" src="${esc(d.background_image)}">` : cover({ name: d.name })}</div>
        <div class="gp-tt">
          <h1>${esc(d.name)}</h1>
          <p class="gp-meta">${[d.released ? d.released.slice(0, 4) : "", (d.developers || []).map(x => x.name).slice(0, 2).join(", ")].filter(Boolean).map(esc).join(" · ")}</p>
          <div class="gp-chips">
            ${d.metacritic ? `<span class="score mcbig" title="Nota da crítica (Metacritic)"><b>${d.metacritic}</b><small>Metacritic</small></span>` : ""}
            ${d.rating ? `<span class="score" title="Nota média de jogadores no RAWG"><b>${Number(d.rating).toFixed(1)}<i>/5</i></b><small>${d.ratings_count.toLocaleString("pt-BR")} jogadores</small></span>` : ""}
            ${steamPct != null ? `<span class="score" title="Análises na Steam"><b>${steamPct}%</b><small>positivas na Steam</small></span>` : ""}
          </div>
          <div class="gp-pl">${gv.plats.map(p => `<span class="pchip">${ic(platIcon(p))}${esc(p)}</span>`).join("")}</div>
          ${own.length ? `<p class="gp-own">${ic("check")}Na sua biblioteca: ${own.map(g => `<button class="link" data-open="${g.id}">${esc(g.platform || "sem plataforma")} · ${esc(g.status)}</button>`).join(", ")}</p>` : ""}
        </div>
      </div>
    </div>
    <div class="gp-grid">
      <div class="gp-main">
        <section class="panel gp-sec"><h2 class="h3">Sinopse</h2>
          ${synPt ? `<div class="syn">${esc(synPt).replace(/\n/g, "<br>")}</div>` : synEn ? `<details class="syn"><summary>${esc(synEn.slice(0, 420))}${synEn.length > 420 ? "… <span class='link'>ler mais</span>" : ""}</summary>${esc(synEn.slice(420))}</details><p class="hint">Sinopse disponível só em inglês. <a href="https://translate.google.com/?sl=en&tl=pt&op=translate&text=${encodeURIComponent(synEn.slice(0, 1800))}" target="_blank" rel="noopener">Traduzir com o Google</a></p>` : `<p class="muted">Sem sinopse disponível.</p>`}
        </section>
        <section class="panel gp-sec"><h2 class="h3">Vídeos</h2><div class="vids">${videosHTML}</div>
          ${shots.length ? `<div class="shots">${shots.map((u, i) => `<a href="${hrefOk(u)}" target="_blank" rel="noopener" aria-label="Abrir imagem ${i + 1} de ${esc(d.name)} em tamanho grande"><img alt="" loading="lazy" referrerpolicy="no-referrer" src="${esc(u)}"></a>`).join("")}</div>` : ""}</section>
        <section class="panel gp-sec"><h2 class="h3">Avaliações de jogadores</h2>
          ${ratingsTotal ? `<div class="rbars">${["exceptional", "recommended", "meh", "skip"].map(k => { const r = ratings.find(x => x.title === k) || { count: 0 }; const pct = Math.round(r.count / ratingsTotal * 100); return `<div class="br"><span>${RATING_PT[k]}</span><div class="tr"><div class="fl" style="width:${pct}%;background:${RATING_COL[k]}"></div></div><b>${pct}%</b></div>` }).join("")}</div><p class="hint">${ratingsTotal.toLocaleString("pt-BR")} avaliações de jogadores no RAWG.</p>` : ""}
          ${s.reviews_summary ? `<p class="steamsum"><b>${esc(s.reviews_summary.desc)}</b> na Steam · ${s.reviews_summary.total.toLocaleString("pt-BR")} análises${s.reviews_br && s.reviews_br.total ? `, ${s.reviews_br.total.toLocaleString("pt-BR")} em português` : ""}</p>` : ""}
          ${(s.reviews || []).length ? `<div class="ureviews">${s.reviews.map(r => `<blockquote class="urev ${r.up ? "up" : "down"}"><span class="urev-h">${r.up ? "Recomenda" : "Não recomenda"} · ${r.hours} h jogadas${r.date ? " · " + new Date(r.date * 1000).toLocaleDateString("pt-BR") : ""}</span><p>${esc(r.text)}</p></blockquote>`).join("")}</div><a class="link" href="https://steamcommunity.com/app/${esc(s.steam)}/reviews/?browsefilter=toprated&filterLanguage=brazilian" target="_blank" rel="noopener">Ler mais análises em português na Steam</a>` : !FN() ? `<p class="hint">Análises escritas por jogadores brasileiros aparecem aqui quando a função “enzola” estiver publicada no Supabase.</p>` : ""}
          ${!ratingsTotal && !s.reviews_summary ? `<p class="muted">Ainda não há avaliações suficientes.</p>` : ""}
        </section>
        ${reqMin ? `<section class="panel gp-sec"><h2 class="h3">Requisitos no PC</h2><div class="reqs"><div><h4>Mínimos</h4><p>${esc(reqMin.replace(/^(minimum|mínimos):?\s*/i, "")).replace(/\n/g, "<br>")}</p></div>${reqRec ? `<div><h4>Recomendados</h4><p>${esc(reqRec.replace(/^(recommended|recomendados):?\s*/i, "")).replace(/\n/g, "<br>")}</p></div>` : ""}</div></section>` : ""}
      </div>
      <aside class="gp-side">
        <section class="panel gp-sec gp-buy"><h2 class="h3">Onde comprar</h2>
          <div class="seg" role="radiogroup" aria-label="Escolha a plataforma">${(gv.plats.length ? gv.plats : ["PC"]).map(p => `<button role="radio" aria-checked="${p === plat}" data-gplat="${p}">${ic(platIcon(p))}${esc(p)}</button>`).join("")}</div>
          ${buyPanel(d, plat)}
          <div class="gp-acts">
            ${ownPlat ? `<button class="btn ghost" data-open="${ownPlat.id}">${ic("check")}${ownPlat.wishlist || ownPlat.status === "Não comprado" ? "Na sua lista de desejos" : "Na sua biblioteca"} (${esc(plat)})</button>`
              : `<button class="btn" data-gp="wish">${ic("bookmark")}Adicionar à lista de desejos (${esc(plat)})</button><button class="btn ghost" data-gp="lib">${ic("plus")}Já tenho este jogo</button>`}
            ${user && fr && fr.loaded && frAccepted().length ? `<button class="btn ghost" data-gp="suggest">${ic("gift")}Sugerir a um amigo</button>` : ""}
          </div>
        </section>
        <section class="panel gp-sec"><h2 class="h3">Ficha técnica</h2><dl class="facts">${facts.map(([k, v2]) => `<dt>${k}</dt><dd>${k === "Site oficial" ? v2 : esc(v2)}</dd>`).join("")}</dl></section>
        ${gv.friends && gv.friends.length ? `<section class="panel gp-sec"><h2 class="h3">Amigos que têm</h2><div class="gfr">${gv.friends.map(f => `<a class="gfr-i" href="#amigo/${f.p.user_id}"><span class="av xs">${avatar(f.p.avatar)}</span><span><b>${esc(pName(f.p))}</b><small>${esc(f.g.status)}${f.g.rating != null ? " · nota " + rateTxt(f.g) : ""}</small></span></a>`).join("")}</div></section>` : ""}
      </aside>
    </div>
  </div>`;
}
function buyPanel(d, plat) {
  if (isConsole(plat)) {
    const store = gv.stores.find(s => STORE_NAMES[s.store_id] && STORE_NAMES[s.store_id][0] === plat);
    const [name, search] = storeSearch(d.name, plat);
    const url = store ? localizeStore(store.url) : search;
    return `<div class="buy-console"><p>O preço da ${esc(name)} aparece na página oficial, em reais.</p>
      <a class="btn" href="${hrefOk(url)}" target="_blank" rel="noopener">${ic("external")}Ver preço na ${esc(name)}</a>
      ${store ? `<a class="link" href="${hrefOk(search)}" target="_blank" rel="noopener">Não abriu? Buscar na ${esc(name)}</a>` : ""}
      <p class="hint">PlayStation, Xbox e Nintendo não liberam preços para sites de terceiros. Por isso o valor de console não aparece aqui automaticamente.</p></div>`;
  }
  const p = gv.price, s = gv.steam || {};
  if (!p) return `<div class="deals sk" style="height:120px"></div>`;
  let deals = p.error ? [] : dealsOf(p);
  if (s.price && !deals.some(x => /^steam/i.test(x.shop) && x.currency === "BRL")) {
    deals = deals.filter(x => !/^steam/i.test(x.shop));
    deals.push({ shop: "Steam", amount: s.price.amount, regular: s.price.regular, cut: s.price.cut, currency: s.price.currency || "BRL", url: s.url, kind: "oficial", br: true });
    deals.sort((a, b) => sortVal(a) - sortVal(b));
  }
  if (s.free) return `<div class="buy-free"><b>Gratuito</b> na Steam. <a class="btn sm" href="${hrefOk(s.url)}" target="_blank" rel="noopener">${ic("external")}Abrir na Steam</a></div>`;
  if (!deals.length) return `<div class="panel empty" style="padding:18px"><b>Sem oferta no momento</b>${p.error ? "Não foi possível consultar os preços agora." : "Nenhuma loja confiável vende para PC agora."}</div>
    <div class="slinks">${storeLinks(d.name, "PC", gv.stores).filter(x => x[0] === "PC").map(([pl, n, u]) => `<a class="slink" href="${hrefOk(u)}" target="_blank" rel="noopener"><span>${esc(n)}</span><small>PC</small>${ic("external")}</a>`).join("")}</div>`;
  const b = deals[0];
  return `<div class="buy-best"><span class="k">Menor preço no PC</span><b>${priceHTML(b)}</b><span class="pshop">${esc(b.shop)} ${kindChip(b)}${b.cut > 0 ? ` <i class="dc">-${b.cut}%</i>` : ""}</span>
    <a class="btn" href="${hrefOk(b.url)}" target="_blank" rel="noopener">${ic("cart")}Comprar na ${esc(b.shop)}</a></div>
    ${deals.length > 1 ? `<div class="deals">${deals.slice(1, 6).map(x => `<div class="deal"><span class="ds">${esc(x.shop)} ${kindChip(x)}</span><span class="dp">${x.cut > 0 ? `<i class="dc">-${x.cut}%</i>` : ""}<b>${priceHTML(x)}</b></span><a class="btn ghost sm" href="${hrefOk(x.url)}" target="_blank" rel="noopener">Abrir</a></div>`).join("")}</div>` : ""}
    <p class="hint">${p.low != null ? `Menor preço já registrado: ${priceHTML({ amount: p.low, currency: p.currency })}. ` : ""}${p.currency === "USD" && usdRate ? `Cotação de hoje: US$ 1 = ${money(usdRate, "BRL")}.` : ""} Só lojas oficiais e revendas autorizadas.</p>`;
}
async function gameAdd(kind) {
  const d = gv.d, plat = gv.plat;
  const base = { name: d.name, platform: plat, cover_url: (d.steam_only && gv.steam.capsule) || d.background_image || null, rawg_id: d.id || null, steam_id: gv.steam && gv.steam.steam ? +gv.steam.steam : null, metacritic: d.metacritic || null, playtime: d.playtime || null, genre: (d.genres || []).map(g => g.name).slice(0, 2).join(", "), year: (d.released || "").slice(0, 4) };
  if (kind === "lib") { openForm(null, { ...base, status: "Não iniciado" }); return }
  const store = isConsole(plat) ? gv.stores.find(s => STORE_NAMES[s.store_id] && STORE_NAMES[s.store_id][0] === plat) : null;
  const price = isConsole(plat) ? { console: true, store: storeSearch(d.name, plat)[0], url: store ? localizeStore(store.url) : storeSearch(d.name, plat)[1], checked: new Date().toISOString() } : gv.price && !gv.price.error ? gv.price : null;
  const ins = await create({ ...base, status: "Não comprado", wishlist: true, price, price_checked_at: price ? new Date().toISOString() : null });
  if (ins) { toast(`${d.name} (${plat}) entrou na sua lista de desejos.`); renderGame() }
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-gp],[data-gplat]"); if (!b || !gv) return;
  if (b.dataset.gplat) { gv.plat = b.dataset.gplat; renderGame(); return }
  const a = b.dataset.gp;
  if (a === "back") { if (history.length > 1) history.back(); else location.hash = "perfil" }
  else if (a === "retry") { const id = gv.id; gv = null; openGame(id) }
  else if (a === "wish" || a === "lib") gameAdd(a);
  else if (a === "suggest") openSuggest(null, { name: gv.d.name, rawg_id: gv.d.id || null, steam_id: gv.steam && gv.steam.steam ? +gv.steam.steam : null, cover_url: gv.d.background_image });
});

/* ---------- resumo rápido ao tocar na capa (catálogo e jogos dos amigos) ---------- */
const qvGames = new Map();           // "f:<id>" → { g, owner } (jogos de amigos já carregados)
const qvInfo = new Map();            // cache de sinopse/dados por jogo
function qvKey(g) { return g.rawg_id ? "r" + g.rawg_id : g.steam_id ? "s" + g.steam_id : "n" + norm(g.name) }
async function qvFetch(g) {
  const k = qvKey(g); if (qvInfo.has(k)) return qvInfo.get(k);
  const [st, rd] = await Promise.all([
    FN() ? api("jogo", g.steam_id ? { steam: g.steam_id } : { name: g.name }).catch(() => null) : null,
    g.rawg_id && CFG.RAWG_KEY ? rawg(`/games/${g.rawg_id}`).catch(() => null) : null,
  ]);
  const s = st && !st.none ? st : null;
  const info = {
    syn: (s && (s.short || (s.about || "").slice(0, 420))) || "",
    synEn: !s && rd && rd.description_raw ? rd.description_raw.slice(0, 420) + (rd.description_raw.length > 420 ? "…" : "") : "",
    genres: (s && s.genres && s.genres.length ? s.genres : rd ? (rd.genres || []).map(x => x.name) : []).slice(0, 3).join(", "),
    dev: (s && s.developers && s.developers.length ? s.developers : rd ? (rd.developers || []).map(x => x.name) : []).slice(0, 2).join(", "),
    year: (rd && (rd.released || "").slice(0, 4)) || (s && s.year) || "",
    mc: (rd && rd.metacritic) || (s && s.metacritic) || null,
    steamPct: s && s.reviews_summary && s.reviews_summary.total ? Math.round(s.reviews_summary.positive / s.reviews_summary.total * 100) : null,
    steamDesc: s && s.reviews_summary ? s.reviews_summary.desc : "",
    playtime: (rd && rd.playtime) || null,
    href: g.rawg_id ? `jogo/${g.rawg_id}` : s ? `jogo/s${s.steam}` : "",
  };
  qvInfo.set(k, info); return info;
}
function openQuick(ref) {
  let g, owner = null, own = false;
  if (ref.startsWith("m:")) { g = gameById(ref.slice(2)); own = true }
  else { const x = qvGames.get(ref); if (x) { g = x.g; owner = x.owner } }
  if (!g) return;
  const mineToo = !own && games.find(x => (g.rawg_id && x.rawg_id === g.rawg_id) || norm(x.name) === norm(g.name));
  const head = `<div class="qv">
    <div class="qv-cover poster">${cover(g)}</div>
    <div class="qv-b">
      <h2 class="qv-t">${esc(g.name)}</h2>
      <p class="qv-m" id="qv-m">${[g.year, g.genre, g.platform].filter(Boolean).map(esc).join(" · ")}</p>
      <div class="qv-chips" id="qv-chips">${g.metacritic ? `<span class="chipinfo"><span class="mc sm">${g.metacritic}</span>Metacritic</span>` : ""}${g.playtime ? `<span class="chipinfo">${ic("clock")}~${g.playtime} h para zerar</span>` : ""}</div>
      <div class="qv-who">${own ? `<b>Você:</b> ${esc(g.status)}${g.exp ? " · " + esc(g.exp) : ""}${g.rating != null ? " · nota " + rateTxt(g) : ""}${g.hours ? " · " + esc(hoursTxt(g.hours)) : ""}`
        : `<b>${esc(owner || "Amigo")}:</b> ${esc(g.status)}${g.rating != null ? " · nota " + rateTxt(g) : ""}${g.platform ? " · " + esc(g.platform) : ""}`}</div>
      ${g.review ? `<blockquote class="qv-rev">“${esc(g.review)}”</blockquote>` : ""}
    </div></div>
    <div class="qv-syn" id="qv-syn"><div class="sk" style="height:14px;border-radius:6px;margin:6px 0"></div><div class="sk" style="height:14px;width:80%;border-radius:6px;margin:6px 0"></div></div>
    <div class="acts">
      ${own ? `<button class="btn ghost left" data-open="${g.id}">${ic("pencil")}Editar</button>` : mineToo ? `<span class="hint left">${ic(mineToo.wishlist || mineToo.status === "Não comprado" ? "bookmark" : "check")}${mineToo.wishlist || mineToo.status === "Não comprado" ? "Já está na sua lista de desejos" : "Você também tem este jogo"}</span>` : `<button class="btn ghost left" data-qv-wish>${ic("bookmark")}Quero jogar</button>`}
      <a class="btn" id="qv-full" ${gameHref(g) ? `href="#${gameHref(g)}"` : `href="#" data-qv-search="${esc(g.name)}"`} data-close>${ic("external")}Ver página completa</a>
    </div>`;
  modalShell(head);
  openQuick.cur = g;
  qvFetch(g).then(info => {
    const box = $("#qv-syn"); if (!box || openQuick.cur !== g) return;
    box.innerHTML = info.syn ? `<p>${esc(info.syn)}</p>` : info.synEn ? `<p lang="en">${esc(info.synEn)}</p><p class="hint">Resumo disponível só em inglês — a página completa tem mais detalhes.</p>` : `<p class="muted">Sem resumo disponível para este jogo.</p>`;
    const m = $("#qv-m"); if (m && !g.genre && info.genres) m.textContent = [g.year || info.year, info.genres, g.platform].filter(Boolean).join(" · ");
    if (info.dev && m) m.textContent += (m.textContent ? " · " : "") + info.dev;
    const ch = $("#qv-chips");
    if (ch) { if (!g.metacritic && info.mc) ch.insertAdjacentHTML("afterbegin", `<span class="chipinfo"><span class="mc sm">${info.mc}</span>Metacritic</span>`); if (info.steamPct != null) ch.insertAdjacentHTML("beforeend", `<span class="chipinfo" title="${esc(info.steamDesc)}">${ic("users")}${info.steamPct}% positivas na Steam</span>`) }
    const full = $("#qv-full"); if (full && !gameHref(g) && info.href) { full.setAttribute("href", "#" + info.href); full.removeAttribute("data-qv-search") }
  }).catch(() => { const box = $("#qv-syn"); if (box) box.innerHTML = `<p class="muted">Não foi possível carregar o resumo agora.</p>` });
}
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (b = c("[data-qv]")) { e.preventDefault(); e.stopPropagation(); openQuick(b.dataset.qv); return }
  if (b = c("[data-qv-search]")) { e.preventDefault(); closeModal(); openGlobalSearch(); const i = $("#gs-q"); if (i) { i.value = b.dataset.qvSearch; i.dispatchEvent(new Event("input", { bubbles: true })) } return }
  if (c("[data-qv-wish]")) { const g = openQuick.cur; if (!g) return; closeModal(); openForm(null, { name: g.name, cover_url: g.cover_url, rawg_id: g.rawg_id || null, steam_id: g.steam_id || null, genre: g.genre, year: g.year, metacritic: g.metacritic, playtime: g.playtime, platform: g.platform, status: "Não comprado", wishlist: true }); return }
}, true);
