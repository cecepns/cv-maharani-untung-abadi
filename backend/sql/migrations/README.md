# 🗄️ Database Migrations - CV. Maharani Untung Abadi

Folder ini berisi berkas SQL Migration bertahap untuk memperbarui skema database MySQL pada database yang sudah berjalan (production / staging) **tanpa menghapus (drop) data yang sudah ada**.

---

## 📋 Daftar Migration

| File | Tanggal | Deskripsi |
| :--- | :---: | :--- |
| [`20261120_001_create_tipe_bahan_sheet.sql`](./20261120_001_create_tipe_bahan_sheet.sql) | 20 Nov 2026 | - Membuat tabel master `tipe_bahan_sheet`<br>- Menambahkan default tipe (`B/F`, `C/F`, `E/F`, `B/C`, `Duplex`, `Ivory`, `Kraft`)<br>- Memperluas kolom `flute` pada `bahan_baku_sheet` menjadi `VARCHAR(50)` |
| [`20261120_002_add_index_pricing_to_sheet.sql`](./20261120_002_add_index_pricing_to_sheet.sql) | 20 Nov 2026 | - Menambahkan kolom `nilai_index` dan `metode_index` pada tabel `bahan_baku_sheet` untuk mencatat formula kalkulasi harga sheet supplier |
| [`20261120_003_add_multiscan_absensi.sql`](./20261120_003_add_multiscan_absensi.sql) | 20 Nov 2026 | - Menambahkan kolom multi-scan pada tabel `absensi` (`jam_istirahat_keluar`, `jam_istirahat_masuk`, `jam_lembur_selesai`, `total_jam_kerja`) untuk mengakomodasi alur absen masuk, istirahat, pulang, dan lembur |
| [`20261123_004_add_single_face_roll_and_kategori_pembantu.sql`](./20261123_004_add_single_face_roll_and_kategori_pembantu.sql) | 23 Nov 2026 | - Memperluas `jenis_barang` pada tabel `products` (`VARCHAR(50)`) untuk mendukung 'Single Face Roll'<br>- Memperluas `jenis_sambungan` pada tabel `products` (`VARCHAR(50)`) untuk mendukung 'Roll'<br>- Menambahkan kolom `berat_roll_kg` dan `harga_per_kg` pada tabel `products`<br>- Mengubah kolom `kategori` pada tabel `bahan_pembantu` menjadi `VARCHAR(100)`<br>- Membuat tabel master `kategori_bahan_pembantu` beserta data seed awal |

---

## 🚀 Cara Menjalankan Migration

### Opsi 1: Melalui phpMyAdmin / cPanel
1. Buka **phpMyAdmin** dan pilih database `kinq6231_cv-maharani` atau database yang aktif.
2. Klik tab **SQL** atau **Import**.
3. Buka berkas migration `.sql` terkait, copy isinya, lalu klik **Go / Kirim**.

### Opsi 2: Melalui MySQL Terminal / CLI
```bash
mysql -u root -p kinq6231_cv-maharani < backend/sql/migrations/20261120_001_create_tipe_bahan_sheet.sql
```

### Opsi 3: Otomatis oleh Backend Server
Server [backend/server.js](../server.js) telah dilengkapi fitur *Auto-Migration* saat startup: ketika server pertama kali dijalankan, sistem otomatis mendeteksi dan mengeksekusi pembuatan tabel `tipe_bahan_sheet` dan seeding default jika tabel belum tersedia.

---

> 💡 **Catatan**: Untuk inisialisasi database baru dari nol (fresh install), gunakan berkas skema lengkap di [`backend/sql/database.sql`](../database.sql).
