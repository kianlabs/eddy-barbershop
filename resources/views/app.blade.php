<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0">
    {{-- Aksen emas brand; ikut menggerakkan UI bar browser saat PWA terpasang. --}}
    <meta name="theme-color" content="#c9a227">
    <meta name="description" content="Eddy Barbershop — booking jadwal potong rambut online di Makamhaji, Kartasura, Sukoharjo. Duduk anteng, pulang ganteng.">
    <title inertia>Eddy Barbershop — Makamhaji, Kartasura</title>
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="apple-touch-icon" href="/icon.svg">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Eddy Barber">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=bebas-neue:400|plus-jakarta-sans:300,400,500,600,700,800" rel="stylesheet" />
    <link href="https://fonts.bunny.net/css?family=material-symbols-outlined:400,500" rel="stylesheet" />
    @viteReactRefresh
    @vite(["resources/css/app.css", "resources/js/app.jsx"])
    @inertiaHead
</head>
<body class="min-h-screen bg-canvas font-sans text-ink antialiased">
    @inertia

    {{--
        Registrasi service worker hanya di production.
        Vite dev server menyajikan modul dari /resources/js dan /@vite/*; meng-cache-nya
        di SW akan menahan kode basi dan menghambat HMR. Jadi di lokal HMR tetap bersih,
        sementara build produksi (/build/* ber-hash) aman untuk cache-first.
    --}}
    @production
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').catch((error) => {
                        console.warn('[PWA] Registrasi service worker gagal:', error);
                    });
                });
            }
        </script>
    @endproduction
</body>
</html>
