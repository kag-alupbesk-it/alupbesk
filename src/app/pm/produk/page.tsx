"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { catalogApi } from "@/services/api/catalog";
import type { Product } from "@/services/catalog";

export default function PMProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void catalogApi.getProducts()
      .then((data) => { if (active) setProducts(data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Katalog gagal dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return products.filter((product) => !query || [product.title, product.sku, product.category].some((value) => value.toLocaleLowerCase("id-ID").includes(query)));
  }, [products, search]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Project Manager</p>
        <h1 className="mt-2 text-2xl font-extrabold text-on-surface">Katalog Produk</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Informasi produk dan stok terkini dari katalog website.</p>
      </header>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-outline/30 bg-surface-container-low px-4">
        <Search size={17} aria-hidden="true" />
        <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, SKU, atau kategori" />
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-500">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-outline/30 bg-surface-container-low">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-outline/20 text-xs text-on-surface-variant"><tr><th className="px-4 py-3">Produk</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3 text-right">Stok</th><th className="px-4 py-3 text-right">Harga</th></tr></thead>
          <tbody className="divide-y divide-outline/15">
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">Memuat katalog...</td></tr>
              : visibleProducts.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">{products.length ? "Produk tidak ditemukan." : "Belum ada produk di katalog."}</td></tr>
                : visibleProducts.map((product) => <tr key={product.id}><td className="px-4 py-3 font-semibold">{product.title}</td><td className="px-4 py-3 text-on-surface-variant">{product.sku}</td><td className="px-4 py-3">{product.category}</td><td className="px-4 py-3 text-right">{product.stock}</td><td className="px-4 py-3 text-right">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </main>
  );
}
