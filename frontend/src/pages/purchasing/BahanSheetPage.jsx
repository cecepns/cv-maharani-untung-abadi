import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle } from 'lucide-react';
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

export default function BahanSheetPage() {
  const [sheetList, setSheetList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
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

  // Confirm Delete
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
      flute: 'B/F',
      substansi: 'K125/M125/K125',
      panjang_mm: 1000,
      lebar_mm: 1200,
      stok_lembar: 3000,
      harga_per_lembar: 3100,
      min_stok: 500,
    });
    setIsModalOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Bahan Baku Sheet</h1>
          <p className="text-sm text-slate-500">
            Karton lembaran corrugated mentah: ukuran (P x L mm), tipe gelombang (flute), substansi, dan stok lembar.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Bahan Sheet
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari kode sheet, nama, flute, substansi..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Ukuran Sheet Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat stok lembaran sheet..." />
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
                  <th className="px-6 py-4">Flute & Substansi</th>
                  <th className="px-6 py-4">Supplier Utama</th>
                  <th className="px-6 py-4">Harga Beli / Lembar</th>
                  <th className="px-6 py-4">Stok Lembar</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sheetList.map((s) => {
                  const isLow = s.stok_lembar <= s.min_stok;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{s.nama_sheet}</div>
                        <div className="text-xs font-mono text-amber-700 mt-0.5">{s.kode_sheet}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                        {s.panjang_mm} x {s.lebar_mm} mm
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="warning">{s.flute}</Badge>
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Bahan Sheet' : 'Tambah Bahan Sheet Baru'}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Flute</label>
              <select
                value={formData.flute}
                onChange={(e) => setFormData({ ...formData, flute: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="B/F">B/F (B-Flute Single Wall)</option>
                <option value="C/F">C/F (C-Flute Single Wall)</option>
                <option value="E/F">E/F (E-Flute Micro Single Wall)</option>
                <option value="B/C">B/C (Double Wall Dua Gelombang)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lembaran Sheet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama_sheet}
              onChange={(e) => setFormData({ ...formData, nama_sheet: e.target.value })}
              placeholder="Karton Sheet B/F 1000x1200 K125/M125/K125"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Substansi Kertas</label>
              <input
                type="text"
                value={formData.substansi}
                onChange={(e) => setFormData({ ...formData, substansi: e.target.value })}
                placeholder="K125/M125/K125"
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
