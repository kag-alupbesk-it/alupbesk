# Analisis: Penanganan Bahan Mentah (Aluminium Utuh) dan Pemotongan (Cutting/BOM)

## Kondisi Saat Ini
Sistem yang ada saat ini berfokus pada **manajemen stok berbasis master item (unit-based)**, bukan pada manajemen bahan baku yang dipotong menjadi beberapa komponen.

### Yang Sudah Ada
- **Master Stok Gudang** (`GudangInventoryItem`): Mencatat barang per item dengan `currentStock`. Cocok untuk barang jadi atau komponen yang sudah memiliki satuan tetap.
- **Permintaan Produksi** (`ProductionRequest`): Alur Produksi → mengajukan daftar material (berdasarkan `itemId`) → Gudang ACC → otomatis mencatat Barang Keluar dengan sumber `produksi`. Stok master item langsung berkurang.
- **PM (Production Management)**: Sudah ada alur order PM, namun belum ada entitas BOM/Cutting List.

### Yang Belum Ada
- **Bill of Materials (BOM)**: Belum terdapat modul/tabel untuk mendefinisikan relasi "bahan baku → hasil potong/komponen".
- **Cutting/Pemotongan**: Belum ada logika untuk menghitung kebutuhan bahan utuh, sisa potong (scrap/offs-cut), yield, atau optimasi pemotongan.
- **Parent-Child/Recipe Material**: Sistem saat ini bersifat 1 baris = 1 master item. Tidak ada konsep bahwa 1 buah bahan utuh (sheet/rod/batang) dapat dipakai untuk menghasilkan beberapa item hasil potong dengan ukuran berbeda.

## Kasus Penggunaan: Aluminium Utuh → Dipotong
Contoh kasus: Perusahaan membeli aluminium utuh (batangan/sheet/plat), kemudian dipotong menjadi berbagai ukuran sesuai kebutuhan produksi/SPK.

**Kebutuhan fungsional yang muncul:**
1. **Pencatatan bahan baku** sebagai master item terpisah (satuan bisa batang, lembar, meter, kg, dll.)
2. **BOM/Cutting List** per SPK untuk mendefinisikan komponen hasil potong beserta ukurannya
3. **Perhitungan pemakaian bahan baku** otomatis berdasarkan daftar potongan
4. **Pencatatan sisa potong (scrap)** — apakah disimpan sebagai stok terpisah atau dianggap waste
5. **Alur permintaan material**: bisa mengajukan bahan baku utuh ke Gudang, lalu setelah dipotong hasilnya dicatat masuk stok

## Kemungkinan Implementasi dengan Sistem Saat Ini

### Bisa (Workaround Manual)
- Daftarkan **bahan utuh** sebagai master item di Gudang (dengan satuan & stoknya).
- Daftarkan **hasil potong** sebagai master item terpisah (jika hasil potong ingin dikelola stoknya).
- Produksi mengajukan permintaan bahan utuh via **Pengajuan Gudang**. Gudang ACC → stok bahan utuh berkurang.
- Setelah proses pemotongan, Produksi/Admin Gudang melakukan **Barang Masuk** manual untuk item hasil potong, dan bisa melakukan **penyesuaian stok (adjustment)** untuk mencatat scrap jika diperlukan.

**Kelemahan:** Tidak otomatis menghitung kebutuhan bahan utuh, jumlah potongan optimal, maupun sisa (scrap).

### Belum Bisa (Perlu Fitur Baru)
- **BOM per SPK/Job**: Menghitung total kebutuhan bahan baku dari daftar komponen secara otomatis.
- **Cutting Plan**: Menghitung berapa unit bahan utuh yang dibutuhkan untuk memenuhi beberapa potongan dengan ukuran berbeda (termasuk memperhitungkan panjang sisa).
- **Auto-Issue Material**: Dari BOM → bisa otomatis menghasilkan Pengajuan Gudang untuk bahan baku yang dibutuhkan.
- **Yield/Scrap Tracking Terstandar**: Pencatatan sisa potong terstruktur (bisa dialokasikan sebagai scrap, retur material, atau stok reuse).

## Kesimpulan

**Saat ini sistem belum memiliki modul BOM/Cutting List.**

Untuk kebutuhan sederhana ("minta bahan mentah → potong → catat hasil potong"), **workaround manual bisa dilakukan** dengan sistem yang ada (master item terpisah + pengajuan gudang + barang masuk manual).

Namun, untuk kebutuhan yang mengharuskan **otomatisasi perhitungan pemotongan (bahan utuh → beberapa potongan + sisa)**, diperlukan **penambahan modul baru** berupa:
- **BOM (Bill of Materials)**
- **Material Requirements Planning (MRP) sederhana** berbasis SPK
- **Cutting Plan/List** dengan pencatatan scrap

## Pertanyaan Klarifikasi (Untuk Perencanaan Lebih Lanjut)
1. Apakah hasil potong ingin **disimpan sebagai master item terpisah** (stok terkelola terpisah dari bahan utuh)?
2. Apakah perlu mencatat **sisa potong (scrap)** sebagai stok (bisa dipakai ulang/dijual)?
3. Apakah tiap SPK membutuhkan **BOM terpisah** yang bisa menghasilkan pengajuan bahan baku otomatis?
4. Tingkat otomatisasi yang diinginkan: **hanya pencatatan manual**, atau **perhitungan kebutuhan bahan utuh otomatis + optimasi pemotongan**?
