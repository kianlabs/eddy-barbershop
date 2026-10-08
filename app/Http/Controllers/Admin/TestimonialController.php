<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola testimoni pelanggan — CRUD penuh.
 *
 * Backend/admin saja untuk sekarang. Home.jsx masih memakai testimoni statis;
 * integrasi ke halaman publik dicatat sebagai TODO (Home.jsx milik sesi lain).
 */
class TestimonialController extends Controller
{
    public function index(): Response
    {
        $testimonials = Testimonial::ordered()->get();

        return Inertia::render("Admin/Testimonials", [
            "testimonials" => $testimonials,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $testimonial = Testimonial::create($this->validated($request) + [
            "is_active" => $request->boolean("is_active", true),
        ]);

        return back()->with("success", "Testimoni dari \"{$testimonial->author_name}\" ditambahkan.");
    }

    public function update(Request $request, Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update($this->validated($request) + [
            "is_active" => $request->boolean("is_active", $testimonial->is_active),
        ]);

        return back()->with("success", "Testimoni dari \"{$testimonial->author_name}\" diperbarui.");
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $author = $testimonial->author_name;
        $testimonial->delete();

        return back()->with("success", "Testimoni dari \"{$author}\" dihapus.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            "author_name" => ["required", "string", "min:2", "max:100"],
            "author_location" => ["nullable", "string", "max:100"],
            "quote" => ["required", "string", "min:10", "max:1000"],
            "rating" => ["required", "integer", "between:1,5"],
            "member_since" => ["nullable", "string", "max:100"],
            "sort_order" => ["nullable", "integer", "min:0", "max:9999"],
            "is_active" => ["sometimes", "boolean"],
        ], [
            "author_name.required" => "Nama pemberi testimoni wajib diisi.",
            "quote.required" => "Isi testimoni wajib diisi.",
            "quote.min" => "Isi testimoni minimal 10 karakter.",
            "rating.between" => "Rating harus antara 1 sampai 5.",
        ]);
    }
}
