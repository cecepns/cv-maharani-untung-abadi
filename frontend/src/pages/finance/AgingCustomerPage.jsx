import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Printer, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AgingCustomerPage() {
  const [agingData, setAgingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAging();
  }, []);

  const fetchAging = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.FINANCE.AGING_PIUTANG_CUSTOMER);
      if (res.success) {
        setAgingData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat aging piutang: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPiutang = agingData.reduce((s, it) => s + Number(it.sisa_tagihan || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Aging / Umur Piutang per Customer</h1>
          <p className="text-sm text-slate-500">
            Analisis umur jatuh tempo piutang penjualan dus: Lancar (0-30 Hari), 31-60 Hari, 61-90 Hari, dan &gt;90 Hari (Macet).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Aging Piutang
        </button>
      </div>

      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Total Outstanding Piutang</span>
          <p className="text-xl font-black text-amber-900 mt-1">Rp {totalPiutang.toLocaleString('id-ID')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-800">
          <Clock className="w-4 h-4 text-amber-600" />
          Semua piutang terpantau dalam batas tempo kredit aman.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Menganalisis umur piutang pelanggan..." />
        ) : agingData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Semua customer telah lunas (0 saldo piutang).</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Customer & No Invoice</th>
                  <th className="px-6 py-4">Jatuh Tempo</th>
                  <th className="px-6 py-4 text-right">Total Tagihan</th>
                  <th className="px-6 py-4 text-right">0 - 30 Hari (Lancar)</th>
                  <th className="px-6 py-4 text-right">31 - 60 Hari</th>
                  <th className="px-6 py-4 text-right">&gt; 90 Hari</th>
                  <th className="px-6 py-4">Status Kolektibilitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agingData.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{it.customer_nama}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{it.nomor_invoice}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {it.jatuh_tempo}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      Rp {Number(it.total_tagihan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      Rp {Number(it.aging_0_30).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      Rp {Number(it.aging_31_60).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      Rp {Number(it.aging_over_90).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {it.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
