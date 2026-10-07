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
            ["name" => "Mas Eddy", "specialty" => "Master Barber - Classic Pompadour, Executive Taper"],
            ["name" => "Bima", "specialty" => "Senior Fade Specialist - Skin Fade, Modern Crop"],
            ["name" => "Kang Agus", "specialty" => "Pakar Klasik & Anak - Scissor Cut, Kids Haircut"],
        ];

        foreach ($barbers as $data) {
            $barber = Barber::create($data + ["is_active" => true]);

            // Buka setiap hari (0=Minggu..6=Sabtu): 10:00 - 23:00
            foreach (range(0, 6) as $day) {
                Schedule::create([
                    "barber_id" => $barber->id,
                    "day_of_week" => $day,
                    "start_time" => "10:00:00",
                    "end_time" => "23:00:00",
                    "is_active" => true,
                ]);
            }
        }

        // Daftar harga asli Eddy Barbershop.
        // price_max diisi hanya untuk layanan ber-range (harga tergantung panjang rambut).
        $services = [
            ["name" => "Potong Rambut", "description" => "Cukur rapi presisi sesuai gaya dan bentuk wajah", "duration_minutes" => 30, "price" => 25000, "price_max" => null],
            ["name" => "Potong + Cuci + Pijat + Vit", "description" => "Paket lengkap: potong, keramas, pijat relaksasi, vitamin rambut", "duration_minutes" => 45, "price" => 30000, "price_max" => null],
            ["name" => "Botak & Kerok", "description" => "Cukur plontos licin bersih dengan silet steril baru", "duration_minutes" => 30, "price" => 30000, "price_max" => null],
            ["name" => "Semir Rambut", "description" => "Pewarnaan rambut rata alami dengan cat berkualitas", "duration_minutes" => 60, "price" => 35000, "price_max" => 150000],
            ["name" => "High Light", "description" => "Aksen helai warna rambut stylish berdimensi modern", "duration_minutes" => 40, "price" => 45000, "price_max" => null],
            ["name" => "Bleaching Full", "description" => "Pemutihan pigmen rambut menyeluruh sebelum pewarnaan", "duration_minutes" => 50, "price" => 50000, "price_max" => null],
            ["name" => "Toning", "description" => "Menetralkan rona kuning dan menyelaraskan kilau warna", "duration_minutes" => 35, "price" => 40000, "price_max" => null],
            ["name" => "Pelurus Rambut", "description" => "Smoothing dan pelurusan rambut rapi mudah diatur", "duration_minutes" => 45, "price" => 45000, "price_max" => null],
            ["name" => "Perming Keriting", "description" => "Pengeritingan gaya Korean wave, textured, atau curly bervolume", "duration_minutes" => 90, "price" => 120000, "price_max" => 150000],
            ["name" => "Keramas & Pijat", "description" => "Cuci rambut segar plus pijat kulit kepala rileks", "duration_minutes" => 15, "price" => 10000, "price_max" => null],
            ["name" => "Kerok Jenggot", "description" => "Perapihan kumis dan jenggot presisi dengan aftershave segar", "duration_minutes" => 15, "price" => 10000, "price_max" => null],
            ["name" => "Hair Tattoo", "description" => "Ukiran garis artistik, stripe, dan motif pola presisi", "duration_minutes" => 30, "price" => 20000, "price_max" => 50000],
            ["name" => "Creambath", "description" => "Perawatan nutrisi rambut dan pijat relaksasi leher", "duration_minutes" => 45, "price" => 50000, "price_max" => null],
        ];

        foreach ($services as $data) {
            Service::create($data + ["is_active" => true]);
        }

        User::create([
            "name" => "Demo Pelanggan",
            "email" => "demo@eddybarber.test",
            "whatsapp" => "6281234567890",
        ]);
    }
}
