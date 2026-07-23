"use client";

import { useState } from "react";
import { useCart, itemKey } from "@/(katalog)/checkout/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KeranjangPage() {
  const { items, removeFromCart, updateQuantity, updateNote, clearCart, totalItems, totalPrice } = useCart();
  const router = useRouter();
  const [confirmClear, setConfirmClear] = useState(false);
  // Track nilai input qty sementara (bisa kosong saat diketik)
  const [qtyInputs, setQtyInputs] = useState<Record<number, string>>({});

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="min-h-screen bg-primary">
      {/* Topbar */}
      <div className="sticky top-0 z-50 bg-primary-container border-b border-white/10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-headline-h3 font-bold text-white leading-none">Keranjang Belanja</h1>
            {items.length > 0 && (
              <p className="text-[12px] text-white/40 mt-0.5">{totalItems} item dipilih</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-white/40">
            <span className="material-symbols-outlined text-[80px] mb-4">shopping_cart</span>
            <p className="text-body-lg mb-2">Keranjang kamu masih kosong</p>
            <p className="text-body-md text-white/30 mb-8">Yuk, tambahkan produk dari katalog kami</p>
            <Link
              href="/#katalog"
              className="px-8 py-3 bg-secondary text-primary font-bold rounded-full hover:bg-secondary-fixed transition-all"
            >
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Daftar Produk */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-primary-container rounded-2xl border border-white/10 p-4"
                >
                  <div className="flex gap-4">
                    {/* Gambar */}
                    <div
                      className="w-24 h-24 rounded-xl bg-cover bg-center flex-shrink-0 border border-white/10"
                      style={{ backgroundImage: `url('${item.product.img}')` }}
                    />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {/* Badge stok */}
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                            {item.product.stock > 50 ? "Ready Stock" : item.product.stock > 0 ? `Stok: ${item.product.stock}` : "Habis"}
                          </span>
                          <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-snug">
                            {item.product.title}
                          </h3>
                          {/* Harga satuan */}
                          <p className="text-[12px] text-white/40 mt-0.5">
                            @ {formatPrice(item.product.price)} / pcs
                          </p>
                        </div>
                        {/* Tombol hapus */}
                        <button
                          onClick={() => removeFromCart(itemKey(item.product.id, item.selectedVariants))}
                          className="flex-shrink-0 p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          title="Hapus produk"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      {/* Quantity + Subtotal */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-white/5 border border-white/15 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(itemKey(item.product.id, item.selectedVariants), item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={qtyInputs[item.product.id] ?? item.quantity}
                            onChange={(e) => {
                              // Hanya izinkan angka
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              setQtyInputs((prev) => ({ ...prev, [item.product.id]: raw }));
                              const val = parseInt(raw);
                              if (!isNaN(val) && val > 0) updateQuantity(itemKey(item.product.id, item.selectedVariants), val);
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!val || val <= 0) {
                                updateQuantity(itemKey(item.product.id, item.selectedVariants), 1);
                              }
                              // Bersihkan temporary input state
                              setQtyInputs((prev) => {
                                const next = { ...prev };
                                delete next[item.product.id];
                                return next;
                              });
                            }}
                            className="w-12 h-9 text-center text-white text-[14px] font-bold bg-transparent border-x border-white/15 focus:outline-none"
                          />
                          <button
                            onClick={() => updateQuantity(itemKey(item.product.id, item.selectedVariants), item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-[11px] text-white/30">Subtotal</p>
                          <p className="text-[15px] font-bold text-secondary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Catatan per item */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <input
                      type="text"
                      placeholder="✏️ Catatan / spesifikasi custom (misal: potong 500mm)..."
                      value={item.note}
                      onChange={(e) => updateNote(itemKey(item.product.id, item.selectedVariants), e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white/70 placeholder:text-white/25 focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                  </div>
                </div>
              ))}

              {/* Tombol kosongkan di bawah list */}
              <div className="pt-2">
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-[12px] text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                    Kosongkan semua keranjang
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-[12px] text-red-300 flex-1">Yakin ingin mengosongkan keranjang?</p>
                    <button onClick={() => { clearCart(); setConfirmClear(false); }} className="text-[12px] font-bold text-red-400 hover:text-red-300 transition-colors">Ya, Kosongkan</button>
                    <button onClick={() => setConfirmClear(false)} className="text-[12px] text-white/40 hover:text-white transition-colors">Batal</button>
                  </div>
                )}
              </div>
            </div>

            {/* Ringkasan Belanja */}
            <div className="lg:col-span-1">
              <div className="bg-primary-container rounded-2xl border border-white/10 p-6 sticky top-24 space-y-4">
                <h2 className="text-[13px] font-semibold text-white/70">Ringkasan Belanja</h2>

                {/* Rincian item */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-[12px]">
                      <span className="text-white/50 truncate mr-2 leading-relaxed">
                        {item.product.title} <span className="text-white/30">×{item.quantity}</span>
                      </span>
                      <span className="text-white/80 font-medium flex-shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Estimasi ongkir */}
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/50">Subtotal</span>
                    <span className="text-white/80 font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/50">Estimasi Ongkir</span>
                    <span className="text-white/40 italic">Dihitung saat checkout</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-white">Total</span>
                    <span className="text-[20px] font-bold text-secondary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 mt-1">*Belum termasuk ongkir</p>
                </div>

                {/* Tombol Checkout */}
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-fixed transition-all flex items-center justify-center gap-2 text-[14px]"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                  Checkout Sekarang
                </button>

                <Link
                  href="/#katalog"
                  className="w-full py-3 rounded-xl border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all text-[13px] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Lanjut Belanja
                </Link>

                {/* Trust badges */}
                <div className="border-t border-white/10 pt-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-[20px] text-white/30">verified_user</span>
                      <span className="text-[10px] text-white/30 leading-tight">Transaksi Aman</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-[20px] text-white/30">local_shipping</span>
                      <span className="text-[10px] text-white/30 leading-tight">Pengiriman Ekspres</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-[20px] text-white/30">support_agent</span>
                      <span className="text-[10px] text-white/30 leading-tight">Dukungan 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}