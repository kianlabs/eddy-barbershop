<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // Rute pelacakan booking tanpa akun (Gap 2) dipisah agar tidak
        // bertabrakan dengan sesi lain yang menyunting routes/web.php.
        then: function (): void {
            require base_path('routes/tracking.php');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        // Middleware `auth` membuat redirect 302 biasa (bukan 401 JSON) saat
        // tamu membuka halaman admin. Client Inertia menangani 302 sebagai
        // kunjungan Inertia sungguhan, sehingga halaman /login ikut ter-render
        // tanpa full reload — aman untuk SPA.
        $middleware->redirectGuestsTo('/login');

        // Alias `admin` -> cek flag users.is_admin (harus setelah `auth`).
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
