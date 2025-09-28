# Aplikasi Pembelajaran Fisika

Aplikasi web berbasis sistem pembelajaran fisika digital untuk guru dan siswa dengan integrasi Supabase.

## Fitur

### Untuk Guru
- **Manajemen Materi**: Upload dan kelola materi pembelajaran (PPT, Video, Modul, Latihan)
- **Manajemen Siswa**: Tambah, edit, dan hapus data siswa
- **Sistem Kehadiran**: Generate token absensi dan kelola kehadiran siswa
- **Penilaian**: Upload nilai siswa dan generate laporan
- **Jurnal Pembelajaran**: Catatan harian proses pembelajaran
- **Pengaturan Website**: Kustomisasi logo, background, dan judul website

### Untuk Siswa
- **Akses Materi**: Lihat dan akses materi pembelajaran sesuai kelas
- **Absensi GPS**: Absen dengan lokasi GPS menggunakan token dari guru
- **Lihat Nilai**: Akses nilai pribadi
- **Jurnal Pembelajaran**: Lihat catatan pembelajaran kelas

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime API)
- **Deployment**: GitHub Pages

## Cara Setup

### Prasyarat
- Akun Supabase (gratis di https://supabase.com)
- Akun GitHub (untuk deployment)

### 1. Setup Supabase

1. Buat project baru di Supabase Dashboard
2. Copy Project URL dan Anon Key
3. Ganti di file `js/app.js`:
   ```javascript
   const supabaseUrl = 'https://your-project-id.supabase.co';
   const supabaseAnonKey = 'your-anon-key';
