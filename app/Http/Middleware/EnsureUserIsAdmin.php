<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Membatasi akses panel admin hanya untuk user dengan flag is_admin.
 *
 * Dipasang SETELAH middleware `auth`, sehingga request tanpa sesi login sudah
 * dialihkan ke /login lebih dulu dan di sini $request->user() dijamin ada.
 * Non-admin mendapat 403 (bukan redirect) agar keberadaan panel tidak bocor
 * lewat halaman login yang berulang.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_admin) {
            abort(403, "Halaman ini hanya untuk admin.");
        }

        return $next($request);
    }
}
