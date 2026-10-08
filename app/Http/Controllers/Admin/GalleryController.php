<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola galeri (contoh gaya potong) — CRUD penuh.
 *
 * Backend/admin saja untuk sekarang. Home.jsx masih memakai array statis
 * GALERI; integrasi ke halaman publik dicatat sebagai TODO (Home.jsx milik sesi lain).
 */
class GalleryController extends Controller
{
    public function index(): Response
    {
        $galleries = Gallery::ordered()->get();

        return Inertia::render("Admin/Galleries", [
            "galleries" => $galleries,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $gallery = Gallery::create($this->validated($request) + [
            "is_active" => $request->boolean("is_active", true),
        ]);

        return back()->with("success", "Galeri \"{$gallery->label}\" ditambahkan.");
    }

    public function update(Request $request, Gallery $gallery): RedirectResponse
    {
        $gallery->update($this->validated($request) + [
            "is_active" => $request->boolean("is_active", $gallery->is_active),
        ]);

        return back()->with("success", "Galeri \"{$gallery->label}\" diperbarui.");
    }

    public function destroy(Gallery $gallery): RedirectResponse
    {
        $label = $gallery->label;
        $gallery->delete();

        return back()->with("success", "Galeri \"{$label}\" dihapus.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            "label" => ["required", "string", "min:2", "max:100"],
            "image_path" => ["required", "string", "max:500"],
            "alt" => ["nullable", "string", "max:200"],
            "sort_order" => ["nullable", "integer", "min:0", "max:9999"],
            "is_active" => ["sometimes", "boolean"],
        ], [
            "label.required" => "Nama gaya wajib diisi.",
            "image_path.required" => "Path gambar wajib diisi.",
        ]);
    }
}
