# DESIGN.md — Eddy Barbershop

> Sistem desain untuk website booking Eddy Barbershop, Kartasura, Sukoharjo.
> Dibuat: 7 Oktober 2026 | Rombak total: ngikutin branding asli toko.

---

## 0. Referensi Branding Asli

Berdasarkan foto signage asli Eddy Barbershop Kleco (Kartasura):
- Huruf **"EDDY"** besar warna **merah marun**
- Tulisan **"BARBERSHOP & SHAVES"** warna **biru muda**
- Background dinding **krem/kuning hangat**
- Aksen **gunting kuning** + ilustrasi barber vintage berkumis
- Motif garis merah-krem (barber pole vibes)

Website HARUS terasa seperti perpanjangan toko aslinya, bukan brand lain.

---

## 1. Filosofi Desain

**"Vintage barbershop yang hidup"** — hangat, playful, autentik. Kayak masuk ke
tokonya langsung: mural, warna berani, karakter kuat.

### Prinsip utama
- **Warna berani, layout rapi.** Paletnya colorful tapi komposisinya terkontrol.
- **Tipografi display sebagai identitas.** Huruf "EDDY" merah marun = logo visual.
- **Tekstur & ilustrasi.** Sentuhan vintage: garis, pola barber pole, ilustrasi
  gunting/pisau cukur. Jangan flat steril.
- **Tetap fungsional.** Booking flow harus gampang dipakai ibu-ibu yang bookingin
  anaknya, bukan cuma bagus dilihat.

### Yang DILARANG (anti AI-slop)
- ❌ Gradien ungu-biru atau gradien mencolok apapun
- ❌ Tema hitam-emas mewah (itu bukan Eddy!)
- ❌ Hero generik: teks di tengah + tombol + background blur
- ❌ Card grid cookie-cutter yang monoton
- ❌ Numbered circle stepper (1-2-3-4 dalam lingkaran)
- ❌ Foto stock yang keliatan "stock"

---

## 2. Warna

| Nama | Hex | Fungsi |
|------|-----|--------|
| Maroon Red | `#8b1e1e` | Primer: logo "EDDY", CTA utama, highlight |
| Cream | `#f7f0dc` | Background utama |
| Warm Yellow | `#f5c518` | Aksen: ikon gunting, badge, highlight kecil |
| Sky Blue | `#7fb3d5` | Sekunder: sub-judul, link, info |
| Charcoal | `#2b2b2b` | Teks utama |
| Warm Grey | `#6b6b6b` | Teks sekunder |
| Hairline | `#e0d5bd` | Divider 1px |

**Aturan:** Background selalu krem hangat. Merah marun untuk hal penting (CTA,
judul besar). Biru muda untuk info sekunder. Kuning untuk aksen playful kecil.

---

## 3. Tipografi

| Peran | Style | Contoh pakai |
|-------|-------|--------------|
| Display | Bold condensed, uppercase, merah marun | "EDDY", judul section |
| Sub-display | Sans bold, biru muda, uppercase | "BARBERSHOP & SHAVES" |
| Heading | Sans bold, charcoal | Nama layanan, nama kapster |
| Body | Sans regular, charcoal | Deskripsi, paragraf |
| Label | Sans, uppercase, letter-spacing, small | "PILIH JADWAL" |
| Harga | Bold, merah marun | Rp25.000 |

**Bahasa:** Bahasa Indonesia, santai akrab. "Potong ganteng, harga bersahabat."

---

## 4. Layout

- **Mobile-first.** Mayoritas booking dari HP.
- **Header dengan identitas kuat.** Logo "EDDY" merah marun selalu terlihat.
- **Section dengan divider motif.** Garis merah-krem (barber pole strip) sebagai
  pemisah section — ciri khas.
- **Daftar layanan vertikal.** Nama besar, harga merah marun di kanan.
- **Satu CTA dominan per layar.** Tombol merah marun, teks putih.

---

## 5. Komponen

### Button
- Primary: background merah marun `#8b1e1e`, teks putih/krem, radius sedang (8px).
- Secondary: outline 1px marun, teks marun, background transparan.

### Input
- Background putih, border 1px `#e0d5bd`, radius 8px, focus border marun.

### Time Slot
- Pill: available = outline marun; dipilih = fill marun teks putih;
  booked = abu-abu strikethrough.

### Progress (booking flow)
- Bar tipis merah marun di atas (bukan lingkaran bernomor).

### Badge/Tag
- Background kuning `#f5c518`, teks charcoal — untuk "Promo", "Populer".

### Ilustrasi
- Ikon gunting, pisau cukur, barber pole — style line-art vintage, warna marun/kuning.
- Boleh pakai motif garis diagonal merah-krem di background section tertentu.

---

## 6. Halaman & Alur

### Landing
1. Hero — "EDDY" raksasa merah marun + "BARBERSHOP & SHAVES" biru, CTA "Booking Sekarang"
2. Layanan — list vertikal dengan harga merah marun
3. Kapster — kartu foto dengan nama + spesialisasi
4. Lokasi & Jam — Jl. A. Yani / Jl. Papagan, Makamhaji, Kartasura; Senin–Sabtu
5. Footer — WhatsApp, Instagram, jam operasional

### Booking (4 langkah)
1. Pilih Layanan → list dengan harga
2. Pilih Kapster → kartu foto
3. Pilih Jadwal → strip hari + slot pills
4. Konfirmasi → ringkasan + input + tombol marun

### Admin (rencana)
- Tabel bersih, status dengan dot warna: 🟡 menunggu, 🟢 dikonfirmasi,
  ✅ selesai, ⚪ batal.

---

## 7. Untuk AI Design Tools (Stitch, dll)

Template prompt:

> "Design for 'Eddy Barbershop', Kartasura Indonesia. Match the real shop branding:
> big maroon-red 'EDDY' wordmark (#8b1e1e), light blue 'BARBERSHOP & SHAVES'
> subtitle (#7fb3d5), warm cream background (#f7f0dc), yellow scissors accents
> (#f5c518). Vintage playful barbershop style — barber pole stripes, retro
> line-art illustrations, bold condensed typography. Avoid generic AI aesthetics:
> no purple-blue gradients, no black-gold luxury theme, no centered-text hero.
> Warm, authentic, fun. Bahasa Indonesia."

---

## 8. Referensi Rasa

**Barbershop vintage Amerika era 1950an** yang diterjemahkan ke konteks Jawa:
mural warna-warni, huruf besar berani, pola barber pole — tapi layout modern
dan mobile-friendly.

Bukan: hitam-emas mewah, bukan dashboard SaaS, bukan template generik.
