import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle, Sliders, Info, CheckCircle2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const DEFAULT_TIPE = [
  { id: 1, kode: 'B/F', nama_tipe: 'B/F (B-Flute Single Wall ~3mm)', kategori: 'Corrugated', keterangan: 'Standard box packaging umum' },
  { id: 2, kode: 'C/F', nama_tipe: 'C/F (C-Flute Single Wall ~4mm)', kategori: 'Corrugated', keterangan: 'Daya tumpuk kuat beban berat' },
  { id: 3, kode: 'E/F', nama_tipe: 'E/F (E-Flute Micro Single Wall ~1.5mm)', kategori: 'Corrugated', keterangan: 'Kotak pizza, hampers & box halus' },
  { id: 4, kode: 'B/C', nama_tipe: 'B/C (Double Wall Dua Gelombang ~7mm)', kategori: 'Corrugated', keterangan: 'Dus sparepart mesin & buah ekspor' },
  { id: 5, kode: 'Duplex', nama_tipe: 'Duplex (Karton Box Makanan/Farmasi)', kategori: 'Paperboard Solid', keterangan: 'Coated white back grey (250-450 gsm)' },
  { id: 6, kode: 'Ivory', nama_tipe: 'Ivory (Karton Food Grade / Kosmetik)', kategori: 'Paperboard Solid', keterangan: 'White both sides premium higienis' },
  { id: 7, kode: 'Kraft', nama_tipe: 'Kraft (Kertas Coklat Polos)', kategori: 'Paperboard Solid', keterangan: 'Kraft liner / dus eco-friendly' },
];

export default function BahanSheetPage() {
  const [sheetList, setSheetList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Tipe Bahan State (Duplex, Ivory, B/F, C/F, dll.)
  const [tipeList, setTipeList] = useState(DEFAULT_TIPE);
  const [isTipeModalOpen, setIsTipeModalOpen] = useState(false);
  const [isEditingTipe, setIsEditingTipe] = useState(false);
  const [tipeFormData, setTipeFormData] = useState({
    id: null,
    kode: '',
    nama_tipe: '',
    kategori: 'Corrugated',
    keterangan: '',
  });
  const [tipeFormLoading, setTipeFormLoading] = useState(false);
  const [deleteTipeDialog, setDeleteTipeDialog] = useState({ isOpen: false, id: null, kode: '' });
  const [deleteTipeLoading, setDeleteTipeLoading] = useState(false);

  // Modal Sheet State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_sheet: '',
    nama_sheet: '',
    supplier_id: '',
    flute: 'B/F',
    substansi: 'K125/M125/K125',
    panjang_mm: 1000,
    lebar_mm: 1200,
    stok_lembar: 3000,
    harga_per_lembar: 3100,
    min_stok: 500,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete Sheet
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PURCHASING.SUPPLIERS, { limit: 100 });
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTipeList = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PURCHASING.TIPE_SHEET, { all: 'true' });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTipeList(res.data);
      }
    } catch (err) {
      console.error('Fetch tipe sheet:', err);
    }
  };

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.BAHAN_SHEET, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setSheetList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat bahan sheet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchTipeList();
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_sheet: '',
      nama_sheet: '',
      supplier_id: suppliers.length ? suppliers[0].id : '',
      flute: tipeList.length ? tipeList[0].kode : 'B/F',
      substansi: 'K125/M125/K125',
      panjang_mm: 1000,
      lebar_mm: 1200,
      stok_lembar: 3000,
      harga_per_lembar: 3100,
      min_stok: 500,
    });
    setIsModalOpen(true);
  };

  const handleApplyOffcutTemplate = () => {
    setFormData((prev) => ({
      ...prev,
      nama_sheet: prev.nama_sheet.startsWith('[OFFCUT]') ? prev.nama_sheet : `[OFFCUT] Sisa Potongan Sheet ${prev.panjang_mm}x${prev.lebar_mm}`,
      harga_per_lembar: 0,
    }));
    toast.success('Template Sisa Potongan diterapkan (Harga Beli Rp 0 untuk efisiensi SPK)');
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_sheet: item.kode_sheet,
      nama_sheet: item.nama_sheet,
      supplier_id: item.supplier_id || (suppliers.length ? suppliers[0].id : ''),
      flute: item.flute || 'B/F',
      substansi: item.substansi || 'K125/M125/K125',
      panjang_mm: item.panjang_mm || 1000,
      lebar_mm: item.lebar_mm || 1200,
      stok_lembar: item.stok_lembar || 0,
      harga_per_lembar: item.harga_per_lembar || 0,
      min_stok: item.min_stok || 500,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_sheet.trim()) {
      toast.error('Nama sheet wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.PURCHASING.BAHAN_SHEET_DETAIL(formData.id), formData);
        toast.success('Bahan sheet berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PURCHASING.BAHAN_SHEET, formData);
        toast.success('Bahan sheet baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchSheets();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan bahan sheet');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PURCHASING.BAHAN_SHEET_DETAIL(deleteDialog.id));
      toast.success('Bahan sheet berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchSheets();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus sheet');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ----------------------------------------------------
  // Tipe Bahan CRUD Handlers
  // ----------------------------------------------------
  const handleResetTipeForm = () => {
    setIsEditingTipe(false);
    setTipeFormData({
      id: null,
      kode: '',
      nama_tipe: '',
      kategori: 'Corrugated',
      keterangan: '',
    });
  };

  const handleEditTipe = (t) => {
    setIsEditingTipe(true);
    setTipeFormData({
      id: t.id,
      kode: t.kode,
      nama_tipe: t.nama_tipe,
      kategori: t.kategori || 'Corrugated',
      keterangan: t.keterangan || '',
    });
  };

  const handleSaveTipe = async (e) => {
    e.preventDefault();
    if (!tipeFormData.kode.trim() || !tipeFormData.nama_tipe.trim()) {
      toast.error('Kode dan Nama Tipe Bahan wajib diisi!');
      return;
    }

    try {
      setTipeFormLoading(true);
      if (isEditingTipe) {
        await request.put(API_ENDPOINTS.PURCHASING.TIPE_SHEET_DETAIL(tipeFormData.id), tipeFormData);
        toast.success(`Tipe bahan ${tipeFormData.kode} berhasil diperbarui`);
      } else {
        await request.post(API_ENDPOINTS.PURCHASING.TIPE_SHEET, tipeFormData);
        toast.success(`Tipe bahan baru ${tipeFormData.kode} berhasil ditambahkan`);
      }
      handleResetTipeForm();
      fetchTipeList();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan tipe bahan');
    } finally {
      setTipeFormLoading(false);
    }
  };

  const confirmDeleteTipe = async () => {
    try {
      setDeleteTipeLoading(true);
      await request.delete(API_ENDPOINTS.PURCHASING.TIPE_SHEET_DETAIL(deleteTipeDialog.id));
      toast.success(`Tipe bahan ${deleteTipeDialog.kode} berhasil dihapus`);
      setDeleteTipeDialog({ isOpen: false, id: null, kode: '' });
      fetchTipeList();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus tipe bahan');
    } finally {
      setDeleteTipeLoading(false);
    }
  };

  const getFluteBadgeVariant = (flute) => {
    if (flute === 'Duplex') return 'purple';
    if (flute === 'Ivory') return 'success';
    if (flute === 'Kraft') return 'default';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Bahan Baku Sheet & Karton</h1>
          <p className="text-sm text-slate-500">
            Karton lembaran corrugated (B/F, C/F, E/F, B/C), Duplex, Ivory, ukuran (P x L mm), substansi, dan stok lembar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              handleResetTipeForm();
              setIsTipeModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            Kelola Tipe Bahan (Duplex/Ivory/Flute)
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Bahan Sheet
          </button>
        </div>
      </div>

      {/* Info Banner Alur Sisa Potongan / Offcut Layak Pakai */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white p-4 rounded-2xl border border-amber-200/60 shadow-sm flex items-start gap-3.5">
        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-700 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>Alur Pengelolaan Sisa Potongan Sheet (Offcut Layak Pakai)</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
              SOP Efisiensi Produksi
            </span>
          </div>
          <p className="leading-relaxed">
            Jika proses potong SPK menyisakan lembaran sheet yang masih lebar (misal <strong>3/4 terpakai</strong> untuk box utama, dan <strong>1/4 sisa layak pakai</strong> untuk box kecil / partisi), catat sisa tersebut di sini dengan nama diawali <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-900 font-semibold font-mono">[OFFCUT]</code> dan harga beli <strong>Rp 0</strong>. Saat PPIC membuat SPK baru untuk box ukuran kecil, bahan sisa offcut ini langsung dapat dipilih di menu SPK!
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari kode sheet, nama, flute/duplex/ivory, substansi..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Ukuran Sheet & Karton Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat stok lembaran sheet & karton..." />
        ) : sheetList.length === 0 ? (
          <EmptyState
            title="Bahan sheet tidak ditemukan"
            description="Belum ada ukuran sheet karton yang tersimpan."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Sheet Baru
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Deskripsi Sheet</th>
                  <th className="px-6 py-4">Ukuran (P x L mm)</th>
                  <th className="px-6 py-4">Tipe & Substansi</th>
                  <th className="px-6 py-4">Supplier Utama</th>
                  <th className="px-6 py-4">Harga Beli / Lembar</th>
                  <th className="px-6 py-4">Stok Lembar</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sheetList.map((s) => {
                  const isLow = Number(s.stok_lembar) <= Number(s.min_stok);
                  const isOffcut = s.nama_sheet.toUpperCase().includes('[OFFCUT]');
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{s.nama_sheet}</span>
                          {isOffcut && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                              Sisa Offcut
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-amber-700 mt-0.5">{s.kode_sheet}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                        {s.panjang_mm} x {s.lebar_mm} mm
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getFluteBadgeVariant(s.flute)}>{s.flute}</Badge>
                        <div className="text-xs font-medium text-slate-600 mt-0.5">{s.substansi}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {s.supplier_nama || 'PT. Fajar Surya Wisesa'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        Rp {Number(s.harga_per_lembar).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {Number(s.stok_lembar).toLocaleString('id-ID')} Lbr
                        </span>
                        {isLow && (
                          <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Stok menipis</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Sheet"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: s.id, name: s.nama_sheet })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Sheet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Modal Form Tambah / Edit Sheet */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Bahan Sheet & Karton' : 'Tambah Bahan Sheet & Karton Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Sheet</label>
              <input
                type="text"
                value={formData.kode_sheet}
                onChange={(e) => setFormData({ ...formData, kode_sheet: e.target.value })}
                placeholder="BBS-005 (Otomatis jika kosong)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Tipe Bahan / Flute</label>
                <button
                  type="button"
                  onClick={() => setIsTipeModalOpen(true)}
                  className="text-[11px] text-amber-700 hover:underline font-semibold"
                >
                  + Kelola Tipe
                </button>
              </div>
              <select
                value={formData.flute}
                onChange={(e) => setFormData({ ...formData, flute: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20"
              >
                {(tipeList.length > 0 ? tipeList : DEFAULT_TIPE).map((t) => (
                  <option key={t.id || t.kode} value={t.kode}>
                    {t.kode} - {t.nama_tipe} ({t.kategori || 'Corrugated'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Nama Lembaran Sheet <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleApplyOffcutTemplate}
                className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded font-semibold transition-colors"
                title="Tandai sebagai sisa potongan SPK layak pakai dengan harga Rp 0"
              >
                + Template Sisa Offcut
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.nama_sheet}
              onChange={(e) => setFormData({ ...formData, nama_sheet: e.target.value })}
              placeholder="Contoh: Karton Sheet B/F 1000x1200 / [OFFCUT] Sheet 1000x250"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang (mm)</label>
              <input
                type="number"
                value={formData.panjang_mm}
                onChange={(e) => setFormData({ ...formData, panjang_mm: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lebar (mm)</label>
              <input
                type="number"
                value={formData.lebar_mm}
                onChange={(e) => setFormData({ ...formData, lebar_mm: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Substansi / Gramatur</label>
              <input
                type="text"
                value={formData.substansi}
                onChange={(e) => setFormData({ ...formData, substansi: e.target.value })}
                placeholder="K125/M125/K125 atau 310 gsm"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Sheet</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_supplier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Beli / Lembar</label>
              <input
                type="number"
                value={formData.harga_per_lembar}
                onChange={(e) => setFormData({ ...formData, harga_per_lembar: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 italic">Isi 0 jika sisa offcut</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Lembar</label>
              <input
                type="number"
                value={formData.stok_lembar}
                onChange={(e) => setFormData({ ...formData, stok_lembar: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Min Stok</label>
              <input
                type="number"
                value={formData.min_stok}
                onChange={(e) => setFormData({ ...formData, min_stok: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Sheet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kelola Master Tipe Bahan (Duplex / Ivory / Corrugated) */}
      <Modal
        isOpen={isTipeModalOpen}
        onClose={() => setIsTipeModalOpen(false)}
        title="Kelola Master Tipe Bahan Sheet & Karton"
        size="lg"
      >
        <div className="space-y-6">
          {/* Form Tambah/Edit Tipe */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isEditingTipe ? `Edit Tipe Bahan: ${tipeFormData.kode}` : 'Tambah Pilihan Tipe Bahan Baru'}
              </h3>
              {isEditingTipe && (
                <button
                  type="button"
                  onClick={handleResetTipeForm}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Batal Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSaveTipe} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Singkat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Duplex / Ivory / E/F"
                    value={tipeFormData.kode}
                    onChange={(e) => setTipeFormData({ ...tipeFormData, kode: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama / Deskripsi Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Karton Duplex Coated 310g"
                    value={tipeFormData.nama_tipe}
                    onChange={(e) => setTipeFormData({ ...tipeFormData, nama_tipe: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={tipeFormData.kategori}
                    onChange={(e) => setTipeFormData({ ...tipeFormData, kategori: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl"
                  >
                    <option value="Corrugated">Corrugated (Bergelombang)</option>
                    <option value="Paperboard Solid">Paperboard Solid (Duplex/Ivory/Art Paper)</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Keterangan kegunaan (contoh: Kemasan box makanan, dus farmasi, atau box pizza)"
                  value={tipeFormData.keterangan}
                  onChange={(e) => setTipeFormData({ ...tipeFormData, keterangan: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={tipeFormLoading}
                  className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  {tipeFormLoading ? 'Menyimpan...' : isEditingTipe ? 'Simpan Perubahan' : '+ Tambah Tipe'}
                </button>
              </div>
            </form>
          </div>

          {/* List Tipe Bahan Terdaftar */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Daftar Tipe Bahan Terdaftar ({tipeList.length})
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Kode</th>
                    <th className="px-4 py-2.5">Nama Tipe</th>
                    <th className="px-4 py-2.5">Kategori</th>
                    <th className="px-4 py-2.5">Keterangan</th>
                    <th className="px-4 py-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tipeList.map((t) => (
                    <tr key={t.id || t.kode} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-bold text-slate-900 font-mono">
                        <Badge variant={getFluteBadgeVariant(t.kode)}>{t.kode}</Badge>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{t.nama_tipe}</td>
                      <td className="px-4 py-2.5 text-slate-600">{t.kategori || 'Corrugated'}</td>
                      <td className="px-4 py-2.5 text-slate-500 italic max-w-xs truncate">{t.keterangan || '-'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditTipe(t)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTipeDialog({ isOpen: true, id: t.id, kode: t.kode })}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsTipeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Tipe */}
      <ConfirmDialog
        isOpen={deleteTipeDialog.isOpen}
        onClose={() => setDeleteTipeDialog({ isOpen: false, id: null, kode: '' })}
        onConfirm={confirmDeleteTipe}
        isLoading={deleteTipeLoading}
        title="Hapus Tipe Bahan"
        message={`Apakah Anda yakin ingin menghapus pilihan tipe bahan "${deleteTipeDialog.kode}"? Data bahan sheet yang sudah menggunakan tipe ini tidak akan terhapus.`}
      />

      {/* Confirm Delete Sheet */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Bahan Sheet"
        message={`Apakah Anda yakin ingin menghapus data sheet "${deleteDialog.name}"?`}
      />
    </div>
  );
}
