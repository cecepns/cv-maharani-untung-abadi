import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function HutangPage() {
  const [payments, setPayments] = useState([]);
  const [notaBeli, setNotaBeli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    faktur_beli_id: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    metode_bayar: 'Transfer BCA',
    jumlah_bayar: 0,
    catatan: 'Pelunasan faktur supplier',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchNotaBeli = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PURCHASING.NOTA_BELI, { limit: 100 });
      if (res.success) {
        setNotaBeli(res.data.filter(n => n.sisa_tagihan > 0));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.FINANCE.HUTANG_BAYAR, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat pembayaran hutang: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotaBeli();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const fb = notaBeli.length ? notaBeli[0] : null;
    setFormData({
      faktur_beli_id: fb ? fb.id : '',
      tanggal_bayar: new Date().toISOString().split('T')[0],
      metode_bayar: 'Transfer BCA',
      jumlah_bayar: fb ? fb.sisa_tagihan : 5000000,
      catatan: 'Pembayaran hutang supplier sheet/material',
    });
    setIsModalOpen(true);
  };

  const handleFakturSelect = (fbId) => {
    const fb = notaBeli.find(n => n.id === parseInt(fbId, 10));
    if (fb) {
      setFormData({
        ...formData,
        faktur_beli_id: fb.id,
        jumlah_bayar: fb.sisa_tagihan,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.FINANCE.HUTANG_BAYAR, formData);
      toast.success('Pengeluaran pembayaran hutang supplier berhasil dicatat!');
      setIsModalOpen(false);
      fetchPayments();
      fetchNotaBeli();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pembayaran hutang');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pembayaran Hutang Supplier (AP)</h1>
          <p className="text-sm text-slate-500">
            Pencatatan pengeluaran kas / bank untuk pelunasan tagihan supplier bahan baku sheet & material pendukung.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Bayar Hutang Supplier
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
          placeholder="Cari nomor bukti bayar, supplier..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Pembayaran Hutang
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat pembayaran hutang..." />
        ) : payments.length === 0 ? (
          <EmptyState title="Belum ada riwayat pembayaran hutang" description="Input pelunasan hutang untuk mengurangi saldo tagihan supplier." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Bukti & Tanggal</th>
                  <th className="px-6 py-4">Supplier Rekanan</th>
                  <th className="px-6 py-4">Ref Faktur Beli</th>
                  <th className="px-6 py-4">Metode Bayar</th>
                  <th className="px-6 py-4 text-right">Jumlah Dibayar (Rp)</th>
                  <th className="px-6 py-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.nomor_bukti}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.tanggal_bayar}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {p.supplier_nama}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-xs text-brand-600">
                      {p.nomor_faktur_beli}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="purple">{p.metode_bayar}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-brand-700 text-sm">
                      Rp {Number(p.jumlah_bayar).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {p.catatan}
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
        title="Pembayaran Hutang ke Supplier"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Nota Beli / Faktur Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.faktur_beli_id}
              onChange={(e) => handleFakturSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              <option value="">-- Pilih Faktur Beli --</option>
              {notaBeli.map((fb) => (
                <option key={fb.id} value={fb.id}>
                  {fb.nomor_faktur_beli} - {fb.supplier_nama} (Sisa: Rp {Number(fb.sisa_tagihan).toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pembayaran</label>
              <input
                type="date"
                value={formData.tanggal_bayar}
                onChange={(e) => setFormData({ ...formData, tanggal_bayar: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Rekening</label>
              <select
                value={formData.metode_bayar}
                onChange={(e) => setFormData({ ...formData, metode_bayar: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="Transfer BCA">Bank BCA CV. Maharani</option>
                <option value="Transfer Mandiri">Bank Mandiri</option>
                <option value="Kas Tunai">Kas Tunai Operasional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Yang Dibayarkan (Rp)</label>
            <input
              type="number"
              min="1"
              required
              value={formData.jumlah_bayar}
              onChange={(e) => setFormData({ ...formData, jumlah_bayar: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-black text-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / No Referensi</label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Bukti transfer, dll..."
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
              {formLoading ? 'Memproses...' : 'Simpan Pembayaran Hutang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
