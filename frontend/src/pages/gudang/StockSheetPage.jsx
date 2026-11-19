import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function StockSheetPage() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.GUDANG.STOCK_SHEET, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setStockList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat stok sheet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [page, limit, search]);

  const totalLembar = stockList.reduce((s, it) => s + Number(it.stok_lembar || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gudang: Stok Lembaran Sheet Corrugated</h1>
          <p className="text-sm text-slate-500">
            Monitoring fisik bahan baku lembaran karton siap masuk antrian proses cetak & finishing produksi.
          </p>
        </div>
        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-sm">
          Total Fisik: {totalLembar.toLocaleString('id-ID')} Lembar
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
          placeholder="Cari kode sheet, spesifikasi flute, ukuran..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Menampilkan <span className="text-slate-800 font-bold">{stockList.length}</span> Jenis Lembaran
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat stok fisik gudang sheet..." />
        ) : stockList.length === 0 ? (
          <EmptyState title="Stok lembaran sheet kosong" description="Tidak ada data sheet yang ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Deskripsi Sheet</th>
                  <th className="px-6 py-4">Dimensi (P x L mm)</th>
                  <th className="px-6 py-4">Tipe Flute</th>
                  <th className="px-6 py-4">Substansi Kertas</th>
                  <th className="px-6 py-4">Stok Fisik Lembar</th>
                  <th className="px-6 py-4">Status Ketersediaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockList.map((s) => {
                  const isSafe = s.stok_lembar > s.min_stok;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{s.nama_sheet}</div>
                        <div className="text-xs font-mono text-amber-700 mt-0.5">{s.kode_sheet}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {s.panjang_mm} x {s.lebar_mm} mm
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="warning">{s.flute}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {s.substansi}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-base font-extrabold ${isSafe ? 'text-slate-900' : 'text-rose-600'}`}>
                          {Number(s.stok_lembar).toLocaleString('id-ID')} Lembar
                        </span>
                        <div className="text-[11px] text-slate-400">Min: {s.min_stok} Lbr</div>
                      </td>
                      <td className="px-6 py-4">
                        {isSafe ? (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Stok Aman
                          </Badge>
                        ) : (
                          <Badge variant="danger">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Harus Beli (Min)
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
