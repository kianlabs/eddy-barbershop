<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Membuat satu akun admin panel.
 *
 * Idempotent: aman dijalankan berkali-kali. Memakai updateOrCreate pada email
 * admin sehingga password & flag is_admin selalu dipastikan benar tanpa
 * menduplikasi baris, dan tanpa menyentuh user lain (pelanggan/seed lama).
 */
class AdminSeeder extends Seeder
{
    public const EMAIL = "admin@eddybarber.test";

    public const WHATSAPP = "6281234567891";

    public function run(): void
    {
        User::updateOrCreate(
            ["email" => self::EMAIL],
            [
                "name" => "Admin Eddy Barbershop",
                "password" => Hash::make("password"),
                "whatsapp" => self::WHATSAPP,
                "is_admin" => true,
            ]
        );
    }
}
