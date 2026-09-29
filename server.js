// ===================== DEVICE A: SERVER =====================
// REST API + database MySQL. Semua operasi database (GET, POST, PUT, DELETE)
// dilakukan lewat request HTTP dari Device B (client) yang IP-nya berbeda.
//
// Alur: Device B (client) --HTTP request--> Device A (server.js :3000) --> MySQL (localhost:3306)

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
// Percaya header X-Forwarded-For (kalau lewat ngrok / Cloudflare Tunnel),
// supaya IP asli tiap device tetap terbaca
app.set('trust proxy', true);
app.use(express.json());

// CORS: izinkan client dari device/origin lain (misal client/index.html
// yang dibuka langsung di laptop Device B) memanggil API ini
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Log setiap request: IP device pengirim, method, URL, dan status respons.
// Ini bukti di terminal Device A bahwa request datang dari device lain.
app.use((req, res, next) => {
  const ip = clientIp(req);
  const asal = getLocalIPs().includes(ip) || ip === '127.0.0.1' || ip === '::1' ? 'Device A' : 'Device B';
  res.on('finish', () => {
    if (!req.url.startsWith('/api')) return;
    console.log(
      `[${new Date().toLocaleTimeString()}] ${asal} (${ip}) -> ${req.method.padEnd(6)} ${req.url} -> ${res.statusCode}`
    );
  });
  next();
});

// Halaman client juga disediakan di sini supaya HP bisa langsung membukanya.
// (Client yang sama bisa juga dibuka terpisah dari file client/index.html)
app.use(express.static(path.join(__dirname, 'client')));

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

// ===================== REST API =====================

// Daftar endpoint
app.get('/api', (req, res) => {
  res.json({
    nama: 'REST API Data Mahasiswa (Device A)',
    endpoint: [
      'GET    /api/info',
      'GET    /api/mahasiswa',
      'GET    /api/mahasiswa/:id',
      'POST   /api/mahasiswa',
      'PUT    /api/mahasiswa/:id',
      'DELETE /api/mahasiswa/:id',
    ],
  });
});

// Info IP: IP client yang request vs IP server
app.get('/api/info', (req, res) => {
  res.json({ ipClient: clientIp(req), ipServer: getLocalIPs() });
});

// GET: ambil semua data
app.get('/api/mahasiswa', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mahasiswa ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: ambil satu data berdasarkan id
app.get('/api/mahasiswa/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mahasiswa WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: tambah data baru
app.post('/api/mahasiswa', async (req, res) => {
  const { nim, nama, jurusan } = req.body || {};
  if (!nim || !nama || !jurusan) {
    return res.status(400).json({ error: 'nim, nama, dan jurusan wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO mahasiswa (nim, nama, jurusan) VALUES (?, ?, ?)',
      [nim, nama, jurusan]
    );
    res.status(201).json({ pesan: 'Data berhasil ditambahkan', id: result.insertId, nim, nama, jurusan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: ubah data
app.put('/api/mahasiswa/:id', async (req, res) => {
  const { nim, nama, jurusan } = req.body || {};
  if (!nim || !nama || !jurusan) {
    return res.status(400).json({ error: 'nim, nama, dan jurusan wajib diisi' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ? WHERE id = ?',
      [nim, nama, jurusan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ pesan: 'Data berhasil diubah', id: Number(req.params.id), nim, nama, jurusan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: hapus data
app.delete('/api/mahasiswa/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM mahasiswa WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json({ pesan: 'Data berhasil dihapus', id: Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function clientIp(req) {
  return (req.ip || '').replace('::ffff:', '');
}

// Ambil semua IPv4 lokal Device A (Wi-Fi / LAN)
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
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('==========================================================');
      console.log(' DEVICE A (SERVER) berjalan. Alamat API untuk Device B:');
      for (const ip of getLocalIPs()) {
        console.log(`   http://${ip}:${PORT}`);
      }
      console.log(' Di bawah ini akan muncul log setiap request dari client.');
      console.log('==========================================================');
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\nPort ${PORT} sedang dipakai: server lain (kemungkinan server ini juga) masih berjalan.`);
        console.error('Cara mengatasi:');
        console.error('  1. Cari terminal/jendela lain yang masih menjalankan server, lalu tekan Ctrl + C');
        console.error('  2. Atau matikan paksa semua Node.js:  taskkill /F /IM node.exe');
        console.error('  3. Lalu jalankan lagi: npm start');
      } else {
        console.error('Server gagal berjalan:', err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Gagal konek ke MySQL:', err.message);
    console.error('Pastikan MySQL di XAMPP sudah di-Start dan user/password di server.js benar.');
    process.exit(1);
  });
