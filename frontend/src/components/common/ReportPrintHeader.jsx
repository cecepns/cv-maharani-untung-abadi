import React from 'react';

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
    <div className="border-b-2 border-slate-900 pb-4 mb-6">
      {/* Kop Surat Resmi */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl tracking-tighter print:border print:border-slate-900 print:text-slate-900 print:bg-white">
            MUA
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
              CV. MAHARANI UNTUNG ABADI
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Spesialis Packaging & Corrugated Box / Karton Gelombang Pabrik
            </p>
            <p className="text-[11px] text-slate-500">
              Jl. Industri Raya No. 88, Kawasan Pergudangan • Telp: (021) 8900-1234 • Email: cv.maharaniuntungabadi@gmail.com
            </p>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-500 font-mono">
          <div>Dicetak: {printDate} {printTime}</div>
          <div className="text-emerald-700 font-semibold">Dokumen Resmi Perusahaan</div>
        </div>
      </div>

      {/* Sub Judul & Periode */}
      <div className="mt-3 border-t border-slate-300 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-center sm:text-left">
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
