<?php

namespace App\Listeners;

use App\Models\Booking;
use App\Notifications\NewBookingNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Kirim notifikasi booking baru ke email OWNER (Gap 3).
 *
 * Dipanggil dari Eloquent model event `Booking::created` (lihat
 * app/Models/Booking::booted()). Pendekatan ini dipilih agar TIDAK perlu
 * menyentuh `Api\BookingController` (dihindari untuk mencegah konflik dengan
 * sesi lain) sementara notifikasi tetap otomatis terpicu untuk SEMUA jalur
 * pembuatan booking (API, admin, seeder, tester).
 *
 * Fire-and-forget:
 *  - `Notification::route('mail', ...)->notify()` men-*queue* notifikasi
 *    (`NewBookingNotification implements ShouldQueue`). Bila pengiriman gagal,
 *    hanya tercatat di log — booking tetap sukses. Kami tidak melempar
 *    exception keluar dari listener.
 */
class SendNewBookingNotification
{
    /**
     * Tangani event `Booking::created`.
     */
    public function handle(Booking $booking): void
    {
        $recipient = config('services.booking.notify_email');

        // Tanpa alamat owner yang dikonfigurasi, jangan lakukan apa pun.
        // Ini juga membuat test tidak mengirim email nyata.
        if (blank($recipient)) {
            return;
        }

        try {
            Notification::route('mail', $recipient)
                ->notify(new NewBookingNotification($booking));
        } catch (\Throwable $e) {
            // Fire-and-forget: kegagalan notifikasi tidak boleh menggagalkan
            // pembuatan booking. Cukup catat untuk investigasi.
            Log::warning('Gagal mengirim notifikasi booking baru.', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
