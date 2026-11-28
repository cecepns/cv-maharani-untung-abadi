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
  X,
  Split,
  FileCheck2,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import SearchableSelect from '@/components/common/SearchableSelect';
import PrintPenawaranHarga from '@/components/print/PrintPenawaranHarga';

// Spesifikasi standar industri & rumus toleransi karton gelombang CV. Maharani
// Sesuai Catatan Resmi Client:
// - EF (Single Wall): P = (P+L)*2 + 39, L = (L+T) + 9 (Standar) / (L*2)+T+9 (Tutup Full)
// - BF (Single Wall): P = (P+L)*2 + 43, L = (L+T) + 12 (Standar) / (L*2)+T+12 (Tutup Full)
// - CF (Single Wall): P = (P+L)*2 + 47, L = (L+T) + 13 (Standar) / (L*2)+T+13 (Tutup Full)
// - BCF (Double Wall B/C): P = (P+L)*2 + 63, L = (L+T) + 24 (Standar) / (L*2)+T+24 (Tutup Full)
// - Double Joint (2 lembar): EF +79, BF +83, CF +87, BCF +103
export const FLUTE_SPECS = {
  'B/F': {
    kode: 'B/F',
    nama: 'B-Flute Single Wall (~3mm)',
    panjangExtra: 43,
    lebarExtra: 12,
    doubleJointExtra: 83,
    kupingan: 31,
    creasing: 12,
    tabCm: 3.1,
    flapExtra: 3,
    defaultGsm: 420,
    kategori: 'Corrugated',
    deskripsi: 'Standar packaging umum & ekspedisi (Daya lipat baik)'
  },
  'C/F': {
    kode: 'C/F',
    nama: 'C-Flute Single Wall (~4mm)',
    panjangExtra: 47,
    lebarExtra: 13,
    doubleJointExtra: 87,
    kupingan: 31,
    creasing: 13,
    tabCm: 3.1,
    flapExtra: 3,
    defaultGsm: 435,
    kategori: 'Corrugated',
    deskripsi: 'Daya tumpuk (stacking) lebih kuat untuk barang berat'
  },
  'B/C': {
    kode: 'B/C',
    nama: 'B/C Double Wall 2 Gelombang (~7mm)',
    panjangExtra: 63,
    lebarExtra: 24,
    doubleJointExtra: 103,
    kupingan: 39,
    creasing: 24,
    tabCm: 3.9,
    flapExtra: 6,
    defaultGsm: 680,
    kategori: 'Corrugated',
    deskripsi: 'Dus tebal industri berat, sparepart mesin & buah ekspor'
  },
  'E/F': {
    kode: 'E/F',
    nama: 'E-Flute Micro Single Wall (~1.5mm)',
    panjangExtra: 39,
    lebarExtra: 9,
    doubleJointExtra: 79,
    kupingan: 31,
    creasing: 9,
    tabCm: 3.1,
    flapExtra: 3,
    defaultGsm: 410,
    kategori: 'Corrugated',
    deskripsi: 'Kotak pizza, kosmetik, hampers & dus die-cut halus'
  },
};

// Data Index Duplex (Gambar 5 No. 2)
export const DUPLEX_INDEX_TABLE = [
  { gsm: 250, index: 2370, label: 'Duplex 250 gr (Index 2370)' },
  { gsm: 310, index: 2173, label: 'Duplex 310 gr (Index 2173)' },
  { gsm: 350, index: 2004, label: 'Duplex 350 gr (Index 2004)' },
  { gsm: 400, index: 2050, label: 'Duplex 400 gr (Index 2050)' },
  { gsm: 450, index: 2079, label: 'Duplex 450 gr (Index 2079)' },
];

// Data Pricelist Ivory Resmi (Gambar 6)
export const IVORY_PRICE_TABLE = [
  { brand: 'VA', gsmMin: 210, gsmMax: 350, gsmLabel: '210 - 350 GSM', hargaKg: 13800 },
  { brand: 'IKKVC', gsmMin: 190, gsmMax: 190, gsmLabel: '190 GSM', hargaKg: 13500 },
  { brand: 'IKKVC', gsmMin: 210, gsmMax: 210, gsmLabel: '210 GSM', hargaKg: 13000 },
  { brand: 'IKKVC', gsmMin: 230, gsmMax: 350, gsmLabel: '230 - 350 GSM', hargaKg: 12700 },
  { brand: 'IKKVB', gsmMin: 270, gsmMax: 300, gsmLabel: '270 & 300 GSM', hargaKg: 12200 },
  { brand: 'BOHUI', gsmMin: 190, gsmMax: 190, gsmLabel: '190 GSM', hargaKg: 13700 },
  { brand: 'BOHUI', gsmMin: 210, gsmMax: 210, gsmLabel: '210 GSM', hargaKg: 13200 },
  { brand: 'BOHUI', gsmMin: 230, gsmMax: 400, gsmLabel: '230 - 400 GSM', hargaKg: 12900 },
  { brand: 'IVORY PE', gsmMin: 230, gsmMax: 230, gsmLabel: '230 GSM (+PE Coating)', hargaKg: 16950 }, // Base + 4250
  { brand: 'IVORY PE', gsmMin: 250, gsmMax: 350, gsmLabel: '250 - 350 GSM (+PE Coating)', hargaKg: 16700 }, // Base + 4000
];

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

  // Mode Kertas: 'corrugated' (Dus Box Gelombang), 'duplex' (Karton Duplex), 'ivory' (Karton Ivory)
  const [paperMode, setPaperMode] = useState('corrugated');

  // ==========================================
  // STATE 1: CORRUGATED BOX (MASPION / GELOMBANG)
  // ==========================================
  const [boxDimensions, setBoxDimensions] = useState({
    panjang: 270,
    lebar: 270,
    tinggi: 278,
  });

  // Sambungan: 'single' (1 Sambungan) vs 'double' (2 Sambungan Kuping)
  const [jointType, setJointType] = useState('single'); // 'single' | 'double'

  // Model Tutup Box: 'standar' (A1 / RSC Normal) vs 'full' (Tutup Full / FOL) Sesuai Catatan Resmi Client
  const [modelTutup, setModelTutup] = useState('standar'); // 'standar' | 'full'

  const [fluteType, setFluteType] = useState('B/C'); // B/C Double Wall
  const [useCustomAllowance, setUseCustomAllowance] = useState(false);
  const [customAllowance, setCustomAllowance] = useState({ kupingan: 63, creasing: 24 });

  const [sourceType, setSourceType] = useState('maspion'); // 'maspion' | 'warehouse' | 'manual'
  const [selectedMaspionSubstance, setSelectedMaspionSubstance] = useState('125K/125M/125K');
  const [isMaspionModalOpen, setIsMaspionModalOpen] = useState(false);

  const [metodeIndex, setMetodeIndex] = useState('m2');
  const [nilaiIndex, setNilaiIndex] = useState(7575);
  const [substansi, setSubstansi] = useState('125K/125M/125K');
  const [gsm, setGsm] = useState(680);
  const [masterSheets, setMasterSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');

  const [useRollWidth, setUseRollWidth] = useState(true);
  const [rollOuts, setRollOuts] = useState(3);
  const [rollWidthMm, setRollWidthMm] = useState(1750);

  const [posisiSupplierPersen, setPosisiSupplierPersen] = useState(10); // +10%

  // ==========================================
  // STATE 2: DUPLEX (GAMBAR 5 NO. 2)
  // Rumus: (L x P x gramatur) / 20.000 * Index (+ margin %)
  // ==========================================
  const [duplexDimensions, setDuplexDimensions] = useState({
    lebarCm: 79,
    panjangCm: 109,
    unit: 'cm', // 'cm' or 'mm'
  });
  const [duplexGsm, setDuplexGsm] = useState(310);
  const [duplexIndex, setDuplexIndex] = useState(2173);
  const [duplexOutPerSheet, setDuplexOutPerSheet] = useState(1); // 1 plano jadi berapa box

  // ==========================================
  // STATE 3: IVORY (GAMBAR 5 NO. 3 & GAMBAR 6)
  // Rumus: (L x P x gramatur) / 20.000 * Harga 1 kg (+ potong roll/sheet)
  // ==========================================
  const [ivoryDimensions, setIvoryDimensions] = useState({
    lebarCm: 79,
    panjangCm: 109,
  });
  const [ivoryBrand, setIvoryBrand] = useState('VA');
  const [ivoryGsm, setIvoryGsm] = useState(250);
  const [ivoryHargaKg, setIvoryHargaKg] = useState(13800);
  const [ivoryPotongOption, setIvoryPotongOption] = useState('none'); // 'none' | 'potong_sheet' (+250) | 'in_roll' (-350)
  const [ivoryOutPerSheet, setIvoryOutPerSheet] = useState(1);

  // Penyesuaian Margin Jual ke Customer (Margin / Diskon)
  const [adjustType, setAdjustType] = useState('plus_percent'); // 'plus_percent' | 'plus_nominal' | 'minus_percent' | 'minus_nominal'
  const [adjustValue, setAdjustValue] = useState(20); // 20% margin

  // Biaya Tambahan Cetak & Finishing
  const [biayaCetak, setBiayaCetak] = useState(0);
  const [biayaFinishing, setBiayaFinishing] = useState(0);

  // Qty Simulasi Order (Free inputable / custom number) - REVISI 8
  const [simulasiQty, setSimulasiQty] = useState(1000);

  // Modal Print Penawaran & Save Product
  const [printData, setPrintData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveFormData, setSaveFormData] = useState({
    nama_barang: '',
    jenis_sambungan: 'Stitching',
  });

  // Fetch Master Sheet & Customer
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sheetRes, custRes] = await Promise.all([
          request.get(API_ENDPOINTS.PURCHASING.BAHAN_SHEET, { limit: 100 }),
          request.get(API_ENDPOINTS.MARKETING.CUSTOMERS, { limit: 100 }),
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

  // Sync saat ganti tipe flute pada mode Corrugated
  useEffect(() => {
    if (paperMode !== 'corrugated') return;
    const spec = FLUTE_SPECS[fluteType] || FLUTE_SPECS['B/C'];
    if (!useCustomAllowance) {
      // Sesuai Catatan Resmi Client:
      // Standar Single: kupingan = spec.panjangExtra, creasing = spec.lebarExtra
      // Double Joint: kupingan = spec.doubleJointExtra
      const kupingVal = jointType === 'double' ? spec.doubleJointExtra : spec.panjangExtra;
      const creaseVal = spec.lebarExtra;
      setCustomAllowance({ kupingan: kupingVal, creasing: creaseVal });
    }
    setGsm(spec.defaultGsm);

    if (sourceType === 'maspion') {
      const found = MASPION_PRICE_LIST.find((m) => m.substance === selectedMaspionSubstance);
      if (found && found[fluteType]) {
        setNilaiIndex(found[fluteType]);
      }
    }
  }, [fluteType, jointType, useCustomAllowance, sourceType, selectedMaspionSubstance, paperMode]);

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

  // Handle Duplex Gramatur Switch
  const handleSelectDuplexGsm = (gsmVal) => {
    setDuplexGsm(gsmVal);
    const found = DUPLEX_INDEX_TABLE.find((d) => d.gsm === Number(gsmVal));
    if (found) {
      setDuplexIndex(found.index);
    }
  };

  // Handle Ivory Preset Switch
  const handleSelectIvoryPreset = (brandName, gsmVal, harga) => {
    setIvoryBrand(brandName);
    setIvoryGsm(gsmVal);
    setIvoryHargaKg(harga);
  };

  // ========================================================
  // RUMUS PERHITUNGAN PRESISI LENGKAP (CORRUGATED, DUPLEX, IVORY, DOUBLE JOINT)
  // ========================================================
  const calculation = useMemo(() => {
    const qty = Math.max(1, Number(simulasiQty) || 1000);
    const biayaCetakVal = Number(biayaCetak) || 0;
    const biayaFinishingVal = Number(biayaFinishing) || 0;
    const posSupplier = Number(posisiSupplierPersen) || 0;
    const adjVal = Number(adjustValue) || 0;

    // ----------------------------------------------------
    // MODE 1: CORRUGATED BOX (MASPION / GELOMBANG)
    // ----------------------------------------------------
    if (paperMode === 'corrugated') {
      const P_box = Number(boxDimensions.panjang) || 0;
      const L_box = Number(boxDimensions.lebar) || 0;
      const T_box = Number(boxDimensions.tinggi) || 0;

      const spec = FLUTE_SPECS[fluteType] || FLUTE_SPECS['B/C'];
      const isDoubleWall = fluteType === 'B/C';
      
      const pExtra = useCustomAllowance
        ? (Number(customAllowance.kupingan) || spec.panjangExtra)
        : spec.panjangExtra;
      const lExtra = useCustomAllowance
        ? (Number(customAllowance.creasing) || spec.lebarExtra)
        : spec.lebarExtra;
      const djExtra = spec.doubleJointExtra;

      // Estimasi Size Luar (P+3/6, L+3/6, T+6/12)
      const pLuar = isDoubleWall ? P_box + 6 : P_box + 3;
      const lLuar = isDoubleWall ? L_box + 6 : L_box + 3;
      const tLuar = isDoubleWall ? T_box + 12 : T_box + 6;
      const flapTutup = modelTutup === 'full' 
        ? L_box 
        : (isDoubleWall ? Math.round((L_box / 2) + 6) : Math.round((L_box / 2) + 3));

      const isDouble = jointType === 'double';

      // ========================================================
      // RUMUS RESMI CATATAN CLIENT:
      // 1. PANJANG SHEET:
      //    - Standar Single Joint: (P + L) * 2 + panjangExtra
      //      (EF: +39, BF: +43, CF: +47, BCF: +63)
      //    - Double Joint (Stitch 2 sisi karena sheet terlalu panjang):
      //      ((P + L) * 2 + doubleJointExtra) / 2 (2 Lembar/Box)
      //      (EF: +79, BF: +83, CF: +87, BCF: +103)
      // 2. LEBAR SHEET (L SHEET):
      //    - Standar: (L + T) + lebarExtra
      //      (EF: +9, BF: +12, CF: +13, BCF: +24)
      //    - Tutup Full (FOL): (L * 2) + T + lebarExtra
      //      (EF: +9, BF: +12, CF: +13, BCF: +24)
      // ========================================================
      const rawPanjangBentangan = isDouble
        ? (P_box + L_box) * 2 + djExtra
        : (P_box + L_box) * 2 + pExtra;
      const P_sheet = isDouble ? Math.round(rawPanjangBentangan / 2) : rawPanjangBentangan;

      const L_sheet = modelTutup === 'full'
        ? (L_box * 2) + T_box + lExtra
        : (L_box + T_box) + lExtra;
      const sheetsPerBox = isDouble ? 2 : 1;

      // Luas 1 lembar sheet (m2)
      const p_meter = P_sheet / 1000;
      const l_meter = L_sheet / 1000;
      const luasSheetNetM2 = p_meter * l_meter;

      // Luas tagihan roll Maspion
      const outs = Number(rollOuts) || 1;
      const rollWidth = Number(rollWidthMm) || L_sheet * outs;
      const totalLebarOuts = L_sheet * outs;
      const luasTagihanPerSheetM2 = useRollWidth
        ? ((rollWidth / 1000) * p_meter) / outs
        : luasSheetNetM2;

      // Luas tagihan total per 1 box (dikali 2 jika double joint)
      const luasTagihanM2 = luasTagihanPerSheetM2 * sheetsPerBox;

      // Harga Dasar Sheet dari Pricelist Supplier
      let hargaDasarPricelist = 0;
      const idx = Number(nilaiIndex) || 0;
      if (metodeIndex === 'm2') {
        hargaDasarPricelist = Math.round(luasTagihanM2 * idx);
      } else {
        const berat_kg = luasTagihanM2 * ((Number(gsm) || 680) / 1000);
        hargaDasarPricelist = Math.round(berat_kg * idx);
      }

      // Posisi Harga Beli Supplier (+ / - %)
      const selisihPosisiSupplier = Math.round(hargaDasarPricelist * (posSupplier / 100));
      const modalBeliSheet = hargaDasarPricelist + selisihPosisiSupplier;

      // Total HPP Dasar Dus (Sheet + Cetak + Finishing)
      const hppDasarTotal = modalBeliSheet + biayaCetakVal + biayaFinishingVal;

      // Penyesuaian Margin / Diskon untuk Customer
      let selisihAdjust = 0;
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

      const totalOmset = hargaJualPerPcs * qty;
      const totalModal = hppDasarTotal * qty;
      const totalProfit = profitPerPcs * qty;

      return {
        mode: 'corrugated',
        P_box,
        L_box,
        T_box,
        pLuar,
        lLuar,
        tLuar,
        flapTutup,
        tabMm: spec.kupingan,
        tabCm: spec.tabCm,
        jointType,
        isDouble,
        modelTutup,
        sheetsPerBox,
        kupingan: pExtra,
        creasing: lExtra,
        panjangExtra: pExtra,
        lebarExtra: lExtra,
        doubleJointExtra: djExtra,
        P_sheet,
        L_sheet,
        outs,
        rollWidth,
        totalLebarOuts,
        luasNetM2: Math.round(luasSheetNetM2 * sheetsPerBox * 10000) / 10000,
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
        totalProfit,
      };
    }

    // ----------------------------------------------------
    // MODE 2: DUPLEX (GAMBAR 5 NO. 2)
    // Rumus: (L x P x gramatur) / 20.000 * Index
    // ----------------------------------------------------
    if (paperMode === 'duplex') {
      const L_cm = Number(duplexDimensions.lebarCm) || 0;
      const P_cm = Number(duplexDimensions.panjangCm) || 0;
      const gsmVal = Number(duplexGsm) || 310;
      const idx = Number(duplexIndex) || 2173;
      const outs = Math.max(1, Number(duplexOutPerSheet) || 1);

      // (L x P x gramatur) / 20.000 = Berat 1 Rim (500 Lembar Plano) dalam Kg
      const beratRimKg = (L_cm * P_cm * gsmVal) / 20000;
      // Harga 1 Rim (500 Lembar Plano) = Berat 1 Rim * Index
      const modalPerRim = Math.round(beratRimKg * idx);
      // Harga 1 Lembar Plano (1 Rim = 500 Lembar)
      const modalPerLembar = Math.round(modalPerRim / 500);
      // Modal Bahan per Box (1 Lembar menghasilkan N Box / Outs)
      const modalPerPcs = Math.max(1, Math.round(modalPerLembar / outs));

      const hppDasarTotal = modalPerPcs + biayaCetakVal + biayaFinishingVal;

      let selisihAdjust = 0;
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

      const totalOmset = hargaJualPerPcs * qty;
      const totalModal = hppDasarTotal * qty;
      const totalProfit = profitPerPcs * qty;

      return {
        mode: 'duplex',
        L_cm,
        P_cm,
        gsmVal,
        idx,
        outs,
        beratRimKg: Math.round(beratRimKg * 100) / 100,
        koefisien: Math.round(beratRimKg * 100) / 100,
        modalPerRim,
        modalPerLembar,
        modalPlano: modalPerLembar,
        modalPerPcs,
        modalBeliSheet: modalPerPcs,
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
        totalProfit,
      };
    }

    // ----------------------------------------------------
    // MODE 3: IVORY (GAMBAR 5 NO. 3 & GAMBAR 6)
    // Rumus: (L x P x gramatur) / 20.000 * Harga 1 kg (+ opsi potong)
    // ----------------------------------------------------
    if (paperMode === 'ivory') {
      const L_cm = Number(ivoryDimensions.lebarCm) || 0;
      const P_cm = Number(ivoryDimensions.panjangCm) || 0;
      const gsmVal = Number(ivoryGsm) || 250;
      let effectiveHargaKg = Number(ivoryHargaKg) || 13800;

      // Add-on potong roll to sheet (+250) atau in roll (-350)
      if (ivoryPotongOption === 'potong_sheet') {
        effectiveHargaKg += 250;
      } else if (ivoryPotongOption === 'in_roll') {
        effectiveHargaKg -= 350;
      }

      const outs = Math.max(1, Number(ivoryOutPerSheet) || 1);

      // (L x P x gramatur) / 20.000 = Berat 1 Rim (500 Lembar Plano) dalam Kg
      const beratRimKg = (L_cm * P_cm * gsmVal) / 20000;
      // Harga 1 Rim (500 Lembar Plano) = Berat 1 Rim * Harga 1 kg
      const modalPerRim = Math.round(beratRimKg * effectiveHargaKg);
      // Harga 1 Lembar Plano (1 Rim = 500 Lembar)
      const modalPerLembar = Math.round(modalPerRim / 500);
      // Modal Bahan per Box (1 Lembar menghasilkan N Box / Outs)
      const modalPerPcs = Math.max(1, Math.round(modalPerLembar / outs));

      const hppDasarTotal = modalPerPcs + biayaCetakVal + biayaFinishingVal;

      let selisihAdjust = 0;
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

      const totalOmset = hargaJualPerPcs * qty;
      const totalModal = hppDasarTotal * qty;
      const totalProfit = profitPerPcs * qty;

      return {
        mode: 'ivory',
        L_cm,
        P_cm,
        gsmVal,
        effectiveHargaKg,
        outs,
        beratRimKg: Math.round(beratRimKg * 100) / 100,
        koefisien: Math.round(beratRimKg * 100) / 100,
        modalPerRim,
        modalPerLembar,
        modalPlano: modalPerLembar,
        modalPerPcs,
        modalBeliSheet: modalPerPcs,
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
        totalProfit,
      };
    }

    return {};
  }, [
    paperMode,
    boxDimensions,
    jointType,
    modelTutup,
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
    duplexDimensions,
    duplexGsm,
    duplexIndex,
    duplexOutPerSheet,
    ivoryDimensions,
    ivoryBrand,
    ivoryGsm,
    ivoryHargaKg,
    ivoryPotongOption,
    ivoryOutPerSheet,
    biayaCetak,
    biayaFinishing,
    adjustType,
    adjustValue,
    simulasiQty,
  ]);

  // Saat ukuran sheet berubah dan menggunakan roll width pada mode Corrugated
  useEffect(() => {
    if (paperMode === 'corrugated' && useRollWidth && calculation.L_sheet) {
      const totalOutsWidth = calculation.L_sheet * rollOuts;
      const autoRoll = Math.max(1000, Math.ceil(totalOutsWidth / 50) * 50);
      setRollWidthMm(autoRoll);
    }
  }, [calculation.L_sheet, rollOuts, useRollWidth, paperMode]);

  // Handler Preset 1: Contoh Resmi Client BF Single Wall (650x190x395 -> Sheet 597x1723 mm)
  const applyClientExampleBF = () => {
    setPaperMode('corrugated');
    setBoxDimensions({ panjang: 650, lebar: 190, tinggi: 395 });
    setJointType('single');
    setModelTutup('standar');
    setFluteType('B/F');
    setSourceType('maspion');
    handleSelectMaspionSubstance('125K/125M/125M');
    setUseRollWidth(false);
    setPosisiSupplierPersen(10);
    setBiayaCetak(0);
    setBiayaFinishing(0);
    toast.success('Contoh Client "650x190x395 BF Single Wall" dimuat: Sheet 597 x 1723 mm!');
  };

  // Handler Preset 2: Contoh Resmi Client BCF Double Wall (650x190x395 -> Sheet 609x1743 mm)
  const applyClientExampleBCF = () => {
    setPaperMode('corrugated');
    setBoxDimensions({ panjang: 650, lebar: 190, tinggi: 395 });
    setJointType('single');
    setModelTutup('standar');
    setFluteType('B/C');
    setSourceType('maspion');
    handleSelectMaspionSubstance('125K/125M/125M');
    setUseRollWidth(false);
    setPosisiSupplierPersen(10);
    setBiayaCetak(0);
    setBiayaFinishing(0);
    toast.success('Contoh Client "650x190x395 BCF Double Wall" dimuat: Sheet 609 x 1743 mm!');
  };

  // Handler Preset 3: Contoh Resmi Client Tutup Full BF (650x190x395 -> Sheet 787x1723 mm)
  const applyClientExampleTutupFull = () => {
    setPaperMode('corrugated');
    setBoxDimensions({ panjang: 650, lebar: 190, tinggi: 395 });
    setJointType('single');
    setModelTutup('full');
    setFluteType('B/F');
    setSourceType('maspion');
    handleSelectMaspionSubstance('125K/125M/125M');
    setUseRollWidth(false);
    setPosisiSupplierPersen(10);
    setBiayaCetak(0);
    setBiayaFinishing(0);
    toast.success('Contoh Client "650x190x395 BF Tutup Full" dimuat: Sheet 787 x 1723 mm!');
  };

  // Handler Preset 4: Double Joint (Stitch 2 sisi)
  const applyDoubleJointExample = () => {
    setPaperMode('corrugated');
    setBoxDimensions({ panjang: 650, lebar: 190, tinggi: 395 });
    setJointType('double');
    setModelTutup('standar');
    setFluteType('B/F');
    setSourceType('maspion');
    handleSelectMaspionSubstance('125K/125M/125M');
    setUseRollWidth(false);
    toast.success('Contoh Double Joint "650x190x395 BF (2 Sambungan)" dimuat!');
  };

  // Salin Rincian ke WhatsApp
  const handleCopyWhatsApp = () => {
    let specText = '';
    if (paperMode === 'corrugated') {
      specText = `📦 *Spesifikasi Karton Box:*
- Model: Karton Box ${calculation.modelTutup === 'full' ? 'Tutup Full (FOL)' : 'Standar A1/RSC'} (${calculation.isDouble ? 'Double Joint 2 Sambungan' : 'Single Joint 1 Sambungan'})
- Ukuran Box: ${calculation.P_box} x ${calculation.L_box} x ${calculation.T_box} mm
- Tipe Flute: ${fluteType} (${FLUTE_SPECS[fluteType]?.nama || ''})
- Substansi: ${substansi}
- Target Ukuran Sheet: ${calculation.L_sheet} x ${calculation.P_sheet} mm (Lebar x Panjang, ${calculation.sheetsPerBox} lembar/dus)
${useRollWidth ? `- Lebar Roll Supplier: ${calculation.rollWidth} mm (${calculation.outs} Out)` : ''}`;
    } else if (paperMode === 'duplex') {
      specText = `📦 *Spesifikasi Kemasan Duplex:*
- Material: Karton Duplex Coated
- Dimensi Plano: ${calculation.L_cm} x ${calculation.P_cm} cm
- Gramatur: ${calculation.gsmVal} GSM (Index: ${calculation.idx})
- Out per Plano: ${calculation.outs} box/plano`;
    } else {
      specText = `📦 *Spesifikasi Kemasan Ivory Food Grade:*
- Material: Karton Ivory Solid Food Grade (${ivoryBrand})
- Dimensi Plano: ${calculation.L_cm} x ${calculation.P_cm} cm
- Gramatur: ${calculation.gsmVal} GSM (Harga Dasar: Rp ${calculation.effectiveHargaKg.toLocaleString('id-ID')}/kg)
- Out per Plano: ${calculation.outs} box/plano`;
    }

    const text = `*PENAWARAN ESTIMASI HARGA KEMASAN*
*CV. MAHARANI UNTUNG ABADI*
-----------------------------------------
${specText}

💰 *Estimasi Harga:*
- Modal Bahan: Rp ${calculation.modalBeliSheet.toLocaleString('id-ID')} / pcs
- *Harga Jual Penawaran: Rp ${calculation.hargaJualPerPcs.toLocaleString('id-ID')} / pcs*
- Simulasi Qty: ${calculation.qty.toLocaleString('id-ID')} pcs
- Total Estimasi: Rp ${calculation.totalOmset.toLocaleString('id-ID')}

Catatan:
- Harga belum termasuk PPN 11% (jika ada faktur)
- Estimasi berlaku 14 hari kerja
- Hubungi kami untuk penyesuaian cetak logo & sample kemasan.
-----------------------------------------
CV. Maharani Untung Abadi • Packaging & Offset Printing`;

    navigator.clipboard.writeText(text);
    toast.success('Rincian penawaran disalin! Siap dipaste ke WhatsApp');
  };

  // Buka Modal Cetak Penawaran
  const handleOpenPrintModal = () => {
    let namaBarang = '';
    let p_sheet = 0;
    let l_sheet = 0;
    let luas_m2 = 0;
    let sub = '';

    if (paperMode === 'corrugated') {
      namaBarang = `Karton Box ${calculation.P_box}x${calculation.L_box}x${calculation.T_box} mm (${calculation.isDouble ? 'Double Joint' : 'Single Joint'})`;
      p_sheet = calculation.P_sheet;
      l_sheet = calculation.L_sheet;
      luas_m2 = calculation.luasTagihanM2;
      sub = substansi;
    } else if (paperMode === 'duplex') {
      namaBarang = `Dus Duplex ${calculation.gsmVal} GSM (${calculation.L_cm}x${calculation.P_cm} cm)`;
      p_sheet = calculation.P_cm * 10;
      l_sheet = calculation.L_cm * 10;
      luas_m2 = (calculation.L_cm * calculation.P_cm) / 10000;
      sub = `Duplex ${calculation.gsmVal} GSM`;
    } else {
      namaBarang = `Kemasan Ivory ${ivoryBrand} ${calculation.gsmVal} GSM (${calculation.L_cm}x${calculation.P_cm} cm)`;
      p_sheet = calculation.P_cm * 10;
      l_sheet = calculation.L_cm * 10;
      luas_m2 = (calculation.L_cm * calculation.P_cm) / 10000;
      sub = `Ivory ${ivoryBrand} ${calculation.gsmVal} GSM`;
    }

    setPrintData({
      nama_barang: namaBarang,
      panjang: calculation.P_box || calculation.P_cm * 10,
      lebar: calculation.L_box || calculation.L_cm * 10,
      tinggi: calculation.T_box || 0,
      tipe_flute: paperMode === 'corrugated' ? fluteType : paperMode === 'duplex' ? 'Duplex' : 'Ivory',
      nama_flute: paperMode === 'corrugated' ? FLUTE_SPECS[fluteType]?.nama : paperMode,
      substansi: sub,
      P_sheet: p_sheet,
      L_sheet: l_sheet,
      luas_m2: luas_m2,
      jenis_sambungan:
        paperMode === 'corrugated'
          ? calculation.isDouble
            ? 'Double Joint (2 Jahit)'
            : 'Single Joint (1 Jahit)'
          : 'Glue / Kunci Lipat',
      hargaJualPerPcs: calculation.hargaJualPerPcs,
      qty: calculation.qty,
      totalOmset: calculation.totalOmset,
      customer_nama: 'Pimpinan / Purchasing Dept.',
      customer_alamat: 'Di Tempat',
      nama_sales: 'Marketing Lead',
    });
  };

  // Simpan Sebagai Produk Jadi di Master Box
  const handleOpenSaveModal = () => {
    let defaultNama = '';
    if (paperMode === 'corrugated') {
      defaultNama = `Karton Box ${calculation.P_box}x${calculation.L_box}x${calculation.T_box} ${fluteType}`;
    } else if (paperMode === 'duplex') {
      defaultNama = `Dus Duplex ${calculation.gsmVal} GSM (${calculation.L_cm}x${calculation.P_cm} cm)`;
    } else {
      defaultNama = `Dus Ivory ${ivoryBrand} ${calculation.gsmVal} GSM (${calculation.L_cm}x${calculation.P_cm} cm)`;
    }

    setSaveFormData({
      nama_barang: defaultNama,
      jenis_sambungan:
        paperMode === 'corrugated'
          ? calculation.isDouble
            ? 'Stitching (Double Joint)'
            : 'Stitching'
          : 'Glue',
    });
    setIsSaveModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const kode = `BOX-${Date.now().toString().slice(-6)}`;
      const payload = {
        kode_barang: kode,
        nama_barang: saveFormData.nama_barang,
        jenis_barang: 'Box',
        tipe_flute: paperMode === 'corrugated' ? fluteType : paperMode === 'duplex' ? 'Duplex' : 'Ivory',
        substansi: paperMode === 'corrugated' ? substansi : `${paperMode} ${calculation.gsmVal} GSM`,
        panjang_mm: calculation.P_box || calculation.P_cm * 10,
        lebar_mm: calculation.L_box || calculation.L_cm * 10,
        tinggi_mm: calculation.T_box || 0,
        jenis_sambungan: saveFormData.jenis_sambungan,
        stok_qty: 0,
        satuan: 'Pcs',
        harga_jual: calculation.hargaJualPerPcs,
        min_stok: 200,
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
                Kalkulator Estimasi Harga Packaging & Offset
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Hitung otomatis harga jual dus karton gelombang (Single/Double Joint Maspion), Karton Duplex, dan Ivory Food Grade.
              </p>
            </div>
          </div>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          {paperMode === 'corrugated' && (
            <>
              <button
                type="button"
                onClick={applyClientExampleBF}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                title="Contoh Resmi Client: 650x190x395 BF -> Sheet 597x1723 mm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                BF Standar (597×1723)
              </button>
              <button
                type="button"
                onClick={applyClientExampleBCF}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                title="Contoh Resmi Client: 650x190x395 BCF -> Sheet 609x1743 mm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                BCF Standar (609×1743)
              </button>
              <button
                type="button"
                onClick={applyClientExampleTutupFull}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                title="Contoh Resmi Client: 650x190x395 BF Tutup Full -> Sheet 787x1723 mm"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                BF Tutup Full (787×1723)
              </button>
              <button
                type="button"
                onClick={applyDoubleJointExample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                title="Contoh Resmi Client: Double Joint (Stitch 2 Sisi)"
              >
                <Split className="w-3.5 h-3.5 text-indigo-600" />
                Double Joint
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            Salin WA
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
            Simpan Master
          </button>
        </div>
      </div>

      {/* TAB PILIHAN MATERIAL KERTAS: Corrugated, Duplex, Ivory */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPaperMode('corrugated')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              paperMode === 'corrugated'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Box className="w-4 h-4" />
            Corrugated Box (Maspion)
          </button>
          <button
            type="button"
            onClick={() => setPaperMode('duplex')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              paperMode === 'duplex'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Karton Duplex (Offset)
          </button>
          <button
            type="button"
            onClick={() => setPaperMode('ivory')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              paperMode === 'ivory'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Karton Ivory Food Grade
          </button>
        </div>
        <div className="text-xs text-slate-500 font-semibold px-2">
          {paperMode === 'corrugated' && 'Kardus gelombang single / double wall'}
          {paperMode === 'duplex' && 'Rumus: (L x P x Gramatur)/20.000 x Index = Harga per Rim (500 lbr)'}
          {paperMode === 'ivory' && 'Rumus: (L x P x Gramatur)/20.000 x Harga/kg = Harga per Rim (500 lbr)'}
        </div>
      </div>

      {/* INFO MASTER DATA ASAL (REVISI CLIENT) */}
      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Info Master Persediaan:</strong> Master Dus & Box Jadi dikelola di menu <a href="/marketing/products" className="underline font-bold text-blue-700 hover:text-blue-900">Marketing ➜ Master Produk</a>, sedangkan Master Bahan Sheet dikelola di menu <a href="/gudang/sheet" className="underline font-bold text-blue-700 hover:text-blue-900">Gudang ➜ Bahan Baku Sheet</a>.
          </span>
        </div>
      </div>

      {/* Grid Utama: Form Input & Live Hasil */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Input Parameter Box & Index (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* ========================================================= */}
          {/* A. TAMPILAN JIKA MODE CORRUGATED BOX                      */}
          {/* ========================================================= */}
          {paperMode === 'corrugated' && (
            <>
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
                        onChange={(e) =>
                          setBoxDimensions({ ...boxDimensions, panjang: Number(e.target.value) || 0 })
                        }
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
                        onChange={(e) =>
                          setBoxDimensions({ ...boxDimensions, lebar: Number(e.target.value) || 0 })
                        }
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
                        onChange={(e) =>
                          setBoxDimensions({ ...boxDimensions, tinggi: Number(e.target.value) || 0 })
                        }
                        className="w-full pl-3 pr-9 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mm</span>
                    </div>
                  </div>
                </div>

                {/* PILIHAN MODEL DUS / TUTUP & TIPE SAMBUNGAN (SESUAI CATATAN RESMI CLIENT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Model Tutup */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Model Tutup Box:
                      </span>
                      <span className="text-[10px] text-brand-700 font-semibold">
                        Catatan Client No. 4
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModelTutup('standar')}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          modelTutup === 'standar'
                            ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>Standar (A1)</span>
                          {modelTutup === 'standar' && <Check className="w-3.5 h-3.5 text-brand-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          L Sheet = (L+T) + Crease
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModelTutup('full')}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          modelTutup === 'full'
                            ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>Tutup Full (FOL)</span>
                          {modelTutup === 'full' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          L Sheet = (Lx2)+T + Crease
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Tipe Sambungan */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Tipe Sambungan Dus:
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Dus standar vs jumbo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setJointType('single')}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          jointType === 'single'
                            ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>Single Joint</span>
                          {jointType === 'single' && <Check className="w-3.5 h-3.5 text-brand-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          1 Sheet / Dus
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setJointType('double')}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          jointType === 'double'
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>Double Joint</span>
                          {jointType === 'double' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          2 Lembar / Dus
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tipe Flute */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Pilih Tipe Flute / Ketebalan Gelombang (Catatan Client):
                    </label>
                    <span className="text-[11px] text-slate-500">
                      EF (+39/+9), BF (+43/+12), CF (+47/+13), BCF (+63/+24)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(FLUTE_SPECS).map((f) => (
                      <div
                        key={f.kode}
                        onClick={() => setFluteType(f.kode)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${
                          fluteType === f.kode
                            ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-800">{f.kode}</span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            +{f.panjangExtra} / +{f.lebarExtra}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{f.nama}</div>
                      </div>
                    ))}
                  </div>

                  {/* Rumus visual dari aturan revisi client */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-2 text-amber-950">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Kalkulasi Rumus Resmi Client ({fluteType} - {modelTutup === 'full' ? 'Tutup Full (FOL)' : 'Standar A1'}):</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold">
                        {fluteType === 'B/C' ? 'Double Wall (A2)' : 'Single Wall (A1)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-white/90 rounded border border-amber-200">
                        <div className="text-[10px] text-slate-500 font-sans font-semibold">Estimasi Size Luar:</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {calculation.pLuar} × {calculation.lLuar} × {calculation.tLuar} mm
                        </div>
                        <div className="text-[9.5px] text-slate-500 font-sans mt-0.5">
                          {fluteType === 'B/C' ? '(P+6, L+6, T+12 mm)' : '(P+3, L+3, T+6 mm)'}
                        </div>
                      </div>

                      <div className="p-2 bg-white/90 rounded border border-amber-200">
                        <div className="text-[10px] text-slate-500 font-sans font-semibold">Tutup Flap & Tab:</div>
                        <div className="font-bold text-blue-800 mt-0.5">
                          Tutup: {calculation.flapTutup} mm {modelTutup === 'full' ? '(Full Overlap)' : ''}
                        </div>
                        <div className="text-[9.5px] text-amber-700 font-sans font-semibold mt-0.5">
                          Tab: {calculation.tabCm} cm ({calculation.tabMm} mm)
                        </div>
                      </div>

                      <div className="p-2 bg-white/90 rounded border border-amber-200">
                        <div className="text-[10px] text-slate-500 font-sans font-semibold">Target Ukuran Sheet (LxP):</div>
                        <div className="font-bold text-emerald-800 text-xs mt-0.5">
                          {calculation.L_sheet} × {calculation.P_sheet} mm
                        </div>
                        <div className="text-[9.5px] text-slate-600 font-sans mt-0.5">
                          {modelTutup === 'full' ? `(L×2)+T+${calculation.lebarExtra}` : `(L+T)+${calculation.lebarExtra}`} × {calculation.isDouble ? `(((P+L)×2)+${calculation.doubleJointExtra})/2` : `((P+L)×2)+${calculation.panjangExtra}`}
                        </div>
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

                {sourceType === 'maspion' && (
                  <div className="space-y-3 p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pilih Substance Kertas Maspion:
                      </label>
                      <SearchableSelect
                        options={MASPION_PRICE_LIST.map((m) => ({
                          value: m.substance,
                          label: `${m.no}. ${m.substance} (${fluteType}: Rp ${
                            m[fluteType] ? m[fluteType].toLocaleString('id-ID') : '-'
                          })`,
                        }))}
                        value={selectedMaspionSubstance}
                        onChange={(val) => handleSelectMaspionSubstance(val)}
                        placeholder="Pilih substansi kertas Maspion..."
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200/60">
                      <span className="text-slate-600">Nilai Index Otomatis ({fluteType}):</span>
                      <span className="font-black text-emerald-800 text-sm">
                        Rp {nilaiIndex.toLocaleString('id-ID')} / m² (Include PPN 11%)
                      </span>
                    </div>
                  </div>
                )}

                {sourceType === 'warehouse' && (
                  <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Bahan Sheet dari Database Gudang:
                    </label>
                    <SearchableSelect
                      options={masterSheets.map((s) => ({
                        value: s.id,
                        label: `${s.kode_sheet} - ${s.nama_sheet} (${s.flute} ${s.substansi}) - Rp ${Number(
                          s.harga_per_lembar || 0
                        ).toLocaleString('id-ID')}/lbr`,
                      }))}
                      value={selectedSheetId}
                      onChange={(val) => handleSelectMasterSheet(val)}
                      placeholder="-- Cari Bahan Baku Sheet Gudang --"
                    />
                  </div>
                )}

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

                {/* Perhitungan Lebar Roll Maspion */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Hitung Berdasarkan Lebar Kertas Roll Supplier
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sesuai Aturan Maspion No. 5: Lebar sheet dihitung kelipatan out & roll terdekat
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* B. TAMPILAN JIKA MODE KARTON DUPLEX (GAMBAR 5 NO. 2)       */}
          {/* ========================================================= */}
          {paperMode === 'duplex' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Parameter Karton Duplex (Gambar 5 No. 2)
                  </h2>
                </div>
                <Badge variant="warning">Offset Printing</Badge>
              </div>

              {/* Rumus Coretan Client */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950 font-mono">
                <div className="font-bold font-sans text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Rumus Duplex Client: (L × P × Gramatur) ÷ 20.000 × Index
                </div>
                <div className="text-[11px] text-amber-800 font-sans">
                  *Dimensi Plano dihitung dalam Centimeter (cm). Contoh: 79 x 109 cm.
                </div>
              </div>

              {/* Ukuran Plano */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lebar Plano (cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={duplexDimensions.lebarCm}
                      onChange={(e) =>
                        setDuplexDimensions({ ...duplexDimensions, lebarCm: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-3 pr-8 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Panjang Plano (cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={duplexDimensions.panjangCm}
                      onChange={(e) =>
                        setDuplexDimensions({ ...duplexDimensions, panjangCm: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-3 pr-8 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Out per Plano (Dus/Lbr)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={duplexOutPerSheet}
                    onChange={(e) => setDuplexOutPerSheet(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Contoh: 1, 2, 4 box"
                  />
                </div>
              </div>

              {/* Pilihan Gramatur & Index Duplex */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Pilih Gramatur & Index Duplex Resmi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DUPLEX_INDEX_TABLE.map((item) => (
                    <button
                      key={item.gsm}
                      type="button"
                      onClick={() => handleSelectDuplexGsm(item.gsm)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        duplexGsm === item.gsm
                          ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-sm font-extrabold">{item.gsm} gr</div>
                      <div className="text-[10px] text-amber-800 mt-0.5">Index: {item.index}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Hitungan Duplex (Sesuai Catatan Kertas Client & WA) */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Berat 1 Rim (500 Lbr):</span>
                  <span className="font-bold text-slate-800">{calculation.beratRimKg} kg</span>
                </div>
                <div className="bg-amber-100/70 p-1 rounded">
                  <span className="text-[10px] text-amber-900 block font-sans font-bold">Harga / Rim (500 Lbr):</span>
                  <span className="font-black text-amber-900 text-xs">Rp {calculation.modalPerRim?.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Harga / Lembar Plano:</span>
                  <span className="font-bold text-slate-800">Rp {calculation.modalPerLembar?.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Modal / Box ({calculation.outs} Out):</span>
                  <span className="font-extrabold text-brand-700 text-xs">Rp {calculation.modalPerPcs?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* C. TAMPILAN JIKA MODE KARTON IVORY (GAMBAR 5 NO. 3 & 6)    */}
          {/* ========================================================= */}
          {paperMode === 'ivory' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Parameter Karton Ivory Food Grade (Gambar 6)
                  </h2>
                </div>
                <Badge variant="purple">Steril & Food Grade</Badge>
              </div>

              {/* Rumus Coretan Client */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1 text-purple-950 font-mono">
                <div className="font-bold font-sans text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  Rumus Ivory Client: (L × P × Gramatur) ÷ 20.000 × Harga 1 kg
                </div>
                <div className="text-[11px] text-purple-800 font-sans">
                  *Dimensi Plano dalam Centimeter (cm). Harga 1 kg sesuai tabel resmi VA, IKKVC, IKKVB, BOHUI, & PE.
                </div>
              </div>

              {/* Ukuran Plano */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lebar Plano (cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={ivoryDimensions.lebarCm}
                      onChange={(e) =>
                        setIvoryDimensions({ ...ivoryDimensions, lebarCm: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-3 pr-8 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Panjang Plano (cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={ivoryDimensions.panjangCm}
                      onChange={(e) =>
                        setIvoryDimensions({ ...ivoryDimensions, panjangCm: Number(e.target.value) || 0 })
                      }
                      className="w-full pl-3 pr-8 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">cm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Out per Plano (Dus/Lbr)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ivoryOutPerSheet}
                    onChange={(e) => setIvoryOutPerSheet(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Contoh: 1, 2, 4 box"
                  />
                </div>
              </div>

              {/* Tabel Pilihan Merek & GSM Ivory Resmi */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Pilih Merek & Spesifikasi Ivory (Pricelist Resmi Gambar 6):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-1.5">
                  {IVORY_PRICE_TABLE.map((item, idx) => {
                    const isSelected =
                      ivoryBrand === item.brand &&
                      ivoryGsm >= item.gsmMin &&
                      ivoryGsm <= item.gsmMax &&
                      ivoryHargaKg === item.hargaKg;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectIvoryPreset(item.brand, item.gsmMin, item.hargaKg)}
                        className={`cursor-pointer p-2 rounded-lg border text-xs transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                            : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold">{item.brand}</span>
                          <span className="text-purple-700 font-mono">
                            Rp {item.hargaKg.toLocaleString('id-ID')}/kg
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.gsmLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Opsi Tambahan Potong Roll / Sheet */}
              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-purple-900 block">
                  Ketentuan Roll / Potong (Gambar 6):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIvoryPotongOption('none')}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      ivoryPotongOption === 'none'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Standar Sheet (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIvoryPotongOption('potong_sheet')}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      ivoryPotongOption === 'potong_sheet'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Potong Roll to Sheet (+250/kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIvoryPotongOption('in_roll')}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      ivoryPotongOption === 'in_roll'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    In Roll (-350/kg include)
                  </button>
                </div>
              </div>

              {/* Live Preview Hitungan Ivory (Sesuai Catatan Kertas Client & WA: 1 Rim = 500 Lbr) */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Berat 1 Rim (500 Lbr):</span>
                  <span className="font-bold text-slate-800">{calculation.beratRimKg} kg</span>
                </div>
                <div className="bg-purple-100/70 p-1 rounded">
                  <span className="text-[10px] text-purple-900 block font-sans font-bold">Harga / Rim (500 Lbr):</span>
                  <span className="font-black text-purple-900 text-xs">Rp {calculation.modalPerRim?.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Harga / Lembar Plano:</span>
                  <span className="font-bold text-slate-800">Rp {calculation.modalPerLembar?.toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Modal / Box ({calculation.outs} Out):</span>
                  <span className="font-extrabold text-brand-700 text-xs">Rp {calculation.modalPerPcs?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* Card 3: POSISI BELI & MARGIN JUAL KE CUSTOMER            */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  3. Posisi Beli Supplier (+ / - %) & Margin Jual
                </h2>
              </div>
            </div>

            {/* Bagian A: Posisi Harga Beli Supplier (Hanya untuk Corrugated / Sheet Supplier) */}
            {paperMode === 'corrugated' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-amber-950 block">
                      Posisi Harga Beli di Supplier (+ / - %)
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Penyesuaian posisi pasar dari pricelist supplier (contoh: +10% dari pricelist Maspion)
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
                </div>
              </div>
            )}

            {/* Bagian B: Penyesuaian Margin Jual ke Customer */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Atur Keuntungan Jual ke Customer (Margin / Diskon):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustType('plus_percent');
                    setAdjustValue(20);
                  }}
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
                  onClick={() => {
                    setAdjustType('plus_nominal');
                    setAdjustValue(500);
                  }}
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
                  onClick={() => {
                    setAdjustType('minus_percent');
                    setAdjustValue(5);
                  }}
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
                  onClick={() => {
                    setAdjustType('minus_nominal');
                    setAdjustValue(200);
                  }}
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

            {/* Biaya Produksi Tambahan */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Biaya Tambahan Cetak / Finishing (Opsional / Per Pcs):
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Biaya Cetak Flexo / Offset (Rp/pcs)</label>
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
              <span className="text-xs text-slate-400">
                {paperMode === 'corrugated'
                  ? calculation.isDouble
                    ? 'Double Joint'
                    : 'Single Joint'
                  : paperMode === 'duplex'
                  ? 'Duplex Coated'
                  : 'Ivory Solid'}
              </span>
            </div>

            {/* Highlight Harga Jual Final */}
            <div className="text-center py-2 border-y border-white/10">
              <div className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                ESTIMASI HARGA JUAL KE CUSTOMER
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                Rp {calculation.hargaJualPerPcs?.toLocaleString('id-ID')}
                <span className="text-sm font-semibold text-slate-300 ml-1">/ pcs</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                <span className="text-slate-400">Modal: Rp {calculation.hppDasarTotal?.toLocaleString('id-ID')}</span>
                <span className="text-slate-500">•</span>
                <span
                  className={`font-bold ${
                    calculation.profitPerPcs >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {calculation.profitPerPcs >= 0 ? '+' : ''}Rp{' '}
                  {calculation.profitPerPcs?.toLocaleString('id-ID')} ({calculation.marginPersen}%)
                </span>
              </div>
            </div>

            {/* Breakdown Rincian Hitungan Sesuai Kertas Client */}
            <div className="space-y-3 text-xs">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Rincian Lembaran Sheet & Modal:
              </div>

              {paperMode === 'corrugated' ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-[11px] text-slate-400">Lebar Sheet (L)</div>
                      <div className="text-sm font-black text-white mt-0.5">{calculation.L_sheet} mm</div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        {calculation.modelTutup === 'full' ? `(L×2)+T+${calculation.lebarExtra}` : `(L+T)+${calculation.lebarExtra}`}
                      </div>
                    </div>
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-[11px] text-slate-400">
                        Panjang Sheet {calculation.isDouble ? '(½ Sheet)' : '(P)'}
                      </div>
                      <div className="text-sm font-black text-white mt-0.5">{calculation.P_sheet} mm</div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        {calculation.isDouble ? `(((P+L)×2)+${calculation.doubleJointExtra})/2` : `((P+L)×2)+${calculation.panjangExtra}`}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Sheet (LxP):</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {calculation.L_sheet} × {calculation.P_sheet} mm ({calculation.sheetsPerBox} Lbr)
                      </span>
                    </div>
                    {useRollWidth && (
                      <div className="flex justify-between text-amber-300">
                        <span>Roll Kertas Maspion:</span>
                        <span className="font-semibold">
                          {calculation.rollWidth} mm ({calculation.outs} Out)
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Luas Tagihan Supplier:</span>
                      <span className="font-semibold text-slate-200">
                        {calculation.luasTagihanM2} m²/pcs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Index Dasar Pricelist:</span>
                      <span className="text-slate-200">Rp {nilaiIndex.toLocaleString('id-ID')} / m²</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Harga Dasar Sheet:</span>
                      <span>Rp {calculation.hargaDasarPricelist?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-semibold">
                      <span>Posisi Beli Supplier (+{calculation.posSupplier}%):</span>
                      <span>+{calculation.selisihPosisiSupplier?.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                      <span>Modal Beli Sheet ke Supplier:</span>
                      <span>Rp {calculation.modalBeliSheet?.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </>
              ) : paperMode === 'duplex' ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensi Plano:</span>
                    <span className="font-bold text-white">
                      {calculation.L_cm} × {calculation.P_cm} cm ({calculation.gsmVal} GSM)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Index Duplex:</span>
                    <span className="font-semibold text-amber-300">{calculation.idx}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Berat 1 Rim (500 Lbr):</span>
                    <span className="text-slate-200">{calculation.beratRimKg} kg</span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-bold bg-white/5 px-2 py-1 rounded">
                    <span>Harga per Rim (500 Lbr):</span>
                    <span>Rp {calculation.modalPerRim?.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Harga per Lembar Plano:</span>
                    <span className="font-bold text-white">
                      Rp {calculation.modalPerLembar?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                    <span>Modal Bahan per Box ({calculation.outs} Out):</span>
                    <span>Rp {calculation.modalPerPcs?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensi & Merek:</span>
                    <span className="font-bold text-white">
                      {calculation.L_cm} × {calculation.P_cm} cm • {ivoryBrand} ({calculation.gsmVal} GSM)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Harga per Kg:</span>
                    <span className="font-semibold text-purple-300">
                      Rp {calculation.effectiveHargaKg?.toLocaleString('id-ID')} / kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Berat 1 Rim (500 Lbr):</span>
                    <span className="text-slate-200">{calculation.beratRimKg} kg</span>
                  </div>
                  <div className="flex justify-between text-purple-300 font-bold bg-white/5 px-2 py-1 rounded">
                    <span>Harga per Rim (500 Lbr):</span>
                    <span>Rp {calculation.modalPerRim?.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Harga per Lembar Plano:</span>
                    <span className="font-bold text-white">
                      Rp {calculation.modalPerLembar?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                    <span>Modal Bahan per Box ({calculation.outs} Out):</span>
                    <span>Rp {calculation.modalPerPcs?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* SIMULASI ORDER: BEBAS INPUT QTY (REVISI 8)                */}
            {/* ========================================================= */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Simulasi Qty Order (Bebas Input):
                  </label>
                  <span className="text-[10px] text-amber-300">Ketik jumlah pesanan</span>
                </div>

                {/* Input Bebas Qty Simulasi Order */}
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={simulasiQty}
                    onChange={(e) => setSimulasiQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400"
                    placeholder="Ketik Qty..."
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Pcs</span>
                </div>

                {/* Tombol Cepat Preset Qty */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[500, 1000, 2000, 5000, 10000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSimulasiQty(q)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        simulasiQty === q
                          ? 'bg-amber-400 text-slate-900 shadow-xs'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
                  <div className="text-[10px] text-slate-400">Total Modal Bahan</div>
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
                      <td className="p-2 text-right border-r border-slate-200 font-mono">
                        Rp {m['E/F'].toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 font-mono">
                        Rp {m['B/F'].toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-right border-r border-slate-200 font-mono">
                        Rp {m['C/F'].toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">
                        Rp {m['B/C'].toLocaleString('id-ID')}
                      </td>
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
                {calculation.P_box || calculation.P_cm * 10} x {calculation.L_box || calculation.L_cm * 10}{' '}
                {calculation.T_box > 0 ? `x ${calculation.T_box}` : ''} mm
              </div>
            </div>
            <div>
              <span className="text-slate-400">Harga Jual Estimasi:</span>
              <div className="font-bold text-emerald-700">
                Rp {calculation.hargaJualPerPcs?.toLocaleString('id-ID')} / pcs
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
                { value: 'Stitching (Double Joint)', label: 'Stitching (Double Joint / 2 Jahit)' },
                { value: 'Lem Glue', label: 'Lem Glue (Dextrin / Hotmelt)' },
                { value: 'Die Cut Lock', label: 'Die Cut Lock (Tanpa Sambungan)' },
                { value: 'Roll', label: 'Roll (Gulungan)' },
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
