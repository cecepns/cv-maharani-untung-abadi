import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Printer,
  ChevronRight,
  Layers,
  Calculator,
  Truck,
  Factory,
  Receipt,
  Scissors,
  Users,
  CreditCard,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Box,
  FileText,
  Calendar,
  Landmark,
  ShieldCheck,
  PenTool,
  Bookmark
} from 'lucide-react';

export default function PanduanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'rumus', 'sheet', 'marketing', 'purchasing', 'produksi', 'logistik', 'finance', 'faq'

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    {
      id: 'overview',
      title: 'Alur Kerja Utama Pabrik (A - Z)',
      icon: ArrowRight,
      badge: 'Alur Bisnis',
      color: 'emerald',
    },
    {
      id: 'rumus',
      title: 'Rumus Dimensi & Ukuran Sheet',
      icon: Calculator,
      badge: 'Standar Teknis',
      color: 'amber',
    },
    {
      id: 'sheet',
      title: 'Konsep Bahan Baku Sheet Karton',
      icon: Layers,
      badge: 'Manajemen Bahan',
      color: 'blue',
    },
    {
      id: 'marketing',
      title: 'Modul Marketing & Estimasi Harga',
      icon: Users,
      badge: 'Penjualan',
      color: 'indigo',
    },
    {
      id: 'purchasing',
      title: 'Modul Purchasing & Penerimaan (LPB)',
      icon: Scissors,
      badge: 'Pengadaan',
      color: 'cyan',
    },
    {
      id: 'produksi',
      title: 'Modul Produksi Pabrik & SPK',
      icon: Factory,
      badge: 'Lantai Pabrik',
      color: 'purple',
    },
    {
      id: 'logistik',
      title: 'Modul Pengiriman & Surat Jalan',
      icon: Truck,
      badge: 'Distribusi',
      color: 'teal',
    },
    {
      id: 'finance',
      title: 'Modul Keuangan, Invoice & Payroll',
      icon: Receipt,
      badge: 'Pembukuan',
      color: 'rose',
    },
    {
      id: 'faq',
      title: 'FAQ & Pertanyaan Sering Diajukan',
      icon: HelpCircle,
      badge: 'Tanya Jawab',
      color: 'slate',
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => s.title.toLowerCase().includes(q) || s.badge.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Action Bar */}
      <div className="bg-gradient-to-r from-[#031512] via-[#052922] to-[#0a3e34] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-10">
          <BookOpen className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Buku Panduan & Pedoman Resmi ERP CV. Maharani
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Panduan Lengkap Penggunaan Aplikasi Pabrik
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Panduan interaktif dan instruksi langkah demi langkah pengoperasian sistem manufaktur karton box, mulai dari rumus teknis ukuran luar, kalkulasi bentangan sheet, SPK produksi, hingga faktur penjualan dan penggajian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-xs transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-800/40 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-emerald-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik panduan (contoh: sheet, single wall, spk, surat jalan, invoice)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 text-white placeholder-emerald-200/60 rounded-xl text-xs sm:text-sm font-medium border border-emerald-400/20 focus:bg-white/20 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-emerald-200 hover:text-white"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Left Tab Nav & Right Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <div className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Daftar Bab & Modul Panduan
            </div>
            <div className="space-y-1">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-2xs font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-semibold border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs truncate">{sec.title}</div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {sec.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-emerald-700 translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              Kontak Pabrik & Dukungan Teknis
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Jika operator atau tim kantor memerlukan bantuan teknis aplikasi, hubungi admin sistem di nomor operasional:
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 font-mono font-bold text-emerald-950 text-center">
              HP. 0851-0091-8118
            </div>
          </div>
        </div>

        {/* Detail Content Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: ALUR KERJA UTAMA (A - Z) */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 1: ALUR KERJA BISNIS PABRIK
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Urutan Lengkap Penggunaan Aplikasi (Workflow dari A sampai Z)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Siklus operasional pabrik karton box terpadu dari setup data, kalkulasi harga, produksi, hingga pelunasan invoice.
                </p>
              </div>

              {/* Visual Process Flow */}
              <div className="space-y-4">
                {[
                  {
                    step: '1',
                    title: 'Setup Master Data (Awal)',
                    dept: 'Admin / Data Entry',
                    desc: 'Daftarkan data Customer (alamat pengiriman, kontak), Supplier (pabrik kertas Maspion/Suparma), dan Master Produk Dus serta Bahan Baku Sheet.',
                    icon: Users,
                    color: 'slate',
                  },
                  {
                    step: '2',
                    title: 'Estimasi Harga & Penawaran (SPH)',
                    dept: 'Marketing & Sales',
                    desc: 'Gunakan Kalkulator Estimasi Box. Masukkan ukuran dus P x L x T dan tipe gelombang. Sistem menghitung Size Luar, Ukuran Sheet, HPP Modal, dan merekomendasikan harga jual. Cetak SPH resmi berkop CV. Maharani.',
                    icon: Calculator,
                    color: 'indigo',
                  },
                  {
                    step: '3',
                    title: 'Sales Order (SO) Resmi',
                    dept: 'Marketing',
                    desc: 'Setelah customer setuju dan mengirimkan PO, buat Sales Order (SO). Dokumen SO menjadi acuan resmi jadwal kirim, termin bayar, dan instruksi pengerjaan.',
                    icon: FileCheck,
                    color: 'blue',
                  },
                  {
                    step: '4',
                    title: 'Cek Stok Sheet & Beli Bahan (PO)',
                    dept: 'Purchasing & Gudang',
                    desc: 'Cek ketersediaan lembaran sheet di menu Stok Sheet Gudang. Jika stok kurang, terbitkan Purchase Order (PO Bahan) ke supplier dan input Laporan Penerimaan Barang (LPB) saat kiriman truk tiba.',
                    icon: Layers,
                    color: 'cyan',
                  },
                  {
                    step: '5',
                    title: 'Penerbitan SPK & Proses Produksi',
                    dept: 'PPIC & Mandor Produksi',
                    desc: 'Cetak Surat Perintah Kerja (SPK). Dokumen memuat diagram bentangan dos, instruksi potong sheet, cetak flexo, slotter creasing, stitching jahitan kawat / lem, dan artwork gambar desain.',
                    icon: Factory,
                    color: 'purple',
                  },
                  {
                    step: '6',
                    title: 'Pengiriman & Surat Jalan (SJ)',
                    dept: 'Logistik & Pengiriman',
                    desc: 'Terbitkan Surat Jalan (SJ). Sistem otomatis menghitung pembagian ikat dan sisa yang tidak bulat (contoh 107 pcs = 4 ikat @ 25 pcs + 1 ikat isi 7 pcs). Cetak SJ untuk dibawa supir.',
                    icon: Truck,
                    color: 'teal',
                  },
                  {
                    step: '7',
                    title: 'Faktur Penjualan (Invoice) & Pembayaran',
                    dept: 'Keuangan & Akuntansi',
                    desc: 'Dari Surat Jalan yang selesai dikirim, buat Faktur Penjualan (Invoice) sesuai jatuh tempo (30/60/90/120 hari). Catat penerimaan kas/bank saat customer membayar, dan cetak Slip Gaji karyawan.',
                    icon: Receipt,
                    color: 'emerald',
                  },
                ].map((st) => (
                  <div
                    key={st.step}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {st.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{st.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {st.dept}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RUMUS DIMENSI & SHEET */}
          {activeTab === 'rumus' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 2: STANDAR RUMUS TEKNIS
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Rumus Ukuran Jadi, Size Luar, Flap, & Tab Sambungan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Formula resmi pabrik CV. Maharani untuk menghitung toleransi karton gelombang Single Wall (A1) dan Double Wall (A2).
                </p>
              </div>

              {/* Tabel Perbandingan Formula */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-800 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Parameter Ukuran</th>
                      <th className="p-3 bg-amber-50/60 text-amber-950">Single Wall (A1)</th>
                      <th className="p-3 bg-indigo-50/60 text-indigo-950">Double Wall (A2 - 2 Gelombang B/C)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Size Luar Dus (Outer Dimension)</td>
                      <td className="p-3 font-mono font-bold text-amber-900">
                        P + 3 mm, L + 3 mm, T + 6 mm
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-900">
                        P + 6 mm, L + 6 mm, T + 12 mm
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Tutup Flap (Atas & Bawah)</td>
                      <td className="p-3 font-mono font-bold text-blue-700">
                        (Lebar / 2) + 3 mm
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-700">
                        (Lebar / 2) + 6 mm
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Bagian Tab (Kuping Sambungan Lem/Jahit)</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        3,1 cm (31 mm)
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        3,9 cm (39 mm)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Lebar Sheet Karton (Tinggi Bentangan)</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        Flap Atas + T + Flap Bawah = <span className="text-brand-700">L + T + 6 mm</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        Flap Atas + T + Flap Bawah = <span className="text-brand-700">L + T + 12 mm</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Panjang Sheet Karton (Panjang Bentangan)</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        (P + L) × 2 + 31 mm
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        (P + L) × 2 + 39 mm
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700">Aturan Dus Jumbo (Double Joint / 2 Sambungan)</td>
                      <td className="p-3 text-slate-600">
                        Kuping tab dikali 2 = <strong>62 mm</strong> (2 lembar sheet per dus)
                      </td>
                      <td className="p-3 text-slate-600">
                        Kuping tab dikali 2 = <strong>78 mm</strong> (2 lembar sheet per dus)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rumus Ivory & Duplex */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Rumus Kertas Offset (Ivory & Duplex)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Rumus Duplex:</span>
                    <code className="text-indigo-800 font-mono font-bold block">
                      (P × L × Gramatur / 20.000) × Index Rp + Margin %
                    </code>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Toleransi gramatur: 250gr (2370), 310gr (2173), 350gr (2004), 400gr (2050), 450gr (2079).
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Rumus Kertas Ivory:</span>
                    <code className="text-emerald-800 font-mono font-bold block">
                      (P × L × Gramatur / 20.000) × Harga per Kg
                    </code>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Potong roll to sheet (+250), In roll (-350/kg include), tipe VA, IKKVC, IKKVB, BOHUI, Ivory PE.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KONSEP BAHAN BAKU SHEET */}
          {activeTab === 'sheet' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 3: MANAJEMEN BAHAN
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Memahami Konsep "Bahan Baku Sheet Karton"
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Penjelasan peran lembaran sheet mentah, pemotongan, dan pemanfaatan sisa potongan (offcut).
                </p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                  <h3 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Apa Sebenarnya "Sheet Karton" Itu?
                  </h3>
                  <p>
                    <strong>Sheet Karton</strong> adalah lembaran kertas karton gelombang polos datar (*corrugated sheet plano*) yang dibeli mentah dari pabrik corrugator (seperti Maspion, Suparma, dll). Bentuknya masih berupa lembaran segiempat lebar tanpa cetakan dan belum dilipat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide block">
                      Sheet Karton (Bahan Mentah)
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Bentuk: Lembaran datar segi empat.</li>
                      <li>Ukuran: Contoh 1200 x 2400 mm atau ukuran custom.</li>
                      <li>Belum dicetak tinta (polos).</li>
                      <li>Belum memiliki garis lipatan (creasing).</li>
                      <li>Tercatat di menu: <strong>Stok Sheet Gudang</strong>.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide block">
                      Karton Box Jadi (Finish Good)
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-emerald-800">
                      <li>Bentuk: Dus kemasan 3 dimensi siap pakai.</li>
                      <li>Sudah dicetak teks, logo, & warna (Flexo).</li>
                      <li>Sudah ditekuk dan memiliki flap penutup.</li>
                      <li>Sudah disambung dengan kawat (stitching) atau lem.</li>
                      <li>Tercatat di menu: <strong>Stok Barang Jadi (FG)</strong>.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-amber-950">
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Pemanfaatan Sisa Potongan Sheet (Offcut):
                  </h4>
                  <p className="text-[11px]">
                    Di lantai produksi pabrik, saat memotong sheet besar sering kali terdapat sisa potongan lembaran (*offcut*). Di aplikasi ini, staf gudang dapat mencatat kembali sisa potongan tersebut ke dalam stok dengan kode <code>[OFFCUT]</code>, sehingga dapat dimanfaatkan untuk memproduksi dus-dus pesanan ukuran kecil tanpa harus membeli sheet baru.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MARKETING & ESTIMASI HARGA */}
          {activeTab === 'marketing' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 4: MARKETING & ESTIMASI
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Kalkulator Estimasi Harga & Surat Penawaran Harga (SPH)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cara menghitung HPP modal dus, simulasi order, dan menerbitkan surat penawaran resmi.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Langkah Penggunaan Kalkulator:</h3>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Buka menu <strong>Marketing & Sales → Kalkulator Estimasi Box</strong>.</li>
                    <li>Pilih jenis kertas: <strong>Karton Gelombang (Corrugated)</strong>, <strong>Kertas Ivory</strong>, atau <strong>Kertas Duplex</strong>.</li>
                    <li>Masukkan ukuran dalam dus: <strong>Panjang (P)</strong>, <strong>Lebar (L)</strong>, dan <strong>Tinggi (T)</strong> dalam milimeter (mm).</li>
                    <li>Pilih tipe gelombang (flute): <strong>B/F</strong> (Single Wall) atau <strong>B/C</strong> (Double Wall 2 gelombang).</li>
                    <li>Pilih tipe sambungan: <strong>Single Joint</strong> (1 sambungan, dus standar) atau <strong>Double Joint</strong> (2 sambungan, dus jumbo).</li>
                    <li>Pilih sumber harga kertas: <strong>Pricelist Maspion Resmi</strong> atau input manual.</li>
                    <li>Atur margin keuntungan yang diinginkan (misal +15% atau nominal Rp).</li>
                  </ol>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    Mencetak Surat Penawaran Harga (SPH):
                  </h3>
                  <p className="text-emerald-800">
                    Klik tombol <strong>Cetak SPH</strong> di bagian kanan atas kalkulator. Dokumen sudah otomatis memiliki Kop Surat resmi CV. Maharani Untung Abadi, nama customer, rincian teknis, dan masa berlaku penawaran (14 hari kerja).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PURCHASING & LPB */}
          {activeTab === 'purchasing' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 5: PURCHASING & PENERIMAAN
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Pembelian Sheet Karton & Penerimaan Barang (LPB)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pencatatan Purchase Order ke supplier, penerimaan kiriman truk, dan update stok otomatis.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Alur Penerimaan Barang (LPB):</h3>
                  <p>
                    Ketika truk dari supplier kertas (Maspion/lainnya) tiba di pabrik:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 mt-2">
                    <li>Buka menu <strong>Purchasing & Bahan → Penerimaan Sheet (LPB)</strong>.</li>
                    <li>Klik <strong>+ Input Penerimaan Barang</strong>.</li>
                    <li>Pilih nomor <strong>Purchase Order (PO)</strong> terkait.</li>
                    <li>Periksa jumlah lembar sheet aktual yang diturunkan dari truk.</li>
                    <li>Isi nama staff gudang pemeriksa dan nomor surat jalan supplier.</li>
                    <li>Klik Simpan. <strong>Stok Sheet di gudang otomatis bertambah secara real-time!</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRODUKSI & SPK */}
          {activeTab === 'produksi' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 6: LANTAI PRODUKSI & SPK
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Surat Perintah Kerja (Job Order Produksi) & Mesin
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Penerbitan dokumen instruksi kerja mesin, diagram bentangan dus, dan artwork cetakan.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-600" />
                    Fitur Khusus SPK Produksi:
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 text-purple-900">
                    <li>
                      <strong>Diagram Bentangan Dus Selalu Ada:</strong> Menampilkan pola bentangan karton A1 lengkap dengan dimensi P, L, T, tutup flap atas/bawah, tab sambungan (3,1 cm / 3,9 cm), dan target ukuran sheet potong.
                    </li>
                    <li>
                      <strong>Upload Artwork / Desain Dus:</strong> Gambar artwork cetakan dus dapat di-upload dan tampil di kotak tersendiri tanpa menutupi diagram bentangan dus. Keduanya masuk utuh saat dicetak.
                    </li>
                    <li>
                      <strong>Tabel Instruksi Kerja Fleksibel:</strong> Teks instruksi mesin slitter, mesin flexo, mesin slotter creasing, dan strapping dapat diedit langsung sesuai arahan mandor sebelum dicetak.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800">1. Potong Sheet</div>
                    <div className="text-[10px] text-slate-500 mt-1">Mesin Slitter Rotary</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800">2. Cetak Tinta</div>
                    <div className="text-[10px] text-slate-500 mt-1">Mesin Flexo Printing</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800">3. Lipatan & Sambungan</div>
                    <div className="text-[10px] text-slate-500 mt-1">Slotter, Pond & Stitching</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="font-bold text-slate-800">4. Ikat & QC</div>
                    <div className="text-[10px] text-slate-500 mt-1">Strapping Kuning (25 pcs/ikat)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LOGISTIK & SURAT JALAN */}
          {activeTab === 'logistik' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 7: DISTRIBUSI & SURAT JALAN
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Pengiriman Dus & Perhitungan Otomatis Jumlah Ikat
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Format surat jalan resmi dan kalkulasi pintar pembagian ikat dengan sisa tidak bulat.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-teal-950 text-sm">Fitur Perhitungan Ikat & Sisa:</h3>
                  <p className="text-teal-900">
                    Di pabrik karton box, jumlah order customer sering kali tidak bulat dengan isi per ikat (contoh order 107 pcs dengan standar packing 25 pcs per ikat). Sistem secara otomatis menghitung:
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-teal-300 font-mono font-bold text-slate-900">
                    107 pcs = 4 Ikat @ 25 pcs + 1 Ikat Sisa (7 pcs)
                  </div>
                  <p className="text-[11px] text-teal-800">
                    Operator pengiriman tidak perlu menghitung manual lagi di kalkulator. Keterangan pembagian ikat ini otomatis tertulis pada kolom Surat Jalan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: KEUANGAN, INVOICE & PAYROLL */}
          {activeTab === 'finance' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 8: KEUANGAN & PEMBUKUAN
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Faktur Penjualan (Invoice), Termin Bayar, & Slip Gaji
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Penagihan piutang, batas jatuh tempo (30/60/90/120 hari), dan penggajian karyawan harian & bulanan.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">Faktur Penjualan (Nota Penjualan):</h3>
                  <p>
                    Diterbitkan dari Surat Jalan yang sudah terkirim ke customer. Faktur mencantumkan tanggal jatuh tempo sesuai kesepakatan kontrak (contoh: 30 hari, 60 hari, 90 hari, atau 120 hari setelah barang diterima).
                  </p>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <h3 className="font-bold text-rose-950 text-sm">Slip Gaji Karyawan Pabrik:</h3>
                  <p className="text-rose-900">
                    Mendukung sistem gaji harian (upah per hari kerja) maupun bulanan untuk operator mesin dan staff kantor. Dilengkapi rincian tunjangan, lembur, potongan pinjaman/BPJS, serta format cetak resmi berkop CV. Maharani.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FAQ */}
          {activeTab === 'faq' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  BAB 9: TANYA JAWAB (FAQ)
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Pertanyaan Sering Diajukan Seputar Sistem
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Solusi cepat untuk pertanyaan umum operasional harian pabrik.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: 'Apa perbedaan ukuran dalam (inner) dan ukuran luar (outer)?',
                    a: 'Ukuran dalam adalah ruang kosong di dalam kardus untuk memuat produk customer. Ukuran luar adalah ukuran fisik kardus setelah terlipat, yang otomatis bertambah sesuai ketebalan gelombang (Single Wall +3/+3/+6 mm, Double Wall +6/+6/+12 mm).',
                  },
                  {
                    q: 'Berapa ukuran tab kuping sambungan standar pabrik?',
                    a: 'Untuk Single Wall A1 tab sambungan adalah 3,1 cm (31 mm). Untuk Double Wall A2 (2 gelombang B/C) tab sambungan adalah 3,9 cm (39 mm).',
                  },
                  {
                    q: 'Apakah bisa mengupload foto desain artwork kemasan di lembar SPK?',
                    a: 'Bisa. Klik tombol "+ Upload Desain Dus" di pratinjau SPK. Foto desain dus akan tampil rapi di lembar SPK berdampingan dengan diagram pola bentangan teknis.',
                  },
                  {
                    q: 'Bagaimana jika ada sisa potongan lembaran sheet yang tidak terpakai?',
                    a: 'Sisa potongan lembaran (offcut) yang masih layak pakai dapat diinput kembali ke modul Bahan Baku Sheet dengan menambahkan label [OFFCUT] agar stoknya terlacak dan bisa dipakai untuk order dus kecil.',
                  },
                  {
                    q: 'Bagaimana cara mengubah nama sales pada pesanan?',
                    a: 'Nama sales person dapat dipilih langsung di dropdown form input Sales Order, atau diatur melalui menu Marketing & Sales → Data Tim Sales.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {item.q}
                    </div>
                    <p className="text-xs text-slate-600 pl-5.5 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
