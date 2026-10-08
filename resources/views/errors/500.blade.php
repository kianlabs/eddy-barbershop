{{-- Halaman error mandiri (tanpa Inertia): error bisa terjadi sebelum app.jsx siap. --}}
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#c9a227">
    <title>Terjadi Kesalahan — Eddy Barbershop</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="apple-touch-icon" href="/icon.svg">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=bebas-neue:400|plus-jakarta-sans:400,500,600,700" rel="stylesheet" />
    <style>
        :root {
            --canvas: #f8f9fb;
            --ink: #1d1d1f;
            --ink-soft: #6e6e73;
            --gold: #c9a227;
            --gold-text: #8a6d12;
            --hairline: rgba(0, 0, 0, 0.06);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background-color: var(--canvas);
            color: var(--ink);
            font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .card {
            width: 100%;
            max-width: 420px;
            padding: 40px 32px;
            text-align: center;
            border-radius: 22px;
            border: 1px solid rgba(255, 255, 255, 0.85);
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(24px) saturate(190%);
            -webkit-backdrop-filter: blur(24px) saturate(190%);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9);
        }
        .brand {
            font-family: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif;
            font-size: 15px;
            letter-spacing: 0.22em;
            color: var(--gold-text);
            margin: 0 0 20px;
        }
        .code {
            font-family: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif;
            font-size: 96px;
            line-height: 1;
            margin: 0;
            color: var(--gold);
        }
        h1 {
            font-family: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif;
            font-size: 30px;
            letter-spacing: 0.02em;
            font-weight: 400;
            margin: 8px 0 12px;
        }
        p {
            margin: 0 0 28px;
            font-size: 15px;
            line-height: 1.6;
            color: var(--ink-soft);
        }
        .btn {
            display: inline-block;
            padding: 13px 28px;
            border-radius: 16px;
            background: var(--gold);
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            box-shadow: 0 8px 24px -4px rgba(201, 162, 39, 0.28);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px -6px rgba(201, 162, 39, 0.38); }
        .btn:active { transform: scale(0.98); }
        .btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
        .rule { height: 1px; border: 0; background: var(--hairline); margin: 28px 0 16px; }
        .foot { font-size: 12px; color: var(--ink-soft); }
    </style>
</head>
<body>
    <main class="card">
        <p class="brand">EDDY BARBERSHOP</p>
        <p class="code">500</p>
        <h1>Terjadi Kesalahan</h1>
        <p>Ada gangguan di sistem kami. Silakan muat ulang halaman atau kembali ke beranda dan coba lagi sebentar.</p>
        <a class="btn" href="/">Kembali ke Beranda</a>
        <hr class="rule">
        <p class="foot">Makamhaji, Kartasura, Sukoharjo — Duduk anteng, pulang ganteng.</p>
    </main>
</body>
</html>
