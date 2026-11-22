import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import DatePickerInput from './DatePickerInput';

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onReset,
  loading = false,
  singleDate = false, // for As-of Date (Neraca)
  className = ''
}) {
  const setPreset = (type) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (type === 'today') {
      const todayStr = fmt(now);
      if (onStartDateChange) onStartDateChange(todayStr);
      if (onEndDateChange) onEndDateChange(todayStr);
      if (onApply) onApply(todayStr, todayStr);
    } else if (type === 'this-month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startStr = fmt(first);
      const endStr = fmt(last);
      if (onStartDateChange) onStartDateChange(startStr);
      if (onEndDateChange) onEndDateChange(endStr);
      if (onApply) onApply(startStr, endStr);
    } else if (type === 'last-month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      const startStr = fmt(first);
      const endStr = fmt(last);
      if (onStartDateChange) onStartDateChange(startStr);
      if (onEndDateChange) onEndDateChange(endStr);
      if (onApply) onApply(startStr, endStr);
    } else if (type === 'this-year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      const startStr = fmt(first);
      const endStr = fmt(last);
      if (onStartDateChange) onStartDateChange(startStr);
      if (onEndDateChange) onEndDateChange(endStr);
      if (onApply) onApply(startStr, endStr);
    }
  };

  return (
    <div className={`no-print bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Inputs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              {singleDate ? 'Per Tanggal (Cut-off):' : 'Rentang Periode:'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!singleDate && (
              <>
                <div className="w-36">
                  <DatePickerInput
                    value={startDate}
                    onChange={onStartDateChange}
                    placeholder="Dari Tanggal"
                  />
                </div>
                <span className="text-xs text-slate-400 font-semibold">s/d</span>
              </>
            )}
            <div className="w-36">
              <DatePickerInput
                value={endDate}
                onChange={onEndDateChange}
                placeholder={singleDate ? "Pilih Tanggal" : "Sampai Tanggal"}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onApply && onApply(startDate, endDate)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Filter className="w-3.5 h-3.5" />
              {loading ? 'Memuat...' : 'Filter Laporan'}
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="Reset Rentang Tanggal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Preset:</span>
          <button
            type="button"
            onClick={() => setPreset('today')}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 rounded-lg transition-colors"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setPreset('this-month')}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 rounded-lg transition-colors"
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setPreset('last-month')}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 rounded-lg transition-colors"
          >
            Bulan Lalu
          </button>
          <button
            type="button"
            onClick={() => setPreset('this-year')}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 rounded-lg transition-colors"
          >
            Tahun Ini
          </button>
        </div>
      </div>
    </div>
  );
}
