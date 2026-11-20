import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Fingerprint, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RefreshCw,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

/**
 * Helper: Hitung Jam Kerja Pokok & Jam Lembur secara adil & akurat
 * 1. Total Jam di Pabrik = Jam Akhir - Jam Masuk
 * 2. Dipotong istirahat 1 jam (jika kerja >= 5 jam)
 * 3. Wajib penuhi 8 jam pokok dulu!
 *    - Jika jam bersih <= 8 jam -> Jam Pokok = jam bersih, Jam Lembur = 0
 *    - Jika jam bersih > 8 jam -> Jam Pokok = 8 jam, Jam Lembur = jam bersih - 8 jam
 * (Mencakup masuk lebih pagi dari shift, maupun lembur pulang malam)
 */
export const calculateWorkAndOvertime = (jamMasuk, jamPulang, jamIstirahatKeluar, jamIstirahatMasuk, jamLemburSelesai) => {
  const waktuAwal = (jamMasuk || '08:00').slice(0, 5);
  const waktuAkhir = (jamLemburSelesai || jamPulang || '16:00').slice(0, 5);

  const [hAwal, mAwal] = waktuAwal.split(':').map(Number);
  const [hAkhir, mAkhir] = waktuAkhir.split(':').map(Number);

  const menitAwal = (hAwal || 0) * 60 + (mAwal || 0);
  const menitAkhir = (hAkhir || 0) * 60 + (mAkhir || 0);

  let menitKotor = menitAkhir - menitAwal;
  if (menitKotor < 0) menitKotor = 0;

  // Istirahat
  let menitIstirahat = 0;
  if (jamIstirahatKeluar && jamIstirahatMasuk) {
    const [hIK, mIK] = jamIstirahatKeluar.slice(0, 5).split(':').map(Number);
    const [hIM, mIM] = jamIstirahatMasuk.slice(0, 5).split(':').map(Number);
    const m1 = (hIK || 0) * 60 + (mIK || 0);
    const m2 = (hIM || 0) * 60 + (mIM || 0);
    if (m2 > m1) menitIstirahat = m2 - m1;
  } else if (menitKotor >= 5 * 60) {
    menitIstirahat = 60;
  }

  const menitBersih = Math.max(0, menitKotor - menitIstirahat);
  const jamBersih = Math.round((menitBersih / 60) * 10) / 10;

  let jamPokok = 0;
  let jamLembur = 0;

  if (jamBersih <= 8.0) {
    jamPokok = jamBersih;
    jamLembur = 0;
  } else {
    jamPokok = 8.0;
    jamLembur = Math.round((jamBersih - 8.0) * 10) / 10;
  }

  return {
    jamKotor: Math.round((menitKotor / 60) * 10) / 10,
    jamIstirahat: Math.round((menitIstirahat / 60) * 10) / 10,
    jamBersih,
    jamPokok,
    jamLembur
  };
};

export default function AbsensiPage() {
  const [absensiList, setAbsensiList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal Manual Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    karyawan_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    status_kehadiran: 'Hadir',
    jam_masuk: '08:00',
    jam_istirahat_keluar: '12:00',
    jam_istirahat_masuk: '13:00',
    jam_pulang: '16:00',
    jam_lembur_selesai: '',
    jam_lembur: 0,
    total_jam_kerja: 8.0,
    catatan: 'Hadir jam kerja reguler',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete Dialog
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '', date: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal Fingerprint Import
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState('file'); // 'file' or 'paste'
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchKaryawan = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PAYROLL.KARYAWAN, { limit: 100 });
      if (res.success) setKaryawanList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAbsensi = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PAYROLL.ABSENSI, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setAbsensiList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat absensi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, []);

  useEffect(() => {
    fetchAbsensi();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    const init = {
      id: null,
      karyawan_id: karyawanList.length ? karyawanList[0].id : '',
      tanggal: new Date().toISOString().split('T')[0],
      status_kehadiran: 'Hadir',
      jam_masuk: '07:00',
      jam_istirahat_keluar: '12:00',
      jam_istirahat_masuk: '13:00',
      jam_pulang: '16:00',
      jam_lembur_selesai: '',
      jam_lembur: 0,
      total_jam_kerja: 8.0,
      catatan: 'Hadir jam kerja reguler',
    };
    const calc = calculateWorkAndOvertime(init.jam_masuk, init.jam_pulang, init.jam_istirahat_keluar, init.jam_istirahat_masuk, init.jam_lembur_selesai);
    init.total_jam_kerja = calc.jamPokok;
    init.jam_lembur = calc.jamLembur;
    setFormData(init);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    const editData = {
      id: item.id,
      karyawan_id: item.karyawan_id || (karyawanList.length ? karyawanList[0].id : ''),
      tanggal: item.tanggal ? item.tanggal.slice(0, 10) : new Date().toISOString().split('T')[0],
      status_kehadiran: item.status_kehadiran || 'Hadir',
      jam_masuk: item.jam_masuk ? item.jam_masuk.slice(0, 5) : '07:00',
      jam_istirahat_keluar: item.jam_istirahat_keluar ? item.jam_istirahat_keluar.slice(0, 5) : '12:00',
      jam_istirahat_masuk: item.jam_istirahat_masuk ? item.jam_istirahat_masuk.slice(0, 5) : '13:00',
      jam_pulang: item.jam_pulang ? item.jam_pulang.slice(0, 5) : '16:00',
      jam_lembur_selesai: item.jam_lembur_selesai ? item.jam_lembur_selesai.slice(0, 5) : '',
      jam_lembur: Number(item.jam_lembur) || 0,
      total_jam_kerja: Number(item.total_jam_kerja) || 8.0,
      catatan: item.catatan || '',
    };
    const calc = calculateWorkAndOvertime(
      editData.jam_masuk,
      editData.jam_pulang,
      editData.jam_istirahat_keluar,
      editData.jam_istirahat_masuk,
      editData.jam_lembur_selesai
    );
    editData.total_jam_kerja = calc.jamPokok;
    editData.jam_lembur = calc.jamLembur;
    setFormData(editData);
    setIsModalOpen(true);
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const calc = calculateWorkAndOvertime(
        updated.jam_masuk,
        updated.jam_pulang,
        updated.jam_istirahat_keluar,
        updated.jam_istirahat_masuk,
        updated.jam_lembur_selesai
      );
      return {
        ...updated,
        total_jam_kerja: calc.jamPokok,
        jam_lembur: calc.jamLembur,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.PAYROLL.ABSENSI_DETAIL(formData.id), formData);
        toast.success('Data presensi & jam lembur berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PAYROLL.ABSENSI, formData);
        toast.success('Kehadiran & lembur karyawan berhasil dicatat');
      }
      setIsModalOpen(false);
      fetchAbsensi();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan absensi');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PAYROLL.ABSENSI_DETAIL(deleteDialog.id));
      toast.success('Data absensi berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '', date: '' });
      fetchAbsensi();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus data absensi');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper parsing CSV / TSV text
  const parseCSVContent = (text) => {
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const delimiter = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.replace(/['"]+/g, '').trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(delimiter).map(c => c.replace(/['"]+/g, '').trim());
      if (currentline.length >= 2) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = currentline[index] || '';
        });

        // Mapping standard names & multi-scan columns
        const mapped = {
          nik: obj.PIN_NIK || obj.nik || obj.PIN || obj.NIK || obj.Id || '',
          nama: obj.Nama_Karyawan || obj.nama || obj.Nama || obj.Name || '',
          tanggal: obj.Tanggal || obj.tanggal || obj.Date || new Date().toISOString().split('T')[0],
          jam_masuk: obj.Jam_Masuk || obj.jam_masuk || obj.In || obj.ClockIn || '08:00',
          jam_istirahat_keluar: obj.Istirahat_Keluar || obj.jam_istirahat_keluar || obj.BreakOut || '',
          jam_istirahat_masuk: obj.Istirahat_Masuk || obj.jam_istirahat_masuk || obj.BreakIn || '',
          jam_pulang: obj.Jam_Pulang || obj.jam_pulang || obj.Out || obj.ClockOut || '16:00',
          jam_lembur_selesai: obj.Lembur_Selesai || obj.jam_lembur_selesai || obj.OTOut || '',
          jam_lembur: Number(obj.Jam_Lembur || obj.jam_lembur || obj.Overtime || 0),
          status_kehadiran: obj.Status_Kehadiran || obj.status || 'Hadir',
          catatan: obj.Catatan || obj.catatan || 'Log Tarikan Fingerprint'
        };

        // Raw single punch support (e.g. log baris mesin: jam / time)
        if (obj.Jam || obj.Time || obj.Waktu) {
          mapped.jam = obj.Jam || obj.Time || obj.Waktu;
        }

        // Kalkulasi otomatis jam pokok & jam lembur dengan aturan wajib 8 jam
        const calc = calculateWorkAndOvertime(
          mapped.jam_masuk,
          mapped.jam_pulang,
          mapped.jam_istirahat_keluar,
          mapped.jam_istirahat_masuk,
          mapped.jam_lembur_selesai
        );
        mapped.jam_lembur = calc.jamLembur;
        mapped.total_jam_kerja = calc.jamPokok;

        result.push(mapped);
      }
    }
    return result;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSVContent(text);
      if (parsed.length === 0) {
        toast.error('File kosong atau format kolom tidak sesuai.');
      } else {
        setParsedRows(parsed);
        toast.success(`${parsed.length} baris data absensi berhasil dibaca.`);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteParse = () => {
    if (!rawText.trim()) {
      toast.error('Tempelkan teks data terlebih dahulu.');
      return;
    }
    const parsed = parseCSVContent(rawText);
    if (parsed.length === 0) {
      toast.error('Gagal mengenali format teks. Pastikan baris pertama berisi nama kolom.');
    } else {
      setParsedRows(parsed);
      toast.success(`${parsed.length} baris data berhasil diparsing.`);
    }
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) {
      toast.error('Tidak ada data absensi untuk diimpor.');
      return;
    }

    try {
      setImportLoading(true);
      const res = await request.post(API_ENDPOINTS.PAYROLL.ABSENSI_IMPORT_FINGERPRINT, { records: parsedRows });
      if (res.success) {
        toast.success(res.message || 'Data absensi fingerprint berhasil diimpor!');
        setIsImportModalOpen(false);
        setParsedRows([]);
        setRawText('');
        fetchAbsensi();
      } else {
        toast.error(res.message || 'Gagal mengimpor data absensi');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengimpor data fingerprint');
    } finally {
      setImportLoading(false);
    }
  };

  // Download template CSV
  const handleDownloadTemplate = () => {
    const url = `${import.meta.env.VITE_API_URL || ''}${API_ENDPOINTS.PAYROLL.ABSENSI_TEMPLATE}`;
    window.open(url, '_blank');
  };

  // Export full CSV
  const handleExportCSV = () => {
    const url = `${import.meta.env.VITE_API_URL || ''}${API_ENDPOINTS.PAYROLL.ABSENSI_EXPORT}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Fingerprint className="w-7 h-7 text-brand-600" />
            Absensi & Fingerprint Mesin Pabrik
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Integrasi presensi harian karyawan & operator mesin, perhitungan lembur otomatis, dan sinkronisasi mesin fingerprint (Solution, ZKTeco, Fingerspot).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download / Export */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-2xs"
            title="Export data absensi ke file CSV/Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Data (CSV)
          </button>

          {/* Import Fingerprint */}
          <button
            onClick={() => {
              setParsedRows([]);
              setRawText('');
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Log Fingerprint
          </button>

          {/* Manual Input */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Input Manual
          </button>
        </div>
      </div>

      {/* Infografis Alur Absensi Multi-Scan Pabrik */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-4 rounded-2xl border border-blue-200/70 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="p-1.5 bg-brand-600 text-white rounded-lg">
            <Clock className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Alur Presensi Multi-Scan Harian (5x Tap Fingerprint Otomatis)
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full">
            Auto-Detect Sistem
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-2.5 bg-white border border-blue-100 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">1. Jam Masuk (Pagi)</div>
            <div className="text-sm font-bold text-emerald-700 font-mono">06:00 / 07:00 / 08:00</div>
            <div className="text-[11px] text-slate-500">Masuk jam 6 (lebih awal 1 jam) otomatis terakumulasi</div>
          </div>
          <div className="p-2.5 bg-white border border-blue-100 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">2. Keluar Istirahat</div>
            <div className="text-sm font-bold text-amber-700 font-mono">12:00</div>
            <div className="text-[11px] text-slate-500">Break makan siang</div>
          </div>
          <div className="p-2.5 bg-white border border-blue-100 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">3. Masuk Istirahat</div>
            <div className="text-sm font-bold text-blue-700 font-mono">13:00</div>
            <div className="text-[11px] text-slate-500">Kembali kerja (1 jam break dipotong otomatis)</div>
          </div>
          <div className="p-2.5 bg-white border border-blue-100 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">4. Target 8 Jam Pokok</div>
            <div className="text-sm font-bold text-slate-800 font-mono">Wajib 8 Jam Pokok</div>
            <div className="text-[11px] text-slate-500">Jika kerja cuman 6 jam, lembur = 0 (belum 8 jam)</div>
          </div>
          <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl">
            <div className="text-[10px] text-amber-800 font-semibold uppercase">5. Kelebihan Lembur</div>
            <div className="text-sm font-bold text-amber-800 font-mono">+ Jam Lembur (OT)</div>
            <div className="text-[11px] text-amber-900 font-semibold">Sisa waktu bersih di atas 8 jam kerja</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari NIK, nama karyawan, metode, catatan..."
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-brand-700 rounded-lg font-medium border border-blue-100">
            <Fingerprint className="w-3.5 h-3.5" />
            Fingerprint Support Ready
          </span>
          <div>
            Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Catatan
          </div>
          <button
            onClick={fetchAbsensi}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Memuat catatan absensi..." />
          </div>
        ) : absensiList.length === 0 ? (
          <div className="py-12">
            <EmptyState 
              title="Belum ada data absensi" 
              message="Import log dari mesin fingerprint atau input kehadiran manual karyawan hari ini."
              actionLabel="Import Log Fingerprint"
              onAction={() => setIsImportModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Tenaga Kerja</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5">Jam Pokok (In - Out)</th>
                  <th className="px-4 py-3.5">Istirahat Siang</th>
                  <th className="px-4 py-3.5 text-center">Jam Lembur (OT)</th>
                  <th className="px-4 py-3.5">Metode</th>
                  <th className="px-4 py-3.5">Keterangan / Aktivitas</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {absensiList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-700 text-xs">
                      {a.tanggal}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{a.nama_lengkap}</div>
                      <div className="text-xs text-slate-400 font-mono">{a.nik || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant={a.status_kehadiran === 'Hadir' ? 'success' : a.status_kehadiran === 'Izin' ? 'warning' : 'danger'}>
                        {a.status_kehadiran}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold">{a.jam_masuk ? a.jam_masuk.slice(0, 5) : '08:00'}</span>
                        <span className="text-slate-400">s/d</span>
                        <span className="font-semibold">{a.jam_pulang ? a.jam_pulang.slice(0, 5) : '16:00'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {a.jam_istirahat_keluar ? (
                        <div className="font-mono text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded inline-block">
                          {a.jam_istirahat_keluar.slice(0, 5)} - {a.jam_istirahat_masuk ? a.jam_istirahat_masuk.slice(0, 5) : '13:00'} (1 Jam)
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">12:00 - 13:00</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {Number(a.jam_lembur) > 0 ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            +{a.jam_lembur} Jam OT
                          </span>
                          {a.jam_lembur_selesai && (
                            <div className="text-[10px] text-amber-700 font-mono font-medium">
                              s/d {a.jam_lembur_selesai.slice(0, 5)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {a.metode === 'Mesin Fingerprint' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-brand-700 border border-blue-200">
                          <Fingerprint className="w-3.5 h-3.5 text-brand-600" />
                          Fingerprint
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                          Manual HR
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                      {a.catatan}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Catatan Absensi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: a.id, name: a.nama_lengkap, date: a.tanggal })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Catatan Absensi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && absensiList.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: IMPORT DATA MESIN FINGERPRINT */}
      {/* ======================================================== */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Log Mesin Fingerprint Attendance"
      >
        <div className="space-y-4">
          {/* Petunjuk format */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-900 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-brand-600" />
                Dukungan Mesin Biometrik:
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-900 font-semibold underline text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Format Template (CSV)
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Anda dapat mengimpor file ekspor (*.csv, *.txt) dari software bawaan mesin presensi (seperti <strong>ZKTeco BioTime</strong>, <strong>Fingerspot Personnel</strong>, <strong>Solution Attendance</strong>) atau langsung dari tarikan Flashdisk USB mesin.
            </p>
            <div className="p-2 bg-white/90 border border-blue-200 rounded-lg text-[11px] text-blue-900 font-medium">
              💡 <strong>Dukungan Multi-Tap Harian:</strong> Jika karyawan scan 4 s/d 5 kali sehari (Masuk jam 8, Istirahat jam 12, Masuk jam 1, Pulang jam 4, dan Lembur malam), sistem otomatis mengelompokkan jam kerja pokok, mengabaikan istirahat 1 jam, dan menghitung selisih lembur secara akurat!
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setImportMode('file')}
              className={`pb-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                importMode === 'file'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Upload File (CSV / TXT)
            </button>
            <button
              type="button"
              onClick={() => setImportMode('paste')}
              className={`pb-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                importMode === 'paste'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Paste Teks Log Mesin
            </button>
          </div>

          {importMode === 'file' ? (
            <div className="space-y-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-10 h-10 text-brand-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Klik di sini untuk memilih file log fingerprint</p>
                <p className="text-xs text-slate-400 mt-1">Mendukung format .CSV atau .TXT export dari mesin</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Tempelkan Teks CSV / TSV Log:
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="PIN_NIK,Nama_Karyawan,Tanggal,Jam_Masuk,Jam_Pulang,Catatan&#10;EMP-001,Mulyadi Pratama,2026-11-20,07:55,17:15,Mesin Fingerprint Pintu"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handlePasteParse}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Proses & Pratinjau Teks
              </button>
            </div>
          )}

          {/* Pratinjau Baris Parsed */}
          {parsedRows.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Pratinjau Data yang Siap Diimpor ({parsedRows.length} baris):</span>
                <span className="text-emerald-600 font-bold">✓ Valid</span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">NIK</th>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Masuk</th>
                      <th className="px-3 py-2">Pulang</th>
                      <th className="px-3 py-2 text-center">Lembur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {parsedRows.slice(0, 8).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-semibold text-slate-800">{r.nik || '-'}</td>
                        <td className="px-3 py-1.5 font-sans">{r.nama}</td>
                        <td className="px-3 py-1.5">{r.tanggal}</td>
                        <td className="px-3 py-1.5 text-emerald-600">{r.jam_masuk}</td>
                        <td className="px-3 py-1.5 text-slate-800">{r.jam_pulang}</td>
                        <td className="px-3 py-1.5 text-center font-bold text-amber-600">
                          {r.jam_lembur > 0 ? `+${r.jam_lembur}j` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 8 && (
                <p className="text-[11px] text-slate-400 text-center">
                  ... dan {parsedRows.length - 8} baris lainnya
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={parsedRows.length === 0 || importLoading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {importLoading ? 'Menyimpan...' : `Simpan ${parsedRows.length} Data Absensi`}
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: MANUAL CREATE PRESENSI / LEMBUR */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Presensi & Lembur Karyawan' : 'Catat Presensi & Lembur Karyawan (Manual)'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nama Karyawan / Operator *
            </label>
            <select
              value={formData.karyawan_id}
              onChange={(e) => setFormData({ ...formData, karyawan_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            >
              {karyawanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nik} - {k.nama_lengkap} ({k.jabatan})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tanggal Kehadiran *
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status Kehadiran *
              </label>
              <select
                value={formData.status_kehadiran}
                onChange={(e) => setFormData({ ...formData, status_kehadiran: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Hadir">Hadir Bekerja</option>
                <option value="Izin">Izin Tidak Masuk</option>
                <option value="Sakit">Sakit (SKD)</option>
                <option value="Alfa">Tanpa Keterangan (Alfa)</option>
              </select>
            </div>
          </div>

          {/* Quick Presets for Easy Testing */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Contoh Cepat:</span>
            <button
              type="button"
              onClick={() => {
                handleTimeChange('jam_masuk', '07:00');
                handleTimeChange('jam_pulang', '16:00');
                handleTimeChange('jam_lembur_selesai', '');
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg font-medium"
            >
              Normal 07:00 - 16:00 (8 Jam)
            </button>
            <button
              type="button"
              onClick={() => {
                handleTimeChange('jam_masuk', '06:00');
                handleTimeChange('jam_pulang', '16:00');
                handleTimeChange('jam_lembur_selesai', '');
              }}
              className="text-[11px] bg-blue-50 hover:bg-blue-100 text-brand-700 px-2 py-0.5 rounded-lg font-medium"
            >
              Masuk Jam 6 Pagi (Lembur Pagi 1 Jam)
            </button>
            <button
              type="button"
              onClick={() => {
                handleTimeChange('jam_masuk', '09:00');
                handleTimeChange('jam_pulang', '16:00');
                handleTimeChange('jam_lembur_selesai', '');
              }}
              className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg font-medium"
            >
              Kerja 6 Jam (0 Jam Lembur)
            </button>
            <button
              type="button"
              onClick={() => {
                handleTimeChange('jam_masuk', '07:00');
                handleTimeChange('jam_pulang', '16:00');
                handleTimeChange('jam_lembur_selesai', '19:30');
              }}
              className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg font-medium"
            >
              Lembur s/d 19:30 (3.5 Jam OT)
            </button>
          </div>

          {/* Multi-scan Timeline Form */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Rincian Jam Kerja Pokok & Istirahat</span>
              <span className="text-[11px] text-emerald-700 font-semibold font-mono">Wajib Penuhi 8 Jam Pokok Dulu</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam Masuk (Pagi)
                </label>
                <input
                  type="time"
                  value={formData.jam_masuk}
                  onChange={(e) => handleTimeChange('jam_masuk', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white font-mono font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400">Jika masuk jam 06:00 (lebih awal), otomatis dihitung lembur</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam Pulang Pokok
                </label>
                <input
                  type="time"
                  value={formData.jam_pulang}
                  onChange={(e) => handleTimeChange('jam_pulang', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white font-mono font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400">Shift normal pulang jam 16:00 atau 17:00</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Keluar Istirahat (Break Out)
                </label>
                <input
                  type="time"
                  value={formData.jam_istirahat_keluar}
                  onChange={(e) => handleTimeChange('jam_istirahat_keluar', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Masuk Kembali Istirahat (Break In)
                </label>
                <input
                  type="time"
                  value={formData.jam_istirahat_masuk}
                  onChange={(e) => handleTimeChange('jam_istirahat_masuk', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Lembur Section */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
              <span>Lembur Kerja (Overtime)</span>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                Kalkulasi Otomatis Berdasarkan Waktu Bersih
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1">
                  Jam Selesai Lembur (Malam)
                </label>
                <input
                  type="time"
                  value={formData.jam_lembur_selesai}
                  onChange={(e) => handleTimeChange('jam_lembur_selesai', e.target.value)}
                  className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-sm bg-white font-mono font-bold text-amber-900"
                />
                <span className="text-[10px] text-amber-700 italic">Isi jika lembur sore/malam (contoh: 19:30 atau 20:00)</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-950 mb-1">
                  Total Jam Lembur (OT)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.jam_lembur}
                  onChange={(e) => setFormData({ ...formData, jam_lembur: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-sm bg-white font-bold text-amber-700"
                />
                <span className="text-[10px] text-amber-700">Dihitung otomatis atau dapat diedit</span>
              </div>
            </div>
          </div>

          {/* Kartu Live Kalkulasi Otomatis */}
          {(() => {
            const liveCalc = calculateWorkAndOvertime(
              formData.jam_masuk,
              formData.jam_pulang,
              formData.jam_istirahat_keluar,
              formData.jam_istirahat_masuk,
              formData.jam_lembur_selesai
            );

            return (
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-600" />
                    Kalkulasi Jam Kerja & Status Lembur Otomatis:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    liveCalc.jamBersih < 8.0 
                      ? 'bg-amber-100 text-amber-800' 
                      : liveCalc.jamLembur > 0 
                        ? 'bg-blue-100 text-brand-800' 
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {liveCalc.jamBersih < 8.0 
                      ? `Kerja Bersih ${liveCalc.jamBersih} Jam (Belum 8 Jam Pokok)` 
                      : liveCalc.jamLembur > 0 
                        ? `8 Jam Pokok + ${liveCalc.jamLembur} Jam OT` 
                        : 'Pas 8 Jam Pokok Normal'}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="text-slate-400">Total di Pabrik</div>
                    <div className="font-bold text-slate-800 text-xs mt-0.5">{liveCalc.jamKotor} Jam</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="text-slate-400">Istirahat</div>
                    <div className="font-bold text-slate-600 text-xs mt-0.5">-{liveCalc.jamIstirahat} Jam</div>
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="text-emerald-700">Jam Pokok</div>
                    <div className="font-bold text-emerald-800 text-xs mt-0.5">{liveCalc.jamPokok} Jam</div>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="text-amber-700">Jam Lembur</div>
                    <div className="font-bold text-amber-800 text-xs mt-0.5">{liveCalc.jamLembur} Jam OT</div>
                  </div>
                </div>

                <div className="text-[11px] leading-relaxed p-2 rounded-lg bg-slate-50 border border-slate-100">
                  {liveCalc.jamBersih < 8.0 ? (
                    <div className="text-amber-800 font-medium">
                      ⚠️ <strong>Belum Memenuhi 8 Jam Pokok:</strong> Total jam kerja bersih baru <strong>{liveCalc.jamBersih} Jam</strong>. Sesuai ketentuan, lembur tidak akan dihitung sebelum 8 jam kerja pokok terpenuhi (Lembur = 0 Jam).
                    </div>
                  ) : liveCalc.jamLembur > 0 ? (
                    <div className="text-brand-900 font-medium">
                      🎉 <strong>Lembur Terhitung Otomatis:</strong> Karyawan telah memenuhi <strong>8 Jam Kerja Pokok</strong>. Kelebihan <strong>+{liveCalc.jamLembur} Jam</strong> (baik karena masuk lebih pagi di jam {formData.jam_masuk} maupun lembur sore/malam) otomatis dihitung sebagai Jam Lembur!
                    </div>
                  ) : (
                    <div className="text-emerald-800 font-medium">
                      ✓ <strong>Tepat 8 Jam Kerja Pokok Normal:</strong> Jam kerja bersih pas 8 jam. Tidak ada lembur.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Keterangan / Aktivitas Lembur
            </label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Contoh: Lembur operator flexo cetak dus Indofood"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Presensi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '', date: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Catatan Absensi"
        message={`Apakah Anda yakin ingin menghapus data absensi tanggal ${deleteDialog.date} untuk karyawan "${deleteDialog.name}"?`}
      />
    </div>
  );
}
