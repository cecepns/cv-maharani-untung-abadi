import React from 'react';

export default function ReportPrintFooter({
  preparer = 'Staff Accounting',
  reviewer = 'Manager Keuangan',
  approver = 'Direktur Utama',
  date = null
}) {
  const currentDate = date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="mt-8 pt-4 border-t border-slate-200 break-inside-avoid">
      <div className="text-right text-xs text-slate-500 mb-4 font-medium">
        Surabaya, {currentDate}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center text-xs">
        <div>
          <p className="text-slate-500 mb-14 font-medium">Dibuat Oleh,</p>
          <p className="font-bold text-slate-900 underline underline-offset-4">( {preparer} )</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Bagian Akuntansi & Pembukuan</p>
        </div>
        <div>
          <p className="text-slate-500 mb-14 font-medium">Diperiksa Oleh,</p>
          <p className="font-bold text-slate-900 underline underline-offset-4">( {reviewer} )</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Finance & Accounting Lead</p>
        </div>
        <div>
          <p className="text-slate-500 mb-14 font-medium">Disetujui Oleh,</p>
          <p className="font-bold text-slate-900 underline underline-offset-4">( {approver} )</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Pimpinan / Direktur Perusahaan</p>
        </div>
      </div>
    </div>
  );
}
