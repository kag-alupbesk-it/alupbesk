"use client";

import type { Product } from "@/services/catalog";
import { useCart } from "@/frontend/(pelanggan)/hooks/useCart";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, setDetailProduct } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] border border-outline/30 bg-surface shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-2xl">
      {/* Image */}
      <div
        className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-surface/50 bg-cover bg-center"
        style={{ backgroundImage: `url('${product.img}')` }}
        onClick={() => setDetailProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDetailProduct(product); }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-surface/80 via-transparent to-transparent" />
      </div>

      {/* Badge */}
      {product.badge && (
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary shadow-lg shadow-secondary/20">
          {product.badge}
        </span>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary/90">
          {product.category}
        </p>
        <h3
          className="text-[15px] font-bold text-on-surface leading-snug line-clamp-2 cursor-pointer hover:text-secondary transition-colors"
          onClick={() => setDetailProduct(product)}
        >
          {product.title}
        </h3>
        <p className="text-[12px] text-on-surface-variant line-clamp-3 leading-relaxed flex-1">
          {product.desc}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-[16px] font-bold text-on-surface">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.price)}
          </span>
          <button
            onClick={() => setDetailProduct(product)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-[12px] font-semibold text-primary shadow-sm shadow-secondary/20 transition-all hover:bg-secondary/90 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            Tambah
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-on-surface/0 group-hover:ring-secondary/30 transition-all duration-300" />
    </div>
  );
}
