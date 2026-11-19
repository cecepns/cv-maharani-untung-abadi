import React, { useState, useEffect } from 'react';
import { Scissors, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function StockPembantuPage() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.GUDANG.STOCK_PEMBANTU, {
        page,
        limit,
        search,
      });
      if (res.success) {
        setStockList(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat stok bahan pembantu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [page, limit, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gudang: Stok Bahan Pembantu</h1>
          <p className="text-sm text-slate-500">
            Ketersediaan tinta flexo waterbased, lem dextrin, kawat stitching, dan tali strapping ikat dus.
          </p>
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
          placeholder="Cari nama bahan pembantu, kategori..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Material Terdata
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat stok material..." />
        ) : stockList.length === 0 ? (
          <EmptyState title="Stok bahan pembantu kosong" description="Tidak ada data material yang ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Material</th>
                  <th className="px-6 py-4">Kategori Bahan</th>
                  <th className="px-6 py-4">Satuan Ukuran</th>
                  <th className="px-6 py-4">Stok Fisik Tersedia</th>
                  <th className="px-6 py-4">Status Logistik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockList.map((b) => {
                  const isSafe = b.stok > b.min_stok;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{b.nama_bahan}</div>
                        <div className="text-xs font-mono text-brand-600 mt-0.5">{b.kode_bahan}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            b.kategori === 'Tinta Flexo'
                              ? 'primary'
                              : b.kategori === 'Lem Karton'
                              ? 'warning'
                              : 'purple'
                          }
                        >
                          {b.kategori}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {b.satuan}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-base font-extrabold ${isSafe ? 'text-slate-900' : 'text-rose-600'}`}>
                          {Number(b.stok).toLocaleString('id-ID')} {b.satuan}
                        </span>
                        <div className="text-[11px] text-slate-400">Min: {b.min_stok} {b.satuan}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isSafe ? (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Siap Produksi
                          </Badge>
                        ) : (
                          <Badge variant="danger">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Segera Restock
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
