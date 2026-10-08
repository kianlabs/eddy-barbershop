<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Membuat satu akun admin panel.
 *
 * Idempotent: aman dijalankan berkali-kali. Memakai updateOrCreate pada email
 * admin sehingga password & flag is_admin selalu dipastikan benar tanpa
 * menduplikasi baris, dan tanpa menyentuh user lain (pelanggan/seed lama).
 *
 * Kredensial TIDAK lagi hardcoded. Aturan:
 *  - Email diambil dari ADMIN_EMAIL (fallback aman: admin@eddybarber.test).
 *  - Password diambil dari ADMIN_PASSWORD. Jika kosong:
 *      * di environment `production` -> seed DITOLAK (tidak ada akun dibuat),
 *        supaya tidak pernah ada admin ber-password lemah di produksi.
 *      * di luar produksi -> password acak di-generate dan DITAMPILKAN SEKALI
 *        lewat output command agar developer bisa login; tidak ada default
 *        "password" yang bocor ke repository.
 */
class AdminSeeder extends Seeder
{
    /** Email admin cadangan bila ADMIN_EMAIL tidak diisi di .env. */
    public const DEFAULT_EMAIL = "admin@eddybarber.test";

    public const WHATSAPP = "6281234567891";

    public function run(): void
    {
        $email = (string) (env("ADMIN_EMAIL") ?: self::DEFAULT_EMAIL);
        $password = (string) env("ADMIN_PASSWORD", "");

        if ($password === "") {
            if (app()->environment("production")) {
                $this->command?->error(
                    "AdminSeeder dilewati: ADMIN_PASSWORD kosong di environment produksi. "
                    ."Set ADMIN_PASSWORD (dan ADMIN_EMAIL) yang kuat, lalu jalankan ulang seeder."
                );

                return;
            }

            // Non-produksi: generate password acak & tampilkan sekali saja.
            $password = Str::password(16);

            $this->command?->warn("ADMIN_PASSWORD tidak diset — password admin digenerate acak.");
            $this->command?->line("  email    : {$email}");
            $this->command?->line("  password : {$password}");
            $this->command?->line("Catat sekarang: password ini tidak disimpan dalam bentuk plaintext.");
        }

        User::updateOrCreate(
            ["email" => $email],
            [
                "name" => "Admin Eddy Barbershop",
                "password" => Hash::make($password),
                "whatsapp" => self::WHATSAPP,
                "is_admin" => true,
            ]
        );
    }
}
