import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Phone, Target, TrendingUp, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function SalesPersonsPage() {
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal Create/Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_sales: '',
    nama_sales: '',
    telepon: '',
    target_omset: 200000000,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSalesPersons = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.SALES_PERSONS, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setSalesPersons(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        } else {
          setPagination({ total: (res.data || []).length, totalPages: 1 });
        }
      }
    } catch (err) {
      toast.error('Gagal memuat data sales person: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesPersons();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_sales: '',
      nama_sales: '',
      telepon: '',
      target_omset: 200000000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_sales: item.kode_sales,
      nama_sales: item.nama_sales,
      telepon: item.telepon || '',
      target_omset: Number(item.target_omset) || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_sales.trim()) {
      toast.error('Nama Sales Person wajib diisi');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        const res = await request.put(API_ENDPOINTS.MARKETING.SALES_PERSON_DETAIL(formData.id), formData);
        if (res.success) {
          toast.success('Data Sales Person berhasil diperbarui');
          setIsModalOpen(false);
          fetchSalesPersons();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.MARKETING.SALES_PERSONS, formData);
        if (res.success) {
          toast.success('Sales Person baru berhasil ditambahkan');
          setIsModalOpen(false);
          fetchSalesPersons();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const res = await request.delete(API_ENDPOINTS.MARKETING.SALES_PERSON_DETAIL(deleteDialog.id));
      if (res.success) {
        toast.success(res.message || 'Sales Person berhasil dihapus');
        setDeleteDialog({ isOpen: false, id: null, name: '' });
        fetchSalesPersons();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus Sales Person');
    } finally {
      setDeleteLoading(false);
    }
  };

  // KPI Calculations
  const totalTargetOmset = salesPersons.reduce((sum, s) => sum + (Number(s.target_omset) || 0), 0);
  const avgTargetOmset = salesPersons.length ? Math.round(totalTargetOmset / salesPersons.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Tim Sales Person</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data staf marketing, target omset penjualan, dan nomor kontak sales pabrik.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Sales Person
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Person</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{pagination.total} Orang</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Staf marketing aktif</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Target Omset</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">
              Rp {(totalTargetOmset / 1000000).toFixed(0)} Jt
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Target tim bulan ini</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-Rata Target</div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">
              Rp {(avgTargetOmset / 1000000).toFixed(0)} Jt
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Per sales person</div>
          </div>
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
          placeholder="Cari kode, nama sales, atau telepon..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-700 font-bold">{pagination.total}</span> Sales Terdaftar
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar sales person..." />
        ) : salesPersons.length === 0 ? (
          <EmptyState
            title="Sales person tidak ditemukan"
            description={search ? `Tidak ada hasil untuk pencarian "${search}"` : 'Belum ada data sales tersimpan.'}
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Sales Person
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Sales</th>
                  <th className="px-6 py-4">Kontak / Telepon</th>
                  <th className="px-6 py-4">Target Omset Bulanan</th>
                  <th className="px-6 py-4">Status & Peran</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesPersons.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {s.nama_sales ? s.nama_sales.substring(0, 2).toUpperCase() : 'SL'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{s.nama_sales}</div>
                          <div className="text-xs font-mono text-brand-600 font-semibold mt-0.5">
                            {s.kode_sales}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {s.telepon || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-700">
                        Rp {Number(s.target_omset || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Target bulanan pabrik</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Tim Marketing
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Ubah Data Sales"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: s.id, name: s.nama_sales })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Sales"
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
          onPageChange={setPage}
          perPage={limit}
          onPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          totalItems={pagination.total}
        />
      </div>

      {/* Modal Form Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Sales Person' : 'Tambah Sales Person Baru'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kode Sales <span className="text-slate-400 font-normal lowercase">(otomatis jika kosong)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: SLS-004"
              value={formData.kode_sales}
              onChange={(e) => setFormData({ ...formData, kode_sales: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap Sales <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={formData.nama_sales}
              onChange={(e) => setFormData({ ...formData, nama_sales: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              placeholder="Contoh: 0812-3456-7890"
              value={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Target Omset Bulanan (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="1000000"
              placeholder="Contoh: 200000000"
              value={formData.target_omset}
              onChange={(e) => setFormData({ ...formData, target_omset: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-emerald-700"
            />
            <div className="text-[11px] text-slate-500 mt-1">
              Format: Rp {Number(formData.target_omset || 0).toLocaleString('id-ID')}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Sales'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Hapus Data Sales Person"
        message={`Apakah Anda yakin ingin menghapus sales person "${deleteDialog.name}"? Pastikan sales ini tidak terikat pada data Sales Order aktif.`}
        confirmText="Ya, Hapus Sales"
        confirmVariant="danger"
      />
    </div>
  );
}
