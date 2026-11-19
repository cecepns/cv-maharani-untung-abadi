import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import SearchInput from '../../components/common/SearchInput';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function COAPage() {
  const [coaList, setCoaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCOA();
  }, []);

  const fetchCOA = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.COA);
      if (res.success) {
        setCoaList(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat Chart of Accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = coaList.filter(c =>
    c.kode_akun.toLowerCase().includes(search.toLowerCase()) ||
    c.nama_akun.toLowerCase().includes(search.toLowerCase()) ||
    c.kategori.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chart of Accounts (Bagan Akun Standar)</h1>
          <p className="text-sm text-slate-500">
            Daftar kode perkiraan akuntansi standar CV. Maharani Untung Abadi (Kas & Bank, Piutang, Persediaan, Aktiva, Hutang, Modal, Pendapatan, HPP, Beban).
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Cari kode akun, nama perkiraan, kategori..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-800 font-bold">{filtered.length}</span> Akun Terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat akun buku besar..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Kode Akun</th>
                  <th className="px-6 py-4">Nama Perkiraan Akun</th>
                  <th className="px-6 py-4">Kategori Finansial</th>
                  <th className="px-6 py-4">Saldo Normal</th>
                  <th className="px-6 py-4 text-right">Saldo Berjalan Saat Ini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600">
                      {c.kode_akun}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {c.nama_akun}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          c.kategori === 'Kas & Bank'
                            ? 'primary'
                            : c.kategori === 'Pendapatan'
                            ? 'success'
                            : c.kategori === 'HPP'
                            ? 'warning'
                            : c.kategori === 'Beban Operasional'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {c.kategori}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {c.saldo_normal}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      Rp {Number(c.saldo_berjalan).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
