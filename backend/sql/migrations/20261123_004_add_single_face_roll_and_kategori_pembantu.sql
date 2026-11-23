-- ====================================================================
-- SQL MIGRATION: Single Face Roll, Roll Joint, & Kategori Bahan Pembantu
-- Tanggal: 23 November 2026
-- Database: cv_maharani_db / kinq6231_cv-maharani
-- Deskripsi:
--   1. Memperluas jenis_barang pada tabel products menjadi VARCHAR(50)
--      agar mendukung tipe 'Single Face Roll' (kemasan gulungan).
--   2. Memperluas jenis_sambungan pada tabel products menjadi VARCHAR(50)
--      agar mendukung tipe 'Roll' dan variasi sambungan lainnya.
--   3. Menambahkan kolom berat_roll_kg (berat 1 roll dalam Kg) dan
--      harga_per_kg (harga jual per Kg) pada tabel products.
--   4. Mengubah kolom kategori pada bahan_pembantu menjadi VARCHAR(100)
--      agar fleksibel mendukung penambahan kategori baru tanpa batas ENUM.
--   5. Membuat tabel master kategori_bahan_pembantu untuk mengelola
--      kategori bahan penolong pabrik (Tinta, Lem, Kawat, Pisau Pond, Plat Polimer, dll).
-- ====================================================================

-- 1. Modifikasi tabel products
ALTER TABLE products MODIFY COLUMN jenis_barang VARCHAR(50) DEFAULT 'Box';
ALTER TABLE products MODIFY COLUMN jenis_sambungan VARCHAR(50) DEFAULT 'Stitching';

-- Tambah kolom berat roll dan harga per kg pada tabel products jika belum ada
ALTER TABLE products ADD COLUMN IF NOT EXISTS berat_roll_kg DECIMAL(10,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS harga_per_kg DECIMAL(15,2) DEFAULT 0;

-- 2. Modifikasi tabel bahan_pembantu
ALTER TABLE bahan_pembantu MODIFY COLUMN kategori VARCHAR(100) DEFAULT 'Tinta Flexo';

-- 3. Pembuatan tabel master kategori_bahan_pembantu
CREATE TABLE IF NOT EXISTS kategori_bahan_pembantu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL UNIQUE,
  keterangan VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed kategori awal bahan pembantu
INSERT IGNORE INTO kategori_bahan_pembantu (nama_kategori, keterangan) VALUES
('Tinta Flexo', 'Tinta cetak flexography waterbased'),
('Lem Karton', 'Lem poly / dextrin / perekat sambungan flap dus'),
('Kawat Stitching', 'Kawat jahit stapler karton box'),
('Tali Strapping', 'Tali strapping band ikat per 25 pcs'),
('Lakban/Isolasi', 'Opp tape lakban packaging & segel'),
('Pisau Pond & Rotary', 'Pisau die-cut pond dan slitter mesin'),
('Plat Polimer Cetak', 'Plat cetak karet / cyrel cetak flexo');
