import React, { useState, useEffect } from 'react';
import { Plus, Truck, CheckCircle2, FileText, Check, Edit2, Trash2 } from 'lucide-react';
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
import DatePickerInput from '../../components/common/DatePickerInput';

export default function PenerimaanPage() {
  const [lpbList, setLpbList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    po_id: '',
    tanggal_terima: new Date().toISOString().split('T')[0],
    no_sj_supplier: '',
    nama_penerima: 'Maman Suratman (Gudang)',
    catatan: 'Sheet tiba dalam kondisi kering & rapih',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PURCHASING.ORDERS, { limit: 100 });
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLPB = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.PENERIMAAN, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setLpbList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat LPB: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchLPB();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      po_id: orders.length ? orders[0].id : '',
      tanggal_terima: new Date().toISOString().split('T')[0],
      no_sj_supplier: 'SJ-SUPP-991',
      nama_penerima: 'Maman Suratman (Gudang)',
      catatan: 'Sheet lembaran diterima utuh dan dihitung bersama supir',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l) => {
    setIsEditing(true);
    setEditingId(l.id);
    setFormData({
      po_id: l.po_id || '',
      tanggal_terima: l.tanggal_terima ? l.tanggal_terima.split('T')[0] : new Date().toISOString().split('T')[0],
      no_sj_supplier: l.no_sj_supplier || l.nomor_sj_supplier || '',
      nama_penerima: l.nama_penerima || l.penerima_nama || '',
      catatan: l.catatan || '',
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PURCHASING.PENERIMAAN_DETAIL(deleteDialog.id));
      toast.success('Data penerimaan barang berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchLPB();
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.PURCHASING.PENERIMAAN_DETAIL(editingId), formData);
        toast.success('Laporan penerimaan barang berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.PURCHASING.PENERIMAAN, formData);
        toast.success('Penerimaan barang berhasil dicatat! Stok gudang telah bertambah');
      }
      setIsModalOpen(false);
      fetchLPB();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan penerimaan');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Penerimaan Barang (LPB)</h1>
          <p className="text-sm text-slate-500">
            Pemeriksaan kedatangan karton sheet & material, verifikasi nomor surat jalan supplier, dan mutasi masuk stok.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Input Penerimaan Barang (LPB)
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
          placeholder="Cari no LPB, no PO, supplier, no SJ..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> LPB Diterbitkan
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat laporan penerimaan..." />
        ) : lpbList.length === 0 ? (
          <EmptyState
            title="Tidak ada LPB"
            description="Belum ada pencatatan kedatangan barang dari supplier."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Catat LPB Pertama
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor LPB & Tanggal</th>
                  <th className="px-6 py-4">Supplier & Ref PO</th>
                  <th className="px-6 py-4">No SJ Supplier</th>
                  <th className="px-6 py-4">Item Diterima</th>
                  <th className="px-6 py-4">Penerima Gudang</th>
                  <th className="px-6 py-4">Status Verifikasi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lpbList.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{l.nomor_lpb}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{l.tanggal_terima}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{l.supplier_nama || l.nama_supplier || 'Supplier'}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{l.nomor_po}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700 text-xs">
                      {l.no_sj_supplier}
                    </td>
                    <td className="px-6 py-4">
                      {(l.items || []).map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          <span className="font-bold">{Number(it.qty_terima).toLocaleString('id-ID')}</span> • {it.item_name}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-800">
                      {l.nama_penerima}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <Check className="w-3 h-3 mr-1" />
                        Masuk Gudang
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit LPB"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: l.id, name: l.nomor_lpb })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus LPB"
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
        title={isEditing ? 'Edit Laporan Penerimaan Barang (LPB)' : 'Input Laporan Penerimaan Barang (LPB)'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Purchase Order (PO) <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              value={formData.po_id}
              onChange={(val) => setFormData({ ...formData, po_id: val })}
              options={orders.map((po) => ({
                value: po.id,
                label: `${po.nomor_po} - ${po.supplier_nama || po.nama_supplier || 'Supplier'} (Rp ${Number(po.total_nilai).toLocaleString('id-ID')})`,
              }))}
              placeholder="Cari & pilih nomor PO..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Penerimaan</label>
              <DatePickerInput
                value={formData.tanggal_terima}
                onChange={(val) => setFormData({ ...formData, tanggal_terima: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. Surat Jalan Supplier</label>
              <input
                type="text"
                required
                value={formData.no_sj_supplier}
                onChange={(e) => setFormData({ ...formData, no_sj_supplier: e.target.value })}
                placeholder="SJ-FSR-99812"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Staff Penerima Gudang</label>
            <input
              type="text"
              value={formData.nama_penerima}
              onChange={(e) => setFormData({ ...formData, nama_penerima: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Kondisi Fisik</label>
            <textarea
              rows={2}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Sheet tidak basah, flute tidak gepeng/rusak..."
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
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan LPB & Tambah Stok')}
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
        title="Hapus Laporan Penerimaan Barang"
        message={`Apakah Anda yakin ingin menghapus dokumen penerimaan "${deleteDialog.name}"?`}
        confirmText="Ya, Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}
