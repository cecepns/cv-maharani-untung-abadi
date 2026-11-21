import React from 'react';
import { Printer, X } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintInvoice({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-3xl">
      <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-700">Pratinjau Nota Penjualan / Invoice</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Invoice
          </button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="print-area font-sans text-slate-900 leading-relaxed text-sm">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">CV. MAHARANI UNTUNG ABADI</h1>
            <p className="text-xs text-slate-600 font-medium">Spesialis Packaging & Corrugated Box / Karton Gelombang</p>
            <p className="text-xs text-slate-500">NPWP: 01.998.776.5-012.000</p>
            <p className="text-xs text-slate-500">Jl. Industri Raya No. 88, Telp: (021) 8900-1234</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-amber-500 text-white font-black text-sm tracking-wider uppercase rounded">
              FAKTUR PENJUALAN
            </span>
            <p className="mt-2 text-xs font-bold text-slate-800">No: {data.nomor_invoice}</p>
            <p className="text-xs text-slate-600">Tanggal: {data.tanggal_invoice}</p>
            <p className="text-xs font-semibold text-rose-600">Jatuh Tempo: {data.jatuh_tempo}</p>
          </div>
        </div>

        {/* Customer Meta */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between">
          <div>
            <p className="text-slate-500 font-bold uppercase">Ditagihkan Kepada:</p>
            <p className="text-sm font-bold text-slate-900">{data.nama_customer || data.customer_nama || 'Customer'}</p>
            <p className="text-slate-600">Ref Sales Order: {data.nomor_so || '-'}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 font-bold uppercase">Status Pembayaran:</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              data.status_bayar === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {data.status_bayar}
            </span>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-3 text-left">Deskripsi Tagihan</th>
                <th className="p-3 text-right w-48">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3">
                  <p className="font-semibold text-slate-900">Tagihan Penjualan Kardus Box Gelombang</p>
                  <p className="text-slate-500 text-[11px]">Sesuai Surat Perintah Kerja & Surat Jalan No. {data.nomor_so}</p>
                </td>
                <td className="p-3 text-right font-medium">
                  Rp {Number(data.subtotal || data.total_tagihan).toLocaleString('id-ID')}
                </td>
              </tr>
              {Number(data.ppn || 0) > 0 && (
                <tr>
                  <td className="p-3 text-right text-slate-600">PPN (11%):</td>
                  <td className="p-3 text-right font-medium">
                    Rp {Number(data.ppn).toLocaleString('id-ID')}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold text-slate-900 text-sm">
                <td className="p-3 text-right">TOTAL TAGIHAN:</td>
                <td className="p-3 text-right text-brand-700">
                  Rp {Number(data.total_tagihan).toLocaleString('id-ID')}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-right text-emerald-700 font-medium">Sudah Dibayar:</td>
                <td className="p-3 text-right text-emerald-700 font-semibold">
                  Rp {Number(data.sudah_dibayar || 0).toLocaleString('id-ID')}
                </td>
              </tr>
              <tr className="bg-rose-50/50 font-bold text-slate-900">
                <td className="p-3 text-right text-rose-700">SISA TAGIHAN:</td>
                <td className="p-3 text-right text-rose-700 font-bold">
                  Rp {Number(data.sisa_tagihan).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Terms */}
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg text-xs mb-8">
          <p className="font-bold text-amber-900">Pembayaran dapat ditransfer melalui rekening:</p>
          <p className="text-slate-700 font-semibold mt-1">Bank BCA: 4567-8901 a/n CV. Maharani Untung Abadi</p>
          <p className="text-slate-700 font-semibold">Bank Mandiri: 123-00-987654-0 a/n CV. Maharani Untung Abadi</p>
          <p className="text-[11px] text-slate-500 mt-1">* Harap mencantumkan nomor invoice pada berita transfer</p>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-center text-center text-xs mt-6">
          <div>
            <p className="text-slate-500">Tanda Terima,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( ................................... )</p>
          </div>
          <div>
            <p className="text-slate-500">Bagian Finance / Akuntansi,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Siti Rahmawati )</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
