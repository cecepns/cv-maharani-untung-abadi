import React from 'react';
import { Printer, X } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintSlipGaji({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-2xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex items-center justify-between pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1">
        <span className="text-sm font-bold text-slate-800">Pratinjau Slip Gaji Karyawan</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Slip Gaji
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Tutup Pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="print-area font-sans text-slate-900 text-xs leading-relaxed">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
          <h1 className="text-base font-extrabold uppercase tracking-wide">CV. MAHARANI UNTUNG ABADI</h1>
          <p className="text-[11px] text-slate-600 font-medium">SLIP GAJI KARYAWAN PABRIK PACKAGING & CORRUGATED</p>
          <p className="text-[10px] text-slate-500">Kawasan Industri & Pergudangan, Telp: (021) 8900-1234</p>
        </div>

        {/* Employee Meta */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <p><span className="text-slate-500">Nama:</span> <strong className="text-slate-900">{data.nama_lengkap}</strong></p>
            <p><span className="text-slate-500">NIK:</span> <strong>{data.nik}</strong></p>
            <p><span className="text-slate-500">Jabatan:</span> <strong>{data.jabatan}</strong></p>
          </div>
          <div>
            <p><span className="text-slate-500">Hari Kerja:</span> <strong>{data.hari_kerja || 25} Hari</strong></p>
            <p><span className="text-slate-500">Jam Lembur:</span> <strong>{data.jam_lembur || 0} Jam</strong></p>
            <p><span className="text-slate-500">Periode:</span> <strong>{data.periode || 'Bulan Berjalan 2026'}</strong></p>
          </div>
        </div>

        {/* Earnings & Deductions Breakdowns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Earnings */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300">
              PENERIMAAN (EARNINGS)
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between">
                <span>Gaji Pokok</span>
                <span className="font-semibold">Rp {Number(data.gaji_pokok || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tunjangan Makan & Transpor</span>
                <span className="font-semibold">Rp {Number(data.tunjangan_makan || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Upah Lembur ({data.jam_lembur || 0} Jam)</span>
                <span className="font-semibold text-brand-700">Rp {Number(data.upah_lembur || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Bonus / Insentif Target</span>
                <span className="font-semibold">Rp {Number(data.bonus_target || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-rose-50 px-3 py-1.5 font-bold text-rose-900 border-b border-slate-300">
              POTONGAN
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between">
                <span>BPJS Ketenagakerjaan</span>
                <span className="font-semibold">Rp {Number(data.potongan_bpjs || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Potongan Absensi / Lain</span>
                <span className="font-semibold">Rp {Number(data.potongan_absen || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex justify-between items-center mb-8">
          <span className="text-sm font-bold text-brand-900">GAJI BERSIH DITERIMA (TAKE HOME PAY):</span>
          <span className="text-base font-extrabold text-brand-700">
            Rp {Number(data.total_gaji_bersih || 0).toLocaleString('id-ID')}
          </span>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center mt-6">
          <div>
            <p className="text-slate-500">Penerima Karyawan,</p>
            <div className="h-14"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( {data.nama_lengkap} )</p>
          </div>
          <div>
            <p className="text-slate-500">Bagian HRD & Payroll,</p>
            <div className="h-14"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Siti Rahmawati )</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
