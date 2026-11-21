import React, { useState, useEffect } from 'react';
import { Plus, Printer, Factory, CheckCircle2, Clock, AlertTriangle, Eye, ArrowRight, Trash2 } from 'lucide-react';
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
import PrintSPK from '../../components/print/PrintSPK';
import SearchableSelect from '../../components/common/SearchableSelect';
import DatePickerInput from '../../components/common/DatePickerInput';

export default function SPKPage() {
  const [spkList, setSpkList] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tahapanFilter, setTahapanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_nama: '',
    nama_box: '',
    ukuran_box: '340 x 200 x 240 mm',
    sheet_id: '',
    qty_target: 3000,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    target_selesai: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    desain_cetak: 'Flexo 2 Warna (Hitam & Merah)',
    pisau_pond: 'Standard Slotter & Creaser',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Detail Modal
  const [detailSPK, setDetailSPK] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Print Preview
  const [printData, setPrintData] = useState(null);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSheets = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PURCHASING.BAHAN_SHEET, { limit: 100 });
      if (res.success) setSheets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSPK = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.PRODUKSI.SPK, {
        page,
        limit,
        search,
        tahapan: tahapanFilter || undefined,
      });
      if (res.success) {
        setSpkList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat daftar SPK: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  useEffect(() => {
    fetchSPK();
  }, [page, limit, search, tahapanFilter]);

  const handleOpenCreate = () => {
    setFormData({
      customer_nama: 'PT. Indofood Sukses Makmur Tbk',
      nama_box: 'Master Box Indomie Special',
      ukuran_box: '340 x 200 x 240 mm',
      sheet_id: sheets.length ? sheets[0].id : '',
      qty_target: 5000,
      tanggal_mulai: new Date().toISOString().split('T')[0],
      target_selesai: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      desain_cetak: 'Flexo 2 Warna (Merah & Hitam)',
      pisau_pond: 'Rotary Slotter Indomie',
    });
    setIsModalOpen(true);
  };

  const handleViewDetail = async (spk) => {
    try {
      setDetailLoading(true);
      const res = await request.get(API_ENDPOINTS.PRODUKSI.SPK_DETAIL(spk.id));
      if (res.success) {
        setDetailSPK(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat detail riwayat SPK');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const res = await request.post(API_ENDPOINTS.PRODUKSI.SPK, formData);
      toast.success('SPK Produksi berhasil diterbitkan ke lantai pabrik!');
      setIsModalOpen(false);
      fetchSPK();
      if (res.data) {
        setPrintData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menerbitkan SPK');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.PRODUKSI.SPK_DETAIL(deleteDialog.id));
      toast.success('SPK berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchSPK();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus SPK');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Surat Perintah Kerja (SPK)</h1>
          <p className="text-sm text-slate-500">
            Job ticket manufaktur dus: spesifikasi teknis, bahan baku sheet, cetak flexo, finishing pond/stitching, dan target selesai.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Terbitkan SPK Produksi
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Cari no SPK, nama dus, customer..."
            className="w-full sm:w-80"
          />
          <SearchableSelect
            className="w-52 text-xs font-semibold"
            value={tahapanFilter}
            onChange={(val) => {
              setTahapanFilter(val || '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Tahapan' },
              { value: 'Cetak', label: '1. Proses Cetak Flexo' },
              { value: 'Finishing', label: '2. Proses Finishing' },
              { value: 'Ikat', label: '3. Proses Ikat Strapping' },
              { value: 'Selesai', label: '4. Selesai (Masuk Gudang)' },
            ]}
            placeholder="Filter Tahapan..."
            isClearable
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> SPK Produksi
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar instruksi kerja..." />
        ) : spkList.length === 0 ? (
          <EmptyState
            title="Tidak ada SPK"
            description="Belum ada perintah kerja produksi yang aktif."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Buat SPK Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor SPK & Tgl</th>
                  <th className="px-6 py-4">Customer & Nama Dus</th>
                  <th className="px-6 py-4">Dimensi (PxLxT mm)</th>
                  <th className="px-6 py-4">Target Kuantitas</th>
                  <th className="px-6 py-4">Posisi Tahapan</th>
                  <th className="px-6 py-4">Batas Selesai</th>
                  <th className="px-6 py-4 text-center">Aksi & Job Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {spkList.map((spk) => (
                  <tr key={spk.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{spk.nomor_spk}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{spk.tanggal_mulai}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{spk.nama_box}</div>
                      <div className="text-xs text-brand-600 mt-0.5">{spk.nama_customer || spk.customer_nama}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700">
                      {spk.ukuran_box}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {Number(spk.qty_target).toLocaleString('id-ID')} Pcs
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          spk.tahapan_sekarang === 'Cetak'
                            ? 'primary'
                            : spk.tahapan_sekarang === 'Finishing'
                            ? 'warning'
                            : spk.tahapan_sekarang === 'Ikat'
                            ? 'purple'
                            : 'success'
                        }
                      >
                        Tahap {spk.tahapan_sekarang}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600 text-xs">
                      {spk.target_selesai}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewDetail(spk)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Lihat Riwayat Stasiun Kerja"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPrintData(spk)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors"
                          title="Cetak SPK Job Ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Cetak SPK
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: spk.id, name: spk.nomor_spk })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus SPK"
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

      {/* Modal Terbitkan SPK */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Surat Perintah Kerja (SPK) Baru"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Customer / Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customer_nama}
                onChange={(e) => setFormData({ ...formData, customer_nama: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Box Packaging <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_box}
                onChange={(e) => setFormData({ ...formData, nama_box: e.target.value })}
                placeholder="Master Box Biskuit 400x300x250"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ukuran Dus (PxLxT mm)</label>
              <input
                type="text"
                value={formData.ukuran_box}
                onChange={(e) => setFormData({ ...formData, ukuran_box: e.target.value })}
                placeholder="340 x 200 x 240 mm"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bahan Sheet Karton</label>
              <SearchableSelect
                value={formData.sheet_id}
                onChange={(val) => setFormData({ ...formData, sheet_id: val })}
                options={sheets.map((s) => ({
                  value: s.id,
                  label: `${s.nama_sheet} (${s.flute})`,
                }))}
                placeholder="Pilih Lembaran Sheet..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Produksi (Pcs)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.qty_target}
                onChange={(e) => setFormData({ ...formData, qty_target: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Desain Cetak Flexo</label>
              <input
                type="text"
                value={formData.desain_cetak}
                onChange={(e) => setFormData({ ...formData, desain_cetak: e.target.value })}
                placeholder="Flexo 2 Warna (Merah & Hitam)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pisau Pond / Slotter</label>
              <input
                type="text"
                value={formData.pisau_pond}
                onChange={(e) => setFormData({ ...formData, pisau_pond: e.target.value })}
                placeholder="Rotary Slotter Indomie / Pisau Pond Pizza"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai Produksi</label>
              <DatePickerInput
                value={formData.tanggal_mulai}
                onChange={(val) => setFormData({ ...formData, tanggal_mulai: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Selesai Gudang FG</label>
              <DatePickerInput
                value={formData.target_selesai}
                onChange={(val) => setFormData({ ...formData, target_selesai: val })}
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
              {formLoading ? 'Menerbitkan...' : 'Terbitkan SPK & Cetak'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail & Riwayat Stasiun Kerja */}
      {detailSPK && (
        <Modal
          isOpen={!!detailSPK}
          onClose={() => setDetailSPK(null)}
          title={`Riwayat Produksi SPK: ${detailSPK.nomor_spk}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <p><span className="text-slate-500">Nama Box:</span> <strong>{detailSPK.nama_box}</strong></p>
                <p><span className="text-slate-500">Customer:</span> <strong>{detailSPK.customer_nama}</strong></p>
              </div>
              <div>
                <p><span className="text-slate-500">Target Qty:</span> <strong className="text-brand-700">{Number(detailSPK.qty_target).toLocaleString('id-ID')} Pcs</strong></p>
                <p><span className="text-slate-500">Posisi:</span> <strong className="text-amber-700">Tahap {detailSPK.tahapan_sekarang}</strong></p>
              </div>
            </div>

            {/* Riwayat Cetak */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">1. Riwayat Proses Cetak (Flexo)</h4>
              {(!detailSPK.riwayat_cetak || detailSPK.riwayat_cetak.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Belum ada input proses cetak</p>
              ) : (
                <div className="space-y-2">
                  {detailSPK.riwayat_cetak.map((c, idx) => (
                    <div key={idx} className="p-3 bg-brand-50/40 border border-brand-100 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-brand-900">
                        <span>{c.mesin_cetak} • Operator: {c.operator_nama}</span>
                        <span>Hasil Bagus: {c.qty_bagus} Pcs</span>
                      </div>
                      <p className="text-slate-600">Warna Tinta: {c.warna_tinta} • Reject: {c.qty_reject} Pcs • {c.catatan}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Riwayat Finishing */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">2. Riwayat Finishing (Pond / Stitching / Lem)</h4>
              {(!detailSPK.riwayat_finishing || detailSPK.riwayat_finishing.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Belum ada input finishing</p>
              ) : (
                <div className="space-y-2">
                  {detailSPK.riwayat_finishing.map((f, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-amber-900">
                        <span>{f.jenis_finishing} ({f.mesin}) • Operator: {f.operator_nama}</span>
                        <span>Hasil Bagus: {f.qty_bagus} Pcs</span>
                      </div>
                      <p className="text-slate-600">Reject Finishing: {f.qty_reject} Pcs • {f.catatan}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Riwayat Ikat */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">3. Riwayat Ikat & Serah Terima Gudang FG</h4>
              {(!detailSPK.riwayat_ikat || detailSPK.riwayat_ikat.length === 0) ? (
                <p className="text-xs text-slate-400 italic">Belum ada proses ikat</p>
              ) : (
                <div className="space-y-2">
                  {detailSPK.riwayat_ikat.map((i, idx) => (
                    <div key={idx} className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-emerald-900">
                        <span>Operator Packing: {i.operator_nama}</span>
                        <span>Total Selesai: {i.total_barang_jadi} Pcs</span>
                      </div>
                      <p className="text-slate-600">Packing: {i.jumlah_ikat} Ikat (@{i.isi_per_ikat} pcs/ikat) • Serah Terima Gudang: Selesai</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Print SPK Modal */}
      <PrintSPK data={printData} onClose={() => setPrintData(null)} />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus SPK Produksi"
        message={`Apakah Anda yakin ingin menghapus data instruksi kerja "${deleteDialog.name}"?`}
      />
    </div>
  );
}
