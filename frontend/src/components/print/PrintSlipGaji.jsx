import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';
import KopSuratMaharani from '../common/KopSuratMaharani';

export default function PrintSlipGaji({ data, onClose }) {
  if (!data) return null;

  const [hrdSigner, setHrdSigner] = useState('Siti Rahmawati');

  const handlePrint = () => {
    window.print();
  };

  const isHarian = (data.tipe_gaji || '').toLowerCase() === 'harian';
  const hariKerja = Number(data.hari_kerja || 25);
  const upahHarian = Number(data.upah_harian || Math.round((Number(data.gaji_pokok) || 0) / (hariKerja || 25)));

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-2xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1 gap-2">
        <span className="text-sm font-bold text-slate-800">Pratinjau Slip Gaji Karyawan</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <label className="text-xs font-bold text-slate-600">HRD Signer:</label>
            <input
              type="text"
              value={hrdSigner}
              onChange={(e) => setHrdSigner(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-300 rounded-lg font-bold text-slate-800 w-32"
            />
          </div>
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
        {/* Kop Surat Resmi Maharani (Sesuai Gambar 1) */}
        <KopSuratMaharani
          badge="SLIP GAJI KARYAWAN"
          nomor={`No: ${data.nomor_slip || `SLIP-${data.id || '001'}`}`}
          tanggal={`Periode: ${data.bulan || 'November'} ${data.tahun || '2026'}`}
        />

        {/* Employee Meta */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <p><span className="text-slate-500">Nama Lengkap:</span> <strong className="text-slate-900">{data.nama_lengkap}</strong></p>
            <p><span className="text-slate-500">NIK:</span> <strong>{data.nik}</strong></p>
            <p><span className="text-slate-500">Jabatan:</span> <strong>{data.jabatan}</strong></p>
            <p>
              <span className="text-slate-500">Skema Gaji:</span>{' '}
              <strong className={isHarian ? 'text-amber-700' : 'text-slate-800'}>
                {isHarian ? `Harian (Rp ${upahHarian.toLocaleString('id-ID')}/hari)` : 'Bulanan Tetap'}
              </strong>
            </p>
          </div>
          <div>
            <p><span className="text-slate-500">Hari Hadir Kerja:</span> <strong>{hariKerja} Hari</strong></p>
            <p><span className="text-slate-500">Total Lembur:</span> <strong>{data.jam_lembur || 0} Jam</strong></p>
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
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">
                    Gaji Pokok {isHarian ? '(Harian)' : '(Bulanan)'}
                  </span>
                  {isHarian && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      {hariKerja} Hari × Rp {upahHarian.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-slate-900">
                  Rp {Number(data.gaji_pokok || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tunjangan Jabatan</span>
                <span className="font-semibold">Rp {Number(data.tunjangan || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span>Uang Makan ({hariKerja} Hari)</span>
                </div>
                <span className="font-semibold">Rp {Number(data.uang_makan || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span>Upah Lembur ({data.jam_lembur || 0} Jam)</span>
                </div>
                <span className="font-semibold text-brand-700">Rp {Number(data.upah_lembur || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-rose-50 px-3 py-1.5 font-bold text-rose-900 border-b border-slate-300">
              POTONGAN (DEDUCTIONS)
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between">
                <span>BPJS Ketenagakerjaan (3%)</span>
                <span className="font-semibold text-rose-700">
                  - Rp {Number(data.potongan_bpjs || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Potongan Absensi / Lainnya</span>
                <span className="font-semibold text-slate-600">
                  Rp {Number(data.potongan_absen || 0).toLocaleString('id-ID')}
                </span>
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
            <div className="h-14 flex items-center justify-center">
              <span className="font-bold text-slate-700 text-xs italic">{hrdSigner}</span>
            </div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( {hrdSigner} )</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
