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
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/utils/endpoints';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function AbsensiPage() {
  const [absensiList, setAbsensiList] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal Manual Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    karyawan_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    status_kehadiran: 'Hadir',
    jam_masuk: '07:45',
    jam_pulang: '17:00',
    jam_lembur: 0,
    catatan: 'Tepat waktu',
  });
  const [formLoading, setFormLoading] = useState(false);

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
    setFormData({
      karyawan_id: karyawanList.length ? karyawanList[0].id : '',
      tanggal: new Date().toISOString().split('T')[0],
      status_kehadiran: 'Hadir',
      jam_masuk: '07:45',
      jam_pulang: '19:30',
      jam_lembur: 2,
      catatan: 'Lembur setting mesin cetak flexo',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PAYROLL.ABSENSI, formData);
      toast.success('Kehadiran & lembur karyawan berhasil dicatat');
      setIsModalOpen(false);
      fetchAbsensi();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan absensi');
    } finally {
      setFormLoading(false);
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

        // Mapping standard names
        const mapped = {
          nik: obj.PIN_NIK || obj.nik || obj.PIN || obj.NIK || obj.Id || '',
          nama: obj.Nama_Karyawan || obj.nama || obj.Nama || obj.Name || '',
          tanggal: obj.Tanggal || obj.tanggal || obj.Date || new Date().toISOString().split('T')[0],
          jam_masuk: obj.Jam_Masuk || obj.jam_masuk || obj.In || obj.ClockIn || '08:00',
          jam_pulang: obj.Jam_Pulang || obj.jam_pulang || obj.Out || obj.ClockOut || '17:00',
          jam_lembur: Number(obj.Jam_Lembur || obj.jam_lembur || obj.Overtime || 0),
          status_kehadiran: obj.Status_Kehadiran || obj.status || 'Hadir',
          catatan: obj.Catatan || obj.catatan || 'Log Tarikan Fingerprint'
        };

        // Auto calculate overtime if checkout after 17:00
        if (!mapped.jam_lembur && mapped.jam_pulang) {
          const [h, m] = mapped.jam_pulang.split(':').map(Number);
          if (h && h >= 17) {
            mapped.jam_lembur = h - 17 + (m >= 30 ? 0.5 : 0);
          }
        }

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
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Tenaga Kerja</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Jam Masuk - Pulang</th>
                  <th className="px-5 py-3.5 text-center">Jam Lembur (OT)</th>
                  <th className="px-5 py-3.5">Metode Presensi</th>
                  <th className="px-5 py-3.5">Keterangan / Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {absensiList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-700 text-xs">
                      {a.tanggal}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{a.nama_lengkap}</div>
                      <div className="text-xs text-slate-400 font-mono">{a.nik || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={a.status_kehadiran === 'Hadir' ? 'success' : a.status_kehadiran === 'Izin' ? 'warning' : 'danger'}>
                        {a.status_kehadiran}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.jam_masuk || '--:--'}</span>
                        <span className="text-slate-400">s/d</span>
                        <span className="font-semibold text-slate-900">{a.jam_pulang || '--:--'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {Number(a.jam_lembur) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          +{a.jam_lembur} Jam OT
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {a.metode === 'Mesin Fingerprint' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-brand-700 border border-blue-200">
                          <Fingerprint className="w-3.5 h-3.5 text-brand-600" />
                          Mesin Fingerprint
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                          Manual HR
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                      {a.catatan}
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
              Anda dapat mengimpor file ekspor (*.csv, *.txt, *.xlsx) dari software bawaan mesin presensi (seperti <strong>ZKTeco BioTime</strong>, <strong>Fingerspot Personnel</strong>, <strong>Solution Attendance</strong>) atau langsung dari tarikan Flashdisk USB mesin.
            </p>
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
        title="Catat Presensi & Lembur Karyawan (Manual)"
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jam Masuk
              </label>
              <input
                type="time"
                value={formData.jam_masuk}
                onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jam Pulang
              </label>
              <input
                type="time"
                value={formData.jam_pulang}
                onChange={(e) => setFormData({ ...formData, jam_pulang: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Jam Lembur (OT)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.jam_lembur}
                onChange={(e) => setFormData({ ...formData, jam_lembur: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-amber-600"
              />
            </div>
          </div>

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
              {formLoading ? 'Menyimpan...' : 'Simpan Presensi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
