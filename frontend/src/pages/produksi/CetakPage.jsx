import React, { useState, useEffect } from 'react';
import { Plus, Printer, CheckCircle2 } from 'lucide-react';
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

export default function CetakPage() {
  const [cetakList, setCetakList] = useState([]);
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
    mesin_cetak: 'Flexo 2 Warna Line 1',
    operator_nama: 'Agus Salim',
    warna_tinta: 'Hitam & Merah Cabai',
    qty_masuk: 3050,
    qty_bagus: 3020,
    qty_reject: 30,
    catatan: 'Register warna tajam, slotting presisi',
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

  const fetchCetak = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PRODUKSI.CETAK, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setCetakList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat proses cetak: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSPK();
  }, []);

  useEffect(() => {
    fetchCetak();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    const spk = spkList.length ? spkList[0] : null;
    const target = spk ? spk.qty_target : 3000;
    setFormData({
      spk_id: spk ? spk.id : '',
      tanggal_proses: new Date().toISOString().split('T')[0],
      mesin_cetak: 'Flexo 2 Warna Line 1',
      operator_nama: 'Agus Salim',
      warna_tinta: spk ? spk.desain_cetak : 'Hitam & Merah Cabai',
      qty_masuk: target + 50,
      qty_bagus: target,
      qty_reject: 50,
      catatan: 'Cetak tajam, tinta kering merata',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.PRODUKSI.CETAK, formData);
      toast.success('Hasil cetak flexo berhasil dicatat! SPK berpindah ke tahap Finishing');
      setIsModalOpen(false);
      fetchCetak();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan hasil cetak');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Produksi: Proses Cetak (Flexo Printing)</h1>
          <p className="text-sm text-slate-500">
            Pencatatan jalannya mesin cetak flexo, tinta warna, kuantitas lolos, dan waste/reject setting mesin.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Input Hasil Cetak Flexo
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
          placeholder="Cari nomor SPK, nama operator, mesin..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Laporan Cetak
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat hasil cetak flexo..." />
        ) : cetakList.length === 0 ? (
          <EmptyState title="Belum ada proses cetak" description="Input hasil cetak flexo mesin untuk memperbarui status SPK." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor SPK & Tgl</th>
                  <th className="px-6 py-4">Mesin & Operator</th>
                  <th className="px-6 py-4">Warna Tinta Flexo</th>
                  <th className="px-6 py-4">Sheet Masuk</th>
                  <th className="px-6 py-4">Hasil Baik</th>
                  <th className="px-6 py-4">Reject / Waste</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cetakList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{c.nomor_spk}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.tanggal_proses}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{c.mesin_cetak}</div>
                      <div className="text-xs text-brand-600 mt-0.5">Operator: {c.operator_nama}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {c.warna_tinta}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {Number(c.qty_masuk).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      {Number(c.qty_bagus).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-600">
                      {Number(c.qty_reject).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {c.status}
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
        title="Catat Hasil Proses Cetak Flexo"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mesin Flexo Digunakan</label>
              <input
                type="text"
                value={formData.mesin_cetak}
                onChange={(e) => setFormData({ ...formData, mesin_cetak: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Utama Mesin</label>
              <input
                type="text"
                value={formData.operator_nama}
                onChange={(e) => setFormData({ ...formData, operator_nama: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Warna Tinta Flexo</label>
            <input
              type="text"
              value={formData.warna_tinta}
              onChange={(e) => setFormData({ ...formData, warna_tinta: e.target.value })}
              placeholder="Hitam, Merah, Biru, Kuning..."
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reject (Pcs)</label>
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
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Memproses...' : 'Simpan & Lanjutkan ke Finishing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
