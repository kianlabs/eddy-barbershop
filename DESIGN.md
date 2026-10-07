# DESIGN.md — Eddy Barbershop

> Sistem desain untuk website booking Eddy Barbershop, Makamhaji, Kartasura,
> Sukoharjo.
> Tema: **APPLE GLASS × LIGHT LUXURY** (varian keputusan final user).
> Sumber kebenaran: desain Stitch (Google Stitch), project
> `stitch.withgoogle.com/projects/3827443316114350740`.
> Ditulis ulang: 7 Oktober 2026.

---

## 0. Referensi Brand

- **Wordmark**: "EDDY BARBERSHOP" — Bebas Neue, uppercase, letter-spacing lebar
- Sub-label brand: "MAKAMHAJI, SUKOHARJO"
- Motto: **"Duduk Anteng, Pulang Ganteng"**
- Alamat: Jl. A. Yani No.402, Makamhaji, Kec. Kartasura, Sukoharjo 57161
- Jam buka: **setiap hari 10.00–23.00 WIB**
- Patokan: ±150m timur Tugu Kartasura, seberang warung soto
- Pembayaran: Cash / tunai + QRIS semua bank

---

## 1. Filosofi Desain

**"Apple Glass"** — antarmuka ala iOS modern: bersih, terang, dengan
permukaan kaca buram (frosted glass) yang memberi kedalaman. Premium tapi
ramah, terasa seperti aplikasi native di iPhone.

Kesan yang dituju: **lembut, presisi, hangat, premium.** Bukan korporat dingin,
bukan juga gelap-mewah. Putih dan abu terang mendominasi; emas `#c9a227` hanya
sebagai titik fokus.

### Prinsip utama
- **Permukaan kaca berlapis.** Kartu putih semi-transparan di atas latar terang
  ber-gradient halus, dengan `backdrop-blur` — inilah identitas visualnya.
- **Sudut sangat membulat.** Radius 16–24px (squircle iOS). Nyaris tidak ada
  sudut tajam.
- **Satu aksen emas.** `#c9a227` hanya untuk CTA, harga, status aktif, dan
  detail kecil (dot). Tidak boleh membanjiri layar.
- **Tipografi dua nada.** Bebas Neue (display besar, uppercase) + Plus Jakarta
  Sans (body & label).
- **Satu CTA utama per layar.** Tombol hitam pekat, teks putih, ikon emas.
- **Mobile-first.** Form factor iPhone (max-width ±420px untuk alur booking),
  melar ke ±720px di desktop.

### Yang DILARANG (anti AI-slop)
- ❌ Gradien ungu-biru / spektrum warna mencolok
- ❌ Neumorphism, shadow tebal-hitam, border tebal norak
- ❌ Card grid cookie-cutter yang monoton tanpa hierarki
- ❌ Foto stock yang jelas "stock" (barber asing, bukan tempat asli)
- ❌ Campur palet lain (marun, krem pekat, dark mode) — KONSISTEN terang
- ❌ Ikon berwarna-warni; hanya Material Symbols monokrom + aksen emas

> **Catatan perubahan (7 Okt 2026):** Versi sebelumnya melarang glassmorphism
> dan hero centered. Larangan itu **dicabut** — desain Stitch final memang
> memakai frosted glass, ambient glow, dan hero centered. Anti-slop sekarang
> bertumpu pada *disiplin* memakai efek ini (halus, bukan berlebihan), bukan
> melarangnya.

---

## 2. Warna

Diekstrak dari konfigurasi Tailwind desain Stitch.

### Inti
| Nama | Hex | Fungsi |
|------|-----|--------|
| Gold (primary) | `#c9a227` | Aksen: CTA, harga, status, dot |
| Gold light | `#ecc246` | Ikon di atas latar gelap, highlight |
| Gold border | `rgba(201,162,39,0.25)` | Border kartu terpilih |
| Charcoal / Apple Dark | `#1d1d1f` / `#141416` | Teks utama, tombol utama |
| Apple Gray | `#86868b` | Teks sekunder |
| Apple Subtle | `#6e6e73` | Teks tersier |
| Background page | `#F8F9FB` / `#fbfbfd` | Latar halaman |
| Surface card | `rgba(255,255,255,0.72–0.85)` | Permukaan kaca |
| Hairline | `rgba(0,0,0,0.06)` | Divider 1px |
| Status confirmed | `#34c759` | Hijau status sukses |

### Aturan
Putih/abu terang selalu dominan. Emas **hanya** di titik fokus: CTA, harga,
status aktif, dan dot penanda. Maksimal 1–2 aksen emas terlihat per layar.

> ⚠️ **Catatan konsistensi:** Stitch memakai dua arah abu — `#f8fafc` kebiruan
> di beberapa layar dan `#F8F9FB` di layar lain. **Standarkan ke `#F8F9FB`**
> (netral, sedikit hangat) di semua halaman.

---

## 3. Tipografi

| Peran | Font | Gaya | Contoh |
|-------|------|------|--------|
| Display | **Bebas Neue** | Uppercase, besar (28–60px), `letter-spacing: 0.05em` | "EDDY BARBERSHOP", judul section |
| Heading | Plus Jakarta Sans | Semibold/Bold (15–16px) | Nama layanan, nama kapster |
| Body | Plus Jakarta Sans | Regular (12–13px), `#6e6e73` | Deskripsi, paragraf |
| Label | Plus Jakarta Sans | Uppercase, tracking lebar, 10–11px, abu | "LANGKAH 1 DARI 4", "PILIH JADWAL" |
| Harga | Bebas Neue | Bold (18–30px) | "Rp30.000" |

**Bahasa:** Indonesia informal-hangat. Motto: "Duduk Anteng, Pulang Ganteng."

> ⚠️ **Catatan konsistensi:** Beberapa layar Stitch menulis `fontFamily` body
> sebagai **Work Sans**, padahal font yang di-load dan dipakai aktual adalah
> **Plus Jakarta Sans**. **Pakai Plus Jakarta Sans** sebagai body — Work Sans
> hanya tombol (fallback) di beberapa snippet. Pilih satu: Plus Jakarta Sans.

---

## 4. Radius / Bayangan

Dari token Stitch:
- **Radius kartu**: 16px (`ios-inner`), 22–24px (`ios-card` / `rounded-2xl`),
  18px (`ios`), pill = 9999px.
- **Kartu terpilih**: border `1.5px #c9a227` + `shadow-gold`.
- **Bayangan kaca** (halus, jangan tebal):
  - `glass`: `0 8px 32px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.9)`
  - `glass-hover`: `0 14px 40px -10px rgba(0,0,0,0.08)`
  - `gold-glow`: `0 8px 24px -4px rgba(201,162,39,0.28)`
  - `float-bar`: `0 -10px 30px -5px rgba(0,0,0,0.06)`

---

## 5. Efek Kaca (Signature)

Ini inti identitas desain. Terapkan konsisten:

```css
/* Panel utama */
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(24px) saturate(190%);
border: 1px solid rgba(255, 255, 255, 0.85);
box-shadow: 0 8px 30px -4px rgba(20,20,25,0.04), 0 2px 6px rgba(0,0,0,0.02);

/* Kartu */
background: rgba(255, 255, 255, 0.80);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.90);

/* Bar melayang (bottom) */
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.70);
```

**Ambient glow** — orb kabur (blur-3xl) di latar untuk memberi "refraksi":
kuning/emas tipis + biru terang sangat pudar. **Halus saja** — opacity 10–40%,
jangan sampai menyita perhatian.

---

## 6. Layout

- **Mobile-first**, form factor iPhone (`max-width: 420px`) untuk alur booking.
- Konten maks `720px` di desktop, terpusat.
- Header sticky: kaca `bg-white/80 backdrop-blur-md` + hairline bawah.
- **Bottom floating bar** untuk CTA utama (selalu terlihat, iOS style).
- **Floating nav dock** 4 item di bawah: Layanan · Kapster · Jadwal · Konfirmasi.
- Whitespace lega; hindari kepadatan.

---

## 7. Komponen

### Button
- **Primary**: bg `#111111`/`#1c1c1e`, teks putih, radius 16px, tinggi 44–48px,
  ikon emas `#ecc246` opsional di kanan. `active:scale-[0.98]`.
- **Secondary (kaca)**: bg `white/80` + blur, border `black/[0.08]`,
  teks `#1c1c1e`.
- **Ghost / back**: bulat, `bg-black/[0.04]`.

### Input (kaca)
- Bg `rgba(255,255,255,0.65)` + blur 16px, border `1px rgba(0,0,0,0.06)`,
  radius 12px. Focus: bg lebih pekat + border emas + ring
  `rgba(201,162,39,0.15)`.

### Kartu Terpilih (radio service/kapster)
- Default: kaca, border `black/[0.06]`.
- Terpilih: bg kaca lebih pekat, border `1.5px #c9a227`, `shadow-gold`.
- Penanda centang: kotak membulat `#1d1d1f` dengan ikon check putih.

### Time Slot
- Tersedia: kaca, teks charcoal.
- **Terpilih**: bg `#141416`, teks putih, ring `#c9a227/30`.
- **Penuh**: `glass-card-disabled`, teks abu strikethrough, `cursor-not-allowed`.
- Dikelompokkan per sesi: **Pagi / Siang-Sore / Malam**.

### Date Selector
- Strip 7 hari, kartu squircle `rounded-2xl`.
- Hari aktif: bg `#141416` teks putih + dot emas.
- Hari lain: kaca.

### Progress (booking flow)
- Bar tipis 1.5px, track `black/[0.06]`, isi gradient
  `#111111 → #c9a227`. Label kiri "LANGKAH n DARI 4", kanan persentase.
- Wajib ada **nomor langkah teks**, bukan hanya lingkaran angka.

### Badge
- "Dipilih": pill `#1c1c1e` teks putih.
- "Best Choice": pill hitam teks putih.
- Spesialisasi: pill abu `neutral-100` teks `neutral-600`.
- Dot emas kecil sebagai penanda "aktif".

### Ikon
- **Material Symbols Outlined** (monokrom). `content_cut`, `arrow_back`,
  `arrow_forward`, `calendar_today`, `badge`, `spa`, `fact_check`,
  `location_on`, `schedule`, `verified`, `storefront`. Warna emas hanya bila
  di atas latar gelap.

---

## 8. Halaman & Alur

### Landing (`/`)
1. **Hero** — badge "Buka Hari Ini · 10.00–23.00" → wordmark Bebas Neue besar
   "EDDY BARBERSHOP & SHAVES" → sub "Duduk Anteng ◆ Pulang Ganteng" → tagline →
   CTA "Booking Sekarang".
2. **Facility Highlights** — 3 kartu kaca: 3 Kursi Nyaman · Free Es Teh · Fast WiFi.
3. **Layanan Unggulan** — daftar 13 layanan dalam kartu kaca ber-divider,
   harga Bebas Neue. Badge "Best Choice" di paket komplit.
4. **Kapster Bertalenta** — 3 kartu kaca: Mas Eddy, Bima, Kang Agus + jadwal.
5. **Lokasi & Kontak** — alamat, jam buka, pembayaran, tombol Google Maps.
6. **Testimoni** — kartu kaca, bintang emas, "4.9/5.0 (280+ ulasan)".
7. **Footer** — wordmark, motto, © 2025.
8. **Floating bottom bar** — quick action "Booking Kursi" + nav dock 4 item.

### Booking (4 langkah)
1. **Pilih Layanan** — list 13 layanan (kartu kaca, ikon jam, harga), bottom bar
   ringkasan total + "Lanjut Pilih Kapster".
2. **Pilih Kapster** — opsi "Pilih Acak" + 3 kapster. Kartu terpilih: border
   emas. Badge spesialisasi, "Kursi 01 • Siap Melayani". Bottom bar
   "Lanjut Pilih Jadwal".
3. **Pilih Jadwal** — info jam buka + strip 7 hari + grid slot per sesi
   (Pagi/Siang-Sore/Malam) + legend (Tersedia/Terpilih/Penuh). Bottom bar
   "Lanjut ke Konfirmasi".
4. **Konfirmasi** — kartu tiket (ringkasan: layanan, kapster, waktu, total
   "Bayar di kasir"), form data pemesan (nama, WA, catatan), info hadir 5-10
   menit lebih awal. Tombol utama: **"Konfirmasi via WhatsApp"** (ikon chat
   hijau `#34c759`).

### Admin (rencana)
- Status booking dengan dot: 🟡 menunggu, 🟢 dikonfirmasi, ✅ selesai, ⚪ batal.

---

## 9. Daftar Harga Asli

| Layanan | Harga | Durasi |
|---------|-------|--------|
| Potong + Cuci + Pijat + Vit | Rp30.000 | 45 mnt |
| Potong Rambut | Rp25.000 | 30 mnt |
| Botak & Kerok | Rp30.000 | 30 mnt |
| Semir Rambut | Rp35.000–150.000 | 45–60 mnt |
| High Light | Rp45.000 | 40 mnt |
| Bleaching Full | Rp50.000 | 50 mnt |
| Toning | Rp40.000 | 35 mnt |
| Pelurus Rambut | Rp45.000 | 45 mnt |
| Perming Keriting | Rp120.000–150.000 | 60–90 mnt |
| Keramas & Pijat | Rp10.000 | 15 mnt |
| Kerok Jenggot | Rp10.000 | 15 mnt |
| Hair Tattoo | Rp20.000–50.000 | 20–30 mnt |
| Creambath | Rp50.000 | 45 mnt |

> Beberapa harga bertanda range ("tergantung panjang rambut") — tampilkan
> sebagai teks, ukuran font sedikit lebih kecil.

---

## 10. Catatan Implementasi

- **Tailwind v4** (`@theme` di `resources/css/app.css`) — token warna, font,
  radius, shadow didefinisikan sebagai CSS variables.
- Font via Google Fonts: **Bebas Neue**, **Plus Jakarta Sans**,
  **Material Symbols Outlined**.
- Efek kaca butuh latar berisi sesuatu di belakangnya (ambient glow) agar
  terlihat; jangan taruh kartu kaca di atas latar rata polos.
- `backdrop-filter` disertai prefiks `-webkit-` untuk Safari.
- Hormati `prefers-reduced-motion` untuk animasi masuk.

---

## 11. Prompt untuk AI Design Tools

> "Design for 'Eddy Barbershop' (Makamhaji, Kartasura, Indonesia). **Apple Glass**
> light theme: near-white background `#F8F9FB` with soft ambient glow orbs, frosted
> glass cards (`rgba(255,255,255,0.72)` + `backdrop-filter: blur(24px)
> saturate(190%)`), very rounded corners (16–24px), subtle soft shadows. Single
> gold accent `#c9a227` (plus light gold `#ecc246` on dark). Charcoal `#1d1d1f`
> text, gray `#86868b` secondary. Typography: Bebas Neue for big uppercase
> headlines, Plus Jakarta Sans for body. Material Symbols Outlined icons
> (monochrome). Mobile-first (iPhone width), floating glass bottom bar with
> primary CTA. Tagline: 'Duduk Anteng, Pulang Ganteng'. Bahasa Indonesia.
> Avoid generic AI aesthetics: no purple-blue gradients, no heavy-black shadows,
> no neumorphism. Keep glass effects subtle and tasteful."
