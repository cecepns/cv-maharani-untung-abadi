-- ====================================================================
-- SQL MIGRATION: Sinkronisasi Kolom Produksi Ikat & Skema Upah Harian
-- Tanggal: 24 November 2026
-- Database: cv_maharani_db / kinq6231_cv-maharani
-- Deskripsi:
--   1. Memperbaiki dan menyelaraskan kolom tabel produksi_ikat:
--      - Menambahkan kolom nomor_ikat, catatan, jumlah_ikat, total_barang_jadi,
--        total_ikat, total_pcs, dan isi_per_ikat agar kompatibel menyeluruh
--        antara format laporan gudang FG dan modul input produksi strapping.
--      - Menyelaraskan data lama agar nilai ikat & unit jadi sinkron.
--   2. Menambahkan skema Upah Harian pada modul Payroll & Karyawan:
--      - Menambahkan kolom tipe_gaji ('Bulanan' / 'Harian') pada tabel karyawan.
--      - Menambahkan kolom upah_harian (tarif per hari kerja) pada tabel karyawan.
--      - Menambahkan kolom tipe_gaji dan upah_harian pada tabel slip_gaji
--        agar penghitungan slip gaji transparan (Hari Kerja x Upah Harian).
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. SINKRONISASI TABEL: produksi_ikat
-- --------------------------------------------------------------------

-- Tambah kolom nomor_ikat jika belum ada
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS nomor_ikat VARCHAR(50) DEFAULT NULL;

-- Tambah kolom catatan jika belum ada
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS catatan TEXT DEFAULT NULL;

-- Tambah kolom jumlah_ikat dan total_ikat (mendukung kedua standar penamaan)
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS jumlah_ikat INT DEFAULT 0;
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS total_ikat INT DEFAULT 0;

-- Tambah kolom total_barang_jadi dan total_pcs
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS total_barang_jadi INT DEFAULT 0;
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS total_pcs INT DEFAULT 0;

-- Tambah kolom isi_per_ikat jika belum ada
ALTER TABLE produksi_ikat ADD COLUMN IF NOT EXISTS isi_per_ikat INT DEFAULT 25;

-- Sinkronisasi data lama antar kolom alias
UPDATE produksi_ikat 
SET jumlah_ikat = total_ikat 
WHERE (jumlah_ikat IS NULL OR jumlah_ikat = 0) AND total_ikat > 0;

UPDATE produksi_ikat 
SET total_ikat = jumlah_ikat 
WHERE (total_ikat IS NULL OR total_ikat = 0) AND jumlah_ikat > 0;

UPDATE produksi_ikat 
SET total_barang_jadi = total_pcs 
WHERE (total_barang_jadi IS NULL OR total_barang_jadi = 0) AND total_pcs > 0;

UPDATE produksi_ikat 
SET total_pcs = total_barang_jadi 
WHERE (total_pcs IS NULL OR total_pcs = 0) AND total_barang_jadi > 0;

UPDATE produksi_ikat 
SET nomor_ikat = CONCAT('IKAT-', LPAD(id, 6, '0')) 
WHERE nomor_ikat IS NULL OR nomor_ikat = '';


-- --------------------------------------------------------------------
-- 2. SINKRONISASI TABEL: karyawan & slip_gaji (SKEMA UPAH HARIAN)
-- --------------------------------------------------------------------

-- Tambah kolom tipe_gaji dan upah_harian pada tabel karyawan
ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS tipe_gaji VARCHAR(20) DEFAULT 'Bulanan';
ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS upah_harian DECIMAL(15,2) DEFAULT 0;

-- Set upah_harian default untuk karyawan yang sudah terdaftar (berdasarkan gaji pokok / 25 hari kerja)
UPDATE karyawan 
SET upah_harian = ROUND(gaji_pokok / 25) 
WHERE (upah_harian IS NULL OR upah_harian = 0) AND gaji_pokok > 0;

-- Tambah kolom tipe_gaji dan upah_harian pada tabel slip_gaji
ALTER TABLE slip_gaji ADD COLUMN IF NOT EXISTS tipe_gaji VARCHAR(20) DEFAULT 'Bulanan';
ALTER TABLE slip_gaji ADD COLUMN IF NOT EXISTS upah_harian DECIMAL(15,2) DEFAULT 0;

-- Sinkronisasi data historis slip_gaji
UPDATE slip_gaji 
SET upah_harian = ROUND(gaji_pokok / hari_kerja) 
WHERE (upah_harian IS NULL OR upah_harian = 0) AND hari_kerja > 0 AND gaji_pokok > 0;
