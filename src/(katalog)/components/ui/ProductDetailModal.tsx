"use client";

import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import Modal from "./Modal";

export default function ProductDetailModal() {
  const { detailProduct, setDetailProduct, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = detailProduct;

  const handleClose = () => {
    setDetailProduct(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
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
        <div className="grid md:grid-cols-2 gap-0">
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
                className="flex-1 py-3 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2"
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
