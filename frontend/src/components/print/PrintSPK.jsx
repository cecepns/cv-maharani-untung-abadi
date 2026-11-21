import React from 'react';
import { Printer, X, Factory } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintSPK({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-3xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex items-center justify-between pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1">
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-slate-800">Surat Perintah Kerja (Job Order Produksi Dus)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak SPK
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
            <p><span className="text-slate-500">Customer:</span> <strong className="text-slate-900">{data.nama_customer || data.customer_nama || 'Customer'}</strong></p>
            <p><span className="text-slate-500">Produk Dus:</span> <strong className="text-slate-900">{data.nama_barang || data.nama_produk}</strong></p>
            <p><span className="text-slate-500">Ukuran Jadi:</span> <strong>{data.ukuran_box || data.panjang + ' x ' + data.lebar + ' x ' + data.tinggi} mm</strong></p>
            <p><span className="text-slate-500">Substance / Tipe:</span> <strong>{data.substance || data.tipe_karton || 'K150/M125/K150 B/F'}</strong></p>
          </div>
          <div>
            <p><span className="text-slate-500">Target Qty:</span> <strong className="text-emerald-700 text-sm">{Number(data.qty_target).toLocaleString('id-ID')} Pcs</strong></p>
            <p><span className="text-slate-500">Ukuran Sheet:</span> <strong>{data.ukuran_sheet || '-'}</strong></p>
            <p><span className="text-slate-500">Warna Sablon:</span> <strong>{data.warna_cetak || 'Polos / Tanpa Sablon'}</strong></p>
            <p><span className="text-slate-500">Deadline:</span> <strong className="text-rose-600">{data.tanggal_selesai || '-'}</strong></p>
          </div>
        </div>

        {/* Work Order Process Routing */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                <th className="p-2 text-center w-8 border-r border-slate-300">No</th>
                <th className="p-2 text-left w-24 border-r border-slate-300">Tahapan</th>
                <th className="p-2 text-left border-r border-slate-300">Instruksi Kerja & Mesin</th>
                <th className="p-2 text-center w-20 border-r border-slate-300">Target Qty</th>
                <th className="p-2 text-center w-20 border-r border-slate-300">Hasil Baik</th>
                <th className="p-2 text-center w-20">Reject / BS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2 text-center font-bold border-r border-slate-300">1</td>
                <td className="p-2 font-bold border-r border-slate-300">POTONG SHEET</td>
                <td className="p-2 border-r border-slate-300">Mesin Corrugator / Slitter Rotary: Ukuran {data.ukuran_sheet || '-'}</td>
                <td className="p-2 text-center border-r border-slate-300">{Number(data.qty_target).toLocaleString('id-ID')}</td>
                <td className="p-2 text-center border-r border-slate-300">________</td>
                <td className="p-2 text-center">________</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 text-center font-bold border-r border-slate-300">2</td>
                <td className="p-2 font-bold border-r border-slate-300">CETAK FLEXO</td>
                <td className="p-2 border-r border-slate-300">Mesin Flexo Printing: Warna {data.warna_cetak || 'Polos'}, Cek Nozzle & Kerapatan Cat</td>
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
            • Pastikan creasing tidak pecah saat dilipat 90 derajat.<br />
            • Ketebalan flute dan warna tinta wajib sesuai sample master.<br />
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
    </PrintModalWrapper>
  );
}
