import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function JurnalPage() {
  const [jurnalList, setJurnalList] = useState([]);
  const [coaList, setCoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    tipe_jurnal: 'Memorial',
    keterangan: '',
    items: [
      { akun_id: '', posisi: 'Debet', nominal: 0 },
      { akun_id: '', posisi: 'Kredit', nominal: 0 },
    ]
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchCOA = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.COA);
      if (res.success) setCoaList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJurnal = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.JURNAL, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setJurnalList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat jurnal umum: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCOA();
  }, []);

  useEffect(() => {
    fetchJurnal();
  }, [page, limit, search]);

  const handleOpenCreate = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      tipe_jurnal: 'Memorial',
      keterangan: 'Jurnal penyesuaian operasional pabrik',
      items: [
        { akun_id: coaList.length ? coaList[0].id : '', posisi: 'Debet', nominal: 1000000 },
        { akun_id: coaList.length > 1 ? coaList[1].id : '', posisi: 'Kredit', nominal: 1000000 },
      ]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await request.post(API_ENDPOINTS.ACCOUNTING.JURNAL, formData);
      toast.success('Jurnal transaksi berhasil dibukukan!');
      setIsModalOpen(false);
      fetchJurnal();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan jurnal');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jurnal Umum & Transaksi Akuntansi</h1>
          <p className="text-sm text-slate-500">
            Pencatatan double-entry bookkeeping: Kas Masuk, Kas Keluar, Bank Masuk, Bank Keluar, dan Memorial penyesuaian.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Input Jurnal Manual
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
          placeholder="Cari nomor jurnal, tipe, keterangan..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Entri Jurnal
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat entri jurnal umum..." />
        ) : jurnalList.length === 0 ? (
          <EmptyState title="Belum ada transaksi jurnal" description="Input jurnal transaksi baru untuk memulai pembukuan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor Jurnal & Tgl</th>
                  <th className="px-6 py-4">Tipe Jurnal</th>
                  <th className="px-6 py-4">Uraian / Keterangan Transaksi</th>
                  <th className="px-6 py-4 text-right">Total Debet (Rp)</th>
                  <th className="px-6 py-4 text-right">Total Kredit (Rp)</th>
                  <th className="px-6 py-4">Status Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jurnalList.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{j.nomor_jurnal}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{j.tanggal}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          j.tipe_jurnal.includes('Masuk')
                            ? 'success'
                            : j.tipe_jurnal.includes('Keluar')
                            ? 'danger'
                            : 'primary'
                        }
                      >
                        {j.tipe_jurnal}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{j.keterangan}</p>
                      <div className="mt-1 space-y-0.5">
                        {(j.items || []).map((it, idx) => (
                          <div key={idx} className="text-xs text-slate-500 flex justify-between max-w-sm">
                            <span className={it.posisi === 'Kredit' ? 'pl-4 italic' : 'font-medium'}>
                              {it.nama_akun || `Akun #${it.akun_id}`}
                            </span>
                            <span className="font-mono">
                              {it.posisi}: Rp {Number(it.nominal).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      Rp {Number(j.total_debet).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      Rp {Number(j.total_kredit).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Balance</Badge>
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

      {/* Modal Form Jurnal Manual */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Jurnal Transaksi Manual"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Jurnal</label>
              <select
                value={formData.tipe_jurnal}
                onChange={(e) => setFormData({ ...formData, tipe_jurnal: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              >
                <option value="Memorial">Jurnal Memorial (Penyesuaian)</option>
                <option value="Kas Masuk">Jurnal Kas Masuk (KM)</option>
                <option value="Kas Keluar">Jurnal Kas Keluar (KK)</option>
                <option value="Bank Masuk">Jurnal Bank Masuk (BM)</option>
                <option value="Bank Keluar">Jurnal Bank Keluar (BK)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Uraian</label>
            <input
              type="text"
              required
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Contoh: Pembayaran listrik pabrik & air..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pasangan Akun Debet & Kredit</p>
            {formData.items.map((it, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Akun Perkiraan</label>
                  <select
                    value={it.akun_id}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[idx].akun_id = e.target.value;
                      const ac = coaList.find(c => c.id === parseInt(e.target.value, 10));
                      if (ac) newItems[idx].nama_akun = ac.nama_akun;
                      setFormData({ ...formData, items: newItems });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="">-- Pilih Akun --</option>
                    {coaList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kode_akun} - {c.nama_akun}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Posisi</label>
                  <select
                    value={it.posisi}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[idx].posisi = e.target.value;
                      setFormData({ ...formData, items: newItems });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="Debet">Debet</option>
                    <option value="Kredit">Kredit</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="1"
                    value={it.nominal}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[idx].nominal = Number(e.target.value);
                      setFormData({ ...formData, items: newItems });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>
            ))}
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
              {formLoading ? 'Memproses...' : 'Bukukan Transaksi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
