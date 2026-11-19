import React, { useState, useEffect } from 'react';
import { Award, Clock, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AgingSalesPage() {
  const [salesAging, setSalesAging] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgingSales();
  }, []);

  const fetchAgingSales = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.FINANCE.AGING_PIUTANG_SALES);
      if (res.success) {
        setSalesAging(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat aging sales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Aging Piutang per Sales</h1>
          <p className="text-sm text-slate-500">
            Monitoring efektivitas penagihan piutang dan tingkat kolektibilitas per tenaga marketing/sales.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Aging Sales
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat laporan performa penagihan sales..." />
        ) : salesAging.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Belum ada data aging sales.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nama Tenaga Sales</th>
                  <th className="px-6 py-4 text-right">Total Piutang Berjalan</th>
                  <th className="px-6 py-4 text-right">Kolektibilitas Lancar</th>
                  <th className="px-6 py-4 text-right">Dalam Perhatian</th>
                  <th className="px-6 py-4 text-right">Kurang Lancar / Macet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesAging.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {s.sales_nama}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-brand-700">
                      Rp {Number(s.total_piutang).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      Rp {Number(s.lancar).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      Rp {Number(s.perhatian).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      Rp {Number(s.macet).toLocaleString('id-ID')}
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
