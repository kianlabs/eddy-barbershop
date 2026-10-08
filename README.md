# Eddy Barbershop — Sistem Booking Barbershop

Aplikasi booking online untuk barbershop "Eddy Barbershop" (Kartasura,
Sukoharjo). Pelanggan memilih layanan, kapster, tanggal & jam, lalu booking
tanpa perlu login — identifikasi via nomor WhatsApp. Ada panel admin untuk
mengelola booking, layanan, dan kapster.

> Project portfolio (barbershop fiktif). Tema visual: hitam–emas, "Apple Glass".

## Stack

| Lapisan | Teknologi |
|---------|-----------|
| Backend | PHP 8.4+, **Laravel 13** |
| Database | **MySQL 8** (lihat catatan) |
| Frontend | Inertia.js + **React 19** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) |
| Build | Vite 8 |
| PWA | Service worker + manifest native (tanpa dependensi tambahan) |

## Prasyarat

- PHP 8.4+ dengan ekstensi `pdo_mysql`
- Composer
- Node.js 20+ dan npm
- MySQL 8 (di mesin dev ini berjalan sebagai container `mysql8` di
  `127.0.0.1:3306`)

## Setup

```bash
# 1. Dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate
#    Edit .env — minimal:
#      DB_CONNECTION=mysql
#      DB_HOST=127.0.0.1   DB_PORT=3306
#      DB_DATABASE=eddy_barber_booking
#      DB_USERNAME=eddy_barber   DB_PASSWORD=<password MySQL Anda>
#      ADMIN_EMAIL=admin@eddybarber.test   ADMIN_PASSWORD=<password admin>

# 3. Siapkan database MySQL (sekali saja)
mysql -u root -p -e "
  CREATE DATABASE IF NOT EXISTS eddy_barber_booking
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'eddy_barber'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON eddy_barber_booking.* TO 'eddy_barber'@'%';
  FLUSH PRIVILEGES;"

# 4. Migrasi + data demo (kapster, layanan, jadwal, akun admin)
php artisan migrate --seed

# 5. Build frontend & jalankan server
npm run build
php artisan serve --port=8099
#    Untuk development: jalankan `npm run dev` di terminal terpisah.
```

Buka **http://127.0.0.1:8099**

- Landing page: `/`
- Booking publik: `/booking`
- Login admin: `/login`

### 💡 Catatan database: MySQL, bukan SQLite

Aplikasi ini **memakai MySQL**. Jalur `DB_CONNECTION=sqlite` bawaan Laravel
tidak dipakai di proyek ini:

- File `database/database.sqlite` **tidak digunakan** — hanya sisa skeleton
  Laravel dan diabaikan oleh `.gitignore`. Jangan hapus/perlu diperhatikan.
- Konfigurasi runtime yang benar ada di `.env` (`DB_CONNECTION=mysql`).
- **Pengecualian:** saat menjalankan test, `phpunit.xml` menimpa koneksi ke
  SQLite in-memory (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`). Ini
  disengaja agar test cepat dan tidak menyentuh database dev.

## Akun Admin

Dibuat oleh `AdminSeeder` saat `php artisan migrate --seed`:

| | Default (dev) |
|---|---|
| Email | `admin@eddybarber.test` |
| Password | `password` |

**Ganti password ini di production.** Seeder bersifat idempotent (aman
dijalankan ulang). Bisa dijalankan terpisah:

```bash
php artisan db:seed --class=AdminSeeder
```

> Catatan: `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `.env.example` adalah jalur
> konfigurasi yang disarankan; `AdminSeeder` masih memakai nilai default yang
> di-hardcode. Untuk memakai env, seeder perlu diubah agar membacanya.

## Fitur

### Publik
- **Landing page** — daftar layanan + harga, kapster, jam operasional, galeri.
- **Booking 4 langkah** — pilih jam → layanan → kapster (atau "Pilih Acak")
  → data pelanggan → konfirmasi. Konfirmasi akhir mengirim pesan via tautan
  WhatsApp `wa.me` (klik-untuk-chat, tanpa server).
- **Anti double-booking** — `lockForUpdate` (transaksi) + unique constraint
  `(barber_id, date, start_time)`, serta validasi overlap durasi.
- **PWA** — dapat di-install ke home screen/desktop dan menampilkan halaman
  offline saat koneksi putus.

### Panel Admin (perlu login)
- **Dashboard** — statistik booking hari ini/total, jumlah kapster & layanan.
- **Kelola booking** — ubah status (pending / confirmed / done / cancelled).
- **Kelola layanan** — edit & aktif/nonaktifkan layanan.
- **Kelola kapster** — aktif/nonaktifkan kapster.

## API

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/api/services` | Daftar layanan aktif |
| GET | `/api/barbers` | Daftar kapster + jadwal |
| GET | `/api/available-slots?barber_id=&service_id=&date=` | Slot kosong (`all=1` untuk union semua kapster) |
| POST | `/api/bookings` | Buat booking (throttle `10,1`, validasi anti double-booking) |

## Testing

```bash
php artisan test        # atau: ./vendor/bin/phpunit
```

Test berjalan di SQLite in-memory (`phpunit.xml`) — tidak perlu MySQL untuk
menjalankan test. Cakupan saat ini: API booking, validasi overlap, union slot
(`AvailableSlotsUnionTest`), dan auth/admin (`AdminAuthTest`).

## PWA (Progressive Web App)

Aplikasi bisa di-install ke home screen / desktop dan tetap menampilkan halaman
offline saat koneksi putus. Tidak ada dependensi baru — memakai API browser native.

**File terkait**

| File | Fungsi |
|------|--------|
| `public/manifest.webmanifest` | Metadata PWA (nama, warna, ikon, `display: standalone`) |
| `public/sw.js` | Service worker (strategi cache) |
| `public/icon.svg` | Ikon aplikasi (SVG, `any` + `maskable`) |
| `public/offline.html` | Shell fallback saat navigasi gagal & tidak ada cache |

**Strategi cache di `sw.js`**

- **Cache-first** — aset statis hasil build Vite (`/build/*`), ikon, manifest.
- **Network-first** — navigasi dokumen Inertia; fallback ke salinan terakhir, lalu `/offline.html`.
- **Bypass** — semua request non-GET (POST booking) dan `/api/*` selalu langsung ke jaringan.
- Cache diberi versi (`eddy-pre-<v>`, `eddy-runtime-<v>`); `activate` menghapus cache versi lama.
  Saat mengubah strategi, naikkan `CACHE_VERSION` di `public/sw.js`.

**Cara menguji**

```bash
npm run build
php artisan serve --port=8099
```

Buka `http://127.0.0.1:8099`, lalu:

- Chrome/Edge DevTools → **Application → Manifest** (cek ikon & warna) dan **Service Workers**.
- **Lighthouse → Progressive Web App** untuk audit installability.
- Uji offline: DevTools → Network → centang *Offline*, lalu reload → muncul halaman offline.
- Install: ikon install di address bar (desktop) atau *Add to Home Screen* (mobile).

**Catatan penting**

- Service worker **hanya didaftarkan di environment production** (`@production` di
  `resources/views/app.blade.php`). Di `npm run dev` (HMR) SW tidak aktif agar kode
  `@vite`/`/@vite/*` tidak ter-cache dan hot reload tetap bersih.
- Setelah update produksi, pengguna kadang perlu 1× reload agar SW baru aktif
  (`skipWaiting()` + `clients.claim()` sudah dipakai untuk mempersingkat ini).
- Di iOS, `apple-touch-icon` menunjuk SVG; bila ingin ikon raster untuk iOS lama,
  tambahkan PNG 180×180 dan daftarkan di manifest + `<link rel="apple-touch-icon">`.

## Struktur Singkat

```
app/Http/Controllers/Api/     # API booking publik
app/Http/Controllers/Admin/   # Panel admin (dashboard, booking, layanan, kapster)
app/Http/Controllers/Auth/    # Login/logout sesi
resources/js/Pages/           # Home, Booking, Admin/*, Auth/Login
routes/web.php                # Web + panel admin
routes/api.php                # Endpoint API
database/seeders/             # AdminSeeder + data demo
```

## Roadmap (belum dikerjakan)

1. Notifikasi WhatsApp H-1 otomatis via scheduler (kolom `bookings.whatsapp`
   & `status` sudah siap — tinggal gateway + `php artisan schedule`).
2. Notifikasi email booking baru (`BOOKING_NOTIFY_EMAIL` sudah disiapkan).
3. Upload foto kapster (kolom `barbers.photo` sudah ada).
4. Riwayat booking pelanggan (login via OTP WA).
5. Laporan omzet harian/mingguan.
6. Deploy (VPS) + tulis studi kasus portfolio.

## Lisensi

[MIT](LICENSE) © Eddy Barbershop
