"use client";

import type { Product } from "@/services/catalog";
import { ProductCard } from "../../product/ProductCard";

export default function BestSeller({ products }: { products: Product[] }) {
  const bestSellerProducts = products.filter((product) => product.bestSeller);
  if (bestSellerProducts.length === 0) return null;

  return (
    <div className="bg-primary-container pb-4">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary text-[18px]">local_fire_department</span>
          <span className="text-secondary font-eyebrow text-eyebrow">BEST SELLER</span>
          <div className="h-px bg-outline/20 flex-1" />
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
