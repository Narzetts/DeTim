<p align="center">
  <img src="assets/brand/logo.svg" alt="Logo DeTim" width="96" height="96">
</p>

<h1 align="center">DeTim</h1>

<p align="center"><strong>Pembagi kelompok tugas yang acak, seimbang, dan sepenuhnya berjalan di browser.</strong></p>

<p align="center">
  <code>HTML5</code> · <code>CSS3</code> · <code>JavaScript</code> · <code>LocalStorage</code> · <code>Tanpa dependensi</code>
</p>

<p align="center">
  <a href="#fitur">Fitur</a> ·
  <a href="#screenshot">Screenshot</a> ·
  <a href="#menjalankan-aplikasi">Menjalankan</a> ·
  <a href="#cara-menggunakan">Cara Menggunakan</a> ·
  <a href="Screenshot/PANDUAN.md">Panduan Lengkap</a>
</p>

---

DeTim membagi daftar nama menjadi beberapa kelompok tugas secara acak dan seimbang. Cocok untuk pembagian kelompok kelas, kerja kelompok, proyek, atau acara. Semua proses berjalan di browser: tidak ada akun, server, database, maupun pengiriman data ke pihak lain.

[![Hasil pembagian kelompok di DeTim](Screenshot/09-hasil-pembagian.png)](Screenshot/09-hasil-pembagian.png)

<p align="center"><sub>Hasil pembagian seimbang, lengkap dengan komposisi jenis kelamin di setiap kelompok.</sub></p>

> **Privasi sejak awal.** Anggota, hasil, dan riwayat disimpan di LocalStorage perangkat Anda. Tidak ada data yang dikirim ke server.

## Fitur

### Input dan anggota

- Input massal dengan satu nama per baris. Spasi berlebih dirapikan dan baris kosong diabaikan.
- Deteksi nama ganda tanpa membedakan huruf besar dan kecil.
- Tambah, ubah, hapus, dan bersihkan anggota.
- Penghapusan anggota dapat diurungkan lewat notifikasi.

### Pembagian kelompok

- Validasi jumlah kelompok: minimal 1, maksimal sama dengan jumlah anggota, dan hanya bilangan bulat.
- Estimasi otomatis isi setiap kelompok sebelum pembagian dibuat.
- Pengacakan Fisher-Yates dengan pembagian seimbang. Selisih jumlah anggota antar kelompok maksimal satu.
- Setiap anggota muncul tepat satu kali. Tidak ada anggota yang hilang atau terduplikasi.
- Nama kelompok kustom dipertahankan saat acak ulang bila jumlah kelompok tetap sama.
- Peringatan jelas ketika daftar anggota atau jumlah kelompok berubah setelah hasil dibuat.

### Ekspor dan berbagi

- Salin semua hasil atau salin satu kelompok saja.
- Unduh hasil sebagai TXT.
- Cetak atau simpan sebagai PDF melalui dialog cetak browser.

### Riwayat dan pengelolaan data

- Riwayat maksimal 20 sesi. Sesi dapat dibuka kembali, dihapus satu per satu, atau dibersihkan seluruhnya.
- Reset sesi dan hapus semua data, masing-masing dengan konfirmasi.
- Mode gelap yang tersimpan dan diterapkan ke seluruh komponen.
- Tata letak responsif dari lebar 320 piksel hingga desktop.
- Penanganan penyimpanan lokal yang tidak tersedia, penuh, atau berisi data rusak.
- Nama pengguna dirender dengan `textContent`, bukan HTML, sehingga input tidak dapat menyisipkan markup atau skrip.

## Screenshot

Tangkapan layar berikut diambil dari DeTim V1.0 menggunakan Microsoft Edge dan Playwright. Tampilan desktop menggunakan viewport 1440×1000, halaman awal diambil sebagai full-page, dan tampilan mobile menggunakan 390×844. Klik gambar untuk membuka versi penuh.

### Alur utama

| Input massal dan deteksi duplikat | Anggota terdaftar |
| :---: | :---: |
| [![Input massal dan deteksi duplikat](Screenshot/02-input-massal-dan-duplikat.png)](Screenshot/02-input-massal-dan-duplikat.png) | [![Anggota terdaftar](Screenshot/03-anggota-terdaftar.png)](Screenshot/03-anggota-terdaftar.png) |

| Menentukan jumlah kelompok | Hasil dengan nama kelompok kustom |
| :---: | :---: |
| [![Menentukan jumlah kelompok](Screenshot/07-jumlah-kelompok-dan-estimasi.png)](Screenshot/07-jumlah-kelompok-dan-estimasi.png) | [![Hasil dengan nama kelompok kustom](Screenshot/11-hasil-nama-kustom.png)](Screenshot/11-hasil-nama-kustom.png) |

| Menyalin semua hasil | Riwayat pembagian |
| :---: | :---: |
| [![Menyalin semua hasil](Screenshot/14-salin-semua.png)](Screenshot/14-salin-semua.png) | [![Riwayat pembagian](Screenshot/18-riwayat.png)](Screenshot/18-riwayat.png) |

### Tampilan mobile

| Formulir di layar ponsel | Hasil kelompok di layar ponsel |
| :---: | :---: |
| [![Formulir di layar ponsel](Screenshot/25-mobile-form.png)](Screenshot/25-mobile-form.png) | [![Hasil kelompok di layar ponsel](Screenshot/26-mobile-hasil.png)](Screenshot/26-mobile-hasil.png) |

<details>
<summary><strong>Lihat galeri lengkap — 26 screenshot</strong></summary>

#### Memulai dan Menambah Anggota

<p align="center">
  <a href="Screenshot/01-halaman-awal.png"><img src="Screenshot/01-halaman-awal.png" alt="Halaman awal DeTim" width="540"></a><br>
  <sub>01 · Halaman awal</sub>
</p>

| 02 · Input massal dan deteksi duplikat | 03 · Anggota terdaftar |
| :---: | :---: |
| [![Input massal dan deteksi duplikat](Screenshot/02-input-massal-dan-duplikat.png)](Screenshot/02-input-massal-dan-duplikat.png) | [![Anggota terdaftar](Screenshot/03-anggota-terdaftar.png)](Screenshot/03-anggota-terdaftar.png) |

| 04 · Mengubah nama dan jenis kelamin anggota | 05 · Menghapus anggota dan mengurungkannya |
| :---: | :---: |
| [![Mengubah nama dan jenis kelamin anggota](Screenshot/04-ubah-anggota.png)](Screenshot/04-ubah-anggota.png) | [![Menghapus anggota dan mengurungkannya](Screenshot/05-hapus-anggota-urungkan.png)](Screenshot/05-hapus-anggota-urungkan.png) |

<p align="center">
  <a href="Screenshot/06-konfirmasi-hapus-anggota.png"><img src="Screenshot/06-konfirmasi-hapus-anggota.png" alt="Konfirmasi hapus semua anggota" width="540"></a><br>
  <sub>06 · Konfirmasi hapus semua anggota</sub>
</p>

#### Mengatur Kelompok dan Membuat Hasil

| 07 · Menentukan jumlah kelompok | 08 · Validasi jumlah kelompok |
| :---: | :---: |
| [![Menentukan jumlah kelompok](Screenshot/07-jumlah-kelompok-dan-estimasi.png)](Screenshot/07-jumlah-kelompok-dan-estimasi.png) | [![Validasi jumlah kelompok](Screenshot/08-validasi-jumlah-kelompok.png)](Screenshot/08-validasi-jumlah-kelompok.png) |

| 09 · Hasil pembagian | 10 · Mengubah nama kelompok |
| :---: | :---: |
| [![Hasil pembagian](Screenshot/09-hasil-pembagian.png)](Screenshot/09-hasil-pembagian.png) | [![Mengubah nama kelompok](Screenshot/10-ubah-nama-kelompok.png)](Screenshot/10-ubah-nama-kelompok.png) |

| 11 · Hasil dengan nama kustom | 12 · Hasil ditandai kedaluwarsa |
| :---: | :---: |
| [![Hasil dengan nama kelompok kustom](Screenshot/11-hasil-nama-kustom.png)](Screenshot/11-hasil-nama-kustom.png) | [![Hasil ditandai kedaluwarsa](Screenshot/12-hasil-kedaluwarsa.png)](Screenshot/12-hasil-kedaluwarsa.png) |

<p align="center">
  <a href="Screenshot/13-acak-ulang-data-terbaru.png"><img src="Screenshot/13-acak-ulang-data-terbaru.png" alt="Acak ulang dengan data terbaru" width="540"></a><br>
  <sub>13 · Acak ulang dengan data terbaru</sub>
</p>

#### Menyalin, Mengunduh, dan Mencetak

| 14 · Menyalin semua hasil | 15 · Menyalin satu kelompok |
| :---: | :---: |
| [![Menyalin semua hasil](Screenshot/14-salin-semua.png)](Screenshot/14-salin-semua.png) | [![Menyalin satu kelompok](Screenshot/15-salin-kelompok.png)](Screenshot/15-salin-kelompok.png) |

| 16 · Mengunduh hasil sebagai TXT | 17 · Pratinjau cetak dan simpan PDF |
| :---: | :---: |
| [![Mengunduh hasil sebagai TXT](Screenshot/16-unduh-txt.png)](Screenshot/16-unduh-txt.png) | [![Pratinjau cetak dan simpan PDF](Screenshot/17-cetak-pratinjau.png)](Screenshot/17-cetak-pratinjau.png) |

#### Riwayat dan Pengelolaan Data

| 18 · Riwayat pembagian | 19 · Membuka sesi dari riwayat |
| :---: | :---: |
| [![Riwayat pembagian](Screenshot/18-riwayat.png)](Screenshot/18-riwayat.png) | [![Membuka sesi dari riwayat](Screenshot/19-buka-sesi-riwayat.png)](Screenshot/19-buka-sesi-riwayat.png) |

| 20 · Konfirmasi hapus satu sesi | 21 · Konfirmasi hapus semua riwayat |
| :---: | :---: |
| [![Konfirmasi hapus satu sesi](Screenshot/20-hapus-sesi-dialog.png)](Screenshot/20-hapus-sesi-dialog.png) | [![Konfirmasi hapus semua riwayat](Screenshot/21-hapus-riwayat-dialog.png)](Screenshot/21-hapus-riwayat-dialog.png) |

| 22 · Pengelolaan data di footer | 23 · Konfirmasi reset sesi |
| :---: | :---: |
| [![Pengelolaan data di footer](Screenshot/22-pengelolaan-data.png)](Screenshot/22-pengelolaan-data.png) | [![Konfirmasi reset sesi](Screenshot/23-reset-sesi-dialog.png)](Screenshot/23-reset-sesi-dialog.png) |

<p align="center">
  <a href="Screenshot/24-hapus-semua-data-dialog.png"><img src="Screenshot/24-hapus-semua-data-dialog.png" alt="Konfirmasi hapus semua data" width="540"></a><br>
  <sub>24 · Konfirmasi hapus semua data</sub>
</p>

#### Tampilan Mobile

| 25 · Formulir di layar ponsel | 26 · Hasil kelompok di layar ponsel |
| :---: | :---: |
| [![Formulir di layar ponsel](Screenshot/25-mobile-form.png)](Screenshot/25-mobile-form.png) | [![Hasil kelompok di layar ponsel](Screenshot/26-mobile-hasil.png)](Screenshot/26-mobile-hasil.png) |

</details>

Panduan langkah demi langkah untuk setiap alur tersedia di **[Screenshot/PANDUAN.md](Screenshot/PANDUAN.md)**. Untuk galeri interaktif, buka `Screenshot/index.html` di browser setelah mengunduh repo.

## Menjalankan Aplikasi

Tidak ada instalasi, build, atau dependensi runtime.

### Cara langsung

Buka `index.html` di browser. Aplikasi dapat digunakan langsung dari berkas lokal, termasuk penyimpanan data dan font. Cara ini sudah diuji di Microsoft Edge berbasis Chromium.

Beberapa browser membatasi LocalStorage atau clipboard pada alamat `file://`. Jika fitur salin atau penyimpanan tidak berjalan, gunakan server lokal.

### Server lokal

Dari folder proyek, jalankan salah satu perintah berikut:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000` di browser.

Alternatif dengan Node.js:

```bash
npx serve .
```

Server lokal hanya menyajikan berkas statis. Tidak ada backend aplikasi.

## Cara Menggunakan

1. Tempel atau ketik daftar nama di kolom input, satu nama per baris.
2. Klik **Tambahkan anggota**. Nama ganda akan dilewati dan jumlahnya diberitahukan.
3. Periksa daftar anggota. Gunakan tombol pensil untuk mengubah nama dan tombol hapus untuk membuang anggota.
4. Tentukan jumlah kelompok. Angka harus bulat dan tidak melebihi jumlah anggota.
5. Klik **Buat kelompok**. Hasil muncul sebagai kartu kelompok yang dapat disalin atau dicetak.
6. Gunakan **Acak ulang** untuk susunan baru. Bila jumlah kelompok sama, nama kelompok yang sudah diubah tetap dipertahankan.
7. Buka bagian **Riwayat** untuk menampilkan kembali sesi sebelumnya.
8. Gunakan **Salin semua**, **Unduh TXT**, atau **Cetak** pada bagian hasil. Untuk PDF, pilih **Save as PDF** di dialog cetak browser.
9. Gunakan **Reset sesi** untuk mengosongkan anggota dan hasil tanpa menghapus riwayat. Gunakan **Hapus semua data** untuk menghapus seluruh data DeTim, termasuk tema.

Jika daftar anggota atau jumlah kelompok diubah setelah hasil dibuat, DeTim menandai hasil lama sebagai kedaluwarsa. Hasil lama tidak ditampilkan sebagai hasil terbaru. Klik **Acak ulang dengan data terbaru** untuk membuat susunan baru.

Nama yang masih berada di kolom input dan belum ditambahkan akan menghalangi pembuatan kelompok. DeTim meminta nama tersebut ditambahkan lebih dulu agar tidak ada anggota yang terlewat tanpa pemberitahuan.

## Ekspor dan Cetak

| Aksi | Hasil |
| --- | --- |
| **Salin semua** | Menyalin seluruh kelompok dalam format teks yang mudah dibaca. Catatan hasil kedaluwarsa ikut disertakan bila relevan. |
| **Salin** pada kartu | Menyalin satu kelompok saja. |
| **Unduh TXT** | Menghasilkan berkas bernama `DeTim-Hasil-Kelompok-YYYY-MM-DD.txt`. |
| **Cetak** | Menampilkan lembar cetak khusus berisi nama kelompok, semua anggota, tanggal, dan keterangan hasil kedaluwarsa bila ada. Navigasi, formulir, tombol, dan dekorasi layar tidak ikut tercetak. |

Dialog cetak browser dapat dipakai untuk menyimpan hasil sebagai PDF tanpa pustaka tambahan.

## Penyimpanan Lokal

DeTim memakai satu kunci LocalStorage:

```text
detim_app_data
```

Data disimpan sebagai JSON berversi. Perubahan anggota, hasil, riwayat, dan tema disimpan otomatis bila penyimpanan tersedia.

Contoh struktur ringkas:

```json
{
  "version": 1,
  "members": ["Dennis Naufal Orlando", "Andi Saputra", "Budi Santoso"],
  "groupCount": 2,
  "groups": [
    {
      "id": "group-1",
      "name": "Kelompok 1",
      "members": ["Dennis Naufal Orlando", "Budi Santoso"]
    }
  ],
  "history": [],
  "activeSessionId": null,
  "settings": {
    "theme": "light"
  }
}
```

`activeSessionId` menunjuk sesi riwayat yang sedang ditampilkan. Data riwayat menyimpan id sesi, nama sesi, tanggal, daftar anggota, jumlah kelompok, dan hasil kelompok. Riwayat dibatasi 20 sesi dan sesi tertua dibuang saat batas terlampaui.

Data hanya tersimpan di profil browser perangkat tersebut. Menghapus data situs dari browser juga menghapus data DeTim. Tidak ada sinkronisasi antarperangkat.

Jika JSON rusak atau strukturnya tidak dikenali, DeTim memulai dari keadaan kosong, menampilkan peringatan, dan tidak menimpa data lama sampai pengguna melakukan perubahan. Jika penyimpanan tidak tersedia, aplikasi tetap dapat dipakai selama tab terbuka dengan peringatan yang jelas. Jika kuota penyimpanan penuh, perubahan tetap ada di tab tersebut dan pengguna diminta menghapus sebagian riwayat.

## Teknologi

- HTML5 untuk struktur halaman.
- CSS3 untuk desain, mode gelap, tampilan cetak, dan tata letak responsif.
- JavaScript ES6+ tanpa framework, dibagi ke beberapa modul dengan namespace `window.DeTim`.
- LocalStorage untuk data aplikasi.
- Clipboard API dengan fallback `document.execCommand("copy")`.
- Blob dan object URL untuk unduhan TXT.
- Browser Print API untuk cetak dan simpan sebagai PDF.

Tidak ada React, Vue, Angular, Next.js, backend, database, autentikasi, proses build, atau dependensi runtime eksternal.

Font Inter disematkan sebagai data URI di `css/fonts.css`. Berkas sumber `assets/fonts/inter-latin-var.woff2` dan lisensi SIL Open Font License disertakan di folder yang sama.

## Struktur Proyek

```text
DeTim/
├── index.html
├── README.md
├── assets/
│   ├── brand/
│   │   ├── logo.svg
│   │   └── logo-512.png
│   ├── fonts/
│   │   ├── inter-latin-var.woff2
│   │   └── OFL.txt
│   └── icons/
│       ├── apple-touch-icon.png
│       ├── favicon-32.png
│       └── favicon.svg
├── css/
│   ├── fonts.css                (font Inter tersemat)
│   ├── style.css                (token warna, tipografi, layout dasar)
│   ├── components.css           (komponen, dialog, toast, tampilan cetak)
│   └── responsive.css           (breakpoint, target sentuh, reduced motion)
├── js/
│   ├── storage.js               (LocalStorage, validasi, restore)
│   ├── grouping.js              (Fisher-Yates, pembagian, validasi jumlah)
│   ├── members.js               (normalisasi nama, duplikat, edit, hapus)
│   ├── history.js               (sesi, tanggal, upsert, hapus)
│   ├── export.js                (clipboard, TXT, tampilan cetak)
│   └── app.js                   (inisialisasi, render, event, tema)
├── Screenshot/
│   ├── 01-halaman-awal.png
│   ├── ...                      (26 tangkapan layar)
│   ├── 26-mobile-hasil.png
│   ├── PANDUAN.md               (panduan langkah demi langkah)
│   ├── index.html               (galeri screenshot)
│   └── shots.json               (metadata screenshot)
└── tests/
    └── core.test.cjs            (tes logika inti dengan Node.js)
```

## Pengujian

Tes logika inti dapat dijalankan dengan Node.js 20 atau lebih baru:

```bash
node tests/core.test.cjs
```

Saat ini: **26 passed, 0 failed**.

Tes tersebut mencakup:

- pengacakan dan seluruh kombinasi ukuran kelompok,
- validasi jumlah kelompok,
- normalisasi nama dan deteksi duplikat,
- edit dan hapus anggota,
- pembuatan, pembaruan, pembatasan 20 sesi, dan penghapusan riwayat,
- validasi data LocalStorage, data rusak, kuota penuh, dan penyimpanan tidak tersedia.

QA V1.0 juga menjalankan 39 skenario browser dengan Playwright dan Microsoft Edge. Cakupannya meliputi input massal, validasi, pembagian seimbang, acak ulang, nama kelompok kustom, edit dan hapus, undo, persistensi setelah reload, mode gelap, clipboard, unduhan TXT, cetak dan PDF, riwayat, reset, hapus semua data, data kedaluwarsa, penyimpanan rusak, kuota penuh, penyimpanan tidak tersedia, keamanan rendering, keyboard, serta tata letak responsif. Tidak ada error konsol atau error halaman pada pengujian HTTP maupun pembukaan langsung sebagai berkas lokal.

## Tema dan Aksesibilitas

- Mode gelap tetap didukung lewat token warna dan tema tersimpan, tanpa tombol tema di header.
- Palet V1.0 memakai tiga warna: `#930031` untuk warna utama, `#FFA500` untuk aksen, dan `#FFF2A7` untuk sorotan. Latar memakai turunan krem netral agar tampilan lebih tenang; mode gelap memakai turunan gelap dari palet yang sama.
- Warna mode gelap memakai token terpisah, bukan pembalikan warna otomatis.
- Semua tombol memiliki label yang jelas, termasuk tombol ikon.
- Navigasi keyboard didukung, termasuk skip link, fokus yang terlihat, edit anggota dan nama kelompok dengan Enter, serta Escape untuk membatalkan edit atau dialog.
- Perubahan status diumumkan melalui area `aria-live`.
- Kontras teks memenuhi WCAG AA pada pasangan warna utama di kedua tema. Batas kolom input, stepper jumlah kelompok, dan tombol sekunder memenuhi kontras non-teks 3:1.
- Pemeriksaan axe-core pada V1.0 menghasilkan 0 pelanggaran pada mode terang, mode gelap, dialog konfirmasi, dan tampilan mobile.
- Animasi dinonaktifkan atau dipersingkat saat pengguna mengaktifkan `prefers-reduced-motion`.
- Tata letak diuji pada lebar 320, 390, 768, 1024, dan 1440 piksel tanpa overflow horizontal. Target sentuh pada perangkat sentuh berukuran minimal 44 x 44 piksel.

## Batasan yang Diketahui

- Data tidak disinkronkan antarperangkat atau antarbrowser. Tidak ada akun atau cadangan cloud.
- Riwayat dibatasi 20 sesi. Sesi tertua otomatis dihapus saat batas terlampaui.
- Nama kelompok kustom dipertahankan berdasarkan posisi hanya jika jumlah kelompok saat acak ulang sama. Jika jumlah kelompok berubah, nama kembali ke nama default.
- Membuka sesi riwayat mengganti daftar anggota dan hasil yang sedang aktif. Nama yang masih ada di kolom input dan belum ditambahkan akan hilang.
- Penghapusan sesi aktif atau seluruh riwayat tidak menghapus hasil yang sedang tampil. Hasil tersebut tetap ada setelah halaman dimuat ulang, tetapi tidak lagi tercatat sebagai sesi riwayat.
- Clipboard dan dialog cetak bergantung pada izin serta dukungan browser. Jika clipboard diblokir, DeTim menampilkan pesan error dan tidak mengklaim berhasil.
- LocalStorage dapat dibatasi oleh mode privat, kebijakan browser, atau kuota perangkat.
- Pembukaan langsung melalui `file://` sudah diuji di Chromium. Sebagian browser lain dapat membatasi LocalStorage atau clipboard pada alamat berkas, sehingga server lokal lebih disarankan.
- Aksesibilitas telah diuji dengan axe-core dan alur keyboard, tetapi ini bukan audit sertifikasi WCAG formal.

## Lisensi Font

Font Inter dilisensikan di bawah SIL Open Font License 1.1. Teks lisensi tersedia di `assets/fonts/OFL.txt`.

## Versi

DeTim V1.0. Seluruh fitur dalam dokumen ini merupakan bagian dari rilis V1.0.
