import React from 'react';
import { Printer, X } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintSuratJalan({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-3xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Pratinjau Surat Jalan Resmi</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Letterhead & Content */}
      <div className="print-area font-sans text-slate-900 leading-relaxed text-sm">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">CV. MAHARANI UNTUNG ABADI</h1>
            <p className="text-xs text-slate-600 font-medium">Spesialis Packaging & Corrugated Box / Karton Gelombang</p>
            <p className="text-xs text-slate-500">Jl. Industri Raya No. 88, Kawasan Pergudangan, Telp: (021) 8900-1234</p>
            <p className="text-xs text-slate-500">Email: cv.maharaniuntungabadi@gmail.com</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 font-black text-sm tracking-wider uppercase border border-slate-300">
              SURAT JALAN
            </span>
            <p className="mt-2 text-xs font-bold text-slate-800">No: {data.nomor_sj}</p>
            <p className="text-xs text-slate-600">Tanggal: {data.tanggal_kirim}</p>
            <p className="text-xs text-slate-600">Ref SO: {data.nomor_so || '-'}</p>
          </div>
        </div>

        {/* Delivery & Recipient Meta */}
        <div className="grid grid-cols-2 gap-6 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <p className="text-slate-500 font-bold uppercase">Kepada Yth:</p>
            <p className="text-sm font-bold text-slate-900">{data.nama_customer || data.customer_nama || 'Customer'}</p>
            <p className="text-slate-600">Alamat Kirim: {data.alamat_kirim || data.alamat || 'Gudang Penerimaan Customer'}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold uppercase">Ekspedisi / Armada:</p>
            <p className="font-semibold text-slate-800">No. Kendaraan: <span className="font-bold">{data.no_kendaraan || 'B 9123 MUA'}</span></p>
            <p className="font-semibold text-slate-800">Nama Supir: <span className="font-bold">{data.nama_supir || 'Ahmad Kosasih'}</span></p>
          </div>
        </div>

        {/* Item Table */}
        <table className="w-full text-xs border border-slate-300 mb-6">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
              <th className="p-2.5 text-center w-12 border-r border-slate-300">No</th>
              <th className="p-2.5 text-left border-r border-slate-300">Nama Barang / Spesifikasi Dus</th>
              <th className="p-2.5 text-center w-24 border-r border-slate-300">Qty Kirim</th>
              <th className="p-2.5 text-left">Keterangan / Packing</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="p-2.5 text-center border-r border-slate-300 font-medium">{idx + 1}</td>
                <td className="p-2.5 border-r border-slate-300 font-semibold">{item.nama_barang}</td>
                <td className="p-2.5 text-center border-r border-slate-300 font-bold text-slate-900">
                  {Number(item.qty_kirim).toLocaleString('id-ID')} Pcs
                </td>
                <td className="p-2.5 text-slate-600">{item.keterangan || 'Packing ikat rapih'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-4 gap-4 text-center text-xs mt-10 pt-2">
          <div>
            <p className="font-semibold text-slate-600">Penerima Gudang,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( .......................... )</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">Sopir Pengantar,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( {data.nama_supir || 'Driver'} )</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">Staff Gudang FG,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Maman Suratman )</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">Hormat Kami,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( CV. Maharani )</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
