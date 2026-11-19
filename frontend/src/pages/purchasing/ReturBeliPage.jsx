import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function ReturBeliPage() {
  const [returList, setReturList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier_nama: '',
    alasan: 'Sheet bergelombang lembek / cacat pabrik',
    total_nilai: 500000,
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PURCHASING.SUPPLIERS, { limit: 100 });
      if (res.success) setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRetur = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PURCHASING.RETUR_BELI, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setReturList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat retur pembelian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchRetur();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setFormData({
      supplier_nama: suppliers.length ? suppliers[0].nama_supplier : 'PT. Fajar Surya Wisesa Tbk',
      alasan: 'Sheet karton lembek dan bergelombang cacat 100 lembar',
      total_nilai: 310000,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PURCHASING.RETUR_BELI, formData);
      toast.success('Retur pembelian berhasil dibuat & diajukan ke supplier');
      setIsModalOpen(false);
      fetchRetur();
    } catch (err) {
      toast.error(err.message || 'Gagal membuat retur');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retur Pembelian Bahan</h1>
          <p className="text-sm text-slate-500">
            Pengembalian sheet karton atau material pembantu yang cacat ke supplier serta pemotongan hutang usaha.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Ajukan Retur Bahan
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
          placeholder="Cari nomor retur beli, supplier..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Retur Pembelian
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat retur pembelian..." />
        ) : returList.length === 0 ? (
          <EmptyState
            title="Tidak ada Retur Pembelian"
            description="Bahan baku dari supplier diterima dalam kondisi baik tanpa cacat."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Retur & Tgl</th>
                  <th className="px-6 py-4">Nama Supplier Rekanan</th>
                  <th className="px-6 py-4">Alasan Retur / Cacat Sheet</th>
                  <th className="px-6 py-4">Nilai Retur Potong Hutang</th>
                  <th className="px-6 py-4">Status Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{r.nomor_retur_beli}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.tanggal_retur}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {r.supplier_nama}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 max-w-sm">
                      {r.alasan}
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      Rp {Number(r.total_nilai).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {r.status}
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
        title="Ajukan Retur Bahan ke Supplier"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Supplier Rekanan <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.supplier_nama}
              onChange={(e) => setFormData({ ...formData, supplier_nama: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.nama_supplier}>
                  {s.nama_supplier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai Pengurangan Tagihan (Rp)</label>
            <input
              type="number"
              required
              value={formData.total_nilai}
              onChange={(e) => setFormData({ ...formData, total_nilai: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Retur / Kerusakan Bahan</label>
            <textarea
              rows={3}
              required
              value={formData.alasan}
              onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
              placeholder="Flute basah, gelombang kempes, ukuran potong miring..."
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
              {formLoading ? 'Memproses...' : 'Kirim Retur ke Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
