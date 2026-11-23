import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Building, Phone, Mail, MapPin } from 'lucide-react';
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
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
    kode_customer: '',
    nama_customer: '',
    pic: '',
    telepon: '',
    email: '',
    alamat: '',
    termin_bayar: '30 Hari',
    plafon_kredit: 50000000,
    npwp: '',
    status: 'Aktif',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.CUSTOMERS, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setCustomers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat data customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_customer: '',
      nama_customer: '',
      pic: '',
      telepon: '',
      email: '',
      alamat: '',
      termin_bayar: '30 Hari',
      plafon_kredit: 50000000,
      npwp: '',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_customer: item.kode_customer,
      nama_customer: item.nama_customer,
      pic: item.pic || '',
      telepon: item.telepon || '',
      email: item.email || '',
      alamat: item.alamat || '',
      termin_bayar: item.termin_bayar || '30 Hari',
      plafon_kredit: item.plafon_kredit || 0,
      npwp: item.npwp || '',
      status: item.status || 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_customer.trim()) {
      toast.error('Nama customer wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.MARKETING.CUSTOMER_DETAIL(formData.id), formData);
        toast.success('Customer berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.MARKETING.CUSTOMERS, formData);
        toast.success('Customer baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan customer');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.MARKETING.CUSTOMER_DETAIL(deleteDialog.id));
      toast.success('Customer berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Customer</h1>
          <p className="text-sm text-slate-500">Kelola direktori pelanggan, termin pembayaran, dan plafon kredit.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Customer
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
          placeholder="Cari kode, nama, PIC, atau alamat..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-700 font-bold">{pagination.total}</span> Customer Terdaftar
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar customer..." />
        ) : customers.length === 0 ? (
          <EmptyState
            title="Customer tidak ditemukan"
            description={search ? `Tidak ada hasil untuk pencarian "${search}"` : 'Belum ada data customer tersimpan.'}
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Customer Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Customer</th>
                  <th className="px-6 py-4">Kontak & PIC</th>
                  <th className="px-6 py-4">Alamat Pabrik/Gudang</th>
                  <th className="px-6 py-4">Termin Bayar</th>
                  <th className="px-6 py-4">Plafon Kredit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{c.nama_customer}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-mono text-brand-600 font-semibold">{c.kode_customer}</span>
                        {c.npwp && c.npwp.trim() !== '' && c.npwp !== '-' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            PKP (Wajib PPN)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Non-Pajak (Non-PKP)
                          </span>
                        )}
                      </div>
                      {c.npwp && c.npwp !== '-' && <div className="text-[11px] text-slate-400 mt-0.5">NPWP: {c.npwp}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{c.pic || '-'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.telepon || '-'}
                      </div>
                      {c.email && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2">{c.alamat || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">{c.termin_bayar}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      Rp {Number(c.plafon_kredit || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.status === 'Aktif' ? 'success' : 'neutral'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: c.id, name: c.nama_customer })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Customer"
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

      {/* Modal Create & Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Data Customer' : 'Tambah Customer Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Customer</label>
              <input
                type="text"
                value={formData.kode_customer}
                onChange={(e) => setFormData({ ...formData, kode_customer: e.target.value })}
                placeholder="Contoh: CUST-006 (Otomatis jika kosong)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Customer / Perusahaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_customer}
                onChange={(e) => setFormData({ ...formData, nama_customer: e.target.value })}
                placeholder="PT. Indofood / PT. Mayora"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama PIC / Kontak</label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                placeholder="Bpk. Bambang"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / WA</label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="021-xxxx / 0812-xxxx"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="procurement@company.com"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Termin Pembayaran</label>
              <SearchableSelect
                value={formData.termin_bayar}
                onChange={(val) => setFormData({ ...formData, termin_bayar: val })}
                options={[
                  { value: 'Cash', label: 'Cash / Tunai' },
                  { value: '14 Hari', label: '14 Hari' },
                  { value: '30 Hari', label: '30 Hari' },
                  { value: '45 Hari', label: '45 Hari' },
                  { value: '60 Hari', label: '60 Hari' },
                  { value: '90 Hari', label: '90 Hari' },
                  { value: '120 Hari', label: '120 Hari' },
                ]}
                placeholder="Pilih termin..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plafon Kredit (Rp)</label>
              <input
                type="number"
                value={formData.plafon_kredit}
                onChange={(e) => setFormData({ ...formData, plafon_kredit: e.target.value })}
                placeholder="50000000"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Nomor NPWP & Pajak</label>
                <span className="text-[10px] text-slate-400">Kosongkan jika Non-Pajak</span>
              </div>
              <input
                type="text"
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                placeholder="01.234.567.8-011.000 (Kosongkan jika Non-PKP)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {formData.npwp && formData.npwp.trim() !== '' && formData.npwp !== '-'
                  ? '✓ Customer PKP: Default transaksi akan dikenakan PPN 11% & berhak terbit Faktur Pajak.'
                  : 'ℹ️ Customer Non-Pajak: Transaksi otomatis Non-PPN (0%) dan TIDAK akan masuk ke Faktur Pajak.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Gudang / Pabrik Pengiriman</label>
            <textarea
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Kawasan Industri MM2100, Blok C..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
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
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Data Customer"
        message={`Apakah Anda yakin ingin menghapus data customer "${deleteDialog.name}"?`}
      />
    </div>
  );
}
