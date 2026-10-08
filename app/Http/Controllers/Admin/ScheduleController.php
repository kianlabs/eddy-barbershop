<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barber;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola jam buka kapster per hari (day_of_week 0=Minggu .. 6=Sabtu).
 *
 * Sebelum ini jam buka hanya di-hardcode di DatabaseSeeder (10:00-23:00 tiap
 * hari). Halaman ini menjadikannya data yang bisa diatur owner.
 */
class ScheduleController extends Controller
{
    /** Nama hari Indonesia, indeks 0=Minggu .. 6=Sabtu (samakan dengan Carbon). */
    public const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    public function index(Barber $barber): Response
    {
        // Urut hari supaya tampilan stabil (Minggu dulu).
        $schedules = $barber->schedules()
            ->orderBy("day_of_week")
            ->get(["id", "day_of_week", "start_time", "end_time", "is_active"])
            ->map(fn (Schedule $s) => [
                "id" => $s->id,
                "day_of_week" => $s->day_of_week,
                "day_name" => self::DAY_NAMES[$s->day_of_week] ?? "-",
                "start_time" => substr((string) $s->start_time, 0, 5),
                "end_time" => substr((string) $s->end_time, 0, 5),
                "is_active" => $s->is_active,
            ]);

        return Inertia::render("Admin/BarberSchedules", [
            "barber" => $barber->only(["id", "name", "specialty", "is_active"]),
            "schedules" => $schedules,
            "days" => self::DAY_NAMES,
            // Hari yang belum punya jadwal — untuk menyembunyikan opsi di form tambah.
            "takenDays" => $schedules->pluck("day_of_week")->all(),
        ]);
    }

    public function store(Request $request, Barber $barber): RedirectResponse
    {
        $data = $this->validatePayload($request, $barber);

        $schedule = $barber->schedules()->create($data + [
            "is_active" => $request->boolean("is_active", true),
        ]);

        return back()->with(
            "success",
            "Jadwal hari ".self::DAY_NAMES[$schedule->day_of_week]." (".substr((string) $schedule->start_time, 0, 5)."-".substr((string) $schedule->end_time, 0, 5).") ditambahkan."
        );
    }

    public function update(Request $request, Barber $barber, Schedule $schedule): RedirectResponse
    {
        $this->ensureOwned($barber, $schedule);

        $data = $this->validatePayload($request, $barber, $schedule);

        $schedule->update($data + [
            "is_active" => $request->boolean("is_active", $schedule->is_active),
        ]);

        return back()->with(
            "success",
            "Jadwal hari ".self::DAY_NAMES[$schedule->day_of_week]." diperbarui."
        );
    }

    public function destroy(Barber $barber, Schedule $schedule): RedirectResponse
    {
        $this->ensureOwned($barber, $schedule);

        $day = $schedule->day_of_week;
        $schedule->delete();

        return back()->with("success", "Jadwal hari ".self::DAY_NAMES[$day]." dihapus.");
    }

    /**
     * Pastikan jadwal yang diubah memang milik kapster di URL.
     * Mencegah IDOR lewat /admin/barbers/{a}/schedules/{idMilikB}.
     */
    private function ensureOwned(Barber $barber, Schedule $schedule): void
    {
        abort_unless($schedule->barber_id === $barber->id, 404);
    }

    /**
     * Validasi payload jadwal: start < end, hari 0-6, hari unik per kapster.
     *
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request, Barber $barber, ?Schedule $schedule = null): array
    {
        $validator = validator($request->all(), [
            "day_of_week" => ["required", "integer", "between:0,6"],
            "start_time" => ["required", "date_format:H:i"],
            "end_time" => ["required", "date_format:H:i"],
            "is_active" => ["sometimes", "boolean"],
        ], [
            "day_of_week.required" => "Hari wajib dipilih.",
            "day_of_week.between" => "Hari tidak valid.",
            "start_time.required" => "Jam buka wajib diisi.",
            "start_time.date_format" => "Format jam buka harus HH:MM.",
            "end_time.required" => "Jam tutup wajib diisi.",
            "end_time.date_format" => "Format jam tutup harus HH:MM.",
        ]);

        $validator->after(function (Validator $v) use ($request, $barber, $schedule) {
            // Jam buka harus lebih awal dari jam tutup (bandingkan string HH:MM
            // yang sudah tervalidasi formatnya).
            if (
                ! $v->errors()->has("start_time")
                && ! $v->errors()->has("end_time")
                && $request->input("start_time") >= $request->input("end_time")
            ) {
                $v->errors()->add("end_time", "Jam tutup harus lebih akhir dari jam buka.");
            }

            // Satu kapster hanya boleh punya SATU jadwal per hari.
            if (! $v->errors()->has("day_of_week")) {
                $duplicate = $barber->schedules()
                    ->where("day_of_week", $request->integer("day_of_week"))
                    ->when($schedule, fn ($q) => $q->whereKeyNot($schedule->getKey()))
                    ->exists();

                if ($duplicate) {
                    $v->errors()->add("day_of_week", "Hari ini sudah punya jadwal. Ubah jadwal yang ada.");
                }
            }
        });

        return $validator->validate();
    }
}
