<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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

        $newStatus = $data["status"];
        $oldStatus = $booking->status;

        // Guard kronologis: booking belum lewat waktu tidak boleh ditandai "done".
        // Bandingkan tanggal + jam mulai terhadap waktu sekarang.
        if ($newStatus === "done" && $this->isInFuture($booking)) {
            throw ValidationException::withMessages([
                "status" => "Booking #{$booking->id} belum berlangsung (jadwal masih di masa depan). "
                    ."Tandai \"Selesai\" hanya setelah waktu booking terlewat.",
            ]);
        }

        $booking->update(["status" => $newStatus]);

        // Jejak audit terstruktur: siapa (admin) mengubah apa (booking),
        // dari status apa ke status apa, dan kapan.
        Log::info("Admin mengubah status booking.", [
            "admin_id" => $request->user()?->id,
            "booking_id" => $booking->id,
            "old_status" => $oldStatus,
            "new_status" => $newStatus,
            "changed_at" => now()->toIso8601String(),
        ]);

        return back()->with("success", "Status booking #{$booking->id} diubah ke {$newStatus}.");
    }

    /**
     * Detail satu booking — semua field yang tersimpan, termasuk catatan dan
     * kontak lengkap. Aksi ubah status tersedia langsung dari halaman ini.
     */
    public function show(Booking $booking): Response
    {
        $booking->load([
            "barber:id,name,specialty,photo,is_active",
            "service:id,name,description,duration_minutes,price,price_max,is_active",
            "user:id,name,email,whatsapp",
        ]);

        return Inertia::render("Admin/BookingDetail", [
            "booking" => [
                "id" => $booking->id,
                "date" => $booking->date,
                "start_time" => substr((string) $booking->start_time, 0, 5),
                "end_time" => substr((string) $booking->end_time, 0, 5),
                "status" => $booking->status,
                "notes" => $booking->notes,
                "whatsapp" => $booking->whatsapp,
                "created_at" => $booking->created_at?->toIso8601String(),
                "updated_at" => $booking->updated_at?->toIso8601String(),
                "customer" => $booking->user?->only(["id", "name", "email", "whatsapp"]),
                "barber" => $booking->barber,
                "service" => $booking->service,
            ],
            "statuses" => self::STATUSES,
        ]);
    }

    /**
     * Apakah jadwal booking masih di masa depan (tanggal + jam mulai belum lewat)?
     *
     * `date` disimpan sebagai string date (tanpa cast Carbon di model), jadi kita
     * normalkan dulu. Zona waktu mengikuti APP_TIMEZONE agar konsisten dengan jadwal.
     */
    private function isInFuture(Booking $booking): bool
    {
        $date = $booking->date instanceof \DateTimeInterface
            ? $booking->date->format("Y-m-d")
            : (string) $booking->date;

        $start = Carbon::parse(
            $date." ".(string) $booking->start_time,
            config("app.timezone"),
        );

        return $start->isFuture();
    }
}
