import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';
import KopSuratMaharani from '../common/KopSuratMaharani';

function angkaTerbilang(angka) {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const n = Math.floor(Math.abs(Number(angka) || 0));
  if (n === 0) return 'Nol Rupiah';
  function toWords(num) {
    if (num < 12) return bilangan[num];
    if (num < 20) return toWords(num - 10) + ' Belas';
    if (num < 100) return toWords(Math.floor(num / 10)) + ' Puluh ' + toWords(num % 10);
    if (num < 200) return 'Seratus ' + toWords(num - 100);
    if (num < 1000) return toWords(Math.floor(num / 100)) + ' Ratus ' + toWords(num % 100);
    if (num < 2000) return 'Seribu ' + toWords(num - 1000);
    if (num < 1000000) return toWords(Math.floor(num / 1000)) + ' Ribu ' + toWords(num % 1000);
    if (num < 1000000000) return toWords(Math.floor(num / 1000000)) + ' Juta ' + toWords(num % 1000000);
    return toWords(Math.floor(num / 1000000000)) + ' Milyar ' + toWords(num % 1000000000);
  }
  return toWords(n).replace(/\s+/g, ' ').trim() + ' Rupiah';
}

export default function PrintInvoice({ data, onClose }) {
  if (!data) return null;

  const [signerName, setSignerName] = useState('SUBAGIO');

  const handlePrint = () => {
    window.print();
  };

  const customerName = data.nama_customer || data.customer_nama || 'Customer';
  const customerAddress = data.alamat || data.customer_alamat || 'Surabaya / Sidoarjo';
  const tanggalStr = data.tanggal_invoice
    ? new Date(data.tanggal_invoice).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jatuhTempoStr = data.jatuh_tempo
    ? new Date(data.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '30 Hari setelah terima';

  const totalTagihan = Number(data.total_tagihan) || Number(data.subtotal) || 0;
  const sudahBayar = Number(data.sudah_dibayar) || 0;
  const sisaTagihan = Number(data.sisa_tagihan) || (totalTagihan - sudahBayar);

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-4xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1 gap-2">
        <span className="text-sm font-bold text-slate-800">Pratinjau Faktur / Nota Penjualan Resmi</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <label className="text-xs font-bold text-slate-600">Penandatangan:</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="SUBAGIO"
              className="px-2 py-1 text-xs border border-slate-300 rounded-lg font-bold text-slate-800 w-32"
            />
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Faktur
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

      {/* Printable Area Sesuai Format Fisik Maharani (Gambar 4) */}
      <div className="print-area font-sans text-slate-900 leading-relaxed text-xs max-w-3xl mx-auto">
        {/* Kop Surat Resmi Maharani (Sesuai Gambar 1) */}
        <KopSuratMaharani
          badge="FAKTUR PENJUALAN"
          nomor={`No: ${data.nomor_invoice || 'INV-202611-001'}`}
          tanggal={`Tgl: ${tanggalStr}`}
          extra={`Jatuh Tempo: ${jatuhTempoStr}`}
        />

        {/* Customer & Tanggal (Sesuai Gambar 4) */}
        <div className="grid grid-cols-2 gap-4 mb-3 border border-slate-300 p-2.5 rounded bg-slate-50/50">
          <div>
            <p className="text-slate-500 font-bold uppercase text-[10px]">Kepada Yth:</p>
            <p className="font-bold text-slate-900 text-sm">{customerName}</p>
            <p className="text-slate-700">{customerAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600">Surabaya, {tanggalStr}</p>
            <p className="text-slate-700 mt-1">
              Ref Order / SO: <span className="font-semibold text-slate-900">{data.nomor_so || '-'}</span>
            </p>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                data.status_bayar === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                Status: {data.status_bayar || 'Belum Lunas'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabel Fisik Faktur (Sesuai Gambar 4) */}
        <table className="w-full text-xs border border-slate-400 mb-3">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold text-center">
              <th className="p-1.5 border-r border-slate-400 w-20">BANYAKNYA</th>
              <th className="p-1.5 border-r border-slate-400 text-left">NAMA BARANG</th>
              <th className="p-1.5 border-r border-slate-400 w-28">UKURAN</th>
              <th className="p-1.5 border-r border-slate-400 w-24">SUBSTANCE</th>
              <th className="p-1.5 border-r border-slate-400 w-24">@ (HARGA)</th>
              <th className="p-1.5 w-28">JUMLAH (RP)</th>
            </tr>
          </thead>
          <tbody>
            {(data.items && data.items.length > 0 ? data.items : [
              {
                qty: data.qty || data.total_qty || 5000,
                nama_barang: data.nama_barang || 'Karton Box Packaging (Dus)',
                ukuran_box: data.ukuran_box || '430 x 280 x 200 mm',
                substansi: data.substansi || '150K/125/150K BF',
                harga_satuan: data.harga_satuan || Math.round((Number(data.subtotal) || totalTagihan) / (Number(data.qty) || 5000)) || 3700,
                subtotal: Number(data.subtotal) || totalTagihan
              }
            ]).map((it, idx) => (
              <tr key={idx} className="border-b border-slate-300 text-slate-800">
                <td className="p-1.5 text-center border-r border-slate-400 font-bold">
                  {Number(it.qty || it.qty_kirim || 5000).toLocaleString('id-ID')} Box
                </td>
                <td className="p-1.5 border-r border-slate-400 font-bold">
                  {it.nama_barang}
                </td>
                <td className="p-1.5 text-center border-r border-slate-400 font-mono">
                  {it.ukuran_box || it.ukuran || '430x280x200'}
                </td>
                <td className="p-1.5 text-center border-r border-slate-400">
                  {it.substansi || it.substance || '150K/125/150K'}
                </td>
                <td className="p-1.5 text-right border-r border-slate-400 font-semibold">
                  Rp {Number(it.harga_satuan || 3700).toLocaleString('id-ID')}
                </td>
                <td className="p-1.5 text-right font-black">
                  Rp {Number(it.subtotal || ((Number(it.qty) || 5000) * (Number(it.harga_satuan) || 3700))).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            {/* PPN Row */}
            {Number(data.ppn || 0) > 0 && (
              <tr className="border-b border-slate-300">
                <td colSpan={5} className="p-1.5 text-right font-bold text-slate-700 border-r border-slate-400">
                  PPN (11%):
                </td>
                <td className="p-1.5 text-right font-bold text-slate-900">
                  Rp {Number(data.ppn).toLocaleString('id-ID')}
                </td>
              </tr>
            )}
            {/* Total Row */}
            <tr className="bg-slate-50 font-black text-slate-900 border-b border-slate-400">
              <td colSpan={5} className="p-2 text-right text-xs uppercase border-r border-slate-400">
                TOTAL RP :
              </td>
              <td className="p-2 text-right text-sm text-brand-700">
                Rp {totalTagihan.toLocaleString('id-ID')}
              </td>
            </tr>
            {sudahBayar > 0 && (
              <>
                <tr className="border-b border-slate-200">
                  <td colSpan={5} className="p-1 text-right text-emerald-700 font-bold border-r border-slate-400">
                    DP / Sudah Dibayar:
                  </td>
                  <td className="p-1 text-right text-emerald-700 font-bold">
                    Rp {sudahBayar.toLocaleString('id-ID')}
                  </td>
                </tr>
                <tr className="bg-rose-50/50">
                  <td colSpan={5} className="p-1 text-right text-rose-700 font-black border-r border-slate-400">
                    SISA TAGIHAN:
                  </td>
                  <td className="p-1 text-right text-rose-700 font-black">
                    Rp {sisaTagihan.toLocaleString('id-ID')}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Terbilang (Sesuai Gambar 4) */}
        <div className="p-2 border border-slate-300 rounded bg-slate-50 mb-3 text-xs">
          <span className="font-bold text-slate-700">Terbilang: </span>
          <span className="italic font-bold text-slate-900">
            # {angkaTerbilang(totalTagihan)} #
          </span>
        </div>

        {/* Box Perhatian & Tanda Tangan (Sesuai Gambar 4) */}
        <div className="grid grid-cols-2 gap-4 items-start mt-4 pt-1">
          {/* Perhatian */}
          <div className="p-2.5 border border-slate-400 rounded text-[11px] leading-tight bg-white">
            <p className="font-extrabold text-slate-900 uppercase underline mb-1">PERHATIAN :</p>
            <p className="text-slate-800 font-medium">
              Pembayaran dengan Cek / Bilyet Giro (BG) baru dianggap lunas apabila dana sudah efektif cair di rekening bank kami.
            </p>
            <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-600">
              <p>Transfer Bank BCA: <strong className="text-slate-900">4567-8901</strong> a/n CV. Maharani Untung Abadi</p>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="text-center text-xs">
            <p className="font-semibold text-slate-700">Hormat kami,</p>
            <div className="h-16 flex items-center justify-center">
              <span className="font-black text-rose-800 text-sm tracking-wider uppercase">{signerName}</span>
            </div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-10">
              ( {signerName} )
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">MAHARANI CARTON BOX</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
