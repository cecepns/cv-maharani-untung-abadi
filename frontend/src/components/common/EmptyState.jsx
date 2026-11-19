import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  title = 'Tidak ada data ditemukan',
  description = 'Coba ubah kata kunci pencarian atau tambahkan data baru.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
        <PackageOpen className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
