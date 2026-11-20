import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Otomatis refresh jika ada deployment / versi baru saat client sedang membuka web
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Versi baru aplikasi terdeteksi atau chunk error, memuat ulang halaman...');
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
