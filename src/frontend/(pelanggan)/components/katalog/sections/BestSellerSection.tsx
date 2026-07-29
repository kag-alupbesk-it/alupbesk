"use client";

import { products } from "@/services/catalog";
import { ProductCard } from "../../product/ProductCard";

const bestSellerProducts = products.filter((p) => p.bestSeller);

export default function BestSeller() {
  if (bestSellerProducts.length === 0) return null;

  return (
    <div className="bg-primary pb-4">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary text-[18px]">local_fire_department</span>
          <span className="text-secondary font-eyebrow text-eyebrow">BEST SELLER</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
