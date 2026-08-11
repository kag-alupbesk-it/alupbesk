# ALUPBESK

Website katalog aluminium dan komponen industri berbasis Next.js 16, Tailwind CSS, serta Express API lokal. Data dipersist ke Supabase (PostgreSQL) — saat server dimulai, seluruh data di-load ke memori lalu setiap mutasi ditulis kembali secara sinkron.

## Menjalankan project

1. Install Node.js 20 atau lebih baru.
2. Buat project Supabase, lalu jalankan seluruh isi `database/schema.sql` di SQL Editor Supabase.
3. Salin `.env.example` menjadi `.env` dan isi dengan kredensial Supabase:

   ```powershell
   Copy-Item .env.example .env
   ```

   Variabel yang dibutuhkan: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` (untuk tulis lintas-RLS dari server).

4. Install paket dan jalankan dua terminal:

   ```powershell
   npm install
   npm run dev:api
   ```

   Terminal kedua:

   ```powershell
   npm run dev
   ```

5. Buka:

   - Website: http://localhost:3000
   - Katalog penuh: http://localhost:3000/katalog
   - Keranjang: http://localhost:3000/keranjang
   - Checkout: http://localhost:3000/checkout
   - Admin persiapan: http://localhost:3000/admin
   - API: http://localhost:4000/api/catalog/products

## Perintah penting

```powershell
npm run dev       # Website Next.js
npm run dev:api   # Express API lokal
npm run lint      # Pemeriksaan ESLint
npx tsc --noEmit  # Pemeriksaan TypeScript
npm run build     # Build produksi
```

## Persistensi Supabase

- Skema database ada di `database/schema.sql` (tabel, enum, index). Eksekusi sekali di SQL Editor Supabase.
- Saat server start, `src/services/supabaseHydrate.ts` memuat semua tabel ke store in-memory dan men-seed data awal (produk, gudang, kas) jika tabel kosong. Pemicu: `src/instrumentation.ts` untuk Next.js dan middleware di `src/backend/app.ts` untuk Express.
- Setiap mutasi store memanggil `enqueueUpsert`/`enqueueDelete` dari `src/services/supabase.ts`, lalu route API memanggil `await flushWrites()` untuk menulis antrean ke Supabase.
- Karena tulis memakai antrean sinkron, jangan jalankan dua instance aplikasi (mis. `next dev` + `next start`) terhadap database yang sama secara bersamaan.

## Catatan pengembangan

Produk dan gambar saat ini bersifat dinamis dari data di `src/services/catalog/products.ts` dan disajikan oleh API. Mitra menggunakan data sementara di `src/features/home/data/partners.ts`; setiap item sudah memiliki tempat `logoUrl` untuk integrasi media.

Katalog beranda hanya menampilkan delapan produk agar halaman tidak terlalu panjang, sementara semua produk tersedia di `/katalog`. Keranjang menggabungkan produk yang sama menjadi satu item dan mencantumkan pilihan ukuran/varian di dalamnya.

Lihat [WARNING.md](WARNING.md) sebelum mulai integrasi database, unggahan gambar, dan autentikasi admin.
