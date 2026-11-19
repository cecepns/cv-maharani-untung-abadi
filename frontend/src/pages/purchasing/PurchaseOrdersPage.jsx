import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileCheck, Layers, Eye, Printer } from 'lucide-react';
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

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '',
    tanggal_po: new Date().toISOString().split('T')[0],
    catatan: '',
    items: [
      { item_name: '', qty: 1000, harga_satuan: 3100 }
    ]
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const [sRes, shRes] = await Promise.all([
        request.get(API_ENDPOINTS.PURCHASING.SUPPLIERS, { limit: 100 }),
        request.get(API_ENDPOINTS.PURCHASING.BAHAN_SHEET, { limit: 100 }),
      ]);
      if (sRes.success) setSuppliers(sRes.data);
      if (shRes.success) setSheets(shRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.ORDERS, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setOrders(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Purchase Orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setFormData({
      supplier_id: suppliers.length ? suppliers[0].id : '',
      tanggal_po: new Date().toISOString().split('T')[0],
      catatan: 'Karton sheet wajib bersih, rapih di atas pallet kayu',
      items: [
        {
          item_name: sheets.length ? sheets[0].nama_sheet : 'Karton Sheet B/F 1000x1200',
          qty: 2000,
          harga_satuan: sheets.length ? sheets[0].harga_per_lembar : 3100
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { item_name: '', qty: 1000, harga_satuan: 0 }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id) {
      toast.error('Pilih supplier terlebih dahulu!');
      return;
    }

    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PURCHASING.ORDERS, formData);
      toast.success('Purchase Order berhasil diterbitkan ke supplier');
      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Gagal membuat Purchase Order');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PURCHASING.ORDER_DETAIL(deleteDialog.id));
      toast.success('PO berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus PO');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Pembelian (Purchase Order)</h1>
          <p className="text-sm text-slate-500">
            Pemesanan bahan baku karton sheet, tinta, kawat, dan lem kepada rekanan supplier resmi.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat PO Baru
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
          placeholder="Cari nomor PO, supplier, catatan..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Order Pembelian
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar PO..." />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Tidak ada Purchase Order"
            description="Belum ada order pembelian yang dibuat."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Buat PO Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor PO & Tanggal</th>
                  <th className="px-6 py-4">Nama Supplier</th>
                  <th className="px-6 py-4">Item Bahan Dipesan</th>
                  <th className="px-6 py-4">Total Biaya PO</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{po.nomor_po}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{po.tanggal_po}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {po.supplier_nama}
                    </td>
                    <td className="px-6 py-4">
                      {(po.items || []).map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          <span className="font-semibold">{Number(it.qty).toLocaleString('id-ID')}</span> • {it.item_name}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-700 text-sm">
                      Rp {Number(po.total_nilai).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={po.status === 'Selesai' ? 'success' : 'primary'}>
                        {po.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, id: po.id, name: po.nomor_po })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus PO"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        title="Buat Order Pembelian (PO) ke Supplier"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Supplier <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_supplier} ({s.kategori})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal PO</label>
              <input
                type="date"
                value={formData.tanggal_po}
                onChange={(e) => setFormData({ ...formData, tanggal_po: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instruksi Khusus / Catatan</label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Pengiriman sebelum tanggal 10, pallet rapih..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          {/* Dynamic Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase">Item Bahan Baku / Pembantu</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      required
                      placeholder="Nama Sheet / Tinta / Kawat"
                      value={it.item_name}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].item_name = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      required
                      placeholder="Qty"
                      value={it.qty}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].qty = Number(e.target.value);
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <input
                      type="number"
                      required
                      placeholder="Harga"
                      value={it.harga_satuan}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].harga_satuan = Number(e.target.value);
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
              {formLoading ? 'Memproses...' : 'Kirim PO ke Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Purchase Order"
        message={`Apakah Anda yakin ingin menghapus PO "${deleteDialog.name}"?`}
      />
    </div>
  );
}
