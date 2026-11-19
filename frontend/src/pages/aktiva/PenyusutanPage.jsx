import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PenyusutanPage() {
  const [aktivaList, setAktivaList] = useState([]);
  const [periode, setPeriode] = useState('2026-11');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAktiva();
  }, []);

  const fetchAktiva = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.AKTIVA.LIST, { limit: 100 });
      if (res.success) {
        setAktivaList(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data aktiva: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProsesPenyusutan = async () => {
    try {
      setProcessing(true);
      const res = await request.post(API_ENDPOINTS.AKTIVA.PROSES_PENYUSUTAN, { periode });
      toast.success(res.message || 'Penyusutan bulanan berhasil dijalankan!');
      fetchAktiva();
    } catch (err) {
      toast.error(err.message || 'Gagal menjalankan penyusutan');
    } finally {
      setProcessing(false);
    }
  };

  const totalBebanBulanan = aktivaList.reduce((sum, a) => {
    if (a.status === 'Aktif') {
      return sum + Math.round((a.harga_perolehan - a.nilai_residu) / (a.umur_ekonomis_tahun * 12));
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proses Penyusutan Aktiva Tetap per Bulan</h1>
          <p className="text-sm text-slate-500">
            Kalkulasi depresiasi garis lurus mesin flexo, mesin pond, dan truk pengiriman beserta posting otomatis ke jurnal umum.
          </p>
        </div>
      </div>

      {/* Control Box */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Metode Garis Lurus (Straight-line Method)
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">Jalankan Amortisasi & Depresiasi Bulanan</h2>
          <p className="mt-1 text-xs text-slate-300 max-w-xl">
            Sistem akan menghitung beban depresiasi tiap mesin pabrik & kendaraan operasional, menambah akumulasi penyusutan, dan membuat jurnal debet Beban Penyusutan vs kredit Akumulasi Penyusutan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="month"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-800 text-white rounded-xl border border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-auto"
          />
          <button
            onClick={handleProsesPenyusutan}
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all w-full sm:w-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Menjalankan...' : 'Proses Penyusutan Sekarang'}
          </button>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Simulasi Beban Depresiasi Tiap Aset Bulan Ini
          </span>
          <span className="text-sm font-bold text-amber-800">
            Total Beban Bulanan: Rp {totalBebanBulanan.toLocaleString('id-ID')}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Memuat daftar depresiasi..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nama Mesin / Kendaraan</th>
                  <th className="px-6 py-4">Harga Beli Aset</th>
                  <th className="px-6 py-4 text-center">Masa Manfaat</th>
                  <th className="px-6 py-4 text-right">Beban Penyusutan / Bulan</th>
                  <th className="px-6 py-4 text-right">Akumulasi Sampai Saat Ini</th>
                  <th className="px-6 py-4 text-right">Sisa Nilai Buku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aktivaList.map((a) => {
                  const bebanBulan = Math.round((a.harga_perolehan - a.nilai_residu) / (a.umur_ekonomis_tahun * 12));
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{a.nama_aktiva}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{a.kode_aktiva} • {a.kategori}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        Rp {Number(a.harga_perolehan).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-700">
                        {a.umur_ekonomis_tahun} Tahun
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-amber-800">
                        Rp {bebanBulan.toLocaleString('id-ID')} / bln
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-rose-600">
                        Rp {Number(a.akumulasi_penyusutan).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-brand-700">
                        Rp {Number(a.nilai_buku).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
