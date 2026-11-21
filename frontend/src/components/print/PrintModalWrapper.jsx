import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function PrintModalWrapper({ children, onClose, isOpen = true, maxWidth = 'max-w-3xl' }) {
  useEffect(() => {
    if (!isOpen) return;

    // Isolate document for printing
    document.body.classList.add('print-modal-active');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('print-modal-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const portalTarget = document.getElementById('print-portal') || document.body;

  return createPortal(
    <div
      className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto !mt-0 print:static print:p-0 print:bg-white print:overflow-visible print:z-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`print-modal-container relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-800 print:static print:m-0 print:p-0 print:w-full print:max-w-none print:shadow-none print:rounded-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalTarget
  );
}
