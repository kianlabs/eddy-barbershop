<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Auth sesi sederhana (tanpa paket tambahan seperti Breeze).
 * Guard yang dipakai: `web` (session driver, lihat config/auth.php).
 */
class AuthController extends Controller
{
    /** Tampilkan halaman login. */
    public function showLogin(): Response
    {
        return Inertia::render("Auth/Login");
    }

    /**
     * Proses login.
     *
     * - throttle:10,1 dipasang di route (rate limit per IP) untuk meredam
     *   brute force sebelum kredensial diperiksa.
     * - Pesan error disamakan ("Email atau password salah.") agar tidak
     *   membocorkan email mana yang terdaftar.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            "email" => ["required", "string", "email"],
            "password" => ["required", "string"],
        ], [
            "email.required" => "Email wajib diisi.",
            "email.email" => "Format email tidak valid.",
            "password.required" => "Password wajib diisi.",
        ]);

        if (! Auth::guard("web")->attempt($credentials, $request->boolean("remember"))) {
            throw ValidationException::withMessages([
                "email" => "Email atau password salah.",
            ]);
        }

        // Cegah session fixation: buat ulang ID sesi setelah login berhasil.
        $request->session()->regenerate();

        return redirect()->intended(route("admin.dashboard"));
    }

    /** Keluar dan bersihkan sesi. */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard("web")->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route("login");
    }
}
