"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Product } from "@/services/catalog";
import { catalogApi } from "@/services/api";
import { useDebounce } from "@/frontend/(pelanggan)/hooks/useDebounce";
import BestSellerSection from "./BestSellerSection";
import { ProductCard } from "../../product/ProductCard";

export default function KatalogSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isCatalogLoading, setCatalogLoading] = useState(true);

  const urlQuery = searchParams.get("q") ?? "";
  const urlKategori = searchParams.get("kategori") ?? "Semua";

  const [searchInput, setSearchInput] = useState(urlQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    let isActive = true;
    catalogApi.getProducts()
      .then((data) => { if (isActive) setCatalogProducts(data); })
      .catch((error) => { if (isActive) setCatalogError(error instanceof Error ? error.message : "Katalog gagal dimuat."); })
      .finally(() => { if (isActive) setCatalogLoading(false); });
    return () => { isActive = false; };
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (urlKategori && urlKategori !== "Semua") params.set("kategori", urlKategori);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}#katalog`, { scroll: false });
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => setSearchInput(value);

  const handleKategoriChange = useCallback((kategori: string) => {
    const params = new URLSearchParams();
    if (searchInput) params.set("q", searchInput);
    if (kategori !== "Semua") params.set("kategori", kategori);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}#katalog`, { scroll: false });
  }, [searchInput, pathname, router]);

  const filteredProducts = useMemo(() => {
    let hasil = catalogProducts;
    if (urlKategori && urlKategori !== "Semua") {
      hasil = hasil.filter((p) => p.category === urlKategori);
    }
    if (urlQuery.trim()) {
      const q = urlQuery.toLowerCase();
      hasil = hasil.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    return hasil;
  }, [catalogProducts, urlQuery, urlKategori]);

  const categories = ["Semua", ...Array.from(new Set(catalogProducts.map((product) => product.category)))];

  const resetFilter = () => {
    setSearchInput("");
    router.replace(`${pathname}#katalog`, { scroll: false });
  };

  return (
    <section className="py-section-gap-desktop bg-primary" id="katalog">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <BestSellerSection />

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">KATALOG PRODUK</span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">
              Komponen Presisi untuk Konstruksi Unggul
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari produk, SKU, atau deskripsi..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30 text-[14px] focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/30 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((kat) => (
              <button
                key={kat}
                onClick={() => handleKategoriChange(kat)}
                className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  urlKategori === kat || (kat === "Semua" && !urlKategori)
                    ? "bg-secondary text-primary"
                    : "bg-white/5 border border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        {(urlQuery || (urlKategori && urlKategori !== "Semua")) && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-[13px] text-white/40">
              {filteredProducts.length} produk ditemukan
              {urlQuery && <span> untuk <span className="text-white/70">&ldquo;{urlQuery}&rdquo;</span></span>}
              {urlKategori && urlKategori !== "Semua" && <span> di kategori <span className="text-secondary font-semibold">{urlKategori}</span></span>}
            </p>
            <button
              onClick={resetFilter}
              className="text-[12px] text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Reset
            </button>
          </div>
        )}

        {isCatalogLoading ? (
          <div className="py-24 text-center text-white/50">Memuat katalog produk...</div>
        ) : catalogError ? (
          <div className="py-24 text-center text-white/50"><p className="mb-4">{catalogError}</p><button onClick={() => window.location.reload()} className="text-secondary font-bold">Coba lagi</button></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[64px] text-white/20 mb-4">search_off</span>
            <p className="text-[16px] font-semibold text-white/50 mb-2">Produk tidak ditemukan</p>
            <p className="text-[13px] text-white/30 mb-6">
              Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih.
            </p>
            <button
              onClick={resetFilter}
              className="px-6 py-3 rounded-xl bg-secondary text-primary font-bold text-[13px] hover:brightness-110 transition-all"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
