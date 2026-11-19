import React, { useState, useEffect } from 'react';
import { TrendingUp, Printer, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function LabaRugiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabaRugi();
  }, []);

  const fetchLabaRugi = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.LABA_RUGI);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan laba rugi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Laba Rugi (Income Statement)</h1>
          <p className="text-sm text-slate-500">
            Kinerja profitabilitas pabrik: Total Penjualan Dus dikurangi HPP Produksi dan Beban Usaha Operasional.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Laba Rugi
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Mengkalkulasi laba rugi pabrik..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6 font-sans">
          {/* Header Report */}
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900">CV. MAHARANI UNTUNG ABADI</h2>
            <p className="text-sm font-bold text-slate-600">LAPORAN LABA RUGI KOMPREHENSIF</p>
            <p className="text-xs text-slate-500">Periode: {data?.periode}</p>
          </div>

          <div className="space-y-6 text-sm">
            {/* 1. Pendapatan */}
            <div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg font-bold text-slate-900">
                <span>PENDAPATAN USAHA</span>
                <span>Rp {Number(data?.pendapatan?.total_pendapatan || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="px-4 py-2 space-y-1 text-slate-600 text-xs">
                <div className="flex justify-between">
                  <span>Penjualan Karton Box & Sheet Corrugated</span>
                  <span>Rp {Number(data?.pendapatan?.penjualan_dus || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* 2. HPP */}
            <div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg font-bold text-slate-900">
                <span>HARGA POKOK PENJUALAN (HPP)</span>
                <span className="text-rose-700">- Rp {Number(data?.hpp?.total_hpp || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="px-4 py-2 space-y-1 text-slate-600 text-xs">
                <div className="flex justify-between">
                  <span>Biaya Bahan Baku Sheet & Bahan Pembantu (Tinta/Lem/Kawat)</span>
                  <span>Rp {Number(data?.hpp?.biaya_sheet_bahan || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Tenaga Kerja Langsung Pabrik</span>
                  <span>Rp {Number(data?.hpp?.biaya_tenaga_kerja_langsung || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* LABA KOTOR */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex justify-between items-center font-bold text-slate-900 text-sm">
              <span>LABA KOTOR (GROSS PROFIT):</span>
              <span className="text-base text-amber-900 font-extrabold">
                Rp {Number(data?.laba_kotor || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* 3. Beban Operasional */}
            <div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg font-bold text-slate-900">
                <span>BEBAN OPERASIONAL & UMUM</span>
                <span className="text-rose-700">- Rp {Number(data?.beban_operasional?.total_beban || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="px-4 py-2 space-y-1.5 text-slate-600 text-xs">
                <div className="flex justify-between">
                  <span>Beban Gaji Karyawan & Staff</span>
                  <span>Rp {Number(data?.beban_operasional?.gaji_karyawan || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beban Listrik Pabrik & Air</span>
                  <span>Rp {Number(data?.beban_operasional?.listrik_air || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beban Bahan Bakar Armada & Pengiriman</span>
                  <span>Rp {Number(data?.beban_operasional?.bbm_logistik || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beban Penyusutan Mesin & Kendaraan</span>
                  <span>Rp {Number(data?.beban_operasional?.penyusutan_mesin || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* LABA BERSIH */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex justify-between items-center font-black text-emerald-950 text-base">
              <span>LABA BERSIH PERIODE BERJALAN (NET PROFIT):</span>
              <span className="text-xl text-emerald-700">
                Rp {Number(data?.laba_bersih || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
