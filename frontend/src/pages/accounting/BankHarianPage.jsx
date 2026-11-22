import React, { useState, useEffect } from 'react';
import { Landmark, ArrowDownRight, ArrowUpRight, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ReportPrintHeader from '../../components/common/ReportPrintHeader';
import ReportPrintFooter from '../../components/common/ReportPrintFooter';

export default function BankHarianPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBank(startDate, endDate);
  }, []);

  const fetchBank = async (start, end) => {
    try {
      setLoading(true);
      const s = start !== undefined ? start : startDate;
      const e = end !== undefined ? end : endDate;
      const query = s && e ? `?startDate=${s}&endDate=${e}` : '';
      const res = await request.get(`${API_ENDPOINTS.ACCOUNTING.LAPORAN_BANK_HARIAN}${query}`);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat bank harian: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Rekening Koran Bank</h1>
          <p className="text-sm text-slate-500">
            Penerimaan transfer pembayaran customer dan pengeluaran ke supplier melalui rekening bank resmi perusahaan.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Mutasi Bank
        </button>
      </div>

      {/* Date Filter */}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={(s, e) => fetchBank(s, e)}
        onReset={() => {
          const d = new Date();
          const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
          const today = d.toISOString().split('T')[0];
          setStartDate(first);
          setEndDate(today);
          fetchBank(first, today);
        }}
        loading={loading}
      />

      {loading ? (
        <LoadingSpinner text="Memuat saldo rekening bank..." />
      ) : (
        <div className="report-print-container bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <ReportPrintHeader
            title="LAPORAN REKENING KORAN & MUTASI BANK"
            periode={report?.periode || report?.tanggal}
          />

          {/* Account Card Banner */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rekening Terpilih:</span>
              <h2 className="text-base font-bold mt-0.5">{report?.rekening}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tanggal Valuta: {report?.tanggal}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Saldo Akhir Efektif:</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">
                Rp {Number(report?.saldoAkhir || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Activity Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mutasi Rekening Bank Periode Berjalan
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/50 uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Tanggal / Ref</th>
                    <th className="px-4 py-3">Uraian Transaksi Bank</th>
                    <th className="px-4 py-3">Arah Dana</th>
                    <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report?.rincian || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        Tidak ada transaksi mutasi bank pada periode ini.
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
                              {isMasuk ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                              {isMasuk ? 'Kredit (Masuk)' : 'Debet (Keluar)'}
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
            preparer="Staff Treasury Bank"
            reviewer="Manager Keuangan"
            approver="Direktur Keuangan"
          />
        </div>
      )}
    </div>
  );
}
