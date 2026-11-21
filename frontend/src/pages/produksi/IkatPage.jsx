import React, { useState, useEffect } from 'react';
import { Plus, Layers, CheckCircle2, Box } from 'lucide-react';
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

export default function IkatPage() {
  const [ikatList, setIkatList] = useState([]);
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
    operator_nama: 'Endang Sujana',
    isi_per_ikat: 25,
    jumlah_ikat: 120,
    total_barang_jadi: 3000,
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

  const fetchIkat = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PRODUKSI.IKAT, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setIkatList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat proses ikat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSPK();
  }, []);

  useEffect(() => {
    fetchIkat();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const spk = spkList.length ? spkList[0] : null;
    const target = spk ? spk.qty_target : 3000;
    const isi = 25;
    const jmlIkat = Math.round(target / isi);
    setFormData({
      spk_id: spk ? spk.id : '',
      tanggal_proses: new Date().toISOString().split('T')[0],
      operator_nama: 'Endang Sujana',
      isi_per_ikat: isi,
      jumlah_ikat: jmlIkat,
      total_barang_jadi: target,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PRODUKSI.IKAT, formData);
      toast.success('Proses ikat strapping selesai! Dus resmi masuk Gudang FG & SPK Tuntas!');
      setIsModalOpen(false);
      fetchIkat();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan proses ikat');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Produksi: Proses Ikat & Packing (Strapping)</h1>
          <p className="text-sm text-slate-500">
            Pengikatan dus jadi per kelipatan standar (misal 25 / 50 pcs per ikat), verifikasi kerapihan, dan serah terima ke gudang barang jadi.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Input Hasil Ikat & Packing
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
          placeholder="Cari nomor SPK, operator packing..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Batch Pengikatan Selesai
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat laporan ikat packing..." />
        ) : ikatList.length === 0 ? (
          <EmptyState title="Belum ada proses ikat" description="Catat proses pengikatan dus jadi untuk diserahterimakan ke gudang." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor SPK & Tanggal</th>
                  <th className="px-6 py-4">Operator Packing</th>
                  <th className="px-6 py-4">Standar Isi per Ikat</th>
                  <th className="px-6 py-4">Jumlah Ikat Strapping</th>
                  <th className="px-6 py-4">Total Unit Barang Jadi</th>
                  <th className="px-6 py-4">Serah Terima Gudang FG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ikatList.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {i.nomor_spk}
                      <div className="text-xs font-normal text-slate-400 mt-0.5">{i.tanggal_proses}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {i.operator_nama}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {i.isi_per_ikat} Pcs / Ikat
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-700">
                      {Number(i.jumlah_ikat).toLocaleString('id-ID')} Ikat
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-700 text-sm">
                      {Number(i.total_barang_jadi).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Diterima Gudang FG
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
        title="Input Hasil Ikat & Packing Barang Jadi"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Packing / Ikat</label>
              <input
                type="text"
                value={formData.operator_nama}
                onChange={(e) => setFormData({ ...formData, operator_nama: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Proses Ikat</label>
              <DatePickerInput
                value={formData.tanggal_proses}
                onChange={(val) => setFormData({ ...formData, tanggal_proses: val })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Isi per Ikat (Pcs)</label>
              <input
                type="number"
                value={formData.isi_per_ikat}
                onChange={(e) => {
                  const isi = Number(e.target.value);
                  const total = isi * formData.jumlah_ikat;
                  setFormData({ ...formData, isi_per_ikat: isi, total_barang_jadi: total });
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Ikat</label>
              <input
                type="number"
                value={formData.jumlah_ikat}
                onChange={(e) => {
                  const jml = Number(e.target.value);
                  const total = jml * formData.isi_per_ikat;
                  setFormData({ ...formData, jumlah_ikat: jml, total_barang_jadi: total });
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Unit Jadi (Pcs)</label>
              <input
                type="number"
                value={formData.total_barang_jadi}
                onChange={(e) => setFormData({ ...formData, total_barang_jadi: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-black text-emerald-700"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
            Setelah disimpan, SPK otomatis dinyatakan Selesai dan total dus masuk ke Gudang Finished Goods (FG) siap dikirim.
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
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Memproses...' : 'Selesaikan Ikat & Masuk Gudang FG'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
