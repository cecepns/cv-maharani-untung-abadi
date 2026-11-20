# 🗄️ Database Migrations - CV. Maharani Untung Abadi

Folder ini berisi berkas SQL Migration bertahap untuk memperbarui skema database MySQL pada database yang sudah berjalan (production / staging) **tanpa menghapus (drop) data yang sudah ada**.

---

## 📋 Daftar Migration

| File | Tanggal | Deskripsi |
| :--- | :---: | :--- |
| [`20261120_001_create_tipe_bahan_sheet.sql`](./20261120_001_create_tipe_bahan_sheet.sql) | 20 Nov 2026 | - Membuat tabel master `tipe_bahan_sheet`<br>- Menambahkan default tipe (`B/F`, `C/F`, `E/F`, `B/C`, `Duplex`, `Ivory`, `Kraft`)<br>- Memperluas kolom `flute` pada `bahan_baku_sheet` menjadi `VARCHAR(50)` |

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
