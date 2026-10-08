<?php

namespace Tests\Feature;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Regresi API booking (Eddy Barbershop).
 *
 * Kontrak perilaku yang diuji (lihat catatan branch be-kritis):
 *  - C1 [KRITIS] : overlap durasi — booking pada jam yang bersinggungan dengan
 *                  booking aktif (pending/confirmed) untuk kapster & tanggal
 *                  yang sama HARUS ditolak 422. Termasuk durasi layanan beda.
 *  - R            : tidak boleh ada dua booking start_time identik (unique).
 *  - I1           : opsi `hide_barber` menyembunyikan relasi `barber`.
 *  - WA           : validasi format `whatsapp`, panjang `name`, dsb.
 *
 * Catatan DB pengujian:
 *  - `phpunit.xml` memaksa DB_CONNECTION=sqlite + DB_DATABASE=:memory:.
 *  - SQLite (Laravel 13, SQLiteGrammar::typeEnum) men-*translate* enum menjadi
 *    `varchar check (... in ("pending","confirmed",...))`, jadi kolom enum
 *    `bookings.status` tetap berjalan tanpa mengubah migrasi.
 *
 * Catatan implementasi:
 *  - Semua test memakai trait `RefreshDatabase` sehingga tidak menyentuh
 *    MySQL/DB dev.
 *  - Model tidak memakai trait HasFactory (tidak boleh diubah). Factory
 *    di-resolve lewat `Factory::factoryForModel()`.
 */
class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Guardrail SEBELUM trait RefreshDatabase menyentuh DB apa pun. Trait ini
        // menyisipkan refreshDatabase() sebagai hook setUp setelah parent, jadi
        // pemeriksaan di bawah masih terjadi sebelum migrasi/transaksi dimulai.
        $connection = config('database.default');
        if (config("database.connections.{$connection}.database") !== ':memory:') {
            $this->markTestSkipped(
                'BookingApiTest membutuhkan DB pengujian in-memory. '
                .'Set DB_CONNECTION=sqlite dan DB_DATABASE=:memory: di phpunit.xml.'
            );
        }
    }

    // ----------------------------------------------------------------- help --

    /** Buat model lewat factory tanpa butuh trait HasFactory di model. */
    protected function factoryFor(string $modelClass): Factory
    {
        return Factory::factoryForModel($modelClass);
    }

    /** Tanggal uji deterministik (bukan bergantung hari saat test dijalankan). */
    protected function testDate(int $addDays = 1): Carbon
    {
        return Carbon::today()->addDays($addDays)->startOfDay();
    }

    /**
     * Kapster + jadwal untuk hari pada tanggal tertentu (10:00–23:00).
     */
    protected function barberOpenOn(Carbon $date, string $start = '10:00', string $end = '23:00'): Barber
    {
        $barber = $this->factoryFor(Barber::class)->create();

        $this->factoryFor(Schedule::class)->create([
            'barber_id' => $barber->id,
            'day_of_week' => $date->dayOfWeek,
            'start_time' => $start.':00',
            'end_time' => $end.':00',
            'is_active' => true,
        ]);

        return $barber;
    }

    protected function serviceWithDuration(int $minutes): Service
    {
        return $this->factoryFor(Service::class)->duration($minutes)->create();
    }

    /** Booking langsung ke DB (mem-bypass controller) untuk menyiapkan data. */
    protected function seedBooking(
        Barber $barber,
        Service $service,
        Carbon $date,
        string $start,
        string $end,
        string $status = 'pending',
    ): Booking {
        $user = $this->factoryFor(User::class)->create();

        return $this->factoryFor(Booking::class)->create([
            'user_id' => $user->id,
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
            'start_time' => $start,
            'end_time' => $end,
            'status' => $status,
        ]);
    }

    protected function validPayload(Barber $barber, Service $service, Carbon $date, string $start = '10:00'): array
    {
        return [
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
            'start_time' => $start,
            'name' => 'Budi Santoso',
            'whatsapp' => '6281234567890',
            'notes' => null,
        ];
    }

    // ---------------------------------------------------------- 1. slot normal --

    #[Test]
    public function available_slots_start_at_schedule_open_and_follow_service_duration(): void
    {
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertOk();
        $slots = $response->json('slots');
        $this->assertIsArray($slots);
        $this->assertNotEmpty($slots);
        $this->assertSame('10:00', $slots[0], 'Slot pertama harus tepat saat jam buka jadwal (10:00).');
    }

    #[Test]
    public function available_slots_step_matches_service_duration(): void
    {
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        // Layanan 60 menit → langkah antar slot 60 menit.
        $service = $this->serviceWithDuration(60);

        $slots = $this->getJson('/api/available-slots?'.http_build_query([
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]))->json('slots');

        $this->assertNotEmpty($slots);
        $this->assertSame(['10:00', '11:00', '12:00'], array_slice($slots, 0, 3));
    }

    // --------------------------------------------------------- 2. hari tutup --

    #[Test]
    public function available_slots_returns_empty_slots_with_closed_reason_when_no_schedule(): void
    {
        // Kapster TANPA jadwal pada tanggal uji.
        $barber = $this->factoryFor(Barber::class)->create();
        $service = $this->serviceWithDuration(30);
        $date = $this->testDate();

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertOk();
        $response->assertJson(['slots' => [], 'reason' => 'closed']);
        $this->assertSame([], $response->json('slots'));
    }

    // ------------------------------------------------------- 3. OVERLAP (C1) --

    #[Test]
    public function overlapping_booking_with_different_duration_is_rejected(): void
    {
        // C1 [KRITIS]: booking 30 menit 10:00-10:30, lalu booking 90 menit di
        // 10:15 (bertumpang tindih) oleh kapster & tanggal SAMA → harus 422.
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');

        $service30 = $this->serviceWithDuration(30);
        $service90 = $this->serviceWithDuration(90);

        $this->seedBooking($barber, $service30, $date, '10:00:00', '10:30:00', 'pending');

        $response = $this->postJson('/api/bookings', $this->validPayload($barber, $service90, $date, '10:15'));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['start_time']);
    }

    #[Test]
    public function booking_starting_inside_an_existing_longer_booking_is_rejected(): void
    {
        // Sisi lain C1: booking panjang 90 menit 10:00-11:30 sudah ada, lalu
        // booking pendek 30 menit di 11:00 (di dalam rentang) → 422.
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');

        $long = $this->serviceWithDuration(90);
        $short = $this->serviceWithDuration(30);

        $this->seedBooking($barber, $long, $date, '10:00:00', '11:30:00', 'pending');

        $response = $this->postJson('/api/bookings', $this->validPayload($barber, $short, $date, '11:00'));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['start_time']);
    }

    #[Test]
    public function booking_whose_end_overruns_next_existing_booking_is_rejected(): void
    {
        // Sisi lain: booking baru 90 menit di 09:30 (09:30-11:00) menabrak booking
        // existing 30 menit di 10:30 (10:30-11:00) → 422.
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '09:00', '23:00');

        $new = $this->serviceWithDuration(90);
        $existing = $this->serviceWithDuration(30);

        $this->seedBooking($barber, $existing, $date, '10:30:00', '11:00:00', 'pending');

        $response = $this->postJson('/api/bookings', $this->validPayload($barber, $new, $date, '09:30'));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['start_time']);
    }

    // --------------------------------------------------- 4. NON-overlap lolos --

    #[Test]
    public function adjacent_non_overlapping_booking_succeeds(): void
    {
        // Perbaikan C1 tidak boleh terlalu ketat: 10:00-10:30 lalu 10:30 (durasi
        // berikutnya) HANYA bersinggungan di batas → harus BERHASIL (201).
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');

        $service30 = $this->serviceWithDuration(30);
        $service90 = $this->serviceWithDuration(90);

        $this->seedBooking($barber, $service30, $date, '10:00:00', '10:30:00', 'pending');

        $response = $this->postJson('/api/bookings', $this->validPayload($barber, $service90, $date, '10:30'));

        $response->assertStatus(201);
    }

    // ----------------------------------------------------------- 5. validasi --

    #[Test]
    public function invalid_whatsapp_format_is_rejected(): void
    {
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $payload = $this->validPayload($barber, $service, $date, '10:00');
        $payload['whatsapp'] = 'abc-bukan-nomor';

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['whatsapp']);
    }

    #[Test]
    public function name_shorter_than_two_characters_is_rejected(): void
    {
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $payload = $this->validPayload($barber, $service, $date, '10:00');
        $payload['name'] = 'A';

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    // ------------------------------------------------------------- 6. store --

    #[Test]
    public function store_creates_pending_booking_and_returns_201(): void
    {
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $response = $this->postJson('/api/bookings', $this->validPayload($barber, $service, $date, '10:00'));

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'pending');

        $this->assertDatabaseHas('bookings', [
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '10:30:00',
            'status' => 'pending',
            'whatsapp' => '6281234567890',
        ]);
    }

    // ------------------------------------------------ 7. duplikat start_time --

    #[Test]
    public function duplicate_start_time_for_same_barber_and_date_is_rejected(): void
    {
        // R: request kedua dengan start_time persis sama (kapster & tanggal sama)
        // harus ditolak 422 — baik oleh pengecekan aplikasi maupun unique index.
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $first = $this->postJson('/api/bookings', $this->validPayload($barber, $service, $date, '10:00'));
        $first->assertStatus(201);

        $second = $this->postJson('/api/bookings', $this->validPayload($barber, $service, $date, '10:00'));

        $second->assertStatus(422);
        $second->assertJsonValidationErrors(['start_time']);
        $this->assertDatabaseCount('bookings', 1);
    }

    // ------------------------------------------------------- 8. hide_barber --

    #[Test]
    public function hide_barber_true_omits_barber_relation(): void
    {
        // I1: saat hide_barber=true, respons TIDAK memuat relasi barber.
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $payload = $this->validPayload($barber, $service, $date, '10:00') + ['hide_barber' => true];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(201);

        $json = $response->json();
        $this->assertFalse(
            array_key_exists('barber', $json) && $json['barber'] !== null,
            'hide_barber=true: relasi barber harus disembunyikan.',
        );
    }

    #[Test]
    public function hide_barber_absent_or_false_includes_barber_relation(): void
    {
        // I1: default (tanpa hide_barber) tetap memuat relasi barber.
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $response = $this->postJson('/api/bookings', $this->validPayload($barber, $service, $date, '10:00'));

        $response->assertStatus(201);
        $response->assertJsonPath('barber.id', $barber->id);

        $json = $response->json();
        $this->assertArrayHasKey('barber', $json);
        $this->assertNotNull($json['barber']);
    }

    #[Test]
    public function hide_barber_false_includes_barber_relation(): void
    {
        $date = $this->testDate();
        $barber = $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $payload = $this->validPayload($barber, $service, $date, '10:00') + ['hide_barber' => false];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('barber.id', $barber->id);
    }
}
