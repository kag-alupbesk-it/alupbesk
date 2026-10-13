# ALUPBESK

Website katalog aluminium dan komponen industri berbasis Next.js 16 dan Tailwind CSS. Route Handler Next.js menyediakan API web. Express API lokal tersedia secara opsional untuk kompatibilitas.

## Menjalankan project

1. Install Node.js 20 atau lebih baru.
2. Buat project Supabase, lalu jalankan `database/schema.sql` di SQL Editor. File ini adalah skema final tunggal untuk seluruh database.
3. Salin `.env.example` menjadi `.env.local` dan isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, serta `SUPABASE_SERVICE_ROLE_KEY`. Service role key hanya digunakan di server. hCaptcha hanya dipakai pada formulir kontak dan jasa custom; login/registrasi memakai kode OTP email.
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

- Skema database final ada di `database/schema.sql` (satu file untuk seluruh entitas).
- `src/instrumentation.ts` memuat data awal; Route Handler yang memakai cache store menyegarkan data paling lama setiap 15 detik.
- Perubahan store dikirim lewat `src/services/supabase.ts`. Jika tulis ke Supabase gagal, request mutasi ikut gagal dan operasi tetap di antrean untuk dicoba kembali.
- PM, Pengiriman Lapangan, dan ringkasan Keuangan menggunakan query Supabase langsung.
- Tanpa kredensial Supabase, sebagian fitur memakai cache memori lokal dan datanya tidak bertahan setelah proses server berhenti. Fitur yang memakai query langsung mengembalikan error.

## Catatan

Halaman operasional memakai `/login` dan mencocokkan akun Supabase Auth dengan profil aktif di `public.users`. Buat akun owner awal di Supabase Auth, kemudian tambahkan profil `owner` dengan email yang sama, status `ACTIVE`, dan `active = true`. Profil yang dibuat dari halaman Manager belum membuat kredensial Auth.

Pendaftaran staf dilakukan di `/register`. Pemohon memilih role `keuangan`, `proyek`, `field`, `produksi`, `gudang`, atau `marketing`; `owner` dan `manager` tidak bisa diminta dari formulir publik. Role dan dept hasil pilihan formulir disimpan di metadata Supabase Auth dan ditulis ke `public.users` melalui `POST /api/auth/register`. Permintaan disimpan sebagai `PENDING`; Owner hanya dapat menyetujuinya setelah email terverifikasi. Notifikasi Owner dikirim setelah verifikasi, dan daftar permintaan menampilkan status verifikasi.

Pendaftaran dan login staf memakai OTP email 6 digit. OTP pendaftaran hanya memverifikasi email (`signup`); sesi Auth yang dibuat selama verifikasi langsung dikeluarkan, jadi pemohon tidak otomatis login. OTP login dikirim setelah kata sandi benar dan baru membuat sesi aplikasi setelah diverifikasi (`email`). Form menyediakan tombol kirim/kirim ulang dan verifikasi yang terpisah; pengiriman ulang memiliki jeda 5 detik.

Permintaan pendaftaran dibuat oleh trigger Supabase Auth dan disinkronkan oleh `POST /api/auth/register`. Sebelum membuka `/register` di produksi:

1. Jalankan ulang `database/schema.sql` untuk menambah kolom verifikasi dan trigger sinkronisasi.
2. Di Supabase Dashboard → Authentication → Sign In / Providers → Email, pastikan **Confirm email** aktif agar akun tidak dikonfirmasi otomatis. Jangan aktifkan CAPTCHA Auth Supabase karena form login/register tidak lagi mengirim token CAPTCHA.
3. Di Authentication → Email Templates, ubah **Confirm signup** untuk daftar dan **Magic Link** untuk login. Hapus isi bawaan `Your sign-in link`, tautan `{{ .ConfirmationURL }}`, serta tombol `Sign in`; ganti dengan subject/body berikut agar email menampilkan OTP angka langsung:
   - Confirm signup — subject: `Kode verifikasi email ALUPBESK`; body HTML: `<h2>Kode verifikasi email ALUPBESK</h2><p>Masukkan kode ini pada formulir pendaftaran:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">{{ .Token }}</p><p>Jika Anda tidak mendaftar, abaikan email ini.</p>`
   - Magic Link — subject: `Kode masuk ALUPBESK`; body HTML: `<h2>Kode masuk ALUPBESK</h2><p>Masukkan kode ini pada formulir login:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">{{ .Token }}</p><p>Jika Anda tidak meminta kode, abaikan email ini.</p>`
   `{{ .Token }}` adalah OTP 6 digit. Aplikasi meminta pengguna mengetik kode pada form, bukan membuka tautan. Email screenshot “Your sign-in link” berasal dari **Magic Link** yang masih memakai template bawaan; perubahan kode aplikasi tidak bisa mengganti template Dashboard ini.
4. Di Authentication → URL Configuration, set **Site URL** ke domain aplikasi dan izinkan URL aplikasi serta `http://localhost:3000` untuk pengembangan. Callback `/auth/confirm` tetap tersedia untuk tautan konfirmasi lama.
5. Atur SMTP khusus pada Authentication → SMTP Settings untuk pengiriman produksi; uji kode masuk dan folder spam.

Owner pertama tetap perlu dibuat melalui Supabase secara manual sebelum ada yang dapat menyetujui permintaan role. Akses staf baru diberikan setelah kode email terverifikasi dan Owner menyetujui role. ([Panduan `verifyOtp`](https://supabase.com/docs/reference/javascript/auth-verifyotp), [template email Supabase](https://supabase.com/docs/guides/auth/auth-email-templates))

PWA menyimpan halaman publik dan aset publik tertentu untuk pembukaan offline. Halaman/API operasional serta perubahan data tetap memerlukan koneksi server; mutasi offline tidak dianggap tersimpan sampai server mengonfirmasi. Realtime permintaan role menggunakan Supabase Realtime dengan polling berkala sebagai fallback.

## Bahasa, katalog, dan autentikasi

- Pilihan bahasa English/Indonesia tersedia di portal, navbar publik, login, dan register. Bahasa awal adalah English; pilihan berikutnya disimpan di browser. Konten website untuk Hero, Profil, Kontak, alur, dan kapasitas dapat dikelola terpisah per bahasa di CMS; konten mitra, FAQ, produk, dan portofolio masih satu bahasa.
- Katalog publik hanya menampilkan detail produk perusahaan; keranjang, checkout, dan endpoint checkout publik sudah dilepas. Data pesanan lama dan alur internal divisi tetap disimpan.
- Password login/register punya tombol tampilkan/sembunyikan. Form login membatasi tiga kegagalan per email pada browser selama 15 menit. Pembatas ini membantu penggunaan normal, bukan pengganti batas server; atur rate limit endpoint Auth di Supabase Dashboard untuk perlindungan lintas perangkat.
- Formulir kontak dan jasa custom tetap memakai hCaptcha yang diverifikasi server-side. Simpan site key pada `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` dan secret pada `HCAPTCHA_SECRET` (server saja). Auth login/register menggunakan password dan OTP email, tanpa CAPTCHA. Jangan simpan secret CAPTCHA atau service role key di variabel `NEXT_PUBLIC_*`.
- Request JSON dibatasi maksimal 1 MiB. Endpoint pendaftaran, kontak, dan request custom memakai batas percobaan per proses; endpoint publik ber-CAPTCHA menolak request bila secret belum dikonfigurasi. Rate limit memori berlaku per proses, tidak lintas replika, dan dapat tidak konsisten selama dev Turbopack.
- Owner dapat memicu pembersihan file yatim yang berumur lebih dari 24 jam melalui `POST /api/owner/storage/cleanup`. Pembersih hanya melihat `images/custom/` dan mempertahankan gambar yang dipakai request custom atau order PM.
- Akun Owner pertama tidak dibuat melalui pendaftaran umum. Provisioning Owner dilakukan oleh administrator server melalui prosedur internal; halaman publik tidak menyediakan panduan atau SQL untuk membuat Owner.

Sebelum produksi, ikuti daftar pekerjaan di [WARNING.md](WARNING.md), termasuk pemeriksaan otorisasi per handler.
