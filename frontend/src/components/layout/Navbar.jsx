import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Box, 
  LogOut, 
  ChevronDown, 
  User, 
  Settings,
  Sparkles,
  ShieldCheck,
  Building2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    setConfirmLogoutOpen(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.nama || 'Administrator ERP';
  const displayRole = user?.role || 'Admin CV. Maharani';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-2xs">
        {/* Left Side: Mobile Toggle & System Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors lg:hidden focus:outline-none"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              <img src="/logo.png" alt="CV. Maharani Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block text-left">
              <h2 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">
                SISTEM INFORMASI MANUFAKTUR & PACKAGING TERINTEGRASI
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                CV. Maharani Untung Abadi • Pabrik Corrugated Box & Karton Gelombang
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Shift Status & User Profile Pill (SIPASTI Style) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Tombol Akses Cepat Buku Panduan */}
          <button
            onClick={() => navigate('/panduan')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors border border-emerald-200/90 shadow-2xs cursor-pointer"
            title="Buka Buku Panduan Penggunaan Aplikasi"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Buku Panduan</span>
          </button>

          {/* Production shift indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Shift 1 (Produksi Berjalan)</span>
          </div>

          {/* User Profile Pill like reference screenshot */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 py-1 px-2 sm:px-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 focus:outline-none cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {displayName}
                </p>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {displayRole}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm ring-2 ring-emerald-100">
                {initial}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] font-mono text-slate-400">@{user?.username || 'admin'}</p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {displayRole}
                  </span>
                </div>

                <div className="p-1 space-y-0.5 text-xs font-medium">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings/users');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Pengaturan Pengguna</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/panduan');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-left"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Buku Panduan Aplikasi</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/marketing/estimasi-harga');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Kalkulator Estimasi Box</span>
                  </button>
                </div>

                <div className="p-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setConfirmLogoutOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Dialog Logout */}
      <ConfirmDialog
        isOpen={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message={`Apakah Anda yakin ingin keluar dari sistem CV. Maharani, ${displayName}?`}
        confirmText="Ya, Logout Sekarang"
        cancelText="Batal"
      />
    </>
  );
}
