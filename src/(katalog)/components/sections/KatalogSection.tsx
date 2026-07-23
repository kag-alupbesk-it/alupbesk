"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { products } from "@/data/products";
import { useCart } from "../../checkout/CartContext";
import { useDebounce } from "@/hooks/useDebounce";
import BestSellerSection from "./BestSellerSection";

// Ekstrak kategori unik secara dinamis
const ALL_CATEGORIES = ["Semua", ...Array.from(new Set(products.map((p) => p.category)))];

export default function KatalogSection() {
  const { setDetailProduct, addToCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Baca dari URL
  const urlQuery = searchParams.get("q") ?? "";
  const urlKategori = searchParams.get("kategori") ?? "Semua";

    // State lokal untuk input search (UI responsif saat mengetik)
    const [searchInput, setSearchInput] = useState(urlQuery);

    // Debounce 400ms
    const debouncedSearch = useDebounce(searchInput, 400);

    // Sync input jika URL berubah dari luar (back button)
    useEffect(() => {
      setSearchInput(urlQuery);
    }, [urlQuery]);

    // Update URL saat debouncedSearch berubah — pakai ref untuk skip render pertama
    const isFirstRender = useRef(true);
    useEffect(() => {
      if (isFirstRender.current) { isFirstRender.current = false; return; }
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (urlKategori && urlKategori !== "Semua") params.set("kategori", urlKategori);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}#katalog`, { scroll: false });
    }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handler search
    const handleSearchChange = (value: string) => setSearchInput(value);

    // Ganti kategori langsung (tanpa debounce)
    const handleKategoriChange = useCallback((kategori: string) => {
      const params = new URLSearchParams();
      if (searchInput) params.set("q", searchInput);
      if (kategori !== "Semua") params.set("kategori", kategori);
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}#katalog`, { scroll: false });
    }, [searchInput, pathname, router]);

  // Filter berantai dengan useMemo
  const filteredProducts = useMemo(() => {
    let hasil = products;
    // Level 1: filter kategori
    if (urlKategori && urlKategori !== "Semua") {
      hasil = hasil.filter((p) => p.category === urlKategori);
    }
    // Level 2: filter pencarian
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
  }, [urlQuery, urlKategori]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

    const resetFilter = () => {
    setSearchInput("");
    router.replace(`${pathname}#katalog`, { scroll: false });
  };

  return (
    <section className="py-section-gap-desktop bg-primary" id="katalog">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <BestSellerSection />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">KATALOG PRODUK</span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">
              Komponen Presisi untuk Konstruksi Unggul
            </h2>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search input */}
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

          {/* Filter kategori — dinamis dari data */}
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((kat) => (
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

        {/* Info hasil */}
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

        {/* Grid Katalog */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => setDetailProduct(item)}
                className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/10 cursor-pointer"
              >
                <div className="relative aspect-square">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('${item.img}')` }}
                  />
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                    <span className={`${item.badgeBg} text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                      {item.badge}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-5">
                  <h4 className="text-[13px] sm:text-headline-h3 text-white mb-0.5 sm:mb-1 line-clamp-2 min-h-[34px] sm:min-h-0">{item.title}</h4>
                  <p className="text-secondary font-bold text-[13px] sm:text-label-sm mb-1 sm:mb-2">{formatPrice(item.price)}</p>
                  <p className="text-[11px] sm:text-label-sm text-white/50 mb-2 sm:mb-4 line-clamp-1 hidden sm:block">{item.desc}</p>
                  <div className="hidden sm:flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetailProduct(item); }}
                      className="flex-1 py-3 rounded-lg border border-white/20 text-white group-hover:bg-secondary group-hover:border-secondary group-hover:text-primary transition-all font-bold text-label-sm"
                    >
                      Detail
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (item.variants) { setDetailProduct(item); } else { addToCart(item, 1); } }}
                      className="py-3 px-4 rounded-lg border border-white/20 text-white hover:bg-secondary hover:border-secondary hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
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
