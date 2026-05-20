# 🕌 Adzora — Digital Signage Masjid Modern

> Aplikasi digital signage berbasis web untuk masjid Indonesia. Menampilkan jadwal sholat otomatis, jam digital, countdown iqomah, kalender Hijriah, dan lebih banyak lagi — dirancang untuk berjalan 100% offline di layar TV masjid.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-installable-green?logo=pwa)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## ✨ Fitur Utama

| Fitur                           | Keterangan                                                      |
| ------------------------------- | --------------------------------------------------------------- |
| 🕐 **Jam Digital Realtime**     | Akurat hingga detik, menggunakan `requestAnimationFrame`        |
| 🕌 **Jadwal Sholat**            | Kalkulasi lokal via `adhan-js`, tidak butuh internet            |
| ⏳ **Countdown Adzan & Iqomah** | Hitung mundur otomatis ke waktu sholat berikutnya               |
| 📅 **Kalender Hijriah**         | Tampil bersamaan dengan kalender Gregorian                      |
| 📢 **Running Text**             | Ticker berjalan dengan konten yang bisa dikonfigurasi           |
| 🖼️ **Slideshow Gambar**         | Upload gambar dari panel admin, tampil otomatis                 |
| 🔊 **Audio Adzan Otomatis**     | 3 pilihan audio bawaan + upload audio custom                    |
| ⚙️ **Admin Panel**              | Konfigurasi lengkap via browser biasa (laptop/HP)               |
| 📶 **100% Offline**             | Setelah setup pertama, tidak butuh koneksi internet sama sekali |
| 📱 **PWA Installable**          | Bisa diinstall di Android TV, laptop, dan HP                    |

---

## 🖥️ Tampilan

Adzora terdiri dari dua route utama:

- **`/display`** — Tampilan fullscreen untuk TV/layar masjid
- **`/admin`** — Panel konfigurasi yang bisa dibuka dari laptop atau HP

---

## 🚀 Cara Menjalankan

### Prasyarat

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 18 (untuk kompatibilitas Next.js)

### Install & Jalankan

```bash
# Clone repository
git clone https://github.com/username/adzora.git
cd adzora

# Install dependencies
bun install

# Jalankan development server
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Produksi

```bash
bun run build
bun start
```

---

## ⚙️ Konfigurasi Awal

1. Buka `http://[ip-device]:3000/admin` dari laptop atau HP yang terhubung ke jaringan yang sama
2. Masukkan PIN default: **`123456`**
3. Isi data masjid: nama, kota, koordinat lokasi
4. Pilih metode perhitungan waktu sholat
5. Sesuaikan tema dan konten
6. Buka `http://[ip-device]:3000/display` di browser TV, tekan F11 untuk fullscreen

---

## 🗂️ Struktur Project

```
adzora/
├── public/
│   ├── audio/          # File adzan bawaan
│   ├── icons/          # PWA icons
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── display/    # Halaman tampilan TV
│   │   └── admin/      # Panel admin
│   ├── components/
│   │   ├── display/    # Komponen tampilan (jam, jadwal, dll)
│   │   └── admin/      # Komponen admin panel
│   ├── engines/        # Logic utama (prayer, audio, schedule)
│   ├── stores/         # Zustand state management
│   ├── db/             # Dexie.js IndexedDB
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript type definitions
```

---

## 🛠️ Tech Stack

| Kategori         | Library                      |
| ---------------- | ---------------------------- |
| Framework        | Next.js 14 (App Router)      |
| Language         | TypeScript (strict mode)     |
| Styling          | Tailwind CSS v4              |
| State            | Zustand + persist middleware |
| Database lokal   | Dexie.js (IndexedDB)         |
| Kalkulasi sholat | adhan-js                     |
| Animasi          | Framer Motion                |
| PWA              | @ducanh2912/next-pwa         |
| Audio            | Howler.js                    |
| Kalender Hijriah | hijri-converter              |
| Icons            | Lucide React                 |
| Date utility     | date-fns                     |

---

## 🧩 Metode Perhitungan Waktu Sholat

Tersedia beberapa pilihan di admin panel:

| Metode                                | Keterangan                       |
| ------------------------------------- | -------------------------------- |
| **MoonsightingCommittee** _(default)_ | Paling umum untuk Indonesia      |
| **Kemenag**                           | Standar Kementerian Agama RI     |
| **MWL**                               | Muslim World League              |
| **ISNA**                              | Islamic Society of North America |

Tersedia juga koreksi manual ±60 menit per waktu sholat.

---

## 📱 Dukungan Perangkat

| Perangkat                | Keterangan                                 |
| ------------------------ | ------------------------------------------ |
| 🖥️ Smart TV / Android TV | Tampilan `/display` fullscreen via browser |
| 💻 Laptop / PC           | Admin panel + tampilan display             |
| 📱 HP / Tablet           | Admin panel (mobile-friendly)              |
| 🔲 Raspberry Pi          | Bisa digunakan sebagai server lokal        |

---

## 🔒 Keamanan Admin Panel

- Dilindungi PIN 6 digit
- PIN disimpan sebagai hash di localStorage
- PIN default: `123456` — **segera ganti setelah setup pertama**

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Silakan buka issue atau pull request.

1. Fork repository ini
2. Buat branch baru: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buka Pull Request

---

## 📄 Lisensi

MIT License — bebas digunakan untuk masjid dan musholla di seluruh Indonesia.

---

<p align="center">
  Dibuat dengan ❤️ untuk masjid-masjid Indonesia
</p>
