# DESIGN.md — Eddy Barbershop

> Sistem desain untuk website booking Eddy Barbershop, Kartasura, Sukoharjo.
> Dibuat: 7 Oktober 2026

---

## 1. Filosofi Desain

**"Bright premium barbershop"** — terang, bersih, premium tapi nggak norak. Setiap elemen harus terasa
_disengaja_, bukan hasil template.

### Prinsip utama
- **Editorial, bukan dashboard.** Layout kayak majalah/publikasi, bukan SaaS generik.
- **Tipografi sebagai hero.** Hierarki visual dibangun dari ukuran & berat huruf,
  bukan dari warna-warni atau dekorasi.
- **Ruang napas.** Whitespace lega. Jangan takut kosong.
- **Aksen emas secukupnya.** Emas itu bumbu, bukan lauk utama.

### Yang DILARANG (anti AI-slop)
- ❌ Gradien ungu-biru atau gradien mencolok apapun
- ❌ Hero generik: teks di tengah + tombol + background blur
- ❌ Card grid cookie-cutter yang monoton
- ❌ Numbered circle stepper (1-2-3-4 dalam lingkaran)
- ❌ Shadow tebal / neumorphism / glassmorphism berlebihan
- ❌ Foto stock yang keliatan "stock" (senyum palsu, studio putih)
- ❌ Terlalu banyak warna aksen sekaligus

---

## 2. Warna

| Nama | Hex | Fungsi |
|------|-----|--------|
| Warm White | `#faf8f3` | Background utama |
| Pure White | `#ffffff` | Background kartu / section alt |
| Deep Gold | `#a8842c` | Aksen: CTA, divider, highlight — HEMAT |
| Charcoal | `#1a1a1a` | Teks utama |
| Warm Grey | `#6b6b6b` | Teks sekunder / disabled |
| Hairline | `#e5e0d5` | Divider 1px, border halus |

**Aturan:** Maksimal 2 warna dominan per viewport (putih + hitam). Emas muncul hanya
di titik fokus: 1 CTA, 1 divider, atau 1 highlight per section.

---

## 3. Tipografi

| Peran | Style | Contoh pakai |
|-------|-------|--------------|
| Display | Serif condensed, bold, oversized | Judul hero, nama section ("LAYANAN", "KAPSTER") |
| Heading | Serif, semibold | Judul kartu, nama layanan |
| Body | Sans grotesque, regular | Deskripsi, paragraf |
| Label | Sans, uppercase, letter-spacing lebar, small | "PILIH JADWAL", "KONFIRMASI" |
| Angka | Serif atau mono tabular | Harga (Rp45.000), jam slot |

**Bahasa:** Bahasa Indonesia. Tone: santai tapi rapi. "Potong Rapi, Gaya Maksimal."

---

## 4. Layout

- **Mobile-first.** 90% user booking dari HP.
- **Asimetris > simetris.** Hero nggak harus teks di tengah.
- **Daftar vertikal > card grid** untuk: layanan, kapster, riwayat booking.
  - Format: nama besar di kiri, harga di kanan, hairline divider 1px.
- **Section title oversized.** Judul section besar banget, kayak headline koran.
- **Satu CTA dominan per layar.** Jangan ada 3 tombol sejajar yang bersaing.

---

## 5. Komponen

### Button
- Primary: background emas `#a8842c`, teks putih, radius kecil (4px), uppercase.
- Secondary: outline 1px emas `#a8842c`, teks emas, background transparan.
- Jangan ada tombol gradien.

### Input
- Style underline (border-bottom 1px), bukan kotak.
- Label small caps di atas, bukan placeholder.

### Time Slot
- Pill minimal: available = outline emas tipis; booked = dimmed + strikethrough.
- Jangan pakai warna merah/hijau.

### Progress (booking flow)
- Garis tipis emas di atas (progress bar 1-2px), BUKAN lingkaran bernomor.

### Divider
- Hairline 1px `#2a2a2a`. Biarkan "garis rambut" sesuai tema barbershop.

### Foto
- Tone warm terang, natural light. Hindari foto yang keliatan stock (senyum palsu, studio putih).
- Rasio: portrait untuk kapster, landscape wide untuk interior.

---

## 6. Halaman & Alur

### Landing
1. Hero (asimetris, wordmark EDDY oversized)
2. Layanan (editorial list, bukan cards)
3. Kapster (horizontal scroll)
4. CTA Booking (full-width band, minimal)
5. Footer (alamat, jam Senin–Sabtu, Instagram)

### Booking (4 langkah)
1. Pilih Layanan → list rows
2. Pilih Kapster → list + foto bulat kecil
3. Pilih Jadwal → strip hari (Senin–Sabtu) + slot pills
4. Konfirmasi → ringkasan + input underline + tombol emas

### Admin (rencana)
- Tabel bersih, hairline dividers, status booking dengan dot warna kecil
  (bukan badge besar): 🟡 menunggu, 🟢 dikonfirmasi, ✅ selesai, ⚪ batal.

---

## 7. Untuk AI Design Tools (Stitch, dll)

Saat generate mockup, selalu sertakan art direction ini di prompt:

> "Avoid generic AI aesthetics: no purple-blue gradients, no centered-text hero,
> no cookie-cutter card grids. Editorial magazine-style layout, strong typographic
> hierarchy, generous whitespace, bright and airy. Palette: warm white #faf8f3
> background, deep gold #a8842c used sparingly as accent, charcoal #1a1a1a text.
> Bahasa Indonesia."

---

## 8. Referensi Rasa

Bayangin perpaduan: **majalah fashion pria edisi terang** (layout) + **buku appointment
salon high-end** (booking flow) + **barbershop klasik yang bersih** (detail: garis
rambut, pola barber pole, tekstur handuk).

Bukan: template ThemeForest, bukan dashboard admin generik, bukan landing page
startup.
