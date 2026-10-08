<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifikasi booking baru untuk OWNER (Gap 3).
 *
 * Kenapa di-queue (`ShouldQueue`):
 *  - Pengiriman email (atau WA di masa depan) tidak boleh memblokir respons
 *    pembuatan booking. Worker memprosesnya di belakang layar.
 *
 * Fire-and-forget:
 *  - Notifikasi ini dipicu lewat Eloquent model event (`Booking::created`).
 *    Kegagalan mengirim notifikasi tidak pernah menggagalkan pembuatan booking
 *    karena pengiriman terjadi di luar transaksi DB dan (bila queue non-sync)
 *    di proses terpisah.
 *
 * Kanal:
 *  - `mail` : aktif sekarang. Di dev, `MAIL_MAILER=log` sehingga email hanya
 *             ditulis ke `storage/logs/laravel.log` (tanpa kredensial SMTP).
 *  - `whatsapp`: belum ada gateway/key, jadi TIDAK diaktifkan. Teks siap-pakai
 *             disediakan lewat `toWhatsAppText()` agar tinggal di-plug begitu
 *             gateway tersedia.
 */
class NewBookingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Tentukan kanal. Hanya `mail`; WA ditambahkan belakangan saat gateway ada.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Booking yang baru dibuat. Di-resolve ulang by id saat deserialisasi queue
     * agar payload queue tetap kecil; relasi di-eager-load lewat `with()`.
     *
     * @param  array<int, string>  $relations
     */
    public function __construct(public Booking $booking)
    {
        // Eager-load agar saat diproses worker (serialized) relasi tidak
        // menghasilkan query terlambat atau error "model not found".
        $this->booking->loadMissing(['barber', 'service', 'user']);
    }

    /**
     * Daftar relasi yang harus ikut serialisasi saat notifikasi masuk queue.
     *
     * @return array<int, string>
     */
    public function with(): array
    {
        return ['booking'];
    }

    /**
     * Representasi email untuk owner.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $b = $this->booking;

        return (new MailMessage())
            ->subject('Booking Baru #'.$b->id.' — '.$b->date.' '.$this->timeLabel($b->start_time))
            ->greeting('Booking baru masuk')
            ->line('Ada booking baru dari pelanggan. Detail:')
            ->line('Nama        : '.($b->user?->name ?? '-'))
            ->line('WhatsApp    : '.($b->whatsapp ?? '-'))
            ->line('Kapster     : '.($b->barber?->name ?? '(acak)'))
            ->line('Layanan     : '.($b->service?->name ?? '-'))
            ->line('Tanggal     : '.$b->date)
            ->line('Jam         : '.$this->timeLabel($b->start_time).' - '.$this->timeLabel($b->end_time))
            ->line('Status      : '.$b->status)
            ->when(filled($b->notes), fn (MailMessage $m) => $m->line('Catatan     : '.$b->notes))
            ->action('Buka Panel Admin', url('/admin/bookings'))
            ->line('Email otomatis dari sistem Eddy Barbershop.');
    }

    /**
     * Data notifikasi untuk kanal non-mail (mis. array/WA) — berguna untuk
     * debugging dan sebagai basis integrasi gateway WA nanti.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $b = $this->booking;

        return [
            'booking_id' => $b->id,
            'name' => $b->user?->name,
            'whatsapp' => $b->whatsapp,
            'barber' => $b->barber?->name,
            'service' => $b->service?->name,
            'date' => $b->date,
            'start_time' => $this->timeLabel($b->start_time),
            'end_time' => $this->timeLabel($b->end_time),
            'status' => $b->status,
        ];
    }

    /**
     * Teks siap-pakai WhatsApp untuk owner (Gap 3).
     *
     * Gateway WA belum tersedia, jadi teks ini belum dikirim; sengaja
     * disiapkan agar integrasi cukup memanggil method ini dan mengirim via HTTP.
     */
    public function toWhatsAppText(): string
    {
        $b = $this->booking;

        $lines = [
            'BOOKING BARU #'.$b->id,
            'Nama: '.($b->user?->name ?? '-'),
            'WA: '.($b->whatsapp ?? '-'),
            'Kapster: '.($b->barber?->name ?? '(acak)'),
            'Layanan: '.($b->service?->name ?? '-'),
            'Tanggal: '.$b->date,
            'Jam: '.$this->timeLabel($b->start_time).' - '.$this->timeLabel($b->end_time),
            'Status: '.$b->status,
        ];

        if (filled($b->notes)) {
            $lines[] = 'Catatan: '.$b->notes;
        }

        return implode("\n", $lines);
    }

    /**
     * Normalisasi "HH:MM:SS" -> "HH:MM" untuk tampilan.
     */
    private function timeLabel(?string $time): string
    {
        return $time ? substr($time, 0, 5) : '-';
    }
}
