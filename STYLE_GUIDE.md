# Style Guide & Coding Conventions

Dokumentasi ini mendefinisikan pola arsitektur, konvensi kode, dan standar kerapian yang digunakan dalam project ini. Setiap perubahan atau penambahan fitur harus mengikuti panduan ini agar kode tetap konsisten dan mudah dipelihara.

---

## Prinsip Arsitektur

### Layer Separation

Project ini menggunakan pemisahan layer yang jelas:

```
src/
├── app/              # Next.js App Router (pages & API routes)
├── features/         # Page-level feature components
├── frontend/         # UI components per feature group
├── services/         # Business logic & data fetching
└── backend/          # Express API modules
```

**Aturan:**
- **Services layer** hanya berisi logic domain dan data fetching. Tidak ada JSX atau React components di sini.
- **Features layer** adalah entry point untuk halaman kompleks, mengomposisi komponen dari `frontend/`.
- **Frontend layer** berisi komponen UI yang bisa di-reuse, dikelompokkan berdasarkan feature group (katalog, owner, dll).
- **Backend layer** menggunakan Express router pattern dengan structure per module.

### Route Groups

Gunakan route groups untuk memisahkan konteks aplikasi:

- `(katalog)/` — halaman publik (katalog, portofolio, keranjang, checkout)
- `(owner)/` — dashboard pemilik (inventory, financials, users, reports)
- `admin/` — panel admin

**Konvensi:**
- Route group tidak muncul di URL path
- Setiap route group bisa punya `layout.tsx` dan komponen shared sendiri
- Jangan campur komponen dari route group berbeda tanpa alasan jelas

---

## File & Folder Naming

### Konvensi Penamaan

- **Components**: PascalCase — `CartDrawer.tsx`, `ProductCard.tsx`
- **Utilities & Services**: camelCase — `orderStore.ts`, `getCatalogProducts.ts`
- **Folders**: kebab-case atau snake_case — `services/orders/`, `frontend/(katalog)/`
- **Route Groups**: huruf kecil dalam kurung — `(katalog)/`, `(owner)/`

### File Organization

Struktur folder module harus mengikuti pola ini:

```
services/orders/
├── index.ts              # Public API exports
├── types.ts              # Type definitions
├── orderStore.ts         # Core logic
├── createLocalOrder.ts   # Individual functions
├── getLocalOrders.ts
└── ...
```

**Aturan:**
- `index.ts` hanya untuk re-export, tidak ada logic
- Satu file = satu tanggung jawab (single responsibility)
- Type definitions dipisah di `types.ts` jika dipakai di banyak tempat
- Hindari file `utils.ts` atau `helpers.ts` yang jadi tempat sampah — beri nama spesifik sesuai fungsinya

---

## React & TypeScript Conventions

### Component Structure

Urutan deklarasi dalam component file:

```typescript
// 1. Imports
import { useState, useEffect } from "react";
import type { Product } from "@/services/catalog";

// 2. Type definitions
interface CartItem {
  product: Product;
  quantity: number;
  note: string;
}

// 3. Helper functions (jika ada)
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

// 4. Main component
export function CartDrawer() {
  // hooks
  const [items, setItems] = useState<CartItem[]>([]);
  
  // derived state
  const total = calculateTotal(items);
  
  // effects
  useEffect(() => {
    // ...
  }, []);
  
  // event handlers
  const handleRemove = (id: number) => {
    // ...
  };
  
  // render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Hooks Best Practices

**useEffect:**
- Hindari `useEffect` untuk derived state — gunakan `useMemo` atau computed values
- Jika ada komentar `eslint-disable-next-line react-hooks/set-state-in-effect`, pastikan ada alasan jelas (contoh: hydration dari localStorage)

**useState:**
- Gunakan functional updates (`setState(prev => ...)`) untuk state yang bergantung pada nilai sebelumnya
- Hindari state yang bisa dihitung dari state lain

**Custom Hooks:**
- Prefix dengan `use` — `useCart()`, `useDebounce()`
- Return object dengan destructuring untuk fleksibilitas: `{ items, addToCart, totalPrice }`

### Context Pattern

Jika membuat Context, ikuti pola ini:

```typescript
// 1. Type definition
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty: number) => void;
  // ... other methods
}

// 2. Context creation dengan undefined default
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  // implementation
  return (
    <CartContext.Provider value={...}>
      {children}
    </CartContext.Provider>
  );
}

// 4. Custom hook dengan error handling
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
```

---

## Code Quality Standards

### Comments

Tulis komentar dalam **Bahasa Indonesia** dan jelaskan **mengapa**, bukan **apa**:

```typescript
// ❌ Bad: menjelaskan apa yang sudah jelas dari kode
// Loop semua items di cart
items.forEach(item => { ... });

// ✅ Good: menjelaskan reasoning atau context
// Satu produk tetap satu baris walaupun pembeli memilih ukuran berbeda.
// Detail pilihan varian digabungkan dan ditampilkan sebagai keterangan pada item.
function itemKey(productId: number, variants?: Record<string, string>): string {
  void variants;
  return String(productId);
}
```

**Kapan harus ada komentar:**
- Business logic yang tidak obvious
- Workaround untuk bug atau limitation library
- Algoritma yang kompleks
- Decision trade-offs (kenapa pilih approach A daripada B)

### Naming Conventions

**Variables & Functions:**
```typescript
// ✅ Descriptive & clear
const totalPrice = calculateOrderTotal(items);
const isCartEmpty = items.length === 0;

// ❌ Vague
const data = getStuff();
const flag = check();
```

**Boolean variables:** prefix dengan `is`, `has`, `should`, `can`
```typescript
const isLoading = true;
const hasError = false;
const shouldValidate = true;
```

**Event handlers:** prefix dengan `handle`
```typescript
const handleSubmit = () => { ... };
const handleQuantityChange = (qty: number) => { ... };
```

### Type Safety

- Hindari `any` — gunakan `unknown` jika tipe benar-benar tidak diketahui
- Prefer interfaces untuk object types, type aliases untuk unions/intersections
- Export types yang dipakai di banyak tempat dari file `types.ts`

```typescript
// ✅ Explicit types
interface Product {
  id: number;
  title: string;
  price: number;
}

// ✅ Type inference OK untuk simple cases
const count = 0; // inferred as number

// ❌ Avoid
const product: any = { ... };
```

---

## State Management Patterns

### Local State vs Context

**Gunakan `useState` jika:**
- State hanya dipakai dalam satu component
- State tidak perlu di-share ke child components

**Gunakan Context jika:**
- State dipakai di banyak component yang tidak related
- Ingin hindari prop drilling
- Contoh: `CartContext`, theme, auth state

**Gunakan props jika:**
- Data flow jelas (parent → child)
- Component reusability penting

### Data Fetching Pattern

Project ini menggunakan service layer untuk data fetching:

```typescript
// src/services/catalog/getCatalogProducts.ts
export async function getCatalogProducts(): Promise<Product[]> {
  // Implementation
}

// Usage in component
import { getCatalogProducts } from "@/services/catalog";

function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    getCatalogProducts().then(setProducts);
  }, []);
  
  // render
}
```

**Aturan:**
- Service functions tidak boleh memanggil React hooks
- Error handling di service layer, bukan di component
- Return type harus explicit

---

## Backend Conventions

### Express Router Pattern

```typescript
// src/backend/modules/(katalog)/catalog/router.ts
import { Router } from "express";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const products = await getCatalogProducts();
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
```

**Aturan:**
- Setiap module punya router sendiri di `router.ts`
- Error handling konsisten: try-catch dengan appropriate HTTP status
- Response format konsisten: `{ data: ..., error?: ... }`

### In-Memory Store Pattern

Untuk development, gunakan Map-based store dengan interface yang siap diganti:

```typescript
// orderStore.ts
const orders = new Map<string, LocalOrder>();

export function readOrder(id: string): LocalOrder | undefined {
  return orders.get(id);
}

export function writeOrder(order: LocalOrder): void {
  orders.set(order.id, order);
}
```

**Catatan:** Interface ini dirancang agar mudah diganti dengan database client (Supabase, Prisma, dll) tanpa mengubah kode yang memanggil.

---

## Import Conventions

### Path Aliases

Gunakan `@/` prefix untuk import dari `src/`:

```typescript
// ✅ Good
import { useCart } from "@/features/cart/CartContext";
import { products } from "@/services/catalog";

// ❌ Avoid relative paths yang panjang
import { useCart } from "../../../features/cart/CartContext";
```

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Internal absolute imports
import { useCart } from "@/features/cart/CartContext";
import type { Product } from "@/services/catalog";

// 3. Relative imports (jika diperlukan)
import { ProductCard } from "./ProductCard";

// 4. Styles
import "./styles.css";
```

---

## Performance Best Practices

### Memoization

```typescript
// ✅ Memo untuk expensive calculations
const totalPrice = useMemo(
  () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [items]
);

// ✅ useCallback untuk functions yang di-pass ke child components
const handleAdd = useCallback((product: Product) => {
  addToCart(product, 1);
}, [addToCart]);
```

### Avoid Premature Optimization

- Jangan memo-kan everything — profile dulu
- `useMemo` dan `useCallback` punya cost sendiri
- Prioritaskan readability over performance kecuali ada bottleneck nyata

---

## Security & Data Handling

### Client vs Server

**Jangan pernah:**
- Taruh service-role keys atau secrets di client-side code
- Ekspos API keys di environment variables yang accessible dari browser
- Trust user input tanpa validation

**Selalu:**
- Validasi input di server
- Sanitize data sebelum render atau simpan ke database
- Gunakan proper auth checks untuk protected routes

### localStorage Pattern

```typescript
// Hydration-safe pattern
useEffect(() => {
  const saved = localStorage.getItem("key");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setState(parsed);
    } catch {
      // Handle corrupt data
    }
  }
  setHydrated(true);
}, []);

// Save after hydration
useEffect(() => {
  if (!hydrated) return;
  localStorage.setItem("key", JSON.stringify(state));
}, [state, hydrated]);
```

---

## Migration & Technical Debt

### Handling Legacy Code

Project ini sedang dalam migrasi dari `src/frontend/(katalog)/` ke `src/features/`. Aturan:

1. **Jangan hapus folder lama** sebelum semua import dipindahkan
2. **Gunakan re-export** di `src/features/` untuk backward compatibility
3. **Update import paths** secara bertahap
4. **Dokumentasikan** progress migrasi di comments atau TODO

```typescript
// src/features/cart/CartContext.tsx
// Kontrak keranjang ditempatkan pada folder fitur agar seluruh layar cart/checkout memakai sumber yang sama.
export * from "@/frontend/(katalog)/checkout/CartContext";
```

### TODO & FIXME Comments

```typescript
// TODO: Migrate to Supabase after schema is ready
// FIXME: Race condition when multiple users update stock simultaneously
// HACK: Temporary workaround for Next.js hydration issue — remove after upgrade
```

---

## Testing (Future)

Placeholder untuk testing conventions ketika test framework sudah disetup:

- Unit tests untuk services & utility functions
- Integration tests untuk API routes
- E2E tests untuk critical user flows (checkout, order)

---

## Summary Checklist

Sebelum commit, pastikan:

- [ ] File structure mengikuti layer separation
- [ ] Naming conventions konsisten
- [ ] Types explicit, tidak ada `any`
- [ ] Comments menjelaskan "why", bukan "what"
- [ ] Import paths menggunakan `@/` alias
- [ ] Tidak ada secrets atau keys di client code
- [ ] Code bisa di-compile tanpa error TypeScript
- [ ] Tidak ada console.log yang tertinggal (kecuali untuk debugging intended)

---

**Catatan Akhir:** Style guide ini bukan hukum yang kaku. Jika ada case yang tidak tercakup atau butuh exception, diskusikan dulu reasoning-nya. Konsistensi lebih penting daripada perfection.