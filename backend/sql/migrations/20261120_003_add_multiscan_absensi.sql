-- ====================================================================
-- SQL MIGRATION: Multi-Scan Presensi (Masuk, Istirahat, Pulang, Lembur)
-- Tanggal: 20 November 2026
-- Database: cv_maharani_db / kinq6231_cv-maharani
-- Deskripsi:
--   Mendukung pencatatan multi-tap mesin fingerprint atau manual HR:
--   1. Jam Masuk (08:00)
--   2. Keluar Istirahat (12:00)
--   3. Masuk Kembali dari Istirahat (13:00)
--   4. Jam Pulang Pokok (16:00 / 17:00)
--   5. Jam Selesai Lembur (19:30 / 20:00)
--   6. Total Jam Kerja Efektif & Jam Lembur Otomatis
-- ====================================================================

-- Tambah kolom jam keluar istirahat (break-out)
ALTER TABLE absensi ADD COLUMN jam_istirahat_keluar TIME DEFAULT NULL;

-- Tambah kolom jam masuk kembali dari istirahat (break-in)
ALTER TABLE absensi ADD COLUMN jam_istirahat_masuk TIME DEFAULT NULL;

-- Tambah kolom jam selesai lembur (overtime-out)
ALTER TABLE absensi ADD COLUMN jam_lembur_selesai TIME DEFAULT NULL;

-- Tambah kolom total jam kerja efektif bersih (tidak termasuk jam istirahat)
ALTER TABLE absensi ADD COLUMN total_jam_kerja DECIMAL(4,1) DEFAULT 8.0;
