import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Otomatis tutup sidebar saat navigasi berpindah halaman (terutama di layar tablet/mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased overflow-x-hidden w-full relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300 min-w-0 w-full">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400">
          © {new Date().getFullYear()} CV. Maharani Untung Abadi • Sistem Manufaktur & Distribusi Box Corrugated • All Rights Reserved
        </footer>
      </div>
    </div>
  );
}
