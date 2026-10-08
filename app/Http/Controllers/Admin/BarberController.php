<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarberController extends Controller
{
    public function index(): Response
    {
        $barbers = Barber::withCount("bookings")
            ->orderBy("name")
            ->get(["id", "name", "specialty", "photo", "is_active"]);

        return Inertia::render("Admin/Barbers", [
            "barbers" => $barbers,
        ]);
    }

    /** Aktif/nonaktifkan kapster (toggle bila is_active tidak dikirim). */
    public function toggleActive(Request $request, Barber $barber): RedirectResponse
    {
        $data = $request->validate([
            "is_active" => ["sometimes", "boolean"],
        ]);

        $barber->update([
            "is_active" => $data["is_active"] ?? ! $barber->is_active,
        ]);

        return back()->with(
            "success",
            $barber->is_active
                ? "Kapster \"{$barber->name}\" diaktifkan."
                : "Kapster \"{$barber->name}\" dinonaktifkan."
        );
    }

    /** Tambah kapster baru (default aktif). */
    public function store(Request $request): RedirectResponse
    {
        $barber = Barber::create($this->validated($request) + ["is_active" => true]);

        return back()->with("success", "Kapster \"{$barber->name}\" ditambahkan.");
    }

    public function update(Request $request, Barber $barber): RedirectResponse
    {
        $barber->update($this->validated($request));

        return back()->with("success", "Kapster \"{$barber->name}\" diperbarui.");
    }

    /**
     * Hapus kapster.
     *
     * Menolak bila kapster punya booking: FK `bookings.barber_id` memakai
     * cascadeOnDelete, jadi hard-delete akan menghapus riwayat booking pelanggan.
     * Jadwal (schedules) ikut terhapus lewat cascade — itu memang wajar.
     */
    public function destroy(Barber $barber): RedirectResponse
    {
        if ($barber->bookings()->exists()) {
            return back()->withErrors([
                "barber" => "Kapster \"{$barber->name}\" tidak bisa dihapus karena masih punya {$barber->bookings()->count()} booking. Nonaktifkan saja.",
            ]);
        }

        $name = $barber->name;
        $barber->delete();

        return back()->with("success", "Kapster \"{$name}\" dihapus.");
    }

    /**
     * Aturan validasi kapster — dipakai bersama store() dan update().
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            "name" => ["required", "string", "min:2", "max:100"],
            "specialty" => ["nullable", "string", "max:150"],
            "photo" => ["nullable", "string", "max:500"],
        ], [
            "name.required" => "Nama kapster wajib diisi.",
            "name.min" => "Nama kapster minimal 2 karakter.",
        ]);
    }
}
