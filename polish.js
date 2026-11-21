/* Jogos Enzola — acabamento técnico: imagens aparecem com fade e decodificam fora da thread principal */
(() => {
  const prep = img => {
    if (img.__pl || !(img instanceof HTMLImageElement)) return; img.__pl = 1;
    if (!img.decoding) img.decoding = "async";
    if (img.complete && img.naturalWidth) return;          // já carregada (cache): não pisca
    if (img.closest(".w-card,.splash,.hm-promo")) return;
    img.classList.add("img-in");
    const ok = () => img.classList.add("ok");
    img.addEventListener("load", ok, { once: true }); img.addEventListener("error", ok, { once: true });
  };
  const scan = root => { if (root.nodeType !== 1) return; if (root.tagName === "IMG") prep(root); else root.querySelectorAll && root.querySelectorAll("img").forEach(prep) };
  try {
    new MutationObserver(ms => { for (const m of ms) m.addedNodes.forEach(scan) }).observe(document.documentElement, { childList: true, subtree: true });
    document.querySelectorAll("img").forEach(prep);
  } catch (e) {}
})();
