import React from 'react';
import { Printer, X } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintSuratJalan({ data, onClose }) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const customerName = data.nama_customer || data.customer_nama || 'Customer';
  const customerAddress = data.alamat_kirim || data.alamat || 'Surabaya / Mojokerto';
  const tanggalStr = data.tanggal_kirim
    ? new Date(data.tanggal_kirim).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-4xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex items-center justify-between pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">Pratinjau Surat Jalan Resmi Pabrik</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Surat Jalan
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
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-slate-900 pb-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="Logo Maharani"
              className="w-14 h-14 object-contain shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-xl font-black tracking-wider text-rose-700 leading-none">
                MAHARANI
              </h1>
              <p className="text-[11px] font-black tracking-widest text-slate-900 uppercase mt-0.5">
                PACKAGING CARTON BOX & OFFSET PRINTING
              </p>
              <p className="text-[10px] text-slate-700 font-medium">
                Factory : Medokan Asri Tengah II Q / 23-24 Telp./Fax. (031) 8795150, 8713507 Surabaya
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded">
              SURAT JALAN
            </span>
            <p className="font-bold text-xs mt-1">No: {data.nomor_sj}</p>
            <p className="text-[10px] font-bold text-rose-600">FAKTUR MENYUSUL</p>
          </div>
        </div>

        {/* Metadata Pengiriman (Sesuai Gambar 4) */}
        <div className="grid grid-cols-2 gap-4 mb-3 border border-slate-300 p-2.5 rounded bg-slate-50/50">
          <div>
            <p className="text-slate-500 font-bold uppercase text-[10px]">Kepada Yth:</p>
            <p className="font-bold text-slate-900 text-sm">{customerName}</p>
            <p className="text-slate-700">{customerAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600">Surabaya, {tanggalStr}</p>
            <p className="mt-1 text-slate-700">
              Kendaraan No: <span className="font-bold text-slate-900">{data.no_kendaraan || 'L 9123 MUA'}</span>
            </p>
            <p className="text-slate-700">
              Supir: <span className="font-semibold">{data.nama_supir || 'Supir Pabrik'}</span>
            </p>
            {data.nomor_so && <p className="text-slate-500 text-[10px]">Ref SO: {data.nomor_so}</p>}
          </div>
        </div>

        <p className="text-[11px] text-slate-600 mb-1.5 italic">
          Kami kirimkan barang-barang tersebut dibawah ini dengan kendaraan di atas:
        </p>

        {/* Tabel Kolom Fisik Maharani (Gambar 4) */}
        <table className="w-full text-xs border border-slate-400 mb-4">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold text-center">
              <th className="p-1.5 border-r border-slate-400 w-20">BANYAKNYA</th>
              <th className="p-1.5 border-r border-slate-400 text-left">NAMA BARANG</th>
              <th className="p-1.5 border-r border-slate-400 w-28">UKURAN</th>
              <th className="p-1.5 border-r border-slate-400 w-24">SUBSTANCE</th>
              <th className="p-1.5 border-r border-slate-400 w-16">IKAT</th>
              <th className="p-1.5 border-r border-slate-400 w-16">ISI @</th>
              <th className="p-1.5 w-24">JUMLAH</th>
            </tr>
          </thead>
          <tbody>
            {(data.items && data.items.length > 0 ? data.items : [
              {
                qty_kirim: data.total_qty || 1000,
                nama_barang: data.nama_barang || 'Karton Box Packaging Dus',
                ukuran_box: data.ukuran_box || '390 x 290 x 270 mm',
                substansi: data.substansi || '150K/125/150K BF',
                total_ikat: Math.ceil((Number(data.total_qty) || 1000) / 25),
                isi_per_ikat: 25
              }
            ]).map((item, idx) => {
              const qty = Number(item.qty_kirim || item.qty || 1000);
              const isiPerIkat = Number(item.isi_per_ikat || 25);
              const totalIkat = item.total_ikat || Math.ceil(qty / isiPerIkat);
              return (
                <tr key={idx} className="border-b border-slate-300 text-slate-800">
                  <td className="p-1.5 text-center border-r border-slate-400 font-bold">
                    {qty.toLocaleString('id-ID')} Pcs
                  </td>
                  <td className="p-1.5 border-r border-slate-400 font-bold">
                    {item.nama_barang}
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-400 font-mono">
                    {item.ukuran_box || item.ukuran || '390x290x270'}
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-400">
                    {item.substansi || item.substance || '150K/125/150K'}
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-400 font-semibold">
                    {totalIkat} Ikat
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-400">
                    {isiPerIkat}
                  </td>
                  <td className="p-1.5 text-right font-black">
                    {qty.toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Tanda Tangan Sesuai Gambar 4 */}
        <div className="grid grid-cols-2 gap-10 text-center text-xs mt-8 pt-2">
          <div>
            <p className="font-semibold text-slate-700">Penerima,</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-slate-300 italic text-[11px]">( Tanda tangan & stempel )</span>
            </div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-10">
              ( {customerName} )
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Hormat kami,</p>
            <div className="h-16 flex items-center justify-center">
              <span className="font-black text-rose-800 text-sm tracking-wider">SUBAGIO</span>
            </div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-10">
              ( SUBAGIO )
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">MAHARANI CARTON BOX</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
