# KARTESIA — Media Pembelajaran SPLDV

Platform belajar SPLDV 11 langkah (TaRL) untuk Fase E Kelas X: materi terstruktur, contoh soal berpembahasan, latihan adaptif, tutor sebaya otomatis, **Teacher Focus Lock**, dan dasbor guru real-time.

## Cara Deploy Cepat ke Vercel (3 Langkah Saja)

Aplikasi sudah dilengkapi fitur **Auto-Create Tables**, jadi Anda tidak perlu menjalankan perintah terminal untuk membuat tabel database!

### 1. Dapatkan Database Neon (Gratis)
1. Buka [neon.tech](https://neon.tech) → Daftar/Login dengan GitHub.
2. Klik **Create Project** (beri nama bebas).
3. Di dashboard Neon, salin **Pooled connection string** (yang mengandung `-pooler`).

### 2. Upload Kode ke GitHub
1. Buat repository baru di GitHub.
2. Upload semua file project ini ke repository tersebut (bisa via git atau upload zip/folder).

### 3. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) → Login dengan GitHub.
2. Klik **Add New → Project** → Pilih repository GitHub Anda.
3. Di bagian **Environment Variables**, tambahkan:
   - **`DATABASE_URL`** = *(tempel connection string Neon dari langkah 1)*
   - **`GURU_PIN`** = *(misal `2468` untuk mengunci dashboard guru)*
4. Klik **Deploy**!

Selesai! Buka URL Vercel yang diberikan. Tabel database akan otomatis dibuat sendiri saat web pertama kali dibuka.
