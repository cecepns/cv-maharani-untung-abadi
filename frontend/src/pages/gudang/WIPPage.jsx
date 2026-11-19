import React, { useState, useEffect } from 'react';
import { Factory, Clock, ArrowRight, Printer, Scissors, Layers, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function WIPPage() {
  const [wipList, setWipList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWIP = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.GUDANG.WIP);
      if (res.success) {
        setWipList(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat barang dalam proses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWIP();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Barang Dalam Proses (WIP per SPK)</h1>
          <p className="text-sm text-slate-500">
            Monitoring posisi material lembaran karton yang sedang berjalan di stasiun kerja pabrik (Cetak Flexo, Finishing, Ikat).
          </p>
        </div>
        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-sm">
          {wipList.length} Job Order Aktif di Lantai Pabrik
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Memeriksa status mesin & proses produksi..." />
      ) : wipList.length === 0 ? (
        <EmptyState title="Tidak ada barang dalam proses" description="Semua SPK telah tuntas menjadi Finished Goods." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wipList.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{item.nomor_spk}</span>
                    <Badge variant={item.tahapan_sekarang === 'Cetak' ? 'primary' : 'warning'}>
                      Tahap {item.tahapan_sekarang}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Customer: <strong className="text-slate-800">{item.customer_nama}</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Target Order:</span>
                  <p className="text-base font-extrabold text-brand-700">
                    {Number(item.qty_target).toLocaleString('id-ID')} Pcs
                  </p>
                </div>
              </div>

              {/* Box Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Nama Dus:</span>
                  <p className="font-bold text-slate-800">{item.nama_box}</p>
                </div>
                <div>
                  <span className="text-slate-500">Dimensi PxLxT:</span>
                  <p className="font-bold text-slate-800">{item.ukuran_box}</p>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500">Bahan Sheet Digunakan:</span>
                  <p className="font-semibold text-slate-700">{item.nama_sheet || 'Sheet Corrugated'}</p>
                </div>
                <div className="mt-2">
                  <span className="text-slate-500">Batas Waktu Selesai:</span>
                  <p className="font-bold text-rose-600">{item.target_selesai}</p>
                </div>
              </div>

              {/* Progress Stepper Visualizer */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Posisi Stasiun Kerja:</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className={`p-2 rounded-xl border font-bold ${
                    item.tahapan_sekarang === 'Cetak'
                      ? 'bg-brand-50 border-brand-300 text-brand-700 ring-2 ring-brand-500/20'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <Printer className="w-4 h-4 mx-auto mb-1" />
                    1. Flexo Print
                  </div>
                  <div className={`p-2 rounded-xl border font-bold ${
                    item.tahapan_sekarang === 'Finishing'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-500/20'
                      : item.tahapan_sekarang === 'Ikat' || item.tahapan_sekarang === 'Selesai'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Scissors className="w-4 h-4 mx-auto mb-1" />
                    2. Finishing
                  </div>
                  <div className={`p-2 rounded-xl border font-bold ${
                    item.tahapan_sekarang === 'Ikat'
                      ? 'bg-purple-50 border-purple-300 text-purple-700 ring-2 ring-purple-500/20'
                      : item.tahapan_sekarang === 'Selesai'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Layers className="w-4 h-4 mx-auto mb-1" />
                    3. Ikat Strapping
                  </div>
                  <div className={`p-2 rounded-xl border font-bold ${
                    item.tahapan_sekarang === 'Selesai'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                    4. Gudang FG
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
