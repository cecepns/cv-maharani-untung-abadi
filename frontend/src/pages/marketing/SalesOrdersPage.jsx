import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileCheck, Factory, Printer, Eye, ChevronRight, CheckCircle2, Users } from 'lucide-react';
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
import PrintSPK from '../../components/print/PrintSPK';
import SearchableSelect from '../../components/common/SearchableSelect';
import DatePickerInput from '../../components/common/DatePickerInput';

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal Create SO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    sales_id: '',
    tanggal_so: new Date().toISOString().split('T')[0],
    catatan: '',
    items: [
      { product_id: '', qty: 1000, harga_satuan: 0, spek_khusus: 'Flexo 2 Warna, Stitching kawat 4 titik' }
    ]
  });
  const [formLoading, setFormLoading] = useState(false);

  // Modal Edit SO
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    nomor_so: '',
    customer_id: '',
    sales_id: '',
    tanggal_so: '',
    status: '',
    catatan: '',
  });
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Print SPK Preview Modal
  const [printData, setPrintData] = useState(null);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const [cRes, pRes, sRes] = await Promise.all([
        request.get(API_ENDPOINTS.MARKETING.CUSTOMERS, { limit: 100 }),
        request.get(API_ENDPOINTS.MARKETING.PRODUCTS, { limit: 100 }),
        request.get(API_ENDPOINTS.MARKETING.SALES_PERSONS),
      ]);
      if (cRes.success) setCustomers(cRes.data);
      if (pRes.success) setProducts(pRes.data);
      if (sRes.success) setSalesPersons(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.MARKETING.SALES_ORDERS, {
        page,
        limit,
        search,
        status: statusFilter || undefined,
      });
      if (res.success) {
        setSalesOrders(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Gagal memuat Sales Orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchSalesOrders();
  }, [page, limit, search, statusFilter]);

  const checkIsPkp = (cust) => {
    if (!cust) return false;
    if (!cust.npwp) return false;
    const val = cust.npwp.trim();
    if (!val || val === '-' || val.toLowerCase().includes('non')) return false;
    return true;
  };

  const handleOpenCreate = () => {
    const cust = customers.length ? customers[0] : null;
    const isPkp = checkIsPkp(cust);
    setFormData({
      customer_id: cust ? cust.id : '',
      sales_id: salesPersons.length ? salesPersons[0].id : '',
      tanggal_so: new Date().toISOString().split('T')[0],
      tipe_pajak: isPkp ? 'PPN 11%' : 'Non-PPN',
      catatan: '',
      items: [
        {
          product_id: products.length ? products[0].id : '',
          qty: 2000,
          harga_satuan: products.length ? products[0].harga_jual : 3500,
          spek_khusus: 'Flexo 2 Warna, Stitching kawat'
        }
      ]
    });
    setIsModalOpen(true);
  };

  const handleCustomerChange = (custId) => {
    const cust = customers.find(c => c.id === parseInt(custId, 10));
    const isPkp = checkIsPkp(cust);
    setFormData(prev => ({
      ...prev,
      customer_id: custId,
      tipe_pajak: isPkp ? 'PPN 11%' : 'Non-PPN'
    }));
  };

  const handleProductSelect = (index, prodId) => {
    const prod = products.find(p => p.id === parseInt(prodId, 10));
    const newItems = [...formData.items];
    newItems[index].product_id = prodId;
    if (prod) {
      newItems[index].harga_satuan = prod.harga_jual;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: products.length ? products[0].id : '',
          qty: 1000,
          harga_satuan: products.length ? products[0].harga_jual : 3500,
          spek_khusus: ''
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      toast.error('Pilih customer terlebih dahulu!');
      return;
    }

    try {
      setFormLoading(true);
      const subtotal = formData.items.reduce((sum, it) => sum + (Number(it.qty || 0) * Number(it.harga_satuan || 0)), 0);
      const isPpn = formData.tipe_pajak === 'PPN 11%';
      const ppn = isPpn ? Math.round(subtotal * 0.11) : 0;
      const payload = {
        ...formData,
        subtotal,
        ppn,
        total_nilai: subtotal + ppn,
        is_ppn: isPpn,
      };
      await request.post(API_ENDPOINTS.MARKETING.SALES_ORDERS, payload);
      toast.success('Sales Order berhasil dibuat & siap diproses SPK');
      setIsModalOpen(false);
      fetchSalesOrders();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan Sales Order');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEdit = (so) => {
    setEditFormData({
      id: so.id,
      nomor_so: so.nomor_so,
      customer_id: so.customer_id,
      sales_id: so.sales_id || (salesPersons.length ? salesPersons[0].id : ''),
      tanggal_so: so.tanggal_so ? so.tanggal_so.split('T')[0] : '',
      status: so.status || 'Diproses',
      catatan: so.catatan || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSO = async (e) => {
    e.preventDefault();
    try {
      setEditFormLoading(true);
      const res = await request.put(API_ENDPOINTS.MARKETING.SALES_ORDER_DETAIL(editFormData.id), {
        sales_id: editFormData.sales_id,
        customer_id: editFormData.customer_id,
        tanggal_so: editFormData.tanggal_so,
        status: editFormData.status,
        catatan: editFormData.catatan,
      });
      if (res.success) {
        toast.success(`Sales Order ${editFormData.nomor_so} berhasil diperbarui`);
        setIsEditModalOpen(false);
        fetchSalesOrders();
      }
    } catch (err) {
      toast.error('Gagal memperbarui SO: ' + err.message);
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleGenerateSPK = async (so) => {
    try {
      const res = await request.post(API_ENDPOINTS.MARKETING.GENERATE_SPK(so.id));
      if (res.success) {
        toast.success(res.message);
        fetchSalesOrders();
        // Show SPK print preview
        setPrintData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal generate SPK');
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await request.delete(API_ENDPOINTS.MARKETING.SALES_ORDER_DETAIL(deleteDialog.id));
      toast.success('Sales order berhasil dihapus');
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchSalesOrders();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus sales order');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Order (SO)</h1>
          <p className="text-sm text-slate-500">
            Pencatatan pesanan kemasan dus, kalkulasi PPN 11%, dan integrasi otomatis ke SPK Pabrik.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Sales Order Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Cari nomor SO, customer, catatan..."
            className="w-full sm:w-80"
          />
          <SearchableSelect
            className="w-48 text-xs font-semibold"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val || '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Disetujui/SPK', label: 'Disetujui / Siap SPK' },
              { value: 'Diproses', label: 'Diproses di Pabrik' },
              { value: 'Selesai', label: 'Selesai' },
            ]}
            placeholder="Filter Status..."
            isClearable
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{pagination.total}</span> Sales Order
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar Sales Order..." />
        ) : salesOrders.length === 0 ? (
          <EmptyState
            title="Tidak ada Sales Order"
            description="Belum ada pesanan yang sesuai dengan filter atau kata kunci Anda."
            action={
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Buat Order Sekarang
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nomor & Tanggal SO</th>
                  <th className="px-6 py-4">Customer & Sales</th>
                  <th className="px-6 py-4">Item Dus Pesanan</th>
                  <th className="px-6 py-4">Total Nilai (+PPN)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Tindakan Produksi & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{so.nomor_so}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{so.tanggal_so}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{so.nama_customer || so.customer_nama || 'Customer'}</div>
                      <div className="text-xs text-brand-600 mt-0.5 font-medium">Sales: {so.nama_sales || so.sales_nama || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {(so.items || []).map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">{Number(it.qty).toLocaleString('id-ID')} Pcs</span> - {it.nama_barang}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-700 text-sm">
                        Rp {Number(so.total_nilai).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>Subtotal: Rp {Number(so.subtotal).toLocaleString('id-ID')}</span>
                        {Number(so.ppn) > 0 ? (
                          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 font-semibold rounded text-[10px]">PPN 11%</span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-semibold rounded text-[10px]">Non-PPN</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          so.status === 'Selesai'
                            ? 'success'
                            : so.status === 'Diproses'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {so.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {so.status !== 'Selesai' && (
                          <button
                            onClick={() => handleGenerateSPK(so)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                            title="Terbitkan SPK Produksi Otomatis"
                          >
                            <Factory className="w-3.5 h-3.5 text-amber-600" />
                            Terbitkan SPK
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(so)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Ubah Sales Order & Sales Person"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: so.id, name: so.nomor_so })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Sales Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Modal Buat Sales Order */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Sales Order (SO) Baru"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Customer <span className="text-rose-500">*</span>
              </label>
              <SearchableSelect
                value={formData.customer_id}
                onChange={(val) => handleCustomerChange(val)}
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.nama_customer} (${c.kode_customer}) ${c.npwp ? '• PKP' : '• Non-PKP'}`,
                }))}
                placeholder="Cari & pilih customer..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Sales Person</label>
                <Link
                  to="/marketing/sales-persons"
                  target="_blank"
                  className="text-[11px] text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-0.5 font-medium"
                  title="Buka menu data tim sales untuk tambah/ubah sales"
                >
                  <Users className="w-3 h-3" /> Kelola Sales
                </Link>
              </div>
              <SearchableSelect
                value={formData.sales_id}
                onChange={(val) => setFormData({ ...formData, sales_id: val })}
                options={salesPersons.map((s) => ({
                  value: s.id,
                  label: `${s.nama_sales} (${s.kode_sales})`,
                }))}
                placeholder="Pilih sales..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pesanan</label>
              <DatePickerInput
                value={formData.tanggal_so}
                onChange={(val) => setFormData({ ...formData, tanggal_so: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pajak Transaksi</label>
              <SearchableSelect
                value={formData.tipe_pajak || 'Non-PPN'}
                onChange={(val) => setFormData({ ...formData, tipe_pajak: val })}
                options={[
                  { value: 'Non-PPN', label: 'Non-PPN (0% - Non-PKP / UMKM)' },
                  { value: 'PPN 11%', label: 'PPN 11% (Customer PKP / Faktur Pajak)' },
                ]}
                placeholder="Pilih jenis pajak..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Pengiriman bertahap, packing, dll"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Items Order */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Dus / Item Pesanan
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris Dus
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Produk Dus</label>
                      <SearchableSelect
                        value={it.product_id}
                        onChange={(val) => handleProductSelect(idx, val)}
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.nama_barang} (${p.tipe_flute}) - Rp ${Number(p.harga_jual).toLocaleString('id-ID')}`,
                        }))}
                        placeholder="Cari box / sheet..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Qty Order (Pcs)</label>
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[idx].qty = Number(e.target.value);
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Spek cetak: Flexo 2 Warna, stitching kawat, pisau rotary..."
                      value={it.spek_khusus}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].spek_khusus = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ringkasan Subtotal & PPN Live */}
          {(() => {
            const currentSubtotal = formData.items.reduce((sum, it) => sum + (Number(it.qty || 0) * Number(it.harga_satuan || 0)), 0);
            const isPpn = formData.tipe_pajak === 'PPN 11%';
            const currentPpn = isPpn ? Math.round(currentSubtotal * 0.11) : 0;
            const currentTotal = currentSubtotal + currentPpn;
            return (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Barang ({formData.items.length} item):</span>
                  <span className="font-semibold">Rp {currentSubtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN ({isPpn ? '11% - Transaksi PKP' : '0% - Non-PKP'}):</span>
                  <span className={`font-semibold ${isPpn ? 'text-blue-700' : 'text-slate-500'}`}>
                    {isPpn ? `Rp ${currentPpn.toLocaleString('id-ID')}` : 'Rp 0 (Bebas PPN)'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-200">
                  <span>Total Tagihan Sales Order:</span>
                  <span className="text-emerald-700">Rp {currentTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })()}

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
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Memproses...' : 'Simpan Sales Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit SO */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Ubah Sales Order: ${editFormData.nomor_so}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpdateSO} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Sales Person / Tim Marketing <span className="text-rose-500">*</span>
              </label>
              <Link
                to="/marketing/sales-persons"
                target="_blank"
                className="text-[11px] text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-0.5 font-medium"
                title="Buka menu data tim sales untuk tambah/ubah sales"
              >
                <Users className="w-3 h-3" /> Kelola Tim Sales
              </Link>
            </div>
            <SearchableSelect
              value={editFormData.sales_id}
              onChange={(val) => setEditFormData({ ...editFormData, sales_id: val })}
              options={salesPersons.map((s) => ({
                value: s.id,
                label: `${s.nama_sales} (${s.kode_sales})`,
              }))}
              placeholder="Pilih sales person..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pilih Customer <span className="text-rose-500">*</span>
            </label>
            <SearchableSelect
              value={editFormData.customer_id}
              onChange={(val) => setEditFormData({ ...editFormData, customer_id: val })}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.nama_customer} (${c.kode_customer})`,
              }))}
              placeholder="Cari & pilih customer..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tanggal Pesanan (SO)
              </label>
              <DatePickerInput
                value={editFormData.tanggal_so}
                onChange={(val) => setEditFormData({ ...editFormData, tanggal_so: val })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status Order
              </label>
              <SearchableSelect
                value={editFormData.status}
                onChange={(val) => setEditFormData({ ...editFormData, status: val })}
                options={[
                  { value: 'Disetujui/SPK', label: 'Disetujui/SPK' },
                  { value: 'Diproses', label: 'Diproses' },
                  { value: 'Selesai', label: 'Selesai' },
                ]}
                placeholder="Pilih status..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Catatan / Instruksi Khusus
            </label>
            <textarea
              rows="3"
              value={editFormData.catatan}
              onChange={(e) => setEditFormData({ ...editFormData, catatan: e.target.value })}
              placeholder="Contoh: Kirim bertahap, packing strapping 25 pcs per ikat..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={editFormLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {editFormLoading ? 'Menyimpan...' : 'Simpan Perubahan SO'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Print SPK Modal Preview */}
      <PrintSPK data={printData} onClose={() => setPrintData(null)} />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Hapus Sales Order"
        message={`Apakah Anda yakin ingin menghapus Sales Order "${deleteDialog.name}"?`}
      />
    </div>
  );
}
