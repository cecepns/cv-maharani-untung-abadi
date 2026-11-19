/**
 * CENTRALIZED API ENDPOINTS CONFIGURATION
 * Mandatory rule from AGENTS.md: Never hardcode endpoints in components!
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },

  DASHBOARD: {
    SUMMARY: '/api/dashboard/summary',
    CHART_SALES: '/api/dashboard/chart-sales',
  },

  MARKETING: {
    CUSTOMERS: '/api/marketing/customers',
    CUSTOMER_DETAIL: (id) => `/api/marketing/customers/${id}`,
    SALES_PERSONS: '/api/marketing/sales-persons',
    PRODUCTS: '/api/marketing/products',
    PRODUCT_DETAIL: (id) => `/api/marketing/products/${id}`,
    SALES_ORDERS: '/api/marketing/sales-orders',
    SALES_ORDER_DETAIL: (id) => `/api/marketing/sales-orders/${id}`,
    GENERATE_SPK: (id) => `/api/marketing/sales-orders/${id}/generate-spk`,
    SURAT_JALAN: '/api/marketing/surat-jalan',
    SURAT_JALAN_DETAIL: (id) => `/api/marketing/surat-jalan/${id}`,
    INVOICES: '/api/marketing/invoices',
    INVOICE_DETAIL: (id) => `/api/marketing/invoices/${id}`,
    FAKTUR_PAJAK: '/api/marketing/faktur-pajak',
    RETUR_PENJUALAN: '/api/marketing/retur-penjualan',
    RETUR_PENJUALAN_DETAIL: (id) => `/api/marketing/retur-penjualan/${id}`,
    LAPORAN_OMSET_CUSTOMER: '/api/marketing/laporan-omset-customer',
    LAPORAN_OMSET_SALES: '/api/marketing/laporan-omset-sales',
  },

  PURCHASING: {
    SUPPLIERS: '/api/purchasing/suppliers',
    SUPPLIER_DETAIL: (id) => `/api/purchasing/suppliers/${id}`,
    BAHAN_SHEET: '/api/purchasing/bahan-sheet',
    BAHAN_SHEET_DETAIL: (id) => `/api/purchasing/bahan-sheet/${id}`,
    BAHAN_PEMBANTU: '/api/purchasing/bahan-pembantu',
    BAHAN_PEMBANTU_DETAIL: (id) => `/api/purchasing/bahan-pembantu/${id}`,
    ORDERS: '/api/purchasing/orders',
    ORDER_DETAIL: (id) => `/api/purchasing/orders/${id}`,
    PENERIMAAN: '/api/purchasing/penerimaan',
    NOTA_BELI: '/api/purchasing/nota-beli',
    NOTA_BELI_DETAIL: (id) => `/api/purchasing/nota-beli/${id}`,
    RETUR_BELI: '/api/purchasing/retur-beli',
  },

  GUDANG: {
    STOCK_SHEET: '/api/gudang/stock-sheet',
    STOCK_PEMBANTU: '/api/gudang/stock-pembantu',
    STOCK_BARANG_JADI: '/api/gudang/stock-barang-jadi',
    WIP: '/api/gudang/wip',
    MUTASI: '/api/gudang/mutasi',
    PENYESUAIAN_STOK: '/api/gudang/penyesuaian-stok',
  },

  PRODUKSI: {
    SPK: '/api/produksi/spk',
    SPK_DETAIL: (id) => `/api/produksi/spk/${id}`,
    CETAK: '/api/produksi/cetak',
    CETAK_DETAIL: (id) => `/api/produksi/cetak/${id}`,
    FINISHING: '/api/produksi/finishing',
    FINISHING_DETAIL: (id) => `/api/produksi/finishing/${id}`,
    IKAT: '/api/produksi/ikat',
    IKAT_DETAIL: (id) => `/api/produksi/ikat/${id}`,
  },

  FINANCE: {
    PIUTANG_BAYAR: '/api/finance/piutang/pembayaran',
    HUTANG_BAYAR: '/api/finance/hutang/pembayaran',
    AGING_PIUTANG_CUSTOMER: '/api/finance/aging-piutang-customer',
    AGING_PIUTANG_SALES: '/api/finance/aging-piutang-sales',
    SALDO_HUTANG_PIUTANG: '/api/finance/saldo-hutang-piutang',
  },

  ACCOUNTING: {
    COA: '/api/accounting/coa',
    JURNAL: '/api/accounting/jurnal',
    LAPORAN_KAS_HARIAN: '/api/accounting/laporan-kas-harian',
    LAPORAN_BANK_HARIAN: '/api/accounting/laporan-bank-harian',
    BUKU_BESAR: '/api/accounting/buku-besar',
    TRIAL_BALANCE: '/api/accounting/trial-balance',
    LABA_RUGI: '/api/accounting/laba-rugi',
    HPP: '/api/accounting/hpp',
    NERACA: '/api/accounting/neraca',
  },

  AKTIVA: {
    LIST: '/api/aktiva',
    DETAIL: (id) => `/api/aktiva/${id}`,
    PROSES_PENYUSUTAN: '/api/aktiva/proses-penyusutan',
  },

  PAYROLL: {
    KARYAWAN: '/api/payroll/karyawan',
    KARYAWAN_DETAIL: (id) => `/api/payroll/karyawan/${id}`,
    ABSENSI: '/api/payroll/absensi',
    ABSENSI_IMPORT_FINGERPRINT: '/api/payroll/absensi/import-fingerprint',
    ABSENSI_EXPORT: '/api/payroll/absensi/export',
    ABSENSI_TEMPLATE: '/api/payroll/absensi/template-fingerprint',
    PERIODE: '/api/payroll/periode',
    GENERATE: '/api/payroll/generate',
    SLIP: '/api/payroll/slip',
    SLIP_DETAIL: (id) => `/api/payroll/slip/${id}`,
  },

  USERS: {
    LIST: '/api/users',
    DETAIL: (id) => `/api/users/${id}`,
    TOGGLE_STATUS: (id) => `/api/users/${id}/toggle-status`,
  },
};
