import React, { useState, useEffect } from 'react';
import { Plus, Scissors, CheckCircle2 } from 'lucide-react';
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

export default function FinishingPage() {
  const [finishingList, setFinishingList] = useState([]);
  const [spkList, setSpkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    spk_id: '',
    tanggal_proses: new Date().toISOString().split('T')[0],
    jenis_finishing: 'Stitching Kawat',
    operator_nama: 'Ujang Koswara',
    mesin: 'Stitching 2 Kepala Semi-Auto',
    qty_masuk: 3000,
    qty_bagus: 2980,
    qty_reject: 20,
    catatan: '4 kawat stitch per dus, lipatan simetris',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchSPK = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PRODUKSI.SPK, { limit: 100 });
      if (res.success) setSpkList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFinishing = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PRODUKSI.FINISHING, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setFinishingList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat proses finishing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSPK();
  }, []);

  useEffect(() => {
    fetchFinishing();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const spk = spkList.length ? spkList[0] : null;
    const target = spk ? spk.qty_target : 3000;
    setFormData({
      spk_id: spk ? spk.id : '',
      tanggal_proses: new Date().toISOString().split('T')[0],
      jenis_finishing: 'Stitching Kawat',
      operator_nama: 'Ujang Koswara',
      mesin: 'Stitching 2 Kepala',
      qty_masuk: target,
      qty_bagus: target - 20,
      qty_reject: 20,
      catatan: 'Kawat stitch kencang, lipatan rapih',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PRODUKSI.FINISHING, formData);
      toast.success('Hasil finishing berhasil dicatat! SPK berpindah ke tahap Ikat Packing');
      setIsModalOpen(false);
      fetchFinishing();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan finishing');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Produksi: Proses Finishing Dus</h1>
          <p className="text-sm text-slate-500">
            Tahapan pembentukan kardus: Rotary Die-Cut / Pisau Pond, Slitter Creaser, Stitching Kawat, atau Folder Gluer (Lem).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Input Hasil Finishing
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
          placeholder="Cari nomor SPK, jenis finishing, operator..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Laporan Finishing
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat hasil finishing..." />
        ) : finishingList.length === 0 ? (
          <EmptyState title="Belum ada proses finishing" description="Input hasil finishing untuk melanjutkan alur produksi." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor SPK & Tgl</th>
                  <th className="px-6 py-4">Jenis Finishing</th>
                  <th className="px-6 py-4">Mesin & Operator</th>
                  <th className="px-6 py-4">Qty Masuk</th>
                  <th className="px-6 py-4">Hasil Bagus</th>
                  <th className="px-6 py-4">Reject</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finishingList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{f.nomor_spk}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{f.tanggal_proses}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="warning">{f.jenis_finishing}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{f.mesin}</div>
                      <div className="text-xs text-brand-600 mt-0.5">Operator: {f.operator_nama}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {Number(f.qty_masuk).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      {Number(f.qty_bagus).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      {Number(f.qty_reject).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {f.status}
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
        title="Catat Hasil Proses Finishing"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih SPK Produksi <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              options={spkList.map((s) => ({
                value: s.id,
                label: `${s.nomor_spk} - ${s.nama_box} (${s.customer_nama})`,
              }))}
              value={formData.spk_id}
              onChange={(val) => setFormData({ ...formData, spk_id: val })}
              placeholder="-- Cari SPK Produksi --"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pekerjaan Finishing</label>
              <SearchableSelect
                options={[
                  { value: 'Stitching Kawat', label: 'Stitching Kawat (Jahit Kawat 2/4 Titik)' },
                  { value: 'Gluing / Lem', label: 'Gluing (Lem Folder Gluer)' },
                  { value: 'Rotary Die-Cut / Pond', label: 'Rotary Die-Cut / Pond Cutting' },
                  { value: 'Slitter & Creasing', label: 'Slitter & Creasing Potong Garis' },
                ]}
                value={formData.jenis_finishing}
                onChange={(val) => setFormData({ ...formData, jenis_finishing: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Finishing</label>
              <input
                type="text"
                value={formData.operator_nama}
                onChange={(e) => setFormData({ ...formData, operator_nama: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mesin Digunakan</label>
            <input
              type="text"
              value={formData.mesin}
              onChange={(e) => setFormData({ ...formData, mesin: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qty Masuk</label>
              <input
                type="number"
                value={formData.qty_masuk}
                onChange={(e) => setFormData({ ...formData, qty_masuk: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hasil Bagus</label>
              <input
                type="number"
                value={formData.qty_bagus}
                onChange={(e) => setFormData({ ...formData, qty_bagus: Number(e.target.value), qty_reject: Math.max(0, formData.qty_masuk - Number(e.target.value)) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reject</label>
              <input
                type="number"
                value={formData.qty_reject}
                onChange={(e) => setFormData({ ...formData, qty_reject: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-rose-600 font-bold"
              />
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
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Memproses...' : 'Simpan & Lanjutkan ke Ikat'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
