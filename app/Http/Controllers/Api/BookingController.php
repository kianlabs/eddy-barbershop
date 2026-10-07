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
        $slots = [];

        $cursor = Carbon::parse($date->toDateString()." ".$schedule->start_time);
        $end = Carbon::parse($date->toDateString()." ".$schedule->end_time);

        $taken = Booking::where("barber_id", $barber->id)
            ->where("date", $date->toDateString())
            ->whereIn("status", ["pending", "confirmed"])
            ->pluck("start_time")
            ->map(fn ($t) => substr($t, 0, 5))
            ->toArray();

        while ($cursor->copy()->addMinutes($duration)->lte($end)) {
            $label = $cursor->format("H:i");
            if (! in_array($label, $taken)) {
                $slots[] = $label;
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
            "name" => "required|string|max:100",
            "whatsapp" => "required|string|max:20",
            "notes" => "nullable|string|max:500",
        ]);

        $service = Service::findOrFail($data["service_id"]);
        $start = Carbon::parse($data["date"]." ".$data["start_time"]);
        $endTime = $start->copy()->addMinutes($service->duration_minutes)->format("H:i:s");

        try {
            $booking = DB::transaction(function () use ($data, $endTime) {
                $conflict = Booking::where("barber_id", $data["barber_id"])
                    ->where("date", $data["date"])
                    ->where("start_time", $data["start_time"].":00")
                    ->whereIn("status", ["pending", "confirmed"])
                    ->lockForUpdate()
                    ->exists();

                if ($conflict) {
                    throw ValidationException::withMessages([
                        "start_time" => "Slot sudah dibooking. Pilih jam lain.",
                    ]);
                }

                $user = User::firstOrCreate(
                    ["whatsapp" => $data["whatsapp"]],
                    ["name" => $data["name"], "email" => "wa".preg_replace("/[^0-9]/", "", $data["whatsapp"])."@eddybarber.local"]
                );

                return Booking::create([
                    "user_id" => $user->id,
                    "barber_id" => $data["barber_id"],
                    "service_id" => $data["service_id"],
                    "date" => $data["date"],
                    "start_time" => $data["start_time"].":00",
                    "end_time" => $endTime,
                    "status" => "pending",
                    "whatsapp" => $data["whatsapp"],
                    "notes" => $data["notes"] ?? null,
                ]);
            });
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            throw ValidationException::withMessages([
                "start_time" => "Slot sudah dibooking. Pilih jam lain.",
            ]);
        }

        $booking->load(["barber", "service"]);

        return response()->json($booking, 201);
    }
}
