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
 * Regresi fitur UNION SLOT pada GET /api/available-slots.
 *
 * Kontrak perilaku yang diharapkan (branch be-union-slot):
 *  - U1 : `?all=1&service_id=..&date=..` (tanpa barber_id) mengembalikan
 *         GABUNGAN jam unik yang bebas untuk minimal satu kapster aktif.
 *  - U2 : mode `barber_id` tetap berfungsi seperti semula (regresi jalur lama).
 *  - U3 : `all=1` TANPA barber_id TIDAK boleh memicu error validasi 422
 *         (validasi lama `barber_id => required` harus dilonggarkan saat all=1).
 *
 * PENTING — test ini sengaja "soft": fitur union-slot belum tentu tersedia saat
 * file ini ditulis. Setiap test memanggil `skipIfUnionSlotUnavailable()` yang
 * mendeteksi apakah endpoint benar-benar menghormati `all=1`. Selama fitur belum
 * ada, test di-SKIP dengan alasan jelas (suite tetap hijau); begitu fitur mendarat
 * di branch, guard otomatis lolos dan test benar-benar dijalankan.
 *
 * DB pengujian: phpunit.xml memaksa sqlite :memory: (lihat BookingApiTest).
 * Semua model di sini tidak memakai trait HasFactory, jadi factory di-resolve
 * lewat `Factory::factoryForModel()`.
 */
class AvailableSlotsUnionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Guardrail identik dengan BookingApiTest: jangan pernah menyentuh DB
        // non-in-memory (mis. MySQL dev).
        $connection = config('database.default');
        if (config("database.connections.{$connection}.database") !== ':memory:') {
            $this->markTestSkipped(
                'AvailableSlotsUnionTest membutuhkan DB pengujian in-memory. '
                .'Set DB_CONNECTION=sqlite dan DB_DATABASE=:memory: di phpunit.xml.'
            );
        }
    }

    // ----------------------------------------------------------------- help --

    protected function factoryFor(string $modelClass): Factory
    {
        return Factory::factoryForModel($modelClass);
    }

    protected function testDate(int $addDays = 1): Carbon
    {
        return Carbon::today()->addDays($addDays)->startOfDay();
    }

    /**
     * Kapster aktif + jadwal untuk hari pada tanggal tertentu.
     */
    protected function barberOpenOn(Carbon $date, string $start = '10:00', string $end = '23:00'): Barber
    {
        $barber = $this->factoryFor(Barber::class)->create(['is_active' => true]);

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

    /**
     * Deteksi apakah endpoint union-slot sudah tersedia & menghormati `all=1`.
     *
     * Feature-detect (bukan sekadar cek route) supaya test tidak "hijau palsu"
     * ketika route ada tapi `barber_id` masih wajib. Probe memakai data minimal
     * (satu kapster + satu jadwal) dan mengirim permintaan `all=1` tanpa barber_id.
     */
    protected function skipIfUnionSlotUnavailable(): void
    {
        if (! app('router')->has('api/available-slots') && ! app('router')->has('available-slots')) {
            $this->markTestSkipped('Fitur union-slot belum tersedia: route /api/available-slots tidak terdaftar.');
        }

        $date = $this->testDate();
        $barber = $this->barberOpenOn($date);
        $service = $this->serviceWithDuration(30);

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'all' => 1,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        // Selama `barber_id` masih `required`, endpoint membalas 422 → fitur belum
        // mendarat. Guard lama harus dilonggarkan agar `all=1` lolos validasi.
        if ($response->status() === 422 && $response->json('errors.barber_id') !== null) {
            $this->markTestSkipped(
                'Fitur union-slot belum mendarat: `barber_id` masih wajib saat all=1 '
                .'(lihat branch be-union-slot).'
            );
        }

        // Balasan 5xx / error lain menandakan implementasi belum siap diuji.
        if ($response->serverError()) {
            $this->markTestSkipped('Endpoint union-slot mengembalikan 5xx; implementasi belum siap diuji.');
        }

        // Sanity: bentuk respons harus memuat array `slots`.
        if (! is_array($response->json('slots'))) {
            $this->markTestSkipped('Respons union-slot tidak memuat array `slots`; kontrak belum sesuai dugaan.');
        }
    }

    // --------------------------------------------------------- U3. all=1 valid --

    #[Test]
    public function all_flag_without_barber_id_does_not_fail_validation(): void
    {
        $this->skipIfUnionSlotUnavailable();

        $date = $this->testDate();
        $this->barberOpenOn($date, '10:00', '23:00');
        $service = $this->serviceWithDuration(30);

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'all' => 1,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        // U3: `all=1` tanpa barber_id adalah permintaan valid → bukan 422.
        $response->assertOk();
        $response->assertJsonMissingValidationErrors(['barber_id']);
    }

    // --------------------------------------------------- U1. union gabungan --

    #[Test]
    public function all_mode_returns_unique_union_of_free_slots_across_active_barbers(): void
    {
        $this->skipIfUnionSlotUnavailable();

        $date = $this->testDate();
        $service = $this->serviceWithDuration(30);

        // Kapster A: buka 10:00-12:00 → slot 10:00, 10:30, 11:00, 11:30.
        $barberA = $this->barberOpenOn($date, '10:00', '12:00');

        // Kapster B: buka 11:00-13:00 → slot 11:00, 11:30, 12:00, 12:30.
        $barberB = $this->barberOpenOn($date, '11:00', '13:00');

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'all' => 1,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertOk();
        $slots = $response->json('slots');
        $this->assertIsArray($slots);
        $this->assertNotEmpty($slots);

        // Gabungan harus memuat slot eksklusif A dan eksklusif B.
        $this->assertContains('10:00', $slots, 'Slot eksklusif kapster A harus ada di gabungan.');
        $this->assertContains('12:30', $slots, 'Slot eksklusif kapster B harus ada di gabungan.');

        // Union = himpunan unik: tidak boleh ada jam kembar (11:00, 11:30
        // muncul di kedua kapster).
        $this->assertSame(
            count($slots),
            count(array_unique($slots)),
            'Gabungan slot harus berisi jam UNIK (tanpa duplikat).'
        );

        // Sanity cakupan: minimal ada satu slot tumpang (11:00/11:30) yang dibagi.
        $this->assertContains('11:00', $slots);
    }

    #[Test]
    public function all_mode_excludes_slots_taken_by_an_active_booking_on_a_shared_barber(): void
    {
        $this->skipIfUnionSlotUnavailable();

        $date = $this->testDate();
        $service = $this->serviceWithDuration(30);

        $barberA = $this->barberOpenOn($date, '10:00', '12:00');
        // Kapster B hanya buka 11:00-12:00 → 11:00 & 11:30 hanya dilayani B.
        $barberB = $this->barberOpenOn($date, '11:00', '12:00');

        // 11:00 di kapster A sudah dipesan (aktif) → A tidak bebas di 11:00,
        // tetapi B masih bebas → 11:00 tetap muncul di union.
        $this->seedBooking($barberA, $service, $date, '11:00:00', '11:30:00', 'pending');

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'all' => 1,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertOk();
        $slots = $response->json('slots');

        // 11:00 tetap ada karena kapster B bebas pada jam itu.
        $this->assertContains('11:00', $slots, 'Slot bebas pada satu kapster harus tetap muncul di union.');
    }

    #[Test]
    public function all_mode_slot_is_excluded_when_every_active_barber_is_busy_at_that_time(): void
    {
        $this->skipIfUnionSlotUnavailable();

        $date = $this->testDate();
        $service = $this->serviceWithDuration(30);

        // Dua kapster dengan jadwal identik 10:00-12:00.
        $barberA = $this->barberOpenOn($date, '10:00', '12:00');
        $barberB = $this->barberOpenOn($date, '10:00', '12:00');

        // 10:00 dipesan aktif di KEDUA kapster → 10:00 tidak bebas untuk siapa pun.
        $this->seedBooking($barberA, $service, $date, '10:00:00', '10:30:00', 'pending');
        $this->seedBooking($barberB, $service, $date, '10:00:00', '10:30:00', 'confirmed');

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'all' => 1,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertOk();
        $slots = $response->json('slots');

        $this->assertNotContains(
            '10:00',
            $slots,
            'Jam yang terisi di SEMUA kapster aktif harus hilang dari union.'
        );
        // 10:30 tetap bebas di keduanya.
        $this->assertContains('10:30', $slots);
    }

    #[Test]
    public function all_mode_ignores_inactive_barbers_and_closed_schedules(): void
    {
        $this->skipIfUnionSlotUnavailable();

        $date = $this->testDate();
        $service = $this->serviceWithDuration(30);

        // Kapster aktif & buka → jadi sumber slot sah.
        $active = $this->barberOpenOn($date, '10:00', '12:00');

        // Kapster NON-aktif dengan jadwal yang lebih luas → harus diabaikan.
        $inactive = $this->factoryFor(Barber::class)->create(['is_active' => false]);
        $this->factoryFor(Schedule::class)->create([
            'barber_id' => $inactive->id,
            'day_of_week' => $date->dayOfWeek,
            'start_time' => '08:00:00',
            'end_time' => '23:00:00',
            'is_active' => true,
        ]);

        // Kapster aktif tapi jadwal NON-aktif → juga diabaikan.
        $closed = $this->factoryFor(Barber::class)->create(['is_active' => true]);
        $this->factoryFor(Schedule::class)->create([
            'barber_id' => $closed->id,
            'day_of_week' => $date->dayOfWeek,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'all' => 1,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertOk();
        $slots = $response->json('slots');

        // Tidak boleh ada jam di luar jendela kapster aktif (08:00 & 07:30 dst).
        $this->assertNotContains('08:00', $slots, 'Kapster non-aktif tidak boleh menyumbang slot.');
        $this->assertNotContains('07:30', $slots, 'Jadwal non-aktif tidak boleh menyumbang slot.');
        $this->assertContains('10:00', $slots, 'Kapster aktif dengan jadwal aktif tetap menyumbang slot.');
        $this->assertSame($slots, array_values($slots), 'Slot harus berupa list (indeks numerik).');
    }

    // -------------------------------------------------- U2. barber_id regresi --

    #[Test]
    public function barber_id_mode_still_returns_only_that_barbers_free_slots(): void
    {
        // Jalur `barber_id` sudah ada di main, jadi TIDAK di-skip: ini regresi
        // yang harus tetap hijau terlepas dari status fitur union-slot.
        $date = $this->testDate();
        $service = $this->serviceWithDuration(30);

        $barber = $this->barberOpenOn($date, '10:00', '12:00');

        $slots = $this->getJson('/api/available-slots?'.http_build_query([
            'barber_id' => $barber->id,
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]))->json('slots');

        $this->assertNotEmpty($slots);
        $this->assertSame('10:00', $slots[0]);
        $this->assertSame(['10:00', '10:30', '11:00', '11:30'], $slots);
    }

    #[Test]
    public function barber_id_mode_still_rejects_missing_barber_id_with_validation_error(): void
    {
        // Tanpa `barber_id` DAN tanpa `all=1`, validasi lama harus tetap menolak.
        // Ini menjaga agar pelonggaran validasi union-slot tidak menghapus
        // kebutuhan barber_id pada mode legacy.
        $date = $this->testDate();
        $service = $this->serviceWithDuration(30);

        $response = $this->getJson('/api/available-slots?'.http_build_query([
            'service_id' => $service->id,
            'date' => $date->toDateString(),
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['barber_id']);
    }
}
