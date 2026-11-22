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
  PackageCheck,
  Table as TableIcon,
  X
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

// Tabel Resmi Pricelist Sheet PT. Qingda Maspion Paper Products (Harga / m² include PPN 11%)
export const MASPION_PRICE_LIST = [
  { no: 1, substance: '125M/125M/125M', 'E/F': 4322, 'B/F': 4322, 'C/F': 4420, 'B/C': 7318 },
  { no: 2, substance: '125K/125M/125M', 'E/F': 4450, 'B/F': 4450, 'C/F': 4549, 'B/C': 7446 },
  { no: 3, substance: '125K/125M/125K', 'E/F': 4578, 'B/F': 4578, 'C/F': 4677, 'B/C': 7575 },
  { no: 4, substance: '150K/125M/125M', 'E/F': 4673, 'B/F': 4673, 'C/F': 4772, 'B/C': 7669 },
  { no: 5, substance: '150K/125M/125K', 'E/F': 4801, 'B/F': 4801, 'C/F': 4900, 'B/C': 7798 },
  { no: 6, substance: '150K/125M/150K', 'E/F': 5024, 'B/F': 5024, 'C/F': 5123, 'B/C': 8020 },
  { no: 7, substance: '200K/125M/125M', 'E/F': 5316, 'B/F': 5316, 'C/F': 5418, 'B/C': 8427 },
  { no: 8, substance: '200K/125M/125K', 'E/F': 5449, 'B/F': 5449, 'C/F': 5551, 'B/C': 8560 },
  { no: 9, substance: '200K/125M/150K', 'E/F': 5680, 'B/F': 5680, 'C/F': 5783, 'B/C': 8792 },
  { no: 10, substance: '200K/125M/200K', 'E/F': 6143, 'B/F': 6143, 'C/F': 6245, 'B/C': 9254 },
  { no: 11, substance: '275K/125M/125M', 'E/F': 6587, 'B/F': 6587, 'C/F': 6694, 'B/C': 9814 },
  { no: 12, substance: '275K/125M/125K', 'E/F': 6727, 'B/F': 6727, 'C/F': 6833, 'B/C': 9953 },
  { no: 13, substance: '275K/125M/150K', 'E/F': 6966, 'B/F': 6966, 'C/F': 7073, 'B/C': 10193 },
  { no: 14, substance: '275K/125M/200K', 'E/F': 7446, 'B/F': 7446, 'C/F': 7552, 'B/C': 10673 },
  { no: 15, substance: '275K/125M/275K', 'E/F': 8826, 'B/F': 8826, 'C/F': 8936, 'B/C': 12168 },
  { no: 16, substance: '150WK/125M/125M', 'E/F': 5200, 'B/F': 5200, 'C/F': 5302, 'B/C': 8311 },
  { no: 17, substance: '150WK/125M/125K', 'E/F': 5333, 'B/F': 5333, 'C/F': 5436, 'B/C': 8445 },
  { no: 18, substance: '150WK/125M/150K', 'E/F': 5565, 'B/F': 5565, 'C/F': 5667, 'B/C': 8676 },
  { no: 19, substance: '150WK/125M/200K', 'E/F': 6027, 'B/F': 6027, 'C/F': 6130, 'B/C': 9139 },
  { no: 20, substance: '150WK/125M/275K', 'E/F': 7326, 'B/F': 7326, 'C/F': 7432, 'B/C': 10553 },
  { no: 21, substance: '150WK/125M/150WK', 'E/F': 6350, 'B/F': 6350, 'C/F': 6460, 'B/C': 9692 },
  { no: 22, substance: '200WK/125M/125M', 'E/F': 5778, 'B/F': 5778, 'C/F': 5881, 'B/C': 8890 },
  { no: 23, substance: '200WK/125M/125K', 'E/F': 5912, 'B/F': 5912, 'C/F': 6014, 'B/C': 9023 },
  { no: 24, substance: '200WK/125M/150K', 'E/F': 6143, 'B/F': 6143, 'C/F': 6245, 'B/C': 9254 },
  { no: 25, substance: '200WK/125M/200K', 'E/F': 6607, 'B/F': 6607, 'C/F': 6708, 'B/C': 9718 },
  { no: 26, substance: '200WK/125M/275K', 'E/F': 7926, 'B/F': 7926, 'C/F': 8032, 'B/C': 11153 },
  { no: 27, substance: '200WK/125M/150WK', 'E/F': 6971, 'B/F': 6971, 'C/F': 7081, 'B/C': 10313 },
  { no: 28, substance: '200WK/125M/200WK', 'E/F': 7592, 'B/F': 7592, 'C/F': 7702, 'B/C': 10935 },
];

export default function EstimasiHargaPage() {
  const navigate = useNavigate();

  // State Ukuran Box (mm) - Default contoh client: Box Tepung 270x270x278
  const [boxDimensions, setBoxDimensions] = useState({
    panjang: 270,
    lebar: 270,
    tinggi: 278
  });

  // State Flute & Spesifikasi
  const [fluteType, setFluteType] = useState('B/C'); // B/C Double Wall
  const [useCustomAllowance, setUseCustomAllowance] = useState(false);
  const [customAllowance, setCustomAllowance] = useState({ kupingan: 63, creasing: 24 });

  // State Sumber Index Kertas: 'maspion' (Pricelist Maspion), 'warehouse' (Master Gudang), 'manual' (Input Manual)
  const [sourceType, setSourceType] = useState('maspion');
  const [selectedMaspionSubstance, setSelectedMaspionSubstance] = useState('125K/125M/125K');
  const [isMaspionModalOpen, setIsMaspionModalOpen] = useState(false);

  // State Nilai Index & Gramatur
  const [metodeIndex, setMetodeIndex] = useState('m2'); // 'm2' or 'kg'
  const [nilaiIndex, setNilaiIndex] = useState(7575);
  const [substansi, setSubstansi] = useState('125K/125M/125K');
  const [gsm, setGsm] = useState(680);
  const [masterSheets, setMasterSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');

  // Perhitungan Lebar Roll Supplier (Aturan Maspion No. 5: "Harga dihitung berdasarkan lebar kertas")
  const [useRollWidth, setUseRollWidth] = useState(true);
  const [rollOuts, setRollOuts] = useState(3); // 3 Out
  const [rollWidthMm, setRollWidthMm] = useState(1750); // 1750 mm

  // Posisi Beli di Supplier (+/- %) -> "Skg beli di supplier posisi +"
  // Contoh client: 5050 (+ 10%) = 5555
  const [posisiSupplierPersen, setPosisiSupplierPersen] = useState(10); // +10%

  // Penyesuaian Harga Jual ke Customer (Margin / Diskon)
  const [adjustType, setAdjustType] = useState('plus_percent'); // 'plus_percent', 'plus_nominal', 'minus_percent', 'minus_nominal'
  const [adjustValue, setAdjustValue] = useState(20); // 20% margin

  // Biaya Proses Tambahan (Opsional)
  const [biayaCetak, setBiayaCetak] = useState(0); // Rp/pcs flexo
  const [biayaFinishing, setBiayaFinishing] = useState(0); // Rp/pcs stitching/lem

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

  // Fetch Master Sheet & Customer
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
    const spec = FLUTE_SPECS[fluteType] || FLUTE_SPECS['B/C'];
    if (!useCustomAllowance) {
      setCustomAllowance({ kupingan: spec.kupingan, creasing: spec.creasing });
    }
    setGsm(spec.defaultGsm);

    // Jika sedang mode Maspion, sync index otomatis
    if (sourceType === 'maspion') {
      const found = MASPION_PRICE_LIST.find((m) => m.substance === selectedMaspionSubstance);
      if (found && found[fluteType]) {
        setNilaiIndex(found[fluteType]);
      }
    }
  }, [fluteType, useCustomAllowance, sourceType, selectedMaspionSubstance]);

  // Handle Pilih Substance Maspion
  const handleSelectMaspionSubstance = (sub) => {
    setSelectedMaspionSubstance(sub);
    setSubstansi(sub);
    const found = MASPION_PRICE_LIST.find((m) => m.substance === sub);
    if (found && found[fluteType]) {
      setNilaiIndex(found[fluteType]);
    } else if (found) {
      setNilaiIndex(found['B/C'] || found['B/F'] || 7575);
    }
  };

  // Handle pilih bahan dari Master Sheet Gudang
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
  // RUMUS PERHITUNGAN PRESISI DARI CLIENT & MASPION
  // ========================================================
  const calculation = useMemo(() => {
    const P_box = Number(boxDimensions.panjang) || 0;
    const L_box = Number(boxDimensions.lebar) || 0;
    const T_box = Number(boxDimensions.tinggi) || 0;

    const spec = FLUTE_SPECS[fluteType] || FLUTE_SPECS['B/C'];
    const kupingan = useCustomAllowance ? Number(customAllowance.kupingan) || 0 : spec.kupingan;
    const creasing = useCustomAllowance ? Number(customAllowance.creasing) || 0 : spec.creasing;

    // 1. Ukuran Lembaran Sheet (mm)
    // Sesuai coretan client:
    // P_sheet = ((P + L) * 2) + kupingan -> ((270+270)*2) + 63 = 1143 mm
    // L_sheet = L + T + creasing -> 270 + 278 + 24 = 572 mm
    const P_sheet = ((P_box + L_box) * 2) + kupingan;
    const L_sheet = L_box + T_box + creasing;

    // 2. Luas 1 Lembar Bersih (Net m2)
    const p_meter = P_sheet / 1000;
    const l_meter = L_sheet / 1000;
    const luasNetM2 = p_meter * l_meter;

    // 3. Luas Tagihan Roll Kertas Supplier (Sesuai Aturan Maspion No. 5)
    // Coretan client: 572 x 3 = 1716 mm -> lebar roll supplier 1750 mm!
    const outs = Number(rollOuts) || 1;
    const rollWidth = Number(rollWidthMm) || (L_sheet * outs);
    const totalLebarOuts = L_sheet * outs;
    const luasTagihanM2 = useRollWidth
      ? ((rollWidth / 1000) * p_meter) / outs
      : luasNetM2;

    // 4. Harga Dasar Sheet dari Pricelist Supplier (Sebelum Posisi Supplier)
    let hargaDasarPricelist = 0;
    const idx = Number(nilaiIndex) || 0;
    if (metodeIndex === 'm2') {
      hargaDasarPricelist = Math.round(luasTagihanM2 * idx);
    } else {
      const berat_kg = luasTagihanM2 * ((Number(gsm) || 680) / 1000);
      hargaDasarPricelist = Math.round(berat_kg * idx);
    }

    // 5. Posisi Harga Beli Supplier (+ / - %)
    // "Skg beli di supplier posisi +" -> Coretan client: 5050 (+ 10%) = 5555
    const posSupplier = Number(posisiSupplierPersen) || 0;
    const selisihPosisiSupplier = Math.round(hargaDasarPricelist * (posSupplier / 100));
    const modalBeliSheet = hargaDasarPricelist + selisihPosisiSupplier;

    // 6. Total HPP Dasar Dus (Sheet + Cetak + Finishing)
    const biayaCetakVal = Number(biayaCetak) || 0;
    const biayaFinishingVal = Number(biayaFinishing) || 0;
    const hppDasarTotal = modalBeliSheet + biayaCetakVal + biayaFinishingVal;

    // 7. Penyesuaian Margin / Diskon untuk Customer
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
    }

    const hargaJualPerPcs = Math.max(0, hppDasarTotal + selisihAdjust);
    const profitPerPcs = hargaJualPerPcs - hppDasarTotal;
    const marginPersen = hppDasarTotal > 0 ? Math.round((profitPerPcs / hppDasarTotal) * 1000) / 10 : 0;

    // 8. Simulasi Total Order
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
      outs,
      rollWidth,
      totalLebarOuts,
      luasNetM2: Math.round(luasNetM2 * 10000) / 10000,
      luasTagihanM2: Math.round(luasTagihanM2 * 10000) / 10000,
      hargaDasarPricelist,
      posSupplier,
      selisihPosisiSupplier,
      modalBeliSheet,
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
  }, [
    boxDimensions,
    fluteType,
    useCustomAllowance,
    customAllowance,
    useRollWidth,
    rollOuts,
    rollWidthMm,
    nilaiIndex,
    metodeIndex,
    gsm,
    posisiSupplierPersen,
    biayaCetak,
    biayaFinishing,
    adjustType,
    adjustValue,
    simulasiQty
  ]);

  // Saat ukuran sheet berubah dan menggunakan roll width, sesuaikan lebar roll otomatis
  useEffect(() => {
    if (useRollWidth) {
      const totalOutsWidth = calculation.L_sheet * rollOuts;
      // Dibulatkan ke atas kelipatan 50mm (contoh 1716 -> 1750)
      const autoRoll = Math.max(1000, Math.ceil(totalOutsWidth / 50) * 50);
      setRollWidthMm(autoRoll);
    }
  }, [calculation.L_sheet, rollOuts, useRollWidth]);

  // Handler Preset Contoh Client: Box Tepung 270x270x278 (B/C Maspion)
  const applyClientExample = () => {
    setBoxDimensions({ panjang: 270, lebar: 270, tinggi: 278 });
    setFluteType('B/C');
    setSourceType('maspion');
    handleSelectMaspionSubstance('125K/125M/125K');
    setUseRollWidth(true);
    setRollOuts(3);
    setRollWidthMm(1750);
    setPosisiSupplierPersen(10);
    setBiayaCetak(0);
    setBiayaFinishing(0);
    toast.success('Contoh "Box Tepung 270x270x278 B/C (Maspion)" berhasil dimuat!');
  };

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
- Dimensi Sheet: ${calculation.P_sheet} x ${calculation.L_sheet} mm (${calculation.luasTagihanM2} m²/pcs)
${useRollWidth ? `- Lebar Roll Supplier: ${calculation.rollWidth} mm (${calculation.outs} Out)` : ''}

💰 *Estimasi Harga:*
- Harga Modal Supplier: Rp ${calculation.modalBeliSheet.toLocaleString('id-ID')} / pcs
- *Harga Jual Penawaran: Rp ${calculation.hargaJualPerPcs.toLocaleString('id-ID')} / pcs*
- Simulasi Qty: ${calculation.qty.toLocaleString('id-ID')} pcs
- Total Estimasi: Rp ${calculation.totalOmset.toLocaleString('id-ID')}

Catatan:
- Harga belum termasuk PPN 11% (jika ada faktur)
- Estimasi berlaku 14 hari kerja
- Hubungi kami untuk penyesuaian cetak logo & sample box.
-----------------------------------------
CV. Maharani Untung Abadi • Spesialis Packaging Industri`;

    navigator.clipboard.writeText(text);
    toast.success('Rincian penawaran disalin! Siap dipaste ke WhatsApp');
  };

  // Buka Modal Cetak Penawaran
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
      luas_m2: calculation.luasTagihanM2,
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
                Hitung dimensi lembaran sheet dari P x L x T box, modal sheet dari index supplier (Pricelist Maspion), posisi beli supplier, dan markup harga jual.
              </p>
            </div>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={applyClientExample}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            title="Klik untuk memuat contoh hitungan dari coretan client"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Muat Contoh Client (Box Tepung)
          </button>
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
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Contoh Ukuran:</span>
              <button
                type="button"
                onClick={() => setBoxDimensions({ panjang: 270, lebar: 270, tinggi: 278 })}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors"
              >
                270 x 270 x 278 (Box Tepung)
              </button>
              <button
                type="button"
                onClick={() => setBoxDimensions({ panjang: 400, lebar: 200, tinggi: 130 })}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
              >
                400 x 200 x 130
              </button>
              <button
                type="button"
                onClick={() => setBoxDimensions({ panjang: 300, lebar: 200, tinggi: 200 })}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
              >
                300 x 200 x 200
              </button>
            </div>

            {/* Tipe Flute & Allowance */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Tipe Flute / Ketebalan Karton Gelombang
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
                  Rumus Ukuran Lembaran Sheet ({fluteType}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                    <strong>Lebar Sheet (L):</strong> L + T + {calculation.creasing} ={' '}
                    <span className="font-bold text-brand-700">{calculation.L_sheet} mm</span>
                  </div>
                  <div className="p-1.5 bg-white/80 rounded border border-amber-200">
                    <strong>Panjang Sheet (P):</strong> ((P + L) × 2) + {calculation.kupingan} ={' '}
                    <span className="font-bold text-brand-700">{calculation.P_sheet} mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sumber Index Kertas (Pricelist Maspion Resmi) & Lebar Roll */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  2. Sumber Index Kertas & Lebar Roll Supplier
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMaspionModalOpen(true)}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <TableIcon className="w-3.5 h-3.5" />
                Lihat Tabel Maspion
              </button>
            </div>

            {/* Tab Pilihan Sumber Index (Menggantikan istilah "Input Bebas" agar tidak bingung) */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSourceType('maspion');
                  handleSelectMaspionSubstance(selectedMaspionSubstance);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  sourceType === 'maspion'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Pricelist Maspion (Resmi)
              </button>
              <button
                type="button"
                onClick={() => setSourceType('warehouse')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  sourceType === 'warehouse'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏭 Master Sheet Gudang
              </button>
              <button
                type="button"
                onClick={() => setSourceType('manual')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  sourceType === 'manual'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✏️ Input Manual Index
              </button>
            </div>

            {/* Mode 1: Pricelist Maspion Resmi */}
            {sourceType === 'maspion' && (
              <div className="space-y-3 p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Substance Kertas Maspion:
                  </label>
                  <SearchableSelect
                    options={MASPION_PRICE_LIST.map((m) => ({
                      value: m.substance,
                      label: `${m.no}. ${m.substance} (${fluteType}: Rp ${m[fluteType] ? m[fluteType].toLocaleString('id-ID') : '-'})`,
                    }))}
                    value={selectedMaspionSubstance}
                    onChange={(val) => handleSelectMaspionSubstance(val)}
                    placeholder="Pilih substansi kertas Maspion..."
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200/60">
                  <span className="text-slate-600">
                    Nilai Index Otomatis ({fluteType}):
                  </span>
                  <span className="font-black text-emerald-800 text-sm">
                    Rp {nilaiIndex.toLocaleString('id-ID')} / m² (Include PPN 11%)
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: Dari Master Sheet Gudang */}
            {sourceType === 'warehouse' && (
              <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Bahan Sheet dari Database Gudang:
                </label>
                <SearchableSelect
                  options={masterSheets.map((s) => ({
                    value: s.id,
                    label: `${s.kode_sheet} - ${s.nama_sheet} (${s.flute} ${s.substansi}) - Rp ${Number(s.harga_per_lembar || 0).toLocaleString('id-ID')}/lbr`,
                  }))}
                  value={selectedSheetId}
                  onChange={(val) => handleSelectMasterSheet(val)}
                  placeholder="-- Cari Bahan Baku Sheet Gudang --"
                />
              </div>
            )}

            {/* Mode 3: Input Manual */}
            {sourceType === 'manual' && (
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai Index (Rp / m²) *
                  </label>
                  <input
                    type="number"
                    value={nilaiIndex}
                    onChange={(e) => setNilaiIndex(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm font-bold text-emerald-800 bg-white border border-slate-300 rounded-lg"
                    placeholder="Contoh: 7575"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Substansi Kertas
                  </label>
                  <input
                    type="text"
                    value={substansi}
                    onChange={(e) => setSubstansi(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    placeholder="Contoh: 125K/125M/125K"
                  />
                </div>
              </div>
            )}

            {/* Bagian Perhitungan Lebar Roll Kertas Supplier (Aturan Maspion No. 5) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Hitung Berdasarkan Lebar Kertas Roll Mesin Supplier
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sesuai Aturan Maspion No. 5: Lebar sheet dihitung kelipatan out & lebar roll terdekat
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useRollWidth}
                  onChange={(e) => setUseRollWidth(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
              </div>

              {useRollWidth && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Potongan / Kelipatan (Outs):
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4].map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setRollOuts(o)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            rollOuts === o
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {o} Out
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {calculation.L_sheet} mm × {rollOuts} = {calculation.L_sheet * rollOuts} mm
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Lebar Roll Kertas Supplier (mm):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={rollWidthMm}
                        onChange={(e) => setRollWidthMm(Number(e.target.value) || 0)}
                        className="w-full pl-3 pr-9 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg"
                      />
                      <span className="absolute right-3 top-1 text-xs text-slate-400 font-semibold">mm</span>
                    </div>
                    <span className="text-[10px] text-brand-600 font-semibold mt-1 block">
                      {calculation.rollWidth} mm ÷ {calculation.outs} out = {Math.round(calculation.rollWidth / calculation.outs)} mm/lembar
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: POSISI BELI DI SUPPLIER (+/- %) & MARGIN JUAL KE CUSTOMER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  3. Posisi Beli Supplier (+ / - %) & Margin Jual
                </h2>
              </div>
              <span className="text-xs font-semibold text-amber-700">Revisi Catatan Client</span>
            </div>

            {/* Bagian A: Posisi Harga Beli Supplier (+ / - %) */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-amber-950 block">
                    Posisi Harga Beli di Supplier (+ / - %)
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Sesuai chat client: "Skg beli di supplier posisi +" (contoh: +10% dari pricelist Maspion)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-900 font-bold">
                    {posisiSupplierPersen >= 0 ? '+' : ''}
                  </span>
                  <input
                    type="number"
                    value={posisiSupplierPersen}
                    onChange={(e) => setPosisiSupplierPersen(Number(e.target.value) || 0)}
                    className="w-24 px-3 py-1.5 text-sm font-black text-slate-900 bg-white border border-amber-300 rounded-xl text-right"
                  />
                  <span className="text-xs font-bold text-amber-900">%</span>
                </div>
              </div>

              {/* Preset Tombol Cepat Posisi Supplier */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-amber-800 font-medium">Pilihan Posisi:</span>
                {[0, 5, 7.5, 10, 12.5, 15].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPosisiSupplierPersen(val)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      posisiSupplierPersen === val
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    +{val}% {val === 10 ? '(Sesuai Kertas)' : ''}
                  </button>
                ))}
                {[-3, -5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPosisiSupplierPersen(val)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      posisiSupplierPersen === val
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white border-rose-300 text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    {val}% (Diskon)
                  </button>
                ))}
              </div>

              {/* Rincian Modal Sheet Berdasarkan Coretan Client */}
              <div className="p-2.5 bg-white/90 border border-amber-300 rounded-lg text-xs grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Harga Dasar Pricelist:</span>
                  <span className="font-bold text-slate-800">Rp {calculation.hargaDasarPricelist.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Posisi (+{calculation.posSupplier}%):</span>
                  <span className="font-bold text-amber-700">+{calculation.selisihPosisiSupplier.toLocaleString('id-ID')}</span>
                </div>
                <div className="bg-amber-100/70 p-1 rounded border border-amber-300">
                  <span className="text-[10px] text-amber-900 block font-sans font-bold">Modal Beli Supplier:</span>
                  <span className="font-black text-amber-950 text-sm">Rp {calculation.modalBeliSheet.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Bagian B: Penyesuaian Harga Jual ke Customer (Markup / Diskon) */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Atur Keuntungan Jual ke Customer (Margin / Diskon):
              </label>

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

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Besaran {adjustType.startsWith('plus') ? 'Margin Keuntungan:' : 'Potongan Diskon:'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustValue}
                    onChange={(e) => setAdjustValue(Number(e.target.value) || 0)}
                    className="w-24 px-3 py-1.5 text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-lg text-right"
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {adjustType.endsWith('percent') ? '%' : 'Rp/pcs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Biaya Produksi Tambahan (Opsional) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Biaya Tambahan Cetak / Finishing (Opsional / Per Pcs):
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
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
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 rounded-2xl text-white p-6 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge Status */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Kalkulasi Live Real-time
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

            {/* Breakdown Rincian Hitungan Sesuai Kertas Client */}
            <div className="space-y-3 text-xs">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Rincian Lembaran Sheet & Modal Beli:
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[11px] text-slate-400">Lebar Sheet (L)</div>
                  <div className="text-sm font-black text-white mt-0.5">{calculation.L_sheet} mm</div>
                  <div className="text-[10px] text-slate-400 font-mono">L + T + {calculation.creasing}</div>
                </div>
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[11px] text-slate-400">Panjang Sheet (P)</div>
                  <div className="text-sm font-black text-white mt-0.5">{calculation.P_sheet} mm</div>
                  <div className="text-[10px] text-slate-400 font-mono">((P+L)×2) + {calculation.kupingan}</div>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ukuran Bentangan Sheet:</span>
                  <span className="font-bold text-white">{calculation.L_sheet} × {calculation.P_sheet} mm</span>
                </div>
                {useRollWidth && (
                  <div className="flex justify-between text-amber-300">
                    <span>Roll Kertas Maspion:</span>
                    <span className="font-semibold">{calculation.rollWidth} mm ({calculation.outs} Out)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Luas Tagihan Supplier:</span>
                  <span className="font-semibold text-slate-200">{calculation.luasTagihanM2} m²/pcs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Index Dasar Pricelist:</span>
                  <span className="text-slate-200">Rp {nilaiIndex.toLocaleString('id-ID')} / m²</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Harga Dasar Sheet:</span>
                  <span>Rp {calculation.hargaDasarPricelist.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-amber-300 font-semibold">
                  <span>Posisi Beli Supplier (+{calculation.posSupplier}%):</span>
                  <span>+{calculation.selisihPosisiSupplier.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                  <span>Modal Beli Sheet ke Supplier:</span>
                  <span>Rp {calculation.modalBeliSheet.toLocaleString('id-ID')}</span>
                </div>
                {calculation.biayaCetakVal > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Biaya Cetak Flexo:</span>
                    <span>+Rp {calculation.biayaCetakVal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {calculation.biayaFinishingVal > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Biaya Finishing:</span>
                    <span>+Rp {calculation.biayaFinishingVal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-white">
                  <span>Total HPP Modal Dasar:</span>
                  <span>Rp {calculation.hppDasarTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Simulasi Quantity Order */}
            <div className="pt-2 border-t border-white/10 space-y-3">
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

      {/* Modal Tabel Lengkap Pricelist Maspion (28 Substance) */}
      <Modal
        isOpen={isMaspionModalOpen}
        onClose={() => setIsMaspionModalOpen(false)}
        title="Tabel Resmi Pricelist Sheet PT. Qingda Maspion Paper Products"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold">Ketentuan Pricelist Maspion:</p>
            <p>1. Harga pada tabel sudah termasuk PPN 11% (Franco Gudang Pembeli).</p>
            <p>2. Harga dihitung berdasarkan lebar kertas (kelipatan out & lebar roll terdekat).</p>
            <p>3. Klik pada baris substansi yang diinginkan untuk langsung memilihnya ke kalkulator.</p>
          </div>

          <div className="overflow-x-auto max-h-[60vh] border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 sticky top-0 border-b border-slate-300 text-slate-800 font-bold">
                <tr>
                  <th className="p-2.5 text-center w-10 border-r border-slate-200">No</th>
                  <th className="p-2.5 border-r border-slate-200">Substance (Lapisan Kertas)</th>
                  <th className="p-2.5 text-right border-r border-slate-200">E/F (Rp/m²)</th>
                  <th className="p-2.5 text-right border-r border-slate-200">B/F (Rp/m²)</th>
                  <th className="p-2.5 text-right border-r border-slate-200">C/F (Rp/m²)</th>
                  <th className="p-2.5 text-right">BC/F (Rp/m²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MASPION_PRICE_LIST.map((m) => {
                  const isSelected = selectedMaspionSubstance === m.substance;
                  return (
                    <tr
                      key={m.no}
                      onClick={() => {
                        handleSelectMaspionSubstance(m.substance);
                        setIsMaspionModalOpen(false);
                        toast.success(`Substance "${m.substance}" dipilih dari tabel Maspion`);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-50 font-bold text-brand-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <td className="p-2 text-center border-r border-slate-200">{m.no}</td>
                      <td className="p-2 font-mono border-r border-slate-200">{m.substance}</td>
                      <td className="p-2 text-right border-r border-slate-200 font-mono">Rp {m['E/F'].toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right border-r border-slate-200 font-mono">Rp {m['B/F'].toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right border-r border-slate-200 font-mono">Rp {m['C/F'].toLocaleString('id-ID')}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">Rp {m['B/C'].toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsMaspionModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Tutup Tabel
            </button>
          </div>
        </div>
      </Modal>

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
                {calculation.L_sheet} x {calculation.P_sheet} mm ({fluteType})
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
