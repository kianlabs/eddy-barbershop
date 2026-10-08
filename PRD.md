# PRD — Eddy Barbershop Booking

> Project portfolio (fiktif): sistem booking online barbershop.
> Stack: Laravel 13 + MySQL + Inertia + React. Tema: hitam–emas.

## Ringkasan
Pelanggan bisa booking jadwal potong rambut secara online: pilih tanggal & jam
→ pilih layanan → pilih kapster (atau "Pilih Acak") → isi nama/no WA →
konfirmasi (kirim pesan via tautan WhatsApp). Sistem mencegah double-booking di
level aplikasi (transaction + lock) maupun database (unique constraint). Panel
admin untuk mengelola booking, layanan, dan kapster tersedia di balik login.

## Fitur (sudah dikerjakan)
- [x] Landing page publik (layanan + harga, kapster, jam operasional, galeri)
- [x] Alur booking 4 langkah (Inertia + React), konfirmasi via tautan `wa.me`
- [x] API: `GET /api/services`, `GET /api/barbers`,
      `GET /api/available-slots` (`all=1` untuk union semua kapster),
      `POST /api/bookings` (throttle 10/menit)
- [x] Slot dihitung dari jadwal kapster dikurangi booking aktif
- [x] Cegah double-booking: `lockForUpdate` (transaksi) +
      unique(barber_id, date, start_time), plus validasi overlap durasi
- [x] Panel admin (login sesi + flag `is_admin`): dashboard, kelola booking
      (ubah status), kelola layanan (edit + aktif/nonaktif), kelola kapster
      (aktif/nonaktif) — route `/admin/*` di balik middleware `auth` + `admin`
- [x] Auth admin: login/logout sesi (throttle 10/menit), tanpa Breeze/Fortify
- [x] PWA: manifest + service worker + halaman offline
- [x] Seeder: 3 kapster, 13 layanan (harga asli Eddy Barbershop), jadwal
      setiap hari 10.00–23.00, akun admin + 1 pelanggan demo

## Next (belum dikerjakan)
- [ ] Notifikasi WA H-1 otomatis (kolom `bookings.whatsapp` + `status` sudah
      siap; tinggal integrasi gateway Baileys / API WA + scheduler
      `php artisan schedule`)
- [ ] Notifikasi email booking baru (`BOOKING_NOTIFY_EMAIL` sudah disiapkan)
- [ ] Upload foto kapster (kolom `barbers.photo` sudah ada)
- [ ] Riwayat booking pelanggan (login via OTP WA)
- [ ] Laporan omzet harian/mingguan

## Skema Tabel
```
users      id, name, email (unique), whatsapp (unique, nullable),
           password (nullable), is_admin (bool), timestamps
barbers    id, name, photo (nullable), specialty (nullable), is_active, timestamps
services   id, name, description, duration_minutes, price (IDR),
           price_max (nullable, untuk layanan ber-range), is_active, timestamps
schedules  id, barber_id FK, day_of_week (0=Min..6=Sab), start_time, end_time,
           is_active, timestamps — unique(barber_id, day_of_week)
bookings   id, user_id FK, barber_id FK, service_id FK, date, start_time, end_time,
           status (pending|confirmed|done|cancelled), whatsapp, notes,
           timestamps — unique(barber_id, date, start_time)
```

## Catatan Teknis
- Database: **MySQL 8** (`eddy_barber_booking`). Driver `sqlite` bawaan Laravel
  tidak dipakai di runtime; file `database/database.sqlite` hanya sisa skeleton.
  Test (`phpunit.xml`) memakai SQLite in-memory agar cepat.
- Slot tersedia = irisan jam kerja kapster & durasi layanan, minus booking
  berstatus `pending`/`confirmed`. Booking `cancelled`/`done` membebaskan slot.
- Pelanggan diidentifikasi via no WA (`firstOrCreate`); email diisi placeholder
  `wa<nomor>@eddybarber.local` karena kolom email NOT NULL + unique.
- Panel admin dilindungi middleware `auth` + `admin` (`is_admin`); non-admin
  mendapat 403, bukan redirect, agar keberadaan panel tidak bocor.
- Konfigurasi kredensial & DB ada di `.env` (lihat `.env.example`).
