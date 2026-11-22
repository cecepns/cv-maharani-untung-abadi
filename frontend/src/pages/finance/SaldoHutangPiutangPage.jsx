import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, Printer, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import ReportPrintHeader from '../../components/common/ReportPrintHeader';
import ReportPrintFooter from '../../components/common/ReportPrintFooter';

export default function SaldoHutangPiutangPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSaldo(startDate, endDate);
  }, []);

  const fetchSaldo = async (start, end) => {
    try {
      setLoading(true);
      const s = start !== undefined ? start : startDate;
      const e = end !== undefined ? end : endDate;
      const query = s && e ? `?startDate=${s}&endDate=${e}` : '';
      const res = await request.get(`${API_ENDPOINTS.FINANCE.SALDO_HUTANG_PIUTANG}${query}`);
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
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Date Filter */}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={(s, e) => fetchSaldo(s, e)}
        onReset={() => {
          const d = new Date();
          const first = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
          const today = d.toISOString().split('T')[0];
          setStartDate(first);
          setEndDate(today);
          fetchSaldo(first, today);
        }}
        loading={loading}
      />

      {loading ? (
        <LoadingSpinner text="Merekap saldo AP & AR..." />
      ) : (
        <div className="report-print-container bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
          <ReportPrintHeader
            title="LAPORAN SALDO HUTANG & PIUTANG USAHA"
            periode={data?.periode || (startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua Periode')}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Total Piutang Usaha (AR - Hak Tagih Customer)
                  </span>
                  <h3 className="mt-1 text-xl font-black text-emerald-900">
                    Rp {(data?.totalPiutang || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="mt-0.5 text-xs text-emerald-700">Akan cair dari penjualan produk dus</p>
                </div>
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    Total Hutang Usaha (AP - Kewajiban Supplier)
                  </span>
                  <h3 className="mt-1 text-xl font-black text-rose-900">
                    Rp {(data?.totalHutang || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="mt-0.5 text-xs text-rose-700">Wajib dibayar untuk pembelian sheet & bahan</p>
                </div>
                <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Dual Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 print-grid-2 gap-6">
            {/* Piutang Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid">
              <div className="p-3 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Rincian Piutang per Invoice Customer
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Customer & Invoice</th>
                      <th className="p-2.5">Jatuh Tempo</th>
                      <th className="p-2.5 text-right">Sisa Tagihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.piutangCustomer || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400">
                          Tidak ada piutang customer belum lunas.
                        </td>
                      </tr>
                    ) : (
                      (data?.piutangCustomer || []).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900">{p.customer_nama}</p>
                            <p className="font-mono text-brand-600 text-[11px]">{p.nomor_invoice}</p>
                          </td>
                          <td className="p-2.5 text-slate-600 font-mono">{p.jatuh_tempo}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700">
                            Rp {Number(p.sisa_tagihan).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hutang Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid">
              <div className="p-3 bg-rose-50/50 border-b border-rose-100 flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Rincian Hutang per Faktur Supplier
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Supplier & Faktur</th>
                      <th className="p-2.5">Jatuh Tempo</th>
                      <th className="p-2.5 text-right">Sisa Hutang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data?.hutangSupplier || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400">
                          Tidak ada hutang supplier belum lunas.
                        </td>
                      </tr>
                    ) : (
                      (data?.hutangSupplier || []).map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900">{h.supplier_nama}</p>
                            <p className="font-mono text-rose-600 text-[11px]">{h.nomor_faktur_beli}</p>
                          </td>
                          <td className="p-2.5 text-slate-600 font-mono">{h.jatuh_tempo}</td>
                          <td className="p-2.5 text-right font-bold text-rose-700">
                            Rp {Number(h.sisa_tagihan).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <ReportPrintFooter
            preparer="Staff AP/AR"
            reviewer="Manager Keuangan"
            approver="Direktur Utama"
          />
        </div>
      )}
    </div>
  );
}
