/**
 * Automated Migration Runner for CV. Maharani Untung Abadi
 * Reads and executes all .sql migration files in order
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
  console.log('🚀 [Migration] Memulai eksekusi database migration...');
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'kinq6231_cv-maharani',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'kinq6231_cv-maharani',
    database: process.env.DB_NAME || 'kinq6231_cv-maharani',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  try {
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL Connected] Target database: ${process.env.DB_NAME || 'kinq6231_cv-maharani'}`);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('Tidak ada folder migrations.');
      connection.release();
      await pool.end();
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Ditemukan ${files.length} file migration:`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`▶️  Menjalankan migration: ${file}...`);
      await connection.query(sql);
      console.log(`✔️  Berhasil: ${file}`);
    }

    connection.release();
    console.log('🎉 [Migration] Semua berkas migration berhasil dieksekusi dengan sukses!');
  } catch (err) {
    console.error('❌ [Migration Error]:', err.message);
  } finally {
    await pool.end();
  }
}

runMigrations();
