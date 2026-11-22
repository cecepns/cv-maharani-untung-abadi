import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Warehouse,
  Factory,
  CreditCard,
  BookOpen,
  Landmark,
  Users,
  UserCheck,
  ChevronDown,
  Box,
  Layers,
  FileText,
  Printer,
  Calendar,
  X,
  FileCheck,
  RotateCcw,
  BadgePercent,
  Receipt,
  Scissors,
  ShieldCheck,
  Calculator,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const handleLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.nama || 'Administrator ERP';
  const displayRole = user?.role || 'Admin CV. Maharani';
  const initial = displayName.charAt(0).toUpperCase();

  // Navigation tree categorized cleanly like SIPASTI
  const navigation = [
    {
      category: 'UTAMA',
      items: [
        { name: 'Dashboard Analitik', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      category: 'MARKETING & SALES',
      items: [
        { name: 'Kalkulator Estimasi Box', path: '/marketing/estimasi-harga', icon: Calculator },
        { name: 'Data Customer Industri', path: '/marketing/customers', icon: Users },
        { name: 'Data Tim Sales', path: '/marketing/sales-persons', icon: UserCheck },
        { name: 'Katalog Box & Sheet', path: '/marketing/products', icon: Box },
        { name: 'Sales Order (SO)', path: '/marketing/sales-orders', icon: FileCheck },
        { name: 'Surat Jalan (DO)', path: '/marketing/surat-jalan', icon: Truck },
        { name: 'Nota Penjualan / Invoice', path: '/marketing/invoices', icon: Receipt },
        { name: 'Faktur Pajak PPN', path: '/marketing/faktur-pajak', icon: BadgePercent },
        { name: 'Retur Penjualan', path: '/marketing/retur-penjualan', icon: RotateCcw },
        { name: 'Laporan Omset', path: '/marketing/laporan-omset', icon: FileText },
      ],
    },
    {
      category: 'PURCHASING & BAHAN',
      items: [
        { name: 'Master Supplier Sheet', path: '/purchasing/suppliers', icon: Users },
        { name: 'Bahan Baku Sheet Karton', path: '/purchasing/bahan-sheet', icon: Layers },
        { name: 'Bahan Pembantu & Lem', path: '/purchasing/bahan-pembantu', icon: Scissors },
        { name: 'Purchase Order (PO)', path: '/purchasing/orders', icon: FileCheck },
        { name: 'Penerimaan Sheet (LPB)', path: '/purchasing/penerimaan', icon: Truck },
        { name: 'Nota Beli Supplier', path: '/purchasing/nota-beli', icon: Receipt },
        { name: 'Retur Pembelian Sheet', path: '/purchasing/retur-beli', icon: RotateCcw },
      ],
    },
    {
      category: 'GUDANG & LOGISTIK',
      items: [
        { name: 'Stok Sheet Lembaran', path: '/gudang/stock-sheet', icon: Layers },
        { name: 'Stok Bahan Pembantu', path: '/gudang/stock-pembantu', icon: Box },
        { name: 'Stok Barang Jadi (FG)', path: '/gudang/stock-fg', icon: Box },
        { name: 'Work in Progress (WIP)', path: '/gudang/wip', icon: Factory },
        { name: 'Mutasi & Opname Stok', path: '/gudang/mutasi', icon: RotateCcw },
      ],
    },
    {
      category: 'PPIC & PRODUKSI PABRIK',
      items: [
        { name: 'Perintah Kerja (SPK)', path: '/produksi/spk', icon: FileText },
        { name: 'Tahap 1: Mesin Flexo', path: '/produksi/cetak', icon: Printer },
        { name: 'Tahap 2: Slotter & Pond', path: '/produksi/finishing', icon: Scissors },
        { name: 'Tahap 3: Ikat & Strapping', path: '/produksi/ikat', icon: Layers },
      ],
    },
    {
      category: 'PAYROLL & SDM',
      items: [
        { name: 'Data Karyawan & Operator', path: '/payroll/karyawan', icon: Users },
        { name: 'Presensi & Lembur Pabrik', path: '/payroll/absensi', icon: Calendar },
        { name: 'Laporan Payroll & Gaji', path: '/payroll/gaji', icon: Receipt },
        { name: 'Slip Gaji Karyawan', path: '/payroll/slip', icon: FileText },
      ],
    },
    {
      category: 'KEUANGAN & AKUNTANSI',
      items: [
        { name: 'Buku Kas Harian', path: '/accounting/kas-harian', icon: Landmark },
        { name: 'Buku Bank & Giro', path: '/accounting/bank-harian', icon: Landmark },
        { name: 'Piutang Customer (AR)', path: '/finance/piutang', icon: CreditCard },
        { name: 'Hutang Supplier (AP)', path: '/finance/hutang', icon: CreditCard },
        { name: 'Chart of Accounts (COA)', path: '/accounting/coa', icon: BookOpen },
        { name: 'Jurnal Umum Transaksi', path: '/accounting/jurnal', icon: FileText },
        { name: 'Buku Besar & Neraca', path: '/accounting/buku-besar', icon: BookOpen },
        { name: 'Laporan Laba Rugi Pabrik', path: '/accounting/laba-rugi', icon: Receipt },
        { name: 'Kalkulasi HPP Box', path: '/accounting/hpp', icon: FileCheck },
        { name: 'Neraca Keuangan Saldo', path: '/accounting/neraca', icon: Landmark },
        { name: 'Aset Tetap & Mesin', path: '/aktiva/list', icon: Landmark },
      ],
    },
    {
      category: 'PENGATURAN',
      items: [
        { name: 'Manajemen Akun User', path: '/settings/users', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container - Dark emerald theme like SIPASTI */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#051f1a] text-slate-200 flex flex-col border-r border-[#0d332b] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0d332b] bg-[#031512]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-black/20 shrink-0">
              <Box className="w-full h-full text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-white tracking-wide leading-tight">
                  CV. MAHARANI
                </h2>
              </div>
              <p className="text-[11px] font-semibold text-emerald-400">Untung Abadi Packaging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          {navigation.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300/60">
                {group.category}
              </h3>
              <div className="space-y-1 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400/80'}`} />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom CTA Button (Amber Pill like Kiosk Absensi in SIPASTI) */}
        <div className="p-3.5 border-t border-[#0d332b] bg-[#031512]/60 space-y-2">
          <button
            type="button"
            onClick={() => {
              navigate('/marketing/estimasi-harga');
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kalkulator Estimasi Box</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmLogoutOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Confirmation Dialog Logout */}
      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message={`Apakah Anda yakin ingin keluar dari sistem CV. Maharani, ${displayName}?`}
        confirmText="Ya, Logout Sekarang"
        cancelText="Batal"
      />
    </>
  );
}
