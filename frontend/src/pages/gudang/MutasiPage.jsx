import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, ArrowDownRight, ArrowUpRight, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchableSelect from '../../components/common/SearchableSelect';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function MutasiPage() {
  const [mutasiList, setMutasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    tipe_barang: 'Sheet',
    barang_id: 1,
    jenis_mutasi: 'Masuk',
    qty: 100,
    keterangan: 'Stock opname / penyesuaian fisik gudang',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchMutasi = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.GUDANG.MUTASI, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setMutasiList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat kartu mutasi stok: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMutasi();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      tipe_barang: 'Sheet',
      barang_id: 1,
      jenis_mutasi: 'Masuk',
      qty: 100,
      keterangan: 'Stock opname / penyesuaian fisik gudang',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setIsEditing(true);
    setEditingId(m.id);
    setFormData({
      tipe_barang: m.tipe_barang || 'Sheet',
      barang_id: m.barang_id || 1,
      jenis_mutasi: m.jenis_mutasi || 'Masuk',
      qty: Number(m.qty) || 0,
      keterangan: m.keterangan || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.GUDANG.MUTASI_DETAIL(editingId), formData);
        toast.success('Mutasi stok berhasil diperbarui!');
      } else {
        await request.post(API_ENDPOINTS.GUDANG.PENYESUAIAN_STOK, formData);
        toast.success('Penyesuaian stok opname berhasil disimpan!');
      }
      setIsModalOpen(false);
      fetchMutasi();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan penyesuaian');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.GUDANG.MUTASI_DETAIL(deleteDialog.item.id));
      toast.success('Mutasi stok berhasil dihapus');
      setDeleteDialog({ isOpen: false, item: null });
      fetchMutasi();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus mutasi stok');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mutasi Stok & Kartu Gudang</h1>
          <p className="text-sm text-slate-500">
            Riwayat arus pergerakan barang masuk (LPB, hasil produksi), barang keluar (SPK, surat jalan), dan Stock Opname.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Penyesuaian Stok (Opname)
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
          placeholder="Cari nama barang, referensi dokumen, keterangan..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Transaksi Mutasi
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat mutasi stok..." />
        ) : mutasiList.length === 0 ? (
          <EmptyState title="Tidak ada catatan mutasi" description="Belum ada pergerakan stok barang tercatat." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tanggal Transaksi</th>
                  <th className="px-6 py-4">Nama Barang & Jenis</th>
                  <th className="px-6 py-4">Arah Mutasi</th>
                  <th className="px-6 py-4">Jumlah (Qty)</th>
                  <th className="px-6 py-4">Referensi Dokumen</th>
                  <th className="px-6 py-4">Keterangan Aktivitas</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mutasiList.map((m) => {
                  const isMasuk = m.jenis_mutasi === 'Masuk';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {m.tanggal}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{m.nama_barang}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{m.tipe_barang}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isMasuk ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {m.jenis_mutasi}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {Number(m.qty).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-xs text-brand-600">
                        {m.referensi_dokumen}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {m.keterangan}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Mutasi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, item: m })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Mutasi"
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

      {/* Modal Form Stock Opname / Edit Mutasi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Mutasi Stok Gudang' : 'Penyesuaian Stok Gudang (Stock Opname)'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Kategori Barang</label>
              <SearchableSelect
                options={[
                  { value: 'Sheet', label: 'Karton Sheet Lembaran' },
                  { value: 'BahanPembantu', label: 'Bahan Pembantu (Tinta/Lem/Kawat)' },
                  { value: 'BarangJadi', label: 'Barang Jadi (Karton Box FG)' },
                ]}
                value={formData.tipe_barang}
                onChange={(val) => setFormData({ ...formData, tipe_barang: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Penyesuaian</label>
              <SearchableSelect
                options={[
                  { value: 'Masuk', label: 'Tambah Stok (+ Masuk Fisik)' },
                  { value: 'Keluar', label: 'Kurang Stok (- Selisih / Rusak)' },
                ]}
                value={formData.jenis_mutasi}
                onChange={(val) => setFormData({ ...formData, jenis_mutasi: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Unit / Lembar / Pcs</label>
            <input
              type="number"
              min="1"
              required
              value={formData.qty}
              onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan Berita Acara Opname</label>
            <textarea
              rows={3}
              required
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Hasil stock opname bulanan gudang, selisih hitung fisik..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
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
              {formLoading ? 'Memproses...' : isEditing ? 'Simpan Perubahan' : 'Simpan Penyesuaian'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Hapus Mutasi */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Hapus Catatan Mutasi Stok"
        message={`Apakah Anda yakin ingin menghapus mutasi stok untuk "${deleteDialog.item?.nama_barang}" (${deleteDialog.item?.referensi_dokumen})? Tindakan ini akan membatalkan efek pergerakan stok barang.`}
      />
    </div>
  );
}
