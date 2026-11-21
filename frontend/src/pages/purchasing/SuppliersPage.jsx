import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_supplier: '',
    nama_supplier: '',
    kategori: 'Sheet Kertas',
    kontak: '',
    telepon: '',
    email: '',
    alamat: '',
    termin_bayar: '30 Hari',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.SUPPLIERS, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setSuppliers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat supplier: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_supplier: '',
      nama_supplier: '',
      kategori: 'Sheet Kertas',
      kontak: '',
      telepon: '',
      email: '',
      alamat: '',
      termin_bayar: '30 Hari',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_supplier: item.kode_supplier,
      nama_supplier: item.nama_supplier,
      kategori: item.kategori || 'Sheet Kertas',
      kontak: item.kontak || '',
      telepon: item.telepon || '',
      email: item.email || '',
      alamat: item.alamat || '',
      termin_bayar: item.termin_bayar || '30 Hari',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_supplier.trim()) {
      toast.error('Nama supplier wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.PURCHASING.SUPPLIER_DETAIL(formData.id), formData);
        toast.success('Data supplier berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PURCHASING.SUPPLIERS, formData);
        toast.success('Supplier baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan supplier');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PURCHASING.SUPPLIER_DETAIL(deleteDialog.id));
      toast.success('Supplier berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchSuppliers();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus supplier');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Supplier</h1>
          <p className="text-sm text-slate-500">
            Daftar pemasok karton sheet, tinta flexo, lem poly, kawat stitch, dan packaging logistik.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Supplier
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
          placeholder="Cari kode, nama supplier, kategori, alamat..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Rekanan Supplier
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar supplier..." />
        ) : suppliers.length === 0 ? (
          <EmptyState
            title="Supplier tidak ditemukan"
            description="Belum ada data supplier yang tersimpan."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Rekanan Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nama Supplier & Kode</th>
                  <th className="px-6 py-4">Kategori Bahan</th>
                  <th className="px-6 py-4">Kontak & PIC</th>
                  <th className="px-6 py-4">Alamat Pabrik / Gudang</th>
                  <th className="px-6 py-4">Termin Bayar</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{s.nama_supplier}</div>
                      <div className="text-xs font-mono text-amber-700 mt-0.5">{s.kode_supplier}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          s.kategori === 'Sheet Kertas'
                            ? 'warning'
                            : s.kategori === 'Tinta Flexo'
                            ? 'primary'
                            : 'purple'
                        }
                      >
                        {s.kategori}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{s.kontak || '-'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {s.telepon || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2">{s.alamat || '-'}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {s.termin_bayar}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: s.id, name: s.nama_supplier })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Supplier"
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
        title={isEditing ? 'Ubah Data Supplier' : 'Tambah Supplier Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Supplier</label>
              <input
                type="text"
                value={formData.kode_supplier}
                onChange={(e) => setFormData({ ...formData, kode_supplier: e.target.value })}
                placeholder="Contoh: SUPP-005 (Otomatis jika kosong)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Bahan</label>
              <SearchableSelect
                options={[
                  { value: 'Sheet Kertas', label: 'Sheet Kertas Corrugated' },
                  { value: 'Tinta Flexo', label: 'Tinta Flexo Waterbased' },
                  { value: 'Lem & Kawat', label: 'Lem Poly & Kawat Stitching' },
                  { value: 'Packaging & Logistik', label: 'Packaging & Logistik' },
                ]}
                value={formData.kategori}
                onChange={(val) => setFormData({ ...formData, kategori: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Supplier / Perusahaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama_supplier}
              onChange={(e) => setFormData({ ...formData, nama_supplier: e.target.value })}
              placeholder="PT. Fajar Surya Wisesa / RAPP"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kontak / PIC</label>
              <input
                type="text"
                value={formData.kontak}
                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                placeholder="Bpk. Gunawan"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="021-xxxx / 0812-xxxx"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sales@supplier.com"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Termin Pembayaran</label>
              <SearchableSelect
                options={[
                  { value: 'Cash', label: 'Cash On Delivery (COD)' },
                  { value: '14 Hari', label: '14 Hari' },
                  { value: '30 Hari', label: '30 Hari' },
                  { value: '45 Hari', label: '45 Hari' },
                  { value: '60 Hari', label: '60 Hari' },
                ]}
                value={formData.termin_bayar}
                onChange={(val) => setFormData({ ...formData, termin_bayar: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Supplier</label>
            <textarea
              rows={2}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Kawasan Industri Cibitung, Bekasi..."
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
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Supplier"
        message={`Apakah Anda yakin ingin menghapus data supplier "${deleteDialog.name}"?`}
      />
    </div>
  );
}
