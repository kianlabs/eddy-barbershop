<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0">
    {{-- Aksen emas brand; ikut menggerakkan UI bar browser saat PWA terpasang. --}}
    <meta name="theme-color" content="#c9a227">
    <meta name="description" content="Eddy Barbershop — booking jadwal potong rambut online di Makamhaji, Kartasura, Sukoharjo. Duduk anteng, pulang ganteng.">
    <title inertia>Eddy Barbershop — Makamhaji, Kartasura</title>

    {{-- Canonical: bersihkan query agar URL duplikat tidak terindeks terpisah. --}}
    <link rel="canonical" href="{{ url()->current() }}">

    {{-- Open Graph & Twitter Card. og:title/og:description ditimpa saat runtime oleh
         Inertia <Head> di setiap halaman; nilai di sini adalah default halaman muka. --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Eddy Barbershop">
    <meta property="og:locale" content="id_ID">
    <meta property="og:title" content="Eddy Barbershop — Makamhaji, Kartasura">
    <meta property="og:description" content="Booking jadwal potong rambut online di Eddy Barbershop, Makamhaji, Kartasura, Sukoharjo. Duduk anteng, pulang ganteng.">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ url('/images/galeri/skin-fade.webp') }}">
    <meta property="og:image:alt" content="Potongan rambut skin fade di Eddy Barbershop">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Eddy Barbershop — Makamhaji, Kartasura">
    <meta name="twitter:description" content="Booking jadwal potong rambut online di Eddy Barbershop, Makamhaji, Kartasura, Sukoharjo. Duduk anteng, pulang ganteng.">
    <meta name="twitter:image" content="{{ url('/images/galeri/skin-fade.webp') }}">

    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
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
