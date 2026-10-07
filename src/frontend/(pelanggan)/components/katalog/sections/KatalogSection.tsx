"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Product } from "@/services/catalog";
import { catalogApi } from "@/services/api";
import { useDebounce } from "@/frontend/(pelanggan)/hooks/useDebounce";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import BestSellerSection from "./BestSellerSection";
import { ProductCard } from "../../product/ProductCard";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export default function KatalogSection() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loadProducts = useCallback(() => catalogApi.getProducts(), []);
  const {
    data: catalogProducts,
    error: catalogError,
    loading: isCatalogLoading,
  } = usePollingResource<Product[]>(loadProducts, []);

  const urlQuery = searchParams.get("q") ?? "";
  const urlKategori = searchParams.get("kategori") ?? "Semua";

  const [searchInput, setSearchInput] = useState(urlQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    // Back/forward navigation updates the input draft from the URL query.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(urlQuery);
  }, [urlQuery]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (urlKategori && urlKategori !== "Semua") params.set("kategori", urlKategori);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}#katalog`, { scroll: false });
  }, [debouncedSearch, pathname, router, urlKategori]);

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
    <section className="py-section-gap-desktop bg-primary-container" id="katalog">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <BestSellerSection products={catalogProducts} />

        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">KATALOG PRODUK</span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 text-on-surface">
              {t("catalogHeading")}
            </h2>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid gap-4 rounded-2xl border border-outline/20 bg-primary-container p-5 shadow-sm md:grid-cols-[1fr_auto]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("searchCatalog")}
                className="w-full rounded-2xl border border-outline/20 bg-surface-container px-12 py-4 text-on-surface placeholder:text-on-surface/40 text-[14px] focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/30 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((kat) => (
                <button
                  key={kat}
                  onClick={() => handleKategoriChange(kat)}
                  className={`px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all ${
                    urlKategori === kat || (kat === "Semua" && !urlKategori)
                      ? "bg-secondary text-primary shadow-sm shadow-secondary/20"
                      : "bg-surface-container border border-outline/20 text-on-surface/70 hover:text-on-surface hover:border-outline"
                  }`}
                >
                  {kat === "Semua" ? t("allCategories") : kat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(urlQuery || (urlKategori && urlKategori !== "Semua")) && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-[13px] text-on-surface/40">
              {filteredProducts.length} {t("foundProducts")}
              {urlQuery && <span> untuk <span className="text-on-surface/70">&ldquo;{urlQuery}&rdquo;</span></span>}
              {urlKategori && urlKategori !== "Semua" && <span> di kategori <span className="text-secondary font-semibold">{urlKategori}</span></span>}
            </p>
            <button
              onClick={resetFilter}
              className="text-[12px] text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              {t("reset")}
            </button>
          </div>
        )}

        {isCatalogLoading ? (
          <div className="py-24 text-center text-on-surface/50">{t("loadingCatalog")}</div>
        ) : catalogError ? (
          <div className="py-24 text-center text-on-surface/50"><p className="mb-4">{catalogError}</p><button onClick={() => window.location.reload()} className="text-secondary font-bold">Coba lagi</button></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {catalogProducts.length === 0 ? (
              <>
                <span className="material-symbols-outlined text-[64px] text-on-surface/20 mb-4">inventory_2</span>
                <p className="text-[16px] font-semibold text-on-surface/50 mb-2">{t("emptyProducts")}</p>
                <p className="text-[13px] text-on-surface/30 mb-6">
                  {t("productsWillAppear")}
                </p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[64px] text-on-surface/20 mb-4">search_off</span>
                <p className="text-[16px] font-semibold text-on-surface/50 mb-2">{t("noMatchingProducts")}</p>
                <p className="text-[13px] text-on-surface/30 mb-6">{t("filterEmpty")}</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
