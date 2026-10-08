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
}
