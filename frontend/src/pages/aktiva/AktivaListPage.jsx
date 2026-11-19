import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Landmark, RefreshCw } from 'lucide-react';
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

export default function AktivaListPage() {
  const [aktivaList, setAktivaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_aktiva: '',
    nama_aktiva: '',
    kategori: 'Mesin Pabrik',
    tanggal_perolehan: new Date().toISOString().split('T')[0],
    harga_perolehan: 150000000,
    umur_ekonomis_tahun: 8,
    nilai_residu: 10000000,
  });
  const [formLoading, setFormLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAktiva = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.AKTIVA.LIST, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setAktivaList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat daftar aktiva tetap: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAktiva();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_aktiva: '',
      nama_aktiva: '',
      kategori: 'Mesin Pabrik',
      tanggal_perolehan: new Date().toISOString().split('T')[0],
      harga_perolehan: 120000000,
      umur_ekonomis_tahun: 8,
      nilai_residu: 10000000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_aktiva: item.kode_aktiva,
      nama_aktiva: item.nama_aktiva,
      kategori: item.kategori || 'Mesin Pabrik',
      tanggal_perolehan: item.tanggal_perolehan,
      harga_perolehan: item.harga_perolehan,
      umur_ekonomis_tahun: item.umur_ekonomis_tahun,
      nilai_residu: item.nilai_residu,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_aktiva.trim()) {
      toast.error('Nama aktiva wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.AKTIVA.DETAIL(formData.id), formData);
        toast.success('Data aktiva berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.AKTIVA.LIST, formData);
        toast.success('Aktiva baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchAktiva();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan aktiva');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.AKTIVA.DETAIL(deleteDialog.id));
      toast.success('Aktiva berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchAktiva();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus aktiva');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Aktiva Tetap Pabrik</h1>
          <p className="text-sm text-slate-500">
            Aset mesin flexo, mesin pond rotary, mesin stitching, truk box armada, dan forklift operasional.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Aset / Aktiva Baru
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
          placeholder="Cari nama aset, kategori, kode..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Aktiva Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar inventaris aset..." />
        ) : aktivaList.length === 0 ? (
          <EmptyState title="Tidak ada aktiva tetap" description="Belum ada data mesin atau kendaraan tercatat." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Aktiva</th>
                  <th className="px-6 py-4">Kategori Aset</th>
                  <th className="px-6 py-4">Tgl Perolehan</th>
                  <th className="px-6 py-4 text-right">Harga Perolehan</th>
                  <th className="px-6 py-4 text-right">Akumulasi Depresiasi</th>
                  <th className="px-6 py-4 text-right">Nilai Buku Saat Ini</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aktivaList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{a.nama_aktiva}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{a.kode_aktiva}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{a.kategori}</Badge>
                      <div className="text-[11px] text-slate-400 mt-0.5">{a.umur_ekonomis_tahun} Tahun Ekonomis</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs font-medium">
                      {a.tanggal_perolehan}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      Rp {Number(a.harga_perolehan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-rose-600">
                      Rp {Number(a.akumulasi_penyusutan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-brand-700 text-base">
                      Rp {Number(a.nilai_buku).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Aset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: a.id, name: a.nama_aktiva })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Aset"
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
        title={isEditing ? 'Ubah Data Aktiva Tetap' : 'Tambah Aktiva Tetap Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Aktiva / Mesin / Kendaraan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama_aktiva}
              onChange={(e) => setFormData({ ...formData, nama_aktiva: e.target.value })}
              placeholder="Mesin Flexo Printing 2 Warna / Truk Box Isuzu"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Aktiva</label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="Mesin Pabrik">Mesin Pabrik</option>
                <option value="Kendaraan Operasional">Kendaraan Operasional</option>
                <option value="Kendaraan Pabrik">Kendaraan Pabrik (Forklift)</option>
                <option value="Peralatan Kantor">Peralatan Kantor & Komputer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Perolehan</label>
              <input
                type="date"
                value={formData.tanggal_perolehan}
                onChange={(e) => setFormData({ ...formData, tanggal_perolehan: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Beli (Rp)</label>
              <input
                type="number"
                required
                value={formData.harga_perolehan}
                onChange={(e) => setFormData({ ...formData, harga_perolehan: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Masa Manfaat (Thn)</label>
              <input
                type="number"
                min="1"
                value={formData.umur_ekonomis_tahun}
                onChange={(e) => setFormData({ ...formData, umur_ekonomis_tahun: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai Residu (Rp)</label>
              <input
                type="number"
                value={formData.nilai_residu}
                onChange={(e) => setFormData({ ...formData, nilai_residu: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
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
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Aset'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Aktiva Tetap"
        message={`Apakah Anda yakin ingin menghapus data aset "${deleteDialog.name}"?`}
      />
    </div>
  );
}
