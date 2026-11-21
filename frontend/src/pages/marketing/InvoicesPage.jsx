import React, { useState, useEffect } from 'react';
import { Plus, Printer, Receipt, CheckCircle, Clock, Trash2 } from 'lucide-react';
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
import PrintInvoice from '../../components/print/PrintInvoice';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    so_id: '',
    tanggal_invoice: new Date().toISOString().split('T')[0],
    jatuh_tempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    subtotal: 0,
    ppn: 0,
    total_tagihan: 0,
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

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.INVOICES, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setInvoices(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Nota Penjualan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const firstSO = salesOrders.length ? salesOrders[0] : null;
    const sub = firstSO ? firstSO.subtotal : 10000000;
    const p = firstSO ? firstSO.ppn : 1100000;
    setFormData({
      so_id: firstSO ? firstSO.id : '',
      tanggal_invoice: new Date().toISOString().split('T')[0],
      jatuh_tempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      subtotal: sub,
      ppn: p,
      total_tagihan: sub + p,
    });
    setIsModalOpen(true);
  };

  const handleSOSelect = (soId) => {
    const so = salesOrders.find(s => s.id === parseInt(soId, 10));
    if (so) {
      setFormData({
        ...formData,
        so_id: so.id,
        subtotal: so.subtotal,
        ppn: so.ppn,
        total_tagihan: so.total_nilai,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const res = await request.post(API_ENDPOINTS.MARKETING.INVOICES, formData);
      toast.success('Nota Penjualan berhasil diterbitkan');
      setIsModalOpen(false);
      fetchInvoices();
      if (res.data) {
        setPrintData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal membuat Invoice');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.MARKETING.INVOICE_DETAIL(deleteDialog.id));
      toast.success('Invoice berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus invoice');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nota Penjualan (Invoices)</h1>
          <p className="text-sm text-slate-500">
            Faktur penjualan dus karton, jatuh tempo, sisa tagihan piutang, dan cetak invoice resmi.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Nota Penjualan
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
          placeholder="Cari No Invoice, No SO, customer..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Invoice Diterbitkan
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar faktur penjualan..." />
        ) : invoices.length === 0 ? (
          <EmptyState
            title="Tidak ada Invoice"
            description="Belum ada data faktur penjualan yang tersimpan."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Buat Invoice Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor & Tanggal</th>
                  <th className="px-6 py-4">Customer & Ref SO</th>
                  <th className="px-6 py-4">Jatuh Tempo</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Sisa Piutang</th>
                  <th className="px-6 py-4">Status Bayar</th>
                  <th className="px-6 py-4 text-center">Aksi & Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{inv.nomor_invoice}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{inv.tanggal_invoice}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{inv.customer_nama}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{inv.nomor_so}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {inv.jatuh_tempo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        Rp {Number(inv.total_tagihan).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {Number(inv.ppn) > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded font-semibold bg-blue-50 text-blue-700 text-[10px]">
                            PPN 11%: Rp {Number(inv.ppn).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-600 text-[10px]">
                            Non-PPN (0%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      Rp {Number(inv.sisa_tagihan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={inv.status_bayar === 'Lunas' ? 'success' : 'danger'}>
                        {inv.status_bayar}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPrintData(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg transition-colors"
                          title="Cetak Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Cetak
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: inv.id, name: inv.nomor_invoice })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Invoice"
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

      {/* Modal Terbitkan Invoice */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Nota Penjualan / Invoice"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Sales Order (SO)</label>
            <select
              value={formData.so_id}
              onChange={(e) => handleSOSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              <option value="">-- Pilih Sales Order --</option>
              {salesOrders.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.nomor_so} - {so.customer_nama} (Rp {Number(so.total_nilai).toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Invoice</label>
              <input
                type="date"
                value={formData.tanggal_invoice}
                onChange={(e) => setFormData({ ...formData, tanggal_invoice: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jatuh Tempo Pembayaran</label>
              <input
                type="date"
                value={formData.jatuh_tempo}
                onChange={(e) => setFormData({ ...formData, jatuh_tempo: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal DPP:</span>
              <span className="font-semibold text-slate-800">Rp {Number(formData.subtotal).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">PPN (11%):</span>
              <span className="font-semibold text-slate-800">Rp {Number(formData.ppn).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
              <span className="text-slate-900">Total Tagihan Invoice:</span>
              <span className="text-brand-700">Rp {Number(formData.total_tagihan).toLocaleString('id-ID')}</span>
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
              {formLoading ? 'Memproses...' : 'Terbitkan & Cetak Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Print Preview Modal */}
      <PrintInvoice data={printData} onClose={() => setPrintData(null)} />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Invoice"
        message={`Apakah Anda yakin ingin menghapus Nota Penjualan "${deleteDialog.name}"?`}
      />
    </div>
  );
}
