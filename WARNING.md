# Pekerjaan lanjutan sebelum produksi

Beberapa fitur sudah tersambung ke Supabase, tetapi deployment database belum bisa diverifikasi dari workspace ini. Terapkan skema dan migrasi sebelum memakai data operasional.

## Prioritas wajib

1. Buat project Supabase, isi `.env.local` dari `.env.example`, lalu jalankan `database/schema.sql` untuk database baru atau jalankan migrasi yang belum diterapkan dari `database/migrations/` secara berurutan.
2. Siapkan Owner pertama melalui `/owner-setup`: buat akun di Supabase Auth, lalu buat profil `owner` dengan email yang sama di `public.users`. Tidak ada pendaftaran Owner publik.
3. Next Proxy sudah mewajibkan sesi aktif dan mencocokkan role untuk halaman operasional serta Route Handler berdasarkan prefix. Sebelum produksi, tambahkan pemeriksaan role di setiap handler dan proteksi untuk Express API; Express saat ini hanya bind ke loopback.
4. Profil di `public.users` belum membuat atau mengelola identitas di `auth.users`; tambah/edit role hanya mengubah profil database.
5. Tinjau konfigurasi bucket dan akses file sebelum produksi. Foto POD memakai bucket publik dengan batas 5 MiB; gambar teknik memakai bucket privat dengan batas 50 MiB.
6. Aktifkan hCaptcha di Supabase Auth, atur `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, dan konfigurasi rate limit Auth di Dashboard. Batas tiga percobaan pada form browser bukan pengganti rate limit server.
7. Verifikasi alamat dan nomor WhatsApp perusahaan pada konten yang dikelola melalui CMS.
8. Tambahkan audit log dan tinjau akses seluruh API sebelum produksi.

## Struktur aplikasi

- Route Handler Next.js berada di `src/app/api`.
- Modul backend dipisah per fitur di `src/backend/modules`.
- API client dan tipe domain berada di `src/services`.
- `src/backend/server.ts` menyediakan Express API lokal opsional untuk kompatibilitas.

## Persistensi

Modul berbasis store memuat cache dari Supabase dan mengantrekan mutasi. Route Handler menyegarkan cache paling lama setiap 15 detik. PM, Pengiriman Lapangan, dan ringkasan Keuangan melakukan query langsung. Tanpa kredensial Supabase, sebagian fitur memakai memori proses saja dan datanya hilang saat server berhenti; fitur yang memakai query langsung mengembalikan error.
