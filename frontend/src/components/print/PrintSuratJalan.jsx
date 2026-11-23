import React, { useState } from 'react';
import { Printer, X, Truck, Edit3 } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintSuratJalan({ data, onClose }) {
  if (!data) return null;

  const [signerName, setSignerName] = useState('SUBAGIO');

  // Initial Items with Smart Ikat Breakdown Support (Revisi Client Item 11)
  const initialItems = (data.items && data.items.length > 0 ? data.items : [
    {
      qty_kirim: data.total_qty || 107,
      nama_barang: data.nama_box || data.nama_barang || 'Karton Box Packaging Dus',
      ukuran_box: data.ukuran_box || '390 x 290 x 270 mm',
      substansi: data.substansi || data.substance || '150K/125/150K BF',
      isi_per_ikat: 25,
    }
  ]).map((it) => {
    const qty = Number(it.qty_kirim || it.qty || 107);
    const isi = Number(it.isi_per_ikat || 25);
    const fullIkat = Math.floor(qty / isi);
    const sisa = qty % isi;
    return {
      qty,
      nama_barang: it.nama_barang || 'Karton Box Dus Polos',
      ukuran_box: it.ukuran_box || it.ukuran || '390 x 290 x 270',
      substansi: it.substansi || it.substance || '150K/125/150K',
      isi_per_ikat: isi,
      fullIkat,
      sisa,
      customIkat: '',
      customIsi: '',
    };
  });

  const [tableItems, setTableItems] = useState(initialItems);

  const handlePrint = () => {
    window.print();
  };

  const handleItemChange = (idx, field, value) => {
    setTableItems((prev) => {
      const updated = [...prev];
      const it = { ...updated[idx], [field]: value };
      if (field === 'qty' || field === 'isi_per_ikat') {
        const q = Number(it.qty || 0);
        const isi = Number(it.isi_per_ikat || 1);
        it.fullIkat = Math.floor(q / (isi || 1));
        it.sisa = q % (isi || 1);
      }
      updated[idx] = it;
      return updated;
    });
  };

  const customerName = data.nama_customer || data.customer_nama || 'Customer';
  const customerAddress = data.alamat_kirim || data.alamat || 'Surabaya / Mojokerto';
  const tanggalStr = data.tanggal_kirim
    ? new Date(data.tanggal_kirim).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-4xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-col gap-2.5 pb-3 mb-4 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-bold text-slate-800">Pratinjau Surat Jalan Resmi Pabrik</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
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

        {/* Toolbar Pengaturan Ikat & Penandatangan */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Edit3 className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              <strong>Fitur Ikat & Sisa:</strong> Jumlah ikat otomatis menghitung sisa tidak bulat (contoh: 107 pcs = 4 ikat @ 25 + 1 ikat isi 7 pcs sisa). Anda juga dapat mengedit teks tabel secara langsung.
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <label className="font-bold text-slate-700 whitespace-nowrap">
              Penandatangan:
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nama Penandatangan (SUBAGIO)"
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 w-36"
            />
          </div>
        </div>
      </div>

      {/* Printable Area Sesuai Format Fisik Maharani (Gambar 4) */}
      <div className="print-area font-sans text-slate-900 leading-relaxed text-xs max-w-3xl mx-auto">
        {/* Kop Surat Resmi (Sesuai Gambar 4 & Revisi Item 8) */}
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
                Factory : Medokan Asri Tengah II Q / 23-24 Telp. 085100918118, (031) 8795150 Surabaya
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded">
              SURAT JALAN
            </span>
            <p className="font-bold text-xs mt-1">No: {data.nomor_sj || 'SJ-202611-001'}</p>
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

        {/* Tabel Kolom Fisik Maharani (Gambar 4 & Revisi Item 11: Otomatis + Sisa) */}
        <table className="w-full text-xs border border-slate-400 mb-4">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold text-center">
              <th className="p-1.5 border-r border-slate-400 w-20">BANYAKNYA</th>
              <th className="p-1.5 border-r border-slate-400 text-left">NAMA BARANG</th>
              <th className="p-1.5 border-r border-slate-400 w-28">UKURAN</th>
              <th className="p-1.5 border-r border-slate-400 w-24">SUBSTANCE</th>
              <th className="p-1.5 border-r border-slate-400 w-28">IKAT</th>
              <th className="p-1.5 border-r border-slate-400 w-28">ISI @</th>
              <th className="p-1.5 w-24">JUMLAH</th>
            </tr>
          </thead>
          <tbody>
            {tableItems.map((item, idx) => {
              const totalIkatCount = item.fullIkat + (item.sisa > 0 ? 1 : 0);
              return (
                <tr key={idx} className="border-b border-slate-300 text-slate-800">
                  <td className="p-1.5 text-center border-r border-slate-400 font-bold">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                      className="w-16 text-center font-bold bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs"
                    />
                    <span className="text-[10px] block text-slate-500">Pcs</span>
                  </td>
                  <td className="p-1.5 border-r border-slate-400 font-bold">
                    <input
                      type="text"
                      value={item.nama_barang}
                      onChange={(e) => handleItemChange(idx, 'nama_barang', e.target.value)}
                      className="w-full font-bold bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs"
                    />
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-400 font-mono">
                    <input
                      type="text"
                      value={item.ukuran_box}
                      onChange={(e) => handleItemChange(idx, 'ukuran_box', e.target.value)}
                      className="w-full text-center bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs"
                    />
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-400">
                    <input
                      type="text"
                      value={item.substansi}
                      onChange={(e) => handleItemChange(idx, 'substansi', e.target.value)}
                      className="w-full text-center bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs"
                    />
                  </td>

                  {/* Kolom IKAT (Revisi 11: Tampilkan Jumlah Ikat Bulat & Sisa) */}
                  <td className="p-1.5 text-center border-r border-slate-400">
                    {item.customIkat ? (
                      <input
                        type="text"
                        value={item.customIkat}
                        onChange={(e) => handleItemChange(idx, 'customIkat', e.target.value)}
                        className="w-full text-center font-bold bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs"
                      />
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900">{totalIkatCount} Ikat</div>
                        {item.sisa > 0 ? (
                          <div className="text-[10px] text-slate-500 font-mono">
                            ({item.fullIkat} ikat + 1 sisa)
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-mono">
                            (Bulat)
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Kolom ISI @ (Revisi 11: Tampilkan @25 pcs + sisa N pcs) */}
                  <td className="p-1.5 text-center border-r border-slate-400">
                    {item.customIsi ? (
                      <input
                        type="text"
                        value={item.customIsi}
                        onChange={(e) => handleItemChange(idx, 'customIsi', e.target.value)}
                        className="w-full text-center bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs"
                      />
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-900">
                          @{item.isi_per_ikat} pcs
                        </div>
                        {item.sisa > 0 && (
                          <div className="text-[10px] text-rose-600 font-bold">
                            + {item.sisa} pcs (sisa)
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="p-1.5 text-right font-black text-slate-900">
                    {item.qty.toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Keterangan Fisik Maharani */}
        <div className="text-[10px] text-slate-500 italic mb-4">
          * Harap diperiksa dengan teliti saat serah terima barang. Segala komplain atas kekurangan fisik wajib dicantumkan pada surat jalan saat penerimaan.
        </div>

        {/* Tanda Tangan Sesuai Gambar 4 & Revisi Item 9: Nama Subagio Bisa Diubah */}
        <div className="grid grid-cols-2 gap-10 text-center text-xs mt-6 pt-2">
          <div>
            <p className="font-semibold text-slate-700">Penerima,</p>
            <div className="h-14 flex items-center justify-center">
              <span className="text-slate-300 italic text-[11px]">( Tanda tangan & stempel )</span>
            </div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-10">
              ( {customerName} )
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Hormat kami,</p>
            <div className="h-14 flex items-center justify-center">
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
