"use client";

import type { Product } from "@/services/catalog";
import { useCart } from "@/frontend/(pelanggan)/hooks/useCart";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, setDetailProduct } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline/40 bg-primary-container transition-all duration-300 hover:border-secondary/40 hover:shadow-2xl hover:-translate-y-1">
      {/* Image */}
      <div
        className="aspect-[4/3] w-full bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url('${product.img}')` }}
        onClick={() => setDetailProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDetailProduct(product); }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container/60 via-transparent to-transparent" />
      </div>

      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute top-3 left-3 ${product.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg`}
        >
          {product.badge}
        </span>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">
          {product.category}
        </p>
        <h3
          className="text-[14px] font-bold text-on-surface leading-snug line-clamp-2 cursor-pointer hover:text-secondary transition-colors"
          onClick={() => setDetailProduct(product)}
        >
          {product.title}
        </h3>
        <p className="text-[12px] text-on-surface/50 line-clamp-2 leading-relaxed flex-1">
          {product.desc}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[16px] font-bold text-secondary">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.price)}
          </span>
          <button
            onClick={() => addToCart(product, 1)}
            className="flex items-center gap-1.5 bg-secondary/20 text-secondary px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-secondary hover:text-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            Tambah
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-on-surface/0 group-hover:ring-secondary/30 transition-all duration-300" />
    </div>
  );
}
