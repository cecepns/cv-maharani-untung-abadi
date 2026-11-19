import React, { useState, useEffect } from 'react';
import { Landmark, ArrowDownRight, ArrowUpRight, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BankHarianPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBank();
  }, []);

  const fetchBank = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.LAPORAN_BANK_HARIAN);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Rekening Koran Bank Harian</h1>
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

      {loading ? (
        <LoadingSpinner text="Memuat saldo rekening bank..." />
      ) : (
        <div className="space-y-6">
          {/* Account Card Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-brand-900 to-blue-950 p-6 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Rekening Terpilih:</span>
              <h2 className="text-xl font-bold mt-1">{report?.rekening}</h2>
              <p className="text-xs text-blue-300 mt-0.5">Tanggal Valuta: {report?.tanggal}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-200">Saldo Akhir Efektif:</span>
              <p className="text-2xl font-black text-white mt-1">
                Rp {Number(report?.saldoAkhir || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mutasi Rekening Bank Hari Ini
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Jam & Referensi</th>
                    <th className="px-6 py-4">Uraian Transaksi Bank</th>
                    <th className="px-6 py-4">Arah Dana</th>
                    <th className="px-6 py-4 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report?.rincian || []).map((r, idx) => {
                    const isMasuk = r.jenis === 'Masuk';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">
                          <span className="font-bold text-slate-800">{r.no_ref}</span>
                          <span className="text-slate-400 ml-2">{r.jam}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {r.uraian}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {isMasuk ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            {r.jenis === 'Masuk' ? 'Kredit (Masuk)' : 'Debet (Keluar)'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-extrabold ${isMasuk ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isMasuk ? '+' : '-'} Rp {Number(r.nominal).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
