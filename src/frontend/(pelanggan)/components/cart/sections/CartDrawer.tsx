"use client";

import { useRouter } from "next/navigation";
import { useCart, getItemKey } from "@/frontend/(pelanggan)/hooks/useCart";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setCartOpen,
  } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]" onClick={() => setCartOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-primary-container border-l border-outline/20 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">
              shopping_cart
            </span>
            <h3 className="text-headline-h3 font-headline-h3 text-on-surface">
              Keranjang
            </h3>
            <span className="bg-secondary text-primary text-[12px] font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="text-on-surface/60 hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface/40">
              <span className="material-symbols-outlined text-[64px] mb-4">
                shopping_cart
              </span>
              <p className="text-body-md">Keranjang masih kosong</p>
            </div>
          ) : (
            items.map((item) => {
              const key = getItemKey(item);
              const variantLabels = item.selectedVariants
                ? Object.entries(item.selectedVariants)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ")
                : null;
              return (
                <div
                  key={key}
                  className="flex gap-4 p-4 bg-surface-container rounded-xl border border-outline/20"
                >
                  <div
                    className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${item.product.img}')` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-label-sm font-bold text-on-surface truncate">
                      {item.product.title}
                    </h4>
                    {variantLabels && (
                      <p className="text-[11px] text-on-surface/50 mt-0.5 truncate">
                        {variantLabels}
                      </p>
                    )}
                    <p className="text-[12px] text-secondary font-bold mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-outline/30 rounded-lg">
                        <button
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="px-2 py-1 text-on-surface/60 hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="px-3 text-on-surface text-[14px] font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          className="px-2 py-1 text-on-surface/60 hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(key)}
                        className="text-on-surface/40 hover:text-danger transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-outline/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-body-md text-on-surface/60">Total</span>
              <span className="text-headline-h2 font-bold text-secondary">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full py-3 rounded-xl border border-outline/30 text-on-surface/60 hover:text-on-surface hover:border-outline transition-all text-label-sm"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
