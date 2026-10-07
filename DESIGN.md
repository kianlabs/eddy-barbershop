# DESIGN.md — Eddy Barbershop

> Sistem desain untuk website booking Eddy Barbershop, Kartasura, Sukoharjo.
> Dibuat: 7 Oktober 2026 | Tema: PUTIH + EMAS LUXURY (varian B, keputusan final user).

---

## 0. Referensi Brand Asli

- **Instagram @eddy.barbershop**: "EDDY BARBER SHOP EST 2007"
- Motto: **"Duduk Anteng, Pulang Ganteng"**
- Buka setiap hari 10.00–23.00 WIB
- WA: wa.me/6289664726691
- Alamat: Jl. A. Yani No.402, Makamhaji, Kartasura, Sukoharjo 57161
- Telp: +62 896-6472-6691

---

## 1. Filosofi Desain

**"White & gold luxury"** — putih bersih, aksen emas, kesan premium minimalis.
Elegan, terang, modern.

### Prinsip utama
- **Putih dominan.** Background `#FFFFFF`, bersih dan lega.
- **Emas sebagai aksen premium.** `#C9A227` untuk CTA, harga, highlight.
- **Tipografi kuat.** Bebas Neue untuk judul, Plus Jakarta Sans untuk isi.
- **Fungsional.** Booking flow gampang dipakai semua umur.

### Yang DILARANG (anti AI-slop)
- ❌ Gradien ungu-biru atau gradien mencolok apapun
- ❌ Hero generik: teks di tengah + tombol + background blur
- ❌ Card grid cookie-cutter yang monoton
- ❌ Numbered circle stepper (1-2-3-4 dalam lingkaran)
- ❌ Shadow tebal / neumorphism / glassmorphism berlebihan
- ❌ Foto stock yang keliatan "stock"
- ❌ Campur tema lain (krem+marun) — KONSISTEN putih+emas di semua halaman!

---

## 2. Warna

| Nama | Hex | Fungsi |
|------|-----|--------|
| Pure White | `#FFFFFF` | Background utama |
| Off White | `#FAFAF8` | Background section alt / kartu |
| Gold | `#C9A227` | Aksen: CTA, harga, highlight |
| Charcoal | `#1A1A1A` | Teks utama |
| Warm Grey | `#6B6B6B` | Teks sekunder / disabled |
| Hairline | `#E8E4DA` | Divider 1px, border halus |

**Aturan:** Putih selalu dominan. Emas hanya di titik fokus: CTA, harga,
atau 1 highlight per section. Jangan campur dengan marun/krem!

---

## 3. Tipografi

| Peran | Style | Contoh pakai |
|-------|-------|--------------|
| Display | Bebas Neue, oversized, charcoal | "EDDY", judul section |
| Heading | Plus Jakarta Sans Bold, charcoal | Nama layanan, nama kapster |
| Body | Plus Jakarta Sans Regular, charcoal | Deskripsi, paragraf |
| Label | Plus Jakarta Sans, uppercase, letter-spacing, small, grey | "PILIH JADWAL" |
| Harga | Plus Jakarta Sans Bold, gold `#C9A227` | Rp25.000 |

**Bahasa:** Bahasa Indonesia. Tone: "Duduk Anteng, Pulang Ganteng."

---

## 4. Daftar Harga Asli (dari foto resmi toko)

| Layanan | Harga |
|---------|-------|
| Potong Rambut | Rp25.000 |
| Potong + Cuci + Pijat + Vit | Rp30.000 |
| Botak & Kerok | Rp30.000 |
| Semir Rambut | Rp35.000–150.000 |
| High Light | Rp45.000 |
| Bleaching Full | Rp50.000 |
| Toning | Rp40.000 |
| Pelurus Rambut | Rp45.000 |
| Perming Keriting | Rp120.000–150.000 |
| Keramas & Pijat | Rp10.000 |
| Kerok Jenggot | Rp10.000 |
| Hair Tattoo | Rp20.000–50.000 |
| Creambath | Rp50.000 |

> Catatan: ada pengumuman kenaikan harga (Sep 2026, berlaku sejak Mar 2025).
> Konfirmasi ulang ke owner sebelum pitching.

---

## 5. Layout

- **Mobile-first.** Mayoritas booking dari HP.
- **Bersih & minimalis.** Banyak whitespace, elemen sedikit tapi tepat.
- **Daftar vertikal** untuk layanan.
- **Satu CTA dominan per layar.** Tombol emas, teks putih/hitam.

---

## 6. Komponen

### Button
- Primary: background gold `#C9A227`, teks putih, radius 8px, uppercase.
- Secondary: outline 1px gold, teks gold, background transparan.

### Input
- Background putih, border 1px `#E8E4DA`, radius 8px, focus border gold.

### Time Slot
- Pill: available = outline gold tipis; dipilih = fill gold teks putih;
  booked = abu-abu strikethrough (kontras cukup!).

### Progress (booking flow)
- Bar tipis gold di atas.

### Badge
- Background gold `#C9A227`, teks putih — untuk "Populer", "Promo".

---

## 7. Halaman & Alur

### Landing
1. Hero — "EDDY" Bebas Neue oversized + "Duduk Anteng, Pulang Ganteng"
2. Layanan — list vertikal dengan harga asli (emas)
3. Kapster — kartu putih bersih
4. Lokasi & Jam — Jl. A. Yani No.402, buka tiap hari 10.00–23.00
5. Footer — WA +62 896-6472-6691, IG @eddy.barbershop

### Booking (4 langkah)
1. Pilih Layanan → list + harga emas
2. Pilih Kapster → kartu foto
3. Pilih Jadwal → strip 7 hari (buka tiap hari!) + slot pills
4. Konfirmasi → ringkasan + tombol emas "Konfirmasi via WhatsApp"

### Admin (rencana)
- Status booking dengan dot: 🟡 menunggu, 🟢 dikonfirmasi, ✅ selesai, ⚪ batal.

---

## 8. Untuk AI Design Tools (Stitch, dll)

> "Design for 'Eddy Barbershop' (EST 2007), Kartasura Indonesia. LIGHT LUXURY
> theme: pure white #FFFFFF background, gold #C9A227 accents, charcoal #1A1A1A
> text. Minimalist, elegant, generous whitespace. Typography: Bebas Neue for
> headlines, Plus Jakarta Sans for body. Tagline: 'Duduk Anteng, Pulang Ganteng'.
> IMPORTANT: use ONLY this white+gold palette on every screen — no cream, no
> maroon, no dark mode. Avoid generic AI aesthetics: no purple-blue gradients,
> no centered-text hero, no cookie-cutter card grids. Bahasa Indonesia."
