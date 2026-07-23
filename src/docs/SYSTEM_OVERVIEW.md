# ALUPBESK — System Overview

> Dokumentasi arsitektur dan alur sistem e-commerce berbasis WhatsApp.  
> Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS · React Context API

---

## 1. Ringkasan Proyek

ALUPBESK adalah aplikasi e-commerce B2B untuk produk aluminium dan komponen industrial. Sistem ini **tidak menggunakan payment gateway**. Alih-alih, proses pemesanan di-*routing* langsung ke WhatsApp dengan pesan yang terformat otomatis — mencakup daftar item, spesifikasi custom per item, dan total harga.

Pendekatan ini dipilih karena:
- Tidak membutuhkan infrastruktur backend untuk transaksi
- Negosiasi harga & ongkir fleksibel melalui chat
- Cocok untuk segmen B2B yang terbiasa komunikasi langsung

---

## 2. Arsitektur State Management

### CartContext (`src/(katalog)/components/contexts/CartContext.tsx`)

Seluruh state keranjang dikelola oleh satu Context yang di-*provide* di root layout (`src/app/layout.tsx`), sehingga bisa diakses dari semua halaman — termasuk `/keranjang` dan `/checkout`.

```
CartProvider (root layout)
├── items: CartItem[]          ← array produk + qty + catatan per item
├── totalItems: number         ← dihitung dengan useMemo
├── totalPrice: number         ← dihitung dengan useMemo
├── addToCart()                ← dengan validasi stok
├── removeFromCart()
├── updateQuantity()           ← dengan validasi & clamp ke stok max
├── updateNote()               ← catatan custom per item
├── clearCart()
├── showToast()                ← sistem notifikasi internal
├── detailProduct              ← state untuk modal detail produk
└── setDetailProduct()
```

### Optimasi Performa

- `totalItems` dan `totalPrice` menggunakan `useMemo` — tidak dihitung ulang kecuali `items` berubah
- `addToCart`, `updateQuantity`, `updateNote`, dll. menggunakan `useCallback` — referensi fungsi stabil antar render

### Persistensi LocalStorage

State `items` disinkronkan dua arah dengan `localStorage`:

1. **Rehidrasi (mount)** — `useEffect` membaca `localStorage` setelah komponen mount di client, bukan di `useState` initializer (mencegah hydration mismatch)
2. **Simpan (setiap perubahan)** — `useEffect` kedua menulis ke `localStorage` setiap kali `items` berubah, tapi hanya setelah flag `hydrated` bernilai `true`

---

## 3. Alur Pengguna (User Journey)

### 3a. Katalog & Pencarian

**File:** `src/(katalog)/components/sections/KatalogSection.tsx`  
**Hook:** `src/hooks/useDebounce.ts`

```
User buka halaman /
    │
    ▼
KatalogSection render semua products
    │
    ├── User ketik di search box
    │       │
    │       ├── searchInput (state lokal) update setiap keystroke → UI responsif
    │       │
    │       └── useDebounce(searchInput, 400ms)
    │               │
    │               └── setelah 400ms berhenti mengetik
    │                       │
    │                       └── router.replace() update URL (?q=...)
    │
    ├── User klik tombol kategori
    │       │
    │       └── router.replace() update URL (?kategori=...)
    │
    └── useMemo filter berantai
            ├── Level 1: filter berdasarkan urlKategori
            └── Level 2: filter berdasarkan urlQuery (title + desc + sku)
```

**Keunggulan URL Search Params:**
- Link hasil pencarian bisa dibagikan (`/?q=linear+rail&kategori=SISTEM+LINIER`)
- Tombol Back browser memulihkan state filter
- Tidak ada state yang hilang saat refresh

**Daftar kategori** diekstrak secara dinamis dari `products.ts` menggunakan `Set` — tidak di-*hardcode*, sehingga kategori baru otomatis muncul saat data produk ditambah.

---

### 3b. Detail Produk

**File:** `src/(katalog)/components/ui/ProductDetailModal.tsx`

```
User klik tombol "Detail" di kartu produk
    │
    └── setDetailProduct(item) → ProductDetailModal terbuka
            │
            ├── Tampil: gambar, SKU, badge stok dinamis, deskripsi
            ├── Tampil: Keunggulan Produk (highlights[])
            ├── Tampil: Tabel Spesifikasi (specs[])
            ├── Input quantity (bisa ketik manual, max = product.stock)
            └── Klik "Tambah ke Keranjang"
                    │
                    └── addToCart(product, quantity)
                            ├── Validasi stok → tampilkan toast error jika melebihi
                            └── Toast sukses → modal tutup
```

---

### 3c. Manajemen Keranjang

**File:** `src/app/keranjang/page.tsx`

```
User klik ikon 🛒 di Navbar
    │
    └── Link → /keranjang
            │
            ├── [Kosong] Empty state + tombol "Lihat Katalog"
            │
            └── [Ada item]
                    ├── Kartu per item:
                    │       ├── Gambar + nama + SKU + badge stok
                    │       ├── Harga satuan (@ Rp X / pcs) — muted
                    │       ├── Input quantity:
                    │       │       ├── Tombol -/+ atau ketik manual
                    │       │       ├── Validasi: hanya angka, max = stock
                    │       │       └── onBlur kosong/0 → kembalikan ke 1
                    │       ├── Subtotal menonjol di kanan
                    │       ├── Field catatan item (spesifikasi custom)
                    │       └── Tombol hapus (hover merah)
                    │
                    ├── Tombol "Kosongkan" (di bawah list)
                    │       └── Konfirmasi 2 langkah sebelum eksekusi
                    │
                    └── Panel Ringkasan (sticky kanan)
                            ├── Rincian per item
                            ├── Subtotal + Estimasi Ongkir
                            ├── Total (*belum termasuk ongkir)
                            ├── Tombol "Checkout Sekarang" → /checkout
                            ├── Tombol "Lanjut Belanja" → /#katalog
                            └── Trust badges
```

---

### 3d. Checkout

**File:** `src/app/checkout/page.tsx`

```
User klik "Checkout Sekarang"
    │
    └── Navigasi ke /checkout
            │
            ├── [Keranjang kosong] → Empty state + link kembali ke /keranjang
            │
            └── [Ada item]
                    ├── Form Data Pemesan:
                    │       ├── Nama Lengkap * (wajib)
                    │       ├── Email (opsional)
                    │       ├── No. Telepon/WA * (wajib)
                    │       ├── Alamat Pengiriman * (wajib)
                    │       └── Catatan Umum (opsional)
                    │
                    ├── Panel Ringkasan (sticky kanan):
                    │       ├── Foto + nama + harga satuan × qty per item
                    │       ├── Catatan per item (jika ada)
                    │       ├── Subtotal + Ongkir (dihitung setelah konfirmasi)
                    │       ├── Total (*belum termasuk ongkir)
                    │       ├── Tombol "Pesan via WhatsApp" (disabled jika form belum lengkap)
                    │       ├── Teks: "Admin akan konfirmasi total + ongkir sebelum pembayaran"
                    │       └── Trust badges
                    │
                    └── User klik "Pesan via WhatsApp"
                            │
                            ├── generateWhatsAppLink():
                            │       ├── Format daftar item (nama × qty = subtotal)
                            │       ├── Sertakan catatan per item jika ada
                            │       ├── Total harga
                            │       └── Data form (nama, email, telp, alamat, catatan umum)
                            │
                            ├── window.open(wa.me/..., "_blank")
                            ├── clearCart()
                            └── router.push("/")
```

---

## 4. Penanganan Edge Cases

### 4a. Hydration Mismatch (SSR vs Client)

**Masalah:** Next.js me-render HTML di server. Jika `useState` langsung membaca `localStorage` (yang hanya ada di browser), HTML server berbeda dengan HTML client → React error.

**Solusi:**
```typescript
// ❌ Salah — bisa menyebabkan hydration mismatch
const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') ?? '[]'));

// ✅ Benar — mulai dari array kosong, rehidrasi setelah mount
const [items, setItems] = useState<CartItem[]>([]);
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  // Hanya berjalan di client setelah mount
  const saved = localStorage.getItem('cart');
  if (saved) setItems(JSON.parse(saved));
  setHydrated(true);
}, []);

// Sync ke localStorage hanya setelah hydrated
useEffect(() => {
  if (!hydrated) return;
  localStorage.setItem('cart', JSON.stringify(items));
}, [items, hydrated]);
```

---

### 4b. Stale Data (Data Kadaluarsa di LocalStorage)

**Masalah:** User memasukkan produk ke keranjang hari ini. Besoknya harga naik atau stok habis, tapi localStorage masih menyimpan data lama.

**Solusi:** Saat rehidrasi, setiap item divalidasi ulang terhadap `products.ts` terbaru:

```typescript
const validated = parsed
  .map((item) => {
    const fresh = products.find((p) => p.id === item.product.id);
    if (!fresh) return null;                          // produk dihapus dari katalog
    const clampedQty = Math.min(item.quantity, fresh.stock);
    if (clampedQty <= 0) return null;                 // stok habis
    return { ...item, product: fresh, quantity: clampedQty }; // harga & data terbaru
  })
  .filter(Boolean) as CartItem[];
```

---

### 4c. Spam Toast Notification

**Masalah:** User klik "Tambah ke Keranjang" 10 kali cepat → 10 toast muncul bersamaan, UI penuh notifikasi.

**Solusi:** Sistem antrian toast dengan 3 aturan:
1. **Deduplicate** — pesan yang sama tidak ditampilkan dua kali
2. **Max 3 toast** — jika sudah 3, toast tertua dibuang
3. **Auto-dismiss** — setiap toast hilang otomatis setelah 3 detik

```typescript
const showToast = useCallback((message: string, type = "success") => {
  setToasts((prev) => {
    if (prev.some((t) => t.message === message && t.type === type)) return prev; // deduplicate
    const trimmed = prev.length >= 3 ? prev.slice(-2) : prev;                   // max 3
    const id = ++toastId;
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);    // auto-dismiss
    return [...trimmed, { id, message, type }];
  });
}, []);
```

---

### 4d. Input Quantity Ekstrem

**Masalah:** User mengetik `0`, string kosong `""`, huruf `"abc"`, atau angka melebihi stok di input quantity keranjang.

**Solusi:** Kombinasi tiga lapis proteksi:

| Kondisi | Penanganan |
|---|---|
| Karakter non-angka | Di-*strip* dengan `replace(/[^0-9]/g, "")` saat `onChange` |
| Input kosong saat mengetik | Dibiarkan kosong sementara (state `qtyInputs` terpisah) |
| Blur dengan nilai kosong/0 | Otomatis dikembalikan ke `1` |
| Angka melebihi stok | Di-*clamp* ke `product.stock`, toast error ditampilkan |

---

## 5. Struktur File

```
src/
├── app/
│   ├── layout.tsx              ← CartProvider di-provide di sini (global)
│   ├── page.tsx                ← Halaman utama (landing + katalog)
│   ├── keranjang/
│   │   └── page.tsx            ← Halaman keranjang belanja
│   └── checkout/
│       └── page.tsx            ← Halaman checkout + WhatsApp generator
│
├── (katalog)/components/
│   ├── contexts/
│   │   └── CartContext.tsx     ← State management global
│   ├── sections/
│   │   └── KatalogSection.tsx  ← Grid produk + search + filter
│   ├── ui/
│   │   ├── ProductDetailModal.tsx  ← Modal detail produk
│   │   └── CartIcon.tsx            ← Ikon keranjang di navbar
│   └── layout/
│       └── Navbar.tsx
│
├── data/
│   └── products.ts             ← Source of truth data produk
│
└── hooks/
    └── useDebounce.ts          ← Custom hook debounce reusable
```

---

## 6. Data Produk (`products.ts`)

Setiap produk memiliki struktur berikut:

```typescript
interface Product {
  id: number;
  badge: string;        // "In Stock" | "Limited"
  badgeBg: string;      // Tailwind class untuk warna badge
  category: string;     // Dipakai untuk filter dinamis
  title: string;
  desc: string;
  price: number;        // dalam Rupiah
  stock: number;        // batas maksimal quantity di keranjang
  img: string;          // URL gambar
  sku: string;          // Kode produk unik
  highlights: string[]; // Poin keunggulan produk
  specs: { label: string; value: string }[]; // Tabel spesifikasi
}
```

---

*Dokumentasi ini dibuat berdasarkan kondisi kode pada saat penulisan. Perbarui dokumen ini setiap kali ada perubahan arsitektur signifikan.*