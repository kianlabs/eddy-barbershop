# Eddy Barbershop — Sistem Booking Barbershop

Project portfolio: aplikasi booking online untuk barbershop fiktif
"Eddy Barbershop" (Kartasura, Sukoharjo). Dibangun dengan Laravel 13 + MySQL +
Inertia.js + React.

## Prasyarat
- PHP 8.4+ (dengan `pdo_mysql`), Composer, Node.js 20+
- MySQL 8 (di PC ini jalan sebagai container docker `mysql8` di 127.0.0.1:3306)

## Cara Menjalankan

```bash
# 1. Install dependencies
composer install
npm install

# 2. Konfigurasi database — salin .env.example lalu isi:
#    DB_CONNECTION=mysql, DB_HOST=127.0.0.1, DB_PORT=3306,
#    DB_DATABASE=fadeco_booking, DB_USERNAME=fadeco
#    DB_PASSWORD=<lihat ~/.fade-co-db-pw di PC ini>
cp .env.example .env
php artisan key:generate

# 3. Migrasi + data demo
php artisan migrate --seed

# 4. Build frontend & jalankan server
npm run build
php artisan serve --port=8099
# (untuk development: npm run dev di terminal terpisah)
```

Buka: http://127.0.0.1:8099 — landing di `/`, booking di `/booking`.

## Akun Demo
Seeder membuat 1 user demo (`demo@eddybarber.test`) + 3 kapster, 4 layanan,
dan jadwal kerja Senin–Sabtu 09.00–21.00. Booking baru bisa dibuat langsung
dari halaman `/booking` tanpa login (identifikasi via no. WhatsApp).

## API
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/services` | Daftar layanan aktif |
| GET | `/api/barbers` | Daftar kapster + jadwal |
| GET | `/api/available-slots?barber_id=&service_id=&date=` | Slot kosong |
| POST | `/api/bookings` | Buat booking (validasi anti double-booking) |

## Next Steps
1. Halaman admin (kelola booking/kapster/layanan) + auth
2. Notifikasi WhatsApp H-1 via scheduler (kolom `whatsapp` sudah siap)
3. Upload foto kapster & galeri hasil potong
4. Deploy (Vercel/VPS) + tulis studi kasus di portfolio
