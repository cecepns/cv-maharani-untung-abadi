import React, { useState, useEffect } from 'react';
import { FileText, Printer, Search, RefreshCw, User, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/endpoints';
import { useDebounce } from '@/hooks/useDebounce';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import PrintSlipGaji from '@/components/print/PrintSlipGaji';

export default function SlipGajiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [selectedSlip, setSelectedSlip] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.PAYROLL.SLIP, {
        params: {
          page,
          limit,
          search: debouncedSearch,
        },
      });

      if (res.data.success) {
        setData(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat slip gaji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Slip Gaji Karyawan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rincian penerimaan gaji bersih (take home pay) staf dan operator pabrik corrugated
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Cari NIK, nama karyawan, jabatan..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Memuat slip gaji..." />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Tidak ada slip gaji ditemukan"
              message="Generate payroll periode terlebih dahulu pada menu Laporan Gaji."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">No</th>
                  <th className="px-5 py-3.5">Karyawan</th>
                  <th className="px-5 py-3.5">Jabatan</th>
                  <th className="px-5 py-3.5 text-center">Presensi & Lembur</th>
                  <th className="px-5 py-3.5 text-right">Gaji Pokok</th>
                  <th className="px-5 py-3.5 text-right">Tunjangan & Makan</th>
                  <th className="px-5 py-3.5 text-right">Upah Lembur</th>
                  <th className="px-5 py-3.5 text-right">Potongan BPJS</th>
                  <th className="px-5 py-3.5 text-right">Take Home Pay</th>
                  <th className="px-5 py-3.5 text-center">Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => {
                  const no = (pagination.page - 1) * pagination.limit + idx + 1;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-center text-slate-400 font-medium">{no}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{row.nama_lengkap}</div>
                        <div className="text-xs text-slate-400 font-mono">{row.nik}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">{row.jabatan}</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="text-xs font-medium text-slate-800">{row.hari_kerja} Hari</div>
                        <div className="text-[11px] text-amber-600 font-semibold">{row.jam_lembur} Jam Lembur</div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                        Rp {Number(row.gaji_pokok || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                        Rp {(Number(row.tunjangan || 0) + Number(row.uang_makan || 0)).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-amber-600">
                        Rp {Number(row.upah_lembur || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-rose-500">
                        - Rp {Number(row.potongan_bpjs || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
                        Rp {Number(row.total_gaji_bersih || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => setSelectedSlip(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-lg shadow-2xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-brand-600" />
                          Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Print Slip Gaji Modal */}
      {selectedSlip && (
        <PrintSlipGaji
          data={selectedSlip}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </div>
  );
}
