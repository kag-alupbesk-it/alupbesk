"use client";

import { products } from "@/data/products";
import { useCart } from "../../checkout/CartContext";

const bestSellerProducts = products.filter((p) => p.bestSeller);

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default function BestSellerSection() {
  const { setDetailProduct, addToCart } = useCart();

  if (bestSellerProducts.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[24px]">
            local_fire_department
          </span>
          <span className="text-secondary font-eyebrow text-eyebrow">
            BEST SELLER
          </span>
        </div>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>
      <h3 className="text-headline-h2 font-headline-h2 text-white mb-2">
        Paling Laris di Pasar
      </h3>
      <p className="text-label-sm text-white/50 mb-8">
        Produk terlaris yang dipercaya ribuan pelanggan
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {bestSellerProducts.map((item) => (
          <div
            key={item.id}
            onClick={() => setDetailProduct(item)}
            className="group bg-gradient-to-b from-secondary/10 to-white/5 backdrop-blur-sm rounded-xl border border-secondary/20 overflow-hidden hover:border-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
          >
            <div className="relative aspect-square">
              <div
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${item.img}')` }}
              />
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                <span className="bg-secondary text-primary px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px] sm:text-[12px]">
                    local_fire_department
                  </span>
                  Best Seller
                </span>
              </div>
              {item.soldCount && (
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-semibold">
                  {item.soldCount}+ terjual
                </div>
              )}
            </div>

            <div className="p-2.5 sm:p-5">
              <h4 className="text-[13px] sm:text-headline-h3 text-white mb-0.5 sm:mb-1 line-clamp-2 min-h-[34px] sm:min-h-0">{item.title}</h4>
              <p className="text-secondary font-bold text-[13px] sm:text-label-sm mb-1 sm:mb-4">{formatPrice(item.price)}</p>
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setDetailProduct(item); }}
                  className="flex-1 py-2.5 rounded-lg border border-white/20 text-white group-hover:bg-secondary group-hover:border-secondary group-hover:text-primary transition-all font-bold text-[13px]"
                >
                  Detail
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (item.variants) { setDetailProduct(item); } else { addToCart(item, 1); } }}
                  className="py-2.5 px-4 rounded-lg border border-white/20 text-white hover:bg-secondary hover:border-secondary hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add_shopping_cart
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
