import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Box, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  User, 
  Settings,
  Sparkles
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

  const displayName = user?.nama || 'Admin Pabrik';
  const displayRole = user?.role || 'Superadmin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors lg:hidden focus:outline-none"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200/60 rounded-xl">
              <Box className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-semibold text-amber-900">Packaging & Corrugated System</span>
            </div>
            <span className="text-xs text-slate-300 hidden md:inline">|</span>
            <span className="text-xs font-medium text-slate-500 hidden md:inline">
              CV. Maharani Untung Abadi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Production shift indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Shift 1 (Produksi Berjalan)</span>
          </div>

          {/* Quick Logout Header Button */}
          <button
            onClick={() => setConfirmLogoutOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="Keluar dari sistem"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {initial}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">{displayName}</p>
                <p className="text-[10px] text-slate-400 font-medium">{displayRole}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-[11px] font-mono text-slate-400">@{user?.username || 'admin'}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
                    {displayRole}
                  </span>
                </div>

                <div className="p-1 space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings/users');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Manajemen User & Admin</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setConfirmLogoutOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Logout)</span>
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
        message={`Apakah Anda yakin ingin keluar dari sistem ERP CV. Maharani Untung Abadi, ${displayName}?`}
        confirmText="Ya, Logout Sekarang"
        cancelText="Batal"
      />
    </>
  );
}
