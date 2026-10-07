/*
 * Eddy Barbershop — service worker (PWA saran #15)
 *
 * Strategi:
 *  - Cache-first       : aset statis immutable hasil build Vite (/build/*), ikon, manifest.
 *  - Network-first     : navigasi dokumen (HTML Inertia), fallback ke cache lalu /offline.html.
 *  - Bypass (NO cache + NO cache.put): semua request non-GET (POST booking dll) dan /api/*.
 *
 * Batasan yang disengaja: precache hanya inti kecil + offline.html. Aset ber-hash dari Vite
 * di-cache lazy saat benar-benar diminta, jadi SW tidak pernah menahan bundle usang dengan
 * hash lama. Handler activate menghapus cache dengan prefix/versi berbeda.
 */

const CACHE_VERSION = "v1";
const PRECACHE = `eddy-pre-${CACHE_VERSION}`;
const RUNTIME = `eddy-runtime-${CACHE_VERSION}`;
/** Semua cache milik app ini — dipakai untuk membuang cache versi lama saat activate. */
const OWNED_PREFIXES = ["eddy-pre-", "eddy-runtime-"];

/** Inti yang harus ada supaya shell tetap tampil saat offline. */
const PRECACHE_URLS = ["/offline.html", "/icon.svg", "/manifest.webmanifest"];

const OFFLINE_URL = "/offline.html";

/** Jangan pernah masuk cache: endpoint dinamis, halaman admin, dan endpoint dev Vite. */
const BYPASS_PREFIXES = ["/api/", "/admin", "/@vite/", "/@react-refresh", "/@fs/"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(PRECACHE);
            // addAll gagal total kalau satu URL error — pakai allSettled agar install tetap sukses
            // walau salah satu opsional tidak tersedia.
            await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
            // SW baru langsung mengambil alih; reload halaman tetap dibutuhkan klien lama.
            await self.skipWaiting();
        })(),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(
                        (key) =>
                            OWNED_PREFIXES.some((prefix) => key.startsWith(prefix)) &&
                            key !== PRECACHE &&
                            key !== RUNTIME,
                    )
                    .map((key) => caches.delete(key)),
            );
            // Aktifkan SW ini untuk semua tab yang sedang terbuka tanpa perlu reload manual.
            await self.clients.claim();
        })(),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // 1) Hanya GET yang boleh di-cache. POST berupa booking harus selalu ke jaringan.
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // 2) Hanya same-origin. Font Google/Bunny & request pihak ketiga dibiarkan lewat.
    if (url.origin !== self.location.origin) return;

    // 3) Endpoint dinamis & request dev Vite: bypass total, jangan disentuh cache.
    if (BYPASS_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return;

    // 4) Navigasi dokumen → network-first, fallback shell offline.
    if (request.mode === "navigate" || request.destination === "document") {
        event.respondWith(networkFirstNavigation(request));
        return;
    }

    // 5) Aset statis immutable hasil build Vite → cache-first.
    if (url.pathname.startsWith("/build/")) {
        event.respondWith(cacheFirst(request, RUNTIME));
        return;
    }

    // 6) Aset statis lain (ikon, manifest, gambar) → cache-first di runtime cache.
    if (isStaticAsset(request, url)) {
        event.respondWith(cacheFirst(request, RUNTIME));
    }

    // Sisanya (mis. endpoint Inertia actions) dibiarkan langsung ke jaringan.
});

function isStaticAsset(request, url) {
    if (request.destination && request.destination !== "document") return true;
    return /\.(?:css|js|mjs|svg|png|jpg|jpeg|webp|avif|gif|ico|woff2?|ttf|otf|webmanifest)$/i.test(
        url.pathname,
    );
}

/**
 * Cache-first: cocok untuk aset immutable (ber-hash) dan ikon.
 * Respons non-OK tidak disimpan agar error 4xx/5xx tidak "tertempel" di cache.
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // Offline dan belum pernah ter-cache: tidak ada yang bisa dikembalikan.
        return Response.error();
    }
}

/**
 * Network-first: halaman Inertia selalu dicoba dari jaringan dulu supaya data booking baru,
 * lalu fallback ke salinan HTML terakhir, lalu ke shell offline statis.
 */
async function networkFirstNavigation(request) {
    const cache = await caches.open(RUNTIME);

    try {
        const response = await fetch(request);
        // Hanya simpan halaman sukses. Jangan masukkan redirect/eror ke cache.
        if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;

        const offline = await caches.match(OFFLINE_URL);
        if (offline) return offline;

        return new Response("<h1>Offline</h1>", {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });
    }
}
