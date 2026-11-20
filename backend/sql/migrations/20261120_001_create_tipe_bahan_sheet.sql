-- ====================================================================
-- MIGRATION: 20261120_001_create_tipe_bahan_sheet.sql
-- PROJECT  : CV. MAHARANI UNTUNG ABADI - PACKAGING ERP
-- DATE     : 2026-11-20
-- PURPOSE  : 
-- 1. Buat tabel `tipe_bahan_sheet` untuk pengelolaan jenis karton/flute (Duplex, Ivory, B/F, C/F, E/F, B/C, Kraft).
-- 2. Isi default master tipe bahan (Corrugated & Paperboard Solid).
-- 3. Perluas kolom `flute` pada tabel `bahan_baku_sheet` menjadi VARCHAR(50).
-- 4. Sinkronisasi kolom `kontak` pada tabel `suppliers`.
-- ====================================================================

-- 1. Buat Tabel Master Tipe Bahan Sheet jika belum ada
CREATE TABLE IF NOT EXISTS `tipe_bahan_sheet` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(30) NOT NULL UNIQUE,
  `nama_tipe` VARCHAR(100) NOT NULL,
  `kategori` VARCHAR(50) DEFAULT 'Corrugated',
  `keterangan` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Masukkan Default Data Tipe Bahan Sheet (Aman jika sudah ada karena menggunakan INSERT IGNORE)
INSERT IGNORE INTO `tipe_bahan_sheet` (`kode`, `nama_tipe`, `kategori`, `keterangan`) VALUES
('B/F', 'B-Flute Single Wall (~3mm)', 'Corrugated', 'Standard box pengiriman & packaging umum'),
('C/F', 'C-Flute Single Wall (~4mm)', 'Corrugated', 'Daya tumpuk kuat untuk beban berat'),
('E/F', 'E-Flute Micro Single Wall (~1.5mm)', 'Corrugated', 'Kotak pizza, kosmetik, hampers & dus die-cut halus'),
('B/C', 'B/C Double Wall Dua Gelombang (~7mm)', 'Corrugated', 'Dus sparepart mesin, buah ekspor & industri berat'),
('Duplex', 'Karton Duplex Coated (White/Grey)', 'Paperboard Solid', 'Box makanan/martabak, farmasi, dus sparepart (250-450 gsm)'),
('Ivory', 'Karton Ivory Food Grade (White Both Sides)', 'Paperboard Solid', 'Packaging makanan premium, kosmetik & dus obat steril'),
('Kraft', 'Kertas Kraft / Coklat Polos', 'Paperboard Solid', 'Paperbag, kardus coklat eco-friendly & layer penyekat');

-- 3. Perluas Panjang Kolom 'flute' pada tabel `bahan_baku_sheet` agar muat nama Duplex / Ivory / Custom
ALTER TABLE `bahan_baku_sheet` MODIFY COLUMN `flute` VARCHAR(50) DEFAULT 'B/F';

-- 4. Pastikan kolom 'kontak' pada tabel suppliers tersedia (jika database lama masih menggunakan nama pic)
-- ALTER TABLE `suppliers` ADD COLUMN IF NOT EXISTS `kontak` VARCHAR(100) AFTER `kategori`;
