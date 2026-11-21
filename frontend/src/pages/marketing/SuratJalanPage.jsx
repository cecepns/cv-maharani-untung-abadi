import React, { useState, useEffect } from 'react';
import { Plus, Printer, Truck, CheckCircle, Clock, Trash2, Edit2 } from 'lucide-react';
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
import PrintSuratJalan from '../../components/print/PrintSuratJalan';
import SearchableSelect from '../../components/common/SearchableSelect';
import DatePickerInput from '../../components/common/DatePickerInput';

export default function SuratJalanPage() {
  const [suratJalan, setSuratJalan] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    so_id: '',
    tanggal_kirim: new Date().toISOString().split('T')[0],
    no_kendaraan: 'B 9123 MUA',
    nama_supir: 'Ahmad Kosasih',
    catatan: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Print Preview
  const [printData, setPrintData] = useState(null);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.MARKETING.SALES_ORDERS, { limit: 100 });
      if (res.success) setSalesOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuratJalan = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.SURAT_JALAN, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setSuratJalan(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Surat Jalan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchSuratJalan();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      so_id: salesOrders.length ? salesOrders[0].id : '',
      tanggal_kirim: new Date().toISOString().split('T')[0],
      no_kendaraan: 'B 9123 MUA',
      nama_supir: 'Ahmad Kosasih',
      catatan: 'Pengiriman kardus gelombang lengkap dengan strapping',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sj) => {
    setIsEditing(true);
    setEditingId(sj.id);
    setFormData({
      so_id: sj.so_id,
      tanggal_kirim: sj.tanggal_kirim,
      no_kendaraan: sj.no_kendaraan || '',
      nama_supir: sj.nama_supir || '',
      catatan: sj.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.so_id) {
      toast.error('Pilih Sales Order terlebih dahulu!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.MARKETING.SURAT_JALAN_DETAIL(editingId), formData);
        toast.success('Surat Jalan berhasil diperbarui!');
      } else {
        const res = await request.post(API_ENDPOINTS.MARKETING.SURAT_JALAN, formData);
        toast.success('Surat Jalan berhasil diterbitkan!');
        if (res.data) {
          setPrintData(res.data);
        }
      }
      setIsModalOpen(false);
      fetchSuratJalan();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan Surat Jalan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await request.put(API_ENDPOINTS.MARKETING.SURAT_JALAN_DETAIL(item.id), { status: newStatus });
      toast.success(`Status pengiriman diubah ke: ${newStatus}`);
      fetchSuratJalan();
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah status');
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.MARKETING.SURAT_JALAN_DETAIL(deleteDialog.id));
      toast.success('Surat jalan berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchSuratJalan();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus surat jalan');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Surat Jalan (DO)</h1>
          <p className="text-sm text-slate-500">
            Dokumen pengiriman kardus, armada logistik, supir pengantar, dan konfirmasi penerimaan gudang customer.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Surat Jalan
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
          placeholder="Cari No SJ, No SO, customer, armada, supir..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Surat Jalan Diterbitkan
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat pengiriman..." />
        ) : suratJalan.length === 0 ? (
          <EmptyState
            title="Tidak ada Surat Jalan"
            description="Belum ada catatan pengiriman barang."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Buat Surat Jalan
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor SJ & Tanggal</th>
                  <th className="px-6 py-4">Customer & Ref SO</th>
                  <th className="px-6 py-4">Armada & Supir</th>
                  <th className="px-6 py-4">Muatan Dus Dikirim</th>
                  <th className="px-6 py-4">Status Pengiriman</th>
                  <th className="px-6 py-4 text-center">Aksi & Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suratJalan.map((sj) => (
                  <tr key={sj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{sj.nomor_sj}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{sj.tanggal_kirim}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{sj.nama_customer || sj.customer_nama || 'Customer'}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{sj.nomor_so}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{sj.no_kendaraan || 'B 9123 MUA'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Supir: {sj.nama_supir || 'Ahmad'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {(sj.items || []).map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          <span className="font-bold text-slate-900">{Number(it.qty_kirim).toLocaleString('id-ID')} Pcs</span> - {it.nama_barang}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          sj.status === 'Diterima Customer'
                            ? 'success'
                            : sj.status === 'Dikirim'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {sj.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintData(sj)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                          title="Cetak Surat Jalan Resmi"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          Cetak SJ
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sj)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Surat Jalan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {sj.status !== 'Diterima Customer' && (
                          <button
                            onClick={() => handleUpdateStatus(sj, 'Diterima Customer')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Tandai Diterima Customer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: sj.id, name: sj.nomor_sj })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Surat Jalan"
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

      {/* Modal Terbitkan / Edit Surat Jalan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Surat Jalan Pengiriman' : 'Terbitkan Surat Jalan (DO) Pengiriman'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Referensi Sales Order (SO) <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              value={formData.so_id}
              onChange={(val) => setFormData({ ...formData, so_id: val })}
              options={salesOrders.map((so) => ({
                value: so.id,
                label: `${so.nomor_so} - ${so.nama_customer || so.customer_nama || 'Customer'} (Rp ${Number(so.total_nilai || 0).toLocaleString('id-ID')})`,
              }))}
              placeholder="Cari & pilih nomor Sales Order..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pengiriman</label>
              <DatePickerInput
                value={formData.tanggal_kirim}
                onChange={(val) => setFormData({ ...formData, tanggal_kirim: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plat Nomor Truk / Armada</label>
              <input
                type="text"
                value={formData.no_kendaraan}
                onChange={(e) => setFormData({ ...formData, no_kendaraan: e.target.value })}
                placeholder="B 9123 MUA"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Supir Pengantar</label>
            <input
              type="text"
              value={formData.nama_supir}
              onChange={(e) => setFormData({ ...formData, nama_supir: e.target.value })}
              placeholder="Ahmad Kosasih / Dedi Supardi"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Pengiriman</label>
            <textarea
              rows={2}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Dikirim bertahap, packing strapping ikat rapih..."
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
              {formLoading ? 'Memproses...' : isEditing ? 'Simpan Perubahan' : 'Terbitkan & Buka Cetak'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Print Surat Jalan Modal */}
      <PrintSuratJalan data={printData} onClose={() => setPrintData(null)} />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Surat Jalan"
        message={`Apakah Anda yakin ingin menghapus Surat Jalan "${deleteDialog.name}"?`}
      />
    </div>
  );
}
