import React, { useState, useEffect } from 'react';
import { Landmark, Printer, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function NeracaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNeraca();
  }, []);

  const fetchNeraca = async () => {
    try {
      setLoading(true);
      const res = await request.get(API_ENDPOINTS.ACCOUNTING.NERACA);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat neraca: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Neraca (Balance Sheet)</h1>
          <p className="text-sm text-slate-500">
            Posisi keuangan neraca: Total Aktiva (Aset Lancar & Aset Tetap) seimbang dengan Total Pasiva (Kewajiban & Ekuitas).
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Cetak Neraca Keuangan
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Memproses neraca keuangan..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900">CV. MAHARANI UNTUNG ABADI</h2>
            <p className="text-sm font-bold text-slate-600">NERACA KEUANGAN (BALANCE SHEET)</p>
            <p className="text-xs text-slate-500">Per 30 November 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* SISI AKTIVA (ASET) */}
            <div className="space-y-4">
              <div className="bg-brand-50 p-3 rounded-xl border border-brand-200 font-black text-brand-950 text-sm">
                AKTIVA (ASSETS)
              </div>

              {/* Aktiva Lancar */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="font-bold text-slate-800 uppercase block">1. Aktiva Lancar</span>
                <div className="flex justify-between text-slate-600">
                  <span>Kas & Bank</span>
                  <span>Rp {Number(data?.aktiva_lancar?.kas_dan_bank || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Piutang Usaha Customer</span>
                  <span>Rp {Number(data?.aktiva_lancar?.piutang_usaha || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Persediaan (Sheet, Bahan, & Dus FG)</span>
                  <span>Rp {Number(data?.aktiva_lancar?.persediaan_sheet_dan_fg || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Subtotal Aktiva Lancar</span>
                  <span>Rp {Number(data?.aktiva_lancar?.total_aktiva_lancar || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Aktiva Tetap */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="font-bold text-slate-800 uppercase block">2. Aktiva Tetap</span>
                <div className="flex justify-between text-slate-600">
                  <span>Mesin Pabrik & Kendaraan</span>
                  <span>Rp {Number(data?.aktiva_tetap?.mesin_dan_peralatan || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Akumulasi Penyusutan Mesin</span>
                  <span>(Rp {Math.abs(Number(data?.aktiva_tetap?.akumulasi_penyusutan || 0)).toLocaleString('id-ID')})</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Nilai Buku Aktiva Tetap</span>
                  <span>Rp {Number(data?.aktiva_tetap?.nilai_buku_aktiva_tetap || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* TOTAL AKTIVA */}
              <div className="p-3 bg-brand-500 text-white rounded-xl flex justify-between font-black text-sm shadow-sm">
                <span>TOTAL AKTIVA:</span>
                <span>Rp {Number(data?.total_aktiva || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* SISI PASIVA (KEWAJIBAN & EKUITAS) */}
            <div className="space-y-4">
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 font-black text-slate-900 text-sm">
                KEWAJIBAN & EKUITAS (LIABILITIES & EQUITY)
              </div>

              {/* Kewajiban */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="font-bold text-slate-800 uppercase block">1. Kewajiban Lancar (Hutang)</span>
                <div className="flex justify-between text-slate-600">
                  <span>Hutang Usaha Supplier Sheet</span>
                  <span>Rp {Number(data?.kewajiban?.hutang_usaha || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hutang Pajak PPN & Biaya</span>
                  <span>Rp {Number(data?.kewajiban?.hutang_pajak || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Subtotal Kewajiban</span>
                  <span>Rp {Number(data?.kewajiban?.total_kewajiban || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Ekuitas / Modal */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="font-bold text-slate-800 uppercase block">2. Modal & Ekuitas</span>
                <div className="flex justify-between text-slate-600">
                  <span>Modal Pemilik CV. Maharani</span>
                  <span>Rp {Number(data?.modal?.modal_pemilik || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Laba Tahun Berjalan</span>
                  <span>Rp {Number(data?.modal?.laba_tahun_berjalan || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Subtotal Ekuitas</span>
                  <span>Rp {Number(data?.modal?.total_ekuitas || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* TOTAL PASIVA */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex justify-between font-black text-sm shadow-sm">
                <span>TOTAL PASIVA:</span>
                <span>Rp {Number(data?.total_pasiva || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
