<?php

namespace App\Http\Controllers\Tracking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Cookie as HttpCookie;

/**
 * Pelacakan & pembatalan booking tanpa akun (Gap 2).
 *
 * Keamanan utama: pencarian booking WAJIB cocok `id` DAN nomor WhatsApp
 * (dinormalisasi). Tidak pernah ada endpoint yang menampilkan daftar booking.
 */
class BookingLookupController extends Controller
{
    /** Status booking yang masih boleh dibatalkan pelanggan. */
    private const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

    /**
     * Cookie penanda kepemilikan booking yang baru dicari, agar tombol batal
     * tidak bisa dipakai untuk membatalkan booking orang lain hanya dengan
     * menebak id. Cookie berisi HMAC dari id+whatsapp tersimpan (server-side),
     * sehingga tidak bisa dipalsukan tanpa APP_KEY.
     */
    private const OWNER_COOKIE = 'eb_booking_owner';

    private const OWNER_COOKIE_TTL = 30; // menit

    /** Tampilkan form pencarian. */
    public function index(): Response
    {
        return Inertia::render('Tracking/Index');
    }

    /**
     * Cari booking berdasarkan kode (id) + nomor WhatsApp.
     *
     * Kode menerima "#EB-12", "EB-12", atau "12" — semuanya dipetakan ke id 12.
     */
    public function lookup(Request $request): Response
    {
        $data = $request->validate([
            'kode' => ['required', 'string', 'max:30'],
            'whatsapp' => ['required', 'string', 'max:20'],
        ], [
            'kode.required' => 'Kode booking wajib diisi.',
            'whatsapp.required' => 'Nomor WhatsApp wajib diisi.',
        ]);

        $id = $this->parseBookingId($data['kode']);

        // Cek HARUS cocok id DAN whatsapp. Tidak ada pesan pembeda antara
        // "kode tidak ada" dan "nomor salah" supaya tidak membocorkan id mana
        // yang valid (mitigasi enumerasi).
        $booking = $id !== null ? $this->findOwnedBooking($id, $data['whatsapp']) : null;

        if (! $booking) {
            throw ValidationException::withMessages([
                'kode' => 'Data booking tidak ditemukan. Periksa kembali kode dan nomor WhatsApp.',
            ]);
        }

        // Inertia\Response bukan HTTP response, jadi cookie dilampirkan lewat
        // Antrian cookie global yang otomatis dikirim oleh framework.
        Cookie::queue($this->ownerCookie($booking));

        return Inertia::render('Tracking/Show', [
            'booking' => $this->toDetail($booking),
            'canCancel' => $booking->status === 'pending' || $booking->status === 'confirmed',
        ]);
    }

    /**
     * Batalkan booking — hanya saat status masih aktif DAN jadwal belum lewat.
     *
     * Otorisasi tetap memakai pasangan id+whatsapp (bukan sekadar cookie), lalu
     * dicocokkan dengan cookie kepemilikan supaya pemegang cookie booking lain
     * tidak bisa membatalkan booking ini.
     */
    public function cancel(Request $request, string $kode): RedirectResponse
    {
        $data = $request->validate([
            'whatsapp' => ['required', 'string', 'max:20'],
        ], [
            'whatsapp.required' => 'Nomor WhatsApp wajib diisi.',
        ]);

        $id = $this->parseBookingId($kode);
        $booking = $id !== null ? $this->findOwnedBooking($id, $data['whatsapp']) : null;

        if (! $booking) {
            throw ValidationException::withMessages([
                'whatsapp' => 'Data booking tidak ditemukan. Periksa kembali kode dan nomor WhatsApp.',
            ]);
        }

        // Lapisan kedua: cookie kepemilikan harus cocok dengan booking ini.
        if (! hash_equals($this->ownerCookieValue($booking), (string) $request->cookie(self::OWNER_COOKIE))) {
            throw ValidationException::withMessages([
                'whatsapp' => 'Data booking tidak ditemukan. Periksa kembali kode dan nomor WhatsApp.',
            ]);
        }

        if (! in_array($booking->status, self::CANCELLABLE_STATUSES, true)) {
            throw ValidationException::withMessages([
                'whatsapp' => $booking->status === 'cancelled'
                    ? 'Booking ini sudah dibatalkan.'
                    : 'Booking yang sudah selesai tidak bisa dibatalkan.',
            ]);
        }

        if ($this->hasPassed($booking)) {
            throw ValidationException::withMessages([
                'whatsapp' => 'Jadwal sudah lewat, booking tidak bisa dibatalkan. Hubungi kami via WhatsApp.',
            ]);
        }

        $booking->update(['status' => 'cancelled']);

        return redirect()
            ->route('tracking.index')
            ->with('success', "Booking #EB-{$booking->id} berhasil dibatalkan.")
            ->withCookie($this->forgetOwnerCookie());
    }

    /**
     * Ambil booking HANYA bila id cocok DAN whatsapp tersimpan cocok dengan
     * input (dinormalisasi). Mengembalikan null untuk semua kegagalan.
     */
    private function findOwnedBooking(int $id, string $inputWa): ?Booking
    {
        $booking = Booking::with(['barber:id,name', 'service:id,name,price,duration_minutes'])
            ->find($id);

        if (! $booking) {
            return null;
        }

        $expected = $this->normalizeWa($booking->whatsapp);
        $given = $this->normalizeWa($inputWa);

        if ($expected === '' || $given === '' || ! hash_equals($expected, $given)) {
            return null;
        }

        return $booking;
    }

    /**
     * Normalisasi nomor WhatsApp Indonesia — logika identik dengan helper
     * frontend `normalizeWa()` di resources/js/Components/ui.jsx:
     * buang semua non-digit, awalan "0" -> "62".
     */
    private function normalizeWa(string $input): string
    {
        $digits = preg_replace("/\D/", '', $input) ?? '';

        if ($digits === '') {
            return '';
        }

        return $digits[0] === '0' ? '62'.substr($digits, 1) : $digits;
    }

    /**
     * Petakan "#EB-12" / "eb-12" / "12" ke integer 12.
     * Mengembalikan null bila tidak ada digit yang bisa dipakai.
     */
    private function parseBookingId(string $kode): ?int
    {
        if (preg_match("/(\d+)/", $kode, $matches) !== 1) {
            return null;
        }

        $id = (int) $matches[1];

        return $id > 0 ? $id : null;
    }

    /** True bila tanggal+jam mulai booking sudah lewat (zona waktu app). */
    private function hasPassed(Booking $booking): bool
    {
        return Carbon::parse($booking->date.' '.$booking->start_time)->isPast();
    }

    /** Cookie kepemilikan bertanda tangan (HMAC id+whatsapp tersimpan). */
    private function ownerCookie(Booking $booking): HttpCookie
    {
        return cookie(
            self::OWNER_COOKIE,
            $this->ownerCookieValue($booking),
            self::OWNER_COOKIE_TTL,
            '/',
            null,
            $this->secureCookie(),
            true, // httpOnly
            false,
            'lax',
        );
    }

    private function forgetOwnerCookie(): HttpCookie
    {
        return cookie()->forget(self::OWNER_COOKIE);
    }

    /**
     * Nilai cookie = HMAC-SHA256 dari id+whatsapp tersimpan memakai APP_KEY.
     * Hanya bisa dihitung server; tidak membocorkan nomor WhatsApp mentah.
     */
    private function ownerCookieValue(Booking $booking): string
    {
        return hash_hmac('sha256', $booking->id.'|'.$booking->whatsapp, (string) config('app.key'));
    }

    private function secureCookie(): bool
    {
        return app()->environment('production');
    }

    /** Bentuk data detail yang aman dikirim ke klien. */
    private function toDetail(Booking $booking): array
    {
        $date = Carbon::parse($booking->date);

        return [
            'kode' => "#EB-{$booking->id}",
            'id' => $booking->id,
            'status' => $booking->status,
            'date' => $booking->date,
            'date_label' => $date->locale('id')->translatedFormat('l, j M Y'),
            'start_time' => substr((string) $booking->start_time, 0, 5),
            'end_time' => substr((string) $booking->end_time, 0, 5),
            'barber' => $booking->barber?->name,
            'service' => $booking->service?->name,
            'price' => $booking->service?->price,
            'duration_minutes' => $booking->service?->duration_minutes,
            'notes' => $booking->notes,
            'has_passed' => $this->hasPassed($booking),
        ];
    }
}
