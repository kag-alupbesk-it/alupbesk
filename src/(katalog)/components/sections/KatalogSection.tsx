"use client";

import { products } from "@/data/products";
import { useCart } from "../contexts/CartContext";

export default function KatalogSection() {
  const { setDetailProduct, addToCart } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <section className="py-section-gap-desktop bg-primary" id="katalog">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">
              KATALOG PRODUK
            </span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">
              Komponen Presisi untuk Konstruksi Unggul
            </h2>
          </div>
          <a
            className="text-secondary font-bold flex items-center gap-2 group hover:gap-4 transition-all"
            href="#"
          >
            Lihat Semua Produk
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </a>
        </div>

        {/* Grid Katalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/10"
            >
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => setDetailProduct(item)}
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${item.img}')` }}
                ></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`${item.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="text-secondary text-[12px] font-bold uppercase tracking-widest mb-2">
                  {item.category}
                </div>
                <h4 className="text-headline-h3 text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-secondary font-bold text-label-sm mb-3">
                  {formatPrice(item.price)}
                </p>
                <p className="text-label-sm text-white/70 mb-6 line-clamp-2">
                  {item.desc}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetailProduct(item)}
                    className="flex-1 py-3 rounded-lg border border-white/20 text-white group-hover:bg-secondary group-hover:border-secondary group-hover:text-primary transition-all font-bold text-label-sm"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => addToCart(item, 1)}
                    className="py-3 px-4 rounded-lg border border-white/20 text-white hover:bg-secondary hover:border-secondary hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      add_shopping_cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Placeholders */}
          {[5, 6, 7, 8].map((num) => (
            <div
              key={num}
              className="hidden lg:flex bg-white/5 rounded-xl border border-dashed border-white/20 items-center justify-center p-8 text-center text-white/50 transition-all hover:bg-white/10 hover:border-white/30 cursor-default"
            >
              <p className="text-label-sm italic">
                Produk Katalog {num} tersedia di navigasi &apos;Lihat Semua&apos;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
