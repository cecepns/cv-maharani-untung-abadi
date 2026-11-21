import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';

// Ensure high z-index portal container exists in DOM
if (typeof document !== 'undefined') {
  if (!document.getElementById('datepicker-portal')) {
    const portalDiv = document.createElement('div');
    portalDiv.id = 'datepicker-portal';
    portalDiv.style.zIndex = '99999';
    document.body.appendChild(portalDiv);
  }
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = 'Pilih tanggal...',
  disabled = false,
  minDate = null,
  maxDate = null,
  className = '',
  dateFormat = 'yyyy-MM-dd',
  displayFormat = 'dd/MM/yyyy',
  required = false,
  ...props
}) {
  // Parse incoming value to valid Date object
  const parseDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === 'string') {
      const parts = val.split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
      }
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const selectedDate = parseDate(value);

  const handleChange = (date) => {
    if (!onChange) return;
    if (!date) {
      onChange('');
      return;
    }
    // Format to YYYY-MM-DD for standard backend/form state
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    onChange(dateString, date);
  };

  // Custom input wrapper
  const CustomInput = forwardRef(({ value, onClick, onChange: onInputChange }, ref) => (
    <div className="relative w-full cursor-pointer" onClick={onClick}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <CalendarIcon className="w-4 h-4 text-brand-600" />
      </div>
      <input
        ref={ref}
        value={value}
        onChange={onInputChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        readOnly
        className={`w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-2xs ${
          disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'cursor-pointer hover:border-slate-300'
        }`}
      />
    </div>
  ));

  CustomInput.displayName = 'CustomDateInput';

  return (
    <div className={`w-full custom-datepicker-wrapper ${className}`}>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat={dateFormat}
        customInput={<CustomInput />}
        popperPlacement="bottom-start"
        portalId="datepicker-portal"
        showPopperArrow={false}
        popperProps={{
          strategy: 'fixed',
        }}
        {...props}
      />
    </div>
  );
}
