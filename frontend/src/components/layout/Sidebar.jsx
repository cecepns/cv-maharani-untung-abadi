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
  LogOut
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

  const displayName = user?.nama || 'Cecep / Admin';
  const displayRole = user?.role || 'Superadmin';
  const initial = displayName.charAt(0).toUpperCase();

  // Navigation tree
  const navigation = [
    {
      title: 'Utama',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Marketing & Sales',
      icon: ShoppingCart,
      items: [
        { name: 'Master Customer', path: '/marketing/customers', icon: Users },
        { name: 'Master Box & Sheet', path: '/marketing/products', icon: Box },
        { name: 'Sales Order (SO)', path: '/marketing/sales-orders', icon: FileCheck },
        { name: 'Surat Jalan (DO)', path: '/marketing/surat-jalan', icon: Truck },
        { name: 'Nota Penjualan', path: '/marketing/invoices', icon: Receipt },
        { name: 'Faktur Pajak', path: '/marketing/faktur-pajak', icon: BadgePercent },
        { name: 'Retur Penjualan', path: '/marketing/retur-penjualan', icon: RotateCcw },
        { name: 'Laporan Omset', path: '/marketing/laporan-omset', icon: FileText },
      ],
    },
    {
      title: 'Pembelian & Bahan',
      icon: ShoppingCart,
      items: [
        { name: 'Master Supplier', path: '/purchasing/suppliers', icon: Users },
        { name: 'Bahan Baku Sheet', path: '/purchasing/bahan-sheet', icon: Layers },
        { name: 'Bahan Pembantu', path: '/purchasing/bahan-pembantu', icon: Scissors },
        { name: 'Order Pembelian (PO)', path: '/purchasing/orders', icon: FileCheck },
        { name: 'Penerimaan Barang (LPB)', path: '/purchasing/penerimaan', icon: Truck },
        { name: 'Nota Pembelian', path: '/purchasing/nota-beli', icon: Receipt },
        { name: 'Retur Pembelian', path: '/purchasing/retur-beli', icon: RotateCcw },
      ],
    },
    {
      title: 'Gudang & Logistik',
      icon: Warehouse,
      items: [
        { name: 'Stock Sheet Lembaran', path: '/gudang/stock-sheet', icon: Layers },
        { name: 'Stock Bahan Pembantu', path: '/gudang/stock-pembantu', icon: Box },
        { name: 'Stock Barang Jadi (FG)', path: '/gudang/stock-fg', icon: Box },
        { name: 'WIP per SPK', path: '/gudang/wip', icon: Factory },
        { name: 'Mutasi & Opname Stok', path: '/gudang/mutasi', icon: RotateCcw },
      ],
    },
    {
      title: 'PPIC & Produksi Dus',
      icon: Factory,
      items: [
        { name: 'Surat Perintah Kerja (SPK)', path: '/produksi/spk', icon: FileText },
        { name: 'Proses Cetak (Flexo)', path: '/produksi/cetak', icon: Printer },
        { name: 'Proses Finishing', path: '/produksi/finishing', icon: Scissors },
        { name: 'Proses Ikat & Packing', path: '/produksi/ikat', icon: Layers },
      ],
    },
    {
      title: 'Hutang & Piutang',
      icon: CreditCard,
      items: [
        { name: 'Pembayaran Piutang (AR)', path: '/finance/piutang', icon: CreditCard },
        { name: 'Pembayaran Hutang (AP)', path: '/finance/hutang', icon: CreditCard },
        { name: 'Aging Piutang Customer', path: '/finance/aging-customer', icon: FileText },
        { name: 'Aging Piutang Sales', path: '/finance/aging-sales', icon: FileText },
        { name: 'Saldo Hutang & Piutang', path: '/finance/saldo', icon: Receipt },
      ],
    },
    {
      title: 'Kas / Bank & Akuntansi',
      icon: BookOpen,
      items: [
        { name: 'Chart of Accounts (COA)', path: '/accounting/coa', icon: BookOpen },
        { name: 'Jurnal Umum & Transaksi', path: '/accounting/jurnal', icon: FileText },
        { name: 'Laporan Kas Harian', path: '/accounting/kas-harian', icon: Landmark },
        { name: 'Laporan Bank Harian', path: '/accounting/bank-harian', icon: Landmark },
        { name: 'Buku Besar & Neraca Saldo', path: '/accounting/buku-besar', icon: BookOpen },
        { name: 'Laporan Laba Rugi', path: '/accounting/laba-rugi', icon: Receipt },
        { name: 'Laporan HPP Dus', path: '/accounting/hpp', icon: FileCheck },
        { name: 'Laporan Neraca', path: '/accounting/neraca', icon: Landmark },
      ],
    },
    {
      title: 'Aktiva Tetap',
      icon: Landmark,
      items: [
        { name: 'Daftar Aktiva Mesin & Aset', path: '/aktiva/list', icon: Landmark },
        { name: 'Penyusutan Bulanan', path: '/aktiva/penyusutan', icon: Calendar },
      ],
    },
    {
      title: 'Payroll & SDM',
      icon: Users,
      items: [
        { name: 'Master Karyawan', path: '/payroll/karyawan', icon: Users },
        { name: 'Absensi Harian', path: '/payroll/absensi', icon: Calendar },
        { name: 'Laporan & Penggajian', path: '/payroll/gaji', icon: Receipt },
        { name: 'Slip Gaji Karyawan', path: '/payroll/slip', icon: FileText },
      ],
    },
    {
      title: 'Pengaturan & Akun',
      icon: ShieldCheck,
      items: [
        { name: 'Manajemen User & Admin', path: '/settings/users', icon: ShieldCheck },
      ],
    },
  ];

  // Accordion state
  const [openSection, setOpenSection] = useState('Marketing & Sales');

  const toggleSection = (title) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/40">
              <Box className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
                CV. MAHARANI
              </h2>
              <p className="text-[11px] font-medium text-amber-400">Untung Abadi Packaging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {navigation.map((group, idx) => {
            if (group.title === 'Utama') {
              return (
                <div key={idx} className="space-y-1">
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
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              );
            }

            const isExpanded = openSection === group.title || group.items.some(i => location.pathname === i.path);

            return (
              <div key={idx} className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/20">
                <button
                  type="button"
                  onClick={() => toggleSection(group.title)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider hover:bg-slate-800/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {group.title}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1">
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
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-amber-600/90 text-white font-semibold'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer User Info & Logout Button */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
              {initial}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{displayRole}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmLogoutOpen(true)}
            title="Keluar / Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Confirmation Dialog Logout */}
      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        message={`Apakah Anda yakin ingin keluar dari sistem ERP CV. Maharani Untung Abadi, ${displayName}?`}
        confirmText="Ya, Logout Sekarang"
        cancelText="Batal"
      />
    </>
  );
}
