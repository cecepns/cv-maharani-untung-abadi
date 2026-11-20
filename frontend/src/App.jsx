import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';

// Dashboard
import Dashboard from '@/pages/Dashboard';

// Marketing
import CustomersPage from '@/pages/marketing/CustomersPage';
import ProductsPage from '@/pages/marketing/ProductsPage';
import SalesOrdersPage from '@/pages/marketing/SalesOrdersPage';
import SuratJalanPage from '@/pages/marketing/SuratJalanPage';
import InvoicesPage from '@/pages/marketing/InvoicesPage';
import FakturPajakPage from '@/pages/marketing/FakturPajakPage';
import ReturPenjualanPage from '@/pages/marketing/ReturPenjualanPage';
import LaporanOmsetPage from '@/pages/marketing/LaporanOmsetPage';
import EstimasiHargaPage from '@/pages/marketing/EstimasiHargaPage';

// Purchasing
import SuppliersPage from '@/pages/purchasing/SuppliersPage';
import BahanSheetPage from '@/pages/purchasing/BahanSheetPage';
import BahanPembantuPage from '@/pages/purchasing/BahanPembantuPage';
import PurchaseOrdersPage from '@/pages/purchasing/PurchaseOrdersPage';
import PenerimaanPage from '@/pages/purchasing/PenerimaanPage';
import NotaBeliPage from '@/pages/purchasing/NotaBeliPage';
import ReturBeliPage from '@/pages/purchasing/ReturBeliPage';

// Gudang
import StockSheetPage from '@/pages/gudang/StockSheetPage';
import StockPembantuPage from '@/pages/gudang/StockPembantuPage';
import StockFGPage from '@/pages/gudang/StockFGPage';
import WIPPage from '@/pages/gudang/WIPPage';
import MutasiPage from '@/pages/gudang/MutasiPage';

// Produksi
import SPKPage from '@/pages/produksi/SPKPage';
import CetakPage from '@/pages/produksi/CetakPage';
import FinishingPage from '@/pages/produksi/FinishingPage';
import IkatPage from '@/pages/produksi/IkatPage';

// Finance (Hutang & Piutang)
import PiutangPage from '@/pages/finance/PiutangPage';
import HutangPage from '@/pages/finance/HutangPage';
import AgingCustomerPage from '@/pages/finance/AgingCustomerPage';
import AgingSalesPage from '@/pages/finance/AgingSalesPage';
import SaldoHutangPiutangPage from '@/pages/finance/SaldoHutangPiutangPage';

// Accounting
import COAPage from '@/pages/accounting/COAPage';
import JurnalPage from '@/pages/accounting/JurnalPage';
import KasHarianPage from '@/pages/accounting/KasHarianPage';
import BankHarianPage from '@/pages/accounting/BankHarianPage';
import BukuBesarPage from '@/pages/accounting/BukuBesarPage';
import LabaRugiPage from '@/pages/accounting/LabaRugiPage';
import HPPPage from '@/pages/accounting/HPPPage';
import NeracaPage from '@/pages/accounting/NeracaPage';

// Aktiva
import AktivaListPage from '@/pages/aktiva/AktivaListPage';
import PenyusutanPage from '@/pages/aktiva/PenyusutanPage';

// Payroll
import KaryawanPage from '@/pages/payroll/KaryawanPage';
import AbsensiPage from '@/pages/payroll/AbsensiPage';
import GajiPage from '@/pages/payroll/GajiPage';
import SlipGajiPage from '@/pages/payroll/SlipGajiPage';

// Settings & Users
import UsersPage from '@/pages/settings/UsersPage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              padding: '12px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Route: Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected ERP Modules */}
          <Route element={<ProtectedLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Marketing & Sales */}
            <Route path="/marketing/estimasi-harga" element={<EstimasiHargaPage />} />
            <Route path="/marketing/customers" element={<CustomersPage />} />
            <Route path="/marketing/products" element={<ProductsPage />} />
            <Route path="/marketing/sales-orders" element={<SalesOrdersPage />} />
            <Route path="/marketing/surat-jalan" element={<SuratJalanPage />} />
            <Route path="/marketing/invoices" element={<InvoicesPage />} />
            <Route path="/marketing/faktur-pajak" element={<FakturPajakPage />} />
            <Route path="/marketing/retur-penjualan" element={<ReturPenjualanPage />} />
            <Route path="/marketing/laporan-omset" element={<LaporanOmsetPage />} />

            {/* Pembelian & Bahan */}
            <Route path="/purchasing/suppliers" element={<SuppliersPage />} />
            <Route path="/purchasing/bahan-sheet" element={<BahanSheetPage />} />
            <Route path="/purchasing/bahan-pembantu" element={<BahanPembantuPage />} />
            <Route path="/purchasing/orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchasing/penerimaan" element={<PenerimaanPage />} />
            <Route path="/purchasing/nota-beli" element={<NotaBeliPage />} />
            <Route path="/purchasing/retur-beli" element={<ReturBeliPage />} />

            {/* Gudang & Logistik */}
            <Route path="/gudang/stock-sheet" element={<StockSheetPage />} />
            <Route path="/gudang/stock-pembantu" element={<StockPembantuPage />} />
            <Route path="/gudang/stock-fg" element={<StockFGPage />} />
            <Route path="/gudang/wip" element={<WIPPage />} />
            <Route path="/gudang/mutasi" element={<MutasiPage />} />

            {/* PPIC & Produksi Dus */}
            <Route path="/produksi/spk" element={<SPKPage />} />
            <Route path="/produksi/cetak" element={<CetakPage />} />
            <Route path="/produksi/finishing" element={<FinishingPage />} />
            <Route path="/produksi/ikat" element={<IkatPage />} />

            {/* Hutang & Piutang */}
            <Route path="/finance/piutang" element={<PiutangPage />} />
            <Route path="/finance/hutang" element={<HutangPage />} />
            <Route path="/finance/aging-customer" element={<AgingCustomerPage />} />
            <Route path="/finance/aging-sales" element={<AgingSalesPage />} />
            <Route path="/finance/saldo" element={<SaldoHutangPiutangPage />} />

            {/* Kas / Bank & Akuntansi */}
            <Route path="/accounting/coa" element={<COAPage />} />
            <Route path="/accounting/jurnal" element={<JurnalPage />} />
            <Route path="/accounting/kas-harian" element={<KasHarianPage />} />
            <Route path="/accounting/bank-harian" element={<BankHarianPage />} />
            <Route path="/accounting/buku-besar" element={<BukuBesarPage />} />
            <Route path="/accounting/laba-rugi" element={<LabaRugiPage />} />
            <Route path="/accounting/hpp" element={<HPPPage />} />
            <Route path="/accounting/neraca" element={<NeracaPage />} />

            {/* Aktiva Tetap */}
            <Route path="/aktiva/list" element={<AktivaListPage />} />
            <Route path="/aktiva/penyusutan" element={<PenyusutanPage />} />

            {/* Payroll & SDM */}
            <Route path="/payroll/karyawan" element={<KaryawanPage />} />
            <Route path="/payroll/absensi" element={<AbsensiPage />} />
            <Route path="/payroll/gaji" element={<GajiPage />} />
            <Route path="/payroll/slip" element={<SlipGajiPage />} />

            {/* Pengaturan & User Management */}
            <Route path="/settings/users" element={<UsersPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
