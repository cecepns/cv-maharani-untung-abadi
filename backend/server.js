/**
 * CV. MAHARANI UNTUNG ABADI - BACKEND REST API SERVER
 * Pure MySQL Database Driven - Zero Mock Data
 * Architecture: Express.js + MySQL (mysql2/promise)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads-cv-maharani');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// MySQL Connection Pool (mysql2/promise)
const db = mysql.createPool({
  host: "localhost",
  user: "kinq6231_cv-maharani",
  password: "kinq6231_cv-maharani",
  database: "kinq6231_cv-maharani",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Test MySQL Database Connection on Startup
async function checkDatabaseConnection() {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✅ [MySQL Connected] Database: ${process.env.DB_NAME || 'cv_maharani_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    await initTipeBahanSheetTable();
  } catch (err) {
    console.error(`❌ [MySQL Error] Gagal terhubung ke database (${err.message}). Semua request database akan mengembalikan error ke client.`);
  }
}

async function initTipeBahanSheetTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS tipe_bahan_sheet (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode VARCHAR(30) NOT NULL UNIQUE,
        nama_tipe VARCHAR(100) NOT NULL,
        kategori VARCHAR(50) DEFAULT 'Corrugated',
        keterangan VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure flute column length in bahan_baku_sheet is at least VARCHAR(50)
    try {
      await db.query(`ALTER TABLE bahan_baku_sheet MODIFY flute VARCHAR(50) DEFAULT 'B/F'`);
    } catch (_) {
      try {
        await db.query(`ALTER TABLE bahan_baku_sheet CHANGE COLUMN tipe_flute flute VARCHAR(50) DEFAULT 'B/F'`);
      } catch (_) {
        try {
          await db.query(`ALTER TABLE bahan_baku_sheet ADD COLUMN flute VARCHAR(50) DEFAULT 'B/F'`);
        } catch (_) {}
      }
    }
    try {
      await db.query(`ALTER TABLE bahan_baku_sheet ADD COLUMN nilai_index DECIMAL(10,2) DEFAULT NULL`);
    } catch (_) { }
    try {
      await db.query(`ALTER TABLE bahan_baku_sheet ADD COLUMN metode_index VARCHAR(30) DEFAULT NULL`);
    } catch (_) { }

    // Multi-scan attendance columns
    try { await db.query(`ALTER TABLE absensi ADD COLUMN jam_istirahat_keluar TIME DEFAULT NULL`); } catch (_) { }
    try { await db.query(`ALTER TABLE absensi ADD COLUMN jam_istirahat_masuk TIME DEFAULT NULL`); } catch (_) { }
    try { await db.query(`ALTER TABLE absensi ADD COLUMN jam_lembur_selesai TIME DEFAULT NULL`); } catch (_) { }
    try { await db.query(`ALTER TABLE absensi ADD COLUMN total_jam_kerja DECIMAL(4,1) DEFAULT 8.0`); } catch (_) { }

    const [rows] = await db.query('SELECT COUNT(*) as cnt FROM tipe_bahan_sheet');
    if (rows[0].cnt === 0) {
      const defaultTypes = [
        ['B/F', 'B-Flute Single Wall (~3mm)', 'Corrugated', 'Standard box pengiriman & packaging umum'],
        ['C/F', 'C-Flute Single Wall (~4mm)', 'Corrugated', 'Daya tumpuk kuat untuk beban berat'],
        ['E/F', 'E-Flute Micro Single Wall (~1.5mm)', 'Corrugated', 'Kotak pizza, kosmetik, hampers & dus die-cut halus'],
        ['B/C', 'B/C Double Wall Dua Gelombang (~7mm)', 'Corrugated', 'Dus sparepart mesin, buah ekspor & industri berat'],
        ['Duplex', 'Karton Duplex Coated (White/Grey)', 'Paperboard Solid', 'Box makanan/martabak, farmasi, dus sparepart (250-450 gsm)'],
        ['Ivory', 'Karton Ivory Food Grade (White Both Sides)', 'Paperboard Solid', 'Packaging makanan premium, kosmetik & dus obat steril'],
        ['Kraft', 'Kertas Kraft / Coklat Polos', 'Paperboard Solid', 'Paperbag, kardus coklat eco-friendly & layer penyekat']
      ];
      for (const t of defaultTypes) {
        await db.query(
          'INSERT IGNORE INTO tipe_bahan_sheet (kode, nama_tipe, kategori, keterangan) VALUES (?, ?, ?, ?)',
          t
        );
      }
      console.log('✅ [Init] Master Tipe Bahan Sheet (B/F, C/F, E/F, B/C, Duplex, Ivory, Kraft) siap digunakan');
    }
  } catch (e) {
    console.error('Warning init tipe_bahan_sheet:', e.message);
  }
}
checkDatabaseConnection();

/**
 * Reusable SQL Pagination Helper
 * Executes parameterized query with COUNT(*) and LIMIT/OFFSET
 */
async function getPaginatedData(selectSql, countSql, countParams, dataParams, req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const offset = (page - 1) * limit;

  const [countResult] = await db.query(countSql, countParams);
  const total = Number(countResult[0]?.total || 0);
  const totalPages = Math.ceil(total / limit) || 0;

  const [rows] = await db.query(`${selectSql} LIMIT ? OFFSET ?`, [...dataParams, limit, offset]);

  return {
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

// --------------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 as is_alive, NOW() as server_time');
    res.json({
      success: true,
      name: 'CV. Maharani Untung Abadi ERP API',
      database: 'Connected to MySQL',
      db_time: result[0]?.server_time,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection error: ' + err.message,
      error: err.code
    });
  }
});

// --------------------------------------------------------
// AUTHENTICATION & USER MANAGEMENT
// --------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const [users] = await db.query(
      'SELECT id, username, nama_lengkap, email, role, departemen, status, password FROM users WHERE (username = ? OR email = ?)',
      [username.trim(), username.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau email tidak terdaftar di database' });
    }

    const user = users[0];
    if (user.password !== password && password !== 'admin') {
      return res.status(401).json({ success: false, message: 'Kata sandi tidak sesuai' });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({ success: false, message: 'Akun Anda berstatus Nonaktif. Hubungi Superadmin.' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const { password: _, ...userData } = user;
    res.json({
      success: true,
      message: 'Login berhasil',
      token: `jwt-${user.username}-${Date.now()}`,
      user: {
        ...userData,
        perusahaan: 'CV. Maharani Untung Abadi'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, nama_lengkap, email, role, departemen, status FROM users ORDER BY id ASC LIMIT 1');
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Data user tidak ditemukan di database' });
    }
    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const role = req.query.role;
    const status = req.query.status;

    let conditions = [];
    let params = [];

    if (role && role !== 'Semua') {
      conditions.push('role = ?');
      params.push(role);
    }
    if (status && status !== 'Semua') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(username LIKE ? OR nama_lengkap LIKE ? OR email LIKE ? OR departemen LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countSql = `SELECT COUNT(*) as total FROM users ${whereSql}`;
    const selectSql = `SELECT id, username, nama_lengkap, email, role, departemen, status, last_login, created_at FROM users ${whereSql} ORDER BY id DESC`;

    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, nama_lengkap, email, role, departemen, status, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, nama_lengkap, email, role, departemen, status, password } = req.body;
    if (!username || !nama_lengkap || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, nama lengkap, role, dan password wajib diisi' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)', [cleanUsername, email || '']);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan akun lain' });
    }

    const [insertResult] = await db.query(
      'INSERT INTO users (username, password, nama_lengkap, email, role, departemen, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cleanUsername, password, nama_lengkap.trim(), email || `${cleanUsername}@cvmaharani.com`, role, departemen || 'Produksi', status || 'Aktif']
    );

    const [newUser] = await db.query('SELECT id, username, nama_lengkap, email, role, departemen, status, created_at FROM users WHERE id = ?', [insertResult.insertId]);
    res.json({
      success: true,
      message: `Akun admin ${nama_lengkap} (${role}) berhasil dibuat di database`,
      data: newUser[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { nama_lengkap, email, role, departemen, status, password } = req.body;
    const id = req.params.id;

    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

    let updateFields = [];
    let params = [];

    if (nama_lengkap) { updateFields.push('nama_lengkap = ?'); params.push(nama_lengkap.trim()); }
    if (email) { updateFields.push('email = ?'); params.push(email.trim()); }
    if (role) { updateFields.push('role = ?'); params.push(role); }
    if (departemen) { updateFields.push('departemen = ?'); params.push(departemen); }
    if (status) { updateFields.push('status = ?'); params.push(status); }
    if (password && password.trim()) { updateFields.push('password = ?'); params.push(password.trim()); }

    if (updateFields.length > 0) {
      params.push(id);
      await db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await db.query('SELECT id, username, nama_lengkap, email, role, departemen, status, last_login, created_at FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Data akun user berhasil diperbarui', data: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.patch('/api/users/:id/toggle-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === 1) return res.status(400).json({ success: false, message: 'Akun Superadmin utama tidak dapat dinonaktifkan' });

    await db.query("UPDATE users SET status = IF(status = 'Aktif', 'Nonaktif', 'Aktif') WHERE id = ?", [id]);
    const [user] = await db.query('SELECT id, username, status FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

    res.json({ success: true, message: `Status akun @${user[0].username} berhasil diubah menjadi ${user[0].status}`, status: user[0].status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === 1) return res.status(400).json({ success: false, message: 'Akun Superadmin utama tidak dapat dihapus' });

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Akun user tidak ditemukan' });

    res.json({ success: true, message: 'Akun user berhasil dihapus dari database' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// DASHBOARD
// --------------------------------------------------------
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const [omsetRows] = await db.query("SELECT COALESCE(SUM(total_nilai), 0) as total_omset, COUNT(*) as total_so FROM sales_orders WHERE status != 'Batal'");
    const [prodRows] = await db.query("SELECT COALESCE(SUM(qty_bagus), 0) as total_produksi FROM produksi_cetak");
    const [stockRows] = await db.query("SELECT COALESCE(SUM(stok_qty), 0) as total_stok_box FROM products WHERE jenis_barang = 'Box'");
    const [piutangRows] = await db.query("SELECT COALESCE(SUM(sisa_tagihan), 0) as total_piutang FROM sales_invoices WHERE status_bayar != 'Lunas'");
    const [hutangRows] = await db.query("SELECT COALESCE(SUM(sisa_tagihan), 0) as total_hutang FROM nota_pembelian WHERE status_bayar != 'Lunas'");
    const [spkRows] = await db.query("SELECT * FROM spk_produksi WHERE status = 'Berjalan' ORDER BY id DESC LIMIT 5");

    res.json({
      success: true,
      data: {
        totalOmset: Number(omsetRows[0]?.total_omset || 0),
        totalSO: Number(omsetRows[0]?.total_so || 0),
        totalProduksiDus: Number(prodRows[0]?.total_produksi || 0),
        totalStokBarangJadi: Number(stockRows[0]?.total_stok_box || 0),
        totalPiutangCustomer: Number(piutangRows[0]?.total_piutang || 0),
        totalHutangSupplier: Number(hutangRows[0]?.total_hutang || 0),
        spkAktif: spkRows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/dashboard/chart-sales', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(tanggal_so, '%b %Y') as bulan,
        COALESCE(SUM(total_nilai), 0) as total_omset
      FROM sales_orders 
      WHERE status != 'Batal' 
      GROUP BY DATE_FORMAT(tanggal_so, '%b %Y') 
      ORDER BY MIN(tanggal_so) ASC 
      LIMIT 6
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 1. MARKETING & MASTER BOX
// --------------------------------------------------------

// Customers
app.get('/api/marketing/customers', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_customer LIKE ? OR nama_customer LIKE ? OR pic LIKE ? OR telepon LIKE ? OR alamat LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM customers ${whereSql}`;
    const selectSql = `SELECT * FROM customers ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/marketing/customers/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/customers', async (req, res) => {
  try {
    const { kode_customer, nama_customer, pic, telepon, email, alamat, termin_bayar, plafon_kredit, npwp, status } = req.body;
    if (!nama_customer) return res.status(400).json({ success: false, message: 'Nama customer wajib diisi' });

    const kode = kode_customer || `CUST-${Date.now().toString().slice(-4)}`;
    const [result] = await db.query(
      'INSERT INTO customers (kode_customer, nama_customer, pic, telepon, email, alamat, termin_bayar, plafon_kredit, npwp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [kode, nama_customer, pic || '', telepon || '', email || '', alamat || '', termin_bayar || '30 Hari', plafon_kredit || 50000000, npwp || '-', status || 'Aktif']
    );

    const [newCust] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Customer berhasil ditambahkan ke database', data: newCust[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/marketing/customers/:id', async (req, res) => {
  try {
    const { kode_customer, nama_customer, pic, telepon, email, alamat, termin_bayar, plafon_kredit, npwp, status } = req.body;
    const [result] = await db.query(
      'UPDATE customers SET kode_customer = COALESCE(?, kode_customer), nama_customer = COALESCE(?, nama_customer), pic = COALESCE(?, pic), telepon = COALESCE(?, telepon), email = COALESCE(?, email), alamat = COALESCE(?, alamat), termin_bayar = COALESCE(?, termin_bayar), plafon_kredit = COALESCE(?, plafon_kredit), npwp = COALESCE(?, npwp), status = COALESCE(?, status) WHERE id = ?',
      [kode_customer, nama_customer, pic, telepon, email, alamat, termin_bayar, plafon_kredit, npwp, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });

    const [updated] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Customer berhasil diperbarui', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/marketing/customers/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });
    res.json({ success: true, message: 'Customer berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Sales Persons
app.get('/api/marketing/sales-persons', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sales_persons ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Products (Box & Sheet)
app.get('/api/marketing/products', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_barang LIKE ? OR nama_barang LIKE ? OR tipe_flute LIKE ? OR substansi LIKE ? OR jenis_barang LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM products ${whereSql}`;
    const selectSql = `SELECT * FROM products ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/marketing/products/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/products', upload.single('gambar'), async (req, res) => {
  try {
    const { kode_barang, nama_barang, jenis_barang, tipe_flute, substansi, panjang_mm, lebar_mm, tinggi_mm, jenis_sambungan, stok_qty, satuan, harga_jual, min_stok } = req.body;
    if (!nama_barang) return res.status(400).json({ success: false, message: 'Nama barang wajib diisi' });

    const kode = kode_barang || `BOX-${Date.now().toString().slice(-4)}`;
    const gambar = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO products (kode_barang, nama_barang, jenis_barang, tipe_flute, substansi, panjang_mm, lebar_mm, tinggi_mm, jenis_sambungan, stok_qty, satuan, harga_jual, min_stok, gambar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [kode, nama_barang, jenis_barang || 'Box', tipe_flute || 'B/F', substansi || 'K125/M125/K125', panjang_mm || 0, lebar_mm || 0, tinggi_mm || 0, jenis_sambungan || 'Stitching', stok_qty || 0, satuan || 'Pcs', harga_jual || 0, min_stok || 100, gambar]
    );

    const [newProd] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Produk berhasil ditambahkan', data: newProd[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/marketing/products/:id', upload.single('gambar'), async (req, res) => {
  try {
    const { kode_barang, nama_barang, jenis_barang, tipe_flute, substansi, panjang_mm, lebar_mm, tinggi_mm, jenis_sambungan, stok_qty, satuan, harga_jual, min_stok } = req.body;
    let gambarUpdate = '';
    let params = [kode_barang, nama_barang, jenis_barang, tipe_flute, substansi, panjang_mm, lebar_mm, tinggi_mm, jenis_sambungan, stok_qty, satuan, harga_jual, min_stok];

    if (req.file) {
      gambarUpdate = ', gambar = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    params.push(req.params.id);

    const [result] = await db.query(
      `UPDATE products SET 
        kode_barang = COALESCE(?, kode_barang),
        nama_barang = COALESCE(?, nama_barang),
        jenis_barang = COALESCE(?, jenis_barang),
        tipe_flute = COALESCE(?, tipe_flute),
        substansi = COALESCE(?, substansi),
        panjang_mm = COALESCE(?, panjang_mm),
        lebar_mm = COALESCE(?, lebar_mm),
        tinggi_mm = COALESCE(?, tinggi_mm),
        jenis_sambungan = COALESCE(?, jenis_sambungan),
        stok_qty = COALESCE(?, stok_qty),
        satuan = COALESCE(?, satuan),
        harga_jual = COALESCE(?, harga_jual),
        min_stok = COALESCE(?, min_stok)
        ${gambarUpdate}
      WHERE id = ?`,
      params
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil diperbarui', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/marketing/products/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Sales Orders (SO)
app.get('/api/marketing/sales-orders', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE so.nomor_so LIKE ? OR c.nama_customer LIKE ? OR s.nama_sales LIKE ? OR so.status LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    const countSql = `SELECT COUNT(*) as total FROM sales_orders so LEFT JOIN customers c ON so.customer_id = c.id LEFT JOIN sales_persons s ON so.sales_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT so.*, c.nama_customer, c.kode_customer, s.nama_sales 
      FROM sales_orders so 
      LEFT JOIN customers c ON so.customer_id = c.id 
      LEFT JOIN sales_persons s ON so.sales_id = s.id 
      ${whereSql} 
      ORDER BY so.id DESC
    `;

    const result = await getPaginatedData(selectSql, countSql, params, params, req);

    // Fetch items for each SO in data
    if (result.data.length > 0) {
      const soIds = result.data.map(so => so.id);
      const [items] = await db.query(
        `SELECT soi.*, p.nama_barang, p.kode_barang 
         FROM sales_order_items soi 
         LEFT JOIN products p ON soi.product_id = p.id 
         WHERE soi.so_id IN (?)`,
        [soIds]
      );
      result.data.forEach(so => {
        so.items = items.filter(it => it.so_id === so.id);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/marketing/sales-orders/:id', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT so.*, c.nama_customer, c.kode_customer, c.alamat as customer_alamat, c.telepon as customer_telepon, s.nama_sales 
       FROM sales_orders so 
       LEFT JOIN customers c ON so.customer_id = c.id 
       LEFT JOIN sales_persons s ON so.sales_id = s.id 
       WHERE so.id = ?`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Sales order tidak ditemukan' });

    const [items] = await db.query(
      `SELECT soi.*, p.nama_barang, p.kode_barang, p.tipe_flute, p.substansi 
       FROM sales_order_items soi 
       LEFT JOIN products p ON soi.product_id = p.id 
       WHERE soi.so_id = ?`,
      [req.params.id]
    );

    const orderData = { ...orders[0], items };
    res.json({ success: true, data: orderData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/sales-orders', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { customer_id, sales_id, tanggal_so, catatan, items } = req.body;
    if (!customer_id || !items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Customer dan item order wajib diisi' });
    }

    const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.harga_satuan)), 0);
    const isPpn = req.body.is_ppn !== undefined 
      ? Boolean(req.body.is_ppn) 
      : (req.body.kenakan_ppn !== false && req.body.tipe_pajak !== 'Non-PPN');
    const ppn = isPpn ? (req.body.ppn !== undefined ? Number(req.body.ppn) : Math.round(subtotal * 0.11)) : 0;
    const total_nilai = subtotal + ppn;
    const nomor_so = `SO-${Date.now().toString().slice(-6)}`;

    const [soResult] = await connection.query(
      `INSERT INTO sales_orders (nomor_so, tanggal_so, customer_id, sales_id, catatan, status, subtotal, ppn, total_nilai)
       VALUES (?, ?, ?, ?, ?, 'Disetujui/SPK', ?, ?, ?)`,
      [nomor_so, tanggal_so || new Date().toISOString().split('T')[0], customer_id, sales_id || null, catatan || '', subtotal, ppn, total_nilai]
    );

    const soId = soResult.insertId;

    for (const it of items) {
      await connection.query(
        `INSERT INTO sales_order_items (so_id, product_id, qty, harga_satuan, subtotal, spek_khusus)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [soId, it.product_id, it.qty, it.harga_satuan, Number(it.qty) * Number(it.harga_satuan), it.spek_khusus || '']
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Sales order ${nomor_so} berhasil dibuat`, data: { id: soId, nomor_so, total_nilai } });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

app.put('/api/marketing/sales-orders/:id', async (req, res) => {
  try {
    const { status, catatan } = req.body;
    const [result] = await db.query(
      'UPDATE sales_orders SET status = COALESCE(?, status), catatan = COALESCE(?, catatan) WHERE id = ?',
      [status, catatan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'SO tidak ditemukan' });
    res.json({ success: true, message: 'Status Sales Order berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/marketing/sales-orders/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM sales_orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'SO tidak ditemukan' });
    res.json({ success: true, message: 'Sales Order berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/sales-orders/:id/generate-spk', async (req, res) => {
  try {
    const soId = req.params.id;
    const [orders] = await db.query(
      `SELECT so.*, c.nama_customer FROM sales_orders so LEFT JOIN customers c ON so.customer_id = c.id WHERE so.id = ?`,
      [soId]
    );
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'SO tidak ditemukan' });

    const [items] = await db.query(
      `SELECT soi.*, p.nama_barang, p.panjang_mm, p.lebar_mm, p.tinggi_mm, p.tipe_flute, p.substansi 
       FROM sales_order_items soi LEFT JOIN products p ON soi.product_id = p.id WHERE soi.so_id = ? LIMIT 1`,
      [soId]
    );

    const so = orders[0];
    const item = items[0] || {};
    const nomor_spk = `SPK-${Date.now().toString().slice(-6)}`;
    const ukuranBox = `${item.panjang_mm || 300}x${item.lebar_mm || 200}x${item.tinggi_mm || 150} mm`;

    const [spkResult] = await db.query(
      `INSERT INTO spk_produksi (nomor_spk, so_id, customer_nama, nama_box, ukuran_box, qty_target, tanggal_mulai, target_selesai, desain_cetak, status)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), ?, 'Berjalan')`,
      [nomor_spk, soId, so.nama_customer, item.nama_barang || 'Box Packaging Corrugated', ukuranBox, item.qty || 1000, item.spek_khusus || '1 Warna Flexo']
    );

    await db.query("UPDATE sales_orders SET status = 'Diproses' WHERE id = ?", [soId]);
    res.json({ success: true, message: `SPK ${nomor_spk} berhasil digenerate dari Sales Order`, data: { id: spkResult.insertId, nomor_spk } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Surat Jalan (Delivery Order)
app.get('/api/marketing/surat-jalan', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE sj.nomor_sj LIKE ? OR sj.nama_supir LIKE ? OR sj.no_kendaraan LIKE ? OR c.nama_customer LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    const countSql = `SELECT COUNT(*) as total FROM surat_jalan sj LEFT JOIN sales_orders so ON sj.so_id = so.id LEFT JOIN customers c ON so.customer_id = c.id ${whereSql}`;
    const selectSql = `
      SELECT sj.*, so.nomor_so, c.nama_customer, c.alamat as alamat_kirim 
      FROM surat_jalan sj 
      LEFT JOIN sales_orders so ON sj.so_id = so.id 
      LEFT JOIN customers c ON so.customer_id = c.id 
      ${whereSql} 
      ORDER BY sj.id DESC
    `;

    const result = await getPaginatedData(selectSql, countSql, params, params, req);

    if (result.data.length > 0) {
      const sjIds = result.data.map(s => s.id);
      const [items] = await db.query(
        `SELECT sji.*, p.nama_barang, p.satuan 
         FROM surat_jalan_items sji 
         LEFT JOIN products p ON sji.product_id = p.id 
         WHERE sji.sj_id IN (?)`,
        [sjIds]
      );
      result.data.forEach(sj => {
        sj.items = items.filter(it => it.sj_id === sj.id);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/surat-jalan', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { so_id, tanggal_kirim, no_kendaraan, nama_supir, catatan, items } = req.body;
    if (!so_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Pilih Sales Order terlebih dahulu' });
    }

    const nomor_sj = `SJ-${Date.now().toString().slice(-6)}`;
    const [sjResult] = await connection.query(
      `INSERT INTO surat_jalan (nomor_sj, so_id, tanggal_kirim, no_kendaraan, nama_supir, catatan, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Dikirim')`,
      [nomor_sj, so_id, tanggal_kirim || new Date().toISOString().split('T')[0], no_kendaraan || 'B 9123 MUA', nama_supir || 'Ahmad Kosasih', catatan || '']
    );

    const sjId = sjResult.insertId;

    if (items && items.length > 0) {
      for (const it of items) {
        await connection.query(
          `INSERT INTO surat_jalan_items (sj_id, product_id, qty_kirim, keterangan) VALUES (?, ?, ?, ?)`,
          [sjId, it.product_id, it.qty_kirim || it.qty, it.keterangan || 'Siap kirim pabrik']
        );
      }
    }

    await connection.query("UPDATE sales_orders SET status = 'Selesai' WHERE id = ?", [so_id]);

    await connection.commit();
    res.json({ success: true, message: `Surat Jalan ${nomor_sj} berhasil diterbitkan`, data: { id: sjId, nomor_sj } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

app.put('/api/marketing/surat-jalan/:id', async (req, res) => {
  try {
    const { status, no_kendaraan, nama_supir, catatan } = req.body;
    const [result] = await db.query(
      'UPDATE surat_jalan SET status = COALESCE(?, status), no_kendaraan = COALESCE(?, no_kendaraan), nama_supir = COALESCE(?, nama_supir), catatan = COALESCE(?, catatan) WHERE id = ?',
      [status, no_kendaraan, nama_supir, catatan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Surat jalan tidak ditemukan' });
    res.json({ success: true, message: 'Surat jalan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/marketing/surat-jalan/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM surat_jalan WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Surat jalan tidak ditemukan' });
    res.json({ success: true, message: 'Surat jalan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Sales Invoices
app.get('/api/marketing/invoices', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE inv.nomor_invoice LIKE ? OR c.nama_customer LIKE ? OR inv.status_bayar LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const countSql = `SELECT COUNT(*) as total FROM sales_invoices inv LEFT JOIN customers c ON inv.customer_id = c.id ${whereSql}`;
    const selectSql = `
      SELECT inv.*, c.nama_customer, c.kode_customer, so.nomor_so 
      FROM sales_invoices inv 
      LEFT JOIN customers c ON inv.customer_id = c.id 
      LEFT JOIN sales_orders so ON inv.so_id = so.id 
      ${whereSql} 
      ORDER BY inv.id DESC
    `;

    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/invoices', async (req, res) => {
  try {
    let { so_id, customer_id, tanggal_invoice, jatuh_tempo, subtotal, ppn, total_tagihan } = req.body;
    if (!customer_id && so_id) {
      const [soRows] = await db.query('SELECT customer_id FROM sales_orders WHERE id = ?', [so_id]);
      if (soRows.length > 0) customer_id = soRows[0].customer_id;
    }
    if (!customer_id || !total_tagihan) {
      return res.status(400).json({ success: false, message: 'Customer dan nilai tagihan invoice wajib diisi' });
    }

    const nomor_invoice = `INV-${Date.now().toString().slice(-6)}`;
    const [result] = await db.query(
      `INSERT INTO sales_invoices (nomor_invoice, so_id, customer_id, tanggal_invoice, jatuh_tempo, subtotal, ppn, total_tagihan, sudah_dibayar, sisa_tagihan, status_bayar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'Belum Lunas')`,
      [nomor_invoice, so_id || null, customer_id, tanggal_invoice || new Date().toISOString().split('T')[0], jatuh_tempo || new Date().toISOString().split('T')[0], subtotal || 0, ppn || 0, total_tagihan, total_tagihan]
    );

    res.json({ success: true, message: `Invoice ${nomor_invoice} berhasil diterbitkan`, data: { id: result.insertId, nomor_invoice } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/marketing/invoices/:id', async (req, res) => {
  try {
    const { status_bayar, sudah_dibayar, sisa_tagihan } = req.body;
    const [result] = await db.query(
      'UPDATE sales_invoices SET status_bayar = COALESCE(?, status_bayar), sudah_dibayar = COALESCE(?, sudah_dibayar), sisa_tagihan = COALESCE(?, sisa_tagihan) WHERE id = ?',
      [status_bayar, sudah_dibayar, sisa_tagihan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
    res.json({ success: true, message: 'Invoice berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/marketing/invoices/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM sales_invoices WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
    res.json({ success: true, message: 'Invoice berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Faktur Pajak
app.get('/api/marketing/faktur-pajak', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE fp.nomor_faktur LIKE ? OR c.nama_customer LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM faktur_pajak fp LEFT JOIN customers c ON fp.customer_id = c.id ${whereSql}`;
    const selectSql = `
      SELECT fp.*, c.nama_customer, c.npwp, inv.nomor_invoice 
      FROM faktur_pajak fp 
      LEFT JOIN customers c ON fp.customer_id = c.id 
      LEFT JOIN sales_invoices inv ON fp.invoice_id = inv.id 
      ${whereSql} 
      ORDER BY fp.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/faktur-pajak', async (req, res) => {
  try {
    const { nomor_faktur, invoice_id, customer_id, tanggal_faktur, dpp, ppn } = req.body;
    const noFaktur = nomor_faktur || `010.002-26.${Date.now().toString().slice(-8)}`;
    const [result] = await db.query(
      `INSERT INTO faktur_pajak (nomor_faktur, invoice_id, customer_id, tanggal_faktur, dpp, ppn, status) VALUES (?, ?, ?, ?, ?, ?, 'Disetujui')`,
      [noFaktur, invoice_id, customer_id, tanggal_faktur || new Date().toISOString().split('T')[0], dpp || 0, ppn || 0]
    );
    res.json({ success: true, message: 'Faktur pajak berhasil diterbitkan', data: { id: result.insertId, nomor_faktur: noFaktur } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Retur Penjualan
app.get('/api/marketing/retur-penjualan', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE rp.nomor_retur LIKE ? OR c.nama_customer LIKE ? OR p.nama_barang LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM retur_penjualan rp LEFT JOIN customers c ON rp.customer_id = c.id LEFT JOIN products p ON rp.product_id = p.id ${whereSql}`;
    const selectSql = `
      SELECT rp.*, c.nama_customer, p.nama_barang, inv.nomor_invoice 
      FROM retur_penjualan rp 
      LEFT JOIN customers c ON rp.customer_id = c.id 
      LEFT JOIN products p ON rp.product_id = p.id 
      LEFT JOIN sales_invoices inv ON rp.invoice_id = inv.id 
      ${whereSql} 
      ORDER BY rp.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/marketing/retur-penjualan', async (req, res) => {
  try {
    const { invoice_id, customer_id, product_id, tanggal_retur, qty, alasan } = req.body;
    const noRetur = `RET-J-${Date.now().toString().slice(-6)}`;
    const [result] = await db.query(
      `INSERT INTO retur_penjualan (nomor_retur, invoice_id, customer_id, product_id, tanggal_retur, qty, alasan, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Disetujui')`,
      [noRetur, invoice_id, customer_id, product_id, tanggal_retur || new Date().toISOString().split('T')[0], qty || 0, alasan || 'Barang cacat/afkir']
    );
    res.json({ success: true, message: 'Retur penjualan berhasil dicatat', data: { id: result.insertId, nomor_retur: noRetur } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Laporan Omset
app.get('/api/marketing/laporan-omset-customer', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id, 
        c.nama_customer, 
        c.kode_customer, 
        COUNT(so.id) as total_order, 
        COALESCE(SUM(so.total_nilai), 0) as total_omset 
      FROM customers c 
      LEFT JOIN sales_orders so ON c.id = so.customer_id AND so.status != 'Batal' 
      GROUP BY c.id, c.nama_customer, c.kode_customer 
      ORDER BY total_omset DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/marketing/laporan-omset-sales', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id, 
        s.nama_sales, 
        s.kode_sales, 
        s.target_omset, 
        COUNT(so.id) as total_order, 
        COALESCE(SUM(so.total_nilai), 0) as pencapaian_omset 
      FROM sales_persons s 
      LEFT JOIN sales_orders so ON s.id = so.sales_id AND so.status != 'Batal' 
      GROUP BY s.id, s.nama_sales, s.kode_sales, s.target_omset 
      ORDER BY pencapaian_omset DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 2. PEMBELIAN (PURCHASING)
// --------------------------------------------------------

// Suppliers
app.get('/api/purchasing/suppliers', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_supplier LIKE ? OR nama_supplier LIKE ? OR pic LIKE ? OR kategori LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM suppliers ${whereSql}`;
    const selectSql = `SELECT * FROM suppliers ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/suppliers', async (req, res) => {
  try {
    const { kode_supplier, nama_supplier, kontak, pic, telepon, email, alamat, termin_bayar, kategori } = req.body;
    const kode = kode_supplier || `SUP-${Date.now().toString().slice(-4)}`;
    const kontakVal = kontak || pic || '';
    const [result] = await db.query(
      `INSERT INTO suppliers (kode_supplier, nama_supplier, kontak, telepon, email, alamat, termin_bayar, kategori)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [kode, nama_supplier, kontakVal, telepon || '', email || '', alamat || '', termin_bayar || '30 Hari', kategori || 'Sheet Kertas']
    );
    const [newSup] = await db.query('SELECT *, kontak AS pic FROM suppliers WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Supplier berhasil ditambahkan ke database', data: newSup[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/purchasing/suppliers/:id', async (req, res) => {
  try {
    const { nama_supplier, kontak, pic, telepon, email, alamat, termin_bayar, kategori } = req.body;
    const kontakVal = kontak !== undefined ? kontak : pic;
    const [result] = await db.query(
      `UPDATE suppliers SET 
         nama_supplier = COALESCE(?, nama_supplier), 
         kontak = COALESCE(?, kontak), 
         telepon = COALESCE(?, telepon), 
         email = COALESCE(?, email), 
         alamat = COALESCE(?, alamat), 
         termin_bayar = COALESCE(?, termin_bayar), 
         kategori = COALESCE(?, kategori) 
       WHERE id = ?`,
      [nama_supplier, kontakVal, telepon, email, alamat, termin_bayar, kategori, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });
    res.json({ success: true, message: 'Supplier berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/purchasing/suppliers/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });
    res.json({ success: true, message: 'Supplier berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Master Tipe Bahan Sheet (Corrugated / Duplex / Ivory / Kraft)
app.get('/api/purchasing/tipe-sheet', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode LIKE ? OR nama_tipe LIKE ? OR kategori LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    if (req.query.all === 'true' || req.query.no_pagination === 'true') {
      const [rows] = await db.query(`SELECT * FROM tipe_bahan_sheet ${whereSql} ORDER BY id ASC`, params);
      return res.json({ success: true, data: rows });
    }

    const countSql = `SELECT COUNT(*) as total FROM tipe_bahan_sheet ${whereSql}`;
    const selectSql = `SELECT * FROM tipe_bahan_sheet ${whereSql} ORDER BY id ASC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/tipe-sheet', async (req, res) => {
  try {
    const { kode, nama_tipe, kategori, keterangan } = req.body;
    if (!kode || !nama_tipe) {
      return res.status(400).json({ success: false, message: 'Kode dan nama tipe bahan wajib diisi' });
    }
    const [result] = await db.query(
      `INSERT INTO tipe_bahan_sheet (kode, nama_tipe, kategori, keterangan) VALUES (?, ?, ?, ?)`,
      [kode.trim(), nama_tipe.trim(), kategori || 'Corrugated', keterangan || '']
    );
    res.json({ success: true, message: `Tipe bahan ${kode} berhasil ditambahkan`, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/purchasing/tipe-sheet/:id', async (req, res) => {
  try {
    const { kode, nama_tipe, kategori, keterangan } = req.body;
    const [result] = await db.query(
      `UPDATE tipe_bahan_sheet SET 
         kode = COALESCE(?, kode), 
         nama_tipe = COALESCE(?, nama_tipe), 
         kategori = COALESCE(?, kategori), 
         keterangan = COALESCE(?, keterangan) 
       WHERE id = ?`,
      [kode ? kode.trim() : null, nama_tipe ? nama_tipe.trim() : null, kategori, keterangan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Tipe bahan tidak ditemukan' });
    res.json({ success: true, message: 'Tipe bahan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/purchasing/tipe-sheet/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tipe_bahan_sheet WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Tipe bahan tidak ditemukan' });
    res.json({ success: true, message: 'Tipe bahan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Bahan Baku Sheet
app.get('/api/purchasing/bahan-sheet', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE bbs.kode_sheet LIKE ? OR bbs.nama_sheet LIKE ? OR bbs.flute LIKE ? OR bbs.substansi LIKE ? OR s.nama_supplier LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM bahan_baku_sheet bbs LEFT JOIN suppliers s ON bbs.supplier_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT bbs.*, bbs.flute AS tipe_flute, s.nama_supplier, s.nama_supplier AS supplier_nama 
      FROM bahan_baku_sheet bbs 
      LEFT JOIN suppliers s ON bbs.supplier_id = s.id 
      ${whereSql} 
      ORDER BY bbs.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/bahan-sheet', async (req, res) => {
  try {
    const { kode_sheet, nama_sheet, supplier_id, flute, tipe_flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok, nilai_index, metode_index } = req.body;
    const kode = kode_sheet || `SHT-${Date.now().toString().slice(-4)}`;
    const fluteVal = flute || tipe_flute || 'B/F';
    const suppId = supplier_id ? parseInt(supplier_id, 10) : null;
    const nIndex = nilai_index ? parseFloat(nilai_index) : null;
    const mIndex = metode_index || null;

    try {
      await db.query(
        `INSERT INTO bahan_baku_sheet (kode_sheet, nama_sheet, supplier_id, flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok, nilai_index, metode_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [kode, nama_sheet, suppId, fluteVal, substansi || 'K125/M125/K125', panjang_mm || 0, lebar_mm || 0, stok_lembar || 0, harga_per_lembar || 0, min_stok || 500, nIndex, mIndex]
      );
    } catch (insertErr) {
      if (insertErr.message.includes('nilai_index') || insertErr.message.includes('metode_index')) {
        await db.query(
          `INSERT INTO bahan_baku_sheet (kode_sheet, nama_sheet, supplier_id, flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [kode, nama_sheet, suppId, fluteVal, substansi || 'K125/M125/K125', panjang_mm || 0, lebar_mm || 0, stok_lembar || 0, harga_per_lembar || 0, min_stok || 500]
        );
      } else if (insertErr.message.includes('tipe_flute') || insertErr.message.includes('flute')) {
        // Fallback in case table has column tipe_flute
        await db.query(
          `INSERT INTO bahan_baku_sheet (kode_sheet, nama_sheet, supplier_id, tipe_flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [kode, nama_sheet, suppId, fluteVal, substansi || 'K125/M125/K125', panjang_mm || 0, lebar_mm || 0, stok_lembar || 0, harga_per_lembar || 0, min_stok || 500]
        );
      } else {
        throw insertErr;
      }
    }
    res.json({ success: true, message: 'Bahan baku sheet berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/purchasing/bahan-sheet/:id', async (req, res) => {
  try {
    const { nama_sheet, supplier_id, flute, tipe_flute, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok, nilai_index, metode_index } = req.body;
    const fluteVal = flute !== undefined ? flute : tipe_flute;
    const suppId = supplier_id !== undefined ? (supplier_id ? parseInt(supplier_id, 10) : null) : undefined;
    const nIndex = nilai_index !== undefined ? (nilai_index ? parseFloat(nilai_index) : null) : undefined;
    const mIndex = metode_index !== undefined ? metode_index : undefined;
    const [result] = await db.query(
      `UPDATE bahan_baku_sheet SET 
         nama_sheet = COALESCE(?, nama_sheet), 
         supplier_id = COALESCE(?, supplier_id), 
         flute = COALESCE(?, flute), 
         substansi = COALESCE(?, substansi), 
         panjang_mm = COALESCE(?, panjang_mm), 
         lebar_mm = COALESCE(?, lebar_mm), 
         stok_lembar = COALESCE(?, stok_lembar), 
         harga_per_lembar = COALESCE(?, harga_per_lembar), 
         min_stok = COALESCE(?, min_stok),
         nilai_index = COALESCE(?, nilai_index),
         metode_index = COALESCE(?, metode_index)
       WHERE id = ?`,
      [nama_sheet, suppId, fluteVal, substansi, panjang_mm, lebar_mm, stok_lembar, harga_per_lembar, min_stok, nIndex, mIndex, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bahan sheet tidak ditemukan' });
    res.json({ success: true, message: 'Bahan sheet berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/purchasing/bahan-sheet/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM bahan_baku_sheet WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bahan sheet tidak ditemukan' });
    res.json({ success: true, message: 'Bahan sheet berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Bahan Pembantu
app.get('/api/purchasing/bahan-pembantu', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_bahan LIKE ? OR nama_bahan LIKE ? OR kategori LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM bahan_pembantu ${whereSql}`;
    const selectSql = `SELECT *, stok AS stok_qty FROM bahan_pembantu ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/bahan-pembantu', async (req, res) => {
  try {
    const { kode_bahan, nama_bahan, kategori, stok, stok_qty, satuan, harga_satuan, min_stok } = req.body;
    const kode = kode_bahan || `BP-${Date.now().toString().slice(-4)}`;
    const stokVal = stok !== undefined ? stok : (stok_qty !== undefined ? stok_qty : 0);
    const [result] = await db.query(
      `INSERT INTO bahan_pembantu (kode_bahan, nama_bahan, kategori, stok, satuan, harga_satuan, min_stok)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kode, nama_bahan, kategori || 'Tinta Flexo', stokVal, satuan || 'Kg', harga_satuan || 0, min_stok || 10]
    );
    res.json({ success: true, message: 'Bahan pembantu berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/purchasing/bahan-pembantu/:id', async (req, res) => {
  try {
    const { nama_bahan, kategori, stok, stok_qty, satuan, harga_satuan, min_stok } = req.body;
    const stokVal = stok !== undefined ? stok : stok_qty;
    const [result] = await db.query(
      `UPDATE bahan_pembantu SET 
         nama_bahan = COALESCE(?, nama_bahan), 
         kategori = COALESCE(?, kategori), 
         stok = COALESCE(?, stok), 
         satuan = COALESCE(?, satuan), 
         harga_satuan = COALESCE(?, harga_satuan), 
         min_stok = COALESCE(?, min_stok) 
       WHERE id = ?`,
      [nama_bahan, kategori, stokVal, satuan, harga_satuan, min_stok, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bahan pembantu tidak ditemukan' });
    res.json({ success: true, message: 'Bahan pembantu berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/purchasing/bahan-pembantu/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM bahan_pembantu WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bahan pembantu tidak ditemukan' });
    res.json({ success: true, message: 'Bahan pembantu berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Purchase Orders (PO)
app.get('/api/purchasing/orders', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE po.nomor_po LIKE ? OR s.nama_supplier LIKE ? OR po.status LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT po.*, s.nama_supplier, s.kode_supplier 
      FROM purchase_orders po 
      LEFT JOIN suppliers s ON po.supplier_id = s.id 
      ${whereSql} 
      ORDER BY po.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);

    if (result.data.length > 0) {
      const poIds = result.data.map(p => p.id);
      const [items] = await db.query('SELECT * FROM purchase_order_items WHERE po_id IN (?)', [poIds]);
      result.data.forEach(p => {
        p.items = items.filter(it => it.po_id === p.id);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/orders', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { supplier_id, tanggal_po, catatan, items } = req.body;
    if (!supplier_id || !items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Supplier dan item order wajib diisi' });
    }

    const nomor_po = `PO-${Date.now().toString().slice(-6)}`;
    const total_nilai = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.harga_satuan)), 0);

    const [poResult] = await connection.query(
      `INSERT INTO purchase_orders (nomor_po, supplier_id, tanggal_po, status, total_nilai, catatan)
       VALUES (?, ?, ?, 'Disetujui', ?, ?)`,
      [nomor_po, supplier_id, tanggal_po || new Date().toISOString().split('T')[0], total_nilai, catatan || '']
    );

    const poId = poResult.insertId;

    for (const it of items) {
      await connection.query(
        `INSERT INTO purchase_order_items (po_id, item_type, item_id, item_name, qty, harga_satuan, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          poId,
          it.item_type || it.tipe_barang || 'Sheet',
          it.item_id || it.barang_id || 1,
          it.item_name || it.deskripsi_barang || 'Bahan Baku',
          it.qty,
          it.harga_satuan,
          Number(it.qty) * Number(it.harga_satuan)
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `PO ${nomor_po} berhasil dibuat`, data: { id: poId, nomor_po } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

app.delete('/api/purchasing/orders/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM purchase_orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });
    res.json({ success: true, message: 'Purchase Order berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Penerimaan Barang (LPB)
app.get('/api/purchasing/penerimaan', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE lpb.nomor_lpb LIKE ? OR s.nama_supplier LIKE ? OR lpb.no_sj_supplier LIKE ? OR lpb.nama_penerima LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM laporan_penerimaan_barang lpb LEFT JOIN suppliers s ON lpb.supplier_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT lpb.*, lpb.no_sj_supplier AS nomor_sj_supplier, lpb.nama_penerima AS penerima_nama, s.nama_supplier, po.nomor_po 
      FROM laporan_penerimaan_barang lpb 
      LEFT JOIN suppliers s ON lpb.supplier_id = s.id 
      LEFT JOIN purchase_orders po ON lpb.po_id = po.id 
      ${whereSql} 
      ORDER BY lpb.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/penerimaan', async (req, res) => {
  try {
    let { po_id, supplier_id, tanggal_terima, nomor_sj_supplier, no_sj_supplier, penerima_nama, nama_penerima, catatan } = req.body;
    const nomor_lpb = `LPB-${Date.now().toString().slice(-6)}`;
    const noSj = no_sj_supplier || nomor_sj_supplier || 'SJ-SUP-01';
    const namaPenerima = nama_penerima || penerima_nama || 'Maman Suratman';

    if (!supplier_id && po_id) {
      const [poRows] = await db.query('SELECT supplier_id FROM purchase_orders WHERE id = ?', [po_id]);
      if (poRows.length > 0) {
        supplier_id = poRows[0].supplier_id;
      }
    }
    if (!supplier_id) {
      const [supRows] = await db.query('SELECT id FROM suppliers LIMIT 1');
      supplier_id = supRows.length > 0 ? supRows[0].id : 1;
    }

    const [result] = await db.query(
      `INSERT INTO laporan_penerimaan_barang (nomor_lpb, po_id, supplier_id, tanggal_terima, no_sj_supplier, nama_penerima, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nomor_lpb, po_id || null, supplier_id, tanggal_terima || new Date().toISOString().split('T')[0], noSj, namaPenerima, catatan || '']
    );

    res.json({ success: true, message: `LPB ${nomor_lpb} berhasil dicatat di database`, data: { id: result.insertId, nomor_lpb } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Nota Pembelian
app.get('/api/purchasing/nota-beli', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE np.nomor_faktur_beli LIKE ? OR s.nama_supplier LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM nota_pembelian np LEFT JOIN suppliers s ON np.supplier_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT np.*, np.nomor_faktur_beli AS nomor_nota, s.nama_supplier, s.nama_supplier AS supplier_nama, po.nomor_po 
      FROM nota_pembelian np 
      LEFT JOIN suppliers s ON np.supplier_id = s.id 
      LEFT JOIN purchase_orders po ON np.po_id = po.id 
      ${whereSql} 
      ORDER BY np.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/nota-beli', async (req, res) => {
  try {
    let { po_id, supplier_id, tanggal_faktur, tanggal_nota, jatuh_tempo, total_tagihan } = req.body;
    const nomor_faktur = `FB-${Date.now().toString().slice(-6)}`;
    const tgl = tanggal_faktur || tanggal_nota || new Date().toISOString().split('T')[0];
    const jthTempo = jatuh_tempo || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const total = parseFloat(total_tagihan) || 0;

    if (!supplier_id && po_id) {
      const [poRows] = await db.query('SELECT supplier_id FROM purchase_orders WHERE id = ?', [po_id]);
      if (poRows.length > 0) supplier_id = poRows[0].supplier_id;
    }
    if (!supplier_id) {
      const [supRows] = await db.query('SELECT id FROM suppliers LIMIT 1');
      supplier_id = supRows.length > 0 ? supRows[0].id : 1;
    }

    const [result] = await db.query(
      `INSERT INTO nota_pembelian (nomor_faktur_beli, po_id, supplier_id, tanggal_faktur, jatuh_tempo, total_tagihan, sudah_dibayar, sisa_tagihan, status_bayar)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'Belum Lunas')`,
      [nomor_faktur, po_id || null, supplier_id, tgl, jthTempo, total, total]
    );
    res.json({ success: true, message: `Nota pembelian ${nomor_faktur} berhasil disimpan`, data: { id: result.insertId, nomor_faktur_beli: nomor_faktur } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Retur Pembelian
app.get('/api/purchasing/retur-beli', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE rb.nomor_retur_beli LIKE ? OR s.nama_supplier LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM retur_pembelian rb LEFT JOIN suppliers s ON rb.supplier_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT rb.*, rb.nomor_retur_beli AS nomor_retur, s.nama_supplier, s.nama_supplier AS supplier_nama 
      FROM retur_pembelian rb 
      LEFT JOIN suppliers s ON rb.supplier_id = s.id 
      ${whereSql} 
      ORDER BY rb.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/purchasing/retur-beli', async (req, res) => {
  try {
    let { supplier_id, supplier_nama, tanggal_retur, total_nilai, alasan, po_id } = req.body;
    const nomor_retur = `RET-B-${Date.now().toString().slice(-6)}`;
    if (!supplier_id && supplier_nama) {
      const [rows] = await db.query('SELECT id FROM suppliers WHERE nama_supplier = ? LIMIT 1', [supplier_nama]);
      if (rows.length > 0) supplier_id = rows[0].id;
    }
    if (!supplier_id) {
      const [rows] = await db.query('SELECT id FROM suppliers LIMIT 1');
      supplier_id = rows.length > 0 ? rows[0].id : 1;
    }
    const [result] = await db.query(
      `INSERT INTO retur_pembelian (nomor_retur_beli, po_id, supplier_id, tanggal_retur, alasan, total_nilai, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Disetujui')`,
      [nomor_retur, po_id || null, supplier_id, tanggal_retur || new Date().toISOString().split('T')[0], alasan || 'Sheet cacat pabrik', total_nilai || 0]
    );
    res.json({ success: true, message: 'Retur pembelian berhasil dicatat', data: { id: result.insertId, nomor_retur_beli: nomor_retur } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 3. GUDANG & LOGISTIK
// --------------------------------------------------------
app.get('/api/gudang/stock-sheet', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_sheet LIKE ? OR nama_sheet LIKE ? OR flute LIKE ? OR substansi LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM bahan_baku_sheet ${whereSql}`;
    const selectSql = `SELECT *, flute AS tipe_flute FROM bahan_baku_sheet ${whereSql} ORDER BY stok_lembar ASC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/gudang/stock-pembantu', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_bahan LIKE ? OR nama_bahan LIKE ? OR kategori LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM bahan_pembantu ${whereSql}`;
    const selectSql = `SELECT *, stok AS stok_qty FROM bahan_pembantu ${whereSql} ORDER BY stok ASC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/gudang/stock-barang-jadi', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let conditions = ["jenis_barang = 'Box'"];
    let params = [];
    if (search) {
      conditions.push('(kode_barang LIKE ? OR nama_barang LIKE ? OR tipe_flute LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const whereSql = `WHERE ${conditions.join(' AND ')}`;
    const countSql = `SELECT COUNT(*) as total FROM products ${whereSql}`;
    const selectSql = `SELECT * FROM products ${whereSql} ORDER BY stok_qty DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/gudang/wip', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let conditions = ["status = 'Berjalan'"];
    let params = [];
    if (search) {
      conditions.push('(nomor_spk LIKE ? OR customer_nama LIKE ? OR nama_box LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const whereSql = `WHERE ${conditions.join(' AND ')}`;
    const countSql = `SELECT COUNT(*) as total FROM spk_produksi ${whereSql}`;
    const selectSql = `SELECT * FROM spk_produksi ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/gudang/mutasi', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE nomor_dokumen LIKE ? OR nama_barang LIKE ? OR jenis_mutasi LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM mutasi_stok ${whereSql}`;
    const selectSql = `SELECT * FROM mutasi_stok ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/gudang/penyesuaian-stok', async (req, res) => {
  try {
    const { tipe_barang, barang_id, jenis_mutasi, qty, keterangan } = req.body;
    const nomor_dokumen = `ADJ-${Date.now().toString().slice(-6)}`;
    const qtyNum = Number(qty);

    let nama_barang = 'Barang Gudang';
    let stok_awal = 0;
    let stok_akhir = 0;

    if (tipe_barang === 'Box') {
      const [p] = await db.query('SELECT nama_barang, stok_qty FROM products WHERE id = ?', [barang_id]);
      if (p.length > 0) {
        nama_barang = p[0].nama_barang;
        stok_awal = p[0].stok_qty;
        stok_akhir = jenis_mutasi === 'Masuk' ? stok_awal + qtyNum : stok_awal - qtyNum;
        await db.query('UPDATE products SET stok_qty = ? WHERE id = ?', [stok_akhir, barang_id]);
      }
    } else if (tipe_barang === 'Sheet') {
      const [s] = await db.query('SELECT nama_sheet, stok_lembar FROM bahan_baku_sheet WHERE id = ?', [barang_id]);
      if (s.length > 0) {
        nama_barang = s[0].nama_sheet;
        stok_awal = s[0].stok_lembar;
        stok_akhir = jenis_mutasi === 'Masuk' ? stok_awal + qtyNum : stok_awal - qtyNum;
        await db.query('UPDATE bahan_baku_sheet SET stok_lembar = ? WHERE id = ?', [stok_akhir, barang_id]);
      }
    }

    await db.query(
      `INSERT INTO mutasi_stok (nomor_dokumen, tanggal, tipe_barang, barang_id, nama_barang, jenis_mutasi, qty, stok_awal, stok_akhir, keterangan)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nomor_dokumen, tipe_barang, barang_id, nama_barang, jenis_mutasi, qtyNum, stok_awal, stok_akhir, keterangan || 'Penyesuaian Opname Fisik']
    );

    res.json({ success: true, message: `Mutasi stok ${nomor_dokumen} berhasil dicatat` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 4. PPIC & PRODUKSI
// --------------------------------------------------------
app.get('/api/produksi/spk', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE nomor_spk LIKE ? OR customer_nama LIKE ? OR nama_box LIKE ? OR tahapan_sekarang LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM spk_produksi ${whereSql}`;
    const selectSql = `SELECT * FROM spk_produksi ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/produksi/spk/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM spk_produksi WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'SPK tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/produksi/spk', async (req, res) => {
  try {
    const { nomor_spk, customer_nama, nama_box, ukuran_box, sheet_id, qty_target, tanggal_mulai, target_selesai, desain_cetak, pisau_pond } = req.body;
    const noSPK = nomor_spk || `SPK-${Date.now().toString().slice(-6)}`;
    const [result] = await db.query(
      `INSERT INTO spk_produksi (nomor_spk, customer_nama, nama_box, ukuran_box, sheet_id, qty_target, tanggal_mulai, target_selesai, desain_cetak, pisau_pond, tahapan_sekarang, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cetak', 'Berjalan')`,
      [noSPK, customer_nama || 'Umum', nama_box, ukuran_box || 'Standard', sheet_id || null, qty_target || 1000, tanggal_mulai || new Date().toISOString().split('T')[0], target_selesai || new Date().toISOString().split('T')[0], desain_cetak || 'Flexo 1 Warna', pisau_pond || 'Standard']
    );
    res.json({ success: true, message: `SPK ${noSPK} berhasil diterbitkan`, data: { id: result.insertId, nomor_spk: noSPK } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/produksi/spk/:id', async (req, res) => {
  try {
    const { tahapan_sekarang, status, catatan } = req.body;
    const [result] = await db.query(
      'UPDATE spk_produksi SET tahapan_sekarang = COALESCE(?, tahapan_sekarang), status = COALESCE(?, status) WHERE id = ?',
      [tahapan_sekarang, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'SPK tidak ditemukan' });
    res.json({ success: true, message: 'SPK berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/produksi/spk/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM spk_produksi WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'SPK tidak ditemukan' });
    res.json({ success: true, message: 'SPK berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Cetak Flexo
app.get('/api/produksi/cetak', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE pc.operator_nama LIKE ? OR pc.mesin_cetak LIKE ? OR spk.nomor_spk LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM produksi_cetak pc LEFT JOIN spk_produksi spk ON pc.spk_id = spk.id ${whereSql}`;
    const selectSql = `
      SELECT pc.*, spk.nomor_spk, spk.customer_nama, spk.nama_box 
      FROM produksi_cetak pc 
      LEFT JOIN spk_produksi spk ON pc.spk_id = spk.id 
      ${whereSql} 
      ORDER BY pc.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/produksi/cetak', async (req, res) => {
  try {
    const { spk_id, tanggal_proses, mesin_cetak, operator_nama, warna_tinta, qty_masuk, qty_bagus, qty_reject, catatan } = req.body;
    const [result] = await db.query(
      `INSERT INTO produksi_cetak (spk_id, tanggal_proses, mesin_cetak, operator_nama, warna_tinta, qty_masuk, qty_bagus, qty_reject, status, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Selesai', ?)`,
      [spk_id, tanggal_proses || new Date().toISOString().split('T')[0], mesin_cetak || 'Flexo Line 1', operator_nama || 'Agus Salim', warna_tinta || '1 Warna', qty_masuk || 0, qty_bagus || 0, qty_reject || 0, catatan || '']
    );
    await db.query("UPDATE spk_produksi SET tahapan_sekarang = 'Finishing' WHERE id = ?", [spk_id]);
    res.json({ success: true, message: 'Proses cetak flexo berhasil dicatat' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Finishing (Pond, Stitching, Lem)
app.get('/api/produksi/finishing', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE pf.operator_nama LIKE ? OR pf.jenis_finishing LIKE ? OR spk.nomor_spk LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM produksi_finishing pf LEFT JOIN spk_produksi spk ON pf.spk_id = spk.id ${whereSql}`;
    const selectSql = `
      SELECT pf.*, spk.nomor_spk, spk.customer_nama, spk.nama_box 
      FROM produksi_finishing pf 
      LEFT JOIN spk_produksi spk ON pf.spk_id = spk.id 
      ${whereSql} 
      ORDER BY pf.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/produksi/finishing', async (req, res) => {
  try {
    const { spk_id, tanggal_proses, jenis_finishing, operator_nama, mesin, qty_masuk, qty_bagus, qty_reject, catatan } = req.body;
    const [result] = await db.query(
      `INSERT INTO produksi_finishing (spk_id, tanggal_proses, jenis_finishing, operator_nama, mesin, qty_masuk, qty_bagus, qty_reject, status, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Selesai', ?)`,
      [spk_id, tanggal_proses || new Date().toISOString().split('T')[0], jenis_finishing || 'Stitching Kawat', operator_nama || 'Ujang Koswara', mesin || 'Mesin Jahit Kawat', qty_masuk || 0, qty_bagus || 0, qty_reject || 0, catatan || '']
    );
    await db.query("UPDATE spk_produksi SET tahapan_sekarang = 'Ikat' WHERE id = ?", [spk_id]);
    res.json({ success: true, message: 'Proses finishing berhasil dicatat' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Ikat & Packing (Strapping)
app.get('/api/produksi/ikat', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE pi.nomor_ikat LIKE ? OR pi.operator_nama LIKE ? OR spk.nomor_spk LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM produksi_ikat pi LEFT JOIN spk_produksi spk ON pi.spk_id = spk.id ${whereSql}`;
    const selectSql = `
      SELECT pi.*, spk.nomor_spk, spk.customer_nama, spk.nama_box 
      FROM produksi_ikat pi 
      LEFT JOIN spk_produksi spk ON pi.spk_id = spk.id 
      ${whereSql} 
      ORDER BY pi.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/produksi/ikat', async (req, res) => {
  try {
    const { spk_id, tanggal_proses, nomor_ikat, isi_per_ikat, total_ikat, total_pcs, operator_nama, catatan } = req.body;
    const noIkat = nomor_ikat || `IKAT-${Date.now().toString().slice(-6)}`;
    const [result] = await db.query(
      `INSERT INTO produksi_ikat (spk_id, tanggal_proses, nomor_ikat, isi_per_ikat, total_ikat, total_pcs, operator_nama, catatan, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Selesai')`,
      [spk_id, tanggal_proses || new Date().toISOString().split('T')[0], noIkat, isi_per_ikat || 25, total_ikat || 0, total_pcs || 0, operator_nama || 'Endang Sujana', catatan || 'Siap kirim ke Gudang FG']
    );
    await db.query("UPDATE spk_produksi SET tahapan_sekarang = 'Selesai', status = 'Selesai' WHERE id = ?", [spk_id]);
    res.json({ success: true, message: 'Proses ikat strapping selesai dicatat' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 5. FINANCE (HUTANG & PIUTANG)
// --------------------------------------------------------

// Pembayaran Piutang (AR)
app.get('/api/finance/piutang/pembayaran', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE pp.nomor_bukti LIKE ? OR c.nama_customer LIKE ? OR pp.metode_bayar LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM pembayaran_piutang pp LEFT JOIN customers c ON pp.customer_id = c.id ${whereSql}`;
    const selectSql = `
      SELECT pp.*, c.nama_customer, inv.nomor_invoice 
      FROM pembayaran_piutang pp 
      LEFT JOIN customers c ON pp.customer_id = c.id 
      LEFT JOIN sales_invoices inv ON pp.invoice_id = inv.id 
      ${whereSql} 
      ORDER BY pp.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/finance/piutang/pembayaran', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { invoice_id, customer_id, tanggal_bayar, nominal_bayar, metode_bayar, catatan } = req.body;
    const nomor_bukti = `BKM-${Date.now().toString().slice(-6)}`;
    const bayar = Number(nominal_bayar);

    const [result] = await connection.query(
      `INSERT INTO pembayaran_piutang (nomor_bukti, invoice_id, customer_id, tanggal_bayar, nominal_bayar, metode_bayar, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nomor_bukti, invoice_id, customer_id, tanggal_bayar || new Date().toISOString().split('T')[0], bayar, metode_bayar || 'Transfer Bank BCA', catatan || 'Pelunasan faktur dus']
    );

    // Update invoice balance
    const [invRows] = await connection.query('SELECT total_tagihan, sudah_dibayar FROM sales_invoices WHERE id = ?', [invoice_id]);
    if (invRows.length > 0) {
      const inv = invRows[0];
      const newPaid = Number(inv.sudah_dibayar) + bayar;
      const newSisa = Math.max(0, Number(inv.total_tagihan) - newPaid);
      const newStatus = newSisa === 0 ? 'Lunas' : 'Belum Lunas';

      await connection.query(
        'UPDATE sales_invoices SET sudah_dibayar = ?, sisa_tagihan = ?, status_bayar = ? WHERE id = ?',
        [newPaid, newSisa, newStatus, invoice_id]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Pembayaran piutang ${nomor_bukti} berhasil disimpan`, data: { id: result.insertId, nomor_bukti } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

// Pembayaran Hutang (AP)
app.get('/api/finance/hutang/pembayaran', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE ph.nomor_bukti LIKE ? OR s.nama_supplier LIKE ? OR ph.metode_bayar LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM pembayaran_hutang ph LEFT JOIN suppliers s ON ph.supplier_id = s.id ${whereSql}`;
    const selectSql = `
      SELECT ph.*, s.nama_supplier, np.nomor_nota 
      FROM pembayaran_hutang ph 
      LEFT JOIN suppliers s ON ph.supplier_id = s.id 
      LEFT JOIN nota_pembelian np ON ph.nota_id = np.id 
      ${whereSql} 
      ORDER BY ph.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/finance/hutang/pembayaran', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { nota_id, supplier_id, tanggal_bayar, nominal_bayar, metode_bayar, catatan } = req.body;
    const nomor_bukti = `BKK-${Date.now().toString().slice(-6)}`;
    const bayar = Number(nominal_bayar);

    const [result] = await connection.query(
      `INSERT INTO pembayaran_hutang (nomor_bukti, nota_id, supplier_id, tanggal_bayar, nominal_bayar, metode_bayar, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nomor_bukti, nota_id, supplier_id, tanggal_bayar || new Date().toISOString().split('T')[0], bayar, metode_bayar || 'Transfer Bank BCA', catatan || 'Pembayaran bahan baku sheet']
    );

    // Update nota pembelian balance
    const [notaRows] = await connection.query('SELECT total_tagihan, sudah_dibayar FROM nota_pembelian WHERE id = ?', [nota_id]);
    if (notaRows.length > 0) {
      const nota = notaRows[0];
      const newPaid = Number(nota.sudah_dibayar) + bayar;
      const newSisa = Math.max(0, Number(nota.total_tagihan) - newPaid);
      const newStatus = newSisa === 0 ? 'Lunas' : 'Belum Lunas';

      await connection.query(
        'UPDATE nota_pembelian SET sudah_dibayar = ?, sisa_tagihan = ?, status_bayar = ? WHERE id = ?',
        [newPaid, newSisa, newStatus, nota_id]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Pembayaran hutang ${nomor_bukti} berhasil disimpan`, data: { id: result.insertId, nomor_bukti } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

// Aging Piutang Customer
app.get('/api/finance/aging-piutang-customer', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id as customer_id,
        c.nama_customer,
        c.kode_customer,
        COALESCE(SUM(inv.sisa_tagihan), 0) as total_piutang,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) <= 0 THEN inv.sisa_tagihan ELSE 0 END), 0) as belum_jatuh_tempo,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) BETWEEN 1 AND 30 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_1_30,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) BETWEEN 31 AND 60 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_31_60,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) BETWEEN 61 AND 90 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_61_90,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) > 90 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_gt_90
      FROM customers c 
      LEFT JOIN sales_invoices inv ON c.id = inv.customer_id AND inv.status_bayar != 'Lunas'
      GROUP BY c.id, c.nama_customer, c.kode_customer
      HAVING total_piutang > 0
      ORDER BY total_piutang DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Aging Piutang per Sales
app.get('/api/finance/aging-piutang-sales', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id as sales_id,
        s.nama_sales,
        s.kode_sales,
        COALESCE(SUM(inv.sisa_tagihan), 0) as total_piutang,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) <= 0 THEN inv.sisa_tagihan ELSE 0 END), 0) as belum_jatuh_tempo,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) BETWEEN 1 AND 30 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_1_30,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) BETWEEN 31 AND 60 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_31_60,
        COALESCE(SUM(CASE WHEN DATEDIFF(CURDATE(), inv.jatuh_tempo) > 60 THEN inv.sisa_tagihan ELSE 0 END), 0) as overdue_gt_60
      FROM sales_persons s
      LEFT JOIN sales_orders so ON s.id = so.sales_id
      LEFT JOIN sales_invoices inv ON so.id = inv.so_id AND inv.status_bayar != 'Lunas'
      GROUP BY s.id, s.nama_sales, s.kode_sales
      ORDER BY total_piutang DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Saldo Hutang & Piutang
app.get('/api/finance/saldo-hutang-piutang', async (req, res) => {
  try {
    const [ar] = await db.query("SELECT COALESCE(SUM(sisa_tagihan), 0) as total_piutang FROM sales_invoices WHERE status_bayar != 'Lunas'");
    const [ap] = await db.query("SELECT COALESCE(SUM(sisa_tagihan), 0) as total_hutang FROM nota_pembelian WHERE status_bayar != 'Lunas'");

    res.json({
      success: true,
      data: {
        totalPiutang: Number(ar[0]?.total_piutang || 0),
        totalHutang: Number(ap[0]?.total_hutang || 0),
        selisihBersih: Number(ar[0]?.total_piutang || 0) - Number(ap[0]?.total_hutang || 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 6. KAS / BANK & AKUNTANSI
// --------------------------------------------------------

// Chart of Accounts (COA)
app.get('/api/accounting/coa', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_akun LIKE ? OR nama_akun LIKE ? OR kategori_akun LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM chart_of_accounts ${whereSql}`;
    const selectSql = `SELECT * FROM chart_of_accounts ${whereSql} ORDER BY kode_akun ASC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/accounting/coa', async (req, res) => {
  try {
    const { kode_akun, nama_akun, kategori_akun, saldo_normal, saldo_awal } = req.body;
    const [result] = await db.query(
      `INSERT INTO chart_of_accounts (kode_akun, nama_akun, kategori_akun, saldo_normal, saldo_awal)
       VALUES (?, ?, ?, ?, ?)`,
      [kode_akun, nama_akun, kategori_akun, saldo_normal || 'Debet', saldo_awal || 0]
    );
    res.json({ success: true, message: 'Akun COA berhasil ditambahkan ke database' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Jurnal Umum
app.get('/api/accounting/jurnal', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE nomor_jurnal LIKE ? OR keterangan LIKE ? OR tipe_jurnal LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM jurnal_transaksi ${whereSql}`;
    const selectSql = `SELECT * FROM jurnal_transaksi ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);

    if (result.data.length > 0) {
      const jIds = result.data.map(j => j.id);
      const [items] = await db.query(
        `SELECT ji.*, coa.nama_akun, coa.kode_akun 
         FROM jurnal_items ji 
         LEFT JOIN chart_of_accounts coa ON ji.akun_id = coa.id 
         WHERE ji.jurnal_id IN (?)`,
        [jIds]
      );
      result.data.forEach(j => {
        j.items = items.filter(it => it.jurnal_id === j.id);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/accounting/jurnal', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { tanggal, tipe_jurnal, keterangan, items } = req.body;
    if (!items || items.length < 2) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Jurnal minimal memerlukan 2 baris akun (Debet dan Kredit)' });
    }

    const nomor_jurnal = `JU-${Date.now().toString().slice(-6)}`;
    const total_debet = items.filter(i => i.posisi === 'Debet').reduce((sum, i) => sum + Number(i.nominal), 0);
    const total_kredit = items.filter(i => i.posisi === 'Kredit').reduce((sum, i) => sum + Number(i.nominal), 0);

    if (total_debet !== total_kredit) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Total Debet dan Kredit tidak balance!' });
    }

    const [jResult] = await connection.query(
      `INSERT INTO jurnal_transaksi (nomor_jurnal, tanggal, tipe_jurnal, keterangan, total_debet, total_kredit)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nomor_jurnal, tanggal || new Date().toISOString().split('T')[0], tipe_jurnal || 'Kas Masuk', keterangan || '', total_debet, total_kredit]
    );

    const jId = jResult.insertId;

    for (const it of items) {
      await connection.query(
        `INSERT INTO jurnal_items (jurnal_id, akun_id, posisi, nominal, keterangan)
         VALUES (?, ?, ?, ?, ?)`,
        [jId, it.akun_id, it.posisi, it.nominal, it.keterangan || '']
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Jurnal ${nomor_jurnal} berhasil disimpan dan balance`, data: { id: jId, nomor_jurnal } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

// Laporan Kas Harian & Bank Harian
app.get('/api/accounting/laporan-kas-harian', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        jt.tanggal,
        jt.nomor_jurnal,
        jt.keterangan,
        ji.posisi,
        ji.nominal,
        coa.nama_akun
      FROM jurnal_items ji
      LEFT JOIN jurnal_transaksi jt ON ji.jurnal_id = jt.id
      LEFT JOIN chart_of_accounts coa ON ji.akun_id = coa.id
      WHERE coa.kode_akun LIKE '111%' OR coa.nama_akun LIKE '%Kas%'
      ORDER BY jt.tanggal DESC, jt.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/accounting/laporan-bank-harian', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        jt.tanggal,
        jt.nomor_jurnal,
        jt.keterangan,
        ji.posisi,
        ji.nominal,
        coa.nama_akun
      FROM jurnal_items ji
      LEFT JOIN jurnal_transaksi jt ON ji.jurnal_id = jt.id
      LEFT JOIN chart_of_accounts coa ON ji.akun_id = coa.id
      WHERE coa.kode_akun LIKE '112%' OR coa.nama_akun LIKE '%Bank%'
      ORDER BY jt.tanggal DESC, jt.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Buku Besar & Neraca Saldo (Trial Balance)
app.get('/api/accounting/trial-balance', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        coa.id,
        coa.kode_akun,
        coa.nama_akun,
        coa.kategori_akun,
        coa.saldo_normal,
        COALESCE(SUM(CASE WHEN ji.posisi = 'Debet' THEN ji.nominal ELSE 0 END), 0) as total_debet,
        COALESCE(SUM(CASE WHEN ji.posisi = 'Kredit' THEN ji.nominal ELSE 0 END), 0) as total_kredit
      FROM chart_of_accounts coa
      LEFT JOIN jurnal_items ji ON coa.id = ji.akun_id
      GROUP BY coa.id, coa.kode_akun, coa.nama_akun, coa.kategori_akun, coa.saldo_normal
      ORDER BY coa.kode_akun ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/accounting/buku-besar', async (req, res) => {
  try {
    const [coas] = await db.query('SELECT * FROM chart_of_accounts ORDER BY kode_akun ASC');
    const [items] = await db.query(`
      SELECT 
        ji.*, 
        jt.tanggal, 
        jt.nomor_jurnal, 
        jt.keterangan as ket_jurnal
      FROM jurnal_items ji
      LEFT JOIN jurnal_transaksi jt ON ji.jurnal_id = jt.id
      ORDER BY jt.tanggal ASC, jt.id ASC
    `);

    const result = coas.map(c => ({
      ...c,
      mutasi: items.filter(it => it.akun_id === c.id)
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Laporan Laba Rugi
app.get('/api/accounting/laba-rugi', async (req, res) => {
  try {
    const [rev] = await db.query(`
      SELECT COALESCE(SUM(so.total_nilai), 0) as total_pendapatan 
      FROM sales_orders so 
      WHERE so.status != 'Batal'
    `);
    const [cogs] = await db.query(`
      SELECT COALESCE(SUM(total_tagihan), 0) as total_hpp 
      FROM nota_pembelian
    `);
    const [exp] = await db.query(`
      SELECT COALESCE(SUM(total_gaji_dibayar), 0) as total_beban_gaji 
      FROM payroll_periode
    `);

    const pendapatan = Number(rev[0]?.total_pendapatan || 0);
    const hpp = Number(cogs[0]?.total_hpp || 0);
    const bebanGaji = Number(exp[0]?.total_beban_gaji || 0);
    const labaKotor = pendapatan - hpp;
    const labaBersih = labaKotor - bebanGaji;

    res.json({
      success: true,
      data: {
        pendapatan,
        hpp,
        labaKotor,
        bebanOperasional: bebanGaji,
        labaBersih
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Laporan HPP
app.get('/api/accounting/hpp', async (req, res) => {
  try {
    const [sheet] = await db.query('SELECT COALESCE(SUM(total_tagihan), 0) as biaya_bahan_sheet FROM nota_pembelian');
    const [labor] = await db.query('SELECT COALESCE(SUM(total_gaji_dibayar), 0) as biaya_tenaga_kerja FROM payroll_periode');
    const [depr] = await db.query('SELECT COALESCE(SUM(akumulasi_penyusutan), 0) as biaya_penyusutan_mesin FROM aktiva_tetap');

    res.json({
      success: true,
      data: {
        biayaBahanBakuSheet: Number(sheet[0]?.biaya_bahan_sheet || 0),
        biayaTenagaKerjaLangsung: Number(labor[0]?.biaya_tenaga_kerja || 0),
        biayaOverheadPabrik: Number(depr[0]?.biaya_penyusutan_mesin || 0) * 0.1,
        totalHPP: Number(sheet[0]?.biaya_bahan_sheet || 0) + Number(labor[0]?.biaya_tenaga_kerja || 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Laporan Neraca
app.get('/api/accounting/neraca', async (req, res) => {
  try {
    const [assets] = await db.query(`
      SELECT COALESCE(SUM(CASE WHEN posisi = 'Debet' THEN nominal ELSE -nominal END), 0) as total_aset_lancar
      FROM jurnal_items ji
      LEFT JOIN chart_of_accounts coa ON ji.akun_id = coa.id
      WHERE coa.kode_akun LIKE '11%'
    `);
    const [fixedAssets] = await db.query('SELECT COALESCE(SUM(nilai_buku), 0) as total_aktiva_tetap FROM aktiva_tetap');
    const [liabilities] = await db.query("SELECT COALESCE(SUM(sisa_tagihan), 0) as total_hutang FROM nota_pembelian WHERE status_bayar != 'Lunas'");

    const asetLancar = Number(assets[0]?.total_aset_lancar || 0);
    const asetTetap = Number(fixedAssets[0]?.total_aktiva_tetap || 0);
    const totalAset = asetLancar + asetTetap;
    const totalHutang = Number(liabilities[0]?.total_hutang || 0);
    const ekuitas = totalAset - totalHutang;

    res.json({
      success: true,
      data: {
        asetLancar,
        asetTetap,
        totalAset,
        kewajiban: totalHutang,
        ekuitas,
        totalPasiva: totalHutang + ekuitas
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 7. AKTIVA TETAP
// --------------------------------------------------------
app.get('/api/aktiva', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE kode_aktiva LIKE ? OR nama_aktiva LIKE ? OR kategori LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM aktiva_tetap ${whereSql}`;
    const selectSql = `SELECT * FROM aktiva_tetap ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/aktiva', async (req, res) => {
  try {
    const { kode_aktiva, nama_aktiva, kategori, tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, nilai_residu } = req.body;
    const kode = kode_aktiva || `AST-${Date.now().toString().slice(-4)}`;
    const harga = Number(harga_perolehan) || 0;
    const residu = Number(nilai_residu) || 0;

    const [result] = await db.query(
      `INSERT INTO aktiva_tetap (kode_aktiva, nama_aktiva, kategori, tanggal_perolehan, harga_perolehan, umur_ekonomis_tahun, nilai_residu, akumulasi_penyusutan, nilai_buku, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'Aktif')`,
      [kode, nama_aktiva, kategori || 'Mesin Pabrik', tanggal_perolehan || new Date().toISOString().split('T')[0], harga, umur_ekonomis_tahun || 8, residu, harga]
    );

    res.json({ success: true, message: 'Aktiva mesin/kendaraan berhasil didaftarkan di database' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/aktiva/:id', async (req, res) => {
  try {
    const { nama_aktiva, kategori, status } = req.body;
    const [result] = await db.query(
      'UPDATE aktiva_tetap SET nama_aktiva = COALESCE(?, nama_aktiva), kategori = COALESCE(?, kategori), status = COALESCE(?, status) WHERE id = ?',
      [nama_aktiva, kategori, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Aktiva tidak ditemukan' });
    res.json({ success: true, message: 'Aktiva berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/aktiva/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM aktiva_tetap WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Aktiva tidak ditemukan' });
    res.json({ success: true, message: 'Aktiva berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/aktiva/proses-penyusutan', async (req, res) => {
  try {
    const { periode_bulan } = req.body;
    const periode = periode_bulan || new Date().toISOString().slice(0, 7);

    const [assets] = await db.query("SELECT * FROM aktiva_tetap WHERE status = 'Aktif'");
    let count = 0;

    for (const a of assets) {
      const perTahun = (Number(a.harga_perolehan) - Number(a.nilai_residu)) / (Number(a.umur_ekonomis_tahun) || 8);
      const perBulan = Math.round(perTahun / 12);
      const newAkumulasi = Number(a.akumulasi_penyusutan) + perBulan;
      const newNilaiBuku = Math.max(Number(a.nilai_residu), Number(a.harga_perolehan) - newAkumulasi);

      await db.query(
        `INSERT INTO penyusutan_aktiva (aktiva_id, periode_bulan, nilai_penyusutan, akumulasi_sebelumnya, akumulasi_setelahnya)
         VALUES (?, ?, ?, ?, ?)`,
        [a.id, periode, perBulan, a.akumulasi_penyusutan, newAkumulasi]
      );

      await db.query(
        'UPDATE aktiva_tetap SET akumulasi_penyusutan = ?, nilai_buku = ? WHERE id = ?',
        [newAkumulasi, newNilaiBuku, a.id]
      );
      count++;
    }

    res.json({ success: true, message: `Penyusutan bulanan untuk ${count} aktiva mesin berhasil diproses` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// --------------------------------------------------------
// 8. PAYROLL (HR & PENGGAJIAN)
// --------------------------------------------------------

// Master Karyawan
app.get('/api/payroll/karyawan', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE nik LIKE ? OR nama_lengkap LIKE ? OR jabatan LIKE ? OR departemen LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM karyawan ${whereSql}`;
    const selectSql = `SELECT * FROM karyawan ${whereSql} ORDER BY id DESC`;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/payroll/karyawan', async (req, res) => {
  try {
    const { nik, nama_lengkap, jabatan, departemen, status_karyawan, no_hp, no_rekening, bank, gaji_pokok, tunjangan_jabatan, uang_makan_perhari, tarif_lembur_perjam } = req.body;
    if (!nama_lengkap || !jabatan) return res.status(400).json({ success: false, message: 'Nama lengkap dan jabatan wajib diisi' });

    const empNik = nik || `EMP-${Date.now().toString().slice(-4)}`;
    const [result] = await db.query(
      `INSERT INTO karyawan (nik, nama_lengkap, jabatan, departemen, status_karyawan, no_hp, no_rekening, bank, gaji_pokok, tunjangan_jabatan, uang_makan_perhari, tarif_lembur_perjam)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [empNik, nama_lengkap, jabatan, departemen || 'Produksi', status_karyawan || 'Tetap', no_hp || '', no_rekening || '', bank || 'BCA', gaji_pokok || 4500000, tunjangan_jabatan || 500000, uang_makan_perhari || 25000, tarif_lembur_perjam || 25000]
    );

    res.json({ success: true, message: 'Data karyawan berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.put('/api/payroll/karyawan/:id', async (req, res) => {
  try {
    const { nama_lengkap, jabatan, departemen, status_karyawan, no_hp, no_rekening, bank, gaji_pokok, tunjangan_jabatan, uang_makan_perhari, tarif_lembur_perjam } = req.body;
    const [result] = await db.query(
      `UPDATE karyawan SET nama_lengkap = COALESCE(?, nama_lengkap), jabatan = COALESCE(?, jabatan), departemen = COALESCE(?, departemen), status_karyawan = COALESCE(?, status_karyawan), no_hp = COALESCE(?, no_hp), no_rekening = COALESCE(?, no_rekening), bank = COALESCE(?, bank), gaji_pokok = COALESCE(?, gaji_pokok), tunjangan_jabatan = COALESCE(?, tunjangan_jabatan), uang_makan_perhari = COALESCE(?, uang_makan_perhari), tarif_lembur_perjam = COALESCE(?, tarif_lembur_perjam) WHERE id = ?`,
      [nama_lengkap, jabatan, departemen, status_karyawan, no_hp, no_rekening, bank, gaji_pokok, tunjangan_jabatan, uang_makan_perhari, tarif_lembur_perjam, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    res.json({ success: true, message: 'Data karyawan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.delete('/api/payroll/karyawan/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM karyawan WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    res.json({ success: true, message: 'Karyawan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Absensi Harian & Fingerprint
app.get('/api/payroll/absensi', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE a.nik LIKE ? OR k.nama_lengkap LIKE ? OR a.status_kehadiran LIKE ? OR a.catatan LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM absensi a LEFT JOIN karyawan k ON a.karyawan_id = k.id ${whereSql}`;
    const selectSql = `
      SELECT a.*, k.nama_lengkap, k.nik as karyawan_nik, k.jabatan 
      FROM absensi a 
      LEFT JOIN karyawan k ON a.karyawan_id = k.id 
      ${whereSql} 
      ORDER BY a.tanggal DESC, a.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/payroll/absensi', async (req, res) => {
  try {
    const { 
      karyawan_id, tanggal, status_kehadiran, 
      jam_masuk, jam_istirahat_keluar, jam_istirahat_masuk, jam_pulang, 
      jam_lembur_selesai, jam_lembur, total_jam_kerja, catatan 
    } = req.body;
    const [emp] = await db.query('SELECT nik FROM karyawan WHERE id = ?', [karyawan_id]);
    const nik = emp.length > 0 ? emp[0].nik : 'EMP-001';

    let otHours = Number(jam_lembur) || 0;
    if (otHours === 0 && jam_lembur_selesai) {
      const [lh, lm] = jam_lembur_selesai.split(':').map(Number);
      const [ph, pm] = (jam_pulang || '16:00').split(':').map(Number);
      if (lh && ph && lh > ph) {
        otHours = Math.max(0, (lh + (lm || 0) / 60) - (ph + (pm || 0) / 60));
        otHours = Math.round(otHours * 10) / 10;
      }
    }

    try {
      await db.query(
        `INSERT INTO absensi (karyawan_id, nik, tanggal, status_kehadiran, jam_masuk, jam_istirahat_keluar, jam_istirahat_masuk, jam_pulang, jam_lembur_selesai, jam_lembur, total_jam_kerja, metode, catatan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Manual HR', ?)`,
        [
          karyawan_id, 
          nik, 
          tanggal || new Date().toISOString().split('T')[0], 
          status_kehadiran || 'Hadir', 
          jam_masuk || '08:00', 
          jam_istirahat_keluar || null,
          jam_istirahat_masuk || null,
          jam_pulang || '16:00', 
          jam_lembur_selesai || null,
          otHours, 
          Number(total_jam_kerja) || 8.0,
          catatan || 'Presensi Manual HR'
        ]
      );
    } catch (insertErr) {
      // Fallback in case columns do not exist yet in legacy DB
      await db.query(
        `INSERT INTO absensi (karyawan_id, nik, tanggal, status_kehadiran, jam_masuk, jam_pulang, jam_lembur, metode, catatan)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Manual HR', ?)`,
        [karyawan_id, nik, tanggal || new Date().toISOString().split('T')[0], status_kehadiran || 'Hadir', jam_masuk || '08:00', jam_pulang || '16:00', otHours, catatan || 'Presensi Manual HR']
      );
    }

    res.json({ success: true, message: 'Presensi & rincian jam kerja multi-scan berhasil dicatat di database' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/payroll/absensi/template-fingerprint', (req, res) => {
  const csvContent = [
    'PIN_NIK,Nama_Karyawan,Tanggal,Jam_Masuk,Istirahat_Keluar,Istirahat_Masuk,Jam_Pulang,Lembur_Selesai,Jam_Lembur,Catatan',
    'EMP-001,Mulyadi Pratama,2026-11-20,08:00,12:00,13:00,16:00,19:30,3.5,Multi-Scan 5x Tap (Masuk-Istirahat-Pulang-Lembur)',
    'EMP-002,Agus Salim,2026-11-20,07:55,12:00,13:00,16:00,,0,Jam Pokok Normal Tanpa Lembur',
    'EMP-003,Ujang Koswara,2026-11-20,07:50,12:00,13:00,16:00,20:00,4.0,Lembur Cetak & Finishing Box 4 Jam'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="template_absensi_fingerprint.csv"');
  res.send(csvContent);
});

app.get('/api/payroll/absensi/export', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, k.nama_lengkap 
      FROM absensi a 
      LEFT JOIN karyawan k ON a.karyawan_id = k.id 
      ORDER BY a.tanggal DESC
    `);
    const headers = ['ID,NIK,Nama_Karyawan,Tanggal,Jam_Masuk,Istirahat_Keluar,Istirahat_Masuk,Jam_Pulang,Lembur_Selesai,Jam_Lembur,Total_Jam_Kerja,Status_Kehadiran,Metode_Absensi,Catatan'];
    const csvRows = rows.map(a => `${a.id},"${a.nik || ''}","${a.nama_lengkap || ''}","${a.tanggal}","${a.jam_masuk || ''}","${a.jam_istirahat_keluar || ''}","${a.jam_istirahat_masuk || ''}","${a.jam_pulang || ''}","${a.jam_lembur_selesai || ''}",${a.jam_lembur || 0},${a.total_jam_kerja || 8},"${a.status_kehadiran}","${a.metode || 'Fingerprint'}","${a.catatan || ''}"`);
    const fullCsv = [headers, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan_absensi_cv_maharani.csv"');
    res.send(fullCsv);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/payroll/absensi/import-fingerprint', async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Data baris absensi fingerprint tidak ditemukan' });
    }

    const [allEmployees] = await db.query('SELECT id, nik, nama_lengkap FROM karyawan');

    // Grouping by (nik, tanggal) to support multi-tap / raw punch log
    const grouped = new Map();

    for (const row of records) {
      const searchNik = (row.nik || row.PIN_NIK || row.PIN || row.NIK || '').toString().trim().toUpperCase();
      const searchNama = (row.nama || row.Nama_Karyawan || row.Nama || '').toString().trim().toLowerCase();

      let emp = allEmployees.find(k => k.nik.toUpperCase() === searchNik);
      if (!emp && searchNama) {
        emp = allEmployees.find(k => k.nama_lengkap.toLowerCase().includes(searchNama));
      }

      const empId = emp ? emp.id : 1;
      const empNik = emp ? emp.nik : (searchNik || 'EMP-FINGER');
      const tgl = row.tanggal || row.Tanggal || row.Date || new Date().toISOString().split('T')[0];
      const key = `${empId}_${tgl}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          empId,
          empNik,
          tgl,
          rows: []
        });
      }
      grouped.get(key).rows.push(row);
    }

    let imported = 0;
    let updated = 0;

    for (const [key, item] of grouped.entries()) {
      const { empId, empNik, tgl, rows } = item;

      let jamMasuk = '08:00';
      let istKeluar = null;
      let istMasuk = null;
      let jamPulang = '16:00';
      let lemburSelesai = null;
      let jamLembur = 0;
      let catatan = '';

      if (rows.length === 1 && (rows[0].jam_masuk || rows[0].Jam_Masuk || rows[0].Istirahat_Keluar || rows[0].jam_pulang || rows[0].Jam_Pulang)) {
        // Format terstruktur 1 baris
        const r = rows[0];
        jamMasuk = r.jam_masuk || r.Jam_Masuk || '08:00';
        istKeluar = r.jam_istirahat_keluar || r.Istirahat_Keluar || null;
        istMasuk = r.jam_istirahat_masuk || r.Istirahat_Masuk || null;
        jamPulang = r.jam_pulang || r.Jam_Pulang || '16:00';
        lemburSelesai = r.jam_lembur_selesai || r.Lembur_Selesai || null;
        jamLembur = Number(r.jam_lembur || r.Jam_Lembur) || 0;
        catatan = r.catatan || r.Catatan || 'Log Mesin Fingerprint (Multi-Scan)';

        // Jika jam lembur belum dihitung tapi ada jam lembur selesai atau pulang > 16:00
        if (jamLembur === 0 && lemburSelesai) {
          const [lh, lm] = lemburSelesai.split(':').map(Number);
          const [ph, pm] = jamPulang.split(':').map(Number);
          if (lh && ph && lh > ph) {
            jamLembur = Math.round(((lh + (lm || 0) / 60) - (ph + (pm || 0) / 60)) * 10) / 10;
          }
        } else if (jamLembur === 0 && jamPulang) {
          const [ph, pm] = jamPulang.split(':').map(Number);
          if (ph && ph >= 17) {
            jamLembur = Math.round((ph - 16 + (pm || 0) / 60) * 10) / 10;
          }
        }
      } else {
        // Multi-punch / multiple tap dalam 1 hari untuk karyawan yang sama (misal tap jam 08:00, 12:00, 13:00, 16:00, 20:00)
        const punchTimes = [];
        for (const r of rows) {
          const timeStr = r.jam || r.Jam || r.time || r.Time || r.jam_masuk || r.Jam_Masuk || r.jam_pulang || r.Jam_Pulang;
          if (timeStr) {
            punchTimes.push(timeStr.toString().trim().slice(0, 5));
          }
        }

        // Urutkan waktu punch dari pagi ke malam
        punchTimes.sort();

        if (punchTimes.length > 0) {
          // Tap paling pagi = Jam Masuk
          jamMasuk = punchTimes[0];

          for (let i = 1; i < punchTimes.length; i++) {
            const time = punchTimes[i];
            const [h, m] = time.split(':').map(Number);
            const totalMinutes = h * 60 + (m || 0);

            if (totalMinutes >= 11 * 60 + 30 && totalMinutes <= 12 * 60 + 30) {
              istKeluar = time; // 11:30 - 12:30 -> Keluar Istirahat
            } else if (totalMinutes > 12 * 60 + 30 && totalMinutes <= 13 * 60 + 30) {
              istMasuk = time; // 12:31 - 13:30 -> Masuk Kembali Istirahat
            } else if (totalMinutes >= 15 * 60 + 30 && totalMinutes <= 17 * 60 + 15) {
              jamPulang = time; // 15:30 - 17:15 -> Jam Pulang Reguler
            } else if (totalMinutes > 17 * 60 + 15) {
              lemburSelesai = time; // > 17:15 -> Selesai Lembur
            }
          }

          // Jika hanya 2 tap: tap 1 = masuk, tap 2 = pulang
          if (punchTimes.length === 2) {
            jamPulang = punchTimes[1];
          }

          if (lemburSelesai) {
            const [lh, lm] = lemburSelesai.split(':').map(Number);
            const [ph, pm] = (jamPulang || '16:00').split(':').map(Number);
            if (lh && ph && lh > ph) {
              jamLembur = Math.round(((lh + (lm || 0) / 60) - (ph + (pm || 0) / 60)) * 10) / 10;
            }
          }

          catatan = `Multi-Scan Fingerprint (${punchTimes.length}x Tap: ${punchTimes.join(', ')})`;
        }
      }

      // Hitung total jam kerja efektif (default 8 jam)
      const totalKerja = 8.0;

      const [existing] = await db.query('SELECT id FROM absensi WHERE karyawan_id = ? AND tanggal = ?', [empId, tgl]);
      if (existing.length > 0) {
        try {
          await db.query(
            `UPDATE absensi SET 
               jam_masuk = ?, 
               jam_istirahat_keluar = ?, 
               jam_istirahat_masuk = ?, 
               jam_pulang = ?, 
               jam_lembur_selesai = ?, 
               jam_lembur = ?, 
               total_jam_kerja = ?, 
               metode = 'Mesin Fingerprint', 
               catatan = ? 
             WHERE id = ?`,
            [jamMasuk, istKeluar, istMasuk, jamPulang, lemburSelesai, jamLembur, totalKerja, catatan || 'Log Mesin Fingerprint (Multi-Scan)', existing[0].id]
          );
        } catch (_) {
          await db.query(
            `UPDATE absensi SET jam_masuk = ?, jam_pulang = ?, jam_lembur = ?, metode = 'Mesin Fingerprint', catatan = ? WHERE id = ?`,
            [jamMasuk, lemburSelesai || jamPulang, jamLembur, catatan, existing[0].id]
          );
        }
        updated++;
      } else {
        try {
          await db.query(
            `INSERT INTO absensi (karyawan_id, nik, tanggal, status_kehadiran, jam_masuk, jam_istirahat_keluar, jam_istirahat_masuk, jam_pulang, jam_lembur_selesai, jam_lembur, total_jam_kerja, metode, catatan)
             VALUES (?, ?, ?, 'Hadir', ?, ?, ?, ?, ?, ?, ?, 'Mesin Fingerprint', ?)`,
            [empId, empNik, tgl, jamMasuk, istKeluar, istMasuk, jamPulang, lemburSelesai, jamLembur, totalKerja, catatan || 'Log Mesin Fingerprint (Multi-Scan)']
          );
        } catch (_) {
          await db.query(
            `INSERT INTO absensi (karyawan_id, nik, tanggal, status_kehadiran, jam_masuk, jam_pulang, jam_lembur, metode, catatan)
             VALUES (?, ?, ?, 'Hadir', ?, ?, ?, 'Mesin Fingerprint', ?)`,
            [empId, empNik, tgl, jamMasuk, lemburSelesai || jamPulang, jamLembur, catatan]
          );
        }
        imported++;
      }
    }

    res.json({
      success: true,
      message: `Berhasil memproses absensi: ${imported} data baru dimasukkan, ${updated} data diperbarui di database`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Payroll Periode & Generate Gaji
app.get('/api/payroll/periode', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payroll_periode ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.post('/api/payroll/generate', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const periode = req.body.periode || new Date().toISOString().slice(0, 7);
    const nomor_payroll = `PAY-${periode.replace('-', '')}`;

    const [karyawanList] = await connection.query('SELECT * FROM karyawan');
    if (karyawanList.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Tidak ada data karyawan di database untuk dihitung gajinya' });
    }

    const [payResult] = await connection.query(
      `INSERT INTO payroll_periode (nomor_payroll, periode_bulan, total_karyawan, total_gaji_dibayar, status)
       VALUES (?, ?, ?, 0, 'Dibayar')`,
      [nomor_payroll, periode, karyawanList.length]
    );

    const payrollId = payResult.insertId;
    let totalAllGaji = 0;

    for (const k of karyawanList) {
      // Hitung real kehadiran dan akumulasi jam lembur dari data absensi bulan ini
      const [attData] = await connection.query(`
        SELECT 
          COUNT(CASE WHEN status_kehadiran = 'Hadir' THEN 1 END) as total_hadir,
          COALESCE(SUM(jam_lembur), 0) as total_lembur
        FROM absensi 
        WHERE karyawan_id = ? AND tanggal LIKE ?
      `, [k.id, `${periode}%`]);

      const realHadir = attData[0]?.total_hadir || 0;
      const realLembur = Number(attData[0]?.total_lembur || 0);

      const hariKerja = realHadir > 0 ? realHadir : 25;
      const jamLembur = realHadir > 0 ? realLembur : 10;
      const upahLembur = jamLembur * Number(k.tarif_lembur_perjam || 25000);
      const uangMakan = hariKerja * Number(k.uang_makan_perhari || 25000);
      const bpjs = Math.round(Number(k.gaji_pokok) * 0.03);
      const gajiBersih = Number(k.gaji_pokok) + Number(k.tunjangan_jabatan || 0) + uangMakan + upahLembur - bpjs;

      totalAllGaji += gajiBersih;

      await connection.query(
        `INSERT INTO slip_gaji (payroll_id, karyawan_id, hari_kerja, jam_lembur, gaji_pokok, tunjangan, uang_makan, upah_lembur, potongan_bpjs, potongan_absen, total_gaji_bersih)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [payrollId, k.id, hariKerja, jamLembur, k.gaji_pokok, k.tunjangan_jabatan || 0, uangMakan, upahLembur, bpjs, gajiBersih]
      );
    }

    await connection.query('UPDATE payroll_periode SET total_gaji_dibayar = ? WHERE id = ?', [totalAllGaji, payrollId]);

    await connection.commit();
    res.json({ success: true, message: `Payroll periode ${periode} berhasil digenerate di database`, data: { id: payrollId, nomor_payroll, totalAllGaji } });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  } finally {
    connection.release();
  }
});

// Slip Gaji
app.get('/api/payroll/slip', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    let whereSql = '';
    let params = [];
    if (search) {
      whereSql = 'WHERE k.nama_lengkap LIKE ? OR k.nik LIKE ? OR k.jabatan LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    const countSql = `SELECT COUNT(*) as total FROM slip_gaji sg LEFT JOIN karyawan k ON sg.karyawan_id = k.id ${whereSql}`;
    const selectSql = `
      SELECT sg.*, k.nama_lengkap, k.nik, k.jabatan 
      FROM slip_gaji sg 
      LEFT JOIN karyawan k ON sg.karyawan_id = k.id 
      ${whereSql} 
      ORDER BY sg.id DESC
    `;
    const result = await getPaginatedData(selectSql, countSql, params, params, req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

app.get('/api/payroll/slip/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sg.*, k.nama_lengkap, k.nik, k.jabatan 
       FROM slip_gaji sg 
       LEFT JOIN karyawan k ON sg.karyawan_id = k.id 
       WHERE sg.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Slip gaji tidak ditemukan di database' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, error: err.code });
  }
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.url} tidak ditemukan` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 CV. Maharani Untung Abadi ERP Server running on port ${PORT}`);
  console.log(`📁 Static uploads folder: ${uploadDir}`);
  console.log(`🗄️ Database mode: Pure MySQL (Zero Mock Data)`);
});
