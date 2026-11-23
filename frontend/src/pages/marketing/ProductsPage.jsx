import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Box, Layers, Filter, CheckCircle2, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchableSelect from '../../components/common/SearchableSelect';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterFlute, setFilterFlute] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    kode_barang: '',
    nama_barang: '',
    jenis_barang: 'Box',
    tipe_flute: 'B/F',
    substansi: 'K125/M125/K125',
    panjang_mm: 300,
    lebar_mm: 200,
    tinggi_mm: 200,
    jenis_sambungan: 'Stitching',
    stok_qty: 1000,
    satuan: 'Pcs',
    harga_jual: 3500,
    min_stok: 200,
    berat_roll_kg: 25,
    harga_per_kg: 12000,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.PRODUCTS, {
        page,
        limit,
        search,
        jenis: filterJenis || undefined,
        flute: filterFlute || undefined,
      });
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat produk: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search, filterJenis, filterFlute]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      kode_barang: '',
      nama_barang: '',
      jenis_barang: 'Box',
      tipe_flute: 'B/F',
      substansi: 'K125/M125/K125',
      panjang_mm: 300,
      lebar_mm: 200,
      tinggi_mm: 200,
      jenis_sambungan: 'Stitching',
      stok_qty: 1000,
      satuan: 'Pcs',
      harga_jual: 3500,
      min_stok: 200,
      berat_roll_kg: 25,
      harga_per_kg: 12000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({
      id: item.id,
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      jenis_barang: item.jenis_barang || 'Box',
      tipe_flute: item.tipe_flute || 'B/F',
      substansi: item.substansi || 'K125/M125/K125',
      panjang_mm: item.panjang_mm || 0,
      lebar_mm: item.lebar_mm || 0,
      tinggi_mm: item.tinggi_mm || 0,
      jenis_sambungan: item.jenis_sambungan || 'Stitching',
      stok_qty: item.stok_qty || 0,
      satuan: item.satuan || (item.jenis_barang === 'Single Face Roll' ? 'Roll' : 'Pcs'),
      harga_jual: item.harga_jual || 0,
      min_stok: item.min_stok || 100,
      berat_roll_kg: item.berat_roll_kg || 0,
      harga_per_kg: item.harga_per_kg || 0,
    });
    setIsModalOpen(true);
  };

  // Sync harga jual saat ubah berat roll atau harga per kg pada Single Face Roll
  const handleBeratOrHargaKgChange = (newBerat, newHargaKg) => {
    const berat = Number(newBerat) || 0;
    const hargaKg = Number(newHargaKg) || 0;
    const calcHargaJual = Math.round(berat * hargaKg);
    setFormData((prev) => ({
      ...prev,
      berat_roll_kg: berat,
      harga_per_kg: hargaKg,
      harga_jual: calcHargaJual > 0 ? calcHargaJual : prev.harga_jual,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_barang.trim()) {
      toast.error('Nama barang wajib diisi!');
      return;
    }

    try {
      setFormLoading(true);
      if (isEditing) {
        await request.put(API_ENDPOINTS.MARKETING.PRODUCT_DETAIL(formData.id), formData);
        toast.success('Produk packaging berhasil diperbarui');
      } else {
        await request.post(API_ENDPOINTS.MARKETING.PRODUCTS, formData);
        toast.success('Produk baru berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan produk');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.MARKETING.PRODUCT_DETAIL(deleteDialog.id));
      toast.success('Produk berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus produk');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Persediaan Box & Sheet</h1>
          <p className="text-sm text-slate-500">
            Spesifikasi kemasan karton: Dus Box, Sheet Lembaran, dan Single Face Roll (gulungan).
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Box / Roll
        </button>
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
            placeholder="Cari kode/nama dus..."
            className="w-full sm:w-64"
          />

          <SearchableSelect
            className="w-full sm:w-52 text-xs font-semibold"
            value={filterJenis}
            onChange={(val) => {
              setFilterJenis(val || '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Kemasan' },
              { value: 'Box', label: 'Karton Box' },
              { value: 'Sheet', label: 'Sheet Lembaran' },
              { value: 'Single Face Roll', label: 'Single Face Roll' },
            ]}
            placeholder="Pilih Jenis..."
            isClearable
          />

          <SearchableSelect
            className="w-full sm:w-52 text-xs font-semibold"
            value={filterFlute}
            onChange={(val) => {
              setFilterFlute(val || '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Flute' },
              { value: 'B/F', label: 'B/F (B Flute ~3mm)' },
              { value: 'C/F', label: 'C/F (C Flute ~4mm)' },
              { value: 'E/F', label: 'E/F (E Flute ~1.5mm Micro)' },
              { value: 'B/C Double Wall', label: 'B/C Double Wall (~7mm)' },
            ]}
            placeholder="Pilih Flute..."
            isClearable
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Item Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat data spesifikasi dus & roll..." />
        ) : products.length === 0 ? (
          <EmptyState
            title="Produk tidak ditemukan"
            description="Tidak ada item yang cocok dengan filter atau kata kunci Anda."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Box Baru
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode & Nama Dus</th>
                  <th className="px-6 py-4">Jenis & Flute</th>
                  <th className="px-6 py-4">Dimensi / Berat</th>
                  <th className="px-6 py-4">Substansi Kertas</th>
                  <th className="px-6 py-4">Sambungan</th>
                  <th className="px-6 py-4">Harga Jual</th>
                  <th className="px-6 py-4">Stok Saat Ini</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLowStock = p.stok_qty <= p.min_stok;
                  const isSingleFace = p.jenis_barang === 'Single Face Roll';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.nama_barang}</div>
                        <div className="text-xs font-mono text-amber-700 mt-0.5">{p.kode_barang}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.jenis_barang === 'Box'
                              ? 'primary'
                              : isSingleFace
                              ? 'purple'
                              : 'warning'
                          }
                        >
                          {p.jenis_barang}
                        </Badge>
                        <div className="text-xs font-semibold text-slate-700 mt-1">{p.tipe_flute}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-700">
                        {isSingleFace ? (
                          <div>
                            <span className="font-bold text-purple-700">{p.berat_roll_kg ? `${p.berat_roll_kg} Kg / Roll` : '1 Roll'}</span>
                            {p.lebar_mm > 0 && <div className="text-[11px] text-slate-400">Lebar: {p.lebar_mm} mm</div>}
                          </div>
                        ) : (
                          `${p.panjang_mm} x ${p.lebar_mm} ${p.tinggi_mm > 0 ? `x ${p.tinggi_mm}` : ''} mm`
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                        {p.substansi}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {p.jenis_sambungan}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          Rp {Number(p.harga_jual).toLocaleString('id-ID')}
                          <span className="text-xs font-normal text-slate-400 ml-1">/ {p.satuan || 'Pcs'}</span>
                        </div>
                        {isSingleFace && p.harga_per_kg > 0 && (
                          <div className="text-[11px] font-semibold text-purple-600">
                            (Rp {Number(p.harga_per_kg).toLocaleString('id-ID')} / kg)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {Number(p.stok_qty).toLocaleString('id-ID')} {p.satuan}
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">
                              Min Stok
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, id: p.id, name: p.nama_barang })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Ubah Spesifikasi Dus / Sheet / Roll' : 'Tambah Kemasan / Dus Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Barang</label>
              <input
                type="text"
                value={formData.kode_barang}
                onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                placeholder="Contoh: BOX-006 / SFR-001 (Otomatis jika kosong)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kemasan / Dus / Roll <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_barang}
                onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                placeholder="Single Face Roll 120cm / Box Biskuit 400x300x250"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kemasan</label>
              <SearchableSelect
                value={formData.jenis_barang}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    jenis_barang: val,
                    satuan: val === 'Single Face Roll' ? 'Roll' : formData.satuan === 'Roll' ? 'Pcs' : formData.satuan,
                    jenis_sambungan: val === 'Single Face Roll' ? 'Roll' : formData.jenis_sambungan,
                  });
                }}
                options={[
                  { value: 'Box', label: 'Karton Box Jadi (Dus RSC / A1)' },
                  { value: 'Sheet', label: 'Sheet Lembaran (Karton Lembar)' },
                  { value: 'Single Face Roll', label: 'Single Face Roll (Gulungan)' },
                ]}
                placeholder="Pilih jenis kemasan..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Flute Corrugated</label>
              <SearchableSelect
                value={formData.tipe_flute}
                onChange={(val) => setFormData({ ...formData, tipe_flute: val })}
                options={[
                  { value: 'B/F', label: 'B/F (B-Flute standard ~3mm)' },
                  { value: 'C/F', label: 'C/F (C-Flute tebal ~4mm)' },
                  { value: 'E/F', label: 'E/F (E-Flute mikro tipis ~1.5mm)' },
                  { value: 'B/C Double Wall', label: 'B/C Double Wall (Kuat & Tebal ~7mm)' },
                ]}
                placeholder="Pilih tipe flute..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Substansi Kertas</label>
              <input
                type="text"
                value={formData.substansi}
                onChange={(e) => setFormData({ ...formData, substansi: e.target.value })}
                placeholder="K125/M125/K125 atau K125/M125"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Sambungan</label>
              <SearchableSelect
                value={formData.jenis_sambungan}
                onChange={(val) => setFormData({ ...formData, jenis_sambungan: val })}
                options={[
                  { value: 'Stitching', label: 'Stitching (Jahit Kawat Kencang)' },
                  { value: 'Glue', label: 'Glue (Lem Lipat / Folder Gluer)' },
                  { value: 'Die-cut', label: 'Die-cut (Klip / Kunci Tanpa Lem)' },
                  { value: 'Roll', label: 'Roll (Gulungan Roll)' },
                  { value: 'Tanpa Sambungan', label: 'Tanpa Sambungan (Lembaran)' },
                ]}
                placeholder="Pilih jenis sambungan..."
              />
            </div>
          </div>

          {/* Form Khusus Single Face Roll */}
          {formData.jenis_barang === 'Single Face Roll' ? (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-purple-600" />
                Spesifikasi & Kalkulasi Harga Single Face Roll:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1 Roll Berapa Kg? (Berat) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.berat_roll_kg}
                      onChange={(e) => handleBeratOrHargaKgChange(e.target.value, formData.harga_per_kg)}
                      placeholder="Contoh: 25"
                      className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Jual per Kg (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.harga_per_kg}
                      onChange={(e) => handleBeratOrHargaKgChange(formData.berat_roll_kg, e.target.value)}
                      placeholder="Contoh: 12000"
                      className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">/kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lebar Roll (mm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.lebar_mm}
                      onChange={(e) => setFormData({ ...formData, lebar_mm: Number(e.target.value) || 0 })}
                      placeholder="Contoh: 1200"
                      className="w-full pl-3 pr-9 py-2 text-sm bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">mm</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-purple-900 bg-white/80 p-2.5 rounded-lg border border-purple-200 flex items-center justify-between">
                <span>Total Otomatis Harga Jual 1 Roll ({formData.berat_roll_kg} kg x Rp {Number(formData.harga_per_kg).toLocaleString('id-ID')}):</span>
                <span className="font-extrabold text-sm text-purple-800">
                  Rp {Number(formData.harga_jual).toLocaleString('id-ID')} / Roll
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensi Panjang (mm)</label>
                <input
                  type="number"
                  value={formData.panjang_mm}
                  onChange={(e) => setFormData({ ...formData, panjang_mm: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensi Lebar (mm)</label>
                <input
                  type="number"
                  value={formData.lebar_mm}
                  onChange={(e) => setFormData({ ...formData, lebar_mm: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensi Tinggi (mm)</label>
                <input
                  type="number"
                  value={formData.tinggi_mm}
                  onChange={(e) => setFormData({ ...formData, tinggi_mm: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Jual Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.harga_jual}
                onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan Produk</label>
              <SearchableSelect
                value={formData.satuan}
                onChange={(val) => setFormData({ ...formData, satuan: val })}
                options={[
                  { value: 'Pcs', label: 'Pcs' },
                  { value: 'Roll', label: 'Roll' },
                  { value: 'Kg', label: 'Kg' },
                  { value: 'Ikat', label: 'Ikat' },
                  { value: 'Lembar', label: 'Lembar' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Awal Tersedia</label>
              <input
                type="number"
                value={formData.stok_qty}
                onChange={(e) => setFormData({ ...formData, stok_qty: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Produk Kemasan"
        message={`Apakah Anda yakin ingin menghapus item "${deleteDialog.name}"?`}
      />
    </div>
  );
}
