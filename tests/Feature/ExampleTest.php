<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Smoke test halaman beranda.
 *
 * Halaman `/` melakukan query ke tabel `services` dan `barbers` (lihat
 * routes/web.php). Karena suite berjalan di atas SQLite `:memory:`, migrasi
 * harus dijalankan lebih dulu — itulah alasan `RefreshDatabase` dipakai.
 * Sebelumnya test ini 500 ("no such table: services") karena tidak ada migrasi.
 */
class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * GET / harus merender halaman beranda dengan status 200.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
