<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Status booking yang dianggap masih "menahan" slot.
     */
    private const ACTIVE_STATUSES = ["pending", "confirmed"];

    public function services(): JsonResponse
    {
        return response()->json(
            Service::where("is_active", true)->orderBy("price")->get()
        );
    }

    public function barbers(): JsonResponse
    {
        return response()->json(
            Barber::where("is_active", true)->with("schedules")->get()
        );
    }

    public function availableSlots(Request $request): JsonResponse
    {
        $data = $request->validate([
            "barber_id" => "required|exists:barbers,id",
            "service_id" => "required|exists:services,id",
            "date" => "required|date|after_or_equal:today",
        ]);

        $barber = Barber::findOrFail($data["barber_id"]);
        $service = Service::findOrFail($data["service_id"]);
        $date = Carbon::parse($data["date"]);

        $schedule = Schedule::where("barber_id", $barber->id)
            ->where("day_of_week", $date->dayOfWeek)
            ->where("is_active", true)
            ->first();

        if (! $schedule) {
            return response()->json(["slots" => [], "reason" => "closed"]);
        }

        $duration = $service->duration_minutes;

        // Load seluruh booking aktif pada hari itu, lalu bandingkan irisan
        // interval di PHP. Pendekatan ini benar untuk durasi layanan berapa pun
        // dan tidak bergantung pada kesamaan jam mulai.
        $bookings = Booking::where("barber_id", $barber->id)
            ->where("date", $date->toDateString())
            ->whereIn("status", self::ACTIVE_STATUSES)
            ->get(["start_time", "end_time"]);

        $busy = $bookings->map(fn (Booking $booking) => [
            "start" => $this->minutesOfDay($booking->start_time),
            "end" => $this->minutesOfDay($booking->end_time),
        ])->all();

        $slots = [];

        $cursor = Carbon::parse($date->toDateString()." ".$schedule->start_time);
        $end = Carbon::parse($date->toDateString()." ".$schedule->end_time);

        while ($cursor->copy()->addMinutes($duration)->lte($end)) {
            $slotStart = $this->minutesOfDay($cursor->format("H:i:s"));
            $slotEnd = $slotStart + $duration;

            if (! $this->overlapsAny($busy, $slotStart, $slotEnd)) {
                $slots[] = $cursor->format("H:i");
            }

            $cursor->addMinutes($duration);
        }

        return response()->json(["slots" => $slots]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            "barber_id" => "required|exists:barbers,id",
            "service_id" => "required|exists:services,id",
            "date" => "required|date|after_or_equal:today",
            "start_time" => "required|date_format:H:i",
            "name" => "required|string|min:2|max:100",
            "whatsapp" => ["required", "string", "max:20", "regex:/^(\+?62|0)8[0-9]{7,13}$/"],
            "notes" => "nullable|string|max:500",
            "hide_barber" => "sometimes|boolean",
        ], [
            "barber_id.required" => "Kapster wajib dipilih.",
            "barber_id.exists" => "Kapster tidak ditemukan.",
            "service_id.required" => "Layanan wajib dipilih.",
            "service_id.exists" => "Layanan tidak ditemukan.",
            "date.required" => "Tanggal wajib diisi.",
            "date.date" => "Format tanggal tidak valid.",
            "date.after_or_equal" => "Tanggal tidak boleh di masa lalu.",
            "start_time.required" => "Jam mulai wajib diisi.",
            "start_time.date_format" => "Format jam harus HH:MM.",
            "name.required" => "Nama wajib diisi.",
            "name.min" => "Nama minimal 2 karakter.",
            "name.max" => "Nama maksimal 100 karakter.",
            "whatsapp.required" => "Nomor WhatsApp wajib diisi.",
            "whatsapp.regex" => "Format nomor WhatsApp Indonesia tidak valid (contoh: 08123456789 atau +628123456789).",
            "notes.max" => "Catatan maksimal 500 karakter.",
            "hide_barber.boolean" => "Parameter hide_barber harus bernilai boolean.",
        ]);

        $service = Service::findOrFail($data["service_id"]);
        $start = Carbon::parse($data["date"]." ".$data["start_time"]);
        $end = $start->copy()->addMinutes($service->duration_minutes);

        $booking = DB::transaction(function () use ($data, $start, $end) {
            // Anchor lock: kunci baris kapster agar request paralel pada kapster
            // yang sama terserialisasi. Row booking belum tentu ada sehingga
            // lockForUpdate pada booking tidak mengunci apa pun (gap lock tidak
            // dijamin). Baris barber selalu ada, jadi aman dipakai anchor.
            Barber::whereKey($data["barber_id"])->lockForUpdate()->first();

            // Deteksi konflik dengan irisan interval:
            // existing.start < new.end AND existing.end > new.start
            $conflict = Booking::where("barber_id", $data["barber_id"])
                ->where("date", $data["date"])
                ->whereIn("status", self::ACTIVE_STATUSES)
                ->where("start_time", "<", $end->format("H:i:s"))
                ->where("end_time", ">", $start->format("H:i:s"))
                ->exists();

            if ($conflict) {
                throw ValidationException::withMessages([
                    "start_time" => "Slot sudah dibooking. Pilih jam lain.",
                ]);
            }

            // Nama selalu mengikuti input terbaru untuk nomor WA yang sama.
            $user = User::updateOrCreate(
                ["whatsapp" => $data["whatsapp"]],
                [
                    "name" => $data["name"],
                    "email" => "wa".preg_replace("/[^0-9]/", "", $data["whatsapp"])."@eddybarber.local",
                ]
            );

            return Booking::create([
                "user_id" => $user->id,
                "barber_id" => $data["barber_id"],
                "service_id" => $data["service_id"],
                "date" => $data["date"],
                "start_time" => $start->format("H:i:s"),
                "end_time" => $end->format("H:i:s"),
                "status" => "pending",
                "whatsapp" => $data["whatsapp"],
                "notes" => $data["notes"] ?? null,
            ]);
        });

        // Mode 'acak': jangan bocorkan nama kapster ke klien.
        if ($request->boolean("hide_barber")) {
            $booking->setRelation("barber", null);
            $booking->makeHidden("barber");
            $booking->load("service");
        } else {
            $booking->load(["barber", "service"]);
        }

        return response()->json($booking, 201);
    }

    /**
     * Deteksi irisan interval menggunakan menit sejak tengah malam.
     * Interval setengah terbuka: [start, end).
     *
     * @param  array<int, array{start: int, end: int}>  $busy
     */
    private function overlapsAny(array $busy, int $slotStart, int $slotEnd): bool
    {
        foreach ($busy as $interval) {
            if ($interval["start"] < $slotEnd && $interval["end"] > $slotStart) {
                return true;
            }
        }

        return false;
    }

    /**
     * Konversi waktu "HH:MM" / "HH:MM:SS" ke menit sejak tengah malam.
     */
    private function minutesOfDay(string $time): int
    {
        [$hours, $minutes] = array_map("intval", explode(":", $time));

        return ($hours * 60) + $minutes;
    }
}
