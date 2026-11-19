import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Factory,
  Layers,
  Box,
  Truck,
  CreditCard,
  FileCheck,
  PlusCircle,
  ArrowRight,
  Printer,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [runningSpk, setRunningSpk] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, chartRes, spkRes, soRes] = await Promise.all([
        request.get(API_ENDPOINTS.DASHBOARD.SUMMARY),
        request.get(API_ENDPOINTS.DASHBOARD.CHART_SALES),
        request.get(API_ENDPOINTS.PRODUKSI.SPK, { limit: 5, status: 'Berjalan' }),
        request.get(API_ENDPOINTS.MARKETING.SALES_ORDERS, { limit: 5 }),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (chartRes.success) setChartData(chartRes.data);
      if (spkRes.success) setRunningSpk(spkRes.data);
      if (soRes.success) setRecentOrders(soRes.data);
    } catch (err) {
      toast.error('Gagal memuat ringkasan dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat ringkasan operasional CV. Maharani Untung Abadi..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Box className="w-3.5 h-3.5" />
            Packaging & Corrugated Box Manufacturing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Portal Operasional Pabrik
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            CV. Maharani Untung Abadi mengelola integrasi penuh dari pembelian lembaran sheet karton, printing flexo, stitching & finishing, hingga pengiriman dan pembukuan keuangan.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/marketing/sales-orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Order Penjualan Baru
            </Link>
            <Link
              to="/produksi/spk"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700"
            >
              <Factory className="w-4 h-4" />
              Pantau SPK Produksi
            </Link>
          </div>
        </div>

        {/* Decorative background box silhouette */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none">
          <Box className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Omset Penjualan"
          value={`Rp ${(summary?.totalOmset || 0).toLocaleString('id-ID')}`}
          subtitle="Akumulasi Sales Order Disetujui"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="SPK Produksi Berjalan"
          value={`${summary?.spkBerjalan || 0} SPK`}
          subtitle="Proses Cetak, Pond, & Stitching"
          icon={Factory}
          color="amber"
        />
        <StatCard
          title="Piutang Customer (AR)"
          value={`Rp ${(summary?.totalPiutang || 0).toLocaleString('id-ID')}`}
          subtitle="Belum jatuh tempo & termin"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Stok Bahan Sheet (Lembar)"
          value={`${(summary?.stokSheetLembar || 0).toLocaleString('id-ID')} Lbr`}
          subtitle="B-Flute, C-Flute, E-Flute, Double Wall"
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Production & Sales Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SPK Produksi Berjalan */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">SPK Produksi Corrugated Aktif</h3>
                  <p className="text-xs text-slate-400">Monitoring alur barang lembaran hingga barang jadi</p>
                </div>
              </div>
              <Link
                to="/produksi/spk"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {runningSpk.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Tidak ada SPK berjalan saat ini</p>
              ) : (
                runningSpk.map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.nomor_spk}</span>
                        <Badge
                          variant={
                            item.tahapan_sekarang === 'Cetak'
                              ? 'primary'
                              : item.tahapan_sekarang === 'Finishing'
                              ? 'warning'
                              : item.tahapan_sekarang === 'Ikat'
                              ? 'purple'
                              : 'success'
                          }
                        >
                          Tahap {item.tahapan_sekarang}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{item.nama_box}</p>
                      <p className="text-xs text-slate-500">
                        {item.customer_nama} • Spek: {item.ukuran_box}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-slate-400">Target Order</p>
                        <p className="text-sm font-bold text-slate-800">
                          {Number(item.qty_target).toLocaleString('id-ID')} Pcs
                        </p>
                      </div>
                      <Link
                        to="/produksi/spk"
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600"
                        title="Detail SPK"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 bg-amber-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl flex items-center justify-between text-xs text-amber-900">
            <span className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Alur Standar: Sheet Masuk ➔ Cetak Flexo ➔ Finishing (Pond/Stitching/Glue) ➔ Ikat ➔ Gudang FG
            </span>
          </div>
        </div>

        {/* Quick Actions & Recent SO */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Sales Order Terakhir</h3>
              <Link to="/marketing/sales-orders" className="text-xs font-semibold text-brand-600">
                Semua SO
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentOrders.map((so) => (
                <div key={so.id} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{so.nomor_so}</p>
                    <p className="text-xs text-slate-600 font-medium truncate max-w-[180px]">{so.customer_nama}</p>
                    <p className="text-[11px] text-slate-400">{so.tanggal_so}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">
                      Rp {Number(so.total_nilai).toLocaleString('id-ID')}
                    </p>
                    <Badge
                      variant={
                        so.status === 'Selesai'
                          ? 'success'
                          : so.status === 'Diproses'
                          ? 'warning'
                          : 'primary'
                      }
                      size="xs"
                    >
                      {so.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav Shortcut Cards */}
          <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Link
              to="/marketing/surat-jalan"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors group"
            >
              <Truck className="w-5 h-5 mx-auto text-brand-600 group-hover:scale-110 transition-transform" />
              <span className="block mt-1 text-[11px] font-bold text-slate-700">Surat Jalan</span>
            </Link>
            <Link
              to="/marketing/invoices"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors group"
            >
              <CreditCard className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="block mt-1 text-[11px] font-bold text-slate-700">Nota Penjualan</span>
            </Link>
            <Link
              to="/gudang/stock-sheet"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors group"
            >
              <Layers className="w-5 h-5 mx-auto text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="block mt-1 text-[11px] font-bold text-slate-700">Stok Sheet</span>
            </Link>
            <Link
              to="/accounting/laba-rugi"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors group"
            >
              <TrendingUp className="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="block mt-1 text-[11px] font-bold text-slate-700">Laba Rugi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
