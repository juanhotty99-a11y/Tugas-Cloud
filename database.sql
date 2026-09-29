-- Opsional: server.js sudah membuat database & tabel ini otomatis.
-- File ini bisa dijalankan manual lewat phpMyAdmin (tab SQL) kalau mau.

CREATE DATABASE IF NOT EXISTS db_kampus;
USE db_kampus;

CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  jurusan VARCHAR(100) NOT NULL,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mahasiswa (nim, nama, jurusan) VALUES
  ('2201001', 'Budi Santoso', 'Informatika'),
  ('2201002', 'Siti Aminah', 'Sistem Informasi');
