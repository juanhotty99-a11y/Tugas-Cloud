# Tugas Komputasi Awan & Terdistribusi: Mengakses Database Laptop dari HP

Proyek ini membuat **2 device (laptop & HP) dengan IP berbeda bisa mengakses database yang sama**.
Database MySQL ada di laptop, dan HP mengaksesnya lewat jaringan Wi-Fi.

## Konsep (arsitektur client–server)

```
 ┌──────────────┐   Wi-Fi / HTTP    ┌──────────────────────────── LAPTOP ───┐
 │  HP          │ ───────────────▶  │  server.js (Node.js + Express) :3000   │
 │  IP 192.168. │ ◀───────────────  │            │                          │
 │  1.xx        │   data JSON       │            ▼                          │
 └──────────────┘                   │  MySQL (XAMPP) :3306 → db_kampus      │
                                    │  IP 192.168.1.yy                      │
 ┌──────────────┐                   │                                       │
 │ Browser      │ ──localhost─────▶ │                                       │
 │ laptop       │                   └───────────────────────────────────────┘
 └──────────────┘
```

HP **tidak** langsung konek ke MySQL. HP membuka web di laptop, lalu server di laptop
(`server.js`) yang membaca/menulis ke MySQL. Ini cara standar & aman (database tidak
dibuka ke jaringan). Kalau data ditambah dari HP, data langsung muncul di laptop, dan sebaliknya.

## Isi proyek

| File | Fungsi |
|------|--------|
| `server.js` | Server API (CRUD) yang terhubung ke MySQL, listen di `0.0.0.0:3000` agar bisa diakses device lain |
| `public/index.html` | Tampilan web (bisa dibuka dari laptop & HP) untuk tambah/edit/hapus data |
| `database.sql` | Script SQL (opsional, karena tabel sudah dibuat otomatis oleh server) |
| `package.json` | Daftar library Node.js |

---

## LANGKAH DARI 0

### 1. Install software yang dibutuhkan (di laptop)

1. **VS Code** → https://code.visualstudio.com
2. **Node.js (versi LTS)** → https://nodejs.org → install, klik Next terus.
3. **XAMPP** (berisi MySQL + phpMyAdmin) → https://www.apachefriends.org → install.

Cek Node.js sudah terinstall: buka VS Code → menu **Terminal → New Terminal**, lalu ketik:

```bash
node -v
npm -v
```

Kalau keluar nomor versi (misal `v22.x.x`), berarti aman.

### 2. Nyalakan MySQL

1. Buka **XAMPP Control Panel**.
2. Klik **Start** pada **Apache** dan **MySQL** (sampai warnanya hijau).
3. (Opsional) Buka `http://localhost/phpmyadmin` di browser laptop untuk melihat database.

> Default XAMPP: user `root`, password kosong. Kalau MySQL kamu pakai password,
> ubah bagian `password: ''` di `server.js`.

### 3. Buat proyek di VS Code

**Cara A – clone dari GitHub:**

```bash
git clone https://github.com/juanhotty99-a11y/Tugas-Cloud.git
cd Tugas-Cloud
```

**Cara B – manual:** buat folder `Tugas-Cloud`, buka di VS Code (**File → Open Folder**),
lalu buat file-file berikut dengan isi yang sama seperti di repo ini:

```
Tugas-Cloud/
├── package.json
├── server.js
├── database.sql
└── public/
    └── index.html
```

### 4. Install library

Di terminal VS Code (pastikan posisinya di folder proyek):

```bash
npm install
```

Ini akan mengunduh `express` (web server) dan `mysql2` (driver MySQL) ke folder `node_modules`.

### 5. Jalankan server

```bash
npm start
```

Kalau berhasil, muncul seperti ini:

```
========================================
 Server berjalan! Buka alamat berikut:
  - Di laptop : http://localhost:3000
  - Di HP     : http://192.168.1.10:3000
========================================
```

Database `db_kampus` dan tabel `mahasiswa` otomatis dibuat. Cek di phpMyAdmin kalau mau.

> Kalau muncul `Gagal konek ke MySQL`, berarti MySQL di XAMPP belum di-Start atau password salah.

### 6. Buka dari laptop

Buka browser di laptop → `http://localhost:3000` → coba tambah data.

### 7. Buka dari HP (bagian utama tugas)

1. **Sambungkan HP ke Wi-Fi yang SAMA dengan laptop** (atau nyalakan hotspot HP lalu laptop konek ke hotspot itu).
2. Lihat IP laptop di output terminal (baris `Di HP`), atau cek manual:
   - Windows: buka CMD → `ipconfig` → lihat **IPv4 Address** di bagian Wi-Fi (misal `192.168.1.10`)
   - Mac/Linux: `ifconfig` atau `ip a`
3. Di browser HP buka: `http://192.168.1.10:3000` (ganti dengan IP laptop kamu).
4. Di bagian atas halaman akan terlihat **IP HP** dan **IP laptop** → buktinya IP-nya berbeda.
5. Tambah data dari HP → dalam 3 detik data muncul juga di laptop (dan tersimpan di MySQL/phpMyAdmin).

Di terminal VS Code juga terlihat log request dari masing-masing IP, contoh:

```
[10:15:02] 127.0.0.1    -> GET /api/mahasiswa      ← dari laptop
[10:15:05] 192.168.1.23 -> POST /api/mahasiswa     ← dari HP
```

### 8. Kalau HP tidak bisa membuka (paling sering terjadi)

**Penyebab #1: Windows Firewall memblokir port 3000.**

- Saat pertama kali `npm start`, biasanya muncul pop-up Windows Firewall → centang
  **Private networks** (dan Public kalau Wi-Fi kampus) → **Allow access**.
- Kalau terlanjur ditutup, buka **PowerShell sebagai Administrator** lalu jalankan:

  ```powershell
  netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
  ```

**Cek lainnya:**

- HP dan laptop harus di jaringan yang sama. **Wi-Fi kampus/kafe sering memblokir
  koneksi antar-device (client isolation)** → solusinya pakai hotspot HP.
- Pastikan pakai `http://` bukan `https://`, dan jangan lupa `:3000`.
- Pastikan data HP (seluler) tidak dipakai; gunakan Wi-Fi.
- Pastikan server masih jalan di terminal (jangan ditutup).

---

## Daftar API (bisa ditunjukkan ke dosen)

| Method | URL | Fungsi |
|--------|-----|--------|
| GET | `/api/mahasiswa` | Ambil semua data |
| POST | `/api/mahasiswa` | Tambah data (body JSON: `nim`, `nama`, `jurusan`) |
| PUT | `/api/mahasiswa/:id` | Ubah data |
| DELETE | `/api/mahasiswa/:id` | Hapus data |
| GET | `/api/info` | Lihat IP client & IP server |

Contoh tes dari HP: buka `http://192.168.1.10:3000/api/mahasiswa` → keluar data JSON dari database laptop.

## Bonus: akses dari luar jaringan (beda Wi-Fi / internet)

Kalau dosen minta bisa diakses dari jaringan berbeda (misal HP pakai kuota), jalankan
tunnel seperti **ngrok** di terminal kedua:

```bash
npx ngrok http 3000
```

(perlu daftar akun gratis di ngrok.com dan menjalankan `npx ngrok config add-authtoken <token>` sekali).
Ngrok memberi URL publik `https://xxxx.ngrok-free.app` yang bisa dibuka dari mana saja.
