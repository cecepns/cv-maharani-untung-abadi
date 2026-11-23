import React, { useState, useRef } from 'react';
import { Printer, X, Factory, Upload, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';

export default function PrintSPK({ data, onClose }) {
  if (!data) return null;

  const [designImage, setDesignImage] = useState(data.gambar_desain || null);
  const fileInputRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesignImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Safe Fallback Calculations
  const customerName = data.nama_customer || data.customer_nama || 'Cik A Cen / Pelanggan';
  const customerAddress = data.alamat_customer || data.customer_alamat || 'Jl. Klampis Anom 33 Surabaya';
  const customerPhone = data.telepon_customer || data.customer_telepon || '-';
  const boxName = data.nama_box || data.nama_barang || data.nama_produk || 'Karton Box Packaging Corrugated';

  const pBox = Number(data.panjang_mm || data.panjang || 390);
  const lBox = Number(data.lebar_mm || data.lebar || 290);
  const tBox = Number(data.tinggi_mm || data.tinggi || 270);
  const ukuranBox = data.ukuran_box && !data.ukuran_box.includes('undefined')
    ? data.ukuran_box
    : `${pBox} x ${lBox} x ${tBox} mm`;

  const substance = data.substance || data.substansi || data.tipe_karton || '150K/125/150K BF';
  const printing = data.warna_cetak || data.desain_cetak || 'Merah, Hitam';
  const qtyNum = Number(data.qty_target || data.qty || 10000);
  const hargaSatuan = Number(data.harga_satuan || 3850);
  const waktuKirim = data.waktu_pengiriman || '3 minggu';
  const syaratBayar = data.syarat_pembayaran || data.termin_bayar || '1 bulan setelah barang terima';
  const sambungan = data.sambungan || data.jenis_sambungan || 'Stitching (Jahit Kawat)';

  // Ukuran Sheet Estimasi
  const isDoubleWall = substance.includes('BC') || substance.includes('B/C');
  const kuping = isDoubleWall ? 63 : 43;
  const crease = isDoubleWall ? 24 : 12;
  const lSheet = lBox + tBox + crease;
  const pSheet = ((pBox + lBox) * 2) + kuping;
  const ukuranSheet = data.ukuran_sheet && data.ukuran_sheet !== '-'
    ? data.ukuran_sheet
    : `${lSheet} x ${pSheet} mm`;

  const tanggalOrder = data.tanggal_so || data.tanggal_mulai || new Date().toISOString().split('T')[0];
  const deadlineStr = data.target_selesai || data.tanggal_selesai || '3 minggu setelah SPK';

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-4xl">
      {/* Action Bar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1 gap-2">
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-brand-600" />
          <div>
            <span className="text-sm font-bold text-slate-800 block">Surat Perintah Kerja (Job Order Produksi)</span>
            <span className="text-xs text-slate-500">Format Order Pesanan & Kontrak Kerja Resmi Pabrik</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Upload gambar desain / artwork dus"
          >
            <Upload className="w-3.5 h-3.5" />
            {designImage ? 'Ganti Desain Dus' : '+ Upload Desain Dus'}
          </button>
          {designImage && (
            <button
              type="button"
              onClick={() => setDesignImage(null)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Hapus Desain"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
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

      <div className="print-area font-sans text-slate-900 text-xs leading-relaxed max-w-3xl mx-auto">
        {/* Kop Surat Resmi CV. MAHARANI (Sesuai Gambar 2) */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Logo Maharani"
              className="w-16 h-16 object-contain shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-2xl font-black tracking-wider text-rose-700 leading-none">
                MAHARANI
              </h1>
              <p className="text-xs font-black tracking-widest text-slate-900 uppercase mt-1">
                PACKAGING CARTON BOX & OFFSET PRINTING
              </p>
              <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                Factory : Medokan Asri Tengah II Q / 23-24 Telp./Fax. (031) 8795150, 8713507 Surabaya
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider rounded">
              SPK PRODUKSI
            </span>
            <p className="font-bold text-xs text-slate-900 mt-1">No: {data.nomor_spk || 'SPK-314560'}</p>
            <p className="text-[11px] text-slate-500">Tgl: {tanggalOrder}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-extrabold tracking-wider uppercase underline underline-offset-4 text-slate-900">
            ORDER PESANAN (KONTRAK KERJA)
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Surabaya, {new Date(tanggalOrder).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Spesifikasi Order Pesanan (Sesuai Gambar 2) */}
        <div className="border border-slate-400 rounded-lg p-3.5 mb-4 bg-slate-50/60">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="w-36 py-1 font-semibold text-slate-600">Pemesan</td>
                <td className="w-4 py-1 text-center font-bold">:</td>
                <td className="py-1 font-bold text-slate-900">{customerName}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Alamat Pemesan</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 text-slate-800">{customerAddress}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Nama Box</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-extrabold text-slate-900 text-sm text-brand-900">{boxName}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Ukuran Jadi (P x L x T)</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-mono font-bold text-slate-900">{ukuranBox}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Target Ukuran Sheet</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-mono font-bold text-emerald-800 bg-emerald-50/80 px-1.5 py-0.5 rounded inline-block">
                  {ukuranSheet}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Kwalitas / Substansi</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-bold text-slate-800">{substance}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Printing / Warna</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 text-slate-800">{printing}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Jumlah Order</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-black text-slate-900 text-sm">{qtyNum.toLocaleString('id-ID')} Box</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Harga Satuan</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-bold text-slate-900">Rp {hargaSatuan.toLocaleString('id-ID')} / pcs</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Waktu Pengiriman</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 text-slate-800">{waktuKirim} ({deadlineStr})</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Alamat Penerima</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 text-slate-800">{customerAddress}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Syarat Pembayaran</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-semibold text-slate-800">{syaratBayar}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Stitching / Glue</td>
                <td className="py-1 text-center font-bold">:</td>
                <td className="py-1 font-bold text-slate-800">{sambungan}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Slot Design Dos & Model Dos (Sesuai Gambar 3) */}
        <div className="border border-slate-300 rounded-lg p-3 mb-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
              Design Dos & Model Bentangan Dos:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Pola Standard RSC (A1)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Box Schematic Layout SVG */}
            <div className="border border-slate-200 rounded p-2 bg-slate-50 text-center">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">Model Bentangan Dos (Sheet Pattern)</span>
              <svg viewBox="0 0 280 120" className="w-full h-24 mx-auto stroke-slate-800 fill-white">
                {/* Flaps Top */}
                <rect x="25" y="10" width="50" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                <rect x="75" y="10" width="60" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                <rect x="135" y="10" width="50" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                <rect x="185" y="10" width="60" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                
                {/* Main Body */}
                <rect x="25" y="35" width="50" height="50" strokeWidth="1.5" fill="#f1f5f9" />
                <rect x="75" y="35" width="60" height="50" strokeWidth="1.5" fill="#ffffff" />
                <rect x="135" y="35" width="50" height="50" strokeWidth="1.5" fill="#f1f5f9" />
                <rect x="185" y="35" width="60" height="50" strokeWidth="1.5" fill="#ffffff" />
                
                {/* Joint Flap / Kupingan */}
                <polygon points="245,38 260,42 260,78 245,82" strokeWidth="1.5" fill="#e2e8f0" />
                <text x="252" y="63" fontSize="7" fill="#64748b" textAnchor="middle" transform="rotate(90 252 63)">KUPING</text>

                {/* Flaps Bottom */}
                <rect x="25" y="85" width="50" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                <rect x="75" y="85" width="60" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                <rect x="135" y="85" width="50" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                <rect x="185" y="85" width="60" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />

                {/* Dimension Annotations */}
                <text x="50" y="62" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">L: {lBox}</text>
                <text x="105" y="62" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">P: {pBox}</text>
                <text x="160" y="62" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">L: {lBox}</text>
                <text x="215" y="62" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">P: {pBox}</text>
                <text x="8" y="62" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">T: {tBox}</text>
              </svg>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Bentangan: {ukuranSheet}
              </div>
            </div>

            {/* Design / Artwork Slot */}
            <div className="border border-dashed border-slate-300 rounded p-2 text-center flex flex-col items-center justify-center min-h-[110px] bg-slate-50">
              {designImage ? (
                <div className="space-y-1">
                  <img
                    src={designImage}
                    alt="Design Dus Customer"
                    className="max-h-24 max-w-full object-contain rounded border border-slate-200 mx-auto"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block">✓ Desain Cetakan Terlampir</span>
                </div>
              ) : (
                <div className="text-slate-400 space-y-1 py-3">
                  <ImageIcon className="w-7 h-7 mx-auto text-slate-300" />
                  <span className="text-[11px] block text-slate-500 font-semibold">Design Dus (Sample / Film Sablon)</span>
                  <span className="text-[10px] block text-slate-400">Gunakan tombol upload di atas untuk melampirkan gambar design</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work Order Routing Process Table */}
        <div className="border border-slate-400 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800">
                <th className="p-1.5 text-center w-8 border-r border-slate-400">No</th>
                <th className="p-1.5 text-left w-28 border-r border-slate-400">Tahapan Mesin</th>
                <th className="p-1.5 text-left border-r border-slate-400">Instruksi Kerja & Parameter</th>
                <th className="p-1.5 text-center w-20 border-r border-slate-400">Target Qty</th>
                <th className="p-1.5 text-center w-20 border-r border-slate-400">Hasil Baik</th>
                <th className="p-1.5 text-center w-16">Reject</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 text-center font-bold border-r border-slate-400">1</td>
                <td className="p-1.5 font-bold border-r border-slate-400">POTONG SHEET</td>
                <td className="p-1.5 border-r border-slate-400">Slitter Rotary / Corrugator: Ukuran Sheet {ukuranSheet}</td>
                <td className="p-1.5 text-center font-bold border-r border-slate-400">{qtyNum.toLocaleString('id-ID')}</td>
                <td className="p-1.5 text-center border-r border-slate-400">_______</td>
                <td className="p-1.5 text-center">_____</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 text-center font-bold border-r border-slate-400">2</td>
                <td className="p-1.5 font-bold border-r border-slate-400">CETAK FLEXO</td>
                <td className="p-1.5 border-r border-slate-400">Flexo Printing: Warna {printing}, cek nozzling & ketajaman teks</td>
                <td className="p-1.5 text-center font-bold border-r border-slate-400">{qtyNum.toLocaleString('id-ID')}</td>
                <td className="p-1.5 text-center border-r border-slate-400">_______</td>
                <td className="p-1.5 text-center">_____</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 text-center font-bold border-r border-slate-400">3</td>
                <td className="p-1.5 font-bold border-r border-slate-400">FINISHING</td>
                <td className="p-1.5 border-r border-slate-400">Slotter Pisau Pond: Creasing lipat + {sambungan}</td>
                <td className="p-1.5 text-center font-bold border-r border-slate-400">{qtyNum.toLocaleString('id-ID')}</td>
                <td className="p-1.5 text-center border-r border-slate-400">_______</td>
                <td className="p-1.5 text-center">_____</td>
              </tr>
              <tr>
                <td className="p-1.5 text-center font-bold border-r border-slate-400">4</td>
                <td className="p-1.5 font-bold border-r border-slate-400">IKAT & PACKING</td>
                <td className="p-1.5 border-r border-slate-400">Strapping kuning, 25 pcs per ikat, cek QC kebersihan dus</td>
                <td className="p-1.5 text-center font-bold border-r border-slate-400">{qtyNum.toLocaleString('id-ID')}</td>
                <td className="p-1.5 text-center border-r border-slate-400">_______</td>
                <td className="p-1.5 text-center">_____</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Keterangan & Ketentuan Packaging (Sesuai Gambar 2) */}
        <div className="border border-slate-300 rounded-lg p-2.5 mb-4 text-[11px] bg-slate-50/70">
          <p className="font-bold text-slate-800 mb-0.5">Keterangan Standar Packaging Pabrik:</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
            <li>Toleransi pengiriman 10% dari jumlah order pesanan.</li>
            <li>Dengan adanya supplier beberapa pabrik kertas, maka kami tidak dapat menjamin warna kertas yang sama persis 100%.</li>
            <li>Design-design gambar cetakan di luar tanggung jawab kami.</li>
          </ol>
        </div>

        {/* Kolom Tanda Tangan (Sesuai Gambar 2) */}
        <div className="grid grid-cols-2 gap-10 text-center mt-6 pt-2">
          <div>
            <p className="font-semibold text-slate-700">Pemesan,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-8">
              ( {customerName} )
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Penerima Pesanan,</p>
            <div className="h-16"></div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-8">
              ( SUBAGIO )
            </p>
            <p className="text-[10px] text-slate-500">MAHARANI CARTON BOX</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
