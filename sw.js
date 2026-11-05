/* Manifest portal service worker: makes the app installable and keeps the shell available offline. Data always comes live from the network. */
const CACHE = "manifest-portal-v25";
const SHELL = ["./", "index.html", "jumper.css", "jumper.js", "config.js", "logo.png", "icon-192.png", "icon-512.png", "mali.ttf", "mali-semibold.ttf", "calibri.ttf", "calibrib.ttf"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // never touch the database calls
  e.respondWith(fetch(req, { cache: "no-store" }).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); return res; }).catch(() => caches.match(req).then((r) => r || caches.match("index.html"))));
});
self.addEventListener("notificationclick", (e) => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: "window" }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow("./")))); });

/* ---- web push: the server only wakes the phone; the text is fetched here so it is always up to date and in the user's language ---- */
function readCfg() {
  return new Promise((resolve) => {
    try {
      const rq = indexedDB.open("mj", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
      rq.onerror = () => resolve(null);
      rq.onsuccess = () => { try { const g = rq.result.transaction("kv").objectStore("kv").get("cfg"); g.onsuccess = () => resolve(g.result || null); g.onerror = () => resolve(null); } catch (e) { resolve(null); } };
    } catch (e) { resolve(null); }
  });
}
self.addEventListener("push", (e) => {
  e.waitUntil((async () => {
    let title = "Manifest", body = "پیام یا اعلان جدید · New update", tag = "mj-" + Date.now();
    try {
      const cfg = await readCfg();
      if (cfg && cfg.token) {
        const r = await fetch(cfg.url + "/rest/v1/rpc/jumper_push_peek", { method: "POST", headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key, "Content-Type": "application/json" }, body: JSON.stringify({ p_token: cfg.token }) });
        if (r.ok) { const j = await r.json(); if (j && j.t) { body = j.t; if (j.tag) tag = j.tag; } }
      }
    } catch (err) { /* keep the generic text */ }
    const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (cs.some((c) => c.visibilityState === "visible" && c.focused)) return;
    await self.registration.showNotification(title, { body, icon: "icon-192.png", badge: "icon-192.png", tag, renotify: true, vibrate: [220, 100, 220, 100, 320], requireInteraction: false, silent: false, data: { url: "./" } });
  })());
});
