import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Phone, CreditCard, Building } from 'lucide-react';
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

export default function KaryawanPage() {
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nik: '',
    nama_lengkap: '',
    jabatan: '',
    departemen: 'Produksi',
    status_karyawan: 'Tetap',
    no_hp: '',
    no_rekening: '',
    bank: 'BCA',
    gaji_pokok: 4800000,
    tunjangan_jabatan: 500000,
    uang_makan_perhari: 25000,
    tarif_lembur_perjam: 25000,
  });
  const [formLoading, setFormLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchKaryawan = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PAYROLL.KARYAWAN, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setKaryawanList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat data karyawan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      nik: '',
      nama_lengkap: '',
      jabatan: 'Operator Mesin Flexo',
      departemen: 'Produksi',
      status_karyawan: 'Tetap',
      no_hp: '',
      no_rekening: '',
      bank: 'BCA',
      gaji_pokok: 4800000,
      tunjangan_jabatan: 500000,
      uang_makan_perhari: 25000,
      tarif_lembur_perjam: 25000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      nik: item.nik,
      nama_lengkap: item.nama_lengkap,
      jabatan: item.jabatan,
      departemen: item.departemen || 'Produksi',
      status_karyawan: item.status_karyawan || 'Tetap',
      no_hp: item.no_hp || '',
      no_rekening: item.no_rekening || '',
      bank: item.bank || 'BCA',
      gaji_pokok: item.gaji_pokok,
      tunjangan_jabatan: item.tunjangan_jabatan,
      uang_makan_perhari: item.uang_makan_perhari,
      tarif_lembur_perjam: item.tarif_lembur_perjam,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_lengkap.trim()) {
      toast.error('Nama karyawan wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.PAYROLL.KARYAWAN_DETAIL(formData.id), formData);
        toast.success('Data karyawan berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PAYROLL.KARYAWAN, formData);
        toast.success('Karyawan baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchKaryawan();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data karyawan');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PAYROLL.KARYAWAN_DETAIL(deleteDialog.id));
      toast.success('Karyawan berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchKaryawan();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus karyawan');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Karyawan & Komponen Gaji</h1>
          <p className="text-sm text-slate-500">
            Data tenaga kerja: Operator Flexo, Operator Pond/Stitching, Supir Pengiriman, Staff Gudang, dan rincian gaji pokok.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Karyawan
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
          placeholder="Cari NIK, nama karyawan, jabatan, departemen..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Tenaga Kerja Aktif
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar karyawan..." />
        ) : karyawanList.length === 0 ? (
          <EmptyState title="Karyawan tidak ditemukan" description="Belum ada data tenaga kerja tersimpan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">NIK & Nama Lengkap</th>
                  <th className="px-6 py-4">Jabatan & Departemen</th>
                  <th className="px-6 py-4">Status & Kontak</th>
                  <th className="px-6 py-4">Gaji Pokok Standar</th>
                  <th className="px-6 py-4">Tunjangan & Uang Makan</th>
                  <th className="px-6 py-4">Tarif Lembur</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {karyawanList.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{k.nama_lengkap}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{k.nik}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{k.jabatan}</div>
                      <Badge
                        variant={
                          k.departemen === 'Produksi'
                            ? 'warning'
                            : k.departemen === 'Gudang'
                            ? 'purple'
                            : 'primary'
                        }
                      >
                        {k.departemen}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-700">{k.status_karyawan}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {k.no_hp || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Rp {Number(k.gaji_pokok).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div className="text-slate-700 font-semibold">Tunj: Rp {Number(k.tunjangan_jabatan).toLocaleString('id-ID')}</div>
                      <div className="text-slate-500">Makan: Rp {Number(k.uang_makan_perhari).toLocaleString('id-ID')}/hr</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-800 text-xs">
                      Rp {Number(k.tarif_lembur_perjam).toLocaleString('id-ID')} / jam
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(k)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Karyawan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: k.id, name: k.nama_lengkap })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Karyawan"
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
        title={isEditing ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Induk Karyawan (NIK)</label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="EMP-008 (Otomatis jika kosong)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Karyawan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                placeholder="Agus Salim / Ujang"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Posisi</label>
              <input
                type="text"
                required
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                placeholder="Operator Mesin Flexo / Helper"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Departemen Kerja</label>
              <select
                value={formData.departemen}
                onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="Produksi">Produksi (Lantai Pabrik)</option>
                <option value="Gudang">Gudang & Logistik</option>
                <option value="Marketing">Marketing & Penjualan</option>
                <option value="Purchasing">Purchasing & Pengadaan</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="HRD & Umum">HRD & Umum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
              <select
                value={formData.status_karyawan}
                onChange={(e) => setFormData({ ...formData, status_karyawan: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="Tetap">Karyawan Tetap</option>
                <option value="Kontrak">Karyawan Kontrak</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Handphone / WhatsApp</label>
              <input
                type="text"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Rekening Bank</label>
              <input
                type="text"
                value={formData.no_rekening}
                onChange={(e) => setFormData({ ...formData, no_rekening: e.target.value })}
                placeholder="1234567890 (BCA)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gaji Pokok (Rp)</label>
              <input
                type="number"
                value={formData.gaji_pokok}
                onChange={(e) => setFormData({ ...formData, gaji_pokok: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tunjangan Jabatan (Rp)</label>
              <input
                type="number"
                value={formData.tunjangan_jabatan}
                onChange={(e) => setFormData({ ...formData, tunjangan_jabatan: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Uang Makan / Hari (Rp)</label>
              <input
                type="number"
                value={formData.uang_makan_perhari}
                onChange={(e) => setFormData({ ...formData, uang_makan_perhari: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Lembur / Jam (Rp)</label>
              <input
                type="number"
                value={formData.tarif_lembur_perjam}
                onChange={(e) => setFormData({ ...formData, tarif_lembur_perjam: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold text-amber-800"
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
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Karyawan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Karyawan"
        message={`Apakah Anda yakin ingin menghapus data karyawan "${deleteDialog.name}"?`}
      />
    </div>
  );
}
