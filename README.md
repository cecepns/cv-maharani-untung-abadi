# CV. Maharani Untung Abadi - Packaging & Corrugated ERP System

Sistem Informasi Enterprise Resource Planning (ERP) lengkap dan terintegrasi khusus industri manufaktur kemasan karton box (**Packaging & Corrugated Carton Box**), dari penerimaan bahan lembaran (sheet), proses printing flexo, slitter, pond/die-cut, stitching kawat, gluing lem, strapping ikat, hingga pengiriman barang jadi, penagihan, akuntansi, dan penggajian.

---

## 🛠️ Tech Stack & Architecture

Aplikasi ini dibangun 100% mematuhi aturan standar arsitektur pada [`AGENTS.md`](./AGENTS.md) dan spesifikasi teknis industri pada [`fitur.md`](./fitur.md):

### Frontend
- **Framework**: React 18 + Vite (SPA + PWA Ready)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Notifications**: `react-hot-toast` (alert, confirmation dialog, success, error)
- **Networking**: Axios instance dengan centralized endpoint management (`src/utils/endpoints.js`)
- **PWA**: Web App Manifest & Service Worker meta ready

### Backend
- **Framework**: Express.js REST API (Single Server File Architecture `backend/server.js`)
- **Database**: 100% Pure MySQL Connection Pool (`mysql2/promise`) - Zero Mock Data (Data real murni dari tabel database; jika tabel kosong mengembalikan `[]`, jika query gagal mengembalikan error status 500)
- **File Upload**: Multer storage terisolasi di folder `uploads-cv-maharani/`
- **Environment**: Dotenv `.env`

---

## 📦 8 Departemen / Modul Utama

| No | Modul | Rincian Fitur Utama |
|---|---|---|
| 1 | **Marketing & Sales** | Master Customer, Master Box (dimensi P x L x T mm, Flute B/C/E/Double Wall, Kualitas Kertas K125/M125/K125, Tipe Joint), Sales Order (SO), Surat Jalan (DO) siap cetak, Nota Penjualan, Faktur Pajak PPN 11%, Retur Penjualan, Laporan Omset |
| 2 | **Pembelian (Purchasing)** | Master Supplier, Master Bahan Baku Sheet (Substance & Flute), Bahan Pembantu (Tinta Flexo, Lem, Kawat Jahit, Lakban, Strapping band), Purchase Order (PO), Laporan Penerimaan Barang (LPB), Nota Beli, Retur Beli |
| 3 | **Gudang & Logistik** | Stock Sheet Lembaran, Stock Bahan Pembantu, Stock Finished Goods (FG Dus Siap Kirim), WIP (Work In Process) per SPK, Mutasi & Stock Opname |
| 4 | **PPIC & Produksi Dus** | SPK Produksi (Target output & toleransi lembar), Monitoring Mesin Cetak Flexo (speed & tinta), Finishing (Slitter, Pond, Stitching, Gluing), Proses Ikat & Packing (tali strapping, isi per ikat) |
| 5 | **Hutang & Piutang (AR / AP)** | Pembayaran Piutang Customer, Pembayaran Hutang Supplier, Aging Piutang per Umur Jatuh Tempo (0-30, 31-60, 61-90, >90 hari), Aging Piutang per Sales, Rekap Saldo AP/AR |
| 6 | **Kas, Bank & Akuntansi** | Chart of Accounts (COA 5 Kategori Akun), Jurnal Umum Transaksi Otomatis (Debit/Kredit balance), Kas Harian & Bank Harian, Buku Besar & Neraca Saldo, Laporan Laba Rugi Pabrik, Laporan HPP Box Corrugated, Laporan Neraca Keuangan |
| 7 | **Aktiva Tetap** | Master Aktiva Mesin Pabrik & Kendaraan (Mesin Flexo, Slitter, Stitching, Truk Engkel, Forklift), Perhitungan Akumulasi Penyusutan Garis Lurus Bulanan |
| 8 | **Payroll & SDM Pabrik** | Master Karyawan Kantor & Operator Mesin, Integrasi Mesin Fingerprint Attendance (Import file CSV/TXT log mesin & export rekap), Absensi & Lembur Harian, Generate Gaji Bulanan Otomatis (Gaji pokok + tunjangan + uang makan + upah lembur - BPJS), Cetak Slip Gaji Resmi |
| 9 | **Pengaturan & Akun Admin** | Autentikasi Login & Logout (Multi-Level Role Guard), Manajemen Pengguna ERP, Tambah Akun Admin per Departemen (Superadmin, Marketing, Gudang, PPIC Produksi, Finance/Accounting, HRD), Reset Password, Toggle Status Aktif/Nonaktif, Catatan Waktu Login Terakhir |

---

## 🖨️ Dokumen Cetak Standar Industri

Dilengkapi template cetak print preview profesional siap cetak kertas / PDF:
1. **Surat Jalan (Delivery Order)**: Dilengkapi data supir, nomor polisi armada, rincian koli/ikat, dan 4 kolom tanda tangan legal.
2. **Nota Penjualan / Invoice**: Rincian tagihan termin pembayaran, subtotal, PPN 11%, dan instruksi transfer bank resmi.
3. **Surat Perintah Kerja (SPK) Produksi**: Lembar instruksi kerja operator lantai produksi lengkap dengan dimensi sheet, jenis flute, susunan tinta flexo, instruksi creasing/pond, dan spesifikasi stitching/glue.
4. **Slip Gaji Karyawan**: Rincian take-home pay, hari kerja, jam lembur, rincian upah, potongan BPJS, dan tanda terima staf.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js (v18 ke atas disarankan)
- MySQL / MariaDB (Opsional jika ingin menggunakan database server lokal; sistem otomatis beralih ke in-memory store jika MySQL belum aktif)

### 2. Konfigurasi Backend
1. Buka terminal pada folder `backend/`:
   ```bash
   cd backend
   ```
2. Pastikan file `.env` sudah sesuai (default port `5000`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=cv_maharani_db
   ```
3. Import database MySQL:
   Buat database `cv_maharani_db` di MySQL Anda, lalu import skema DDL & seed data awal dari `sql/database.sql`:
   ```bash
   mysql -u root -p cv_maharani_db < sql/database.sql
   ```
4. Jalankan backend:
   ```bash
   npm start
   # atau untuk mode auto-reload dev:
   npm run dev
   ```
   Backend akan berjalan di: `http://localhost:5000`

---

### 3. Menjalankan Frontend
1. Buka tab terminal baru pada folder `frontend/`:
   ```bash
   cd frontend
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka browser pada URL yang ditampilkan (biasanya `http://localhost:3000` atau `http://localhost:5173`).

---

## 📁 Struktur Direktori

```text
cv-maharani/
├── .gitignore                    # Standar ignore file
├── AGENTS.md                     # Aturan baku frontend, backend & clean code
├── fitur.md                      # Rincian fitur industri karton box corrugated
├── README.md                     # Dokumentasi panduan penggunaan
├── backend/
│   ├── server.js                 # Single main Express server (REST API lengkap 8 modul)
│   ├── .env                      # Environment config
│   ├── package.json              # Dependensi backend
│   ├── sql/
│   │   └── database.sql          # Skema DDL & seed data lengkap
│   └── uploads-cv-maharani/      # Direktori upload file/foto dokumen
└── frontend/
    ├── package.json              # Dependensi React, Tailwind, Lucide, Router
    ├── vite.config.js            # Konfigurasi Vite & path alias (@/ -> src/)
    ├── tailwind.config.js        # Konfigurasi Tailwind & warna tema brand
    ├── postcss.config.js         # Konfigurasi PostCSS
    ├── .browserslistrc           # Konfigurasi browser support
    ├── index.html                # Entry HTML PWA
    ├── public/
    │   ├── manifest.json         # PWA Manifest
    │   └── logo.svg              # Logo pabrik kemasan
    └── src/
        ├── index.css             # Tailwind base & style khusus print
        ├── main.jsx              # Entry point React
        ├── App.jsx               # Routing seluruh modul & Toaster
        ├── utils/
        │   ├── api.js            # Axios client instance
        │   ├── endpoints.js      # Centralized API endpoints management
        │   └── request.js        # Reusable HTTP helper methods
        ├── hooks/
        │   └── useDebounce.js    # Debounce hook (>= 300ms) untuk realtime search
        ├── components/
        │   ├── common/           # Modal, ConfirmDialog, SearchInput, Pagination, Badge, dll.
        │   ├── layout/           # Sidebar (collapsible), Navbar, AppLayout
        │   └── print/            # Template cetak Surat Jalan, Invoice, SPK, Slip Gaji
        └── pages/
            ├── Dashboard.jsx     # Statistik KPI omset, produksi, stok, piutang
            ├── marketing/        # 8 Halaman modul Marketing & Penjualan
            ├── purchasing/       # 7 Halaman modul Pembelian & Bahan Baku
            ├── gudang/           # 5 Halaman modul Gudang, WIP & Mutasi
            ├── produksi/         # 4 Halaman modul SPK, Flexo, Finishing, Ikat
            ├── finance/          # 5 Halaman modul Hutang & Piutang, Aging
            ├── accounting/       # 8 Halaman modul COA, Jurnal, Kas/Bank, HPP, Laba Rugi
            ├── aktiva/           # 2 Halaman modul Aktiva Tetap & Penyusutan
            ├── payroll/          # 4 Halaman modul Karyawan, Presensi, Gaji & Slip
            └── settings/         # 1 Halaman modul Manajemen User & Akun Admin Pabrik
```
# cv-maharani-untung-abadi
