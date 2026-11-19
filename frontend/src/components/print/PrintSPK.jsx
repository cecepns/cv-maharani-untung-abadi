import React from 'react';
import { Printer, X, Factory } from 'lucide-react';

export default function PrintSPK({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-800">
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-slate-700">Surat Perintah Kerja (Job Order Produksi Dus)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Cetak SPK
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="print-area font-sans text-slate-900 text-xs leading-relaxed">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">CV. MAHARANI UNTUNG ABADI</h1>
              <p className="font-semibold text-slate-600">DEPARTEMEN PPIC & PRODUKSI PACKAGING</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-extrabold uppercase rounded">
                SURAT PERINTAH KERJA (SPK)
              </span>
              <p className="mt-1 font-bold text-sm">No: {data.nomor_spk}</p>
              <p className="text-slate-500">Tgl SPK: {data.tanggal_mulai}</p>
            </div>
          </div>

          {/* Job Specifications */}
          <div className="grid grid-cols-2 gap-4 mb-4 border border-slate-300 p-3 rounded-lg bg-slate-50">
            <div>
              <p className="text-slate-500 uppercase font-bold text-[10px]">Customer / Pemesan:</p>
              <p className="font-bold text-sm text-slate-900">{data.customer_nama}</p>
              <p className="mt-2 text-slate-500 uppercase font-bold text-[10px]">Nama Produk Box:</p>
              <p className="font-bold text-slate-900">{data.nama_box}</p>
              <p className="mt-2 text-slate-500 uppercase font-bold text-[10px]">Ukuran Box (PxLxT mm):</p>
              <p className="font-bold text-brand-700 text-sm">{data.ukuran_box}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase font-bold text-[10px]">Target Kuantitas:</p>
              <p className="font-black text-base text-slate-900">{Number(data.qty_target).toLocaleString('id-ID')} Pcs</p>
              <p className="mt-2 text-slate-500 uppercase font-bold text-[10px]">Bahan Baku Sheet:</p>
              <p className="font-bold text-slate-800">{data.nama_sheet || 'Sheet B/F 1000x1200 Kraft'}</p>
              <p className="mt-2 text-slate-500 uppercase font-bold text-[10px]">Batas Waktu Selesai:</p>
              <p className="font-bold text-rose-600">{data.target_selesai}</p>
            </div>
          </div>

          {/* Flow Stages for Production Check */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
            <div className="bg-slate-200 px-3 py-1.5 font-bold text-slate-800">
              ALUR PROSES PRODUKSI CORRUGATED
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[11px]">
                  <th className="p-2 border-r border-slate-300 w-10 text-center">Tahap</th>
                  <th className="p-2 border-r border-slate-300 w-32">Proses</th>
                  <th className="p-2 border-r border-slate-300">Spesifikasi Kerja</th>
                  <th className="p-2 border-r border-slate-300 w-24 text-center">Target Qty</th>
                  <th className="p-2 border-r border-slate-300 w-24 text-center">Hasil Baik</th>
                  <th className="p-2 w-28 text-center">Paraf Operator</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2 text-center font-bold border-r border-slate-300">1</td>
                  <td className="p-2 font-bold border-r border-slate-300">POTONG SHEET</td>
                  <td className="p-2 border-r border-slate-300">Potong sheet karton sesuai lembar kerja</td>
                  <td className="p-2 text-center border-r border-slate-300">{Number(data.qty_target).toLocaleString('id-ID')}</td>
                  <td className="p-2 text-center border-r border-slate-300">________</td>
                  <td className="p-2 text-center">________</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 text-center font-bold border-r border-slate-300">2</td>
                  <td className="p-2 font-bold border-r border-slate-300">PRINTING (FLEXO)</td>
                  <td className="p-2 border-r border-slate-300">{data.desain_cetak || 'Flexo 2 Warna'} (Presisi register)</td>
                  <td className="p-2 text-center border-r border-slate-300">{Number(data.qty_target).toLocaleString('id-ID')}</td>
                  <td className="p-2 text-center border-r border-slate-300">________</td>
                  <td className="p-2 text-center">________</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 text-center font-bold border-r border-slate-300">3</td>
                  <td className="p-2 font-bold border-r border-slate-300">FINISHING</td>
                  <td className="p-2 border-r border-slate-300">Slotter / Pisau Pond: {data.pisau_pond || 'Standard'} & Jahit Stitching / Glue</td>
                  <td className="p-2 text-center border-r border-slate-300">{Number(data.qty_target).toLocaleString('id-ID')}</td>
                  <td className="p-2 text-center border-r border-slate-300">________</td>
                  <td className="p-2 text-center">________</td>
                </tr>
                <tr>
                  <td className="p-2 text-center font-bold border-r border-slate-300">4</td>
                  <td className="p-2 font-bold border-r border-slate-300">IKAT & PACKING</td>
                  <td className="p-2 border-r border-slate-300">Strapping kuning, 25 pcs per ikat, cek kebersihan dus</td>
                  <td className="p-2 text-center border-r border-slate-300">{Number(data.qty_target).toLocaleString('id-ID')}</td>
                  <td className="p-2 text-center border-r border-slate-300">________</td>
                  <td className="p-2 text-center">________</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quality Control Notes */}
          <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 mb-6">
            <p className="font-bold text-slate-800">Catatan QC Pabrik:</p>
            <p className="text-slate-600 mt-0.5">
              • Pastikan creasing tidak pecah saat dilipat 90 derajat.<br/>
              • Ketebalan flute dan warna tinta wajib sesuai sample master.<br/>
              • Kawat stitching harus rapat dan tidak melukai isi dalam dus.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center mt-6">
            <div>
              <p className="font-medium text-slate-600">Dibuat oleh PPIC,</p>
              <div className="h-14"></div>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Mulyadi Pratama )</p>
            </div>
            <div>
              <p className="font-medium text-slate-600">Supervisor Produksi,</p>
              <div className="h-14"></div>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Agus Salim )</p>
            </div>
            <div>
              <p className="font-medium text-slate-600">Kepala Gudang FG,</p>
              <div className="h-14"></div>
              <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Maman Suratman )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
