import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, CheckCircle2, ArrowDownLeft, Edit2, Trash2 } from 'lucide-react';
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

export default function PiutangPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
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
    invoice_id: '',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    metode_bayar: 'Transfer BCA',
    jumlah_bayar: 0,
    catatan: 'Pelunasan piutang customer',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.MARKETING.INVOICES, { limit: 100 });
      if (res.success) {
        setInvoices(res.data.filter(i => i.sisa_tagihan > 0));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.FINANCE.PIUTANG_BAYAR, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat pembayaran piutang: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    const inv = invoices.length ? invoices[0] : null;
    setFormData({
      invoice_id: inv ? inv.id : '',
      tanggal_bayar: new Date().toISOString().split('T')[0],
      metode_bayar: 'Transfer BCA',
      jumlah_bayar: inv ? inv.sisa_tagihan : 10000000,
      catatan: 'Pelunasan piutang customer',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      invoice_id: p.invoice_id || '',
      tanggal_bayar: p.tanggal_bayar ? p.tanggal_bayar.split('T')[0] : new Date().toISOString().split('T')[0],
      metode_bayar: p.metode_bayar || 'Transfer BCA',
      jumlah_bayar: Number(p.nominal_bayar || p.jumlah_bayar || 0),
      catatan: p.catatan || '',
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.FINANCE.PIUTANG_BAYAR_DETAIL(deleteDialog.id));
      toast.success('Data pembayaran piutang berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchPayments();
      fetchInvoices();
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInvoiceSelect = (invId) => {
    const inv = invoices.find(i => i.id === parseInt(invId, 10));
    if (inv) {
      setFormData({
        ...formData,
        invoice_id: inv.id,
        jumlah_bayar: inv.sisa_tagihan,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const payload = {
        ...formData,
        nominal_bayar: formData.jumlah_bayar,
      };
      if (isEditing) {
        await request.put(API_ENDPOINTS.FINANCE.PIUTANG_BAYAR_DETAIL(editingId), payload);
        toast.success('Pembayaran piutang berhasil diperbarui!');
      } else {
        await request.post(API_ENDPOINTS.FINANCE.PIUTANG_BAYAR, payload);
        toast.success('Penerimaan pembayaran piutang berhasil dicatat!');
      }
      setIsModalOpen(false);
      fetchPayments();
      fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pembayaran');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pembayaran Piutang Customer (AR)</h1>
          <p className="text-sm text-slate-500">
            Pencatatan kas masuk pelunasan invoice pelanggan, nomor bukti bayar, dan pemotongan saldo piutang.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Terima Pembayaran Piutang
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
          placeholder="Cari no bukti bayar, invoice, customer..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Transaksi Pembayaran
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat pembayaran..." />
        ) : payments.length === 0 ? (
          <EmptyState title="Belum ada riwayat pembayaran" description="Input pelunasan tagihan customer untuk memperbarui piutang." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Bukti & Tanggal</th>
                  <th className="px-6 py-4">Pelanggan (Customer)</th>
                  <th className="px-6 py-4">Ref Nota Penjualan</th>
                  <th className="px-6 py-4">Metode Pembayaran</th>
                  <th className="px-6 py-4 text-right">Jumlah Diterima (Rp)</th>
                  <th className="px-6 py-4">Catatan</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
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
                      {p.customer_nama}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-xs text-brand-600">
                      {p.nomor_invoice}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{p.metode_bayar}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-700 text-sm">
                      Rp {Number(p.jumlah_bayar).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {p.catatan}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Pembayaran"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: p.id, name: p.nomor_bukti })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pembayaran"
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
        title={isEditing ? 'Edit Pembayaran Piutang Customer' : 'Penerimaan Pembayaran Piutang Customer'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Nota Penjualan (Invoice Belum Lunas) <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              value={formData.invoice_id}
              onChange={(val) => handleInvoiceSelect(val)}
              options={invoices.map((inv) => ({
                value: inv.id,
                label: `${inv.nomor_invoice} - ${inv.nama_customer || inv.customer_nama} (Sisa: Rp ${Number(inv.sisa_tagihan).toLocaleString('id-ID')})`,
              }))}
              placeholder="Cari & pilih invoice..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pembayaran</label>
              <DatePickerInput
                value={formData.tanggal_bayar}
                onChange={(val) => setFormData({ ...formData, tanggal_bayar: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Penerimaan</label>
              <SearchableSelect
                value={formData.metode_bayar}
                onChange={(val) => setFormData({ ...formData, metode_bayar: val })}
                options={[
                  { value: 'Transfer BCA', label: 'Transfer BCA (CV. Maharani)' },
                  { value: 'Transfer Mandiri', label: 'Transfer Bank Mandiri' },
                  { value: 'Kas Tunai', label: 'Kas Tunai Kasir' },
                  { value: 'Giro', label: 'Giro / Cek Bilyet' },
                ]}
                placeholder="Pilih metode penerimaan..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Pembayaran Diterima (Rp)</label>
            <input
              type="number"
              min="1"
              required
              value={formData.jumlah_bayar}
              onChange={(e) => setFormData({ ...formData, jumlah_bayar: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-black text-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan / No Referensi Bank</label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Bukti transfer m-banking BCA, dll..."
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
              {formLoading ? 'Memproses...' : (isEditing ? 'Simpan Perubahan' : 'Catat Pelunasan Piutang')}
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
        title="Hapus Pembayaran Piutang"
        message={`Apakah Anda yakin ingin menghapus data bukti pembayaran "${deleteDialog.name}"? Saldo sisa tagihan pada invoice pelanggan akan dikembalikan otomatis.`}
        confirmText="Ya, Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}
