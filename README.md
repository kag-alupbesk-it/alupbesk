# ALUPBESK

Website katalog aluminium dan komponen industri berbasis Next.js 16 dan Tailwind CSS. Route Handler Next.js menyediakan API web. Express API lokal tersedia secara opsional untuk kompatibilitas.

## Menjalankan project

1. Install Node.js 20 atau lebih baru.
2. Buat project Supabase. Untuk database baru, jalankan `database/schema.sql`. Untuk database yang sudah ada, jalankan migrasi yang belum diterapkan dari `database/migrations/` secara berurutan.
3. Salin `.env.example` menjadi `.env.local` dan isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, serta `SUPABASE_SERVICE_ROLE_KEY`. Service role key hanya digunakan di server. Untuk validasi bot, isi `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` dan aktifkan hCaptcha di pengaturan Auth Supabase.
4. Install paket dan jalankan Next.js:

   ```powershell
   npm install
   npm run dev
   ```

5. Buka `http://localhost:3000`.

Express API opsional dijalankan terpisah dengan `npm run dev:api` pada port 4000.

## Perintah penting

```powershell
npm run dev       # Website Next.js dan API Route Handler
npm run dev:api   # Express API lokal opsional
npm run lint      # Pemeriksaan ESLint
npx tsc --noEmit  # Pemeriksaan TypeScript
npm run build     # Build produksi
```

## Persistensi Supabase

- Skema database ada di `database/schema.sql`; migrasi tambahan ada di `database/migrations/`.
- `src/instrumentation.ts` memuat data awal; Route Handler yang memakai cache store menyegarkan data paling lama setiap 15 detik.
- Perubahan store dikirim lewat `src/services/supabase.ts`. Jika tulis ke Supabase gagal, request mutasi ikut gagal dan operasi tetap di antrean untuk dicoba kembali.
- PM, Pengiriman Lapangan, dan ringkasan Keuangan menggunakan query Supabase langsung.
- Tanpa kredensial Supabase, sebagian fitur memakai cache memori lokal dan datanya tidak bertahan setelah proses server berhenti. Fitur yang memakai query langsung mengembalikan error.

## Catatan

Halaman operasional memakai `/login` dan mencocokkan akun Supabase Auth dengan profil aktif di `public.users`. Buat akun owner awal di Supabase Auth, kemudian tambahkan profil `owner` dengan email yang sama, status `ACTIVE`, dan `active = true`. Profil yang dibuat dari halaman Manager belum membuat kredensial Auth.

Pendaftaran staf dilakukan di `/register`. Pemohon memilih role `keuangan`, `proyek`, `field`, `produksi`, `gudang`, atau `marketing`; `owner` dan `manager` tidak bisa diminta dari formulir publik. Role dan dept hasil pilihan formulir disimpan di metadata Supabase Auth dan di tulis ke `public.users` melalui `POST /api/auth/register` (nilai default `pelanggan` tidak dipakai). Permintaan disimpan sebagai `PENDING` dan hanya Owner aktif yang dapat menyetujui (`ACTIVE`) atau menolak (`SUSPENDED`) melalui dashboard/pengelolaan pengguna; kartu "Permintaan akses role" membaca user dengan status `PENDING` dari `public.users`. Untuk database yang sudah berjalan, terapkan migrasi `20261014_operational_roles.sql`, `20261015_role_requests.sql`, lalu `20261016_register_profile_role.sql` sesuai urutan. Untuk database baru, `database/schema.sql` sudah memuat ketiganya.

Permintaan pendaftaran dibuat oleh trigger Supabase Auth dan disinkronkan oleh `POST /api/auth/register`. Karena itu, pastikan skema/migrasi diterapkan sebelum membuka `/register`, serta setel redirect konfirmasi email Supabase ke halaman aplikasi yang sesuai. Owner pertama tetap perlu dibuat melalui Supabase secara manual sebelum ada yang dapat menyetujui permintaan role.

PWA menyimpan halaman publik dan aset publik tertentu untuk pembukaan offline. Halaman/API operasional serta perubahan data tetap memerlukan koneksi server; mutasi offline tidak dianggap tersimpan sampai server mengonfirmasi. Realtime permintaan role menggunakan Supabase Realtime dengan polling berkala sebagai fallback.

## Bahasa, katalog, dan autentikasi

- Pilihan bahasa English/Indonesia tersedia di portal, navbar publik, login, dan register. Bahasa awal adalah English; pilihan berikutnya disimpan di browser. Konten perusahaan yang diubah dari CMS masih memakai satu versi teks sampai kolom terjemahan CMS ditambahkan.
- Katalog publik hanya menampilkan detail produk perusahaan; keranjang, checkout, dan endpoint checkout publik sudah dilepas. Data pesanan lama dan alur internal divisi tetap disimpan.
- Password login/register punya tombol tampilkan/sembunyikan. Form login membatasi tiga kegagalan per email pada browser selama 15 menit. Pembatas ini membantu penggunaan normal, bukan pengganti batas server; atur rate limit endpoint Auth di Supabase Dashboard untuk perlindungan lintas perangkat.
- Aktifkan CAPTCHA di Supabase: Authentication → Bot and Abuse Protection → CAPTCHA, pilih hCaptcha, lalu masukkan secret key di Dashboard. Simpan site key pada `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`. CAPTCHA diteruskan ke Supabase saat login dan registrasi. Jangan simpan secret CAPTCHA atau service role key di variabel `NEXT_PUBLIC_*`.
- Akun Owner pertama tidak dibuat melalui pendaftaran umum. Provisioning Owner dilakukan oleh administrator server melalui prosedur internal; halaman publik tidak menyediakan panduan atau SQL untuk membuat Owner.

Sebelum produksi, ikuti daftar pekerjaan di [WARNING.md](WARNING.md), termasuk pemeriksaan otorisasi per handler.
