/* Jogos Enzola — service worker: abre rápido, funciona com internet ruim e recebe notificações no celular.
   Só guarda os arquivos do próprio site; dados do Supabase e preços sempre vêm da rede. */
const CACHE = "jogos-enzola-v3-14";
const SHELL = ["./", "index.html", "styles.css", "app.js", "jogo.js", "social.js", "lingo.js", "show.js", "extras.js", "config.js", "logo.png", "hipopotamo.webp", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.png", "icons/notif.png", "icons/badge.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  // música e outros arquivos de mídia: deixa o navegador cuidar (pedidos em partes / Range)
  if (r.headers.has("range") || /\.(mp3|m4a|ogg|mp4|webm|wav)$/i.test(u.pathname)) return;
  e.respondWith(fetch(r).then(res => { if (res.ok && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)) } return res })
    .catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
});

/* ---------- notificações no celular ---------- */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {} } catch (er) { d = { title: "Jogos Enzola", body: e.data ? e.data.text() : "" } }
  e.waitUntil((async () => {
    // se o site estiver aberto e na tela, o aviso já aparece lá dentro
    const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (cs.some(c => c.visibilityState === "visible" && c.focused)) return;
    await self.registration.showNotification(d.title || "Jogos Enzola", {
      body: d.body || "", icon: "icons/notif.png", badge: "icons/badge.png",
      tag: d.tag || "enzola", renotify: true, data: { url: d.url || "#perfil" }, vibrate: [90, 60, 90],
    });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  // ?n=1: abre direto na tela da notificação, sem a tela de abertura
  const target = new URL("./?n=1" + ((e.notification.data && e.notification.data.url) || ""), self.registration.scope).href;
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { await c.focus(); try { await c.navigate(target) } catch (er) { c.postMessage({ go: target }) } return }
    await self.clients.openWindow(target);
  })());
});
self.addEventListener("pushsubscriptionchange", e => {
  // o navegador trocou a assinatura: o site refaz o cadastro na próxima vez que abrir (pushSync)
});
