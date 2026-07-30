"use client";

import { useState } from "react";
import { useCart } from "@/frontend/(pelanggan)/hooks/useCart";
import Modal from "../shared/Modal";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetailModal() {
  const { detailProduct, setDetailProduct, addToCart } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  if (!detailProduct) return null;

  const product = detailProduct;

  const handleAddToCart = () => {
    if (product.variants) {
      const missingVariants = product.variants.filter((v) => !selectedVariants[v.name]);
      if (missingVariants.length > 0) return;
    }
    addToCart(product, 1, selectedVariants);
    setSelectedVariants({});
    setDetailProduct(null);
  };

  return (
    <Modal isOpen={!!detailProduct} onClose={() => { setDetailProduct(null); setSelectedVariants({}); }}>
      <div className="grid md:grid-cols-2">
        <div
          className="aspect-square md:aspect-auto md:h-full min-h-[300px] bg-cover bg-center rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
          style={{ backgroundImage: `url('${product.img}')` }}
        />
        <div className="p-8 space-y-5">
          <span className={`inline-block ${product.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
            {product.badge}
          </span>
          <p className="text-[12px] font-bold text-secondary uppercase tracking-widest">
            {product.category}
          </p>
          <h2 className="text-headline-h2 font-bold text-on-surface">
            {product.title}
          </h2>
          <p className="text-body-sm text-on-surface/60">
            {product.desc}
          </p>
          <div className="text-[28px] font-bold text-secondary">
            {formatPrice(product.price)}
          </div>

          {product.variants?.map((v) => (
            <div key={v.name}>
              <p className="text-[12px] font-bold text-on-surface/70 mb-2">
                {v.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => {
                  const isSelected = selectedVariants[v.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                        isSelected
                          ? "bg-secondary text-primary border-secondary"
                          : "bg-surface-container text-on-surface/60 border-outline/20 hover:border-outline"
                      }`}
                    >
                      {v.colors?.[v.options.indexOf(opt)] ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: v.colors[v.options.indexOf(opt)] }}
                          />
                          {opt}
                        </span>
                      ) : (
                        opt
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddToCart}
            className="w-full py-4 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2 text-[14px]"
          >
            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            Tambah ke Keranjang
          </button>

          {product.specs && (
            <div className="space-y-3 pt-4 border-t border-outline/20">
              <p className="text-[12px] font-bold text-on-surface/70 uppercase tracking-wider">Spesifikasi</p>
              <div className="grid grid-cols-2 gap-3">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] text-on-surface/40">{spec.label}</p>
                    <p className="text-[12px] font-semibold text-on-surface/80">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.highlights && (
            <div className="space-y-2 pt-2">
              {product.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-on-surface/60">
                  <span className="material-symbols-outlined text-[16px] text-secondary flex-shrink-0">check_circle</span>
                  {h}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
