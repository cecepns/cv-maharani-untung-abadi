import React, { useState, useEffect } from 'react';
import { Plus, Receipt, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchableSelect from '../../components/common/SearchableSelect';
import DatePickerInput from '../../components/common/DatePickerInput';

export default function NotaBeliPage() {
  const [notaList, setNotaList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    po_id: '',
    supplier_id: '',
    tanggal_faktur: new Date().toISOString().split('T')[0],
    jatuh_tempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    total_tagihan: 0,
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

  const fetchNotaBeli = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.NOTA_BELI, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setNotaList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Nota Pembelian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchNotaBeli();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const po = orders.length ? orders[0] : null;
    setFormData({
      po_id: po ? po.id : '',
      supplier_id: po ? po.supplier_id : 1,
      tanggal_faktur: new Date().toISOString().split('T')[0],
      jatuh_tempo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      total_tagihan: po ? po.total_nilai : 10000000,
    });
    setIsModalOpen(true);
  };

  const handlePOSelect = (poId) => {
    const po = orders.find(o => o.id === parseInt(poId, 10));
    if (po) {
      setFormData({
        ...formData,
        po_id: po.id,
        supplier_id: po.supplier_id,
        total_tagihan: po.total_nilai,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PURCHASING.NOTA_BELI, formData);
      toast.success('Nota Pembelian supplier berhasil dicatat');
      setIsModalOpen(false);
      fetchNotaBeli();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan nota pembelian');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nota Pembelian (Faktur Beli)</h1>
          <p className="text-sm text-slate-500">
            Pencatatan tagihan supplier sheet & bahan pembantu, jatuh tempo hutang usaha, dan pelunasan.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Catat Nota Beli
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
          placeholder="Cari no faktur beli, supplier..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Faktur Beli
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar faktur beli..." />
        ) : notaList.length === 0 ? (
          <EmptyState
            title="Tidak ada Nota Pembelian"
            description="Belum ada tagihan supplier yang tercatat."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Faktur Beli</th>
                  <th className="px-6 py-4">Nama Supplier</th>
                  <th className="px-6 py-4">Ref Purchase Order</th>
                  <th className="px-6 py-4">Jatuh Tempo</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Sisa Hutang</th>
                  <th className="px-6 py-4">Status Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notaList.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {n.nomor_faktur_beli}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {n.supplier_nama}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-brand-600">
                      {n.nomor_po}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {n.jatuh_tempo}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      Rp {Number(n.total_tagihan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      Rp {Number(n.sisa_tagihan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={n.status_bayar === 'Lunas' ? 'success' : 'danger'}>
                        {n.status_bayar}
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Nota Pembelian / Faktur Supplier"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Purchase Order (PO) <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              value={formData.po_id}
              onChange={(val) => handlePOSelect(val)}
              options={orders.map((po) => ({
                value: po.id,
                label: `${po.nomor_po} - ${po.supplier_nama} (Rp ${Number(po.total_nilai).toLocaleString('id-ID')})`,
              }))}
              placeholder="Cari & pilih Purchase Order..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Faktur</label>
              <DatePickerInput
                value={formData.tanggal_faktur}
                onChange={(val) => setFormData({ ...formData, tanggal_faktur: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jatuh Tempo Pembayaran</label>
              <DatePickerInput
                value={formData.jatuh_tempo}
                onChange={(val) => setFormData({ ...formData, jatuh_tempo: val })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Nilai Tagihan (Rp)</label>
            <input
              type="number"
              required
              value={formData.total_tagihan}
              onChange={(e) => setFormData({ ...formData, total_tagihan: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold"
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
              {formLoading ? 'Menyimpan...' : 'Simpan Nota Beli'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
