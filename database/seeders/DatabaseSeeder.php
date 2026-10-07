<?php

namespace Database\Seeders;

use App\Models\Barber;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $barbers = [
            ["name" => "Raka Pratama", "specialty" => "Fade & Undercut"],
            ["name" => "Dimas Saputra", "specialty" => "Classic Cut & Shave"],
            ["name" => "Bagas Wijaya", "specialty" => "Coloring & Styling"],
        ];

        foreach ($barbers as $data) {
            $barber = Barber::create($data + ["is_active" => true]);

            // Senin(1) - Sabtu(6): 09:00 - 21:00, Minggu tutup
            foreach (range(1, 6) as $day) {
                Schedule::create([
                    "barber_id" => $barber->id,
                    "day_of_week" => $day,
                    "start_time" => "09:00:00",
                    "end_time" => "21:00:00",
                    "is_active" => true,
                ]);
            }
        }

        $services = [
            ["name" => "Potong Rambut", "description" => "Cuci + potong + styling", "duration_minutes" => 30, "price" => 35000],
            ["name" => "Cukur Brewok", "description" => "Shaving + hot towel", "duration_minutes" => 20, "price" => 25000],
            ["name" => "Coloring", "description" => "Semir + toning", "duration_minutes" => 90, "price" => 150000],
            ["name" => "Paket Komplit", "description" => "Potong + cukur + creambath + pijat", "duration_minutes" => 90, "price" => 100000],
        ];

        foreach ($services as $data) {
            Service::create($data + ["is_active" => true]);
        }

        User::create([
            "name" => "Demo Pelanggan",
            "email" => "demo@fadeco.test",
            "whatsapp" => "6281234567890",
        ]);
    }
}
