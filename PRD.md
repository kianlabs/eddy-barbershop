# PRD — Eddy Barbershop Booking

> Project portfolio (fiktif): sistem booking online barbershop.
> Stack: Laravel 13 + MySQL + Inertia + React. Tema: hitam–emas.

## Ringkasan
Pelanggan bisa booking jadwal potong rambut secara online: pilih layanan →
pilih kapster → pilih tanggal & jam → isi nama/no WA → konfirmasi.
Sistem mencegah double-booking di level aplikasi (transaction + lock)
maupun database (unique constraint).

## Fitur MVP (sudah di-scaffold)
- [x] Landing page publik (layanan, kapster, jam operasional)
- [x] Alur booking 4 langkah (Inertia + React)
- [x] API: `GET /api/services`, `GET /api/barbers`,
      `GET /api/available-slots`, `POST /api/bookings`
- [x] Slot dihitung dari jadwal kapster dikurangi booking aktif
- [x] Cegah double-booking: `lockForUpdate` + unique(barber_id, date, start_time)
- [x] Seeder demo: 3 kapster, 4 layanan, jadwal Senin–Sabtu 09.00–21.00

## Next (belum dikerjakan)
- [ ] Notifikasi WA H-1 (kolom `bookings.whatsapp` + `status` sudah siap;
      tinggal integrasi Baileys / API WA + scheduler `php artisan schedule`)
- [ ] Halaman admin: kelola booking (konfirmasi/selesai/batal), kapster, layanan
- [ ] Auth admin (Laravel Breeze / Fortify)
- [ ] Upload foto kapster (kolom `barbers.photo` sudah ada)
- [ ] Riwayat booking pelanggan (login via OTP WA)
- [ ] Laporan omzet harian/mingguan

## Skema Tabel
```
users      id, name, email (unique), whatsapp (nullable), password (nullable), timestamps
barbers    id, name, photo (nullable), specialty (nullable), is_active, timestamps
services   id, name, description, duration_minutes, price (IDR), is_active, timestamps
schedules  id, barber_id FK, day_of_week (0=Min..6=Sab), start_time, end_time,
           is_active, timestamps — unique(barber_id, day_of_week)
bookings   id, user_id FK, barber_id FK, service_id FK, date, start_time, end_time,
           status (pending|confirmed|done|cancelled), whatsapp, notes,
           timestamps — unique(barber_id, date, start_time)
```

## Catatan Teknis
- Slot tersedia = irisan jam kerja kapster & durasi layanan, minus booking
  berstatus `pending`/`confirmed`. Booking `cancelled`/`done` membebaskan slot.
- Pelanggan diidentifikasi via no WA (`firstOrCreate`); email diisi placeholder
  `wa<nomor>@eddybarber.local` karena kolom email NOT NULL + unique.
