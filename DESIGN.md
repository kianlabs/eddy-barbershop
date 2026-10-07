# DESIGN.md — Eddy Barbershop

> Sistem desain untuk website booking Eddy Barbershop, Kartasura, Sukoharjo.
> Dibuat: 7 Oktober 2026 | Tema: TERANG (keputusan final user).

---

## 0. Referensi Brand Asli

- **Instagram @eddy.barbershop**: "EDDY BARBER SHOP EST 2007"
- Motto: **"Duduk Anteng, Pulang Ganteng"**
- Buka setiap hari 10.00–23.00 WIB
- WA: wa.me/6289664726691
- Alamat: Jl. A. Yani No.402, Makamhaji, Kartasura, Sukoharjo 57161
- Telp: +62 896-6472-6691

> Keputusan desain: tema TERANG (light). Warna emas tetap dipakai sebagai aksen
> premium, tapi di atas background terang.

---

## 1. Filosofi Desain

**"Premium barbershop yang terang & bersih"** — kesan mewah tetap dapat lewat
tipografi berani dan aksen emas, tapi overall terang, airy, ramah.

### Prinsip utama
- **Tipografi sebagai hero.** Hierarki visual dari ukuran & berat huruf.
- **Ruang napas.** Whitespace lega, jangan takut kosong.
- **Emas itu bumbu.** Aksen di titik fokus: CTA, divider, highlight.
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
| Warm White | `#faf8f3` | Background utama |
| Pure White | `#ffffff` | Background kartu / section alt |
| Deep Gold | `#a8842c` | Aksen: CTA, highlight — HEMAT |
| Charcoal | `#1a1a1a` | Teks utama |
| Warm Grey | `#6b6b6b` | Teks sekunder / disabled |
| Hairline | `#e5e0d5` | Divider 1px, border halus |

**Aturan:** Background selalu terang. Emas dipakai hemat di titik fokus:
1 CTA, 1 divider, atau 1 highlight per section.

---

## 3. Tipografi

| Peran | Style | Contoh pakai |
|-------|-------|--------------|
| Display | Serif condensed / Bebas-style, bold, oversized, charcoal | "EDDY", judul section |
| Heading | Serif, semibold, charcoal | Nama layanan, nama kapster |
| Body | Sans grotesque, regular, charcoal | Deskripsi, paragraf |
| Label | Sans, uppercase, letter-spacing lebar, small, grey | "PILIH JADWAL" |
| Harga | Bold, deep gold `#a8842c` | Rp25.000 |

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
- Primary: background deep gold `#a8842c`, teks putih, radius 8px, uppercase.
- Secondary: outline 1px gold, teks gold, background transparan.

### Input
- Background putih, border 1px `#e5e0d5`, radius 8px, focus border gold.

### Time Slot
- Pill: available = outline gold tipis; dipilih = fill gold teks putih;
  booked = abu-abu strikethrough.

### Progress (booking flow)
- Bar tipis gold di atas (bukan lingkaran bernomor).

### Badge
- Background gold muda, teks charcoal — untuk "Populer", "Promo".

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
3. Pilih Jadwal → strip hari (7 hari!) + slot pills
4. Konfirmasi → karcis reservasi + tombol "Konfirmasi via WhatsApp"

### Admin (rencana)
- Status booking dengan dot: 🟡 menunggu, 🟢 dikonfirmasi, ✅ selesai, ⚪ batal.

---

## 8. Untuk AI Design Tools (Stitch, dll)

> "Design for 'Eddy Barbershop' (EST 2007), Kartasura Indonesia. LIGHT theme:
> warm white #faf8f3 background, deep gold #a8842c accents used sparingly,
> charcoal #1a1a1a text. Bold condensed display typography, generous whitespace,
> bright and airy. Tagline: 'Duduk Anteng, Pulang Ganteng'. Avoid generic AI
> aesthetics: no purple-blue gradients, no dark mode, no centered-text hero,
> no cookie-cutter card grids. Premium but approachable. Bahasa Indonesia."
