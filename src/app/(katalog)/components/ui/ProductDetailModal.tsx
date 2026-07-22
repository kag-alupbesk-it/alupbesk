"use client";

import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import Modal from "./Modal";

function getInitialVariants(
  variants?: { name: string; options: string[] }[]
): Record<string, string> {
  if (!variants) return {};
  const initial: Record<string, string> = {};
  variants.forEach((v) => {
    initial[v.name] = v.options[0];
  });
  return initial;
}

export default function ProductDetailModal() {
  const { detailProduct, setDetailProduct, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >(() => getInitialVariants(detailProduct?.variants));
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isCustomMode, setIsCustomMode] = useState<Record<string, boolean>>(
    {}
  );

  const product = detailProduct;

  const handleClose = () => {
    setDetailProduct(null);
    setQuantity(1);
    setCustomInputs({});
    setIsCustomMode({});
  };

  const allVariantsSelected =
    !product?.variants ||
    product.variants.every((v) => {
      if (isCustomMode[v.name]) {
        return customInputs[v.name]?.trim();
      }
      return selectedVariants[v.name];
    });

  const handleAddToCart = () => {
    if (!product) return;
    const finalVariants: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach((v) => {
        if (isCustomMode[v.name] && customInputs[v.name]?.trim()) {
          finalVariants[v.name] = customInputs[v.name].trim();
        } else if (selectedVariants[v.name]) {
          finalVariants[v.name] = selectedVariants[v.name];
        }
      });
    }
    const variants =
      Object.keys(finalVariants).length > 0 ? finalVariants : undefined;
    addToCart(product, quantity, variants);
    handleClose();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <Modal isOpen={!!product} onClose={handleClose} maxWidth="max-w-4xl">
      {product && (
        <div className="grid md:grid-cols-2 gap-0" key={product.id}>
          <div className="relative aspect-square md:aspect-auto">
            <div
              className="w-full h-full min-h-[300px] bg-cover bg-center rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
              style={{ backgroundImage: `url('${product.img}')` }}
            />
            <span
              className={`absolute top-4 left-4 ${product.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}
            >
              {product.badge}
            </span>
          </div>

          <div className="p-8 flex flex-col">
            <span className="text-secondary text-[12px] font-bold uppercase tracking-widest mb-2">
              {product.category}
            </span>
            <h3 className="text-headline-h1 font-headline-h1 text-white mb-4">
              {product.title}
            </h3>
            <p className="text-primary-fixed-dim text-body-md mb-6">
              {product.desc}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-headline-h2 font-bold text-secondary">
                {formatPrice(product.price)}
              </span>
              <span className="text-label-sm text-white/40">/ pcs</span>
            </div>

            <div className="flex items-center gap-4 mb-6 text-label-sm text-white/60">
              <span className="material-symbols-outlined text-secondary text-xl">
                inventory_2
              </span>
              Stok: {product.stock} pcs
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => {
                  const customActive = isCustomMode[variant.name];
                  return (
                    <div key={variant.name}>
                      <span className="text-label-sm font-bold text-white block mb-2">
                        {variant.name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option) => {
                          const isSelected =
                            !customActive &&
                            selectedVariants[variant.name] === option;
                          return (
                            <button
                              key={option}
                              onClick={() => {
                                setIsCustomMode((prev) => ({
                                  ...prev,
                                  [variant.name]: false,
                                }));
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.name]: option,
                                }));
                              }}
                              className={`px-4 py-2 rounded-lg text-label-sm font-bold border transition-all ${
                                isSelected
                                  ? "bg-secondary text-primary border-secondary"
                                  : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => {
                            setIsCustomMode((prev) => ({
                              ...prev,
                              [variant.name]: true,
                            }));
                          }}
                          className={`px-4 py-2 rounded-lg text-label-sm font-bold border transition-all ${
                            customActive
                              ? "bg-secondary text-primary border-secondary"
                              : "border-dashed border-white/30 text-white/50 hover:border-white/50 hover:text-white/70"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                            edit
                          </span>
                          Lainnya...
                        </button>
                      </div>
                      {customActive && (
                        <input
                          type="text"
                          value={customInputs[variant.name] ?? ""}
                          onChange={(e) =>
                            setCustomInputs((prev) => ({
                              ...prev,
                              [variant.name]: e.target.value,
                            }))
                          }
                          placeholder={`Masukkan ${variant.name} kustom...`}
                          className="mt-3 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                          autoFocus
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <span className="text-label-sm font-bold text-white">Qty:</span>
              <div className="flex items-center border border-white/20 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-white hover:bg-white/10 transition-colors rounded-l-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    remove
                  </span>
                </button>
                <span className="px-6 py-2 text-white font-bold min-w-[60px] text-center border-x border-white/20">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2 text-white hover:bg-white/10 transition-colors rounded-r-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-auto flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!allVariantsSelected}
                className="flex-1 py-3 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_shopping_cart
                </span>
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
