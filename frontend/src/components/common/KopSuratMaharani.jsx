import React from 'react';

/**
 * Reusable Kop Surat Resmi CV. MAHARANI UNTUNG ABADI
 * Sesuai Standar Gambar 1:
 * - Logo MUA di sebelah kiri
 * - Judul "CV. MAHARANI UNTUNG ABADI" warna biru #084B9D, font serif bold/black
 * - Garis pembatas warna merah #DC2626 langsung di bawah nama perusahaan
 * - Alamat: Jl. Medokan Asri Tengah II Q / 23 - 24 Surabaya
 * - HP: 085100918118
 */
export default function KopSuratMaharani({
  badge = '',
  nomor = '',
  tanggal = '',
  extra = '',
  rightContent = null,
  className = '',
}) {
  return (
    <div className={`pb-3 mb-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Kop Surat Sisi Kiri (Sesuai Gambar 1) */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <img
            src="/logo.png"
            alt="Logo CV. Maharani Untung Abadi"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
            onError={(e) => {
              // Fallback jika path absolut berbeda
              if (!e.target.dataset.tried) {
                e.target.dataset.tried = 'true';
                e.target.src = '/assets/logo.png';
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black font-serif tracking-wide text-[#084B9D] uppercase leading-none">
              CV. MAHARANI UNTUNG ABADI
            </h1>
            <div className="w-full border-b-[2.5px] border-[#DC2626] my-1.5" />
            <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-tight">
              Jl. Medokan Asri Tengah II Q / 23 - 24 Surabaya
            </p>
            <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-tight mt-0.5">
              HP. 085100918118
            </p>
          </div>
        </div>

        {/* Info Dokumen Sisi Kanan (Opsional) */}
        {(badge || nomor || tanggal || extra || rightContent) && (
          <div className="text-right shrink-0 pt-0.5 sm:pt-1">
            {rightContent || (
              <>
                {badge && (
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded print:border print:border-slate-900 print:text-slate-900 print:bg-white shadow-2xs">
                    {badge}
                  </span>
                )}
                {nomor && (
                  <p className="font-bold text-xs text-slate-900 mt-1.5">
                    {nomor}
                  </p>
                )}
                {tanggal && (
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {tanggal}
                  </p>
                )}
                {extra && (
                  <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                    {extra}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
