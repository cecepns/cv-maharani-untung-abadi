import React from 'react';
import KopSuratMaharani from './KopSuratMaharani';

export default function ReportPrintHeader({
  title = 'LAPORAN KEUANGAN',
  subtitle = '',
  periode = '',
  extraInfo = ''
}) {
  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const printTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="border-b border-slate-200 pb-3 mb-6">
      {/* Kop Surat Resmi Maharani Sesuai Gambar 1 */}
      <KopSuratMaharani
        rightContent={
          <div className="text-right text-[11px] text-slate-500 font-mono">
            <div>Dicetak: {printDate} {printTime}</div>
            <div className="text-emerald-700 font-semibold">Dokumen Resmi Perusahaan</div>
          </div>
        }
      />

      {/* Sub Judul & Periode */}
      <div className="mt-1 border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-center sm:text-left">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {periode && (
          <div className="inline-block px-3 py-1 bg-slate-100 text-slate-900 rounded-lg font-bold text-xs border border-slate-200">
            {periode}
          </div>
        )}
      </div>
    </div>
  );
}
