"use client";

import { useCart } from "../contexts/CartContext";

export default function CartIcon() {
  const { totalItems, setCartOpen } = useCart();

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="relative text-white hover:text-secondary transition-colors"
    >
      <span className="material-symbols-outlined text-[28px]">
        shopping_cart
      </span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
}
