<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $today = now()->toDateString();

        $stats = [
            "bookings_today" => Booking::whereDate("date", $today)->count(),
            "bookings_total" => Booking::count(),
            "bookings_pending" => Booking::where("status", "pending")->count(),
            "barbers" => Barber::count(),
            "barbers_active" => Barber::where("is_active", true)->count(),
            "services" => Service::count(),
            "services_active" => Service::where("is_active", true)->count(),
        ];

        // Booking terbaru untuk pintasan cepat ke daftar.
        $recent = Booking::with(["barber:id,name", "service:id,name"])
            ->latest("id")
            ->limit(5)
            ->get()
            ->map(fn (Booking $b) => [
                "id" => $b->id,
                "date" => $b->date,
                "start_time" => substr((string) $b->start_time, 0, 5),
                "customer" => $b->user?->name,
                "barber" => $b->barber?->name,
                "service" => $b->service?->name,
                "status" => $b->status,
            ]);

        return Inertia::render("Admin/Dashboard", [
            "stats" => $stats,
            "recent" => $recent,
            "admin" => $request->user()?->name,
        ]);
    }
}
