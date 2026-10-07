# DESIGN.md — Eddy Barbershop

> Sistem desain untuk website booking Eddy Barbershop, Kartasura, Sukoharjo.
> Dibuat: 7 Oktober 2026 | Revisi: ngikutin branding asli (hitam-emas, EST 2007).

---

## 0. Referensi Branding Asli

Berdasarkan riset 7 Oktober 2026:
- **Instagram @eddy.barbershop**: logo "EDDY BARBER SHOP EST 2007" — **hitam + emas**
- Bio: "Tempat Cukur Pria & Anak 💈" — motto: **"Duduk Anteng, Pulang Ganteng"**
- Buka setiap hari 10.00–23.00 WIB
- WA: wa.me/6289664726691
- Alamat: Jl. A. Yani No.402, Makamhaji, Kartasura, Sukoharjo 57161
- Telp: +62 896-6472-6691

Website HARUS terasa seperti perpanjangan brand aslinya.

---

## 1. Filosofi Desain

**"Premium barbershop klasik"** — hitam pekat, aksen emas hemat, tipografi berani.
Mewah tapi maskulin, bukan norak.

### Prinsip utama
- **Tipografi sebagai hero.** Hierarki visual dari ukuran & berat huruf.
- **Ruang napas.** Whitespace lega, jangan takut kosong.
- **Emas itu bumbu.** Muncul hanya di titik fokus: 1 CTA, 1 divider, 1 highlight.
- **Fungsional.** Booking flow gampang dipakai semua umur.

### Yang DILARANG (anti AI-slop)
- ❌ Gradien ungu-biru atau gradien mencolok apapun
- ❌ Hero generik: teks di tengah + tombol + background blur
- ❌ Card grid cookie-cutter yang monoton
- ❌ Numbered circle stepper (1-2-3-4 dalam lingkaran)
- ❌ Shadow tebal / neumorphism / glassmorphism berlebihan
- ❌ Foto stock yang keliatan "stock"

---

## 2. Warna

| Nama | Hex | Fungsi |
|------|-----|--------|
| Charcoal Black | `#0a0a0a` | Background utama |
| Deep Charcoal | `#141414` | Background sekunder / section alt |
| Muted Gold | `#c9a227` | Aksen: CTA, divider, highlight — HEMAT |
| Off-White | `#f5f2ea` | Teks utama |
| Muted Grey | `#8a8a8a` | Teks sekunder / disabled |
| Hairline | `#2a2a2a` | Divider 1px, border halus |

**Aturan:** Maksimal 2 warna dominan per viewport (hitam + putih). Emas muncul hanya
di titik fokus: 1 CTA, 1 divider, atau 1 highlight per section.

---

## 3. Tipografi

| Peran | Style | Contoh pakai |
|-------|-------|--------------|
| Display | Serif condensed / Bebas-style, bold, oversized | "EDDY", judul section |
| Heading | Serif, semibold | Nama layanan, nama kapster |
| Body | Sans grotesque, regular | Deskripsi, paragraf |
| Label | Sans, uppercase, letter-spacing lebar, small | "PILIH JADWAL" |
| Harga | Bold, emas `#c9a227` | Rp25.000 |

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
- **Asimetris > simetris.** Hero nggak harus teks di tengah.
- **Daftar vertikal > card grid** untuk layanan.
- **Section title oversized.** Judul section besar kayak headline koran.
- **Satu CTA dominan per layar.**

---

## 6. Komponen

### Button
- Primary: background emas `#c9a227`, teks hitam, radius kecil (4px), uppercase.
- Secondary: outline 1px emas, teks emas, background transparan.

### Input
- Style underline (border-bottom 1px), label small caps di atas.

### Time Slot
- Pill minimal: available = outline emas tipis; booked = dimmed strikethrough.

### Progress (booking flow)
- Garis tipis emas di atas (bukan lingkaran bernomor).

### Divider
- Hairline 1px `#2a2a2a`.

---

## 7. Halaman & Alur

### Landing
1. Hero — "EDDY" oversized + "Duduk Anteng, Pulang Ganteng"
2. Layanan — list vertikal dengan harga asli
3. Kapster — kartu foto
4. Lokasi & Jam — Jl. A. Yani No.402, buka tiap hari 10.00–23.00
5. Footer — WA, IG @eddy.barbershop

### Booking (4 langkah)
1. Pilih Layanan → list + harga asli
2. Pilih Kapster → kartu foto
3. Pilih Jadwal → strip hari (7 hari, buka tiap hari!) + slot pills
4. Konfirmasi → karcis reservasi + tombol "Konfirmasi via WhatsApp"

### Admin (rencana)
- Status booking dengan dot: 🟡 menunggu, 🟢 dikonfirmasi, ✅ selesai, ⚪ batal.

---

## 8. Untuk AI Design Tools (Stitch, dll)

> "Design for 'Eddy Barbershop' (EST 2007), Kartasura Indonesia. Premium classic
> barbershop: charcoal black #0a0a0a background, muted gold #c9a227 accents used
> sparingly, off-white #f5f2ea text. Bold condensed display typography. Tagline:
> 'Duduk Anteng, Pulang Ganteng'. Avoid generic AI aesthetics: no purple-blue
> gradients, no centered-text hero, no cookie-cutter card grids. Masculine,
> refined, intentional. Bahasa Indonesia."
