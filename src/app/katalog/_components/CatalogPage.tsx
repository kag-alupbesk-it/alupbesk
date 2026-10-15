"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { catalogApi } from "@/services/api/index";
import type { Product } from "@/services/catalog/index";
import { ProductCard } from "@/frontend/(pelanggan)/components/product/index";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  useEffect(() => {
    let active = true;
    catalogApi.getProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((reason: unknown) => {
        if (active) setLoadError(reason instanceof Error ? reason.message : "Katalog gagal dimuat.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["Semua", ...new Set(products.map((product) => product.category))],
    [products],
  );
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return products.filter((product) =>
      (category === "Semua" || product.category === category) &&
      `${product.title} ${product.sku} ${product.desc}`
        .toLocaleLowerCase("id-ID")
        .includes(normalizedQuery),
    );
  }, [products, query, category]);

  return (
    <main className="min-h-screen bg-primary-container pb-16 pt-28">
      <div className="mx-auto max-w-container-max px-margin-x-mobile md:px-margin-x-desktop">
        <Link href="/catalog" className="text-sm font-bold text-secondary">← Kembali ke beranda</Link>
        <h1 className="mt-5 text-headline-h1 font-headline-h1 text-on-surface">Katalog Produk</h1>

        <div className="my-8 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari produk atau SKU..."
            aria-label="Cari produk atau SKU"
            className="flex-1 rounded-xl border border-outline/30 bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface/35 focus:border-secondary focus:outline-none"
          />
          <div className="flex flex-wrap gap-2" aria-label="Kategori produk">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`rounded-xl px-3 py-2 text-xs font-bold ${category === item ? "bg-secondary text-primary" : "border border-outline/30 text-on-surface/70"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loadError ? (
          <p role="alert" className="py-24 text-center text-sm text-red-400">Katalog gagal dimuat: {loadError}</p>
        ) : isLoading ? (
          <p className="py-24 text-center text-on-surface/50">Memuat katalog produk...</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined mb-4 text-[64px] text-on-surface/20">inventory_2</span>
            <p className="text-[16px] font-semibold text-on-surface/50">Produk masih kosong</p>
            <p className="text-[13px] text-on-surface/30">Belum ada produk yang ditambahkan. Katalog akan tampil setelah produk tersedia.</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="py-24 text-center text-on-surface/50">Produk tidak ditemukan.</p>
        ) : (
          <>
            <p className="mb-5 text-sm text-on-surface/50">{visibleProducts.length} produk ditemukan</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
        {!isLoading && !loadError && (
          <div className="mt-16 rounded-2xl border border-outline/20 bg-surface-container p-8 md:p-12 text-center shadow-sm">
            <h3 className="text-[24px] font-bold text-on-surface mb-3">
              Punya Proyek Serupa?
            </h3>
            <p className="text-on-surface/60 text-[14px] mt-2 max-w-xl mx-auto leading-relaxed">
              Ceritakan kebutuhan Anda dan kami akan bantu wujudkan dengan material terbaik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link
                href="/catalog/jasa-custom"
                className="px-8 py-3.5 bg-secondary text-primary font-bold rounded-xl hover:brightness-110 transition-all text-[14px]"
              >
                Request Custom Quote
              </Link>
              <Link
                href="/catalog#kontak"
                className="px-8 py-3.5 border border-outline text-on-surface font-bold rounded-xl hover:border-on-surface/40 transition-all text-[14px]"
              >
                Hubungi Tim Kami
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
