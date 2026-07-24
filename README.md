# ALUPBESK

Website katalog aluminium dan komponen industri berbasis Next.js 16, Tailwind CSS, serta Express API lokal. Proyek dapat dijalankan tanpa database untuk pengembangan tampilan dan alur checkout awal.

## Menjalankan project

1. Install Node.js 20 atau lebih baru.
2. Salin konfigurasi contoh:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Install paket dan jalankan dua terminal:

   ```powershell
   npm install
   npm run dev:api
   ```

   Terminal kedua:

   ```powershell
   npm run dev
   ```

4. Buka:

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

## Catatan pengembangan

Produk dan gambar saat ini bersifat dinamis dari data di `src/services/catalog/products.ts` dan disajikan oleh API. Mitra menggunakan data sementara di `src/features/home/data/partners.ts`; setiap item sudah memiliki tempat `logoUrl` untuk integrasi media.

Katalog beranda hanya menampilkan delapan produk agar halaman tidak terlalu panjang, sementara semua produk tersedia di `/katalog`. Keranjang menggabungkan produk yang sama menjadi satu item dan mencantumkan pilihan ukuran/varian di dalamnya.

Lihat [WARNING.md](WARNING.md) sebelum mulai integrasi database, unggahan gambar, dan autentikasi admin.
