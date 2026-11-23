import React, { useState, useEffect } from 'react';
import { Scissors, AlertTriangle, CheckCircle2, FolderPlus, Trash2, Plus, Tag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function StockPembantuPage() {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Kategori Management State
  const [kategoriList, setKategoriList] = useState([]);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState('');
  const [kategoriLoading, setKategoriLoading] = useState(false);
  const [deleteKategoriDialog, setDeleteKategoriDialog] = useState({ isOpen: false, id: null, name: '' });

  const fetchKategori = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.GUDANG.KATEGORI_PEMBANTU);
      if (res.success && Array.isArray(res.data)) {
        setKategoriList(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.GUDANG.STOCK_PEMBANTU, {
        page,
        limit,
        search,
      });
      if (res.success) {
        let items = res.data || [];
        if (selectedKategori) {
          items = items.filter((b) => b.kategori === selectedKategori);
        }
        setStockList(items);
        setPagination({
          ...res.pagination,
          total: selectedKategori ? items.length : res.pagination.total,
        });
      }
    } catch (err) {
      toast.error('Gagal memuat stok bahan pembantu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  useEffect(() => {
    fetchStock();
  }, [page, limit, search, selectedKategori]);

  const handleAddKategori = async (e) => {
    e.preventDefault();
    if (!newKategoriName.trim()) {
      toast.error('Nama kategori tidak boleh kosong');
      return;
    }
    try {
      setKategoriLoading(true);
      const res = await request.post(API_ENDPOINTS.GUDANG.KATEGORI_PEMBANTU, {
        nama_kategori: newKategoriName.trim(),
      });
      if (res.success) {
        toast.success(`Kategori "${newKategoriName}" berhasil ditambahkan`);
        setNewKategoriName('');
        fetchKategori();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan kategori');
    } finally {
      setKategoriLoading(false);
    }
  };

  const handleDeleteKategori = async () => {
    try {
      setKategoriLoading(true);
      const res = await request.delete(
        API_ENDPOINTS.GUDANG.KATEGORI_PEMBANTU_DETAIL(deleteKategoriDialog.id)
      );
      if (res.success) {
        toast.success(`Kategori "${deleteKategoriDialog.name}" berhasil dihapus`);
        setDeleteKategoriDialog({ isOpen: false, id: null, name: '' });
        fetchKategori();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus kategori');
    } finally {
      setKategoriLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gudang: Stok Bahan Pembantu</h1>
          <p className="text-sm text-slate-500">
            Ketersediaan tinta flexo waterbased, lem dextrin, kawat stitching, plat polimer, dan tali strapping.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsKategoriModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-all"
          >
            <Tag className="w-4 h-4 text-brand-600" />
            Kelola Kategori Bahan
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Cari nama bahan pembantu, kategori..."
            className="w-full sm:w-72"
          />
          {/* Filter Pills Kategori */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedKategori('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedKategori === ''
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>
            {kategoriList.map((k) => (
              <button
                key={k.id || k.nama_kategori}
                type="button"
                onClick={() => setSelectedKategori(k.nama_kategori)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedKategori === k.nama_kategori
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k.nama_kategori}
              </button>
            ))}
          </div>
        </div>

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
                              : b.kategori === 'Kawat Stitching'
                              ? 'purple'
                              : 'slate'
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

      {/* Modal Kelola Kategori Bahan */}
      <Modal
        isOpen={isKategoriModalOpen}
        onClose={() => setIsKategoriModalOpen(false)}
        title="Kelola Kategori Bahan Pembantu"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tambahkan kategori baru untuk bahan penolong pabrik seperti Tinta, Lem, Kawat, Pisau Pond, Plat Polimer, Lakban, dll.
          </p>

          <form onSubmit={handleAddKategori} className="flex gap-2">
            <input
              type="text"
              value={newKategoriName}
              onChange={(e) => setNewKategoriName(e.target.value)}
              placeholder="Contoh: Pisau Pond / Plat Polimer"
              className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={kategoriLoading || !newKategoriName.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </form>

          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {kategoriList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">Belum ada kategori bahan.</div>
            ) : (
              kategoriList.map((k) => (
                <div key={k.id || k.nama_kategori} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-800">{k.nama_kategori}</span>
                  </div>
                  {k.id && (
                    <button
                      type="button"
                      onClick={() => setDeleteKategoriDialog({ isOpen: true, id: k.id, name: k.nama_kategori })}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsKategoriModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Kategori Dialog */}
      <ConfirmDialog
        isOpen={deleteKategoriDialog.isOpen}
        onClose={() => setDeleteKategoriDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDeleteKategori}
        isLoading={kategoriLoading}
        title="Hapus Kategori Bahan"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteKategoriDialog.name}"?`}
      />
    </div>
  );
}
