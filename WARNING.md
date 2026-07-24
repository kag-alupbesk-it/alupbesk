# Pekerjaan lanjutan sebelum produksi

Project saat ini dapat berjalan penuh secara lokal tanpa database. Data katalog berasal dari `src/services/catalog/products.ts`, dan pesanan disimpan sementara di memori proses API. Semua data pesanan akan hilang saat `npm run dev:api` dihentikan.

## Prioritas wajib

1. Buat Supabase project, isi `.env.local` dari `.env.example`, lalu buat tabel `products`, `product_variants`, `partners`, `orders`, dan `order_items`.
2. Ganti penyimpanan lokal pada `src/services/orders` dengan repository database. Jangan gunakan service-role key di browser.
3. Lindungi `/admin` dan `/api/admin/*` dengan autentikasi serta role admin. Saat ini dashboard sengaja hanya fondasi UI/API lokal.
4. Sediakan bucket media untuk gambar produk/logo mitra, validasi tipe/ukuran unggahan, lalu simpan URL publik atau signed URL di database.
5. Ganti nomor WhatsApp contoh `6281234567890` pada navbar, hero, dan checkout.
6. Tambahkan payment gateway, ongkir, status pembayaran, audit log, rate limit, dan validasi server untuk produksi.

## Struktur yang dipakai

- `src/features/home`: komposisi beranda dan mitra.
- `src/features/catalog`: kartu produk, katalog beranda, serta halaman `/katalog`.
- `src/features/cart` dan `src/features/checkout`: pintu masuk fitur transaksi; implementasi UI lama masih dire-ekspor saat migrasi bertahap.
- `src/features/admin`: dashboard `/admin`.
- `src/services`: domain data dan API client.
- `src/backend`: Express API lokal untuk katalog, pesanan, portofolio, dan admin.

## Catatan teknis

- Satu produk pada keranjang kini satu baris; pilihan ukuran/varian berbeda digabung sebagai keterangan pada baris tersebut.
- Jangan menghapus folder `src/frontend/(katalog)` sebelum semua komponen yang masih dire-ekspor dipindahkan ke `src/features`. Gunakan pencarian import terlebih dahulu.
