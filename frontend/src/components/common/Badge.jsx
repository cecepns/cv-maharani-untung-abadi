import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'sm', dot = false, className = '' }) {
  const variantClasses = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    primary: 'bg-brand-50 text-brand-700 border-brand-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  }[variant] || 'bg-slate-100 text-slate-700 border-slate-200/80';

  const dotColor = {
    neutral: 'bg-slate-400',
    primary: 'bg-brand-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
  }[variant] || 'bg-slate-400';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }[size] || 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full tracking-tight shadow-2xs ${variantClasses} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
}
