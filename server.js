// Server API sederhana: menjembatani device lain (HP) dengan database MySQL di laptop.
// Alur: HP (browser) --HTTP--> Laptop (server.js :3000) --> MySQL (localhost:3306)

const express = require('express');
const mysql = require('mysql2/promise');
const os = require('os');
const path = require('path');

// ===== Konfigurasi (sesuaikan kalau MySQL kamu pakai password) =====
const PORT = 3000;
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP: kosong
  port: 3306,
};
const DB_NAME = 'db_kampus';

const app = express();
// Percaya header X-Forwarded-For dari ngrok / Cloudflare Tunnel,
// supaya IP asli tiap device tetap terbaca walau lewat link publik
app.set('trust proxy', true);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let pool;

// Membuat database + tabel otomatis kalau belum ada
async function initDatabase() {
  const conn = await mysql.createConnection(DB_CONFIG);
  await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
  await conn.end();

  pool = mysql.createPool({ ...DB_CONFIG, database: DB_NAME });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mahasiswa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nim VARCHAR(20) NOT NULL,
      nama VARCHAR(100) NOT NULL,
      jurusan VARCHAR(100) NOT NULL,
      dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Catat setiap request supaya kelihatan device mana yang mengakses
app.use((req, res, next) => {
  const ip = (req.ip || '').replace('::ffff:', '');
  console.log(`[${new Date().toLocaleTimeString()}] ${ip} -> ${req.method} ${req.url}`);
  next();
});

// ===== API CRUD =====

// Info IP klien (ditampilkan di halaman web)
app.get('/api/info', (req, res) => {
  res.json({ ipKamu: (req.ip || '').replace('::ffff:', ''), ipServer: getLocalIPs() });
});

// READ semua data
app.get('/api/mahasiswa', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mahasiswa ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE data baru
app.post('/api/mahasiswa', async (req, res) => {
  const { nim, nama, jurusan } = req.body;
  if (!nim || !nama || !jurusan) {
    return res.status(400).json({ error: 'nim, nama, dan jurusan wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO mahasiswa (nim, nama, jurusan) VALUES (?, ?, ?)',
      [nim, nama, jurusan]
    );
    res.status(201).json({ id: result.insertId, nim, nama, jurusan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE data
app.put('/api/mahasiswa/:id', async (req, res) => {
  const { nim, nama, jurusan } = req.body;
  if (!nim || !nama || !jurusan) {
    return res.status(400).json({ error: 'nim, nama, dan jurusan wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ? WHERE id = ?',
      [nim, nama, jurusan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ id: Number(req.params.id), nim, nama, jurusan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE data
app.delete('/api/mahasiswa/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM mahasiswa WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ pesan: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ambil semua IPv4 lokal laptop (Wi-Fi / LAN)
function getLocalIPs() {
  const ips = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs || []) {
      if (addr.family === 'IPv4' && !addr.internal) ips.push(addr.address);
    }
  }
  return ips;
}

initDatabase()
  .then(() => {
    // '0.0.0.0' = terima koneksi dari device lain, bukan hanya dari laptop sendiri
    app.listen(PORT, '0.0.0.0', () => {
      console.log('========================================');
      console.log(' Server berjalan! Buka alamat berikut:');
      console.log(`  - Di laptop : http://localhost:${PORT}`);
      for (const ip of getLocalIPs()) {
        console.log(`  - Di HP     : http://${ip}:${PORT}`);
      }
      console.log('  - Link publik (satu link untuk semua jaringan):');
      console.log('    jalankan ngrok / cloudflared, lihat README bagian "Satu Link"');
      console.log('========================================');
    });
  })
  .catch((err) => {
    console.error('Gagal konek ke MySQL:', err.message);
    console.error('Pastikan MySQL di XAMPP sudah di-Start dan user/password di server.js benar.');
    process.exit(1);
  });
