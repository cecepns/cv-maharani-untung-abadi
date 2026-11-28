import React, { useState, useRef } from 'react';
import { Printer, X, Factory, Upload, Image as ImageIcon, Trash2, CheckCircle2, PenTool, LayoutGrid } from 'lucide-react';
import PrintModalWrapper from './PrintModalWrapper';
import KopSuratMaharani from '../common/KopSuratMaharani';

export default function PrintSPK({ data, onClose }) {
  if (!data) return null;

  const [designImage, setDesignImage] = useState(data.gambar_desain || null);
  const [boxModel, setBoxModel] = useState('a1'); // 'a1', 'diecut', 'manual'
  const [signerName, setSignerName] = useState('SUBAGIO');
  const [deliveryTime, setDeliveryTime] = useState(data.waktu_pengiriman || '3 minggu');
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
  const syaratBayar = data.syarat_pembayaran || data.termin_bayar || '1 bulan setelah barang terima';
  const sambungan = data.sambungan || data.jenis_sambungan || 'Stitching (Jahit Kawat)';

  // Rumus Standar Resmi Pabrik (Sesuai Catatan Resmi Client):
  // 1. Single Wall:
  //    - EF: P = (P+L)*2 + 39, L = (L+T) + 9 (Standar) / (L*2)+T+9 (Tutup Full)
  //    - BF: P = (P+L)*2 + 43, L = (L+T) + 12 (Standar) / (L*2)+T+12 (Tutup Full)
  //    - CF: P = (P+L)*2 + 47, L = (L+T) + 13 (Standar) / (L*2)+T+13 (Tutup Full)
  // 2. Double Wall BCF (B/C):
  //    - BCF: P = (P+L)*2 + 63, L = (L+T) + 24 (Standar) / (L*2)+T+24 (Tutup Full)
  const isDoubleWall = (substance.toUpperCase().includes('BC') || substance.toUpperCase().includes('B/C') || (data.nama_box || '').toUpperCase().includes('DOUBLE') || (data.tipe_karton || '').toUpperCase().includes('A2') || (data.tipe_karton || '').toUpperCase().includes('DW'));
  const isCF = (substance.toUpperCase().includes('CF') || substance.toUpperCase().includes('C/F') || (data.tipe_karton || '').toUpperCase().includes('C/F'));
  const isEF = (substance.toUpperCase().includes('EF') || substance.toUpperCase().includes('E/F') || (data.tipe_karton || '').toUpperCase().includes('E/F'));

  let pExtra = 43;
  let lExtra = 12;
  let tabMm = 31;
  if (isDoubleWall) {
    pExtra = 63;
    lExtra = 24;
    tabMm = 39;
  } else if (isCF) {
    pExtra = 47;
    lExtra = 13;
    tabMm = 31;
  } else if (isEF) {
    pExtra = 39;
    lExtra = 9;
    tabMm = 31;
  }

  const isFullOverlap = (data.nama_box || '').toUpperCase().includes('FULL') || (data.model_dus || '').toUpperCase().includes('FULL');
  const tabCm = (tabMm / 10).toFixed(1);
  const tutupFlap = isFullOverlap ? lBox : (isDoubleWall ? Math.round((lBox / 2) + 6) : Math.round((lBox / 2) + 3));
  const pLuar = isDoubleWall ? pBox + 6 : pBox + 3;
  const lLuar = isDoubleWall ? lBox + 6 : lBox + 3;
  const tLuar = isDoubleWall ? tBox + 12 : tBox + 6;

  const lSheet = isFullOverlap ? (lBox * 2) + tBox + lExtra : lBox + tBox + lExtra;
  const pSheet = ((pBox + lBox) * 2) + pExtra;
  const ukuranSheet = data.ukuran_sheet && data.ukuran_sheet !== '-' && !data.ukuran_sheet.includes('NaN')
    ? data.ukuran_sheet
    : `${lSheet} x ${pSheet} mm`;

  const tanggalOrder = data.tanggal_so || data.tanggal_mulai || new Date().toISOString().split('T')[0];

  // Editable Routing Steps (Revisi Client Item 6: Instruksi Kerja bisa diisi sendiri)
  const [routingSteps, setRoutingSteps] = useState([
    {
      no: 1,
      tahapan: 'POTONG SHEET',
      instruksi: `Slitter Rotary / Corrugator: Ukuran Sheet ${ukuranSheet}`,
      targetQty: qtyNum.toLocaleString('id-ID'),
    },
    {
      no: 2,
      tahapan: 'CETAK FLEXO',
      instruksi: `Flexo Printing: Warna ${printing}, cek nozzling & ketajaman teks`,
      targetQty: qtyNum.toLocaleString('id-ID'),
    },
    {
      no: 3,
      tahapan: 'FINISHING',
      instruksi: `Slotter Pisau Pond: Creasing lipat + ${sambungan}`,
      targetQty: qtyNum.toLocaleString('id-ID'),
    },
    {
      no: 4,
      tahapan: 'IKAT & PACKING',
      instruksi: `Strapping kuning, 25 pcs per ikat, cek QC kebersihan dus`,
      targetQty: qtyNum.toLocaleString('id-ID'),
    },
  ]);

  const handleStepChange = (index, field, value) => {
    setRoutingSteps((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <PrintModalWrapper onClose={onClose} isOpen={!!data} maxWidth="max-w-4xl">
      {/* Action Bar & Customization Toolbar (hidden on print) */}
      <div className="no-print sticky top-0 z-20 flex flex-col gap-3 pb-3 mb-4 bg-white/95 backdrop-blur-xs border-b border-slate-200 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Upload gambar desain / artwork dus"
            >
              <Upload className="w-3.5 h-3.5" />
              {designImage ? 'Ganti Desain Dus' : '+ Upload Desain Dus'}
            </button>
            {designImage && (
              <button
                type="button"
                onClick={() => setDesignImage(null)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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

        {/* Customization Toolbar: Pilihan Model Dus, Waktu Pengiriman, dan Nama Subagio */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Model Dus Bentangan (Revisi 5):
            </label>
            <select
              value={boxModel}
              onChange={(e) => setBoxModel(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="a1">Model A1 (RSC Standard 4-Flap)</option>
              <option value="diecut">Model Die-Cut / Pond</option>
              <option value="manual">Tulis / Gambar Manual (Kanvas Kosong)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Waktu Pengiriman (Revisi 10):
            </label>
            <input
              type="text"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="Contoh: 3 minggu / 14 hari kerja"
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Penandatangan Pabrik (Revisi 9):
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nama Penandatangan (SUBAGIO)"
              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Printable Area Sesuai Format Fisik Maharani (Gambar 2 & Gambar 3) */}
      <div className="print-area font-sans text-slate-900 leading-relaxed text-xs max-w-3xl mx-auto">
        {/* Kop Surat Resmi Maharani (Sesuai Gambar 1) */}
        <KopSuratMaharani
          badge="SPK PRODUKSI"
          nomor={`No: ${data.nomor_spk || 'SPK-314560'}`}
          tanggal={`Tgl: ${tanggalOrder}`}
        />

        {/* Title */}
        <div className="text-center mb-3">
          <h2 className="text-sm font-extrabold tracking-wider uppercase underline underline-offset-4 text-slate-900">
            ORDER PESANAN (KONTRAK KERJA)
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Surabaya, {new Date(tanggalOrder).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Spesifikasi Order Pesanan (Sesuai Gambar 2) */}
        <div className="border border-slate-400 rounded-lg p-3 mb-3 bg-slate-50/60">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="w-36 py-0.5 font-semibold text-slate-600">Pemesan</td>
                <td className="w-4 py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-bold text-slate-900">{customerName}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Alamat Pemesan</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 text-slate-800">{customerAddress}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Nama Box</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-extrabold text-slate-900 text-sm text-brand-900">{boxName}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Ukuran Jadi (P x L x T)</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-mono font-bold text-slate-900">
                  {ukuranBox}
                  <span className="ml-2 text-[11px] font-sans font-semibold text-slate-600">
                    (Size Luar: <span className="font-bold text-slate-900 font-mono">{pLuar} x {lLuar} x {tLuar} mm</span>)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Tutup Flap & Tab Sambungan</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-semibold text-slate-800 text-[11px]">
                  Tutup Flap: <span className="font-bold text-blue-700">{tutupFlap} mm</span> ({isDoubleWall ? 'L/2 + 6' : 'L/2 + 3'}) • Tab: <span className="font-bold text-amber-700">{tabMm} mm ({tabCm} cm)</span>
                </td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Target Ukuran Sheet</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-mono font-bold text-emerald-800 bg-emerald-50/80 px-1.5 py-0.5 rounded inline-block">
                  {ukuranSheet}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Kwalitas / Substansi</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-bold text-slate-800">{substance}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Printing / Warna</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 text-slate-800">{printing}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Jumlah Order</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-black text-slate-900 text-sm">{qtyNum.toLocaleString('id-ID')} Box</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Harga Satuan</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-bold text-slate-900">Rp {hargaSatuan.toLocaleString('id-ID')} / pcs</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Waktu Pengiriman</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-bold text-slate-900">{deliveryTime}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Alamat Penerima</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 text-slate-800">{customerAddress}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Syarat Pembayaran</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-semibold text-slate-800">{syaratBayar}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold text-slate-600">Stitching / Glue</td>
                <td className="py-0.5 text-center font-bold">:</td>
                <td className="py-0.5 font-bold text-slate-800">{sambungan}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Slot Model Bentangan Dos (SELALU TAMPIL, LENGKAP DENGAN UKURAN P, L, T, TUTUP, TAB) */}
        <div className="border-2 border-slate-400 rounded-lg p-3 mb-3 bg-white break-inside-avoid">
          <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-brand-600" />
              Model Bentangan Dos & Spesifikasi Ukuran Sheet:
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
              {boxModel === 'a1' && (isDoubleWall ? 'Pola Double Wall (A2)' : 'Pola Single Wall (A1)')}
              {boxModel === 'diecut' && 'Pola Pisau Pond / Die-Cut'}
              {boxModel === 'manual' && 'Sketsa / Tulis Manual'}
            </span>
          </div>

          {/* Area Diagram Bentangan Dus (Tetap Ada & Tidak Hilang Saat Upload Desain) */}
          <div className="min-h-[160px] flex items-center justify-center p-2 rounded bg-slate-50/50 border border-dashed border-slate-300 relative">
            {boxModel === 'a1' ? (
              <div className="w-full text-center">
                <svg viewBox="0 0 540 170" className="w-full h-40 mx-auto stroke-slate-800 fill-white">
                  {/* Flaps Atas */}
                  <rect x="25" y="10" width="110" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  <rect x="135" y="10" width="130" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  <rect x="265" y="10" width="110" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  <rect x="375" y="10" width="130" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  
                  {/* Body Utama Dus (4 Panel: L, P, L, P) */}
                  <rect x="25" y="45" width="110" height="75" strokeWidth="1.5" fill="#f1f5f9" />
                  <rect x="135" y="45" width="130" height="75" strokeWidth="1.5" fill="#f1f5f9" />
                  <rect x="265" y="45" width="110" height="75" strokeWidth="1.5" fill="#f1f5f9" />
                  <rect x="375" y="45" width="130" height="75" strokeWidth="1.5" fill="#f1f5f9" />
                  
                  {/* Kupingan Tab Sambungan */}
                  <polygon points="505,50 535,55 535,115 505,120" strokeWidth="1.5" fill="#fed7aa" />

                  {/* Flaps Bawah */}
                  <rect x="25" y="120" width="110" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  <rect x="135" y="120" width="130" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  <rect x="265" y="120" width="110" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />
                  <rect x="375" y="120" width="130" height="35" strokeWidth="1.5" strokeDasharray="4 2" fill="#f8fafc" />

                  {/* Labels Dimensi */}
                  <text x="80" y="88" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">L: {lBox} mm</text>
                  <text x="200" y="88" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">P: {pBox} mm</text>
                  <text x="320" y="88" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">L: {lBox} mm</text>
                  <text x="440" y="88" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">P: {pBox} mm</text>
                  <text x="520" y="88" textAnchor="middle" className="text-[8.5px] font-black fill-amber-800">Tab {tabMm}mm</text>
                  <text x="270" y="32" textAnchor="middle" className="text-[9.5px] font-semibold fill-slate-600">
                    Tutup Flap Atas: (L/2 + {isDoubleWall ? '6' : '3'}) = {tutupFlap} mm
                  </text>
                  <text x="270" y="142" textAnchor="middle" className="text-[9.5px] font-semibold fill-slate-600">
                    Tutup Flap Bawah: (L/2 + {isDoubleWall ? '6' : '3'}) = {tutupFlap} mm
                  </text>
                </svg>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600 font-semibold bg-white p-1.5 rounded border border-slate-200">
                  <span><strong>Tipe:</strong> {isDoubleWall ? 'Double Wall A2' : 'Single Wall A1'}</span>
                  <span><strong>Target Sheet:</strong> <span className="font-mono text-emerald-700 font-bold">{ukuranSheet}</span></span>
                  <span><strong>Tab Kuping:</strong> <span className="text-amber-700 font-bold">{tabMm} mm ({tabCm} cm)</span></span>
                  <span><strong>Tutup Flap:</strong> <span className="text-blue-700 font-bold">{tutupFlap} mm</span></span>
                  <span><strong>Size Luar:</strong> <span className="font-mono font-bold">{pLuar} x {lLuar} x {tLuar} mm</span></span>
                </div>
              </div>
            ) : boxModel === 'diecut' ? (
              <div className="w-full text-center">
                <svg viewBox="0 0 540 160" className="w-full h-36 mx-auto stroke-slate-800 fill-white">
                  {/* Die-cut Base & Side Flaps */}
                  <rect x="180" y="35" width="180" height="90" strokeWidth="1.5" fill="#f1f5f9" />
                  <rect x="60" y="35" width="120" height="90" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                  <rect x="360" y="35" width="120" height="90" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                  {/* Top Cover with Tuck Flap */}
                  <rect x="180" y="10" width="180" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                  <rect x="180" y="125" width="180" height="25" strokeWidth="1.5" strokeDasharray="3 2" fill="#f8fafc" />
                  {/* Locking Ears */}
                  <polygon points="60,45 35,55 35,105 60,115" strokeWidth="1.5" fill="#e2e8f0" />
                  <polygon points="480,45 505,55 505,105 480,115" strokeWidth="1.5" fill="#e2e8f0" />
                  <text x="270" y="85" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">Alas Dus Die-Cut: {pBox} x {lBox} mm</text>
                </svg>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                  Pola Pisau Pond Die-Cut • Creasing & Locking Tab Khusus
                </p>
              </div>
            ) : (
              <div className="w-full h-40 flex flex-col items-center justify-center bg-white rounded border border-slate-300 p-2">
                <div className="w-full h-full border border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                  <LayoutGrid className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="text-[11px] font-bold text-slate-600">
                    Area Kanvas Sketsa Desain & Bentangan Manual
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Bisa digambar / ditulis tangan langsung di lembar cetak SPK oleh Tim QC / Desain)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slot Desain Dus / Artwork Cetakan Dus (TAMPIL TERSENDIRI SEHINGGA BENTANGAN DOS TIDAK HILANG!) */}
        {designImage && (
          <div className="border-2 border-slate-400 rounded-lg p-3 mb-3 bg-white break-inside-avoid">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                Artwork & Desain Cetakan Dus:
              </span>
              <button
                type="button"
                onClick={() => setDesignImage(null)}
                className="no-print text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                title="Hapus gambar desain"
              >
                <Trash2 className="w-3 h-3" />
                Hapus Desain
              </button>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-50/50 border border-dashed border-slate-300">
              <img
                src={designImage}
                alt="Artwork Desain Dus"
                className="max-h-72 sm:max-h-96 max-w-full object-contain rounded shadow-xs"
              />
              <span className="text-[10px] text-slate-500 mt-1 italic">
                Artwork Desain Cetakan Dus Terlampir • Sesuai Approval Client
              </span>
            </div>
          </div>
        )}

        {/* Tabel Routing Kerja & Mesin (REVISI CLIENT ITEM 6: DAPAT DIISI / DIUBAH SENDIRI) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
              Instruksi Kerja & Parameter Mesin (Bisa Diisi / Diedit Langsung):
            </span>
            <span className="no-print text-[10px] text-brand-600 font-semibold">
              *Klik teks pada tabel untuk mengedit instruksi sebelum dicetak
            </span>
          </div>

          <table className="w-full text-xs border border-slate-400">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800">
                <th className="p-1.5 text-center w-8 border-r border-slate-400">No</th>
                <th className="p-1.5 text-left w-32 border-r border-slate-400">Tahapan Mesin</th>
                <th className="p-1.5 text-left border-r border-slate-400">Instruksi Kerja & Parameter Mesin</th>
                <th className="p-1.5 text-center w-24 border-r border-slate-400">Target Qty</th>
                <th className="p-1.5 text-center w-20 border-r border-slate-400">Hasil Baik</th>
                <th className="p-1.5 text-center w-16">Reject</th>
              </tr>
            </thead>
            <tbody>
              {routingSteps.map((step, idx) => (
                <tr key={step.no} className="border-b border-slate-300">
                  <td className="p-1 text-center font-bold border-r border-slate-400">{step.no}</td>
                  <td className="p-1 font-bold border-r border-slate-400">{step.tahapan}</td>
                  <td className="p-1 border-r border-slate-400">
                    <input
                      type="text"
                      value={step.instruksi}
                      onChange={(e) => handleStepChange(idx, 'instruksi', e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs text-slate-800"
                    />
                  </td>
                  <td className="p-1 text-center font-bold border-r border-slate-400">
                    <input
                      type="text"
                      value={step.targetQty}
                      onChange={(e) => handleStepChange(idx, 'targetQty', e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-1 focus:ring-brand-500 rounded text-xs text-center font-bold text-slate-800"
                    />
                  </td>
                  <td className="p-1 text-center border-r border-slate-400 text-slate-400">_______</td>
                  <td className="p-1 text-center text-slate-400">_____</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Keterangan & Ketentuan Packaging (Sesuai Gambar 2) */}
        <div className="border border-slate-300 rounded-lg p-2.5 mb-3 text-[11px] bg-slate-50/70">
          <p className="font-bold text-slate-800 mb-0.5">Keterangan Standar Packaging Pabrik:</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
            <li>Toleransi pengiriman 10% dari jumlah order pesanan.</li>
            <li>Dengan adanya supplier beberapa pabrik kertas, maka kami tidak dapat menjamin warna kertas yang sama persis 100%.</li>
            <li>Design-design gambar cetakan di luar tanggung jawab kami.</li>
          </ol>
        </div>

        {/* Kolom Tanda Tangan (Sesuai Gambar 2 & Revisi Item 9: Nama Subagio Bisa Diubah) */}
        <div className="grid grid-cols-2 gap-10 text-center mt-5 pt-1">
          <div>
            <p className="font-semibold text-slate-700">Pemesan,</p>
            <div className="h-14"></div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-8">
              ( {customerName} )
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Penerima Pesanan,</p>
            <div className="h-14 flex items-center justify-center">
              <span className="font-black text-rose-800 text-sm tracking-wider uppercase">{signerName}</span>
            </div>
            <p className="font-bold border-t border-slate-500 pt-1 text-slate-900 inline-block px-8">
              ( {signerName} )
            </p>
            <p className="text-[10px] text-slate-500">MAHARANI CARTON BOX</p>
          </div>
        </div>
      </div>
    </PrintModalWrapper>
  );
}
