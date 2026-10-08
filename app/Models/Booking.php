<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        "user_id", "barber_id", "service_id",
        "date", "start_time", "end_time",
        "status", "whatsapp", "notes",
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function barber(): BelongsTo
    {
        return $this->belongsTo(Barber::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Hook model event (append-only, Gap 3).
     *
     * Memicu notifikasi booking baru ke owner TANPA menyentuh controller
     * (Api\BookingController dihindari demi menghindari konflik dengan sesi
     * lain). Karena listener bersifat fire-and-forget, kegagalan notifikasi
     * tidak pernah menggagalkan pembuatan booking.
     */
    protected static function booted(): void
    {
        static::created(function (Booking $booking) {
            app(\App\Listeners\SendNewBookingNotification::class)->handle($booking);
        });
    }
}
