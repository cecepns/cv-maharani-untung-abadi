import React, { useState, useEffect } from 'react';
import { Plus, BadgePercent, CheckCircle2, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function FakturPajakPage() {
  const [fakturList, setFakturList] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    dpp: 0,
    ppn: 0,
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

  const fetchFakturPajak = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.FAKTUR_PAJAK, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setFakturList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Faktur Pajak: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchFakturPajak();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const inv = invoices.length ? invoices[0] : null;
    setFormData({
      invoice_id: inv ? inv.id : '',
      dpp: inv ? inv.subtotal : 10000000,
      ppn: inv ? inv.ppn : 1100000,
    });
    setIsModalOpen(true);
  };

  const handleInvoiceSelect = (invId) => {
    const inv = invoices.find(i => i.id === parseInt(invId, 10));
    if (inv) {
      setFormData({
        invoice_id: inv.id,
        dpp: inv.subtotal,
        ppn: inv.ppn,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.MARKETING.FAKTUR_PAJAK, formData);
      toast.success('Faktur Pajak Seri e-Faktur berhasil diterbitkan!');
      setIsModalOpen(false);
      fetchFakturPajak();
    } catch (err) {
      toast.error(err.message || 'Gagal menerbitkan faktur pajak');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faktur Pajak (e-Faktur PPN 11%)</h1>
          <p className="text-sm text-slate-500">
            Pencatatan seri faktur pajak standar, DPP (Dasar Pengenaan Pajak), dan PPN keluaran penjualan karton.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Faktur Pajak
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
          placeholder="Cari nomor faktur pajak seri e-faktur, customer..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Faktur Pajak Terbit
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat data e-faktur..." />
        ) : fakturList.length === 0 ? (
          <EmptyState
            title="Tidak ada Faktur Pajak"
            description="Belum ada faktur pajak yang dibuat."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Terbitkan Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Faktur Pajak</th>
                  <th className="px-6 py-4">Customer Wajib Pajak</th>
                  <th className="px-6 py-4">Tanggal Faktur</th>
                  <th className="px-6 py-4">Dasar Pengenaan Pajak (DPP)</th>
                  <th className="px-6 py-4">PPN Keluaran 11%</th>
                  <th className="px-6 py-4">Status Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fakturList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {f.nomor_faktur}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {f.customer_nama}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {f.tanggal_faktur}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      Rp {Number(f.dpp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      Rp {Number(f.ppn).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {f.status} DJP
                      </Badge>
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

      {/* Modal Terbitkan Faktur Pajak */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Nomor Seri Faktur Pajak"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Invoice Penjualan <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.invoice_id}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              <option value="">-- Pilih Nota Penjualan --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.nomor_invoice} - {inv.customer_nama} (Rp {Number(inv.total_tagihan).toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">DPP (Rp)</label>
              <input
                type="number"
                value={formData.dpp}
                onChange={(e) => setFormData({ ...formData, dpp: Number(e.target.value), ppn: Math.round(Number(e.target.value) * 0.11) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PPN 11% (Rp)</label>
              <input
                type="number"
                value={formData.ppn}
                onChange={(e) => setFormData({ ...formData, ppn: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            Nomor seri e-faktur resmi akan digenerate otomatis sesuai alokasi jatah nomor faktur CV. Maharani Untung Abadi.
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
              {formLoading ? 'Memproses...' : 'Terbitkan e-Faktur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
