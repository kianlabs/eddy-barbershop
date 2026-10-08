<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        // withCount booking -> tampil di tabel tanpa query tambahan per baris.
        $services = Service::withCount("bookings")
            ->orderBy("price")
            ->get(["id", "name", "description", "duration_minutes", "price", "price_max", "is_active"]);

        return Inertia::render("Admin/Services", [
            "services" => $services,
        ]);
    }

    /**
     * Aktif/nonaktifkan layanan.
     *
     * Kalau is_active dikirim eksplisit pakai itu; kalau tidak, dibalik (toggle).
     */
    public function toggleActive(Request $request, Service $service): RedirectResponse
    {
        $data = $request->validate([
            "is_active" => ["sometimes", "boolean"],
        ]);

        $service->update([
            "is_active" => $data["is_active"] ?? ! $service->is_active,
        ]);

        return back()->with(
            "success",
            $service->is_active
                ? "Layanan \"{$service->name}\" diaktifkan."
                : "Layanan \"{$service->name}\" dinonaktifkan."
        );
    }

    /** Tambah layanan baru (default aktif). */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $service = Service::create($data + ["is_active" => true]);

        return back()->with("success", "Layanan \"{$service->name}\" ditambahkan.");
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $service->update($this->validated($request, $service));

        return back()->with("success", "Layanan \"{$service->name}\" diperbarui.");
    }

    /**
     * Hapus layanan.
     *
     * Menolak bila layanan masih dipakai booking. FK `bookings.service_id`
     * memakai cascadeOnDelete, sehingga hard-delete akan ikut menghapus riwayat
     * booking — tidak diinginkan karena itu data transaksi. Riwayat harga pun
     * ikut hilang karena harga disimpan di baris service.
     */
    public function destroy(Service $service): RedirectResponse
    {
        if ($service->bookings()->exists()) {
            return back()->withErrors([
                "service" => "Layanan \"{$service->name}\" tidak bisa dihapus karena masih dipakai {$service->bookings()->count()} booking. Nonaktifkan saja.",
            ]);
        }

        $name = $service->name;
        $service->delete();

        return back()->with("success", "Layanan \"{$name}\" dihapus.");
    }

    /**
     * Aturan validasi layanan — dipakai bersama store() dan update().
     * Unik-nama mengabaikan baris yang sedang diubah.
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Service $service = null): array
    {
        return $request->validate([
            "name" => ["required", "string", "min:2", "max:100", Rule::unique("services", "name")->ignore($service?->id)],
            "description" => ["nullable", "string", "max:500"],
            "duration_minutes" => ["required", "integer", "min:5", "max:480"],
            "price" => ["required", "integer", "min:0", "max:10000000"],
            "price_max" => ["nullable", "integer", "min:0", "max:10000000", "gte:price"],
        ], [
            "name.required" => "Nama layanan wajib diisi.",
            "name.unique" => "Nama layanan sudah dipakai.",
            "duration_minutes.required" => "Durasi wajib diisi.",
            "duration_minutes.min" => "Durasi minimal 5 menit.",
            "price.required" => "Harga wajib diisi.",
            "price_max.gte" => "Harga maksimal tidak boleh lebih kecil dari harga.",
        ]);
    }
}
