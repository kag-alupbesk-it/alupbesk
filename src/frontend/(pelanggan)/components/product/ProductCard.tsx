"use client";

import type { Product } from "@/services/catalog";
import { useProductDetail } from "@/frontend/(pelanggan)/hooks/useProductDetail";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

export function ProductCard({ product }: { product: Product }) {
  const { setDetailProduct } = useProductDetail();
  const { t } = useLanguage();

  return (
    <div className="group overflow-hidden rounded-2xl border border-outline/20 bg-primary-container transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-2xl">
      {/* Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-cover bg-center group-hover:cursor-pointer"
        style={{ backgroundImage: `url('${product.img}')` }}
        onClick={() => setDetailProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDetailProduct(product); }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-[11px] text-on-surface/40 mb-2 uppercase tracking-widest font-semibold">{product.category}</p>
        <h3
          className="text-[15px] font-bold text-on-surface mb-3 leading-snug line-clamp-2 cursor-pointer hover:text-secondary transition-colors"
          onClick={() => setDetailProduct(product)}
        >
          {product.title}
        </h3>
        <p className="text-[12px] text-on-surface/60 leading-relaxed line-clamp-3 mb-4">
          {product.desc}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setDetailProduct(product)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-secondary/15 px-4 text-xs font-bold text-secondary transition-all hover:bg-secondary hover:text-primary active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            {t("viewDetails")}
          </button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-on-surface/0 group-hover:ring-secondary/30 transition-all duration-300" />
    </div>
  );
}
