import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SearchableSelect from '../../components/common/SearchableSelect';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function COAPage() {
  const [coaList, setCoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    kode_akun: '',
    nama_akun: '',
    kategori: 'Kas & Bank',
    saldo_normal: 'Debet',
    saldo_berjalan: 0
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCOA();
  }, []);

  const fetchCOA = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.COA);
      if (res.success) {
        setCoaList(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat Chart of Accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      kode_akun: '',
      nama_akun: '',
      kategori: 'Kas & Bank',
      saldo_normal: 'Debet',
      saldo_berjalan: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setEditingId(c.id);
    setFormData({
      kode_akun: c.kode_akun,
      nama_akun: c.nama_akun,
      kategori: c.kategori,
      saldo_normal: c.saldo_normal,
      saldo_berjalan: Number(c.saldo_berjalan) || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.ACCOUNTING.COA_DETAIL(editingId), formData);
        toast.success('Akun perkiraan berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.ACCOUNTING.COA, formData);
        toast.success('Akun perkiraan baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchCOA();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan akun COA');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.ACCOUNTING.COA_DETAIL(deleteDialog.item.id));
      toast.success('Akun perkiraan berhasil dihapus');
      setDeleteDialog({ isOpen: false, item: null });
      fetchCOA();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus akun COA');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = coaList.filter(c =>
    (c.kode_akun || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.nama_akun || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.kategori || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chart of Accounts (Bagan Akun Standar)</h1>
          <p className="text-sm text-slate-500">
            Daftar kode perkiraan akuntansi standar CV. Maharani Untung Abadi (Kas & Bank, Piutang, Persediaan, Aktiva, Hutang, Modal, Pendapatan, HPP, Beban).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Akun COA
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Cari kode akun, nama perkiraan, kategori..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{filtered.length}</span> Akun Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat akun buku besar..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode Akun</th>
                  <th className="px-6 py-4">Nama Perkiraan Akun</th>
                  <th className="px-6 py-4">Kategori Finansial</th>
                  <th className="px-6 py-4">Saldo Normal</th>
                  <th className="px-6 py-4 text-right">Saldo Berjalan Saat Ini</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600">
                      {c.kode_akun}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {c.nama_akun}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          c.kategori === 'Kas & Bank'
                            ? 'primary'
                            : c.kategori === 'Pendapatan'
                            ? 'success'
                            : c.kategori === 'HPP'
                            ? 'warning'
                            : c.kategori === 'Beban Operasional'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {c.kategori}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {c.saldo_normal}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      Rp {Number(c.saldo_berjalan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, item: c })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Akun"
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
      </div>

      {/* Modal Form Tambah / Edit COA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Akun Perkiraan (COA)' : 'Tambah Akun Perkiraan (COA)'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Akun <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.kode_akun}
                onChange={(e) => setFormData({ ...formData, kode_akun: e.target.value })}
                placeholder="Contoh: 1101 / 5102"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saldo Normal
              </label>
              <SearchableSelect
                options={[
                  { value: 'Debet', label: 'Debet (+)' },
                  { value: 'Kredit', label: 'Kredit (+)' },
                ]}
                value={formData.saldo_normal}
                onChange={(val) => setFormData({ ...formData, saldo_normal: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perkiraan Akun <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama_akun}
              onChange={(e) => setFormData({ ...formData, nama_akun: e.target.value })}
              placeholder="Contoh: Kas Kasir Operasional Pabrik"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Finansial
              </label>
              <SearchableSelect
                options={[
                  { value: 'Kas & Bank', label: 'Kas & Bank' },
                  { value: 'Piutang', label: 'Piutang Usaha' },
                  { value: 'Persediaan', label: 'Persediaan Barang' },
                  { value: 'Aktiva Tetap', label: 'Aktiva Tetap' },
                  { value: 'Hutang Lancar', label: 'Hutang Lancar' },
                  { value: 'Modal', label: 'Modal / Ekuitas' },
                  { value: 'Pendapatan', label: 'Pendapatan Penjualan' },
                  { value: 'HPP', label: 'Harga Pokok Produksi (HPP)' },
                  { value: 'Beban Operasional', label: 'Beban Operasional' },
                ]}
                value={formData.kategori}
                onChange={(val) => setFormData({ ...formData, kategori: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saldo Awal Berjalan (Rp)
              </label>
              <input
                type="number"
                value={formData.saldo_berjalan}
                onChange={(e) => setFormData({ ...formData, saldo_berjalan: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold"
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
              {formLoading ? 'Memproses...' : isEditing ? 'Simpan Perubahan' : 'Tambah Akun'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Hapus COA */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Hapus Akun Perkiraan (COA)"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteDialog.item?.kode_akun} - ${deleteDialog.item?.nama_akun}"? Tindakan ini tidak dapat dibatalkan jika akun memiliki catatan pembukuan.`}
      />
    </div>
  );
}
