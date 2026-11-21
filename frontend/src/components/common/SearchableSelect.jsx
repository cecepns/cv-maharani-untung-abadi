import React from 'react';
import Select from 'react-select';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = '-- Pilih --',
  isClearable = false,
  isSearchable = true,
  isDisabled = false,
  isLoading = false,
  className = '',
  menuPlacement = 'auto',
  noOptionsMessage = () => 'Tidak ada pilihan ditemukan',
  ...props
}) {
  // Normalize options if they are simple strings/numbers
  const formattedOptions = (options || []).map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });

  // Find currently selected option
  const selectedOption = formattedOptions.find((opt) => {
    if (value && typeof value === 'object' && 'value' in value) {
      return opt.value === value.value;
    }
    return opt.value === value;
  }) || null;

  const handleChange = (selected) => {
    if (!onChange) return;
    if (!selected) {
      onChange(isClearable ? null : '', null);
    } else {
      // Pass the raw value and the full option object
      onChange(selected.value, selected);
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      backgroundColor: isDisabled ? '#f8fafc' : '#ffffff',
      borderColor: state.isFocused ? '#0070c7' : '#e2e8f0',
      borderRadius: '0.75rem', // rounded-xl
      boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 112, 199, 0.2)' : 'none',
      transition: 'all 0.15s ease-in-out',
      fontSize: '0.875rem',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      '&:hover': {
        borderColor: state.isFocused ? '#0070c7' : '#cbd5e1',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 12px',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: '#0f172a',
      fontSize: '0.875rem',
      fontWeight: '500',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
      fontSize: '0.875rem',
      fontWeight: '400',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
      fontSize: '0.875rem',
      fontWeight: '500',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '220px',
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      margin: '2px 0',
      padding: '8px 12px',
      fontSize: '0.875rem',
      fontWeight: state.isSelected ? '600' : '500',
      backgroundColor: state.isSelected
        ? '#0070c7'
        : state.isFocused
        ? '#f0f7ff'
        : 'transparent',
      color: state.isSelected ? '#ffffff' : state.isFocused ? '#0070c7' : '#1e293b',
      cursor: 'pointer',
      transition: 'background-color 0.1s ease',
      '&:active': {
        backgroundColor: state.isSelected ? '#0070c7' : '#e0effe',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#0070c7' : '#94a3b8',
      padding: '8px',
      transition: 'transform 0.2s ease, color 0.15s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
      '&:hover': {
        color: '#64748b',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#94a3b8',
      padding: '8px',
      cursor: 'pointer',
      '&:hover': {
        color: '#ef4444',
      },
    }),
  };

  return (
    <div className={`w-full ${className}`}>
      <Select
        options={formattedOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        styles={customStyles}
        menuPlacement={menuPlacement}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        noOptionsMessage={noOptionsMessage}
        {...props}
      />
    </div>
  );
}
