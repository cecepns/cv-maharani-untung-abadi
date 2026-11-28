import React, { useState } from 'react';
import { Printer, X, Building2, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';
import KopSuratMaharani from '../common/KopSuratMaharani';

export default function PrintPenawaranHarga({ data, onClose, customers = [] }) {
  if (!data) return null;

  const [customerName, setCustomerName] = useState(data.customer_nama || 'Pimpinan / Purchasing Dept.');
  const [customerAddress, setCustomerAddress] = useState(data.customer_alamat || 'Di Tempat');
  const [salesName, setSalesName] = useState(data.nama_sales || 'SUBAGIO');
  const [waktuPengerjaan, setWaktuPengerjaan] = useState('14 hari kerja');

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const nomorPenawaran = data.nomor_penawaran || `SPH/MUA/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-4xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1">
        <div>
          <span className="text-sm font-bold text-slate-800 block">
            Pratinjau Surat Penawaran Harga (Quotation)
          </span>
          <span className="text-xs text-slate-500">
            Periksa detail penawaran sebelum mencetak dokumen resmi ke printer atau simpan sebagai PDF.
          </span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen / Simpan PDF
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

      {/* Editor Cepat Penerima & Waktu Pengerjaan di Modal (hidden on print) */}
      <div className="no-print mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Penyesuaian Data Penawaran:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Nama Customer / Perusahaan:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="PT. Nama Pelanggan"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Alamat / Lokasi Pengiriman:</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Kota / Kawasan Industri"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Waktu Pengerjaan:</label>
            <input
              type="text"
              value={waktuPengerjaan}
              onChange={(e) => setWaktuPengerjaan(e.target.value)}
              placeholder="14 hari kerja"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Nama Penandatangan (Hormat Kami):</label>
            <input
              type="text"
              value={salesName}
              onChange={(e) => setSalesName(e.target.value)}
              placeholder="SUBAGIO"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Printable Area */}
      <div className="print-area font-sans text-slate-900 leading-relaxed text-sm">
        {/* Kop Surat Resmi Maharani (Sesuai Gambar 1) */}
        <KopSuratMaharani
          badge="SURAT PENAWARAN HARGA"
          nomor={`No: ${nomorPenawaran}`}
          tanggal={`Tanggal: ${todayStr}`}
          extra="Masa Berlaku: 14 Hari"
        />

        {/* Penerima Surat & Pembuka */}
        <div className="mb-4 text-xs space-y-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold uppercase">Kepada Yth:</p>
              <p className="text-sm font-bold text-slate-900">{customerName}</p>
              <p className="text-slate-600">{customerAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-semibold">Hal: <span className="font-bold text-slate-900">Penawaran Harga Kemasan Karton Box</span></p>
              <p className="text-slate-500">Lampiran: <span className="font-semibold text-slate-800">1 Lembar Spesifikasi Teknis</span></p>
            </div>
          </div>
          <p className="text-slate-700 leading-normal pt-1">
            Dengan hormat,<br />
            Sehubungan dengan kebutuhan pengemasan produk pada perusahaan Bapak/Ibu, bersama surat ini kami CV. MAHARANI UNTUNG ABADI mengajukan penawaran harga terbaik untuk kemasan karton box dengan spesifikasi teknis dan rincian sebagai berikut:
          </p>
        </div>

        {/* Tabel Rincian Spesifikasi & Harga (Dimensi lembaran dihilangkan sesuai permintaan client) */}
        <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                <th className="p-2.5 text-center w-10 border-r border-slate-300">No</th>
                <th className="p-2.5 text-left border-r border-slate-300">Deskripsi Barang & Spesifikasi Teknis</th>
                <th className="p-2.5 text-center w-24 border-r border-slate-300">Jumlah (Qty)</th>
                <th className="p-2.5 text-right w-36 border-r border-slate-300">Harga Satuan (Rp)</th>
                <th className="p-2.5 text-right w-36">Total Nilai (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 text-center border-r border-slate-300 font-medium">1</td>
                <td className="p-3 border-r border-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 text-sm">
                    {data.nama_barang || `Karton Box Standar ${data.panjang}x${data.lebar}x${data.tinggi} mm`}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600">
                    <p>• Model: <span className="font-semibold text-slate-800">A1 / RSC (Regular Slotted Carton)</span></p>
                    <p>• Ukuran Box Dalam: <span className="font-semibold text-slate-800">{data.panjang} × {data.lebar} × {data.tinggi} mm</span></p>
                    <p>• Tipe Flute: <span className="font-semibold text-slate-800">{data.tipe_flute} ({data.nama_flute || ''})</span></p>
                    <p>• Substansi Bahan: <span className="font-semibold text-slate-800">{data.substansi || 'K125/M125/K125'}</span></p>
                    <p>• Sambungan: <span className="font-semibold text-slate-800">{data.jenis_sambungan || 'Stitching (Kawat Jahit)'}</span></p>
                  </div>
                </td>
                <td className="p-3 text-center border-r border-slate-300 font-bold text-slate-800">
                  {Number(data.qty || 1000).toLocaleString('id-ID')} Pcs
                </td>
                <td className="p-3 text-right border-r border-slate-300 font-black text-slate-900 text-sm">
                  Rp {Number(data.hargaJualPerPcs || 0).toLocaleString('id-ID')}
                  <span className="block text-[10px] text-emerald-700 font-semibold">(Include PPN)</span>
                </td>
                <td className="p-3 text-right font-black text-brand-700 text-sm">
                  Rp {Number(data.totalOmset || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                <td colSpan={3} className="p-2.5 text-right uppercase border-r border-slate-300">
                  Total Estimasi Nilai Penawaran (Include PPN):
                </td>
                <td colSpan={2} className="p-2.5 text-right font-black text-brand-700 text-base">
                  Rp {Number(data.totalOmset || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Syarat & Ketentuan Sesuai Revisi Client (Instruksi pembayaran dihapus) */}
        <div className="mb-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Syarat & Ketentuan Penawaran:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px] leading-relaxed">
              <li>Harga satuan di atas <strong>sudah termasuk PPN (Include)</strong>.</li>
              <li>Waktu pengerjaan: <strong>{waktuPengerjaan}</strong>.</li>
              <li>Pengiriman: <strong>Franco Surabaya</strong>.</li>
              <li>Penawaran harga sewaktu-waktu dapat berubah tanpa pemberitahuan terlebih dahulu.</li>
              <li>Masa berlaku penawaran harga selama <strong>14 (empat belas) hari kalender</strong> sejak tanggal diterbitkan.</li>
            </ul>
          </div>
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-2 break-inside-avoid">
          <div>
            <p className="font-semibold text-slate-600 mb-1">Diterima & Disetujui Oleh Customer,</p>
            <p className="text-[10px] text-slate-400 mb-14">Purchase Order (PO) Confirmation</p>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-900 inline-block px-10">
              ( .................................................... )
            </p>
            <p className="text-[10px] text-slate-400">Nama & Cap Perusahaan</p>
          </div>

          <div>
            <p className="font-semibold text-slate-600 mb-1">Hormat Kami,</p>
            <p className="text-[10px] text-slate-400 mb-14">CV. MAHARANI UNTUNG ABADI</p>
            <p className="font-bold border-t border-slate-400 pt-1 text-slate-900 inline-block px-10">
              ( {salesName} )
            </p>
            <p className="text-[10px] text-slate-400">Bagian Penjualan & Pemasaran</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
