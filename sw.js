/* Jogos Enzola — service worker: abre rápido e funciona mesmo com internet ruim.
   Só guarda os arquivos do próprio site; dados do Supabase e preços sempre vêm da rede. */
const CACHE = "jogos-enzola-v3";
const SHELL = ["./", "index.html", "styles.css", "app.js", "jogo.js", "social.js", "extras.js", "config.js", "logo.png", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)) } return res })
    .catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
});
