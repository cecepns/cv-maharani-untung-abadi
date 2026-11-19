import React, { useState, useEffect } from 'react';
import { Box, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function StockFGPage() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.GUDANG.STOCK_BARANG_JADI, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setStockList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat stok barang jadi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [page, limit, search]);

  const totalBox = stockList.reduce((s, it) => s + Number(it.stok_qty || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gudang: Stok Barang Jadi (Finished Goods)</h1>
          <p className="text-sm text-slate-500">
            Karton box packaging yang telah lolos QC, proses ikat strapping, dan siap diangkut armada pengiriman.
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold text-sm">
          Total Box Siap Kirim: {totalBox.toLocaleString('id-ID')} Pcs
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari kode box, nama box, tipe flute..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Item Dus
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat stok gudang FG..." />
        ) : stockList.length === 0 ? (
          <EmptyState title="Tidak ada stok barang jadi" description="Semua dus telah terkirim atau belum ada produksi selesai." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Dus Kemasan</th>
                  <th className="px-6 py-4">Dimensi (P x L x T mm)</th>
                  <th className="px-6 py-4">Flute & Substansi</th>
                  <th className="px-6 py-4">Metode Sambungan</th>
                  <th className="px-6 py-4">Stok Barang Jadi Siap Kirim</th>
                  <th className="px-6 py-4">Status Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{b.nama_barang}</div>
                      <div className="text-xs font-mono text-brand-600 mt-0.5">{b.kode_barang}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                      {b.panjang_mm} x {b.lebar_mm} x {b.tinggi_mm} mm
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary">{b.tipe_flute}</Badge>
                      <div className="text-xs text-slate-500 mt-0.5">{b.substansi}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {b.jenis_sambungan}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-extrabold text-emerald-700">
                        {Number(b.stok_qty).toLocaleString('id-ID')} Pcs
                      </span>
                      <div className="text-[11px] text-slate-400">
                        ± {Math.round(b.stok_qty / 25)} Ikat (@25 pcs)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready Stock
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          limit={limit}
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
