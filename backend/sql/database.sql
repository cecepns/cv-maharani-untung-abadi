-- ========================================================
-- DATABASE: cv_maharani_db
-- SYSTEM: CV. Maharani Untung Abadi ERP (Packaging & Corrugated Box)
-- ========================================================

CREATE DATABASE IF NOT EXISTS cv_maharani_db;
USE cv_maharani_db;

-- --------------------------------------------------------
-- 0. USER MANAGEMENT & HAK AKSES ADMIN
-- --------------------------------------------------------

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  role ENUM('Superadmin', 'Admin Marketing', 'Admin Gudang', 'Admin Produksi', 'Admin Finance & Accounting', 'Admin HRD') DEFAULT 'Admin Produksi',
  departemen VARCHAR(100) DEFAULT 'Produksi',
  status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 1. MARKETING & MASTER BARANG PACKAGING
-- --------------------------------------------------------

DROP TABLE IF EXISTS retur_penjualan;
DROP TABLE IF EXISTS faktur_pajak;
DROP TABLE IF EXISTS pembayaran_piutang;
DROP TABLE IF EXISTS sales_invoices;
DROP TABLE IF EXISTS surat_jalan_items;
DROP TABLE IF EXISTS surat_jalan;
DROP TABLE IF EXISTS sales_order_items;
DROP TABLE IF EXISTS sales_orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS sales_persons;

CREATE TABLE sales_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_sales VARCHAR(20) NOT NULL UNIQUE,
  nama_sales VARCHAR(100) NOT NULL,
  telepon VARCHAR(20),
  target_omset DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_customer VARCHAR(20) NOT NULL UNIQUE,
  nama_customer VARCHAR(150) NOT NULL,
  pic VARCHAR(100),
  telepon VARCHAR(30),
  email VARCHAR(100),
  alamat TEXT,
  termin_bayar VARCHAR(30) DEFAULT '30 Hari',
  plafon_kredit DECIMAL(15,2) DEFAULT 50000000,
  npwp VARCHAR(40),
  status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_barang VARCHAR(30) NOT NULL UNIQUE,
  nama_barang VARCHAR(150) NOT NULL,
  jenis_barang ENUM('Box', 'Sheet') DEFAULT 'Box',
  tipe_flute VARCHAR(30) DEFAULT 'B/F', -- B/F, C/F, E/F, B/C Double Wall
  substansi VARCHAR(60) DEFAULT 'K125/M125/K125', -- K: Kraft, M: Medium, WK: White Kraft
  panjang_mm INT DEFAULT 0,
  lebar_mm INT DEFAULT 0,
  tinggi_mm INT DEFAULT 0,
  jenis_sambungan VARCHAR(50) DEFAULT 'Stitching', -- Stitching, Glue, Die-cut
  stok_qty INT DEFAULT 0,
  satuan VARCHAR(20) DEFAULT 'Pcs',
  harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
  min_stok INT DEFAULT 100,
  gambar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_so VARCHAR(30) NOT NULL UNIQUE,
  tanggal_so DATE NOT NULL,
  customer_id INT NOT NULL,
  sales_id INT,
  catatan TEXT,
  status ENUM('Draft', 'Disetujui/SPK', 'Diproses', 'Selesai', 'Batal') DEFAULT 'Disetujui/SPK',
  subtotal DECIMAL(15,2) DEFAULT 0,
  ppn DECIMAL(15,2) DEFAULT 0,
  total_nilai DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (sales_id) REFERENCES sales_persons(id) ON DELETE SET NULL
);

CREATE TABLE sales_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  so_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL,
  harga_satuan DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  spek_khusus TEXT,
  FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE surat_jalan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_sj VARCHAR(30) NOT NULL UNIQUE,
  so_id INT NOT NULL,
  tanggal_kirim DATE NOT NULL,
  no_kendaraan VARCHAR(20),
  nama_supir VARCHAR(100),
  status ENUM('Pending', 'Dikirim', 'Diterima Customer') DEFAULT 'Dikirim',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE RESTRICT
);

CREATE TABLE surat_jalan_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sj_id INT NOT NULL,
  product_id INT NOT NULL,
  qty_kirim INT NOT NULL,
  keterangan VARCHAR(200),
  FOREIGN KEY (sj_id) REFERENCES surat_jalan(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE sales_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_invoice VARCHAR(30) NOT NULL UNIQUE,
  so_id INT,
  customer_id INT NOT NULL,
  tanggal_invoice DATE NOT NULL,
  jatuh_tempo DATE NOT NULL,
  subtotal DECIMAL(15,2) DEFAULT 0,
  ppn DECIMAL(15,2) DEFAULT 0,
  total_tagihan DECIMAL(15,2) DEFAULT 0,
  sudah_dibayar DECIMAL(15,2) DEFAULT 0,
  sisa_tagihan DECIMAL(15,2) DEFAULT 0,
  status_bayar ENUM('Belum Lunas', 'Lunas', 'Jatuh Tempo') DEFAULT 'Belum Lunas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE faktur_pajak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_faktur VARCHAR(40) NOT NULL UNIQUE,
  invoice_id INT NOT NULL,
  customer_id INT NOT NULL,
  tanggal_faktur DATE NOT NULL,
  dpp DECIMAL(15,2) NOT NULL,
  ppn DECIMAL(15,2) NOT NULL,
  status ENUM('Draft', 'Disetujui') DEFAULT 'Disetujui',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE retur_penjualan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_retur VARCHAR(30) NOT NULL UNIQUE,
  invoice_id INT NOT NULL,
  customer_id INT NOT NULL,
  product_id INT NOT NULL,
  tanggal_retur DATE NOT NULL,
  qty INT NOT NULL,
  alasan TEXT,
  status ENUM('Pending', 'Disetujui', 'Selesai') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 2. PEMBELIAN & BAHAN BAKU
-- --------------------------------------------------------

DROP TABLE IF EXISTS retur_pembelian;
DROP TABLE IF EXISTS pembayaran_hutang;
DROP TABLE IF EXISTS nota_pembelian;
DROP TABLE IF EXISTS lpb_items;
DROP TABLE IF EXISTS laporan_penerimaan_barang;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS bahan_pembantu;
DROP TABLE IF EXISTS bahan_baku_sheet;
DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_supplier VARCHAR(20) NOT NULL UNIQUE,
  nama_supplier VARCHAR(150) NOT NULL,
  kategori ENUM('Sheet Kertas', 'Tinta Flexo', 'Lem & Kawat', 'Packaging & Logistik') DEFAULT 'Sheet Kertas',
  kontak VARCHAR(100),
  telepon VARCHAR(30),
  email VARCHAR(100),
  alamat TEXT,
  termin_bayar VARCHAR(30) DEFAULT '30 Hari',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bahan_baku_sheet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_sheet VARCHAR(30) NOT NULL UNIQUE,
  nama_sheet VARCHAR(150) NOT NULL,
  supplier_id INT,
  flute VARCHAR(20) DEFAULT 'B/F',
  substansi VARCHAR(60) DEFAULT 'K125/M125/K125',
  panjang_mm INT NOT NULL,
  lebar_mm INT NOT NULL,
  stok_lembar INT DEFAULT 0,
  satuan VARCHAR(20) DEFAULT 'Lembar',
  harga_per_lembar DECIMAL(15,2) DEFAULT 0,
  min_stok INT DEFAULT 500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE bahan_pembantu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_bahan VARCHAR(30) NOT NULL UNIQUE,
  nama_bahan VARCHAR(150) NOT NULL,
  kategori ENUM('Tinta Flexo', 'Lem Karton', 'Kawat Stitching', 'Tali Strapping', 'Lakban/Isolasi') DEFAULT 'Tinta Flexo',
  satuan VARCHAR(20) DEFAULT 'Kg',
  stok DECIMAL(12,2) DEFAULT 0,
  harga_satuan DECIMAL(15,2) DEFAULT 0,
  min_stok DECIMAL(12,2) DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_po VARCHAR(30) NOT NULL UNIQUE,
  supplier_id INT NOT NULL,
  tanggal_po DATE NOT NULL,
  status ENUM('Draft', 'Disetujui', 'Selesai', 'Batal') DEFAULT 'Disetujui',
  total_nilai DECIMAL(15,2) DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE purchase_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  item_type ENUM('Sheet', 'BahanPembantu') DEFAULT 'Sheet',
  item_id INT NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  harga_satuan DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

CREATE TABLE laporan_penerimaan_barang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_lpb VARCHAR(30) NOT NULL UNIQUE,
  po_id INT NOT NULL,
  supplier_id INT NOT NULL,
  tanggal_terima DATE NOT NULL,
  no_sj_supplier VARCHAR(50),
  nama_penerima VARCHAR(100),
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE lpb_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lpb_id INT NOT NULL,
  item_type ENUM('Sheet', 'BahanPembantu') DEFAULT 'Sheet',
  item_id INT NOT NULL,
  item_name VARCHAR(150),
  qty_terima DECIMAL(12,2) NOT NULL,
  kondisi VARCHAR(50) DEFAULT 'Baik',
  FOREIGN KEY (lpb_id) REFERENCES laporan_penerimaan_barang(id) ON DELETE CASCADE
);

CREATE TABLE nota_pembelian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_faktur_beli VARCHAR(30) NOT NULL UNIQUE,
  po_id INT,
  supplier_id INT NOT NULL,
  tanggal_faktur DATE NOT NULL,
  jatuh_tempo DATE NOT NULL,
  total_tagihan DECIMAL(15,2) DEFAULT 0,
  sudah_dibayar DECIMAL(15,2) DEFAULT 0,
  sisa_tagihan DECIMAL(15,2) DEFAULT 0,
  status_bayar ENUM('Belum Lunas', 'Lunas', 'Jatuh Tempo') DEFAULT 'Belum Lunas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE retur_pembelian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_retur_beli VARCHAR(30) NOT NULL UNIQUE,
  po_id INT,
  supplier_id INT NOT NULL,
  tanggal_retur DATE NOT NULL,
  alasan TEXT,
  total_nilai DECIMAL(15,2) DEFAULT 0,
  status ENUM('Pending', 'Disetujui', 'Selesai') DEFAULT 'Disetujui',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 3. GUDANG & MUTASI
-- --------------------------------------------------------

DROP TABLE IF EXISTS mutasi_stok;

CREATE TABLE mutasi_stok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATE NOT NULL,
  tipe_barang ENUM('Sheet', 'BahanPembantu', 'BarangJadi') NOT NULL,
  barang_id INT NOT NULL,
  nama_barang VARCHAR(150) NOT NULL,
  jenis_mutasi ENUM('Masuk', 'Keluar') NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  referensi_dokumen VARCHAR(50),
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- 4. PPIC & PRODUKSI CORRUGATED
-- --------------------------------------------------------

DROP TABLE IF EXISTS produksi_ikat;
DROP TABLE IF EXISTS produksi_finishing;
DROP TABLE IF EXISTS produksi_cetak;
DROP TABLE IF EXISTS spk_produksi;

CREATE TABLE spk_produksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_spk VARCHAR(30) NOT NULL UNIQUE,
  so_id INT,
  customer_nama VARCHAR(150) NOT NULL,
  nama_box VARCHAR(150) NOT NULL,
  ukuran_box VARCHAR(100) NOT NULL,
  sheet_id INT,
  qty_target INT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  target_selesai DATE NOT NULL,
  desain_cetak VARCHAR(100) DEFAULT '1 Warna Flexo',
  pisau_pond VARCHAR(100) DEFAULT 'Standard Slotter',
  tahapan_sekarang ENUM('Menunggu', 'Cetak', 'Finishing', 'Ikat', 'Selesai') DEFAULT 'Cetak',
  status ENUM('Berjalan', 'Selesai', 'Tertunda') DEFAULT 'Berjalan',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sheet_id) REFERENCES bahan_baku_sheet(id) ON DELETE SET NULL
);

CREATE TABLE produksi_cetak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spk_id INT NOT NULL,
  tanggal_proses DATE NOT NULL,
  mesin_cetak VARCHAR(50) DEFAULT 'Flexo 2 Warna Line 1',
  operator_nama VARCHAR(100) NOT NULL,
  warna_tinta VARCHAR(100) DEFAULT 'Hitam & Merah',
  qty_masuk INT NOT NULL,
  qty_bagus INT NOT NULL,
  qty_reject INT DEFAULT 0,
  status ENUM('Proses', 'Selesai') DEFAULT 'Selesai',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spk_id) REFERENCES spk_produksi(id) ON DELETE CASCADE
);

CREATE TABLE produksi_finishing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spk_id INT NOT NULL,
  tanggal_proses DATE NOT NULL,
  jenis_finishing ENUM('Slitter & Creasing', 'Rotary Die-Cut / Pond', 'Stitching Kawat', 'Gluing / Lem') DEFAULT 'Stitching Kawat',
  operator_nama VARCHAR(100) NOT NULL,
  mesin VARCHAR(50) DEFAULT 'Stitching 2 Kepala',
  qty_masuk INT NOT NULL,
  qty_bagus INT NOT NULL,
  qty_reject INT DEFAULT 0,
  status ENUM('Proses', 'Selesai') DEFAULT 'Selesai',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spk_id) REFERENCES spk_produksi(id) ON DELETE CASCADE
);

CREATE TABLE produksi_ikat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spk_id INT NOT NULL,
  tanggal_proses DATE NOT NULL,
  operator_nama VARCHAR(100) NOT NULL,
  isi_per_ikat INT DEFAULT 25,
  jumlah_ikat INT DEFAULT 0,
  total_barang_jadi INT NOT NULL,
  status ENUM('Proses', 'Selesai') DEFAULT 'Selesai',
  serah_terima_gudang BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spk_id) REFERENCES spk_produksi(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 5. HUTANG & PIUTANG (AP / AR)
-- --------------------------------------------------------

CREATE TABLE pembayaran_piutang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_bukti VARCHAR(30) NOT NULL UNIQUE,
  invoice_id INT NOT NULL,
  customer_id INT NOT NULL,
  tanggal_bayar DATE NOT NULL,
  metode_bayar ENUM('Transfer BCA', 'Transfer Mandiri', 'Kas Tunai', 'Giro') DEFAULT 'Transfer BCA',
  jumlah_bayar DECIMAL(15,2) NOT NULL,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

CREATE TABLE pembayaran_hutang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_bukti VARCHAR(30) NOT NULL UNIQUE,
  faktur_beli_id INT NOT NULL,
  supplier_id INT NOT NULL,
  tanggal_bayar DATE NOT NULL,
  metode_bayar ENUM('Transfer BCA', 'Transfer Mandiri', 'Kas Tunai', 'Giro') DEFAULT 'Transfer BCA',
  jumlah_bayar DECIMAL(15,2) NOT NULL,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faktur_beli_id) REFERENCES nota_pembelian(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 6. KAS / BANK & JURNAL UMUM
-- --------------------------------------------------------

DROP TABLE IF EXISTS jurnal_items;
DROP TABLE IF EXISTS jurnal_transaksi;
DROP TABLE IF EXISTS chart_of_accounts;

CREATE TABLE chart_of_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_akun VARCHAR(20) NOT NULL UNIQUE,
  nama_akun VARCHAR(100) NOT NULL,
  kategori ENUM('Kas & Bank', 'Piutang Usaha', 'Persediaan', 'Aktiva Tetap', 'Hutang Usaha', 'Modal', 'Pendapatan', 'HPP', 'Beban Operasional') NOT NULL,
  saldo_normal ENUM('Debet', 'Kredit') DEFAULT 'Debet',
  saldo_berjalan DECIMAL(15,2) DEFAULT 0
);

CREATE TABLE jurnal_transaksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_jurnal VARCHAR(30) NOT NULL UNIQUE,
  tanggal DATE NOT NULL,
  tipe_jurnal ENUM('Kas Masuk', 'Kas Keluar', 'Bank Masuk', 'Bank Keluar', 'Memorial') NOT NULL,
  keterangan TEXT NOT NULL,
  total_debet DECIMAL(15,2) DEFAULT 0,
  total_kredit DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jurnal_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jurnal_id INT NOT NULL,
  akun_id INT NOT NULL,
  posisi ENUM('Debet', 'Kredit') NOT NULL,
  nominal DECIMAL(15,2) NOT NULL,
  keterangan VARCHAR(200),
  FOREIGN KEY (jurnal_id) REFERENCES jurnal_transaksi(id) ON DELETE CASCADE,
  FOREIGN KEY (akun_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- 7. AKTIVA TETAP
-- --------------------------------------------------------

DROP TABLE IF EXISTS penyusutan_aktiva;
DROP TABLE IF EXISTS aktiva_tetap;

CREATE TABLE aktiva_tetap (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_aktiva VARCHAR(30) NOT NULL UNIQUE,
  nama_aktiva VARCHAR(150) NOT NULL,
  kategori VARCHAR(50) DEFAULT 'Mesin Pabrik',
  tanggal_perolehan DATE NOT NULL,
  harga_perolehan DECIMAL(15,2) NOT NULL,
  umur_ekonomis_tahun INT DEFAULT 5,
  nilai_residu DECIMAL(15,2) DEFAULT 0,
  akumulasi_penyusutan DECIMAL(15,2) DEFAULT 0,
  nilai_buku DECIMAL(15,2) NOT NULL,
  status ENUM('Aktif', 'Rusak', 'Dijual') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE penyusutan_aktiva (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aktiva_id INT NOT NULL,
  periode_bulan VARCHAR(10) NOT NULL, -- e.g. 2026-11
  beban_penyusutan_bulanan DECIMAL(15,2) NOT NULL,
  akumulasi_sampai_periode DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aktiva_id) REFERENCES aktiva_tetap(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 8. PAYROLL & KARYAWAN
-- --------------------------------------------------------

DROP TABLE IF EXISTS slip_gaji;
DROP TABLE IF EXISTS payroll_periode;
DROP TABLE IF EXISTS absensi;
DROP TABLE IF EXISTS karyawan;

CREATE TABLE karyawan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nik VARCHAR(20) NOT NULL UNIQUE,
  nama_lengkap VARCHAR(150) NOT NULL,
  jabatan VARCHAR(100) NOT NULL,
  departemen ENUM('Produksi', 'Gudang', 'Marketing', 'Purchasing', 'Finance & Accounting', 'HRD & Umum') DEFAULT 'Produksi',
  status_karyawan ENUM('Tetap', 'Kontrak') DEFAULT 'Tetap',
  no_hp VARCHAR(20),
  no_rekening VARCHAR(50),
  bank VARCHAR(30) DEFAULT 'BCA',
  gaji_pokok DECIMAL(15,2) DEFAULT 4500000,
  tunjangan_jabatan DECIMAL(15,2) DEFAULT 500000,
  uang_makan_perhari DECIMAL(15,2) DEFAULT 25000,
  tarif_lembur_perjam DECIMAL(15,2) DEFAULT 25000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  karyawan_id INT NOT NULL,
  nik VARCHAR(20),
  tanggal DATE NOT NULL,
  status_kehadiran ENUM('Hadir', 'Izin', 'Sakit', 'Alpha') DEFAULT 'Hadir',
  jam_masuk TIME DEFAULT '08:00:00',
  jam_pulang TIME DEFAULT '17:00:00',
  jam_lembur DECIMAL(4,1) DEFAULT 0,
  metode ENUM('Mesin Fingerprint', 'Manual HR') DEFAULT 'Mesin Fingerprint',
  catatan VARCHAR(200),
  FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE CASCADE
);

CREATE TABLE payroll_periode (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_payroll VARCHAR(30) NOT NULL UNIQUE,
  periode_bulan VARCHAR(10) NOT NULL, -- e.g. '2026-11'
  total_karyawan INT DEFAULT 0,
  total_gaji_dibayar DECIMAL(15,2) DEFAULT 0,
  status ENUM('Draft', 'Disetujui', 'Dibayar') DEFAULT 'Dibayar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slip_gaji (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payroll_id INT NOT NULL,
  karyawan_id INT NOT NULL,
  hari_kerja INT DEFAULT 24,
  jam_lembur INT DEFAULT 0,
  gaji_pokok DECIMAL(15,2) NOT NULL,
  tunjangan DECIMAL(15,2) DEFAULT 0,
  uang_makan DECIMAL(15,2) DEFAULT 0,
  upah_lembur DECIMAL(15,2) DEFAULT 0,
  potongan_bpjs DECIMAL(15,2) DEFAULT 0,
  potongan_absen DECIMAL(15,2) DEFAULT 0,
  total_gaji_bersih DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (payroll_id) REFERENCES payroll_periode(id) ON DELETE CASCADE,
  FOREIGN KEY (karyawan_id) REFERENCES karyawan(id) ON DELETE RESTRICT
);

-- ========================================================
-- SEED DATA REALISTIS CV. MAHARANI UNTUNG ABADI
-- ========================================================

-- Akun User Admin ERP
INSERT INTO users (id, username, password, nama_lengkap, email, role, departemen, status) VALUES
(1, 'admin', 'admin', 'Cecep / Super Admin', 'admin@cvmaharani.com', 'Superadmin', 'Manajemen', 'Aktif'),
(2, 'marketing1', 'password123', 'Budi Santoso', 'budi.sales@cvmaharani.com', 'Admin Marketing', 'Marketing', 'Aktif'),
(3, 'gudang1', 'password123', 'Maman Suratman', 'maman.gudang@cvmaharani.com', 'Admin Gudang', 'Gudang', 'Aktif'),
(4, 'produksi1', 'password123', 'Mulyadi Pratama', 'mulyadi.ppic@cvmaharani.com', 'Admin Produksi', 'Produksi', 'Aktif'),
(5, 'finance1', 'password123', 'Siti Rahmawati', 'siti.finance@cvmaharani.com', 'Admin Finance & Accounting', 'Finance & Accounting', 'Aktif'),
(6, 'hrd1', 'password123', 'Dewi Lestari', 'dewi.hrd@cvmaharani.com', 'Admin HRD', 'HRD & Personalia', 'Aktif');

-- Sales Persons
INSERT INTO sales_persons (kode_sales, nama_sales, telepon, target_omset) VALUES
('SLS-001', 'Budi Santoso', '0812-3456-7890', 250000000),
('SLS-002', 'Dewi Lestari', '0813-8899-7711', 200000000),
('SLS-003', 'Hendra Gunawan', '0819-2233-4455', 180000000);

-- Customers
INSERT INTO customers (kode_customer, nama_customer, pic, telepon, email, alamat, termin_bayar, plafon_kredit, npwp, status) VALUES
('CUST-001', 'PT. Indofood Sukses Makmur Tbk', 'Pak Bambang', '021-57958822', 'procurement@indofood.co.id', 'Kawasan Industri MM2100, Cikarang Barat, Bekasi', '30 Hari', 150000000, '01.321.456.7-011.000', 'Aktif'),
('CUST-002', 'PT. Mayora Indah Tbk', 'Ibu Ratna', '021-80637000', 'purchasing@mayora.co.id', 'Jl. Tomang Raya No. 21-23, Jakarta Barat', '30 Hari', 120000000, '01.445.678.9-012.000', 'Aktif'),
('CUST-003', 'CV. Aneka Snack Nusantara', 'Ko Kevin', '0811-2345-6789', 'anekasnack@gmail.com', 'Jl. Industri Rungkut No. 45, Surabaya', '14 Hari', 40000000, '02.556.789.1-013.000', 'Aktif'),
('CUST-004', 'PT. Ultra Sakti (Freshcare)', 'Ibu Diana', '021-58302211', 'diana@ultrasakti.com', 'Kawasan Industri Pulogadung, Jakarta Timur', '30 Hari', 90000000, '01.667.890.2-014.000', 'Aktif'),
('CUST-005', 'UD. Berkah Tani Organik', 'H. Sulaeman', '0812-9988-7766', 'berkahtani@yahoo.com', 'Jl. Raya Subang KM 12, Subang', 'Cash', 20000000, '-', 'Aktif');

-- Products (Packaging Box & Sheet Corrugated)
INSERT INTO products (kode_barang, nama_barang, jenis_barang, tipe_flute, substansi, panjang_mm, lebar_mm, tinggi_mm, jenis_sambungan, stok_qty, satuan, harga_jual, min_stok) VALUES
('BOX-001', 'Master Box Indomie (A1) 340x200x240', 'Box', 'B/F', 'K125/M125/K125', 340, 200, 240, 'Stitching', 4500, 'Pcs', 3850, 1000),
('BOX-002', 'Karton Box Roma Biskuit 400x300x250', 'Box', 'C/F', 'K150/M125/K150', 400, 300, 250, 'Glue', 2200, 'Pcs', 5400, 800),
('BOX-003', 'Die-Cut Box Pizza 25x25x5 White Kraft', 'Box', 'E/F', 'WK150/M125/K125', 250, 250, 50, 'Die-cut', 3100, 'Pcs', 2800, 500),
('BOX-004', 'Heavy Duty Double Wall Box 500x400x350', 'Box', 'B/C Double Wall', 'K150/M125/M125/K150', 500, 400, 350, 'Stitching', 1400, 'Pcs', 9200, 400),
('BOX-005', 'Box FreshCare Minyak Angin 180x120x90', 'Box', 'E/F', 'WK150/M125/K125', 180, 120, 90, 'Glue', 5600, 'Pcs', 1650, 1500),
('SHT-001', 'Sheet B-Flute 1000x1200 Kraft K125', 'Sheet', 'B/F', 'K125/M125/K125', 1000, 1200, 0, 'Tanpa Sambungan', 3500, 'Lembar', 4200, 1000),
('SHT-002', 'Sheet C-Flute 1200x1400 Kraft K150', 'Sheet', 'C/F', 'K150/M125/K150', 1200, 1400, 0, 'Tanpa Sambungan', 2800, 'Lembar', 5800, 800);

-- Suppliers
INSERT INTO suppliers (kode_supplier, nama_supplier, kategori, kontak, telepon, email, alamat, termin_bayar) VALUES
('SUPP-001', 'PT. Fajar Surya Wisesa Tbk', 'Sheet Kertas', 'Bpk. Gunawan', '021-8980123', 'sales@fajarpaper.com', 'Kawasan Industri Cibitung, Bekasi', '30 Hari'),
('SUPP-002', 'PT. Riau Andalan Pulp & Paper', 'Sheet Kertas', 'Ibu Citra', '021-31930111', 'order@rapp.co.id', 'Jl. M.H. Thamrin No. 31, Jakarta Pusat', '45 Hari'),
('SUPP-003', 'CV. Surya Flexo Ink', 'Tinta Flexo', 'Pak Rudi', '0812-7766-5544', 'suryaflexo@gmail.com', 'Jl. Daan Mogot KM 14, Jakarta Barat', '14 Hari'),
('SUPP-004', 'PT. Adhesive Prima Mandiri', 'Lem & Kawat', 'Ko Hartono', '021-5595678', 'sales@adhesiveprima.com', 'Kawasan Pergudangan Pantai Indah Dadap, Tangerang', '30 Hari');

-- Bahan Baku Sheet
INSERT INTO bahan_baku_sheet (kode_sheet, nama_sheet, supplier_id, flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok) VALUES
('BBS-001', 'Karton Sheet B/F 1000x1200 K125/M125/K125', 1, 'B/F', 'K125/M125/K125', 1000, 1200, 4200, 3100, 1000),
('BBS-002', 'Karton Sheet C/F 1200x1400 K150/M125/K150', 1, 'C/F', 'K150/M125/K150', 1200, 1400, 3100, 4250, 800),
('BBS-003', 'Karton Sheet E/F 800x1000 WK150/M125/K125', 2, 'E/F', 'WK150/M125/K125', 800, 1000, 2500, 2600, 600),
('BBS-004', 'Karton Sheet B/C Double Wall 1100x1500', 1, 'B/C', 'K150/M125/M125/K150', 1100, 1500, 1800, 6800, 500);

-- Bahan Pembantu
INSERT INTO bahan_pembantu (kode_bahan, nama_bahan, kategori, satuan, stok, harga_satuan, min_stok) VALUES
('BHP-001', 'Tinta Flexo Waterbased Hitam', 'Tinta Flexo', 'Kg', 185.00, 38000, 30),
('BHP-002', 'Tinta Flexo Waterbased Merah Cabai', 'Tinta Flexo', 'Kg', 120.00, 42000, 25),
('BHP-003', 'Tinta Flexo Waterbased Biru Reflex', 'Tinta Flexo', 'Kg', 95.00, 41000, 20),
('BHP-004', 'Lem Poly / Dextrin Super Perekat Dus', 'Lem Karton', 'Galon', 45.00, 175000, 10),
('BHP-005', 'Kawat Stitching No. 17 Galvanized (Roll)', 'Kawat Stitching', 'Roll', 68.00, 125000, 15),
('BHP-006', 'Tali Strapping Band Kuning 12mm', 'Tali Strapping', 'Roll', 40.00, 95000, 10);

-- Sales Orders
INSERT INTO sales_orders (id, nomor_so, tanggal_so, customer_id, sales_id, catatan, status, subtotal, ppn, total_nilai) VALUES
(1, 'SO-202611-001', '2026-11-05', 1, 1, 'Order Dus Indomie Goreng batch 1 - kirim bertahap', 'Diproses', 19250000, 2117500, 21367500),
(2, 'SO-202611-002', '2026-11-08', 2, 2, 'Box Roma Kelapa sablon 2 sisi', 'Selesai', 27000000, 2970000, 29970000),
(3, 'SO-202611-003', '2026-11-12', 3, 1, 'Die-cut Box Pizza 25x25 white kraft', 'Disetujui/SPK', 8400000, 924000, 9324000),
(4, 'SO-202611-004', '2026-11-15', 4, 3, 'Box Freshcare cetak hijau & hitam', 'Draft', 4950000, 544500, 5494500);

INSERT INTO sales_order_items (so_id, product_id, qty, harga_satuan, subtotal, spek_khusus) VALUES
(1, 1, 5000, 3850, 19250000, 'Cetak Flexo 2 Warna (Merah & Hitam), Stitching kawat 4 titik'),
(2, 2, 5000, 5400, 27000000, 'Cetak Flexo 2 Warna, Lem glue lipat rapih'),
(3, 3, 3000, 2800, 8400000, 'Pisau rotary die-cut pizza, kunci slip-on'),
(4, 5, 3000, 1650, 4950000, 'Mini box E/Flute rapih');

-- Surat Jalan
INSERT INTO surat_jalan (id, nomor_sj, so_id, tanggal_kirim, no_kendaraan, nama_supir, status, catatan) VALUES
(1, 'SJ-202611-001', 2, '2026-11-10', 'B 9123 MUA', 'Ahmad Kosasih', 'Diterima Customer', 'Telah diterima gudang PT. Mayora lengkap 5.000 pcs (200 ikat @25 pcs)'),
(2, 'SJ-202611-002', 1, '2026-11-12', 'B 9554 MUA', 'Dedi Supardi', 'Dikirim', 'Kirim tahap 1: 2.500 pcs');

INSERT INTO surat_jalan_items (sj_id, product_id, qty_kirim, keterangan) VALUES
(1, 2, 5000, '200 ikat @ 25 pcs dus Roma'),
(2, 1, 2500, '100 ikat @ 25 pcs dus Indomie');

-- Sales Invoices
INSERT INTO sales_invoices (id, nomor_invoice, so_id, customer_id, tanggal_invoice, jatuh_tempo, subtotal, ppn, total_tagihan, sudah_dibayar, sisa_tagihan, status_bayar) VALUES
(1, 'INV-202611-001', 2, 2, '2026-11-11', '2026-12-11', 27000000, 2970000, 29970000, 29970000, 0, 'Lunas'),
(2, 'INV-202611-002', 1, 1, '2026-11-13', '2026-12-13', 19250000, 2117500, 21367500, 10000000, 11367500, 'Belum Lunas');

-- Faktur Pajak
INSERT INTO faktur_pajak (nomor_faktur, invoice_id, customer_id, tanggal_faktur, dpp, ppn, status) VALUES
('010.000-26.00000101', 1, 2, '2026-11-11', 27000000, 2970000, 'Disetujui'),
('010.000-26.00000102', 2, 1, '2026-11-13', 19250000, 2117500, 'Disetujui');

-- Retur Penjualan
INSERT INTO retur_penjualan (nomor_retur, invoice_id, customer_id, product_id, tanggal_retur, qty, alasan, status) VALUES
('RET-J-202611-001', 2, 1, 1, '2026-11-14', 50, 'Printing blur pada 2 ikat kardus saat proses setting mesin', 'Selesai');

-- Purchase Orders
INSERT INTO purchase_orders (id, nomor_po, supplier_id, tanggal_po, status, total_nilai, catatan) VALUES
(1, 'PO-202611-001', 1, '2026-11-02', 'Selesai', 21700000, 'Sheet B/F dan C/F untuk produksi awal bulan'),
(2, 'PO-202611-002', 3, '2026-11-04', 'Selesai', 5700000, 'Tinta flexo hitam dan merah');

INSERT INTO purchase_order_items (po_id, item_type, item_id, item_name, qty, harga_satuan, subtotal) VALUES
(1, 'Sheet', 1, 'Karton Sheet B/F 1000x1200 K125/M125/K125', 3000, 3100, 9300000),
(1, 'Sheet', 2, 'Karton Sheet C/F 1200x1400 K150/M125/K150', 2000, 4250, 8500000),
(1, 'Sheet', 4, 'Karton Sheet B/C Double Wall 1100x1500', 500, 6800, 3400000),
(2, 'BahanPembantu', 1, 'Tinta Flexo Waterbased Hitam', 100, 38000, 3800000),
(2, 'BahanPembantu', 2, 'Tinta Flexo Waterbased Merah Cabai', 50, 38000, 1900000);

-- Laporan Penerimaan Barang (LPB)
INSERT INTO laporan_penerimaan_barang (id, nomor_lpb, po_id, supplier_id, tanggal_terima, no_sj_supplier, nama_penerima, catatan) VALUES
(1, 'LPB-202611-001', 1, 1, '2026-11-04', 'SJ-FSR-99812', 'Maman Suratman (Gudang)', 'Sheet tiba dalam kondisi kering dan rapih di atas pallet kayu');

INSERT INTO lpb_items (lpb_id, item_type, item_id, item_name, qty_terima, kondisi) VALUES
(1, 'Sheet', 1, 'Karton Sheet B/F 1000x1200 K125/M125/K125', 3000, 'Baik'),
(1, 'Sheet', 2, 'Karton Sheet C/F 1200x1400 K150/M125/K150', 2000, 'Baik'),
(1, 'Sheet', 4, 'Karton Sheet B/C Double Wall 1100x1500', 500, 'Baik');

-- Nota Pembelian
INSERT INTO nota_pembelian (id, nomor_faktur_beli, po_id, supplier_id, tanggal_faktur, jatuh_tempo, total_tagihan, sudah_dibayar, sisa_tagihan, status_bayar) VALUES
(1, 'FB-202611-001', 1, 1, '2026-11-05', '2026-12-05', 21700000, 10000000, 11700000, 'Belum Lunas'),
(2, 'FB-202611-002', 2, 3, '2026-11-06', '2026-11-20', 5700000, 5700000, 0, 'Lunas');

-- SPK Produksi Corrugated
INSERT INTO spk_produksi (id, nomor_spk, so_id, customer_nama, nama_box, ukuran_box, sheet_id, qty_target, tanggal_mulai, target_selesai, desain_cetak, pisau_pond, tahapan_sekarang, status) VALUES
(1, 'SPK-202611-001', 1, 'PT. Indofood Sukses Makmur Tbk', 'Master Box Indomie (A1)', '340 x 200 x 240 mm', 1, 5000, '2026-11-06', '2026-11-12', 'Flexo 2 Warna (Merah & Hitam)', 'Rotary Slotter Indomie', 'Ikat', 'Berjalan'),
(2, 'SPK-202611-002', 2, 'PT. Mayora Indah Tbk', 'Karton Box Roma Biskuit', '400 x 300 x 250 mm', 2, 5000, '2026-11-08', '2026-11-10', 'Flexo 2 Warna (Kuning & Merah)', 'Slotter Creaser', 'Selesai', 'Selesai'),
(3, 'SPK-202611-003', 3, 'CV. Aneka Snack Nusantara', 'Die-Cut Box Pizza 25x25', '250 x 250 x 50 mm', 3, 3000, '2026-11-13', '2026-11-17', 'Flexo 1 Warna (Coklat Tua)', 'Pisau Pond Rotary Pizza-25', 'Cetak', 'Berjalan');

-- Produksi Cetak
INSERT INTO produksi_cetak (spk_id, tanggal_proses, mesin_cetak, operator_nama, warna_tinta, qty_masuk, qty_bagus, qty_reject, status, catatan) VALUES
(1, '2026-11-07', 'Flexo 2 Warna Line 1', 'Agus Salim', 'Merah Cabai & Hitam', 5050, 5020, 30, 'Selesai', 'Cetak tajam, presisi slotting pas'),
(2, '2026-11-08', 'Flexo 2 Warna Line 2', 'Bambang Irawan', 'Kuning & Merah', 5080, 5040, 40, 'Selesai', 'Selesai tepat waktu'),
(3, '2026-11-13', 'Flexo 1 Warna Line 1', 'Agus Salim', 'Coklat Tua', 3050, 1800, 15, 'Proses', 'Shift 1 sedang berjalan');

-- Produksi Finishing (Slotter / Pond / Stitching / Glue)
INSERT INTO produksi_finishing (spk_id, tanggal_proses, jenis_finishing, operator_nama, mesin, qty_masuk, qty_bagus, qty_reject, status, catatan) VALUES
(1, '2026-11-09', 'Stitching Kawat', 'Ujang Koswara', 'Stitching 2 Kepala', 5020, 5000, 20, 'Selesai', '4 kawat stitch per dus, kencang'),
(2, '2026-11-09', 'Gluing / Lem', 'Ade Suherman', 'Automatic Folder Gluer', 5040, 5015, 25, 'Selesai', 'Lem kering sempurna');

-- Produksi Ikat
INSERT INTO produksi_ikat (spk_id, tanggal_proses, operator_nama, isi_per_ikat, jumlah_ikat, total_barang_jadi, status, serah_terima_gudang) VALUES
(1, '2026-11-10', 'Endang Sujana', 25, 200, 5000, 'Selesai', TRUE),
(2, '2026-11-10', 'Endang Sujana', 25, 200, 5000, 'Selesai', TRUE);

-- Pembayaran Piutang
INSERT INTO pembayaran_piutang (nomor_bukti, invoice_id, customer_id, tanggal_bayar, metode_bayar, jumlah_bayar, catatan) VALUES
('BYR-AR-202611-001', 1, 2, '2026-11-15', 'Transfer BCA', 29970000, 'Pelunasan full invoice INV-202611-001 PT. Mayora'),
('BYR-AR-202611-002', 2, 1, '2026-11-16', 'Transfer Mandiri', 10000000, 'Pembayaran termin 1 invoice INV-202611-002 PT. Indofood');

-- Pembayaran Hutang
INSERT INTO pembayaran_hutang (nomor_bukti, faktur_beli_id, supplier_id, tanggal_bayar, metode_bayar, jumlah_bayar, catatan) VALUES
('BYR-AP-202611-001', 2, 3, '2026-11-12', 'Transfer BCA', 5700000, 'Pelunasan tinta Surya Flexo'),
('BYR-AP-202611-002', 1, 1, '2026-11-14', 'Transfer BCA', 10000000, 'DP pembayaran sheet Fajar Surya Wisesa');

-- Chart of Accounts
INSERT INTO chart_of_accounts (kode_akun, nama_akun, kategori, saldo_normal, saldo_berjalan) VALUES
('1101', 'Kas Kecil Operasional', 'Kas & Bank', 'Debet', 12500000),
('1102', 'Bank BCA Rek. 4567-8901', 'Kas & Bank', 'Debet', 185400000),
('1103', 'Bank Mandiri Rek. 123-00-9876', 'Kas & Bank', 'Debet', 94200000),
('1104', 'Piutang Usaha Customer', 'Piutang Usaha', 'Debet', 11367500),
('1105', 'Persediaan Bahan Baku Sheet', 'Persediaan', 'Debet', 38750000),
('1106', 'Persediaan Bahan Pembantu', 'Persediaan', 'Debet', 21450000),
('1107', 'Persediaan Barang Jadi (Box)', 'Persediaan', 'Debet', 42800000),
('1201', 'Aktiva Tetap Mesin Pabrik', 'Aktiva Tetap', 'Debet', 450000000),
('1202', 'Akumulasi Penyusutan Mesin', 'Aktiva Tetap', 'Kredit', 45000000),
('2101', 'Hutang Usaha Supplier', 'Hutang Usaha', 'Kredit', 11700000),
('3101', 'Modal Pemilik CV', 'Modal', 'Kredit', 600000000),
('4101', 'Pendapatan Penjualan Dus Box', 'Pendapatan', 'Kredit', 51337500),
('5101', 'HPP - Biaya Sheet & Bahan', 'HPP', 'Debet', 27400000),
('5102', 'HPP - Tenaga Kerja Langsung', 'HPP', 'Debet', 8500000),
('6101', 'Beban Gaji Karyawan', 'Beban Operasional', 'Debet', 18500000),
('6102', 'Beban Listrik Pabrik & Air', 'Beban Operasional', 'Debet', 4200000),
('6103', 'Beban Bahan Bakar Armada & Kirim', 'Beban Operasional', 'Debet', 2600000),
('6104', 'Beban Penyusutan Mesin Bulanan', 'Beban Operasional', 'Debet', 3750000);

-- Jurnal Transaksi
INSERT INTO jurnal_transaksi (id, nomor_jurnal, tanggal, tipe_jurnal, keterangan, total_debet, total_kredit) VALUES
(1, 'JU-202611-001', '2026-11-15', 'Bank Masuk', 'Penerimaan pelunasan invoice INV-202611-001 PT Mayora Indah', 29970000, 29970000),
(2, 'JU-202611-002', '2026-11-12', 'Bank Keluar', 'Pembayaran hutang tinta CV. Surya Flexo', 5700000, 5700000);

INSERT INTO jurnal_items (jurnal_id, akun_id, posisi, nominal, keterangan) VALUES
(1, 2, 'Debet', 29970000, 'Bank BCA Kas Masuk'),
(1, 4, 'Kredit', 29970000, 'Pelunasan Piutang PT Mayora'),
(2, 10, 'Debet', 5700000, 'Pelunasan Hutang Surya Flexo'),
(2, 2, 'Kredit', 5700000, 'Bank BCA Pengeluaran');

-- Aktiva Tetap
INSERT INTO aktiva_tetap (id, kode_aktiva, nama_aktiva, kategori, tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, nilai_residu, akumulasi_penyusutan, nilai_buku, status) VALUES
(1, 'AST-001', 'Mesin Flexo Printing 2 Warna (Lead Edge Feeder)', 'Mesin Pabrik', '2024-01-10', 250000000, 8, 20000000, 68000000, 182000000, 'Aktif'),
(2, 'AST-002', 'Mesin Rotary Die-Cut / Pond Otomatis', 'Mesin Pabrik', '2024-06-15', 180000000, 8, 15000000, 42000000, 138000000, 'Aktif'),
(3, 'AST-003', 'Mesin Stitching Kawat Double Head Semi-Auto', 'Mesin Pabrik', '2024-08-20', 65000000, 5, 5000000, 22000000, 43000000, 'Aktif'),
(4, 'AST-004', 'Truk Box Engkel Isuzu Elf (B 9123 MUA)', 'Kendaraan Operasional', '2023-11-01', 280000000, 8, 40000000, 75000000, 205000000, 'Aktif'),
(5, 'AST-005', 'Forklift Toyota 3 Ton Diesel', 'Kendaraan Pabrik', '2024-03-10', 160000000, 8, 10000000, 38000000, 122000000, 'Aktif');

-- Karyawan
INSERT INTO karyawan (id, nik, nama_lengkap, jabatan, departemen, status_karyawan, no_hp, no_rekening, bank, gaji_pokok, tunjangan_jabatan, uang_makan_perhari, tarif_lembur_perjam) VALUES
(1, 'EMP-001', 'Mulyadi Pratama', 'Supervisor Produksi & PPIC', 'Produksi', 'Tetap', '0812-1111-2222', '1234567890', 'BCA', 6500000, 1500000, 30000, 35000),
(2, 'EMP-002', 'Agus Salim', 'Operator Utama Mesin Flexo', 'Produksi', 'Tetap', '0813-2222-3333', '2345678901', 'BCA', 5000000, 600000, 25000, 28000),
(3, 'EMP-003', 'Ujang Koswara', 'Operator Mesin Stitching & Pond', 'Produksi', 'Tetap', '0819-3333-4444', '3456789012', 'BCA', 4800000, 400000, 25000, 26000),
(4, 'EMP-004', 'Endang Sujana', 'Operator Finishing & Packing Ikat', 'Produksi', 'Kontrak', '0857-4444-5555', '4567890123', 'BCA', 4500000, 200000, 25000, 25000),
(5, 'EMP-005', 'Maman Suratman', 'Kepala Gudang Bahan & FG', 'Gudang', 'Tetap', '0812-5555-6666', '5678901234', 'BCA', 5200000, 750000, 25000, 28000),
(6, 'EMP-006', 'Ahmad Kosasih', 'Driver Pengiriman Logistik', 'Gudang', 'Tetap', '0813-6666-7777', '6789012345', 'BCA', 4600000, 300000, 30000, 25000),
(7, 'EMP-007', 'Siti Rahmawati', 'Staff Finance & Accounting', 'Finance & Accounting', 'Tetap', '0818-7777-8888', '7890123456', 'BCA', 5500000, 800000, 25000, 30000);

-- Absensi Harian Contoh
INSERT INTO absensi (karyawan_id, nik, tanggal, status_kehadiran, jam_masuk, jam_pulang, jam_lembur, metode, catatan) VALUES
(1, 'EMP-001', '2026-11-19', 'Hadir', '07:55:00', '17:15:00', 0, 'Mesin Fingerprint', 'Tepat waktu'),
(2, 'EMP-002', '2026-11-19', 'Hadir', '07:48:00', '19:30:00', 2, 'Mesin Fingerprint', 'Lembur cetak SPK-003'),
(3, 'EMP-003', '2026-11-19', 'Hadir', '07:50:00', '19:30:00', 2, 'Mesin Fingerprint', 'Lembur jahitan dus'),
(4, 'EMP-004', '2026-11-19', 'Hadir', '07:55:00', '18:30:00', 1, 'Mesin Fingerprint', 'Lembur ikat strapping'),
(5, 'EMP-005', '2026-11-19', 'Hadir', '07:40:00', '17:05:00', 0, 'Mesin Fingerprint', 'Penerimaan sheet'),
(6, 'EMP-006', '2026-11-19', 'Hadir', '07:30:00', '17:20:00', 0, 'Mesin Fingerprint', 'Kirim rute Bekasi'),
(7, 'EMP-007', '2026-11-19', 'Hadir', '07:58:00', '17:05:00', 0, 'Mesin Fingerprint', 'Rekap keuangan harian');

-- Payroll Periode
INSERT INTO payroll_periode (id, nomor_payroll, periode_bulan, total_karyawan, total_gaji_dibayar, status) VALUES
(1, 'PAY-202610', '2026-10', 7, 44250000, 'Dibayar');

INSERT INTO slip_gaji (payroll_id, karyawan_id, hari_kerja, jam_lembur, gaji_pokok, tunjangan, uang_makan, upah_lembur, potongan_bpjs, potongan_absen, total_gaji_bersih) VALUES
(1, 1, 25, 6, 6500000, 1500000, 750000, 210000, 200000, 0, 8760000),
(1, 2, 25, 14, 5000000, 600000, 625000, 392000, 150000, 0, 6467000),
(1, 3, 24, 12, 4800000, 400000, 600000, 312000, 140000, 0, 5972000),
(1, 4, 25, 10, 4500000, 200000, 625000, 250000, 130000, 0, 5445000),
(1, 5, 25, 8, 5200000, 750000, 625000, 224000, 150000, 0, 6649000),
(1, 6, 25, 4, 4600000, 300000, 750000, 100000, 135000, 0, 5615000),
(1, 7, 25, 0, 5500000, 800000, 625000, 0, 160000, 0, 6765000);
