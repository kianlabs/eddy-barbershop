<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /** Status valid — sama dengan enum di tabel bookings. */
    private const STATUSES = ["pending", "confirmed", "done", "cancelled"];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            "date" => ["nullable", "date"],
            "status" => ["nullable", Rule::in(self::STATUSES)],
            "barber_id" => ["nullable", "integer", "exists:barbers,id"],
        ]);

        // with() dimuat sekaligus -> menghindari N+1 saat render tabel.
        $query = Booking::with([
            "barber:id,name",
            "service:id,name,price,duration_minutes",
            "user:id,name,whatsapp",
        ])->latest("date")->latest("start_time");

        if (! empty($filters["date"])) {
            $query->whereDate("date", $filters["date"]);
        }

        if (! empty($filters["status"])) {
            $query->where("status", $filters["status"]);
        }

        if (! empty($filters["barber_id"])) {
            $query->where("barber_id", $filters["barber_id"]);
        }

        $bookings = $query->paginate(25)->withQueryString()->through(
            fn (Booking $b) => [
                "id" => $b->id,
                "date" => $b->date,
                "start_time" => substr((string) $b->start_time, 0, 5),
                "end_time" => substr((string) $b->end_time, 0, 5),
                "customer" => $b->user?->name,
                "whatsapp" => $b->whatsapp ?: $b->user?->whatsapp,
                "barber" => $b->barber?->name,
                "service" => $b->service?->name,
                "price" => $b->service?->price,
                "status" => $b->status,
                "notes" => $b->notes,
            ]
        );

        return Inertia::render("Admin/Bookings", [
            "bookings" => $bookings,
            "filters" => [
                "date" => $filters["date"] ?? "",
                "status" => $filters["status"] ?? "",
                "barber_id" => $filters["barber_id"] ?? "",
            ],
            "barbers" => Barber::orderBy("name")->get(["id", "name"]),
            "statuses" => self::STATUSES,
        ]);
    }

    public function updateStatus(Request $request, Booking $booking): RedirectResponse
    {
        $data = $request->validate([
            "status" => ["required", Rule::in(self::STATUSES)],
        ], [
            "status.required" => "Status wajib dipilih.",
            "status.in" => "Status tidak dikenali.",
        ]);

        $booking->update(["status" => $data["status"]]);

        return back()->with("success", "Status booking #{$booking->id} diubah ke {$data["status"]}.");
    }
}
