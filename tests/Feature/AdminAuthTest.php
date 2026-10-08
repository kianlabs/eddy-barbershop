<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Regresi otorisasi panel admin (branch auth-admin-panel).
 *
 * Kontrak perilaku yang diharapkan:
 *  - A1 : tamu (belum login) yang membuka /admin diredirect ke /login.
 *  - A2 : user login NON-admin ditolak (403 atau redirect), tidak boleh masuk.
 *  - A3 : user admin bisa mengakses /admin (200).
 *
 * PENTING — test ini sengaja "soft": pada saat file ini ditulis, route /admin
 * dan konsep "admin" (kolom/role) BELUM ada di branch manapun (diverifikasi:
 * routes/web.php hanya punya `/`, `/booking`; migrasi users tidak punya kolom
 * is_admin/role). Seluruh test di bawah di-gate oleh `skipIfAdminPanelUnavailable()`
 * sehingga di-SKIP dengan alasan jelas — suite tetap hijau — dan otomatis aktif
 * begitu panel admin mendarat.
 *
 * Catatan: cara menandai user sebagai admin berbeda-beda antar implementasi
 * (kolom `is_admin`, kolom `role`, tabel pivot, atau Gate). Alih-alih menebak,
 * `markAdmin()` mendeteksi atribut yang benar-benar ada pada model/skema dan
 * SKIP bila tidak ada cara yang dikenali.
 */
class AdminAuthTest extends TestCase
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
                'AdminAuthTest membutuhkan DB pengujian in-memory. '
                .'Set DB_CONNECTION=sqlite dan DB_DATABASE=:memory: di phpunit.xml.'
            );
        }
    }

    // ----------------------------------------------------------------- help --

    /**
     * Apakah route panel admin sudah terdaftar?
     *
     * Dianggap ada bila salah satu dari route umum berikut terdaftar. Nama
     * pastinya bisa berbeda; bila implementasi memakai URI lain, test akan
     * di-skip (aman) — bukan gagal merah.
     */
    protected function adminRouteRegistered(): bool
    {
        foreach (['admin', 'admin.dashboard', 'admin/dashboard'] as $name) {
            if (app('router')->has($name)) {
                return true;
            }
        }

        foreach (app('router')->getRoutes() as $route) {
            $uri = trim($route->uri(), '/');
            if ($uri === 'admin' || str_starts_with($uri, 'admin/')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Skip dengan alasan jelas bila panel admin belum tersedia.
     */
    protected function skipIfAdminPanelUnavailable(): void
    {
        if (! $this->adminRouteRegistered()) {
            $this->markTestSkipped(
                'Panel admin belum tersedia: route /admin tidak terdaftar '
                .'(lihat branch auth-admin-panel).'
            );
        }

        if (! $this->userModelSupportsAdminFlag()) {
            $this->markTestSkipped(
                'Panel admin terdeteksi, tetapi penanda admin pada model User tidak dikenali '
                .'(tidak ada kolom/atribut is_admin, role, atau isAdmin()).'
            );
        }
    }

    /**
     * Apakah kita bisa menandai seorang User sebagai admin?
     */
    protected function userModelSupportsAdminFlag(): bool
    {
        $user = new User();
        $table = $user->getTable();

        foreach (['is_admin', 'role', 'is_super_admin', 'admin'] as $column) {
            if (
                \Illuminate\Support\Facades\Schema::hasColumn($table, $column)
                || array_key_exists($column, $user->getAttributes())
            ) {
                return true;
            }
        }

        return method_exists($user, 'isAdmin');
    }

    /**
     * Buat user admin sesuai mekanisme yang tersedia.
     */
    protected function makeAdmin(): User
    {
        $attributes = [];

        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'is_admin')) {
            $attributes['is_admin'] = true;
        } elseif (\Illuminate\Support\Facades\Schema::hasColumn('users', 'role')) {
            $attributes['role'] = 'admin';
        } elseif (\Illuminate\Support\Facades\Schema::hasColumn('users', 'is_super_admin')) {
            $attributes['is_super_admin'] = true;
        } elseif (\Illuminate\Support\Facades\Schema::hasColumn('users', 'admin')) {
            $attributes['admin'] = true;
        }

        return User::factory()->create($attributes);
    }

    /**
     * Buat user non-admin biasa.
     */
    protected function makeNonAdmin(): User
    {
        return User::factory()->create();
    }

    // ------------------------------------------------------------- A1. tamu --

    #[Test]
    public function guest_is_redirected_to_login_when_opening_admin(): void
    {
        $this->skipIfAdminPanelUnavailable();

        $response = $this->get('/admin');

        $response->assertRedirect('/login');
    }

    // -------------------------------------------------------- A2. non-admin --

    #[Test]
    public function non_admin_user_is_denied_access_to_admin(): void
    {
        $this->skipIfAdminPanelUnavailable();

        $user = $this->makeNonAdmin();

        $response = $this->actingAs($user)->get('/admin');

        // Implementasi boleh 403 langsung atau redirect (mis. ke /login atau /).
        $this->assertTrue(
            $response->isForbidden() || $response->isRedirect(),
            'User non-admin harus ditolak (403) atau diredirect, bukan mendapat 200.'
        );
        $this->assertNotSame(200, $response->getStatusCode(), 'User non-admin tidak boleh mendapat 200 di /admin.');
    }

    #[Test]
    public function non_admin_user_cannot_reach_admin_dashboard_route_name(): void
    {
        $this->skipIfAdminPanelUnavailable();

        if (! app('router')->has('admin.dashboard') && ! app('router')->has('admin')) {
            $this->markTestSkipped('Tidak ada nama route admin yang dikenali untuk diuji.');
        }

        $user = $this->makeNonAdmin();

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $this->assertTrue(
            $response->isForbidden() || $response->isRedirect(),
            'User non-admin harus ditolak saat mengakses dashboard admin.'
        );
    }

    // ------------------------------------------------------------ A3. admin --

    #[Test]
    public function admin_user_can_access_admin_panel(): void
    {
        $this->skipIfAdminPanelUnavailable();

        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertOk();
    }

    #[Test]
    public function guest_redirected_to_login_is_not_the_non_admin_denial_path(): void
    {
        $this->skipIfAdminPanelUnavailable();

        // Tamu: harus ke /login (autentikasi), bukan 403 (otorisasi).
        $guest = $this->get('/admin');
        $guest->assertRedirect('/login');

        // Non-admin: TIDAK boleh dapat 200.
        $nonAdmin = $this->actingAs($this->makeNonAdmin())->get('/admin');
        $this->assertNotSame(200, $nonAdmin->getStatusCode());
    }
}
