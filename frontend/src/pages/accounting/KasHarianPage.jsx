import React, { useState, useEffect } from 'react';
import { Landmark, ArrowDownRight, ArrowUpRight, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ReportPrintHeader from '../../components/common/ReportPrintHeader';
import ReportPrintFooter from '../../components/common/ReportPrintFooter';

export default function KasHarianPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchKas(startDate, endDate);
  }, []);

  const fetchKas = async (start, end) => {
    try {
      setLoading(true);
      const s = start !== undefined ? start : startDate;
      const e = end !== undefined ? end : endDate;
      const query = s && e ? `?startDate=${s}&endDate=${e}` : '';
      const res = await request.get(`${API_ENDPOINTS.ACCOUNTING.LAPORAN_KAS_HARIAN}${query}`);
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
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Date Filter */}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={(s, e) => fetchKas(s, e)}
        onReset={() => {
          const d = new Date();
          const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
          const today = d.toISOString().split('T')[0];
          setStartDate(first);
          setEndDate(today);
          fetchKas(first, today);
        }}
        loading={loading}
      />

      {loading ? (
        <LoadingSpinner text="Merekap saldo kas..." />
      ) : (
        <div className="report-print-container bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <ReportPrintHeader
            title="LAPORAN BUKU KAS HARIAN (PETTY CASH)"
            periode={report?.periode || report?.tanggal}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Saldo Awal</span>
              <p className="mt-1 text-base font-bold text-slate-900">
                Rp {Number(report?.saldoAwal || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Total Kas Masuk</span>
              <p className="mt-1 text-base font-bold text-emerald-900">
                + Rp {Number(report?.mutasiMasuk || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Total Kas Keluar</span>
              <p className="mt-1 text-base font-bold text-rose-900">
                - Rp {Number(report?.mutasiKeluar || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-brand-50/70 p-4 rounded-xl border border-brand-200">
              <span className="text-[10px] font-bold text-brand-800 uppercase">Saldo Akhir</span>
              <p className="mt-1 text-base font-black text-brand-900">
                Rp {Number(report?.saldoAkhir || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Activity Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rincian Mutasi Penerimaan & Pengeluaran Kas Tunai
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/50 uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Tanggal / Ref</th>
                    <th className="px-4 py-3">Uraian Transaksi Kas</th>
                    <th className="px-4 py-3">Jenis Aliran</th>
                    <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report?.rincian || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        Tidak ada transaksi kas pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    (report?.rincian || []).map((r, idx) => {
                      const isMasuk = r.jenis === 'Masuk';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono">
                            <span className="font-bold text-slate-800">{r.no_ref}</span>
                            <span className="text-slate-400 block text-[11px]">{r.tanggal} {r.jam ? `(${r.jam})` : ''}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {r.uraian}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {isMasuk ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {r.jenis}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${isMasuk ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {isMasuk ? '+' : '-'} Rp {Number(r.nominal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ReportPrintFooter
            preparer="Kasir Pabrik"
            reviewer="Supervisor Keuangan"
            approver="Manager Keuangan"
          />
        </div>
      )}
    </div>
  );
}
