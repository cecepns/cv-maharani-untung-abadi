import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Calendar, Users, FileText, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/endpoints';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import StatCard from '@/components/common/StatCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

export default function GajiPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [periodeInput, setPeriodeInput] = useState('2026-11');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.PAYROLL.PERIODE);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data periode payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!periodeInput) {
      toast.error('Pilih periode bulan payroll');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(API_ENDPOINTS.PAYROLL.GENERATE, { periode: periodeInput });
      if (res.data.success) {
        toast.success(res.data.message || 'Payroll berhasil digenerate');
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(res.data.message || 'Gagal generate payroll');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Terjadi kesalahan sistem');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPengeluaran = data.reduce((sum, item) => sum + Number(item.total_gaji_dibayar || 0), 0);
  const totalKaryawanPaid = data.reduce((sum, item) => sum + Number(item.total_karyawan || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Gaji & Payroll Periode</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekapitulasi penggajian bulanan staf kantor dan operator pabrik corrugated CV. Maharani
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/payroll/slip')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Daftar Slip Gaji
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Payroll Periode
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Periode Penggajian"
          value={data.length}
          subtitle="Periode diterbitkan"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Total Pembayaran Gaji"
          value={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`}
          subtitle="Akumulasi beban payroll"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Karyawan Terbayar"
          value={totalKaryawanPaid}
          subtitle="Personel penerima upah"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Daftar Periode Payroll</h2>
          <button
            onClick={fetchData}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Memuat data periode payroll..." />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Belum Ada Periode Payroll"
              message="Generate payroll periode untuk menghitung gaji pokok, lembur, dan tunjangan otomatis."
              actionLabel="Generate Payroll"
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">No</th>
                  <th className="px-5 py-3.5">Nomor Payroll</th>
                  <th className="px-5 py-3.5">Periode Bulan</th>
                  <th className="px-5 py-3.5 text-center">Jumlah Karyawan</th>
                  <th className="px-5 py-3.5 text-right">Total Gaji Dibayarkan</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-brand-600">{row.nomor_payroll}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{row.periode_bulan}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs">
                        <Users className="w-3.5 h-3.5" />
                        {row.total_karyawan} Orang
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
                      Rp {Number(row.total_gaji_dibayar || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => navigate('/payroll/slip')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Generate */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate Payroll Periode Baru"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-800">
            <p className="font-semibold mb-1">Informasi Perhitungan Otomatis:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Sistem akan merekap seluruh master karyawan aktif.</li>
              <li>Menghitung tunjangan jabatan, uang makan, tarif lembur per jam, dan potongan BPJS 3%.</li>
              <li>Menghasilkan slip gaji individu untuk pencetakan dan pembukuan jurnal otomatis.</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Periode Bulan</label>
            <input
              type="month"
              value={periodeInput}
              onChange={(e) => setPeriodeInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Memproses...' : 'Generate Sekarang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
