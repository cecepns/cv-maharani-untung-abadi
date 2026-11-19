import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, Printer, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SaldoHutangPiutangPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaldo();
  }, []);

  const fetchSaldo = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.FINANCE.SALDO_HUTANG_PIUTANG);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat saldo hutang piutang: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Saldo Hutang & Piutang</h1>
          <p className="text-sm text-slate-500">
            Rekap komprehensif kewajiban ke supplier (Hutang Usaha) dan klaim hak tagih ke customer (Piutang Usaha).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Rekap Posisi Saldo
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Merekap saldo AP & AR..." />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Total Piutang Usaha (AR - Hak Tagih)
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-emerald-900">
                    Rp {(data?.totalPiutang || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-700">Akan cair dari penjualan produk dus</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    Total Hutang Usaha (AP - Kewajiban Supplier)
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-rose-900">
                    Rp {(data?.totalHutang || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="mt-1 text-xs text-rose-700">Wajib dibayar untuk pembelian sheet & bahan</p>
                </div>
                <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Dual Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Piutang Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-emerald-50/40 border-b border-emerald-100 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Rincian Piutang per Invoice Customer
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Customer & No Invoice</th>
                      <th className="p-3">Jatuh Tempo</th>
                      <th className="p-3 text-right">Sisa Tagihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.piutangCustomer || []).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{p.customer_nama}</p>
                          <p className="font-mono text-brand-600">{p.nomor_invoice}</p>
                        </td>
                        <td className="p-3 text-slate-600">{p.jatuh_tempo}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          Rp {Number(p.sisa_tagihan).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hutang Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-rose-50/40 border-b border-rose-100 flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Rincian Hutang per Faktur Supplier
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Supplier & No Faktur</th>
                      <th className="p-3">Jatuh Tempo</th>
                      <th className="p-3 text-right">Sisa Hutang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.hutangSupplier || []).map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{h.supplier_nama}</p>
                          <p className="font-mono text-rose-600">{h.nomor_faktur_beli}</p>
                        </td>
                        <td className="p-3 text-slate-600">{h.jatuh_tempo}</td>
                        <td className="p-3 text-right font-bold text-rose-700">
                          Rp {Number(h.sisa_tagihan).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
