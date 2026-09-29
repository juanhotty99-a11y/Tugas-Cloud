# Tugas Komputasi Awan & Terdistribusi: REST API 2 Device

Konsep sesuai arahan dosen:

- **Device A = SERVER**: menjalankan **REST API + database MySQL**.
- **Device B = CLIENT**: melakukan request **GET, POST, PUT, DELETE** ke API di Device A.
- **Seluruh operasi database dilakukan lewat request dari Device B** ke server Device A.
- Boleh di jaringan (Wi-Fi) yang sama dan cukup berjalan di **local**; yang penting
  **IP kedua device berbeda** (2 mesin yang berbeda).
- CRUD harus **lengkap** (tambah, lihat, ubah, hapus), tidak hanya tambah data.

```
        DEVICE B (CLIENT)                               DEVICE A (SERVER)
  IP: 192.168.1.23 (HP / laptop 2)               IP: 192.168.1.10 (laptop kamu)
 ┌────────────────────────────┐   HTTP request  ┌───────────────────────────────┐
 │ client/index.html          │ ──────────────▶ │ server.js  (REST API :3000)   │
 │  GET    /api/mahasiswa     │                 │      │                        │
 │  POST   /api/mahasiswa     │ ◀────────────── │      ▼                        │
 │  PUT    /api/mahasiswa/:id │   respons JSON  │ MySQL (XAMPP) → db_kampus     │
 │  DELETE /api/mahasiswa/:id │                 └───────────────────────────────┘
 └────────────────────────────┘                         (satu Wi-Fi yang sama)
```

## Isi proyek

| File | Jalan di | Fungsi |
|------|----------|--------|
| `server.js` | Device A | REST API (CRUD) yang terhubung ke MySQL, menerima request dari device lain, dan mencatat IP setiap request di terminal |
| `database.sql` | Device A | Script SQL + contoh data (opsional, tabel juga dibuat otomatis oleh server) |
| `package.json` | Device A | Daftar library Node.js (`express`, `mysql2`) |
| `client/index.html` | Device B | Aplikasi client: isi alamat server, lalu kirim GET/POST/PUT/DELETE. Ada **log request** (method, URL, status, respons JSON) dan tampilan **IP client vs IP server** untuk bukti ke dosen |
| `jalankan-online.bat` | Device A | Opsional: jalankan server + ngrok sekaligus |

---

## BAGIAN 1 – Siapkan DEVICE A (server, laptop kamu)

### 1. Install software

1. **VS Code** → https://code.visualstudio.com
2. **Node.js (LTS)** → https://nodejs.org
3. **XAMPP** (MySQL + phpMyAdmin) → https://www.apachefriends.org

Cek di terminal VS Code (**Terminal → New Terminal**): `node -v` dan `npm -v` harus keluar nomor versi.

### 2. Nyalakan MySQL

Buka **XAMPP Control Panel** → klik **Start** pada **Apache** dan **MySQL** (sampai hijau).

> Default XAMPP: user `root`, password kosong. Kalau MySQL kamu pakai password,
> ubah `password: ''` di `server.js`.

### 3. Buka proyek di VS Code

```bash
git clone -b claude/upbeat-darwin-em5uux https://github.com/juanhotty99-a11y/Tugas-Cloud.git
```

Lalu **File → Open Folder** → pilih folder `Tugas-Cloud`.

### 4. Install library & jalankan server

```bash
npm install
npm start
```

Hasilnya:

```
==========================================================
 DEVICE A (SERVER) berjalan. Alamat API untuk Device B:
   http://192.168.1.10:3000
 Di bawah ini akan muncul log setiap request dari client.
==========================================================
```

Catat alamat itu (IP kamu akan berbeda). Database `db_kampus` & tabel `mahasiswa` dibuat otomatis.
Kalau mau ada contoh data, buka `http://localhost/phpmyadmin` → tab **SQL** → paste isi
`database.sql` → **Go**.

### 5. Izinkan firewall (penting!)

Saat pertama `npm start`, Windows biasanya memunculkan pop-up firewall → centang
**Private networks** (dan **Public** kalau pakai Wi-Fi kampus) → **Allow access**.
Kalau terlanjur ditutup, buka **PowerShell sebagai Administrator**:

```powershell
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
```

---

## BAGIAN 2 – Pakai DEVICE B (client)

**Sambungkan Device B ke Wi-Fi yang sama dengan Device A** (atau pakai hotspot HP, lalu
laptop Device A konek ke hotspot itu). Pilih salah satu:

### Opsi 1 – Device B adalah laptop / PC lain

1. Copy file `client/index.html` ke laptop Device B (lewat flashdisk, WhatsApp, Google Drive,
   atau clone repo ini), lalu **double-click** untuk membukanya di browser.
2. Di kolom **Alamat Server (Device A)** isi `http://192.168.1.10:3000` (alamat dari langkah 4)
   → **Hubungkan**.

Di sini client benar-benar terpisah: file client ada di Device B, dan hanya request API
yang dikirim ke Device A.

### Opsi 2 – Device B adalah HP

Di browser HP buka `http://192.168.1.10:3000` → halaman client langsung terbuka dan
otomatis terhubung ke API Device A. (Server juga menyediakan file client ini supaya HP
tidak perlu menyimpan file HTML.)

### Opsi 3 – Pakai Postman / Thunder Client (tanpa tampilan web)

Dari laptop Device B, kirim request langsung ke `http://192.168.1.10:3000/api/mahasiswa`
(lihat daftar API di bawah). Di VS Code bisa pakai extension **Thunder Client**.

### Yang ditunjukkan saat demo ke dosen

1. Di client (Device B) bagian **1** muncul **IP Device B** dan **IP Device A** yang **berbeda**
   dengan status hijau *"IP client dan server berbeda (2 device)"*.
2. Lakukan semua operasi dari Device B:
   - **POST** → isi form, klik *POST – Tambah Data*
   - **GET** → klik *GET – Muat Semua* atau *GET by ID*
   - **PUT** → klik tombol *PUT* di salah satu data, ubah, lalu *PUT – Simpan Perubahan*
   - **DELETE** → klik tombol *DELETE*
3. Bagian **4. Log Request** di client menampilkan setiap request (method, URL, status, respons JSON).
4. Di terminal VS Code Device A, setiap request tercatat beserta IP pengirimnya:

   ```
   [10:15:02] Device B (192.168.1.23) -> POST   /api/mahasiswa -> 201
   [10:15:05] Device B (192.168.1.23) -> PUT    /api/mahasiswa/3 -> 200
   [10:15:09] Device B (192.168.1.23) -> DELETE /api/mahasiswa/3 -> 200
   ```

5. Buka phpMyAdmin di Device A → tabel `mahasiswa` berubah sesuai request dari Device B.

### Kalau Device B tidak bisa terhubung

- Pastikan firewall sudah diizinkan (langkah 5).
- Pastikan kedua device di Wi-Fi yang sama. **Wi-Fi kampus/kafe sering memblokir koneksi
  antar-device** → pakai hotspot HP.
- Pakai `http://` (bukan `https://`) dan jangan lupa `:3000`.
- Pastikan `npm start` di Device A masih jalan & MySQL di XAMPP masih Start.
- Tes dulu di browser Device B: `http://192.168.1.10:3000/api` → harus keluar JSON daftar endpoint.

---

## Daftar REST API (Device A)

| Method | URL | Body (JSON) | Fungsi | Status sukses |
|--------|-----|-------------|--------|---------------|
| GET | `/api/mahasiswa` | – | Ambil semua data | 200 |
| GET | `/api/mahasiswa/:id` | – | Ambil satu data | 200 (404 kalau tidak ada) |
| POST | `/api/mahasiswa` | `{"nim","nama","jurusan"}` | Tambah data | 201 |
| PUT | `/api/mahasiswa/:id` | `{"nim","nama","jurusan"}` | Ubah data | 200 |
| DELETE | `/api/mahasiswa/:id` | – | Hapus data | 200 |
| GET | `/api/info` | – | Lihat IP client & IP server | 200 |
| GET | `/api` | – | Daftar endpoint | 200 |

Contoh request dengan `curl` dari Device B (jalankan di **CMD**; Windows 10+ sudah punya `curl.exe`):

```bash
curl.exe http://192.168.1.10:3000/api/mahasiswa
curl.exe -X POST http://192.168.1.10:3000/api/mahasiswa -H "Content-Type: application/json" -d "{\"nim\":\"123\",\"nama\":\"Andi\",\"jurusan\":\"Informatika\"}"
curl.exe -X PUT http://192.168.1.10:3000/api/mahasiswa/1 -H "Content-Type: application/json" -d "{\"nim\":\"123\",\"nama\":\"Andi\",\"jurusan\":\"Sistem Informasi\"}"
curl.exe -X DELETE http://192.168.1.10:3000/api/mahasiswa/1
```

---

## Opsional: Satu Link untuk Semua Jaringan (ngrok / Cloudflare)

> Kata dosen: **cukup jalan di local**, yang penting IP kedua device berbeda. Bagian ini
> hanya tambahan kalau mau bisa diakses dari jaringan yang berbeda (misal HP pakai kuota).

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
Di client, bagian "IP Device B" akan menampilkan IP asli tiap device, jadi
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
