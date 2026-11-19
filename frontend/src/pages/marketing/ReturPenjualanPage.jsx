import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function ReturPenjualanPage() {
  const [returList, setReturList] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    customer_nama: '',
    nama_barang: '',
    qty: 50,
    alasan: 'Printing blur / dimensi selisih',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.MARKETING.INVOICES, { limit: 100 });
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRetur = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.RETUR_PENJUALAN, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setReturList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Retur Penjualan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchRetur();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const inv = invoices.length ? invoices[0] : null;
    setFormData({
      invoice_id: inv ? inv.id : '',
      customer_nama: inv ? inv.customer_nama : '',
      nama_barang: 'Master Box Indomie (A1)',
      qty: 50,
      alasan: 'Printing blur / reject cetak flexo',
    });
    setIsModalOpen(true);
  };

  const handleInvoiceSelect = (invId) => {
    const inv = invoices.find(i => i.id === parseInt(invId, 10));
    if (inv) {
      setFormData({
        ...formData,
        invoice_id: inv.id,
        customer_nama: inv.customer_nama,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.MARKETING.RETUR_PENJUALAN, formData);
      toast.success('Pengajuan Retur Penjualan berhasil dicatat');
      setIsModalOpen(false);
      fetchRetur();
    } catch (err) {
      toast.error(err.message || 'Gagal mengajukan retur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await request.put(API_ENDPOINTS.MARKETING.RETUR_PENJUALAN_DETAIL(id), { status: 'Selesai' });
      toast.success('Retur penjualan disetujui & diselesaikan');
      fetchRetur();
    } catch (err) {
      toast.error(err.message || 'Gagal update retur');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retur Penjualan Dus</h1>
          <p className="text-sm text-slate-500">
            Penanganan pengembalian dus cacat (printing reject, stitching renggang, dimensi salah) dan potong piutang.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajukan Retur Penjualan
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
          placeholder="Cari nomor retur, customer, alasan..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Retur Tercatat
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat data retur penjualan..." />
        ) : returList.length === 0 ? (
          <EmptyState
            title="Tidak ada Retur Penjualan"
            description="Semua pesanan diterima dengan baik oleh customer (0 retur)."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Retur & Tgl</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Item Dus Diretur</th>
                  <th className="px-6 py-4">Qty Retur</th>
                  <th className="px-6 py-4">Alasan Cacat / Reject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{r.nomor_retur}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.tanggal_retur}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {r.customer_nama}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {r.nama_barang}
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      {Number(r.qty).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                      {r.alasan}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status === 'Selesai' ? 'success' : 'warning'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.status !== 'Selesai' && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Selesaikan Retur
                        </button>
                      )}
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

      {/* Modal Ajukan Retur */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajukan Retur Penjualan Dus"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Nota Penjualan / Invoice <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.invoice_id}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              <option value="">-- Pilih Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.nomor_invoice} - {inv.customer_nama}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Barang / Dus</label>
              <input
                type="text"
                required
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                placeholder="Master Box Indomie (A1)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qty Retur (Pcs)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Retur / Masalah Kualitas</label>
            <textarea
              rows={3}
              required
              value={formData.alasan}
              onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
              placeholder="Contoh: Cetak flexo luntur, register warna meleset 4mm, stitching kendor..."
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
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Memproses...' : 'Simpan Pengajuan Retur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
