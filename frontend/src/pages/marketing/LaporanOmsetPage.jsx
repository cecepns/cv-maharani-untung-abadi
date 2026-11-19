import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Award, Printer, ArrowUpRight, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function LaporanOmsetPage() {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'sales'
  const [customerOmset, setCustomerOmset] = useState([]);
  const [salesOmset, setSalesOmset] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOmsetData();
  }, []);

  const fetchOmsetData = async () => {
    try {
      setLoading(true);
      const [custRes, salesRes] = await Promise.all([
        request.get(API_ENDPOINTS.MARKETING.LAPORAN_OMSET_CUSTOMER),
        request.get(API_ENDPOINTS.MARKETING.LAPORAN_OMSET_SALES),
      ]);
      if (custRes.success) setCustomerOmset(custRes.data);
      if (salesRes.success) setSalesOmset(salesRes.data);
    } catch (err) {
      toast.error('Gagal memuat laporan omset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalOmsetAll = customerOmset.reduce((s, c) => s + Number(c.total_omset || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Omset Penjualan</h1>
          <p className="text-sm text-slate-500">
            Analisis kontribusi pendapatan pabrik per pelanggan industri dan pencapaian target sales marketing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Rekap Omset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'customer'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-brand-600" />
          Omset per Customer
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sales'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          Omset per Sales Person
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat laporan omset..." />
      ) : activeTab === 'customer' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rekap Pendapatan per Pelanggan
              </span>
              <span className="text-sm font-bold text-brand-700">
                Total Omset: Rp {totalOmsetAll.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Peringkat & Customer</th>
                    <th className="px-6 py-4">Kode Pelanggan</th>
                    <th className="px-6 py-4 text-center">Jumlah Order (SO)</th>
                    <th className="px-6 py-4 text-right">Total Akumulasi Omset</th>
                    <th className="px-6 py-4 text-right">Porsi Kontribusi (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerOmset.map((c, idx) => {
                    const share = totalOmsetAll > 0 ? ((c.total_omset / totalOmsetAll) * 100).toFixed(1) : 0;
                    return (
                      <tr key={c.customer_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900">{c.nama_customer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-brand-600 font-semibold">
                          {c.kode_customer}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                          {c.order_count} SO
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-700 text-sm">
                          Rp {Number(c.total_omset).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-700">
                          {share}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pencapaian Target Penjualan Tiap Sales
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Nama Sales</th>
                    <th className="px-6 py-4">Kode Sales</th>
                    <th className="px-6 py-4 text-right">Target Omset Bulanan</th>
                    <th className="px-6 py-4 text-right">Realisasi Omset</th>
                    <th className="px-6 py-4">Pencapaian (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesOmset.map((s) => (
                    <tr key={s.sales_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {s.nama_sales}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-amber-700 font-semibold">
                        {s.kode_sales}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700">
                        Rp {Number(s.target_omset).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-brand-700">
                        Rp {Number(s.realisasi_omset).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-48">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-800">{s.pencapaian_persen}%</span>
                            <span className="text-slate-400">Target tercapai</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-brand-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, s.pencapaian_persen)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
