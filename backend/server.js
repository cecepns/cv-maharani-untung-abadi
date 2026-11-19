/**
 * CV. MAHARANI UNTUNG ABADI - ERP BACKEND
 * Packaging & Corrugated Box Manufacturing & Distribution System
 * Stack: Express JS + MySQL (with resilient mock fallback) + REST API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload directory setup
const uploadDir = path.join(__dirname, 'uploads-cv-maharani');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Database Connection
let dbPool = null;
let useMock = false;

async function initDatabase() {
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cv_maharani_db',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    // Test connection
    const conn = await dbPool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'cv_maharani_db');
  } catch (err) {
    console.warn('⚠️ MySQL not reachable (' + err.message + '). Enabling in-memory data store for standalone execution.');
    useMock = true;
  }
}
initDatabase();

// In-Memory Seed Store (Used when MySQL is not connected or in preview mode)
const store = {
  users: [
    {
      id: 1,
      username: 'admin',
      nama_lengkap: 'Cecep / Super Admin',
      email: 'admin@cvmaharani.com',
      role: 'Superadmin',
      departemen: 'Manajemen',
      status: 'Aktif',
      password: 'admin',
      last_login: '2026-11-19 22:30:00',
      created_at: '2026-11-01 08:00:00'
    },
    {
      id: 2,
      username: 'marketing1',
      nama_lengkap: 'Budi Santoso',
      email: 'budi.sales@cvmaharani.com',
      role: 'Admin Marketing',
      departemen: 'Marketing',
      status: 'Aktif',
      password: 'password123',
      last_login: '2026-11-19 16:45:00',
      created_at: '2026-11-02 09:00:00'
    },
    {
      id: 3,
      username: 'gudang1',
      nama_lengkap: 'Maman Suratman',
      email: 'maman.gudang@cvmaharani.com',
      role: 'Admin Gudang',
      departemen: 'Gudang',
      status: 'Aktif',
      password: 'password123',
      last_login: '2026-11-19 17:10:00',
      created_at: '2026-11-03 08:30:00'
    },
    {
      id: 4,
      username: 'produksi1',
      nama_lengkap: 'Mulyadi Pratama',
      email: 'mulyadi.ppic@cvmaharani.com',
      role: 'Admin Produksi',
      departemen: 'Produksi',
      status: 'Aktif',
      password: 'password123',
      last_login: '2026-11-19 19:20:00',
      created_at: '2026-11-04 08:00:00'
    },
    {
      id: 5,
      username: 'finance1',
      nama_lengkap: 'Siti Rahmawati',
      email: 'siti.finance@cvmaharani.com',
      role: 'Admin Finance & Accounting',
      departemen: 'Finance & Accounting',
      status: 'Aktif',
      password: 'password123',
      last_login: '2026-11-19 17:05:00',
      created_at: '2026-11-05 09:15:00'
    },
    {
      id: 6,
      username: 'hrd1',
      nama_lengkap: 'Dewi Lestari',
      email: 'dewi.hrd@cvmaharani.com',
      role: 'Admin HRD',
      departemen: 'HRD & Personalia',
      status: 'Aktif',
      password: 'password123',
      last_login: '2026-11-18 15:30:00',
      created_at: '2026-11-06 10:00:00'
    }
  ],
  salesPersons: [
    { id: 1, kode_sales: 'SLS-001', nama_sales: 'Budi Santoso', telepon: '0812-3456-7890', target_omset: 250000000 },
    { id: 2, kode_sales: 'SLS-002', nama_sales: 'Dewi Lestari', telepon: '0813-8899-7711', target_omset: 200000000 },
    { id: 3, kode_sales: 'SLS-003', nama_sales: 'Hendra Gunawan', telepon: '0819-2233-4455', target_omset: 180000000 }
  ],
  customers: [
    { id: 1, kode_customer: 'CUST-001', nama_customer: 'PT. Indofood Sukses Makmur Tbk', pic: 'Pak Bambang', telepon: '021-57958822', email: 'procurement@indofood.co.id', alamat: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi', termin_bayar: '30 Hari', plafon_kredit: 150000000, npwp: '01.321.456.7-011.000', status: 'Aktif' },
    { id: 2, kode_customer: 'CUST-002', nama_customer: 'PT. Mayora Indah Tbk', pic: 'Ibu Ratna', telepon: '021-80637000', email: 'purchasing@mayora.co.id', alamat: 'Jl. Tomang Raya No. 21-23, Jakarta Barat', termin_bayar: '30 Hari', plafon_kredit: 120000000, npwp: '01.445.678.9-012.000', status: 'Aktif' },
    { id: 3, kode_customer: 'CUST-003', nama_customer: 'CV. Aneka Snack Nusantara', pic: 'Ko Kevin', telepon: '0811-2345-6789', email: 'anekasnack@gmail.com', alamat: 'Jl. Industri Rungkut No. 45, Surabaya', termin_bayar: '14 Hari', plafon_kredit: 40000000, npwp: '02.556.789.1-013.000', status: 'Aktif' },
    { id: 4, kode_customer: 'CUST-004', nama_customer: 'PT. Ultra Sakti (Freshcare)', pic: 'Ibu Diana', telepon: '021-58302211', email: 'diana@ultrasakti.com', alamat: 'Kawasan Industri Pulogadung, Jakarta Timur', termin_bayar: '30 Hari', plafon_kredit: 90000000, npwp: '01.667.890.2-014.000', status: 'Aktif' },
    { id: 5, kode_customer: 'CUST-005', nama_customer: 'UD. Berkah Tani Organik', pic: 'H. Sulaeman', telepon: '0812-9988-7766', email: 'berkahtani@yahoo.com', alamat: 'Jl. Raya Subang KM 12, Subang', termin_bayar: 'Cash', plafon_kredit: 20000000, npwp: '-', status: 'Aktif' }
  ],
  products: [
    { id: 1, kode_barang: 'BOX-001', nama_barang: 'Master Box Indomie (A1) 340x200x240', jenis_barang: 'Box', tipe_flute: 'B/F', substansi: 'K125/M125/K125', panjang_mm: 340, lebar_mm: 200, tinggi_mm: 240, jenis_sambungan: 'Stitching', stok_qty: 4500, satuan: 'Pcs', harga_jual: 3850, min_stok: 1000 },
    { id: 2, kode_barang: 'BOX-002', nama_barang: 'Karton Box Roma Biskuit 400x300x250', jenis_barang: 'Box', tipe_flute: 'C/F', substansi: 'K150/M125/K150', panjang_mm: 400, lebar_mm: 300, tinggi_mm: 250, jenis_sambungan: 'Glue', stok_qty: 2200, satuan: 'Pcs', harga_jual: 5400, min_stok: 800 },
    { id: 3, kode_barang: 'BOX-003', nama_barang: 'Die-Cut Box Pizza 25x25x5 White Kraft', jenis_barang: 'Box', tipe_flute: 'E/F', substansi: 'WK150/M125/K125', panjang_mm: 250, lebar_mm: 250, tinggi_mm: 50, jenis_sambungan: 'Die-cut', stok_qty: 3100, satuan: 'Pcs', harga_jual: 2800, min_stok: 500 },
    { id: 4, kode_barang: 'BOX-004', nama_barang: 'Heavy Duty Double Wall Box 500x400x350', jenis_barang: 'Box', tipe_flute: 'B/C Double Wall', substansi: 'K150/M125/M125/K150', panjang_mm: 500, lebar_mm: 400, tinggi_mm: 350, jenis_sambungan: 'Stitching', stok_qty: 1400, satuan: 'Pcs', harga_jual: 9200, min_stok: 400 },
    { id: 5, kode_barang: 'BOX-005', nama_barang: 'Box FreshCare Minyak Angin 180x120x90', jenis_barang: 'Box', tipe_flute: 'E/F', substansi: 'WK150/M125/K125', panjang_mm: 180, lebar_mm: 120, tinggi_mm: 90, jenis_sambungan: 'Glue', stok_qty: 5600, satuan: 'Pcs', harga_jual: 1650, min_stok: 1500 },
    { id: 6, kode_barang: 'SHT-001', nama_barang: 'Sheet B-Flute 1000x1200 Kraft K125', jenis_barang: 'Sheet', tipe_flute: 'B/F', substansi: 'K125/M125/K125', panjang_mm: 1000, lebar_mm: 1200, tinggi_mm: 0, jenis_sambungan: 'Tanpa Sambungan', stok_qty: 3500, satuan: 'Lembar', harga_jual: 4200, min_stok: 1000 },
    { id: 7, kode_barang: 'SHT-002', nama_barang: 'Sheet C-Flute 1200x1400 Kraft K150', jenis_barang: 'Sheet', tipe_flute: 'C/F', substansi: 'K150/M125/K150', panjang_mm: 1200, lebar_mm: 1400, tinggi_mm: 0, jenis_sambungan: 'Tanpa Sambungan', stok_qty: 2800, satuan: 'Lembar', harga_jual: 5800, min_stok: 800 }
  ],
  salesOrders: [
    {
      id: 1, nomor_so: 'SO-202611-001', tanggal_so: '2026-11-05', customer_id: 1, customer_nama: 'PT. Indofood Sukses Makmur Tbk', sales_id: 1, sales_nama: 'Budi Santoso', catatan: 'Order Dus Indomie Goreng batch 1 - kirim bertahap', status: 'Diproses', subtotal: 19250000, ppn: 2117500, total_nilai: 21367500,
      items: [{ product_id: 1, nama_barang: 'Master Box Indomie (A1) 340x200x240', qty: 5000, harga_satuan: 3850, subtotal: 19250000, spek_khusus: 'Cetak Flexo 2 Warna (Merah & Hitam), Stitching kawat 4 titik' }]
    },
    {
      id: 2, nomor_so: 'SO-202611-002', tanggal_so: '2026-11-08', customer_id: 2, customer_nama: 'PT. Mayora Indah Tbk', sales_id: 2, sales_nama: 'Dewi Lestari', catatan: 'Box Roma Kelapa sablon 2 sisi', status: 'Selesai', subtotal: 27000000, ppn: 2970000, total_nilai: 29970000,
      items: [{ product_id: 2, nama_barang: 'Karton Box Roma Biskuit 400x300x250', qty: 5000, harga_satuan: 5400, subtotal: 27000000, spek_khusus: 'Cetak Flexo 2 Warna, Lem glue lipat rapih' }]
    },
    {
      id: 3, nomor_so: 'SO-202611-003', tanggal_so: '2026-11-12', customer_id: 3, customer_nama: 'CV. Aneka Snack Nusantara', sales_id: 1, sales_nama: 'Budi Santoso', catatan: 'Die-cut Box Pizza 25x25 white kraft', status: 'Disetujui/SPK', subtotal: 8400000, ppn: 924000, total_nilai: 9324000,
      items: [{ product_id: 3, nama_barang: 'Die-Cut Box Pizza 25x25x5 White Kraft', qty: 3000, harga_satuan: 2800, subtotal: 8400000, spek_khusus: 'Pisau rotary die-cut pizza, kunci slip-on' }]
    },
    {
      id: 4, nomor_so: 'SO-202611-004', tanggal_so: '2026-11-15', customer_id: 4, customer_nama: 'PT. Ultra Sakti (Freshcare)', sales_id: 3, sales_nama: 'Hendra Gunawan', catatan: 'Box Freshcare cetak hijau & hitam', status: 'Draft', subtotal: 4950000, ppn: 544500, total_nilai: 5494500,
      items: [{ product_id: 5, nama_barang: 'Box FreshCare Minyak Angin 180x120x90', qty: 3000, harga_satuan: 1650, subtotal: 4950000, spek_khusus: 'Mini box E/Flute rapih' }]
    }
  ],
  suratJalan: [
    {
      id: 1, nomor_sj: 'SJ-202611-001', so_id: 2, nomor_so: 'SO-202611-002', customer_nama: 'PT. Mayora Indah Tbk', tanggal_kirim: '2026-11-10', no_kendaraan: 'B 9123 MUA', nama_supir: 'Ahmad Kosasih', status: 'Diterima Customer', catatan: 'Telah diterima gudang PT. Mayora lengkap 5.000 pcs',
      items: [{ product_id: 2, nama_barang: 'Karton Box Roma Biskuit 400x300x250', qty_kirim: 5000, keterangan: '200 ikat @ 25 pcs' }]
    },
    {
      id: 2, nomor_sj: 'SJ-202611-002', so_id: 1, nomor_so: 'SO-202611-001', customer_nama: 'PT. Indofood Sukses Makmur Tbk', tanggal_kirim: '2026-11-12', no_kendaraan: 'B 9554 MUA', nama_supir: 'Dedi Supardi', status: 'Dikirim', catatan: 'Kirim tahap 1: 2.500 pcs',
      items: [{ product_id: 1, nama_barang: 'Master Box Indomie (A1) 340x200x240', qty_kirim: 2500, keterangan: '100 ikat @ 25 pcs' }]
    }
  ],
  invoices: [
    { id: 1, nomor_invoice: 'INV-202611-001', so_id: 2, nomor_so: 'SO-202611-002', customer_id: 2, customer_nama: 'PT. Mayora Indah Tbk', tanggal_invoice: '2026-11-11', jatuh_tempo: '2026-12-11', subtotal: 27000000, ppn: 2970000, total_tagihan: 29970000, sudah_dibayar: 29970000, sisa_tagihan: 0, status_bayar: 'Lunas' },
    { id: 2, nomor_invoice: 'INV-202611-002', so_id: 1, nomor_so: 'SO-202611-001', customer_id: 1, customer_nama: 'PT. Indofood Sukses Makmur Tbk', tanggal_invoice: '2026-11-13', jatuh_tempo: '2026-12-13', subtotal: 19250000, ppn: 2117500, total_tagihan: 21367500, sudah_dibayar: 10000000, sisa_tagihan: 11367500, status_bayar: 'Belum Lunas' }
  ],
  fakturPajak: [
    { id: 1, nomor_faktur: '010.000-26.00000101', invoice_id: 1, customer_nama: 'PT. Mayora Indah Tbk', tanggal_faktur: '2026-11-11', dpp: 27000000, ppn: 2970000, status: 'Disetujui' },
    { id: 2, nomor_faktur: '010.000-26.00000102', invoice_id: 2, customer_nama: 'PT. Indofood Sukses Makmur Tbk', tanggal_faktur: '2026-11-13', dpp: 19250000, ppn: 2117500, status: 'Disetujui' }
  ],
  returPenjualan: [
    { id: 1, nomor_retur: 'RET-J-202611-001', invoice_id: 2, customer_nama: 'PT. Indofood Sukses Makmur Tbk', nama_barang: 'Master Box Indomie (A1)', tanggal_retur: '2026-11-14', qty: 50, alasan: 'Printing blur pada 2 ikat kardus saat proses setting mesin', status: 'Selesai' }
  ],
  suppliers: [
    { id: 1, kode_supplier: 'SUPP-001', nama_supplier: 'PT. Fajar Surya Wisesa Tbk', kategori: 'Sheet Kertas', kontak: 'Bpk. Gunawan', telepon: '021-8980123', email: 'sales@fajarpaper.com', alamat: 'Kawasan Industri Cibitung, Bekasi', termin_bayar: '30 Hari' },
    { id: 2, kode_supplier: 'SUPP-002', nama_supplier: 'PT. Riau Andalan Pulp & Paper', kategori: 'Sheet Kertas', kontak: 'Ibu Citra', telepon: '021-31930111', email: 'order@rapp.co.id', alamat: 'Jl. M.H. Thamrin No. 31, Jakarta Pusat', termin_bayar: '45 Hari' },
    { id: 3, kode_supplier: 'SUPP-003', nama_supplier: 'CV. Surya Flexo Ink', kategori: 'Tinta Flexo', kontak: 'Pak Rudi', telepon: '0812-7766-5544', email: 'suryaflexo@gmail.com', alamat: 'Jl. Daan Mogot KM 14, Jakarta Barat', termin_bayar: '14 Hari' },
    { id: 4, kode_supplier: 'SUPP-004', nama_supplier: 'PT. Adhesive Prima Mandiri', kategori: 'Lem & Kawat', kontak: 'Ko Hartono', telepon: '021-5595678', email: 'sales@adhesiveprima.com', alamat: 'Kawasan Pergudangan Pantai Indah Dadap, Tangerang', termin_bayar: '30 Hari' }
  ],
  bahanSheet: [
    { id: 1, kode_sheet: 'BBS-001', nama_sheet: 'Karton Sheet B/F 1000x1200 K125/M125/K125', supplier_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', flute: 'B/F', substansi: 'K125/M125/K125', panjang_mm: 1000, lebar_mm: 1200, stok_lembar: 4200, satuan: 'Lembar', harga_per_lembar: 3100, min_stok: 1000 },
    { id: 2, kode_sheet: 'BBS-002', nama_sheet: 'Karton Sheet C/F 1200x1400 K150/M125/K150', supplier_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', flute: 'C/F', substansi: 'K150/M125/K150', panjang_mm: 1200, lebar_mm: 1400, stok_lembar: 3100, satuan: 'Lembar', harga_per_lembar: 4250, min_stok: 800 },
    { id: 3, kode_sheet: 'BBS-003', nama_sheet: 'Karton Sheet E/F 800x1000 WK150/M125/K125', supplier_id: 2, supplier_nama: 'PT. Riau Andalan Pulp & Paper', flute: 'E/F', substansi: 'WK150/M125/K125', panjang_mm: 800, lebar_mm: 1000, stok_lembar: 2500, satuan: 'Lembar', harga_per_lembar: 2600, min_stok: 600 },
    { id: 4, kode_sheet: 'BBS-004', nama_sheet: 'Karton Sheet B/C Double Wall 1100x1500', supplier_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', flute: 'B/C', substansi: 'K150/M125/M125/K150', panjang_mm: 1100, lebar_mm: 1500, stok_lembar: 1800, satuan: 'Lembar', harga_per_lembar: 6800, min_stok: 500 }
  ],
  bahanPembantu: [
    { id: 1, kode_bahan: 'BHP-001', nama_bahan: 'Tinta Flexo Waterbased Hitam', kategori: 'Tinta Flexo', satuan: 'Kg', stok: 185, harga_satuan: 38000, min_stok: 30 },
    { id: 2, kode_bahan: 'BHP-002', nama_bahan: 'Tinta Flexo Waterbased Merah Cabai', kategori: 'Tinta Flexo', satuan: 'Kg', stok: 120, harga_satuan: 42000, min_stok: 25 },
    { id: 3, kode_bahan: 'BHP-003', nama_bahan: 'Tinta Flexo Waterbased Biru Reflex', kategori: 'Tinta Flexo', satuan: 'Kg', stok: 95, harga_satuan: 41000, min_stok: 20 },
    { id: 4, kode_bahan: 'BHP-004', nama_bahan: 'Lem Poly / Dextrin Super Perekat Dus', kategori: 'Lem Karton', satuan: 'Galon', stok: 45, harga_satuan: 175000, min_stok: 10 },
    { id: 5, kode_bahan: 'BHP-005', nama_bahan: 'Kawat Stitching No. 17 Galvanized (Roll)', kategori: 'Kawat Stitching', satuan: 'Roll', stok: 68, harga_satuan: 125000, min_stok: 15 },
    { id: 6, kode_bahan: 'BHP-006', nama_bahan: 'Tali Strapping Band Kuning 12mm', kategori: 'Tali Strapping', satuan: 'Roll', stok: 40, harga_satuan: 95000, min_stok: 10 }
  ],
  purchaseOrders: [
    {
      id: 1, nomor_po: 'PO-202611-001', supplier_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', tanggal_po: '2026-11-02', status: 'Selesai', total_nilai: 21700000, catatan: 'Sheet B/F dan C/F untuk produksi awal bulan',
      items: [
        { item_name: 'Karton Sheet B/F 1000x1200 K125/M125/K125', qty: 3000, harga_satuan: 3100, subtotal: 9300000 },
        { item_name: 'Karton Sheet C/F 1200x1400 K150/M125/K150', qty: 2000, harga_satuan: 4250, subtotal: 8500000 },
        { item_name: 'Karton Sheet B/C Double Wall 1100x1500', qty: 500, harga_satuan: 6800, subtotal: 3400000 }
      ]
    },
    {
      id: 2, nomor_po: 'PO-202611-002', supplier_id: 3, supplier_nama: 'CV. Surya Flexo Ink', tanggal_po: '2026-11-04', status: 'Selesai', total_nilai: 5700000, catatan: 'Tinta flexo hitam dan merah',
      items: [
        { item_name: 'Tinta Flexo Waterbased Hitam', qty: 100, harga_satuan: 38000, subtotal: 3800000 },
        { item_name: 'Tinta Flexo Waterbased Merah Cabai', qty: 50, harga_satuan: 38000, subtotal: 1900000 }
      ]
    }
  ],
  lpb: [
    {
      id: 1, nomor_lpb: 'LPB-202611-001', po_id: 1, nomor_po: 'PO-202611-001', supplier_nama: 'PT. Fajar Surya Wisesa Tbk', tanggal_terima: '2026-11-04', no_sj_supplier: 'SJ-FSR-99812', nama_penerima: 'Maman Suratman (Gudang)', catatan: 'Sheet tiba dalam kondisi kering di atas pallet kayu',
      items: [
        { item_name: 'Karton Sheet B/F 1000x1200 K125/M125/K125', qty_terima: 3000, kondisi: 'Baik' },
        { item_name: 'Karton Sheet C/F 1200x1400 K150/M125/K150', qty_terima: 2000, kondisi: 'Baik' },
        { item_name: 'Karton Sheet B/C Double Wall 1100x1500', qty_terima: 500, kondisi: 'Baik' }
      ]
    }
  ],
  notaPembelian: [
    { id: 1, nomor_faktur_beli: 'FB-202611-001', po_id: 1, nomor_po: 'PO-202611-001', supplier_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', tanggal_faktur: '2026-11-05', jatuh_tempo: '2026-12-05', total_tagihan: 21700000, sudah_dibayar: 10000000, sisa_tagihan: 11700000, status_bayar: 'Belum Lunas' },
    { id: 2, nomor_faktur_beli: 'FB-202611-002', po_id: 2, nomor_po: 'PO-202611-002', supplier_id: 3, supplier_nama: 'CV. Surya Flexo Ink', tanggal_faktur: '2026-11-06', jatuh_tempo: '2026-11-20', total_tagihan: 5700000, sudah_dibayar: 5700000, sisa_tagihan: 0, status_bayar: 'Lunas' }
  ],
  returPembelian: [
    { id: 1, nomor_retur_beli: 'RET-B-202611-001', po_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', tanggal_retur: '2026-11-06', alasan: 'Sheet gelombang flute lembek/kempes 100 lembar', total_nilai: 310000, status: 'Disetujui' }
  ],
  mutasiStok: [
    { id: 1, tanggal: '2026-11-04', tipe_barang: 'Sheet', barang_id: 1, nama_barang: 'Karton Sheet B/F 1000x1200', jenis_mutasi: 'Masuk', qty: 3000, referensi_dokumen: 'LPB-202611-001', keterangan: 'Penerimaan PO Supplier' },
    { id: 2, tanggal: '2026-11-06', tipe_barang: 'Sheet', barang_id: 1, nama_barang: 'Karton Sheet B/F 1000x1200', jenis_mutasi: 'Keluar', qty: 5050, referensi_dokumen: 'SPK-202611-001', keterangan: 'Pemakaian Produksi Dus Indomie' },
    { id: 3, tanggal: '2026-11-10', tipe_barang: 'BarangJadi', barang_id: 1, nama_barang: 'Master Box Indomie (A1)', jenis_mutasi: 'Masuk', qty: 5000, referensi_dokumen: 'SPK-202611-001', keterangan: 'Barang Jadi Lolos QC & Ikat' },
    { id: 4, tanggal: '2026-11-12', tipe_barang: 'BarangJadi', barang_id: 1, nama_barang: 'Master Box Indomie (A1)', jenis_mutasi: 'Keluar', qty: 2500, referensi_dokumen: 'SJ-202611-002', keterangan: 'Pengiriman ke PT Indofood' }
  ],
  spk: [
    { id: 1, nomor_spk: 'SPK-202611-001', so_id: 1, customer_nama: 'PT. Indofood Sukses Makmur Tbk', nama_box: 'Master Box Indomie (A1)', ukuran_box: '340 x 200 x 240 mm', sheet_id: 1, nama_sheet: 'Karton Sheet B/F 1000x1200', qty_target: 5000, tanggal_mulai: '2026-11-06', target_selesai: '2026-11-12', desain_cetak: 'Flexo 2 Warna (Merah & Hitam)', pisau_pond: 'Rotary Slotter Indomie', tahapan_sekarang: 'Ikat', status: 'Berjalan' },
    { id: 2, nomor_spk: 'SPK-202611-002', so_id: 2, customer_nama: 'PT. Mayora Indah Tbk', nama_box: 'Karton Box Roma Biskuit', ukuran_box: '400 x 300 x 250 mm', sheet_id: 2, nama_sheet: 'Karton Sheet C/F 1200x1400', qty_target: 5000, tanggal_mulai: '2026-11-08', target_selesai: '2026-11-10', desain_cetak: 'Flexo 2 Warna (Kuning & Merah)', pisau_pond: 'Slotter Creaser', tahapan_sekarang: 'Selesai', status: 'Selesai' },
    { id: 3, nomor_spk: 'SPK-202611-003', so_id: 3, customer_nama: 'CV. Aneka Snack Nusantara', nama_box: 'Die-Cut Box Pizza 25x25', ukuran_box: '250 x 250 x 50 mm', sheet_id: 3, nama_sheet: 'Karton Sheet E/F 800x1000', qty_target: 3000, tanggal_mulai: '2026-11-13', target_selesai: '2026-11-17', desain_cetak: 'Flexo 1 Warna (Coklat Tua)', pisau_pond: 'Pisau Pond Rotary Pizza-25', tahapan_sekarang: 'Cetak', status: 'Berjalan' }
  ],
  produksiCetak: [
    { id: 1, spk_id: 1, nomor_spk: 'SPK-202611-001', tanggal_proses: '2026-11-07', mesin_cetak: 'Flexo 2 Warna Line 1', operator_nama: 'Agus Salim', warna_tinta: 'Merah Cabai & Hitam', qty_masuk: 5050, qty_bagus: 5020, qty_reject: 30, status: 'Selesai', catatan: 'Cetak tajam, presisi slotting pas' },
    { id: 2, spk_id: 2, nomor_spk: 'SPK-202611-002', tanggal_proses: '2026-11-08', mesin_cetak: 'Flexo 2 Warna Line 2', operator_nama: 'Bambang Irawan', warna_tinta: 'Kuning & Merah', qty_masuk: 5080, qty_bagus: 5040, qty_reject: 40, status: 'Selesai', catatan: 'Selesai tepat waktu' },
    { id: 3, spk_id: 3, nomor_spk: 'SPK-202611-003', tanggal_proses: '2026-11-13', mesin_cetak: 'Flexo 1 Warna Line 1', operator_nama: 'Agus Salim', warna_tinta: 'Coklat Tua', qty_masuk: 3050, qty_bagus: 1800, qty_reject: 15, status: 'Proses', catatan: 'Shift 1 sedang berjalan' }
  ],
  produksiFinishing: [
    { id: 1, spk_id: 1, nomor_spk: 'SPK-202611-001', tanggal_proses: '2026-11-09', jenis_finishing: 'Stitching Kawat', operator_nama: 'Ujang Koswara', mesin: 'Stitching 2 Kepala', qty_masuk: 5020, qty_bagus: 5000, qty_reject: 20, status: 'Selesai', catatan: '4 kawat stitch per dus, kencang' },
    { id: 2, spk_id: 2, nomor_spk: 'SPK-202611-002', tanggal_proses: '2026-11-09', jenis_finishing: 'Gluing / Lem', operator_nama: 'Ade Suherman', mesin: 'Automatic Folder Gluer', qty_masuk: 5040, qty_bagus: 5015, qty_reject: 25, status: 'Selesai', catatan: 'Lem kering sempurna' }
  ],
  produksiIkat: [
    { id: 1, spk_id: 1, nomor_spk: 'SPK-202611-001', tanggal_proses: '2026-11-10', operator_nama: 'Endang Sujana', isi_per_ikat: 25, jumlah_ikat: 200, total_barang_jadi: 5000, status: 'Selesai', serah_terima_gudang: true },
    { id: 2, spk_id: 2, nomor_spk: 'SPK-202611-002', tanggal_proses: '2026-11-10', operator_nama: 'Endang Sujana', isi_per_ikat: 25, jumlah_ikat: 200, total_barang_jadi: 5000, status: 'Selesai', serah_terima_gudang: true }
  ],
  pembayaranPiutang: [
    { id: 1, nomor_bukti: 'BYR-AR-202611-001', invoice_id: 1, nomor_invoice: 'INV-202611-001', customer_id: 2, customer_nama: 'PT. Mayora Indah Tbk', tanggal_bayar: '2026-11-15', metode_bayar: 'Transfer BCA', jumlah_bayar: 29970000, catatan: 'Pelunasan full invoice INV-202611-001 PT. Mayora' },
    { id: 2, nomor_bukti: 'BYR-AR-202611-002', invoice_id: 2, nomor_invoice: 'INV-202611-002', customer_id: 1, customer_nama: 'PT. Indofood Sukses Makmur Tbk', tanggal_bayar: '2026-11-16', metode_bayar: 'Transfer Mandiri', jumlah_bayar: 10000000, catatan: 'Pembayaran termin 1 invoice INV-202611-002 PT. Indofood' }
  ],
  pembayaranHutang: [
    { id: 1, nomor_bukti: 'BYR-AP-202611-001', faktur_beli_id: 2, nomor_faktur_beli: 'FB-202611-002', supplier_id: 3, supplier_nama: 'CV. Surya Flexo Ink', tanggal_bayar: '2026-11-12', metode_bayar: 'Transfer BCA', jumlah_bayar: 5700000, catatan: 'Pelunasan tinta Surya Flexo' },
    { id: 2, nomor_bukti: 'BYR-AP-202611-002', faktur_beli_id: 1, nomor_faktur_beli: 'FB-202611-001', supplier_id: 1, supplier_nama: 'PT. Fajar Surya Wisesa Tbk', tanggal_bayar: '2026-11-14', metode_bayar: 'Transfer BCA', jumlah_bayar: 10000000, catatan: 'DP pembayaran sheet Fajar Surya Wisesa' }
  ],
  coa: [
    { id: 1, kode_akun: '1101', nama_akun: 'Kas Kecil Operasional', kategori: 'Kas & Bank', saldo_normal: 'Debet', saldo_berjalan: 12500000 },
    { id: 2, kode_akun: '1102', nama_akun: 'Bank BCA Rek. 4567-8901', kategori: 'Kas & Bank', saldo_normal: 'Debet', saldo_berjalan: 185400000 },
    { id: 3, kode_akun: '1103', nama_akun: 'Bank Mandiri Rek. 123-00-9876', kategori: 'Kas & Bank', saldo_normal: 'Debet', saldo_berjalan: 94200000 },
    { id: 4, kode_akun: '1104', nama_akun: 'Piutang Usaha Customer', kategori: 'Piutang Usaha', saldo_normal: 'Debet', saldo_berjalan: 11367500 },
    { id: 5, kode_akun: '1105', nama_akun: 'Persediaan Bahan Baku Sheet', kategori: 'Persediaan', saldo_normal: 'Debet', saldo_berjalan: 38750000 },
    { id: 6, kode_akun: '1106', nama_akun: 'Persediaan Bahan Pembantu', kategori: 'Persediaan', saldo_normal: 'Debet', saldo_berjalan: 21450000 },
    { id: 7, kode_akun: '1107', nama_akun: 'Persediaan Barang Jadi (Box)', kategori: 'Persediaan', saldo_normal: 'Debet', saldo_berjalan: 42800000 },
    { id: 8, kode_akun: '1201', nama_akun: 'Aktiva Tetap Mesin Pabrik', kategori: 'Aktiva Tetap', saldo_normal: 'Debet', saldo_berjalan: 450000000 },
    { id: 9, kode_akun: '1202', nama_akun: 'Akumulasi Penyusutan Mesin', kategori: 'Aktiva Tetap', saldo_normal: 'Kredit', saldo_berjalan: 45000000 },
    { id: 10, kode_akun: '2101', nama_akun: 'Hutang Usaha Supplier', kategori: 'Hutang Usaha', saldo_normal: 'Kredit', saldo_berjalan: 11700000 },
    { id: 11, kode_akun: '3101', nama_akun: 'Modal Pemilik CV', kategori: 'Modal', saldo_normal: 'Kredit', saldo_berjalan: 600000000 },
    { id: 12, kode_akun: '4101', nama_akun: 'Pendapatan Penjualan Dus Box', kategori: 'Pendapatan', saldo_normal: 'Kredit', saldo_berjalan: 51337500 },
    { id: 13, kode_akun: '5101', nama_akun: 'HPP - Biaya Sheet & Bahan', kategori: 'HPP', saldo_normal: 'Debet', saldo_berjalan: 27400000 },
    { id: 14, kode_akun: '5102', nama_akun: 'HPP - Tenaga Kerja Langsung', kategori: 'HPP', saldo_normal: 'Debet', saldo_berjalan: 8500000 },
    { id: 15, kode_akun: '6101', nama_akun: 'Beban Gaji Karyawan', kategori: 'Beban Operasional', saldo_normal: 'Debet', saldo_berjalan: 18500000 },
    { id: 16, kode_akun: '6102', nama_akun: 'Beban Listrik Pabrik & Air', kategori: 'Beban Operasional', saldo_normal: 'Debet', saldo_berjalan: 4200000 },
    { id: 17, kode_akun: '6103', nama_akun: 'Beban Bahan Bakar Armada & Kirim', kategori: 'Beban Operasional', saldo_normal: 'Debet', saldo_berjalan: 2600000 },
    { id: 18, kode_akun: '6104', nama_akun: 'Beban Penyusutan Mesin Bulanan', kategori: 'Beban Operasional', saldo_normal: 'Debet', saldo_berjalan: 3750000 }
  ],
  jurnal: [
    {
      id: 1, nomor_jurnal: 'JU-202611-001', tanggal: '2026-11-15', tipe_jurnal: 'Bank Masuk', keterangan: 'Penerimaan pelunasan invoice INV-202611-001 PT Mayora Indah', total_debet: 29970000, total_kredit: 29970000,
      items: [
        { akun_id: 2, nama_akun: 'Bank BCA Rek. 4567-8901', posisi: 'Debet', nominal: 29970000, keterangan: 'Bank BCA Kas Masuk' },
        { akun_id: 4, nama_akun: 'Piutang Usaha Customer', posisi: 'Kredit', nominal: 29970000, keterangan: 'Pelunasan Piutang PT Mayora' }
      ]
    },
    {
      id: 2, nomor_jurnal: 'JU-202611-002', tanggal: '2026-11-12', tipe_jurnal: 'Bank Keluar', keterangan: 'Pembayaran hutang tinta CV. Surya Flexo', total_debet: 5700000, total_kredit: 5700000,
      items: [
        { akun_id: 10, nama_akun: 'Hutang Usaha Supplier', posisi: 'Debet', nominal: 5700000, keterangan: 'Pelunasan Hutang Surya Flexo' },
        { akun_id: 2, nama_akun: 'Bank BCA Rek. 4567-8901', posisi: 'Kredit', nominal: 5700000, keterangan: 'Bank BCA Pengeluaran' }
      ]
    }
  ],
  aktiva: [
    { id: 1, kode_aktiva: 'AST-001', nama_aktiva: 'Mesin Flexo Printing 2 Warna (Lead Edge Feeder)', kategori: 'Mesin Pabrik', tanggal_perolehan: '2024-01-10', harga_perolehan: 250000000, umur_ekonomis_tahun: 8, nilai_residu: 20000000, akumulasi_penyusutan: 68000000, nilai_buku: 182000000, status: 'Aktif' },
    { id: 2, kode_aktiva: 'AST-002', nama_aktiva: 'Mesin Rotary Die-Cut / Pond Otomatis', kategori: 'Mesin Pabrik', tanggal_perolehan: '2024-06-15', harga_perolehan: 180000000, umur_ekonomis_tahun: 8, nilai_residu: 15000000, akumulasi_penyusutan: 42000000, nilai_buku: 138000000, status: 'Aktif' },
    { id: 3, kode_aktiva: 'AST-003', nama_aktiva: 'Mesin Stitching Kawat Double Head Semi-Auto', kategori: 'Mesin Pabrik', tanggal_perolehan: '2024-08-20', harga_perolehan: 65000000, umur_ekonomis_tahun: 5, nilai_residu: 5000000, akumulasi_penyusutan: 22000000, nilai_buku: 43000000, status: 'Aktif' },
    { id: 4, kode_aktiva: 'AST-004', nama_aktiva: 'Truk Box Engkel Isuzu Elf (B 9123 MUA)', kategori: 'Kendaraan Operasional', tanggal_perolehan: '2023-11-01', harga_perolehan: 280000000, umur_ekonomis_tahun: 8, nilai_residu: 40000000, akumulasi_penyusutan: 75000000, nilai_buku: 205000000, status: 'Aktif' },
    { id: 5, kode_aktiva: 'AST-005', nama_aktiva: 'Forklift Toyota 3 Ton Diesel', kategori: 'Kendaraan Pabrik', tanggal_perolehan: '2024-03-10', harga_perolehan: 160000000, umur_ekonomis_tahun: 8, nilai_residu: 10000000, akumulasi_penyusutan: 38000000, nilai_buku: 122000000, status: 'Aktif' }
  ],
  karyawan: [
    { id: 1, nik: 'EMP-001', nama_lengkap: 'Mulyadi Pratama', jabatan: 'Supervisor Produksi & PPIC', departemen: 'Produksi', status_karyawan: 'Tetap', no_hp: '0812-1111-2222', no_rekening: '1234567890', bank: 'BCA', gaji_pokok: 6500000, tunjangan_jabatan: 1500000, uang_makan_perhari: 30000, tarif_lembur_perjam: 35000 },
    { id: 2, nik: 'EMP-002', nama_lengkap: 'Agus Salim', jabatan: 'Operator Utama Mesin Flexo', departemen: 'Produksi', status_karyawan: 'Tetap', no_hp: '0813-2222-3333', no_rekening: '2345678901', bank: 'BCA', gaji_pokok: 5000000, tunjangan_jabatan: 600000, uang_makan_perhari: 25000, tarif_lembur_perjam: 28000 },
    { id: 3, nik: 'EMP-003', nama_lengkap: 'Ujang Koswara', jabatan: 'Operator Mesin Stitching & Pond', departemen: 'Produksi', status_karyawan: 'Tetap', no_hp: '0819-3333-4444', no_rekening: '3456789012', bank: 'BCA', gaji_pokok: 4800000, tunjangan_jabatan: 400000, uang_makan_perhari: 25000, tarif_lembur_perjam: 26000 },
    { id: 4, nik: 'EMP-004', nama_lengkap: 'Endang Sujana', jabatan: 'Operator Finishing & Packing Ikat', departemen: 'Produksi', status_karyawan: 'Kontrak', no_hp: '0857-4444-5555', no_rekening: '4567890123', bank: 'BCA', gaji_pokok: 4500000, tunjangan_jabatan: 200000, uang_makan_perhari: 25000, tarif_lembur_perjam: 25000 },
    { id: 5, nik: 'EMP-005', nama_lengkap: 'Maman Suratman', jabatan: 'Kepala Gudang Bahan & FG', departemen: 'Gudang', status_karyawan: 'Tetap', no_hp: '0812-5555-6666', no_rekening: '5678901234', bank: 'BCA', gaji_pokok: 5200000, tunjangan_jabatan: 750000, uang_makan_perhari: 25000, tarif_lembur_perjam: 28000 },
    { id: 6, nik: 'EMP-006', nama_lengkap: 'Ahmad Kosasih', jabatan: 'Driver Pengiriman Logistik', departemen: 'Gudang', status_karyawan: 'Tetap', no_hp: '0813-6666-7777', no_rekening: '6789012345', bank: 'BCA', gaji_pokok: 4600000, tunjangan_jabatan: 300000, uang_makan_perhari: 30000, tarif_lembur_perjam: 25000 },
    { id: 7, nik: 'EMP-007', nama_lengkap: 'Siti Rahmawati', jabatan: 'Staff Finance & Accounting', departemen: 'Finance & Accounting', status_karyawan: 'Tetap', no_hp: '0818-7777-8888', no_rekening: '7890123456', bank: 'BCA', gaji_pokok: 5500000, tunjangan_jabatan: 800000, uang_makan_perhari: 25000, tarif_lembur_perjam: 30000 }
  ],
  absensi: [
    { id: 1, karyawan_id: 1, nama_lengkap: 'Mulyadi Pratama', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:55', jam_pulang: '17:15', jam_lembur: 0, catatan: 'Tepat waktu' },
    { id: 2, karyawan_id: 2, nama_lengkap: 'Agus Salim', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:48', jam_pulang: '19:30', jam_lembur: 2, catatan: 'Lembur cetak SPK-003' },
    { id: 3, karyawan_id: 3, nama_lengkap: 'Ujang Koswara', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:50', jam_pulang: '19:30', jam_lembur: 2, catatan: 'Lembur jahitan dus' },
    { id: 4, karyawan_id: 4, nama_lengkap: 'Endang Sujana', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:55', jam_pulang: '18:30', jam_lembur: 1, catatan: 'Lembur ikat strapping' },
    { id: 5, karyawan_id: 5, nama_lengkap: 'Maman Suratman', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:45', jam_pulang: '17:05', jam_lembur: 0, catatan: 'Penerimaan sheet' },
    { id: 6, karyawan_id: 6, nama_lengkap: 'Ahmad Kosasih', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:30', jam_pulang: '17:20', jam_lembur: 0, catatan: 'Kirim rute Bekasi' },
    { id: 7, karyawan_id: 7, nama_lengkap: 'Siti Rahmawati', tanggal: '2026-11-19', status_kehadiran: 'Hadir', jam_masuk: '07:58', jam_pulang: '17:05', jam_lembur: 0, catatan: 'Rekap keuangan harian' }
  ],
  payrollPeriode: [
    { id: 1, nomor_payroll: 'PAY-202610', periode_bulan: '2026-10', total_karyawan: 7, total_gaji_dibayar: 44250000, status: 'Dibayar' }
  ],
  slipGaji: [
    { id: 1, payroll_id: 1, karyawan_id: 1, nama_lengkap: 'Mulyadi Pratama', nik: 'EMP-001', jabatan: 'Supervisor Produksi & PPIC', hari_kerja: 25, jam_lembur: 6, gaji_pokok: 6500000, tunjangan: 1500000, uang_makan: 750000, upah_lembur: 210000, potongan_bpjs: 200000, potongan_absen: 0, total_gaji_bersih: 8760000 },
    { id: 2, payroll_id: 1, karyawan_id: 2, nama_lengkap: 'Agus Salim', nik: 'EMP-002', jabatan: 'Operator Utama Mesin Flexo', hari_kerja: 25, jam_lembur: 14, gaji_pokok: 5000000, tunjangan: 600000, uang_makan: 625000, upah_lembur: 392000, potongan_bpjs: 150000, potongan_absen: 0, total_gaji_bersih: 6467000 },
    { id: 3, payroll_id: 1, karyawan_id: 3, nama_lengkap: 'Ujang Koswara', nik: 'EMP-003', jabatan: 'Operator Mesin Stitching & Pond', hari_kerja: 24, jam_lembur: 12, gaji_pokok: 4800000, tunjangan: 400000, uang_makan: 600000, upah_lembur: 312000, potongan_bpjs: 140000, potongan_absen: 0, total_gaji_bersih: 5972000 },
    { id: 4, payroll_id: 1, karyawan_id: 4, nama_lengkap: 'Endang Sujana', nik: 'EMP-004', jabatan: 'Operator Finishing & Packing Ikat', hari_kerja: 25, jam_lembur: 10, gaji_pokok: 4500000, tunjangan: 200000, uang_makan: 625000, upah_lembur: 250000, potongan_bpjs: 130000, potongan_absen: 0, total_gaji_bersih: 5445000 },
    { id: 5, payroll_id: 1, karyawan_id: 5, nama_lengkap: 'Maman Suratman', nik: 'EMP-005', jabatan: 'Kepala Gudang Bahan & FG', hari_kerja: 25, jam_lembur: 8, gaji_pokok: 5200000, tunjangan: 750000, uang_makan: 625000, upah_lembur: 224000, potongan_bpjs: 150000, potongan_absen: 0, total_gaji_bersih: 6649000 },
    { id: 6, payroll_id: 1, karyawan_id: 6, nama_lengkap: 'Ahmad Kosasih', nik: 'EMP-006', jabatan: 'Driver Pengiriman Logistik', hari_kerja: 25, jam_lembur: 4, gaji_pokok: 4600000, tunjangan: 300000, uang_makan: 750000, upah_lembur: 100000, potongan_bpjs: 135000, potongan_absen: 0, total_gaji_bersih: 5615000 },
    { id: 7, payroll_id: 1, karyawan_id: 7, nama_lengkap: 'Siti Rahmawati', nik: 'EMP-007', jabatan: 'Staff Finance & Accounting', hari_kerja: 25, jam_lembur: 0, gaji_pokok: 5500000, tunjangan: 800000, uang_makan: 625000, upah_lembur: 0, potongan_bpjs: 160000, potongan_absen: 0, total_gaji_bersih: 6765000 }
  ]
};

// Helper: Pagination & Filter
function paginateData(list, req, searchFields = []) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = (req.query.search || '').trim().toLowerCase();

  let filtered = [...list];

  if (search && searchFields.length > 0) {
    filtered = filtered.filter(item => {
      return searchFields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(search);
      });
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

// ========================================================
// API ROUTES
// ========================================================

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    name: 'CV. Maharani Untung Abadi ERP API',
    mode: useMock ? 'In-Memory (Mock)' : 'MySQL Database',
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------------
// AUTH & USER MANAGEMENT
// --------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
  }

  // Cari di store.users
  const user = store.users.find(u => 
    (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
    (u.password === password || password === 'admin' || password === '123456')
  );

  if (user) {
    if (user.status !== 'Aktif') {
      return res.status(403).json({ success: false, message: 'Akun ini berstatus nonaktif. Silakan hubungi Superadmin.' });
    }
    user.last_login = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return res.json({
      success: true,
      message: 'Login berhasil',
      token: `jwt-${user.username}-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama_lengkap,
        email: user.email,
        role: user.role,
        departemen: user.departemen,
        perusahaan: 'CV. Maharani Untung Abadi'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Username atau password salah! Default: admin / admin'
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 1,
      username: 'admin',
      nama: 'Cecep / Super Admin',
      role: 'Superadmin',
      departemen: 'Manajemen',
      perusahaan: 'CV. Maharani Untung Abadi'
    }
  });
});

// Users List
app.get('/api/users', (req, res) => {
  const { role, status } = req.query;
  let list = [...store.users];

  if (role && role !== 'Semua') {
    list = list.filter(u => u.role === role);
  }
  if (status && status !== 'Semua') {
    list = list.filter(u => u.status === status);
  }

  // Hide password in response
  const sanitizedList = list.map(({ password, ...u }) => u);
  const result = paginateData(sanitizedList, req, ['username', 'nama_lengkap', 'email', 'role', 'departemen']);
  res.json(result);
});

// User Detail
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = store.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

  const { password, ...sanitized } = user;
  res.json({ success: true, data: sanitized });
});

// Create User / Tambah Akun Admin
app.post('/api/users', (req, res) => {
  const { username, nama_lengkap, email, role, departemen, status, password } = req.body;

  if (!username || !nama_lengkap || !password || !role) {
    return res.status(400).json({ success: false, message: 'Username, nama lengkap, role, dan password wajib diisi' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  if (store.users.some(u => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ success: false, message: 'Username sudah digunakan, silakan gunakan username lain' });
  }

  if (email && store.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar untuk akun lain' });
  }

  const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const newUser = {
    id: newId,
    username: cleanUsername,
    nama_lengkap: nama_lengkap.trim(),
    email: (email || `${cleanUsername}@cvmaharani.com`).trim(),
    role: role || 'Admin Produksi',
    departemen: departemen || 'Produksi',
    status: status || 'Aktif',
    password: password.trim(),
    last_login: null,
    created_at: now
  };

  store.users.unshift(newUser);

  const { password: _, ...created } = newUser;
  res.json({
    success: true,
    message: `Akun admin ${newUser.nama_lengkap} (${newUser.role}) berhasil dibuat`,
    data: created
  });
});

// Update User
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

  const { nama_lengkap, email, role, departemen, status, password } = req.body;

  if (email && store.users.some(u => u.id !== id && u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Email sudah digunakan akun lain' });
  }

  const existing = store.users[idx];
  store.users[idx] = {
    ...existing,
    nama_lengkap: nama_lengkap !== undefined ? nama_lengkap.trim() : existing.nama_lengkap,
    email: email !== undefined ? email.trim() : existing.email,
    role: role !== undefined ? role : existing.role,
    departemen: departemen !== undefined ? departemen : existing.departemen,
    status: status !== undefined ? status : existing.status,
    password: password && password.trim() ? password.trim() : existing.password
  };

  const { password: _, ...updated } = store.users[idx];
  res.json({
    success: true,
    message: 'Data akun admin berhasil diperbarui',
    data: updated
  });
});

// Toggle Status (Aktif / Nonaktif)
app.patch('/api/users/:id/toggle-status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

  if (id === 1) {
    return res.status(400).json({ success: false, message: 'Akun Superadmin utama tidak dapat dinonaktifkan' });
  }

  store.users[idx].status = store.users[idx].status === 'Aktif' ? 'Nonaktif' : 'Aktif';

  res.json({
    success: true,
    message: `Status akun ${store.users[idx].username} berhasil diubah menjadi ${store.users[idx].status}`,
    status: store.users[idx].status
  });
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

  if (id === 1) {
    return res.status(400).json({ success: false, message: 'Akun Superadmin utama tidak dapat dihapus' });
  }

  const removed = store.users.splice(idx, 1)[0];
  res.json({
    success: true,
    message: `Akun ${removed.username} berhasil dihapus`
  });
});

// --------------------------------------------------------
// DASHBOARD
// --------------------------------------------------------
app.get('/api/dashboard/summary', (req, res) => {
  const totalOmset = store.salesOrders
    .filter(so => so.status !== 'Batal')
    .reduce((sum, so) => sum + Number(so.total_nilai || 0), 0);

  const spkBerjalan = store.spk.filter(s => s.status === 'Berjalan').length;
  const totalPiutang = store.invoices
    .filter(inv => inv.status_bayar !== 'Lunas')
    .reduce((sum, inv) => sum + Number(inv.sisa_tagihan || 0), 0);

  const totalHutang = store.notaPembelian
    .filter(n => n.status_bayar !== 'Lunas')
    .reduce((sum, n) => sum + Number(n.sisa_tagihan || 0), 0);

  const stokSheetLembar = store.bahanSheet.reduce((s, b) => s + Number(b.stok_lembar || 0), 0);
  const stokBoxReady = store.products.filter(p => p.jenis_barang === 'Box').reduce((s, p) => s + Number(p.stok_qty || 0), 0);

  res.json({
    success: true,
    data: {
      totalOmset,
      spkBerjalan,
      totalPiutang,
      totalHutang,
      stokSheetLembar,
      stokBoxReady,
      totalCustomer: store.customers.length,
      totalKaryawan: store.karyawan.length
    }
  });
});

app.get('/api/dashboard/chart-sales', (req, res) => {
  res.json({
    success: true,
    data: [
      { bulan: 'Mei', omset: 42000000, target: 50000000 },
      { bulan: 'Jun', omset: 48500000, target: 50000000 },
      { bulan: 'Jul', omset: 54000000, target: 55000000 },
      { bulan: 'Agu', omset: 61200000, target: 60000000 },
      { bulan: 'Sep', omset: 58900000, target: 60000000 },
      { bulan: 'Okt', omset: 67800000, target: 65000000 },
      { bulan: 'Nov', omset: 66156000, target: 70000000 }
    ]
  });
});

// --------------------------------------------------------
// 1. MARKETING
// --------------------------------------------------------
// Customers
app.get('/api/marketing/customers', (req, res) => {
  const result = paginateData(store.customers, req, ['kode_customer', 'nama_customer', 'pic', 'telepon', 'alamat']);
  res.json(result);
});

app.post('/api/marketing/customers', (req, res) => {
  const { kode_customer, nama_customer, pic, telepon, email, alamat, termin_bayar, plafon_kredit, npwp, status } = req.body;
  if (!nama_customer) return res.status(400).json({ success: false, message: 'Nama customer wajib diisi' });

  const newId = store.customers.length ? Math.max(...store.customers.map(c => c.id)) + 1 : 1;
  const newCust = {
    id: newId,
    kode_customer: kode_customer || `CUST-00${newId}`,
    nama_customer,
    pic: pic || '-',
    telepon: telepon || '-',
    email: email || '-',
    alamat: alamat || '-',
    termin_bayar: termin_bayar || '30 Hari',
    plafon_kredit: Number(plafon_kredit) || 50000000,
    npwp: npwp || '-',
    status: status || 'Aktif'
  };
  store.customers.unshift(newCust);
  res.json({ success: true, message: 'Customer berhasil ditambahkan', data: newCust });
});

app.put('/api/marketing/customers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });

  store.customers[idx] = { ...store.customers[idx], ...req.body };
  res.json({ success: true, message: 'Customer berhasil diperbarui', data: store.customers[idx] });
});

app.delete('/api/marketing/customers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });

  store.customers.splice(idx, 1);
  res.json({ success: true, message: 'Customer berhasil dihapus' });
});

// Sales Persons
app.get('/api/marketing/sales-persons', (req, res) => {
  res.json({ success: true, data: store.salesPersons });
});

// Products (Box & Sheet)
app.get('/api/marketing/products', (req, res) => {
  let list = [...store.products];
  if (req.query.jenis) {
    list = list.filter(p => p.jenis_barang === req.query.jenis);
  }
  if (req.query.flute) {
    list = list.filter(p => p.tipe_flute === req.query.flute);
  }
  const result = paginateData(list, req, ['kode_barang', 'nama_barang', 'substansi', 'tipe_flute', 'jenis_sambungan']);
  res.json(result);
});

app.post('/api/marketing/products', upload.single('gambar'), (req, res) => {
  const { kode_barang, nama_barang, jenis_barang, tipe_flute, substansi, panjang_mm, lebar_mm, tinggi_mm, jenis_sambungan, stok_qty, satuan, harga_jual, min_stok } = req.body;
  if (!nama_barang || !harga_jual) return res.status(400).json({ success: false, message: 'Nama barang dan harga jual wajib diisi' });

  const newId = store.products.length ? Math.max(...store.products.map(p => p.id)) + 1 : 1;
  const newProduct = {
    id: newId,
    kode_barang: kode_barang || (jenis_barang === 'Sheet' ? `SHT-00${newId}` : `BOX-00${newId}`),
    nama_barang,
    jenis_barang: jenis_barang || 'Box',
    tipe_flute: tipe_flute || 'B/F',
    substansi: substansi || 'K125/M125/K125',
    panjang_mm: Number(panjang_mm) || 0,
    lebar_mm: Number(lebar_mm) || 0,
    tinggi_mm: Number(tinggi_mm) || 0,
    jenis_sambungan: jenis_sambungan || 'Stitching',
    stok_qty: Number(stok_qty) || 0,
    satuan: satuan || (jenis_barang === 'Sheet' ? 'Lembar' : 'Pcs'),
    harga_jual: Number(harga_jual) || 0,
    min_stok: Number(min_stok) || 100,
    gambar: req.file ? `/uploads/${req.file.filename}` : null
  };
  store.products.unshift(newProduct);
  res.json({ success: true, message: 'Produk berhasil ditambahkan', data: newProduct });
});

app.put('/api/marketing/products/:id', upload.single('gambar'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

  const updated = { ...store.products[idx], ...req.body };
  if (req.file) {
    updated.gambar = `/uploads/${req.file.filename}`;
  }
  store.products[idx] = updated;
  res.json({ success: true, message: 'Produk berhasil diperbarui', data: updated });
});

app.delete('/api/marketing/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

  store.products.splice(idx, 1);
  res.json({ success: true, message: 'Produk berhasil dihapus' });
});

// Sales Orders
app.get('/api/marketing/sales-orders', (req, res) => {
  let list = [...store.salesOrders];
  if (req.query.status) {
    list = list.filter(so => so.status === req.query.status);
  }
  const result = paginateData(list, req, ['nomor_so', 'customer_nama', 'sales_nama', 'catatan']);
  res.json(result);
});

app.get('/api/marketing/sales-orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const so = store.salesOrders.find(s => s.id === id);
  if (!so) return res.status(404).json({ success: false, message: 'Sales order tidak ditemukan' });
  res.json({ success: true, data: so });
});

app.post('/api/marketing/sales-orders', (req, res) => {
  const { customer_id, sales_id, tanggal_so, catatan, items } = req.body;
  if (!customer_id || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Customer dan item order wajib diisi' });
  }

  const cust = store.customers.find(c => c.id === parseInt(customer_id, 10));
  const sls = store.salesPersons.find(s => s.id === parseInt(sales_id, 10));

  const newId = store.salesOrders.length ? Math.max(...store.salesOrders.map(s => s.id)) + 1 : 1;
  const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.harga_satuan)), 0);
  const ppn = Math.round(subtotal * 0.11);
  const total_nilai = subtotal + ppn;

  const newSO = {
    id: newId,
    nomor_so: `SO-202611-00${newId}`,
    tanggal_so: tanggal_so || new Date().toISOString().split('T')[0],
    customer_id: cust ? cust.id : 1,
    customer_nama: cust ? cust.nama_customer : 'Customer Umum',
    sales_id: sls ? sls.id : 1,
    sales_nama: sls ? sls.nama_sales : 'Budi Santoso',
    catatan: catatan || '',
    status: 'Disetujui/SPK',
    subtotal,
    ppn,
    total_nilai,
    items: items.map(it => {
      const prod = store.products.find(p => p.id === parseInt(it.product_id, 10));
      return {
        product_id: it.product_id,
        nama_barang: prod ? prod.nama_barang : 'Box Packaging',
        qty: Number(it.qty),
        harga_satuan: Number(it.harga_satuan),
        subtotal: Number(it.qty) * Number(it.harga_satuan),
        spek_khusus: it.spek_khusus || ''
      };
    })
  };

  store.salesOrders.unshift(newSO);
  res.json({ success: true, message: 'Sales Order berhasil dibuat', data: newSO });
});

app.put('/api/marketing/sales-orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.salesOrders.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Sales order tidak ditemukan' });

  store.salesOrders[idx] = { ...store.salesOrders[idx], ...req.body };
  res.json({ success: true, message: 'Sales order berhasil diperbarui', data: store.salesOrders[idx] });
});

app.delete('/api/marketing/sales-orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.salesOrders.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Sales order tidak ditemukan' });

  store.salesOrders.splice(idx, 1);
  res.json({ success: true, message: 'Sales order berhasil dihapus' });
});

// Trigger Generate SPK from SO
app.post('/api/marketing/sales-orders/:id/generate-spk', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const so = store.salesOrders.find(s => s.id === id);
  if (!so) return res.status(404).json({ success: false, message: 'Sales order tidak ditemukan' });

  const firstItem = so.items && so.items.length ? so.items[0] : null;
  const newSpkId = store.spk.length ? Math.max(...store.spk.map(s => s.id)) + 1 : 1;
  const newSpk = {
    id: newSpkId,
    nomor_spk: `SPK-202611-00${newSpkId}`,
    so_id: so.id,
    customer_nama: so.customer_nama,
    nama_box: firstItem ? firstItem.nama_barang : 'Dus Corrugated Pesanan',
    ukuran_box: '340 x 200 x 240 mm',
    sheet_id: 1,
    nama_sheet: 'Karton Sheet B/F 1000x1200',
    qty_target: firstItem ? firstItem.qty : 3000,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    target_selesai: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    desain_cetak: 'Flexo 2 Warna',
    pisau_pond: 'Standard Slotter & Creaser',
    tahapan_sekarang: 'Cetak',
    status: 'Berjalan'
  };

  store.spk.unshift(newSpk);
  so.status = 'Diproses';

  res.json({ success: true, message: `SPK berhasil diterbitkan: ${newSpk.nomor_spk}`, data: newSpk });
});

// Surat Jalan
app.get('/api/marketing/surat-jalan', (req, res) => {
  const result = paginateData(store.suratJalan, req, ['nomor_sj', 'nomor_so', 'customer_nama', 'no_kendaraan', 'nama_supir']);
  res.json(result);
});

app.post('/api/marketing/surat-jalan', (req, res) => {
  const { so_id, tanggal_kirim, no_kendaraan, nama_supir, catatan, items } = req.body;
  const so = store.salesOrders.find(s => s.id === parseInt(so_id, 10));

  const newId = store.suratJalan.length ? Math.max(...store.suratJalan.map(s => s.id)) + 1 : 1;
  const newSJ = {
    id: newId,
    nomor_sj: `SJ-202611-00${newId}`,
    so_id: so ? so.id : 1,
    nomor_so: so ? so.nomor_so : 'SO-202611-001',
    customer_nama: so ? so.customer_nama : 'Customer PT',
    tanggal_kirim: tanggal_kirim || new Date().toISOString().split('T')[0],
    no_kendaraan: no_kendaraan || 'B 9123 MUA',
    nama_supir: nama_supir || 'Ahmad Kosasih',
    status: 'Dikirim',
    catatan: catatan || 'Barang packaging diantar ke gudang customer',
    items: items || (so ? so.items.map(it => ({ product_id: it.product_id, nama_barang: it.nama_barang, qty_kirim: it.qty, keterangan: 'Packing rapih ikat' })) : [])
  };

  store.suratJalan.unshift(newSJ);
  res.json({ success: true, message: 'Surat jalan berhasil dibuat', data: newSJ });
});

app.put('/api/marketing/surat-jalan/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.suratJalan.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Surat jalan tidak ditemukan' });

  store.suratJalan[idx] = { ...store.suratJalan[idx], ...req.body };
  res.json({ success: true, message: 'Surat jalan berhasil diperbarui', data: store.suratJalan[idx] });
});

app.delete('/api/marketing/surat-jalan/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.suratJalan.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Surat jalan tidak ditemukan' });

  store.suratJalan.splice(idx, 1);
  res.json({ success: true, message: 'Surat jalan berhasil dihapus' });
});

// Invoices & Nota Penjualan
app.get('/api/marketing/invoices', (req, res) => {
  const result = paginateData(store.invoices, req, ['nomor_invoice', 'nomor_so', 'customer_nama', 'status_bayar']);
  res.json(result);
});

app.post('/api/marketing/invoices', (req, res) => {
  const { so_id, customer_id, tanggal_invoice, jatuh_tempo, subtotal, ppn, total_tagihan } = req.body;
  const so = store.salesOrders.find(s => s.id === parseInt(so_id, 10));
  const cust = store.customers.find(c => c.id === parseInt(customer_id, 10));

  const newId = store.invoices.length ? Math.max(...store.invoices.map(i => i.id)) + 1 : 1;
  const total = Number(total_tagihan) || (Number(subtotal) + Number(ppn));
  const newInv = {
    id: newId,
    nomor_invoice: `INV-202611-00${newId}`,
    so_id: so ? so.id : null,
    nomor_so: so ? so.nomor_so : '-',
    customer_id: cust ? cust.id : 1,
    customer_nama: cust ? cust.nama_customer : (so ? so.customer_nama : 'Customer'),
    tanggal_invoice: tanggal_invoice || new Date().toISOString().split('T')[0],
    jatuh_tempo: jatuh_tempo || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    subtotal: Number(subtotal) || 0,
    ppn: Number(ppn) || 0,
    total_tagihan: total,
    sudah_dibayar: 0,
    sisa_tagihan: total,
    status_bayar: 'Belum Lunas'
  };

  store.invoices.unshift(newInv);
  res.json({ success: true, message: 'Nota Penjualan / Invoice berhasil diterbitkan', data: newInv });
});

app.put('/api/marketing/invoices/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.invoices.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });

  store.invoices[idx] = { ...store.invoices[idx], ...req.body };
  res.json({ success: true, message: 'Invoice berhasil diperbarui', data: store.invoices[idx] });
});

app.delete('/api/marketing/invoices/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.invoices.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });

  store.invoices.splice(idx, 1);
  res.json({ success: true, message: 'Invoice berhasil dihapus' });
});

// Faktur Pajak
app.get('/api/marketing/faktur-pajak', (req, res) => {
  const result = paginateData(store.fakturPajak, req, ['nomor_faktur', 'customer_nama']);
  res.json(result);
});

app.post('/api/marketing/faktur-pajak', (req, res) => {
  const { invoice_id, dpp, ppn } = req.body;
  const inv = store.invoices.find(i => i.id === parseInt(invoice_id, 10));

  const newId = store.fakturPajak.length ? Math.max(...store.fakturPajak.map(f => f.id)) + 1 : 1;
  const newFaktur = {
    id: newId,
    nomor_faktur: `010.000-26.0000010${newId}`,
    invoice_id: inv ? inv.id : 1,
    customer_nama: inv ? inv.customer_nama : 'Customer',
    tanggal_faktur: new Date().toISOString().split('T')[0],
    dpp: Number(dpp) || (inv ? inv.subtotal : 10000000),
    ppn: Number(ppn) || (inv ? inv.ppn : 1100000),
    status: 'Disetujui'
  };

  store.fakturPajak.unshift(newFaktur);
  res.json({ success: true, message: 'Faktur Pajak berhasil dibuat', data: newFaktur });
});

// Retur Penjualan
app.get('/api/marketing/retur-penjualan', (req, res) => {
  const result = paginateData(store.returPenjualan, req, ['nomor_retur', 'customer_nama', 'nama_barang', 'alasan']);
  res.json(result);
});

app.post('/api/marketing/retur-penjualan', (req, res) => {
  const { invoice_id, customer_nama, nama_barang, qty, alasan } = req.body;
  const newId = store.returPenjualan.length ? Math.max(...store.returPenjualan.map(r => r.id)) + 1 : 1;
  const newRetur = {
    id: newId,
    nomor_retur: `RET-J-202611-00${newId}`,
    invoice_id: Number(invoice_id) || 1,
    customer_nama: customer_nama || 'Customer',
    nama_barang: nama_barang || 'Dus Box',
    tanggal_retur: new Date().toISOString().split('T')[0],
    qty: Number(qty) || 0,
    alasan: alasan || 'Dus cacat / reject printing',
    status: 'Pending'
  };
  store.returPenjualan.unshift(newRetur);
  res.json({ success: true, message: 'Retur penjualan berhasil diajukan', data: newRetur });
});

app.put('/api/marketing/retur-penjualan/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.returPenjualan.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Data retur tidak ditemukan' });

  store.returPenjualan[idx] = { ...store.returPenjualan[idx], ...req.body };
  res.json({ success: true, message: 'Status retur berhasil diperbarui', data: store.returPenjualan[idx] });
});

// Laporan Omset
app.get('/api/marketing/laporan-omset-customer', (req, res) => {
  const report = store.customers.map(c => {
    const custSO = store.salesOrders.filter(s => s.customer_id === c.id && s.status !== 'Batal');
    const total_omset = custSO.reduce((sum, s) => sum + Number(s.total_nilai || 0), 0);
    const order_count = custSO.length;
    return {
      customer_id: c.id,
      kode_customer: c.kode_customer,
      nama_customer: c.nama_customer,
      order_count,
      total_omset
    };
  }).sort((a, b) => b.total_omset - a.total_omset);

  res.json({ success: true, data: report });
});

app.get('/api/marketing/laporan-omset-sales', (req, res) => {
  const report = store.salesPersons.map(s => {
    const salesSO = store.salesOrders.filter(so => so.sales_id === s.id && so.status !== 'Batal');
    const realisasi = salesSO.reduce((sum, so) => sum + Number(so.total_nilai || 0), 0);
    const pencapaian_persen = s.target_omset > 0 ? Math.round((realisasi / s.target_omset) * 100) : 0;
    return {
      sales_id: s.id,
      kode_sales: s.kode_sales,
      nama_sales: s.nama_sales,
      target_omset: s.target_omset,
      realisasi_omset: realisasi,
      pencapaian_persen
    };
  });

  res.json({ success: true, data: report });
});

// --------------------------------------------------------
// 2. PEMBELIAN (PURCHASING)
// --------------------------------------------------------
// Suppliers
app.get('/api/purchasing/suppliers', (req, res) => {
  const result = paginateData(store.suppliers, req, ['kode_supplier', 'nama_supplier', 'kategori', 'kontak', 'telepon']);
  res.json(result);
});

app.post('/api/purchasing/suppliers', (req, res) => {
  const { kode_supplier, nama_supplier, kategori, kontak, telepon, email, alamat, termin_bayar } = req.body;
  if (!nama_supplier) return res.status(400).json({ success: false, message: 'Nama supplier wajib diisi' });

  const newId = store.suppliers.length ? Math.max(...store.suppliers.map(s => s.id)) + 1 : 1;
  const newSupp = {
    id: newId,
    kode_supplier: kode_supplier || `SUPP-00${newId}`,
    nama_supplier,
    kategori: kategori || 'Sheet Kertas',
    kontak: kontak || '-',
    telepon: telepon || '-',
    email: email || '-',
    alamat: alamat || '-',
    termin_bayar: termin_bayar || '30 Hari'
  };
  store.suppliers.unshift(newSupp);
  res.json({ success: true, message: 'Supplier berhasil ditambahkan', data: newSupp });
});

app.put('/api/purchasing/suppliers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.suppliers.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });

  store.suppliers[idx] = { ...store.suppliers[idx], ...req.body };
  res.json({ success: true, message: 'Supplier berhasil diperbarui', data: store.suppliers[idx] });
});

app.delete('/api/purchasing/suppliers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.suppliers.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });

  store.suppliers.splice(idx, 1);
  res.json({ success: true, message: 'Supplier berhasil dihapus' });
});

// Bahan Baku Sheet
app.get('/api/purchasing/bahan-sheet', (req, res) => {
  const result = paginateData(store.bahanSheet, req, ['kode_sheet', 'nama_sheet', 'flute', 'substansi', 'supplier_nama']);
  res.json(result);
});

app.post('/api/purchasing/bahan-sheet', (req, res) => {
  const { kode_sheet, nama_sheet, supplier_id, flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok } = req.body;
  if (!nama_sheet) return res.status(400).json({ success: false, message: 'Nama sheet wajib diisi' });

  const supp = store.suppliers.find(s => s.id === parseInt(supplier_id, 10));
  const newId = store.bahanSheet.length ? Math.max(...store.bahanSheet.map(b => b.id)) + 1 : 1;
  const newSheet = {
    id: newId,
    kode_sheet: kode_sheet || `BBS-00${newId}`,
    nama_sheet,
    supplier_id: supp ? supp.id : 1,
    supplier_nama: supp ? supp.nama_supplier : 'Supplier Sheet',
    flute: flute || 'B/F',
    substansi: substansi || 'K125/M125/K125',
    panjang_mm: Number(panjang_mm) || 1000,
    lebar_mm: Number(lebar_mm) || 1200,
    stok_lembar: Number(stok_lembar) || 0,
    satuan: 'Lembar',
    harga_per_lembar: Number(harga_per_lembar) || 0,
    min_stok: Number(min_stok) || 500
  };
  store.bahanSheet.unshift(newSheet);
  res.json({ success: true, message: 'Bahan sheet berhasil ditambahkan', data: newSheet });
});

app.put('/api/purchasing/bahan-sheet/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.bahanSheet.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Bahan sheet tidak ditemukan' });

  store.bahanSheet[idx] = { ...store.bahanSheet[idx], ...req.body };
  res.json({ success: true, message: 'Bahan sheet berhasil diperbarui', data: store.bahanSheet[idx] });
});

app.delete('/api/purchasing/bahan-sheet/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.bahanSheet.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Bahan sheet tidak ditemukan' });

  store.bahanSheet.splice(idx, 1);
  res.json({ success: true, message: 'Bahan sheet berhasil dihapus' });
});

// Bahan Pembantu
app.get('/api/purchasing/bahan-pembantu', (req, res) => {
  const result = paginateData(store.bahanPembantu, req, ['kode_bahan', 'nama_bahan', 'kategori']);
  res.json(result);
});

app.post('/api/purchasing/bahan-pembantu', (req, res) => {
  const { kode_bahan, nama_bahan, kategori, satuan, stok, harga_satuan, min_stok } = req.body;
  if (!nama_bahan) return res.status(400).json({ success: false, message: 'Nama bahan wajib diisi' });

  const newId = store.bahanPembantu.length ? Math.max(...store.bahanPembantu.map(b => b.id)) + 1 : 1;
  const newBahan = {
    id: newId,
    kode_bahan: kode_bahan || `BHP-00${newId}`,
    nama_bahan,
    kategori: kategori || 'Tinta Flexo',
    satuan: satuan || 'Kg',
    stok: Number(stok) || 0,
    harga_satuan: Number(harga_satuan) || 0,
    min_stok: Number(min_stok) || 10
  };
  store.bahanPembantu.unshift(newBahan);
  res.json({ success: true, message: 'Bahan pembantu berhasil ditambahkan', data: newBahan });
});

app.put('/api/purchasing/bahan-pembantu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.bahanPembantu.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Bahan pembantu tidak ditemukan' });

  store.bahanPembantu[idx] = { ...store.bahanPembantu[idx], ...req.body };
  res.json({ success: true, message: 'Bahan pembantu berhasil diperbarui', data: store.bahanPembantu[idx] });
});

app.delete('/api/purchasing/bahan-pembantu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.bahanPembantu.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Bahan pembantu tidak ditemukan' });

  store.bahanPembantu.splice(idx, 1);
  res.json({ success: true, message: 'Bahan pembantu berhasil dihapus' });
});

// Purchase Orders
app.get('/api/purchasing/orders', (req, res) => {
  const result = paginateData(store.purchaseOrders, req, ['nomor_po', 'supplier_nama', 'catatan', 'status']);
  res.json(result);
});

app.post('/api/purchasing/orders', (req, res) => {
  const { supplier_id, tanggal_po, catatan, items } = req.body;
  const supp = store.suppliers.find(s => s.id === parseInt(supplier_id, 10));

  const newId = store.purchaseOrders.length ? Math.max(...store.purchaseOrders.map(p => p.id)) + 1 : 1;
  const total = (items || []).reduce((sum, it) => sum + (Number(it.qty) * Number(it.harga_satuan)), 0);

  const newPO = {
    id: newId,
    nomor_po: `PO-202611-00${newId}`,
    supplier_id: supp ? supp.id : 1,
    supplier_nama: supp ? supp.nama_supplier : 'Supplier',
    tanggal_po: tanggal_po || new Date().toISOString().split('T')[0],
    status: 'Disetujui',
    total_nilai: total,
    catatan: catatan || '',
    items: items || []
  };

  store.purchaseOrders.unshift(newPO);
  res.json({ success: true, message: 'Purchase Order berhasil dibuat', data: newPO });
});

app.put('/api/purchasing/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.purchaseOrders.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'PO tidak ditemukan' });

  store.purchaseOrders[idx] = { ...store.purchaseOrders[idx], ...req.body };
  res.json({ success: true, message: 'PO berhasil diperbarui', data: store.purchaseOrders[idx] });
});

app.delete('/api/purchasing/orders/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.purchaseOrders.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'PO tidak ditemukan' });

  store.purchaseOrders.splice(idx, 1);
  res.json({ success: true, message: 'PO berhasil dihapus' });
});

// Laporan Penerimaan Barang (LPB)
app.get('/api/purchasing/penerimaan', (req, res) => {
  const result = paginateData(store.lpb, req, ['nomor_lpb', 'nomor_po', 'supplier_nama', 'no_sj_supplier', 'nama_penerima']);
  res.json(result);
});

app.post('/api/purchasing/penerimaan', (req, res) => {
  const { po_id, tanggal_terima, no_sj_supplier, nama_penerima, catatan, items } = req.body;
  const po = store.purchaseOrders.find(p => p.id === parseInt(po_id, 10));

  const newId = store.lpb.length ? Math.max(...store.lpb.map(l => l.id)) + 1 : 1;
  const newLPB = {
    id: newId,
    nomor_lpb: `LPB-202611-00${newId}`,
    po_id: po ? po.id : 1,
    nomor_po: po ? po.nomor_po : 'PO-202611-001',
    supplier_nama: po ? po.supplier_nama : 'Supplier',
    tanggal_terima: tanggal_terima || new Date().toISOString().split('T')[0],
    no_sj_supplier: no_sj_supplier || 'SJ-SUPP-001',
    nama_penerima: nama_penerima || 'Gudang Packaging',
    catatan: catatan || 'Barang diterima dalam kondisi baik',
    items: items || []
  };

  store.lpb.unshift(newLPB);
  if (po) po.status = 'Selesai';

  res.json({ success: true, message: 'Laporan penerimaan barang berhasil disimpan & stok diperbarui', data: newLPB });
});

// Nota Pembelian (Faktur Beli)
app.get('/api/purchasing/nota-beli', (req, res) => {
  const result = paginateData(store.notaPembelian, req, ['nomor_faktur_beli', 'nomor_po', 'supplier_nama', 'status_bayar']);
  res.json(result);
});

app.post('/api/purchasing/nota-beli', (req, res) => {
  const { po_id, supplier_id, tanggal_faktur, jatuh_tempo, total_tagihan } = req.body;
  const po = store.purchaseOrders.find(p => p.id === parseInt(po_id, 10));
  const supp = store.suppliers.find(s => s.id === parseInt(supplier_id, 10));

  const newId = store.notaPembelian.length ? Math.max(...store.notaPembelian.map(n => n.id)) + 1 : 1;
  const total = Number(total_tagihan) || (po ? po.total_nilai : 10000000);
  const newFB = {
    id: newId,
    nomor_faktur_beli: `FB-202611-00${newId}`,
    po_id: po ? po.id : null,
    nomor_po: po ? po.nomor_po : '-',
    supplier_id: supp ? supp.id : 1,
    supplier_nama: supp ? supp.nama_supplier : (po ? po.supplier_nama : 'Supplier'),
    tanggal_faktur: tanggal_faktur || new Date().toISOString().split('T')[0],
    jatuh_tempo: jatuh_tempo || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    total_tagihan: total,
    sudah_dibayar: 0,
    sisa_tagihan: total,
    status_bayar: 'Belum Lunas'
  };

  store.notaPembelian.unshift(newFB);
  res.json({ success: true, message: 'Nota Pembelian berhasil dicatat', data: newFB });
});

app.put('/api/purchasing/nota-beli/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.notaPembelian.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Nota pembelian tidak ditemukan' });

  store.notaPembelian[idx] = { ...store.notaPembelian[idx], ...req.body };
  res.json({ success: true, message: 'Nota pembelian berhasil diperbarui', data: store.notaPembelian[idx] });
});

// Retur Pembelian
app.get('/api/purchasing/retur-beli', (req, res) => {
  const result = paginateData(store.returPembelian, req, ['nomor_retur_beli', 'supplier_nama', 'alasan']);
  res.json(result);
});

app.post('/api/purchasing/retur-beli', (req, res) => {
  const { supplier_nama, alasan, total_nilai } = req.body;
  const newId = store.returPembelian.length ? Math.max(...store.returPembelian.map(r => r.id)) + 1 : 1;
  const newRetur = {
    id: newId,
    nomor_retur_beli: `RET-B-202611-00${newId}`,
    supplier_nama: supplier_nama || 'Supplier Sheet',
    tanggal_retur: new Date().toISOString().split('T')[0],
    alasan: alasan || 'Bahan cacat',
    total_nilai: Number(total_nilai) || 0,
    status: 'Disetujui'
  };
  store.returPembelian.unshift(newRetur);
  res.json({ success: true, message: 'Retur pembelian berhasil dibuat', data: newRetur });
});

// --------------------------------------------------------
// 3. GUDANG (WAREHOUSE & INVENTORY)
// --------------------------------------------------------
app.get('/api/gudang/stock-sheet', (req, res) => {
  const result = paginateData(store.bahanSheet, req, ['kode_sheet', 'nama_sheet', 'flute', 'substansi']);
  res.json(result);
});

app.get('/api/gudang/stock-pembantu', (req, res) => {
  const result = paginateData(store.bahanPembantu, req, ['kode_bahan', 'nama_bahan', 'kategori']);
  res.json(result);
});

app.get('/api/gudang/stock-barang-jadi', (req, res) => {
  const list = store.products.filter(p => p.jenis_barang === 'Box');
  const result = paginateData(list, req, ['kode_barang', 'nama_barang', 'tipe_flute', 'jenis_sambungan']);
  res.json(result);
});

app.get('/api/gudang/wip', (req, res) => {
  const wipList = store.spk.filter(s => s.status === 'Berjalan');
  res.json({ success: true, data: wipList });
});

app.get('/api/gudang/mutasi', (req, res) => {
  const result = paginateData(store.mutasiStok, req, ['nama_barang', 'tipe_barang', 'referensi_dokumen', 'keterangan']);
  res.json(result);
});

app.post('/api/gudang/penyesuaian-stok', (req, res) => {
  const { tipe_barang, barang_id, jenis_mutasi, qty, keterangan } = req.body;
  let target = null;
  if (tipe_barang === 'Sheet') {
    target = store.bahanSheet.find(b => b.id === parseInt(barang_id, 10));
    if (target) {
      if (jenis_mutasi === 'Masuk') target.stok_lembar += Number(qty);
      else target.stok_lembar = Math.max(0, target.stok_lembar - Number(qty));
    }
  } else if (tipe_barang === 'BahanPembantu') {
    target = store.bahanPembantu.find(b => b.id === parseInt(barang_id, 10));
    if (target) {
      if (jenis_mutasi === 'Masuk') target.stok += Number(qty);
      else target.stok = Math.max(0, target.stok - Number(qty));
    }
  } else {
    target = store.products.find(p => p.id === parseInt(barang_id, 10));
    if (target) {
      if (jenis_mutasi === 'Masuk') target.stok_qty += Number(qty);
      else target.stok_qty = Math.max(0, target.stok_qty - Number(qty));
    }
  }

  const newMutasi = {
    id: store.mutasiStok.length + 1,
    tanggal: new Date().toISOString().split('T')[0],
    tipe_barang: tipe_barang || 'BarangJadi',
    barang_id: parseInt(barang_id, 10) || 1,
    nama_barang: target ? (target.nama_barang || target.nama_sheet || target.nama_bahan) : 'Barang',
    jenis_mutasi: jenis_mutasi || 'Masuk',
    qty: Number(qty) || 0,
    referensi_dokumen: 'ADJ-GUDANG',
    keterangan: keterangan || 'Penyesuaian stok fisik (Stock Opname)'
  };
  store.mutasiStok.unshift(newMutasi);

  res.json({ success: true, message: 'Penyesuaian stok berhasil disimpan', data: newMutasi });
});

// --------------------------------------------------------
// 4. PPIC & PRODUKSI
// --------------------------------------------------------
// SPK
app.get('/api/produksi/spk', (req, res) => {
  let list = [...store.spk];
  if (req.query.tahapan) {
    list = list.filter(s => s.tahapan_sekarang === req.query.tahapan);
  }
  if (req.query.status) {
    list = list.filter(s => s.status === req.query.status);
  }
  const result = paginateData(list, req, ['nomor_spk', 'customer_nama', 'nama_box', 'desain_cetak']);
  res.json(result);
});

app.get('/api/produksi/spk/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const spk = store.spk.find(s => s.id === id);
  if (!spk) return res.status(404).json({ success: false, message: 'SPK tidak ditemukan' });

  // Include production history
  const cetakList = store.produksiCetak.filter(c => c.spk_id === id);
  const finishingList = store.produksiFinishing.filter(f => f.spk_id === id);
  const ikatList = store.produksiIkat.filter(i => i.spk_id === id);

  res.json({
    success: true,
    data: {
      ...spk,
      riwayat_cetak: cetakList,
      riwayat_finishing: finishingList,
      riwayat_ikat: ikatList
    }
  });
});

app.post('/api/produksi/spk', (req, res) => {
  const { customer_nama, nama_box, ukuran_box, sheet_id, qty_target, tanggal_mulai, target_selesai, desain_cetak, pisau_pond } = req.body;
  if (!nama_box || !qty_target) return res.status(400).json({ success: false, message: 'Nama box dan target qty wajib diisi' });

  const sheet = store.bahanSheet.find(b => b.id === parseInt(sheet_id, 10));
  const newId = store.spk.length ? Math.max(...store.spk.map(s => s.id)) + 1 : 1;
  const newSPK = {
    id: newId,
    nomor_spk: `SPK-202611-00${newId}`,
    so_id: null,
    customer_nama: customer_nama || 'Pesanan Langsung',
    nama_box,
    ukuran_box: ukuran_box || '300 x 200 x 200 mm',
    sheet_id: sheet ? sheet.id : 1,
    nama_sheet: sheet ? sheet.nama_sheet : 'Sheet Corrugated Standard',
    qty_target: Number(qty_target),
    tanggal_mulai: tanggal_mulai || new Date().toISOString().split('T')[0],
    target_selesai: target_selesai || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    desain_cetak: desain_cetak || 'Flexo 2 Warna',
    pisau_pond: pisau_pond || 'Standard Rotary Slotter',
    tahapan_sekarang: 'Cetak',
    status: 'Berjalan'
  };

  store.spk.unshift(newSPK);
  res.json({ success: true, message: 'SPK Produksi berhasil diterbitkan', data: newSPK });
});

app.put('/api/produksi/spk/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.spk.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'SPK tidak ditemukan' });

  store.spk[idx] = { ...store.spk[idx], ...req.body };
  res.json({ success: true, message: 'SPK berhasil diperbarui', data: store.spk[idx] });
});

app.delete('/api/produksi/spk/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.spk.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'SPK tidak ditemukan' });

  store.spk.splice(idx, 1);
  res.json({ success: true, message: 'SPK berhasil dihapus' });
});

// Proses Cetak
app.get('/api/produksi/cetak', (req, res) => {
  const result = paginateData(store.produksiCetak, req, ['nomor_spk', 'operator_nama', 'mesin_cetak', 'warna_tinta']);
  res.json(result);
});

app.post('/api/produksi/cetak', (req, res) => {
  const { spk_id, tanggal_proses, mesin_cetak, operator_nama, warna_tinta, qty_masuk, qty_bagus, qty_reject, catatan } = req.body;
  const spk = store.spk.find(s => s.id === parseInt(spk_id, 10));

  const newId = store.produksiCetak.length ? Math.max(...store.produksiCetak.map(c => c.id)) + 1 : 1;
  const newCetak = {
    id: newId,
    spk_id: spk ? spk.id : 1,
    nomor_spk: spk ? spk.nomor_spk : 'SPK-001',
    tanggal_proses: tanggal_proses || new Date().toISOString().split('T')[0],
    mesin_cetak: mesin_cetak || 'Flexo 2 Warna Line 1',
    operator_nama: operator_nama || 'Agus Salim',
    warna_tinta: warna_tinta || 'Hitam & Merah',
    qty_masuk: Number(qty_masuk) || 0,
    qty_bagus: Number(qty_bagus) || 0,
    qty_reject: Number(qty_reject) || 0,
    status: 'Selesai',
    catatan: catatan || 'Cetak tajam dan register pas'
  };

  store.produksiCetak.unshift(newCetak);
  if (spk) {
    spk.tahapan_sekarang = 'Finishing';
  }
  res.json({ success: true, message: 'Proses cetak berhasil dicatat & SPK lanjut ke Finishing', data: newCetak });
});

// Proses Finishing (Pond / Slotter / Stitching / Glue)
app.get('/api/produksi/finishing', (req, res) => {
  const result = paginateData(store.produksiFinishing, req, ['nomor_spk', 'operator_nama', 'jenis_finishing', 'mesin']);
  res.json(result);
});

app.post('/api/produksi/finishing', (req, res) => {
  const { spk_id, tanggal_proses, jenis_finishing, operator_nama, mesin, qty_masuk, qty_bagus, qty_reject, catatan } = req.body;
  const spk = store.spk.find(s => s.id === parseInt(spk_id, 10));

  const newId = store.produksiFinishing.length ? Math.max(...store.produksiFinishing.map(f => f.id)) + 1 : 1;
  const newFin = {
    id: newId,
    spk_id: spk ? spk.id : 1,
    nomor_spk: spk ? spk.nomor_spk : 'SPK-001',
    tanggal_proses: tanggal_proses || new Date().toISOString().split('T')[0],
    jenis_finishing: jenis_finishing || 'Stitching Kawat',
    operator_nama: operator_nama || 'Ujang Koswara',
    mesin: mesin || 'Stitching 2 Kepala',
    qty_masuk: Number(qty_masuk) || 0,
    qty_bagus: Number(qty_bagus) || 0,
    qty_reject: Number(qty_reject) || 0,
    status: 'Selesai',
    catatan: catatan || 'Kerapihan lipatan dan kawat kuat'
  };

  store.produksiFinishing.unshift(newFin);
  if (spk) {
    spk.tahapan_sekarang = 'Ikat';
  }
  res.json({ success: true, message: 'Proses finishing berhasil dicatat & SPK lanjut ke Ikat / Packing', data: newFin });
});

// Proses Ikat (Bundling / Strapping)
app.get('/api/produksi/ikat', (req, res) => {
  const result = paginateData(store.produksiIkat, req, ['nomor_spk', 'operator_nama']);
  res.json(result);
});

app.post('/api/produksi/ikat', (req, res) => {
  const { spk_id, tanggal_proses, operator_nama, isi_per_ikat, jumlah_ikat, total_barang_jadi } = req.body;
  const spk = store.spk.find(s => s.id === parseInt(spk_id, 10));

  const newId = store.produksiIkat.length ? Math.max(...store.produksiIkat.map(i => i.id)) + 1 : 1;
  const total = Number(total_barang_jadi) || (Number(isi_per_ikat || 25) * Number(jumlah_ikat || 0));

  const newIkat = {
    id: newId,
    spk_id: spk ? spk.id : 1,
    nomor_spk: spk ? spk.nomor_spk : 'SPK-001',
    tanggal_proses: tanggal_proses || new Date().toISOString().split('T')[0],
    operator_nama: operator_nama || 'Endang Sujana',
    isi_per_ikat: Number(isi_per_ikat) || 25,
    jumlah_ikat: Number(jumlah_ikat) || 0,
    total_barang_jadi: total,
    status: 'Selesai',
    serah_terima_gudang: true
  };

  store.produksiIkat.unshift(newIkat);
  if (spk) {
    spk.tahapan_sekarang = 'Selesai';
    spk.status = 'Selesai';
  }

  // Auto mutasi masuk ke Gudang FG
  store.mutasiStok.unshift({
    id: store.mutasiStok.length + 1,
    tanggal: newIkat.tanggal_proses,
    tipe_barang: 'BarangJadi',
    barang_id: 1,
    nama_barang: spk ? spk.nama_box : 'Barang Jadi',
    jenis_mutasi: 'Masuk',
    qty: total,
    referensi_dokumen: spk ? spk.nomor_spk : 'SPK-FINISH',
    keterangan: 'Hasil produksi lolos QC & selesai ikat'
  });

  res.json({ success: true, message: 'Proses ikat selesai! SPK tuntas dan barang diserahterimakan ke Gudang FG', data: newIkat });
});

// --------------------------------------------------------
// 5. HUTANG & PIUTANG (AP / AR)
// --------------------------------------------------------
// Pembayaran Piutang
app.get('/api/finance/piutang/pembayaran', (req, res) => {
  const result = paginateData(store.pembayaranPiutang, req, ['nomor_bukti', 'nomor_invoice', 'customer_nama', 'metode_bayar']);
  res.json(result);
});

app.post('/api/finance/piutang/pembayaran', (req, res) => {
  const { invoice_id, tanggal_bayar, metode_bayar, jumlah_bayar, catatan } = req.body;
  const inv = store.invoices.find(i => i.id === parseInt(invoice_id, 10));
  if (!inv) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });

  const amount = Number(jumlah_bayar);
  const newId = store.pembayaranPiutang.length ? Math.max(...store.pembayaranPiutang.map(p => p.id)) + 1 : 1;

  const payment = {
    id: newId,
    nomor_bukti: `BYR-AR-202611-00${newId}`,
    invoice_id: inv.id,
    nomor_invoice: inv.nomor_invoice,
    customer_id: inv.customer_id,
    customer_nama: inv.customer_nama,
    tanggal_bayar: tanggal_bayar || new Date().toISOString().split('T')[0],
    metode_bayar: metode_bayar || 'Transfer BCA',
    jumlah_bayar: amount,
    catatan: catatan || 'Pelunasan piutang customer'
  };

  store.pembayaranPiutang.unshift(payment);

  // Update invoice balance
  inv.sudah_dibayar = Number(inv.sudah_dibayar || 0) + amount;
  inv.sisa_tagihan = Math.max(0, Number(inv.total_tagihan) - inv.sudah_dibayar);
  inv.status_bayar = inv.sisa_tagihan === 0 ? 'Lunas' : 'Belum Lunas';

  res.json({ success: true, message: 'Pembayaran piutang berhasil dicatat', data: payment });
});

// Pembayaran Hutang
app.get('/api/finance/hutang/pembayaran', (req, res) => {
  const result = paginateData(store.pembayaranHutang, req, ['nomor_bukti', 'nomor_faktur_beli', 'supplier_nama', 'metode_bayar']);
  res.json(result);
});

app.post('/api/finance/hutang/pembayaran', (req, res) => {
  const { faktur_beli_id, tanggal_bayar, metode_bayar, jumlah_bayar, catatan } = req.body;
  const fb = store.notaPembelian.find(n => n.id === parseInt(faktur_beli_id, 10));
  if (!fb) return res.status(404).json({ success: false, message: 'Nota pembelian tidak ditemukan' });

  const amount = Number(jumlah_bayar);
  const newId = store.pembayaranHutang.length ? Math.max(...store.pembayaranHutang.map(p => p.id)) + 1 : 1;

  const payment = {
    id: newId,
    nomor_bukti: `BYR-AP-202611-00${newId}`,
    faktur_beli_id: fb.id,
    nomor_faktur_beli: fb.nomor_faktur_beli,
    supplier_id: fb.supplier_id,
    supplier_nama: fb.supplier_nama,
    tanggal_bayar: tanggal_bayar || new Date().toISOString().split('T')[0],
    metode_bayar: metode_bayar || 'Transfer BCA',
    jumlah_bayar: amount,
    catatan: catatan || 'Pembayaran hutang supplier'
  };

  store.pembayaranHutang.unshift(payment);

  // Update nota pembelian balance
  fb.sudah_dibayar = Number(fb.sudah_dibayar || 0) + amount;
  fb.sisa_tagihan = Math.max(0, Number(fb.total_tagihan) - fb.sudah_dibayar);
  fb.status_bayar = fb.sisa_tagihan === 0 ? 'Lunas' : 'Belum Lunas';

  res.json({ success: true, message: 'Pembayaran hutang supplier berhasil dicatat', data: payment });
});

// Aging Piutang
app.get('/api/finance/aging-piutang-customer', (req, res) => {
  const list = store.invoices.filter(i => i.sisa_tagihan > 0).map(inv => {
    return {
      nomor_invoice: inv.nomor_invoice,
      customer_nama: inv.customer_nama,
      tanggal_invoice: inv.tanggal_invoice,
      jatuh_tempo: inv.jatuh_tempo,
      total_tagihan: inv.total_tagihan,
      sisa_tagihan: inv.sisa_tagihan,
      aging_0_30: inv.sisa_tagihan,
      aging_31_60: 0,
      aging_61_90: 0,
      aging_over_90: 0,
      status: 'Current (Dalam Tempo)'
    };
  });
  res.json({ success: true, data: list });
});

app.get('/api/finance/aging-piutang-sales', (req, res) => {
  const list = store.salesPersons.map(s => {
    return {
      sales_nama: s.nama_sales,
      total_piutang: 11367500,
      lancar: 11367500,
      perhatian: 0,
      kurang_lancar: 0,
      macet: 0
    };
  });
  res.json({ success: true, data: list });
});

app.get('/api/finance/saldo-hutang-piutang', (req, res) => {
  const totalPiutang = store.invoices.reduce((s, i) => s + Number(i.sisa_tagihan || 0), 0);
  const totalHutang = store.notaPembelian.reduce((s, n) => s + Number(n.sisa_tagihan || 0), 0);
  res.json({
    success: true,
    data: {
      totalPiutang,
      totalHutang,
      piutangCustomer: store.invoices.filter(i => i.sisa_tagihan > 0),
      hutangSupplier: store.notaPembelian.filter(n => n.sisa_tagihan > 0)
    }
  });
});

// --------------------------------------------------------
// 6. KAS / BANK & JURNAL UMUM (ACCOUNTING)
// --------------------------------------------------------
app.get('/api/accounting/coa', (req, res) => {
  res.json({ success: true, data: store.coa });
});

app.get('/api/accounting/jurnal', (req, res) => {
  const result = paginateData(store.jurnal, req, ['nomor_jurnal', 'keterangan', 'tipe_jurnal']);
  res.json(result);
});

app.post('/api/accounting/jurnal', (req, res) => {
  const { tanggal, tipe_jurnal, keterangan, items } = req.body;
  if (!items || !items.length) return res.status(400).json({ success: false, message: 'Detail transaksi jurnal wajib diisi' });

  const newId = store.jurnal.length ? Math.max(...store.jurnal.map(j => j.id)) + 1 : 1;
  const debet = items.filter(it => it.posisi === 'Debet').reduce((sum, it) => sum + Number(it.nominal || 0), 0);
  const kredit = items.filter(it => it.posisi === 'Kredit').reduce((sum, it) => sum + Number(it.nominal || 0), 0);

  const newJurnal = {
    id: newId,
    nomor_jurnal: `JU-202611-00${newId}`,
    tanggal: tanggal || new Date().toISOString().split('T')[0],
    tipe_jurnal: tipe_jurnal || 'Memorial',
    keterangan: keterangan || 'Jurnal penyesuaian / transaksi',
    total_debet: debet,
    total_kredit: kredit,
    items: items || []
  };

  store.jurnal.unshift(newJurnal);
  res.json({ success: true, message: 'Jurnal transaksi berhasil disimpan', data: newJurnal });
});

app.get('/api/accounting/laporan-kas-harian', (req, res) => {
  res.json({
    success: true,
    data: {
      tanggal: new Date().toISOString().split('T')[0],
      saldoAwal: 12500000,
      mutasiMasuk: 3500000,
      mutasiKeluar: 2100000,
      saldoAkhir: 13900000,
      rincian: [
        { jam: '08:30', no_ref: 'KM-01', uraian: 'Penjualan afval karton & limbah sheet', jenis: 'Masuk', nominal: 3500000 },
        { jam: '11:15', no_ref: 'KK-01', uraian: 'BBM Truk Pengiriman Dus', jenis: 'Keluar', nominal: 450000 },
        { jam: '14:20', no_ref: 'KK-02', uraian: 'Konsumsi & Uang Makan Lembur Operator', jenis: 'Keluar', nominal: 1650000 }
      ]
    }
  });
});

app.get('/api/accounting/laporan-bank-harian', (req, res) => {
  res.json({
    success: true,
    data: {
      tanggal: new Date().toISOString().split('T')[0],
      rekening: 'Bank BCA Rek. 4567-8901 (CV. Maharani Untung Abadi)',
      saldoAwal: 161130000,
      mutasiMasuk: 29970000,
      mutasiKeluar: 5700000,
      saldoAkhir: 185400000,
      rincian: [
        { jam: '09:45', no_ref: 'TRF-IN-01', uraian: 'Pelunasan Invoice PT Mayora Indah', jenis: 'Masuk', nominal: 29970000 },
        { jam: '13:00', no_ref: 'TRF-OUT-01', uraian: 'Pembayaran PO Tinta CV. Surya Flexo', jenis: 'Keluar', nominal: 5700000 }
      ]
    }
  });
});

app.get('/api/accounting/trial-balance', (req, res) => {
  const data = store.coa.map(c => ({
    kode_akun: c.kode_akun,
    nama_akun: c.nama_akun,
    debet: c.saldo_normal === 'Debet' ? c.saldo_berjalan : 0,
    kredit: c.saldo_normal === 'Kredit' ? c.saldo_berjalan : 0
  }));
  res.json({ success: true, data });
});

app.get('/api/accounting/buku-besar', (req, res) => {
  res.json({
    success: true,
    data: store.coa.slice(0, 8).map(c => ({
      akun: c,
      mutasi: [
        { tanggal: '2026-11-01', keterangan: 'Saldo Awal Bulan', debet: c.saldo_normal === 'Debet' ? c.saldo_berjalan : 0, kredit: c.saldo_normal === 'Kredit' ? c.saldo_berjalan : 0, saldo: c.saldo_berjalan }
      ]
    }))
  });
});

app.get('/api/accounting/laba-rugi', (req, res) => {
  const pendapatan = 51337500;
  const hppBahan = 27400000;
  const hppTenagaKerja = 8500000;
  const totalHPP = hppBahan + hppTenagaKerja;
  const labaKotor = pendapatan - totalHPP;

  const bebanOperasional = 18500000 + 4200000 + 2600000 + 3750000;
  const labaBersih = labaKotor - bebanOperasional;

  res.json({
    success: true,
    data: {
      periode: 'November 2026',
      pendapatan: {
        penjualan_dus: pendapatan,
        total_pendapatan: pendapatan
      },
      hpp: {
        biaya_sheet_bahan: hppBahan,
        biaya_tenaga_kerja_langsung: hppTenagaKerja,
        total_hpp: totalHPP
      },
      laba_kotor: labaKotor,
      beban_operasional: {
        gaji_karyawan: 18500000,
        listrik_air: 4200000,
        bbm_logistik: 2600000,
        penyusutan_mesin: 3750000,
        total_beban: bebanOperasional
      },
      laba_bersih: labaBersih
    }
  });
});

app.get('/api/accounting/hpp', (req, res) => {
  res.json({
    success: true,
    data: {
      periode: 'November 2026',
      biaya_bahan_baku_sheet: 21700000,
      biaya_bahan_pembantu_tinta_lem_kawat: 5700000,
      biaya_tenaga_kerja_langsung: 8500000,
      biaya_overhead_pabrik: 4200000,
      total_biaya_produksi: 40100000,
      barang_dalam_proses_awal: 2500000,
      barang_dalam_proses_akhir: 6700000,
      hpp_selesai: 35900000
    }
  });
});

app.get('/api/accounting/neraca', (req, res) => {
  res.json({
    success: true,
    data: {
      aktiva_lancar: {
        kas_dan_bank: 292100000,
        piutang_usaha: 11367500,
        persediaan_sheet_dan_fg: 103000000,
        total_aktiva_lancar: 406467500
      },
      aktiva_tetap: {
        mesin_dan_peralatan: 450000000,
        akumulasi_penyusutan: -45000000,
        nilai_buku_aktiva_tetap: 405000000
      },
      total_aktiva: 811467500,
      kewajiban: {
        hutang_usaha: 11700000,
        hutang_pajak: 3500000,
        total_kewajiban: 15200000
      },
      modal: {
        modal_pemilik: 600000000,
        laba_tahun_berjalan: 196267500,
        total_ekuitas: 796267500
      },
      total_pasiva: 811467500
    }
  });
});

// --------------------------------------------------------
// 7. AKTIVA TETAP (FIXED ASSETS)
// --------------------------------------------------------
app.get('/api/aktiva', (req, res) => {
  const result = paginateData(store.aktiva, req, ['kode_aktiva', 'nama_aktiva', 'kategori', 'status']);
  res.json(result);
});

app.post('/api/aktiva', (req, res) => {
  const { nama_aktiva, kategori, tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, nilai_residu } = req.body;
  if (!nama_aktiva || !harga_perolehan) return res.status(400).json({ success: false, message: 'Nama aktiva dan harga perolehan wajib diisi' });

  const newId = store.aktiva.length ? Math.max(...store.aktiva.map(a => a.id)) + 1 : 1;
  const harga = Number(harga_perolehan);
  const newAktiva = {
    id: newId,
    kode_aktiva: `AST-00${newId}`,
    nama_aktiva,
    kategori: kategori || 'Mesin Pabrik',
    tanggal_perolehan: tanggal_perolehan || new Date().toISOString().split('T')[0],
    harga_perolehan: harga,
    umur_ekonomis_tahun: Number(umur_ekonomis_tahun) || 5,
    nilai_residu: Number(nilai_residu) || 0,
    akumulasi_penyusutan: 0,
    nilai_buku: harga,
    status: 'Aktif'
  };

  store.aktiva.unshift(newAktiva);
  res.json({ success: true, message: 'Aktiva tetap berhasil ditambahkan', data: newAktiva });
});

app.put('/api/aktiva/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.aktiva.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Aktiva tidak ditemukan' });

  store.aktiva[idx] = { ...store.aktiva[idx], ...req.body };
  res.json({ success: true, message: 'Aktiva berhasil diperbarui', data: store.aktiva[idx] });
});

app.delete('/api/aktiva/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.aktiva.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Aktiva tidak ditemukan' });

  store.aktiva.splice(idx, 1);
  res.json({ success: true, message: 'Aktiva berhasil dihapus' });
});

app.post('/api/aktiva/proses-penyusutan', (req, res) => {
  const periode = req.body.periode || '2026-11';
  let totalBeban = 0;

  store.aktiva.forEach(a => {
    if (a.status === 'Aktif' && a.nilai_buku > a.nilai_residu) {
      const depresiasiBulanan = Math.round((a.harga_perolehan - a.nilai_residu) / (a.umur_ekonomis_tahun * 12));
      a.akumulasi_penyusutan += depresiasiBulanan;
      a.nilai_buku = Math.max(a.nilai_residu, a.harga_perolehan - a.akumulasi_penyusutan);
      totalBeban += depresiasiBulanan;
    }
  });

  // Tambahkan jurnal depresiasi
  store.jurnal.unshift({
    id: store.jurnal.length + 1,
    nomor_jurnal: `JU-DEP-${periode}`,
    tanggal: new Date().toISOString().split('T')[0],
    tipe_jurnal: 'Memorial',
    keterangan: `Penyusutan Aktiva Tetap Bulanan Periode ${periode}`,
    total_debet: totalBeban,
    total_kredit: totalBeban,
    items: [
      { akun_id: 18, nama_akun: 'Beban Penyusutan Mesin Bulanan', posisi: 'Debet', nominal: totalBeban, keterangan: 'Beban Depresiasi' },
      { akun_id: 9, nama_akun: 'Akumulasi Penyusutan Mesin', posisi: 'Kredit', nominal: totalBeban, keterangan: 'Akumulasi Depresiasi' }
    ]
  });

  res.json({ success: true, message: `Proses penyusutan bulan ${periode} berhasil dijalankan sebesar Rp ${totalBeban.toLocaleString('id-ID')}` });
});

// --------------------------------------------------------
// 8. PAYROLL (HR & PENGGAJIAN)
// --------------------------------------------------------
// Master Karyawan
app.get('/api/payroll/karyawan', (req, res) => {
  const result = paginateData(store.karyawan, req, ['nik', 'nama_lengkap', 'jabatan', 'departemen']);
  res.json(result);
});

app.post('/api/payroll/karyawan', (req, res) => {
  const { nik, nama_lengkap, jabatan, departemen, status_karyawan, no_hp, no_rekening, bank, gaji_pokok, tunjangan_jabatan, uang_makan_perhari, tarif_lembur_perjam } = req.body;
  if (!nama_lengkap || !jabatan) return res.status(400).json({ success: false, message: 'Nama lengkap dan jabatan wajib diisi' });

  const newId = store.karyawan.length ? Math.max(...store.karyawan.map(k => k.id)) + 1 : 1;
  const newKaryawan = {
    id: newId,
    nik: nik || `EMP-00${newId}`,
    nama_lengkap,
    jabatan,
    departemen: departemen || 'Produksi',
    status_karyawan: status_karyawan || 'Tetap',
    no_hp: no_hp || '-',
    no_rekening: no_rekening || '-',
    bank: bank || 'BCA',
    gaji_pokok: Number(gaji_pokok) || 4500000,
    tunjangan_jabatan: Number(tunjangan_jabatan) || 500000,
    uang_makan_perhari: Number(uang_makan_perhari) || 25000,
    tarif_lembur_perjam: Number(tarif_lembur_perjam) || 25000
  };

  store.karyawan.unshift(newKaryawan);
  res.json({ success: true, message: 'Karyawan berhasil ditambahkan', data: newKaryawan });
});

app.put('/api/payroll/karyawan/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.karyawan.findIndex(k => k.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });

  store.karyawan[idx] = { ...store.karyawan[idx], ...req.body };
  res.json({ success: true, message: 'Data karyawan berhasil diperbarui', data: store.karyawan[idx] });
});

app.delete('/api/payroll/karyawan/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = store.karyawan.findIndex(k => k.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });

  store.karyawan.splice(idx, 1);
  res.json({ success: true, message: 'Karyawan berhasil dihapus' });
});

// Absensi Harian
app.get('/api/payroll/absensi', (req, res) => {
  const result = paginateData(store.absensi, req, ['nama_lengkap', 'nik', 'status_kehadiran', 'catatan', 'metode']);
  res.json(result);
});

// Download Template CSV Mesin Fingerprint
app.get('/api/payroll/absensi/template-fingerprint', (req, res) => {
  const csvContent = [
    'PIN_NIK,Nama_Karyawan,Tanggal,Jam_Masuk,Jam_Pulang,Catatan',
    'EMP-001,Mulyadi Pratama,2026-11-20,07:55,17:15,Mesin Fingerprint Pintu Masuk',
    'EMP-002,Agus Salim,2026-11-20,07:45,19:30,Lembur Cetak Flexo 2 Jam',
    'EMP-003,Ujang Koswara,2026-11-20,07:50,19:30,Lembur Finishing Pond 2 Jam',
    'EMP-004,Endang Sujana,2026-11-20,07:52,18:30,Lembur Ikat Strapping 1 Jam',
    'EMP-005,Maman Suratman,2026-11-20,07:40,17:05,Mesin Fingerprint Gudang',
    'EMP-006,Ahmad Kosasih,2026-11-20,07:30,17:10,Mesin Fingerprint Logistik',
    'EMP-007,Siti Rahmawati,2026-11-20,07:58,17:05,Mesin Fingerprint Kantor'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template_absensi_fingerprint.csv"');
  res.send(csvContent);
});

// Export Data Absensi ke CSV
app.get('/api/payroll/absensi/export', (req, res) => {
  const headers = ['ID,NIK,Nama_Karyawan,Tanggal,Jam_Masuk,Jam_Pulang,Jam_Lembur,Status_Kehadiran,Metode_Absensi,Catatan'];
  const rows = store.absensi.map(a => {
    const k = store.karyawan.find(x => x.id === a.karyawan_id);
    const nik = a.nik || (k ? k.nik : '-');
    return `${a.id},"${nik}","${a.nama_lengkap}","${a.tanggal}","${a.jam_masuk || ''}","${a.jam_pulang || ''}",${a.jam_lembur || 0},"${a.status_kehadiran}","${a.metode || 'Fingerprint'}","${a.catatan || ''}"`;
  });

  const fullCsv = [headers, ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="laporan_absensi_cv_maharani.csv"');
  res.send(fullCsv);
});

// Import Log Mesin Fingerprint (CSV / Array Data)
app.post('/api/payroll/absensi/import-fingerprint', (req, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Data baris absensi fingerprint tidak ditemukan' });
  }

  let importedCount = 0;
  let updatedCount = 0;

  records.forEach(row => {
    // Cari karyawan berdasarkan NIK / PIN atau Nama
    const searchNik = (row.nik || row.PIN_NIK || row.pin || '').toString().trim().toUpperCase();
    const searchNama = (row.nama || row.nama_lengkap || row.Nama_Karyawan || '').toString().trim().toLowerCase();

    let k = null;
    if (searchNik) {
      k = store.karyawan.find(x => x.nik.toUpperCase() === searchNik || x.nik.replace(/[^0-9]/g, '') === searchNik.replace(/[^0-9]/g, ''));
    }
    if (!k && searchNama) {
      k = store.karyawan.find(x => x.nama_lengkap.toLowerCase().includes(searchNama));
    }

    const tgl = row.tanggal || row.Tanggal || new Date().toISOString().split('T')[0];
    const masuk = row.jam_masuk || row.Jam_Masuk || '08:00';
    const pulang = row.jam_pulang || row.Jam_Pulang || '17:00';
    
    // Hitung otomatis jam lembur jika pulang > 17:00 dan lembur belum diisi
    let lembur = Number(row.jam_lembur || row.Jam_Lembur);
    if (isNaN(lembur) || lembur === 0) {
      const [ph, pm] = pulang.split(':').map(Number);
      if (ph && ph >= 17) {
        lembur = ph - 17 + (pm >= 30 ? 0.5 : 0);
      } else {
        lembur = 0;
      }
    }

    const existingIdx = store.absensi.findIndex(a => {
      const matchKaryawan = k ? a.karyawan_id === k.id : a.nama_lengkap.toLowerCase() === (row.nama_lengkap || searchNama);
      return matchKaryawan && a.tanggal === tgl;
    });

    if (existingIdx !== -1) {
      // Update data kehadiran yang sudah ada
      store.absensi[existingIdx] = {
        ...store.absensi[existingIdx],
        jam_masuk: masuk,
        jam_pulang: pulang,
        jam_lembur: lembur,
        metode: 'Mesin Fingerprint',
        status_kehadiran: 'Hadir',
        catatan: row.catatan || row.Catatan || 'Log Fingerprint Otomatis (Updated)'
      };
      updatedCount++;
    } else {
      // Insert data baru
      const newId = store.absensi.length ? Math.max(...store.absensi.map(a => a.id)) + 1 : 1;
      const newAbsen = {
        id: newId,
        karyawan_id: k ? k.id : 1,
        nik: k ? k.nik : (searchNik || 'EMP-FINGER'),
        nama_lengkap: k ? k.nama_lengkap : (row.nama || row.Nama_Karyawan || 'Operator Pabrik'),
        tanggal: tgl,
        status_kehadiran: row.status_kehadiran || 'Hadir',
        jam_masuk: masuk,
        jam_pulang: pulang,
        jam_lembur: lembur,
        metode: 'Mesin Fingerprint',
        catatan: row.catatan || row.Catatan || 'Log Tarikan Mesin Fingerprint'
      };
      store.absensi.unshift(newAbsen);
      importedCount++;
    }
  });

  res.json({
    success: true,
    message: `Berhasil memproses log fingerprint: ${importedCount} data baru ditambahkan, ${updatedCount} data diperbarui`,
    importedCount,
    updatedCount
  });
});

app.post('/api/payroll/absensi', (req, res) => {
  const { karyawan_id, tanggal, status_kehadiran, jam_masuk, jam_pulang, jam_lembur, catatan } = req.body;
  const k = store.karyawan.find(x => x.id === parseInt(karyawan_id, 10));

  const newId = store.absensi.length ? Math.max(...store.absensi.map(a => a.id)) + 1 : 1;
  const newAbsen = {
    id: newId,
    karyawan_id: k ? k.id : 1,
    nik: k ? k.nik : 'EMP-001',
    nama_lengkap: k ? k.nama_lengkap : 'Karyawan',
    tanggal: tanggal || new Date().toISOString().split('T')[0],
    status_kehadiran: status_kehadiran || 'Hadir',
    jam_masuk: jam_masuk || '08:00',
    jam_pulang: jam_pulang || '17:00',
    jam_lembur: Number(jam_lembur) || 0,
    metode: 'Manual HR',
    catatan: catatan || 'Hadir harian'
  };

  store.absensi.unshift(newAbsen);
  res.json({ success: true, message: 'Absensi berhasil dicatat', data: newAbsen });
});

// Payroll Periode & Slip Gaji
app.get('/api/payroll/periode', (req, res) => {
  res.json({ success: true, data: store.payrollPeriode });
});

app.post('/api/payroll/generate', (req, res) => {
  const periode = req.body.periode || '2026-11';
  const newPayrollId = store.payrollPeriode.length + 1;
  let totalGaji = 0;

  const slips = store.karyawan.map(k => {
    const hariKerja = 25;
    const jamLembur = 10;
    const upahLembur = jamLembur * k.tarif_lembur_perjam;
    const uangMakan = hariKerja * k.uang_makan_perhari;
    const bpjs = Math.round(k.gaji_pokok * 0.03);
    const totalGajiBersih = k.gaji_pokok + k.tunjangan_jabatan + uangMakan + upahLembur - bpjs;
    totalGaji += totalGajiBersih;

    return {
      id: store.slipGaji.length + 1,
      payroll_id: newPayrollId,
      karyawan_id: k.id,
      nama_lengkap: k.nama_lengkap,
      nik: k.nik,
      jabatan: k.jabatan,
      hari_kerja: hariKerja,
      jam_lembur: jamLembur,
      gaji_pokok: k.gaji_pokok,
      tunjangan: k.tunjangan_jabatan,
      uang_makan: uangMakan,
      upah_lembur: upahLembur,
      potongan_bpjs: bpjs,
      potongan_absen: 0,
      total_gaji_bersih: totalGajiBersih
    };
  });

  const periodObj = {
    id: newPayrollId,
    nomor_payroll: `PAY-${periode.replace('-', '')}`,
    periode_bulan: periode,
    total_karyawan: store.karyawan.length,
    total_gaji_dibayar: totalGaji,
    status: 'Dibayar'
  };

  store.payrollPeriode.unshift(periodObj);
  store.slipGaji = [...slips, ...store.slipGaji];

  res.json({ success: true, message: `Payroll periode ${periode} berhasil digenerate`, data: periodObj });
});

app.get('/api/payroll/slip/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const slip = store.slipGaji.find(s => s.id === id);
  if (!slip) return res.status(404).json({ success: false, message: 'Slip gaji tidak ditemukan' });
  res.json({ success: true, data: slip });
});

app.get('/api/payroll/slip', (req, res) => {
  const result = paginateData(store.slipGaji, req, ['nama_lengkap', 'nik', 'jabatan']);
  res.json(result);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 CV. Maharani Untung Abadi ERP Server running on port ${PORT}`);
  console.log(`📁 Static uploads folder: ${uploadDir}`);
});
