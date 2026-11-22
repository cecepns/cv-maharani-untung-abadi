import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Box,
  Layers,
  DollarSign,
  Percent,
  Printer,
  Copy,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileText,
  Save,
  Share2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import SearchableSelect from '@/components/common/SearchableSelect';
import PrintPenawaranHarga from '@/components/print/PrintPenawaranHarga';

// Spesifikasi standar industri & rumus toleransi karton gelombang CV. Maharani
export const FLUTE_SPECS = {
  'B/F': {
    kode: 'B/F',
    nama: 'B-Flute Single Wall (~3mm)',
    kupingan: 43,
    creasing: 12,
    defaultGsm: 420,
    kategori: 'Corrugated',
    deskripsi: 'Standar packaging umum & ekspedisi (Daya lipat baik)'
  },
  'C/F': {
    kode: 'C/F',
    nama: 'C-Flute Single Wall (~4mm)',
    kupingan: 47,
    creasing: 18,
    defaultGsm: 435,
    kategori: 'Corrugated',
    deskripsi: 'Daya tumpuk (stacking) lebih kuat untuk barang berat'
  },
  'B/C': {
    kode: 'B/C',
    nama: 'B/C Double Wall 2 Gelombang (~7mm)',
    kupingan: 63,
    creasing: 24,
    defaultGsm: 680,
    kategori: 'Corrugated',
    deskripsi: 'Dus tebal industri berat, sparepart mesin & buah ekspor'
  },
  'E/F': {
    kode: 'E/F',
    nama: 'E-Flute Micro Single Wall (~1.5mm)',
    kupingan: 35,
    creasing: 8,
    defaultGsm: 410,
    kategori: 'Corrugated',
    deskripsi: 'Kotak pizza, kosmetik, hampers & dus die-cut halus'
  },
  'Duplex': {
    kode: 'Duplex',
    nama: 'Karton Duplex Coated (White/Grey)',
    kupingan: 25,
    creasing: 5,
    defaultGsm: 310,
    kategori: 'Paperboard Solid',
    deskripsi: 'Box makanan/martabak, farmasi (250-450 gsm)'
  },
  'Ivory': {
    kode: 'Ivory',
    nama: 'Karton Ivory Food Grade Solid',
    kupingan: 25,
    creasing: 5,
    defaultGsm: 300,
    kategori: 'Paperboard Solid',
    deskripsi: 'Kemasan makanan steril premium & kosmetik'
  }
};

export default function EstimasiHargaPage() {
  const navigate = useNavigate();

  // State Ukuran Box (mm)
  const [boxDimensions, setBoxDimensions] = useState({
    panjang: 400,
    lebar: 200,
    tinggi: 130
  });

  // State Flute & Spesifikasi
  const [fluteType, setFluteType] = useState('B/F');
  const [useCustomAllowance, setUseCustomAllowance] = useState(false);
  const [customAllowance, setCustomAllowance] = useState({ kupingan: 43, creasing: 12 });

  // State Index Kertas & Gramatur
  const [metodeIndex, setMetodeIndex] = useState('m2'); // 'm2' or 'kg'
  const [nilaiIndex, setNilaiIndex] = useState(7000);
  const [substansi, setSubstansi] = useState('K125/M125/K125');
  const [gsm, setGsm] = useState(420);
  const [masterSheets, setMasterSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');

  // State Penyesuaian Harga Modal (Diskon / Plus Markup)
  const [adjustType, setAdjustType] = useState('plus_percent'); // 'plus_percent', 'plus_nominal', 'minus_percent', 'minus_nominal', 'none'
  const [adjustValue, setAdjustValue] = useState(20); // 20% default margin

  // Biaya Proses Tambahan (Opsional)
  const [biayaCetak, setBiayaCetak] = useState(150); // Rp/pcs flexo
  const [biayaFinishing, setBiayaFinishing] = useState(50); // Rp/pcs stitching/lem

  // Qty Simulasi Order
  const [simulasiQty, setSimulasiQty] = useState(1000);

  // Modal Cetak Penawaran & Master Box
  const [printData, setPrintData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    nama_barang: '',
    jenis_sambungan: 'Stitching'
  });

  // Fetch Master Sheet & Customer untuk kemudahan penawaran
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sheetRes, custRes] = await Promise.all([
          request.get(API_ENDPOINTS.PURCHASING.BAHAN_SHEET, { limit: 100 }),
          request.get(API_ENDPOINTS.MARKETING.CUSTOMERS, { limit: 100 })
        ]);
        if (sheetRes.success && Array.isArray(sheetRes.data)) {
          setMasterSheets(sheetRes.data);
        }
        if (custRes.success && Array.isArray(custRes.data)) {
          setCustomers(custRes.data);
        }
      } catch (err) {
        console.error('Fetch data error:', err);
      }
    };
    fetchData();
  }, []);

  // Sync saat ganti tipe flute
  useEffect(() => {
    const spec = FLUTE_SPECS[fluteType] || FLUTE_SPECS['B/F'];
    if (!useCustomAllowance) {
      setCustomAllowance({ kupingan: spec.kupingan, creasing: spec.creasing });
    }
    setGsm(spec.defaultGsm);
  }, [fluteType, useCustomAllowance]);

  // Handle pilih bahan dari Master Sheet
  const handleSelectMasterSheet = (sheetId) => {
    setSelectedSheetId(sheetId);
    if (!sheetId) return;
    const sheet = masterSheets.find((s) => String(s.id) === String(sheetId));
    if (sheet) {
      if (sheet.flute && FLUTE_SPECS[sheet.flute]) {
        setFluteType(sheet.flute);
      }
      if (sheet.substansi) setSubstansi(sheet.substansi);
      if (sheet.nilai_index) {
        setNilaiIndex(Number(sheet.nilai_index));
        setMetodeIndex(sheet.metode_index || 'm2');
      } else if (sheet.harga_per_lembar && sheet.panjang_mm && sheet.lebar_mm) {
        // Kalkulasi index m2 dari harga lembar
        const luas = (sheet.panjang_mm / 1000) * (sheet.lebar_mm / 1000);
        if (luas > 0) {
          setNilaiIndex(Math.round(Number(sheet.harga_per_lembar) / luas));
          setMetodeIndex('m2');
        }
      }
      toast.success(`Bahan sheet "${sheet.nama_sheet}" dimuat ke kalkulator`);
    }
  };

  // ========================================================
  // RUMUS PERHITUNGAN PRESISI DARI CLIENT
  // ========================================================
  const calculation = useMemo(() => {
    const P_box = Number(boxDimensions.panjang) || 0;
    const L_box = Number(boxDimensions.lebar) || 0;
    const T_box = Number(boxDimensions.tinggi) || 0;

    const spec = FLUTE_SPECS[fluteType] || FLUTE_SPECS['B/F'];
    const kupingan = useCustomAllowance ? Number(customAllowance.kupingan) || 0 : spec.kupingan;
    const creasing = useCustomAllowance ? Number(customAllowance.creasing) || 0 : spec.creasing;

    // 1. Ukuran Lembaran Sheet (mm)
    // P_sheet = ((P + L) * 2) + kupingan
    // L_sheet = L + T + creasing
    const P_sheet = ((P_box + L_box) * 2) + kupingan;
    const L_sheet = L_box + T_box + creasing;

    // 2. Luas 1 Lembar Sheet (m2)
    const p_meter = P_sheet / 1000;
    const l_meter = L_sheet / 1000;
    const luas_m2 = p_meter * l_meter;

    // 3. Berat 1 Lembar Sheet (kg)
    const berat_kg = luas_m2 * ((Number(gsm) || 420) / 1000);

    // 4. Harga Modal Sheet (HPP Bahan) per pcs
    let modalSheet = 0;
    const idx = Number(nilaiIndex) || 0;
    if (metodeIndex === 'm2') {
      modalSheet = Math.round(luas_m2 * idx);
    } else {
      modalSheet = Math.round(berat_kg * idx);
    }

    // 5. Total HPP Dasar Dus (Bahan + Cetak + Finishing)
    const biayaCetakVal = Number(biayaCetak) || 0;
    const biayaFinishingVal = Number(biayaFinishing) || 0;
    const hppDasarTotal = modalSheet + biayaCetakVal + biayaFinishingVal;

    // 6. Penyesuaian Margin / Diskon ("Mainkan Diskon atau Plus Berapa dari Modal")
    let selisihAdjust = 0;
    const adjVal = Number(adjustValue) || 0;

    if (adjustType === 'plus_percent') {
      selisihAdjust = Math.round(hppDasarTotal * (adjVal / 100));
    } else if (adjustType === 'plus_nominal') {
      selisihAdjust = adjVal;
    } else if (adjustType === 'minus_percent') {
      selisihAdjust = -Math.round(hppDasarTotal * (adjVal / 100));
    } else if (adjustType === 'minus_nominal') {
      selisihAdjust = -adjVal;
    } else {
      selisihAdjust = 0;
    }

    const hargaJualPerPcs = Math.max(0, hppDasarTotal + selisihAdjust);
    const profitPerPcs = hargaJualPerPcs - hppDasarTotal;
    const marginPersen = hppDasarTotal > 0 ? Math.round((profitPerPcs / hppDasarTotal) * 1000) / 10 : 0;

    // 7. Simulasi Total Order
    const qty = Number(simulasiQty) || 1000;
    const totalOmset = hargaJualPerPcs * qty;
    const totalModal = hppDasarTotal * qty;
    const totalProfit = profitPerPcs * qty;

    return {
      P_box,
      L_box,
      T_box,
      kupingan,
      creasing,
      P_sheet,
      L_sheet,
      luas_m2: Math.round(luas_m2 * 10000) / 10000,
      berat_kg: Math.round(berat_kg * 1000) / 1000,
      modalSheet,
      biayaCetakVal,
      biayaFinishingVal,
      hppDasarTotal,
      selisihAdjust,
      hargaJualPerPcs,
      profitPerPcs,
      marginPersen,
      qty,
      totalOmset,
      totalModal,
      totalProfit
    };
  }, [boxDimensions, fluteType, useCustomAllowance, customAllowance, metodeIndex, nilaiIndex, gsm, biayaCetak, biayaFinishing, adjustType, adjustValue, simulasiQty]);

  // Salin Rincian ke WhatsApp
  const handleCopyWhatsApp = () => {
    const text = `*PENAWARAN ESTIMASI HARGA DUS KARTON BOX*
*CV. MAHARANI UNTUNG ABADI*
-----------------------------------------
📦 *Spesifikasi Kemasan:*
- Model: Karton Box Standar (A1 / RSC)
- Ukuran Box: ${calculation.P_box} x ${calculation.L_box} x ${calculation.T_box} mm
- Tipe Flute: ${fluteType} (${FLUTE_SPECS[fluteType]?.nama || ''})
- Substansi: ${substansi}
- Ukuran Lembaran Sheet: ${calculation.P_sheet} x ${calculation.L_sheet} mm (${calculation.luas_m2} m²/pcs)

💰 *Estimasi Harga Jual:*
- *Harga Satuan: Rp ${calculation.hargaJualPerPcs.toLocaleString('id-ID')} / pcs*
- Simulasi Qty: ${calculation.qty.toLocaleString('id-ID')} pcs
- Total Estimasi: Rp ${calculation.totalOmset.toLocaleString('id-ID')}

Catatan:
- Harga belum termasuk PPN (jika ada faktur)
- Estimasi berlaku 14 hari
- Hubungi kami untuk penyesuaian cetak custom / logo perusahaan.
-----------------------------------------
Terima kasih telah mempercayakan kebutuhan packaging Anda kepada CV. Maharani Untung Abadi!`;

    navigator.clipboard.writeText(text);
    toast.success('Rincian penawaran disalin! Siap dipaste ke WhatsApp customer');
  };

  // Buka Modal Pratinjau Cetak Surat Penawaran Resmi
  const handleOpenPrintModal = () => {
    setPrintData({
      nama_barang: `Karton Box ${calculation.P_box}x${calculation.L_box}x${calculation.T_box} mm`,
      panjang: calculation.P_box,
      lebar: calculation.L_box,
      tinggi: calculation.T_box,
      tipe_flute: fluteType,
      nama_flute: FLUTE_SPECS[fluteType]?.nama || '',
      substansi: substansi,
      P_sheet: calculation.P_sheet,
      L_sheet: calculation.L_sheet,
      luas_m2: calculation.luas_m2,
      jenis_sambungan: saveFormData.jenis_sambungan || 'Stitching (Kawat Jahit)',
      hargaJualPerPcs: calculation.hargaJualPerPcs,
      qty: calculation.qty,
      totalOmset: calculation.totalOmset,
      customer_nama: 'Pimpinan / Purchasing Dept.',
      customer_alamat: 'Di Tempat',
      nama_sales: 'Marketing Lead'
    });
  };

  // Simpan Sebagai Produk Jadi di Master Box
  const handleOpenSaveModal = () => {
    setSaveFormData({
      nama_barang: `Karton Box ${calculation.P_box}x${calculation.L_box}x${calculation.T_box} ${fluteType}`,
      jenis_sambungan: 'Stitching'
    });
    setIsSaveModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const kode = `BOX-${calculation.P_box}x${calculation.L_box}-${Date.now().toString().slice(-4)}`;
      const payload = {
        kode_barang: kode,
        nama_barang: saveFormData.nama_barang,
        jenis_barang: 'Box',
        tipe_flute: fluteType,
        substansi: substansi,
        panjang_mm: calculation.P_box,
        lebar_mm: calculation.L_box,
        tinggi_mm: calculation.T_box,
        jenis_sambungan: saveFormData.jenis_sambungan,
        stok_qty: 0,
        satuan: 'Pcs',
        harga_jual: calculation.hargaJualPerPcs,
        min_stok: 200
      };

      await request.post(API_ENDPOINTS.MARKETING.PRODUCTS, payload);
      toast.success('Box berhasil disimpan ke Master Produk!');
      setIsSaveModalOpen(false);
    } catch (err) {
      toast.error('Gagal menyimpan produk: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                Kalkulator Estimasi Harga Dus & Index Sheet
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Hitung otomatis dimensi lembaran sheet dari P x L x T box, modal sheet dari index supplier, dan atur diskon atau markup margin.
              </p>
            </div>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            Salin WhatsApp
          </button>
          <button
            type="button"
            onClick={handleOpenPrintModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Cetak Surat Penawaran Harga Resmi (PDF)"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Penawaran
          </button>
          <button
            type="button"
            onClick={handleOpenSaveModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Save className="w-4 h-4" />
            Simpan Master Box
          </button>
        </div>
      </div>

      {/* Grid Utama: Form Input & Live Hasil */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Input Parameter Box & Index (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Dimensi Box & Flute */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  1. Ukuran Dus Box Karton (P x L x T mm)
                </h2>
              </div>
              <span className="text-xs text-slate-400">Satuan Milimeter (mm)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Panjang (P) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    value={boxDimensions.panjang}
                    onChange={(e) => setBoxDimensions({ ...boxDimensions, panjang: Number(e.target.value) || 0 })}
                    className="w-full pl-3 pr-9 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lebar (L) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    value={boxDimensions.lebar}
                    onChange={(e) => setBoxDimensions({ ...boxDimensions, lebar: Number(e.target.value) || 0 })}
                    className="w-full pl-3 pr-9 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mm</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tinggi (T) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    value={boxDimensions.tinggi}
                    onChange={(e) => setBoxDimensions({ ...boxDimensions, tinggi: Number(e.target.value) || 0 })}
                    className="w-full pl-3 pr-9 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mm</span>
                </div>
              </div>
            </div>

            {/* Quick Presets Dimensi Box */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Contoh Ukuran:</span>
              <button
                type="button"
                onClick={() => setBoxDimensions({ panjang: 400, lebar: 200, tinggi: 130 })}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
              >
                400 x 200 x 130 (Video)
              </button>
              <button
                type="button"
                onClick={() => setBoxDimensions({ panjang: 300, lebar: 200, tinggi: 200 })}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
              >
                300 x 200 x 200
              </button>
              <button
                type="button"
                onClick={() => setBoxDimensions({ panjang: 500, lebar: 350, tinggi: 300 })}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
              >
                500 x 350 x 300
              </button>
            </div>

            {/* Tipe Flute & Allowance */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Tipe Flute / Bahan Karton
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.values(FLUTE_SPECS).map((f) => (
                  <div
                    key={f.kode}
                    onClick={() => setFluteType(f.kode)}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                      fluteType === f.kode
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">{f.kode}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        f.kode === 'B/C' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        +{f.kupingan} / +{f.creasing}mm
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{f.nama}</div>
                  </div>
                ))}
              </div>

              {/* Rumus visual dari kertas client */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1.5 text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Rumus Otomatis Lembaran Sheet ({fluteType}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                    <strong>Panjang (P):</strong> ((P + L) × 2) + {calculation.kupingan} ={' '}
                    <span className="font-bold text-brand-700">{calculation.P_sheet} mm</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                    <strong>Lebar (L):</strong> L + T + {calculation.creasing} ={' '}
                    <span className="font-bold text-brand-700">{calculation.L_sheet} mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Index Supplier & Gramatur */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  2. Nilai Index Kertas & Gramatur
                </h2>
              </div>
              <span className="text-xs text-slate-400">Harga Beli Supplier</span>
            </div>

            {/* Opsi Pilih dari Master Sheet */}
            {masterSheets.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambil Cepat dari Master Bahan Baku Sheet (Opsional):
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: '-- Input Bebas / Kustom Sendiri --' },
                    ...masterSheets.map((s) => ({
                      value: s.id,
                      label: `${s.kode_sheet} - ${s.nama_sheet} (${s.flute} ${s.substansi}) - Rp ${Number(s.harga_per_lembar || 0).toLocaleString('id-ID')}/lbr`,
                    })),
                  ]}
                  value={selectedSheetId}
                  onChange={(val) => handleSelectMasterSheet(val)}
                  placeholder="-- Cari Bahan Baku Sheet --"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Index
                </label>
                <SearchableSelect
                  options={[
                    { value: 'm2', label: 'Index Luas (Rp / m²)' },
                    { value: 'kg', label: 'Index Tonase (Rp / kg)' },
                  ]}
                  value={metodeIndex}
                  onChange={(val) => setMetodeIndex(val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Index ({metodeIndex === 'm2' ? 'Rp/m²' : 'Rp/kg'}) *
                </label>
                <input
                  type="number"
                  value={nilaiIndex}
                  onChange={(e) => setNilaiIndex(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder={metodeIndex === 'm2' ? 'Contoh: 7000' : 'Contoh: 15000'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Substansi Kertas
                </label>
                <input
                  type="text"
                  value={substansi}
                  onChange={(e) => setSubstansi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  placeholder="K125/M125/K125"
                />
              </div>
            </div>

            {metodeIndex === 'kg' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total GSM Gramatur Gabungan (gr/m²)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={gsm}
                    onChange={(e) => setGsm(Number(e.target.value) || 0)}
                    className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <span className="text-xs text-slate-500">
                    Estimasi standar: B/F (420g), C/F (435g), B/C (680g), Duplex (310g)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: REVISI CLIENT: "Mainkan Diskon atau Plus Berapa dari Harga Modal" */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  3. Mainkan Diskon (-) atau Plus (+) dari Harga Modal
                </h2>
              </div>
              <span className="text-xs font-semibold text-brand-700">Revisi Permintaan Client</span>
            </div>

            {/* Selector Jenis Penyesuaian */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setAdjustType('plus_percent'); setAdjustValue(20); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'plus_percent'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Plus Margin (%)
              </button>

              <button
                type="button"
                onClick={() => { setAdjustType('plus_nominal'); setAdjustValue(500); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'plus_nominal'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Plus Margin (Rp)
              </button>

              <button
                type="button"
                onClick={() => { setAdjustType('minus_percent'); setAdjustValue(5); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'minus_percent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Diskon Potongan (%)
              </button>

              <button
                type="button"
                onClick={() => { setAdjustType('minus_nominal'); setAdjustValue(200); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  adjustType === 'minus_nominal'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Diskon Potongan (Rp)
              </button>
            </div>

            {/* Input Nilai Penyesuaian & Preset Cepat */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="text-xs font-bold text-slate-700">
                  {adjustType.startsWith('plus') ? 'Tambahan Keuntungan (Markup / Margin):' : 'Potongan Diskon untuk Customer:'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">
                    {adjustType.startsWith('plus') ? '+' : '-'}
                  </span>
                  <input
                    type="number"
                    value={adjustValue}
                    onChange={(e) => setAdjustValue(Number(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 text-sm font-black text-slate-800 bg-white border border-slate-300 rounded-xl text-right"
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {adjustType.endsWith('percent') ? '%' : 'Rp/pcs'}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">Pilihan Cepat:</span>
                {adjustType.endsWith('percent') ? (
                  (adjustType === 'plus_percent' ? [10, 15, 20, 25, 30, 40] : [2, 5, 7.5, 10, 15]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustValue(val)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        adjustValue === val
                          ? 'bg-white border-brand-500 text-brand-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {adjustType.startsWith('plus') ? `+${val}%` : `-${val}%`}
                    </button>
                  ))
                ) : (
                  (adjustType === 'plus_nominal' ? [250, 500, 750, 1000, 1500] : [100, 200, 300, 500]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustValue(val)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        adjustValue === val
                          ? 'bg-white border-brand-500 text-brand-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {adjustType.startsWith('plus') ? `+Rp ${val}` : `-Rp ${val}`}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Biaya Produksi Tambahan */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Biaya Tambahan Lainnya (Opsional / Per Pcs):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Biaya Cetak Flexo (Rp/pcs)</label>
                  <input
                    type="number"
                    value={biayaCetak}
                    onChange={(e) => setBiayaCetak(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    placeholder="Contoh: 150"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Biaya Sambungan / Finishing (Rp/pcs)</label>
                  <input
                    type="number"
                    value={biayaFinishing}
                    onChange={(e) => setBiayaFinishing(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    placeholder="Contoh: 50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Live Calculation Output & Hasil Final (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Hasil Live Final */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 rounded-2xl text-white p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge Status */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Hasil Kalkulasi Live
              </span>
              <span className="text-xs text-slate-400">Model: Box Standar A1</span>
            </div>

            {/* Highlight Harga Jual Final */}
            <div className="text-center py-2 border-y border-white/10">
              <div className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                ESTIMASI HARGA JUAL KE CUSTOMER
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                Rp {calculation.hargaJualPerPcs.toLocaleString('id-ID')}
                <span className="text-sm font-semibold text-slate-300 ml-1">/ pcs</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                <span className="text-slate-400">Modal: Rp {calculation.hppDasarTotal.toLocaleString('id-ID')}</span>
                <span className="text-slate-500">•</span>
                <span className={`font-bold ${calculation.profitPerPcs >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calculation.profitPerPcs >= 0 ? '+' : ''}Rp {calculation.profitPerPcs.toLocaleString('id-ID')} ({calculation.marginPersen}%)
                </span>
              </div>
            </div>

            {/* Breakdown Rincian Ukuran Sheet */}
            <div className="space-y-3 text-xs">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Rincian Lembaran Sheet ({fluteType}):
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[11px] text-slate-400">Panjang Sheet (P)</div>
                  <div className="text-sm font-black text-white mt-0.5">{calculation.P_sheet} mm</div>
                  <div className="text-[10px] text-slate-400 font-mono">((P+L)×2) + {calculation.kupingan}</div>
                </div>
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[11px] text-slate-400">Lebar Sheet (L)</div>
                  <div className="text-sm font-black text-white mt-0.5">{calculation.L_sheet} mm</div>
                  <div className="text-[10px] text-slate-400 font-mono">L + T + {calculation.creasing}</div>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ukuran Lembaran Sheet:</span>
                  <span className="font-bold text-white">{calculation.P_sheet} x {calculation.L_sheet} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Luas 1 Lembar Bahan:</span>
                  <span className="font-semibold text-slate-200">{calculation.luas_m2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Harga Modal Sheet Kertas:</span>
                  <span className="font-semibold text-amber-300">Rp {calculation.modalSheet.toLocaleString('id-ID')}</span>
                </div>
                {calculation.biayaCetakVal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biaya Cetak Flexo:</span>
                    <span className="text-slate-200">+Rp {calculation.biayaCetakVal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {calculation.biayaFinishingVal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biaya Finishing/Stitching:</span>
                    <span className="text-slate-200">+Rp {calculation.biayaFinishingVal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
                  <span className="text-slate-300">Total HPP Modal Dasar:</span>
                  <span className="text-white">Rp {calculation.hppDasarTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Penyesuaian ({adjustType.startsWith('plus') ? 'Plus Margin' : 'Diskon'}):</span>
                  <span>
                    {calculation.selisihAdjust >= 0 ? '+' : ''}Rp {calculation.selisihAdjust.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulasi Quantity Order */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Simulasi Order (Qty Pcs):</label>
                <div className="flex items-center gap-1.5">
                  {[500, 1000, 2000, 5000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSimulasiQty(q)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simulasiQty === q ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {q.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] text-slate-400">Total Nilai Order</div>
                  <div className="font-black text-amber-400 text-xs mt-1">
                    Rp {(calculation.totalOmset / 1000000).toFixed(2)} jt
                  </div>
                </div>
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] text-slate-400">Total Modal Sheet</div>
                  <div className="font-bold text-slate-300 text-xs mt-1">
                    Rp {(calculation.totalModal / 1000000).toFixed(2)} jt
                  </div>
                </div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="text-[10px] text-emerald-400">Estimasi Margin</div>
                  <div className="font-black text-emerald-300 text-xs mt-1">
                    Rp {(calculation.totalProfit / 1000000).toFixed(2)} jt
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Salin Penawaran ke WhatsApp Customer
              </button>
              <button
                type="button"
                onClick={handleOpenPrintModal}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm border border-white/20 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-brand-600" />
                Cetak Surat Penawaran Resmi (PDF)
              </button>
              <button
                type="button"
                onClick={() => navigate('/marketing/sales-orders')}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Buat Sales Order (SO) Baru <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Simpan ke Master Box */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Simpan Produk Box ke Master Produk"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk Kemasan Box *
            </label>
            <input
              type="text"
              required
              value={saveFormData.nama_barang}
              onChange={(e) => setSaveFormData({ ...saveFormData, nama_barang: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="text-slate-400">Dimensi Box:</span>
              <div className="font-bold text-slate-800">
                {calculation.P_box} x {calculation.L_box} x {calculation.T_box} mm
              </div>
            </div>
            <div>
              <span className="text-slate-400">Ukuran Lembaran Sheet:</span>
              <div className="font-bold text-slate-800">
                {calculation.P_sheet} x {calculation.L_sheet} mm ({fluteType})
              </div>
            </div>
            <div>
              <span className="text-slate-400">Substansi Kertas:</span>
              <div className="font-bold text-slate-800">{substansi}</div>
            </div>
            <div>
              <span className="text-slate-400">Harga Jual Estimasi:</span>
              <div className="font-bold text-emerald-700">
                Rp {calculation.hargaJualPerPcs.toLocaleString('id-ID')} / pcs
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Sambungan Box
            </label>
            <SearchableSelect
              options={[
                { value: 'Stitching', label: 'Stitching (Kawat Jahit)' },
                { value: 'Lem Glue', label: 'Lem Glue (Dextrin)' },
                { value: 'Die Cut Lock', label: 'Die Cut Lock (Tanpa Sambungan)' },
              ]}
              value={saveFormData.jenis_sambungan}
              onChange={(val) => setSaveFormData({ ...saveFormData, jenis_sambungan: val })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {saveLoading ? 'Menyimpan...' : 'Simpan ke Master Box'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Pratinjau Cetak Surat Penawaran Resmi */}
      <PrintPenawaranHarga
        data={printData}
        onClose={() => setPrintData(null)}
        customers={customers}
      />
    </div>
  );
}
