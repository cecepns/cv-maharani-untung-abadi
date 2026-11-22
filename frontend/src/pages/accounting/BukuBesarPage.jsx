import React, { useState, useEffect } from 'react';
import { BookOpen, Printer, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ReportPrintHeader from '../../components/common/ReportPrintHeader';
import ReportPrintFooter from '../../components/common/ReportPrintFooter';

export default function BukuBesarPage() {
  const [activeTab, setActiveTab] = useState('buku-besar'); // 'buku-besar' or 'trial-balance'
  const [bukuBesar, setBukuBesar] = useState([]);
  const [trialBalance, setTrialBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAccountingData(startDate, endDate);
  }, []);

  const fetchAccountingData = async (start, end) => {
    try {
      setLoading(true);
      const s = start !== undefined ? start : startDate;
      const e = end !== undefined ? end : endDate;
      const query = s && e ? `?startDate=${s}&endDate=${e}` : '';
      const [bbRes, tbRes] = await Promise.all([
        request.get(`${API_ENDPOINTS.ACCOUNTING.BUKU_BESAR}${query}`),
        request.get(`${API_ENDPOINTS.ACCOUNTING.TRIAL_BALANCE}${query}`),
      ]);
      if (bbRes.success) setBukuBesar(bbRes.data);
      if (tbRes.success) setTrialBalance(tbRes.data);
    } catch (err) {
      toast.error('Gagal memuat buku besar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDebetTB = trialBalance.reduce((s, it) => s + Number(it.debet || 0), 0);
  const totalKreditTB = trialBalance.reduce((s, it) => s + Number(it.kredit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buku Besar & Neraca Saldo (Trial Balance)</h1>
          <p className="text-sm text-slate-500">
            Rekap rincian mutasi akun per perkiraan dan verifikasi keseimbangan (kesejajaran) debet-kredit.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Dokumen
        </button>
      </div>

      {/* Date Filter */}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={(s, e) => fetchAccountingData(s, e)}
        onReset={() => {
          const d = new Date();
          const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
          const today = d.toISOString().split('T')[0];
          setStartDate(first);
          setEndDate(today);
          fetchAccountingData(first, today);
        }}
        loading={loading}
      />

      {/* Tabs */}
      <div className="no-print flex gap-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('buku-besar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'buku-besar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Buku Besar per Akun
        </button>
        <button
          onClick={() => setActiveTab('trial-balance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'trial-balance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Neraca Saldo (Trial Balance)
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Memproses pembukuan..." />
      ) : activeTab === 'trial-balance' ? (
        <div className="report-print-container bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <ReportPrintHeader
            title="NERACA SALDO (TRIAL BALANCE)"
            periode={startDate && endDate ? `${startDate} s/d ${endDate}` : 'Periode Berjalan'}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode Akun</th>
                  <th className="px-6 py-4">Nama Perkiraan Akun</th>
                  <th className="px-6 py-4 text-right">Debet (Rp)</th>
                  <th className="px-6 py-4 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalance.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-brand-600 text-xs">
                      {t.kode_akun}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {t.nama_akun}
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      {t.debet > 0 ? `Rp ${Number(t.debet).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      {t.kredit > 0 ? `Rp ${Number(t.kredit).toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={2} className="px-6 py-4 text-right uppercase tracking-wider">
                    TOTAL KESEIMBANGAN (BALANCE):
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-700 text-base">
                    Rp {totalDebetTB.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-700 text-base">
                    Rp {totalKreditTB.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ReportPrintFooter
            preparer="Staff Accounting"
            reviewer="Manager Keuangan"
            approver="Direktur Utama"
          />
        </div>
      ) : (
        <div className="report-print-container bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <ReportPrintHeader
            title="BUKU BESAR PER PERKIRAAN (GENERAL LEDGER)"
            periode={startDate && endDate ? `${startDate} s/d ${endDate}` : 'Periode Berjalan'}
          />

          <div className="space-y-6">
            {bukuBesar.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-brand-700 mr-2">{item.akun.kode_akun}</span>
                    <span className="font-bold text-slate-800">{item.akun.nama_akun}</span>
                    <span className="text-slate-400 ml-2">({item.akun.kategori})</span>
                  </div>
                  <div className="font-bold text-slate-700">
                    Saldo Berjalan: <span className="text-brand-700">Rp {Number(item.akun.saldo_berjalan).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/50 uppercase font-semibold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Keterangan</th>
                      <th className="px-4 py-2 text-right">Debet (Rp)</th>
                      <th className="px-4 py-2 text-right">Kredit (Rp)</th>
                      <th className="px-4 py-2 text-right">Saldo (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(item.mutasi || []).map((m, mIdx) => (
                      <tr key={mIdx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono">{m.tanggal}</td>
                        <td className="px-4 py-2 font-medium text-slate-800">{m.keterangan}</td>
                        <td className="px-4 py-2 text-right">{m.debet > 0 ? Number(m.debet).toLocaleString('id-ID') : '-'}</td>
                        <td className="px-4 py-2 text-right">{m.kredit > 0 ? Number(m.kredit).toLocaleString('id-ID') : '-'}</td>
                        <td className="px-4 py-2 text-right font-bold text-slate-900">{Number(m.saldo).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <ReportPrintFooter
            preparer="Staff Accounting"
            reviewer="Manager Keuangan"
            approver="Direktur Utama"
          />
        </div>
      )}
    </div>
  );
}
