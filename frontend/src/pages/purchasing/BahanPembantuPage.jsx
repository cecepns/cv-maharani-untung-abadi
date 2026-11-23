import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Scissors, Box, Layers, Tag } from 'lucide-react';
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
import SearchableSelect from '../../components/common/SearchableSelect';

export default function BahanPembantuPage() {
  const [bahanList, setBahanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Kategori Dinamis State
  const [kategoriList, setKategoriList] = useState([]);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState('');
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [deleteKategoriDialog, setDeleteKategoriDialog] = useState({ isOpen: false, id: null, name: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_bahan: '',
    nama_bahan: '',
    kategori: 'Tinta Flexo',
    satuan: 'Kg',
    stok: 50,
    harga_satuan: 40000,
    min_stok: 10,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchKategori = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.GUDANG.KATEGORI_PEMBANTU);
      if (res.success && Array.isArray(res.data)) {
        setKategoriList(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const fetchBahan = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.BAHAN_PEMBANTU, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setBahanList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat bahan pembantu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  useEffect(() => {
    fetchBahan();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_bahan: '',
      nama_bahan: '',
      kategori: kategoriList.length > 0 ? kategoriList[0].nama_kategori : 'Tinta Flexo',
      satuan: 'Kg',
      stok: 50,
      harga_satuan: 40000,
      min_stok: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_bahan: item.kode_bahan,
      nama_bahan: item.nama_bahan,
      kategori: item.kategori || 'Tinta Flexo',
      satuan: item.satuan || 'Kg',
      stok: item.stok || 0,
      harga_satuan: item.harga_satuan || 0,
      min_stok: item.min_stok || 10,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_bahan.trim()) {
      toast.error('Nama bahan wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.PURCHASING.BAHAN_PEMBANTU_DETAIL(formData.id), formData);
        toast.success('Bahan pembantu berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PURCHASING.BAHAN_PEMBANTU, formData);
        toast.success('Bahan pembantu baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchBahan();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan bahan pembantu');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PURCHASING.BAHAN_PEMBANTU_DETAIL(deleteDialog.id));
      toast.success('Bahan pembantu berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchBahan();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus bahan pembantu');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddKategori = async (e) => {
    e.preventDefault();
    if (!newKategoriName.trim()) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }
    try {
      setKategoriLoading(true);
      const res = await request.post(API_ENDPOINTS.GUDANG.KATEGORI_PEMBANTU, {
        nama_kategori: newKategoriName.trim(),
      });
      if (res.success) {
        toast.success(`Kategori "${newKategoriName}" berhasil ditambahkan`);
        setNewKategoriName('');
        fetchKategori();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan kategori');
    } finally {
      setKategoriLoading(false);
    }
  };

  const handleDeleteKategori = async () => {
    try {
      setKategoriLoading(true);
      const res = await request.delete(
        API_ENDPOINTS.GUDANG.KATEGORI_PEMBANTU_DETAIL(deleteKategoriDialog.id)
      );
      if (res.success) {
        toast.success(`Kategori "${deleteKategoriDialog.name}" berhasil dihapus`);
        setDeleteKategoriDialog({ isOpen: false, id: null, name: '' });
        fetchKategori();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus kategori');
    } finally {
      setKategoriLoading(false);
    }
  };

  // Kategori Options untuk Dropdown
  const categoryOptions = kategoriList.map((k) => ({
    value: k.nama_kategori,
    label: k.nama_kategori,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Bahan Pembantu</h1>
          <p className="text-sm text-slate-500">
            Material produksi kardus: Tinta Flexo waterbased, Lem Poly perekat, Kawat Stitching, Plat Polimer, Pisau Pond, dan Strapping Band.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsKategoriModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-all"
          >
            <Tag className="w-4 h-4 text-brand-600" />
            Kelola Kategori
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Bahan Pembantu
          </button>
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
          placeholder="Cari nama bahan pembantu, kategori..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Material Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat stok bahan pembantu..." />
        ) : bahanList.length === 0 ? (
          <EmptyState
            title="Bahan pembantu tidak ditemukan"
            description="Belum ada data material tambahan yang tersimpan."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Bahan Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Material</th>
                  <th className="px-6 py-4">Kategori Bahan</th>
                  <th className="px-6 py-4">Satuan Ukur</th>
                  <th className="px-6 py-4">Harga Beli Standar</th>
                  <th className="px-6 py-4">Stok Terkini</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bahanList.map((b) => {
                  const isLow = b.stok <= b.min_stok;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{b.nama_bahan}</div>
                        <div className="text-xs font-mono text-brand-600 mt-0.5">{b.kode_bahan}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            b.kategori === 'Tinta Flexo'
                              ? 'primary'
                              : b.kategori === 'Lem Karton'
                              ? 'warning'
                              : b.kategori === 'Kawat Stitching'
                              ? 'purple'
                              : 'slate'
                          }
                        >
                          {b.kategori}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {b.satuan}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        Rp {Number(b.harga_satuan).toLocaleString('id-ID')} / {b.satuan}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {Number(b.stok).toLocaleString('id-ID')} {b.satuan}
                        </span>
                        {isLow && (
                          <div className="text-[10px] text-rose-500 font-semibold mt-0.5">Segera Restock</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Bahan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: b.id, name: b.nama_bahan })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Bahan"
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

      {/* Modal Form Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Bahan Pembantu' : 'Tambah Bahan Pembantu Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Bahan</label>
              <input
                type="text"
                value={formData.kode_bahan}
                onChange={(e) => setFormData({ ...formData, kode_bahan: e.target.value })}
                placeholder="BHP-007 (Otomatis jika kosong)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Bahan</label>
              <SearchableSelect
                options={categoryOptions}
                value={formData.kategori}
                onChange={(val) => setFormData({ ...formData, kategori: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Bahan Material <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama_bahan}
              onChange={(e) => setFormData({ ...formData, nama_bahan: e.target.value })}
              placeholder="Tinta Flexo Hijau Tua / Kawat Stitch No. 17 / Pisau Pond"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Ukur</label>
              <SearchableSelect
                options={[
                  { value: 'Kg', label: 'Kg (Kilogram)' },
                  { value: 'Roll', label: 'Roll (Gulungan)' },
                  { value: 'Galon', label: 'Galon / Pail' },
                  { value: 'Pcs', label: 'Pcs / Batang' },
                  { value: 'Set', label: 'Set / Pasang' },
                  { value: 'Meter', label: 'Meter' },
                ]}
                value={formData.satuan}
                onChange={(val) => setFormData({ ...formData, satuan: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                value={formData.harga_satuan}
                onChange={(e) => setFormData({ ...formData, harga_satuan: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Awal</label>
              <input
                type="number"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Minimum Stok</label>
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
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Bahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kelola Kategori Bahan */}
      <Modal
        isOpen={isKategoriModalOpen}
        onClose={() => setIsKategoriModalOpen(false)}
        title="Kelola Kategori Bahan Pembantu"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tambahkan atau kelola kategori master bahan penolong pabrik karton box & percetakan offset.
          </p>

          <form onSubmit={handleAddKategori} className="flex gap-2">
            <input
              type="text"
              value={newKategoriName}
              onChange={(e) => setNewKategoriName(e.target.value)}
              placeholder="Nama Kategori Baru..."
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={kategoriLoading || !newKategoriName.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </form>

          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {kategoriList.map((k) => (
              <div key={k.id || k.nama_kategori} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-800">{k.nama_kategori}</span>
                </div>
                {k.id && (
                  <button
                    type="button"
                    onClick={() => setDeleteKategoriDialog({ isOpen: true, id: k.id, name: k.nama_kategori })}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsKategoriModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Material Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Bahan Pembantu"
        message={`Apakah Anda yakin ingin menghapus data material "${deleteDialog.name}"?`}
      />

      {/* Confirm Delete Kategori Dialog */}
      <ConfirmDialog
        isOpen={deleteKategoriDialog.isOpen}
        onClose={() => setDeleteKategoriDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDeleteKategori}
        isLoading={kategoriLoading}
        title="Hapus Kategori Bahan"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteKategoriDialog.name}"?`}
      />
    </div>
  );
}
