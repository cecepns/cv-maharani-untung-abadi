import React, { useState, useEffect } from 'react';
import { Landmark, ArrowDownRight, ArrowUpRight, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function KasHarianPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKas();
  }, []);

  const fetchKas = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.LAPORAN_KAS_HARIAN);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat kas harian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Kas Harian (Petty Cash)</h1>
          <p className="text-sm text-slate-500">
            Arus kas tunai operasional pabrik: BBM armada, konsumsi lembur operator, dan penjualan limbah/afval karton.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Buku Kas Harian
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Merekap saldo kas hari ini..." />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Saldo Awal Hari</span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                Rp {Number(report?.saldoAwal || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Total Kas Masuk</span>
              <p className="mt-1 text-xl font-bold text-emerald-900">
                + Rp {Number(report?.mutasiMasuk || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-sm">
              <span className="text-xs font-semibold text-rose-800 uppercase">Total Kas Keluar</span>
              <p className="mt-1 text-xl font-bold text-rose-900">
                - Rp {Number(report?.mutasiKeluar || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-brand-50/70 p-5 rounded-2xl border border-brand-200 shadow-sm">
              <span className="text-xs font-semibold text-brand-800 uppercase">Saldo Akhir Berjalan</span>
              <p className="mt-1 text-xl font-black text-brand-900">
                Rp {Number(report?.saldoAkhir || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mutasi Penerimaan & Pengeluaran Kas Tunai Hari Ini ({report?.tanggal})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Jam & No Ref</th>
                    <th className="px-6 py-4">Uraian Transaksi Kas</th>
                    <th className="px-6 py-4">Jenis Aliran</th>
                    <th className="px-6 py-4 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report?.rincian || []).map((r, idx) => {
                    const isMasuk = r.jenis === 'Masuk';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">
                          <span className="font-bold text-slate-800">{r.no_ref}</span>
                          <span className="text-slate-400 ml-2">{r.jam}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {r.uraian}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {isMasuk ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {r.jenis}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-extrabold ${isMasuk ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isMasuk ? '+' : '-'} Rp {Number(r.nominal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
