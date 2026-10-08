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

    public function update(Request $request, Service $service): RedirectResponse
    {
        $data = $request->validate([
            "name" => ["required", "string", "min:2", "max:100", Rule::unique("services", "name")->ignore($service->id)],
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

        $service->update($data);

        return back()->with("success", "Layanan \"{$service->name}\" diperbarui.");
    }
}
