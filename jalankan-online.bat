@echo off
REM Menjalankan server + ngrok sekaligus, supaya web bisa dibuka dari
REM jaringan mana pun lewat SATU link yang sama.
REM GANTI baris di bawah dengan domain gratis dari dashboard ngrok kamu.
set DOMAIN=nama-kamu.ngrok-free.app

start "Server Tugas Cloud" cmd /k npm start
timeout /t 3 /nobreak >nul
start "Ngrok" cmd /k ngrok http --url=%DOMAIN% 3000

echo.
echo Buka di laptop, HP, atau device mana pun: https://%DOMAIN%
pause
