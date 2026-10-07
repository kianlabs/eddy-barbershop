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
#    DB_DATABASE=eddy_barber_booking, DB_USERNAME=eddy_barber
#    DB_PASSWORD=<lihat ~/.eddy-barber-db-pw di PC ini>
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

## Next Steps
1. Halaman admin (kelola booking/kapster/layanan) + auth
2. Notifikasi WhatsApp H-1 via scheduler (kolom `whatsapp` sudah siap)
3. Upload foto kapster & galeri hasil potong
4. Deploy (Vercel/VPS) + tulis studi kasus di portfolio
