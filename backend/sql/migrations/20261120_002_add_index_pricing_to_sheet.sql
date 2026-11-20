-- ====================================================================
-- MIGRATION: 20261120_002_add_index_pricing_to_sheet.sql
-- PROJECT  : CV. MAHARANI UNTUNG ABADI - PACKAGING ERP
-- DATE     : 2026-11-20
-- PURPOSE  : 
-- 1. Tambah kolom `nilai_index` dan `metode_index` pada tabel `bahan_baku_sheet`
--    untuk menyimpan parameter index harga supplier (Rp/m2 atau Rp/kg).
-- ====================================================================

-- 1. Tambah kolom nilai_index jika belum ada
ALTER TABLE `bahan_baku_sheet` 
  ADD COLUMN IF NOT EXISTS `nilai_index` DECIMAL(10,2) DEFAULT NULL AFTER `harga_per_lembar`,
  ADD COLUMN IF NOT EXISTS `metode_index` VARCHAR(30) DEFAULT NULL AFTER `nilai_index`;
