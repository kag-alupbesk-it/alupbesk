"use client";

import { useState } from "react";
import Navbar from "@/app/(katalog)/components/layout/Navbar";
import Footer from "@/app/(katalog)/components/layout/Footer";
import ProductDetailModal from "@/app/(katalog)/components/ui/ProductDetailModal";
import CartDrawer from "@/app/(katalog)/components/ui/CartDrawer";
import { products, Product } from "@/data/products";
import { useCart } from "@/app/(katalog)/components/contexts/CartContext";

const categories = [
  "Profil Ekstrusi",
  "Aksesori",
  "Sistem Linier",
  "Lembaran",
];

const stockFilters = ["Tersedia", "Terbatas", "Habis"];

export default function KatalogPage() {
  const { setDetailProduct } = useCart();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Aksesori",
  ]);
  const [stockFilter, setStockFilter] = useState<string>("");
  const [moqValue, setMoqValue] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [currentPage, setCurrentPage] = useState(2);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const getStockStatus = (product: Product): string => {
    const stock = product.stock;
    if (stock === 0) return "Habis";
    if (stock <= 50) return "Terbatas";
    return "Tersedia";
  };

  const filteredProducts = products.filter((p) => {
    // Category filter
    if (selectedCategories.length > 0) {
      const catMatch = selectedCategories.some(
        (c) => p.category.toLowerCase().includes(c.toLowerCase())
      );
      if (!catMatch) return false;
    }

    // Stock filter
    if (stockFilter) {
      const status = getStockStatus(p);
      if (stockFilter === "Tersedia" && status !== "Tersedia") return false;
      if (stockFilter === "Terbatas" && status !== "Terbatas") return false;
      if (stockFilter === "Habis" && status !== "Habis") return false;
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.desc.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q)
      )
        return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Harga Terendah":
        return a.price - b.price;
      case "Harga Tertinggi":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const getStockColor = (product: Product) => {
    const stock = product.stock;
    if (stock === 0) return "bg-danger";
    if (stock <= 50) return "bg-secondary-container";
    return "bg-success";
  };

  const getStockLabel = (product: Product) => {
    const stock = product.stock;
    if (stock === 0) return "Out of Stock";
    if (stock <= 50) return "Limited Stock";
    return "In Stock";
  };

  const isOutOfStock = (product: Product) => product.stock === 0;

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-primary-container py-12 md:py-16">
          <div className="px-margin-x-desktop max-w-container-max mx-auto">
            <nav className="flex mb-4 gap-2 text-on-surface-variant font-label-sm text-label-sm">
              <a className="hover:text-secondary transition-colors" href="/">
                Beranda
              </a>
              <span>/</span>
              <span className="text-secondary font-bold">Katalog</span>
            </nav>
            <h1 className="font-headline-h1 text-headline-h1 text-white">
              Katalog Produk Industrial
            </h1>
            <p className="mt-4 text-on-surface-variant max-w-2xl font-body-lg text-body-lg">
              Solusi komponen aluminium presisi untuk kebutuhan manufaktur,
              otomasi, dan konstruksi industrial Anda.
            </p>
          </div>
        </section>

        {/* Main Catalog Section */}
        <section className="py-section-gap-desktop px-margin-x-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row gap-gutter">
            {/* Sidebar Filters */}
            <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
              <div>
                <h3 className="font-headline-h3 text-headline-h3 text-white mb-4">
                  Kategori
                </h3>
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => {
                    const mappedCat =
                      cat === "Profil Ekstrusi"
                        ? "PROFIL EKSTRUSI"
                        : cat === "Aksesori"
                          ? "AKSESORIS"
                          : cat === "Sistem Linier"
                            ? "SISTEM LINIER"
                            : cat === "Lembaran"
                              ? "LEMBARAN"
                              : cat;
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(mappedCat)}
                          onChange={() => toggleCategory(mappedCat)}
                          className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary bg-white/10"
                        />
                        <span
                          className={`transition-colors ${
                            selectedCategories.includes(mappedCat)
                              ? "text-secondary font-medium"
                              : "text-on-surface-variant group-hover:text-white"
                          }`}
                        >
                          {cat}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="font-headline-h3 text-headline-h3 text-white mb-4">
                  Status Stok
                </h3>
                <div className="flex flex-col gap-3">
                  {stockFilters.map((sf) => (
                    <label
                      key={sf}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="stock"
                        checked={stockFilter === sf}
                        onChange={() =>
                          setStockFilter(stockFilter === sf ? "" : sf)
                        }
                        className="w-5 h-5 border-outline text-secondary focus:ring-secondary bg-white/10"
                      />
                      <span className="text-on-surface-variant">{sf}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="font-headline-h3 text-headline-h3 text-white mb-4">
                  Minimal Order (MOQ)
                </h3>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={moqValue}
                  onChange={(e) => setMoqValue(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <div className="flex justify-between mt-2 text-label-sm text-on-surface-variant">
                  <span>1 Unit</span>
                  <span>{moqValue} Unit</span>
                  <span>100+ Units</span>
                </div>
              </div>
            </aside>

            {/* Product Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-primary-container p-4 rounded-xl border border-white/10">
                <div className="relative w-full md:w-96">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk industrial..."
                    className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none bg-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="text-on-surface-variant font-label-sm whitespace-nowrap">
                    Urutkan:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:w-auto bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                  >
                    <option value="Terbaru">Terbaru</option>
                    <option value="Populer">Populer</option>
                    <option value="Harga Terendah">Harga Terendah</option>
                    <option value="Harga Tertinggi">Harga Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 transition-all hover:shadow-md hover:border-secondary flex flex-col relative ${
                      isOutOfStock(product)
                        ? "opacity-80"
                        : ""
                    }`}
                  >
                    <button className="absolute top-6 right-6 z-10 text-on-surface-variant hover:text-danger transition-colors">
                      <span className="material-symbols-outlined">
                        favorite
                      </span>
                    </button>
                    <div className="aspect-square bg-white/5 rounded-lg mb-4 overflow-hidden">
                      <div
                        className={`w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500 ${
                          isOutOfStock(product) ? "grayscale" : ""
                        }`}
                        style={{
                          backgroundImage: `url('${product.img}')`,
                        }}
                      />
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-label-sm text-[12px] w-fit mb-2 ${
                        product.badgeBg === "bg-success"
                          ? "bg-success/20 text-success"
                          : product.badgeBg === "bg-secondary"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-white/10 text-white/60"
                      }`}
                    >
                      {product.category}
                    </span>
                    <h3 className="font-headline-h3 text-headline-h3 text-white mb-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`w-2 h-2 rounded-full ${getStockColor(product)}`}
                      ></span>
                      <span className="text-label-sm text-on-surface-variant">
                        {getStockLabel(product)}
                      </span>
                    </div>
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="font-label-sm text-on-surface-variant">
                        MOQ: {product.stock > 50 ? "10" : product.stock > 0 ? "5" : "-"} units
                      </span>
                      {!isOutOfStock(product) ? (
                        <button
                          onClick={() => setDetailProduct(product)}
                          className="text-secondary font-bold hover:underline flex items-center gap-1"
                        >
                          Lihat Detail{" "}
                          <span className="material-symbols-outlined text-[16px]">
                            arrow_forward
                          </span>
                        </button>
                      ) : (
                        <span className="text-on-surface-variant font-bold cursor-not-allowed flex items-center gap-1">
                          Habis Terjual
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center gap-2">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                      currentPage === page
                        ? "border-secondary bg-secondary text-primary"
                        : "border-white/20 hover:bg-secondary hover:text-primary hover:border-secondary text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 hover:bg-secondary hover:text-primary hover:border-secondary transition-colors text-white">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ProductDetailModal />
      <CartDrawer />
    </>
  );
}

