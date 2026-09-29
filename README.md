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
| `jalankan-online.bat` | Double-click untuk menjalankan server + ngrok sekaligus (satu link untuk semua jaringan) |

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

## Satu Link untuk Semua Jaringan (seperti web teman)

Cara di atas (`http://192.168.x.x:3000`) hanya jalan kalau HP & laptop **satu Wi-Fi**, dan
linknya beda antara laptop (`localhost`) dan HP (IP). Supaya **semua device pakai SATU link
yang sama** dari jaringan apa pun (Wi-Fi beda, kuota, dll), laptop dihubungkan ke internet
lewat **tunnel**:

```
 HP (kuota, IP 114.x.x.x)  ─┐
 Laptop teman (Wi-Fi lain) ─┼─▶ https://nama-kamu.ngrok-free.app ──tunnel──▶ Laptop kamu: server.js :3000 ─▶ MySQL
 Laptop kamu sendiri       ─┘
```

Database & server **tetap di laptop kamu**, tunnel hanya "meneruskan" akses dari internet.
Di halaman web, bagian "IP perangkat kamu" akan menampilkan IP asli tiap device, jadi
terlihat jelas bahwa device dengan IP berbeda mengakses database yang sama.

> Syarat: laptop harus **menyala**, `npm start` & tunnel harus **tetap jalan**, dan MySQL tetap Start.

### Pilihan 1 – ngrok (GRATIS, tanpa beli domain, link tetap) ⭐ disarankan

1. Daftar akun gratis di https://ngrok.com (bisa login pakai GitHub).
2. Download ngrok untuk Windows: https://ngrok.com/download → extract `ngrok.exe`,
   lalu **taruh `ngrok.exe` di folder `Tugas-Cloud`** (sejajar dengan `server.js`).
3. Di dashboard ngrok buka menu **Your Authtoken** → copy token-nya, lalu di terminal VS Code:

   ```bash
   .\ngrok config add-authtoken TOKEN_KAMU
   ```

   (cukup sekali seumur hidup)
4. Di dashboard ngrok buka menu **Domains** → setiap akun gratis dapat **1 domain tetap**,
   contoh `lompat-kucing-123.ngrok-free.app`. Copy nama domain itu.
5. Jalankan server (terminal 1):

   ```bash
   npm start
   ```

6. Buka terminal kedua (klik **+** di panel terminal), jalankan:

   ```bash
   .\ngrok http --url=lompat-kucing-123.ngrok-free.app 3000
   ```

   (ganti dengan domain kamu; kalau ngrok versi lama menolak `--url`, pakai `--domain=` )
7. Buka **`https://lompat-kucing-123.ngrok-free.app`** di laptop, HP, atau device mana pun.
   Link-nya **selalu sama** setiap kali dijalankan.

   Saat pertama dibuka, ngrok gratis menampilkan halaman peringatan → klik **Visit Site**.

**Biar gampang:** buka file `jalankan-online.bat`, ganti `nama-kamu.ngrok-free.app` dengan
domain kamu, simpan. Setelah itu cukup **double-click `jalankan-online.bat`** → server &
ngrok jalan sekaligus.

### Pilihan 2 – Domain sendiri seperti `namakamu.my.id` (Cloudflare Tunnel)

Web teman kamu (`loanch.my.id`) kemungkinan pakai cara ini atau hosting. Butuh domain sendiri:

1. Beli/daftar domain `.my.id` (sangat murah, khusus WNI, daftar pakai KTP) di registrar
   yang menjual `.my.id`.
2. Daftar akun gratis di https://dash.cloudflare.com → **Add a domain** → masukkan domain kamu
   → ikuti petunjuk untuk mengganti **nameserver** domain di panel registrar ke nameserver
   Cloudflare (tunggu sampai aktif, bisa beberapa menit–24 jam).
3. Install cloudflared di PowerShell:

   ```powershell
   winget install --id Cloudflare.cloudflared
   ```

   Tutup lalu buka lagi VS Code.
4. Jalankan sekali saja (setup):

   ```bash
   cloudflared tunnel login
   cloudflared tunnel create tugas-cloud
   cloudflared tunnel route dns tugas-cloud tugas.namakamu.my.id
   ```

5. Setiap mau dipakai: `npm start` di terminal 1, lalu di terminal 2:

   ```bash
   cloudflared tunnel --url http://localhost:3000 run tugas-cloud
   ```

6. Buka **`https://tugas.namakamu.my.id`** dari device mana pun.

### Tes cepat tanpa daftar apa pun (link berubah tiap dijalankan)

Setelah install cloudflared (langkah 3 di atas):

```bash
cloudflared tunnel --url http://localhost:3000
```

Akan muncul link acak `https://xxxx-xxxx.trycloudflare.com` yang bisa dibuka dari mana saja.
Cocok untuk demo cepat, tapi link-nya ganti setiap kali perintah dijalankan.
