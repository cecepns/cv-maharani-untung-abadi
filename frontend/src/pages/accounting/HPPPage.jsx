import React, { useState, useEffect } from 'react';
import { FileCheck, Printer, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function HPPPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHPP();
  }, []);

  const fetchHPP = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.HPP);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan HPP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Harga Pokok Produksi (HPP Dus)</h1>
          <p className="text-sm text-slate-500">
            Perhitungan biaya pokok pembuatan kemasan karton: Bahan sheet lembaran, bahan penolong, tenaga kerja langsung, dan BOP.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Rekap HPP
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Mengkalkulasi HPP pabrik..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900">CV. MAHARANI UNTUNG ABADI</h2>
            <p className="text-sm font-bold text-slate-600">LAPORAN BIAYA PRODUKSI & HPP KARTON BOX</p>
            <p className="text-xs text-slate-500">Periode: {data?.periode}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-100 bg-slate-50 font-bold">
                    <td className="p-3">KOMPONEN BIAYA PRODUKSI PABRIK</td>
                    <td className="p-3 text-right">JUMLAH (RP)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3">Biaya Pemakaian Bahan Baku Sheet Corrugated</td>
                    <td className="p-3 text-right font-semibold">
                      Rp {Number(data?.biaya_bahan_baku_sheet || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3">Biaya Bahan Pembantu (Tinta Flexo, Lem Dextrin, Kawat Stitching, Strapping)</td>
                    <td className="p-3 text-right font-semibold">
                      Rp {Number(data?.biaya_bahan_pembantu_tinta_lem_kawat || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3">Biaya Tenaga Kerja Langsung Operator Mesin</td>
                    <td className="p-3 text-right font-semibold">
                      Rp {Number(data?.biaya_tenaga_kerja_langsung || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3">Biaya Overhead Pabrik (BOP Listrik, Perawatan Mesin, Pisau Pond)</td>
                    <td className="p-3 text-right font-semibold">
                      Rp {Number(data?.biaya_overhead_pabrik || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="bg-amber-50 font-bold text-amber-950 border-b border-amber-200">
                    <td className="p-3">TOTAL BIAYA PRODUKSI PERIODE BERJALAN</td>
                    <td className="p-3 text-right">
                      Rp {Number(data?.total_biaya_produksi || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <td className="p-3">(+) Saldo Barang Dalam Proses (WIP) Awal</td>
                    <td className="p-3 text-right">
                      + Rp {Number(data?.barang_dalam_proses_awal || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <td className="p-3">(-) Saldo Barang Dalam Proses (WIP) Akhir</td>
                    <td className="p-3 text-right">
                      - Rp {Number(data?.barang_dalam_proses_akhir || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-950 font-black text-sm">
                    <td className="p-3">HARGA POKOK PRODUKSI BARANG SELESAI (HPP)</td>
                    <td className="p-3 text-right text-emerald-800">
                      Rp {Number(data?.hpp_selesai || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
