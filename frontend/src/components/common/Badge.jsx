import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'sm' }) {
  const variantClasses = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }[variant] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }[size] || 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${variantClasses} ${sizeClasses}`}
    >
      {children}
    </span>
  );
}
