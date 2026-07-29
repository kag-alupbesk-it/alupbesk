"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, getItemKey } from "@/frontend/(pelanggan)/hooks/useCart";
import type { CartItem } from "@/frontend/(pelanggan)/types";
import Link from "next/link";
import { checkoutApi } from "@/services/api";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function VariantBadges({
  variants,
}: {
  variants?: Record<string, string>;
}) {
  if (!variants) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {Object.entries(variants).map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-[11px] px-2 py-0.5 rounded-md"
        >
          <span className="text-white/40">{k}:</span> {v}
        </span>
      ))}
    </div>
  );
}

function OrderItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: CartItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const p = item.product;

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex gap-4 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div
          className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url('${p.img}')` }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-label-sm font-bold text-white truncate">
            {p.title}
          </h4>
          <VariantBadges variants={item.selectedVariants} />
          <p className="text-[12px] text-white/50 mt-1">
            {formatPrice(p.price)} x{item.quantity}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <span className="text-label-sm font-bold text-white">
            {formatPrice(p.price * item.quantity)}
          </span>
          <span className="material-symbols-outlined text-[18px] text-white/40 transition-transform">
            {isExpanded ? "expand_less" : "expand_more"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <div className="pt-4">
            <div
              className="w-full aspect-video rounded-lg bg-cover bg-center mb-4"
              style={{ backgroundImage: `url('${p.img}')` }}
            />
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`${p.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
              >
                {p.badge}
              </span>
              <span className="text-secondary text-[12px] font-bold uppercase tracking-widest">
                {p.category}
              </span>
            </div>
            <h4 className="text-headline-h3 font-bold text-white mb-2">
              {p.title}
            </h4>
            <p className="text-body-sm text-white/60 mb-4">{p.desc}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-[11px] text-white/40 block mb-1">
                  Harga Satuan
                </span>
                <span className="text-label-sm font-bold text-secondary">
                  {formatPrice(p.price)}
                </span>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-[11px] text-white/40 block mb-1">
                  Stok Tersedia
                </span>
                <span className="text-label-sm font-bold text-white">
                  {p.stock} pcs
                </span>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-[11px] text-white/40 block mb-1">
                  Jumlah Dipesan
                </span>
                <span className="text-label-sm font-bold text-white">
                  {item.quantity} pcs
                </span>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-[11px] text-white/40 block mb-1">
                  Subtotal
                </span>
                <span className="text-label-sm font-bold text-secondary">
                  {formatPrice(p.price * item.quantity)}
                </span>
              </div>
            </div>

            {item.selectedVariants && (
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-[11px] text-white/40 block mb-2">
                  Varian yang Dipilih
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(item.selectedVariants).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 bg-secondary/20 text-secondary text-[12px] font-bold px-3 py-1 rounded-lg"
                    >
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutSection() {
  const router = useRouter();
  const { items, totalPrice, clearCart, showToast } = useCart();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const order = await checkoutApi.createOrder({
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, variants: item.selectedVariants, note: item.note })),
        customer: { name: form.name, email: form.email, phone: form.phone, address: form.address, note: form.note },
      });
      const productList = items
        .map((item) => {
          const variantStr = item.selectedVariants
            ? ` (${Object.values(item.selectedVariants).join(", ")})`
            : "";
          return `- ${item.product.title}${variantStr} x${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`;
        })
        .join("%0A");

      const message = `Halo ALUPBESK, saya ingin memesan:%0A%0A${productList}%0A%0ATotal: ${formatPrice(totalPrice)}%0A%0ANama: ${form.name}%0AEmail: ${form.email}%0ATelp: ${form.phone}%0AAlamat: ${form.address}%0ACatatan: ${form.note}`;

      window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(`${message}\n\nID Pesanan: ${order.id}`)}`, "_blank");
      clearCart();
      router.push("/");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Pesanan gagal dibuat.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.name && form.phone && form.address;

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-primary pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="material-symbols-outlined text-[80px] text-white/20 mb-6 block">
            shopping_cart
          </span>
          <h1 className="text-headline-h1 font-headline-h1 text-white mb-4">
            Keranjang Kosong
          </h1>
          <p className="text-primary-fixed-dim text-body-md mb-8">
            Belum ada produk di keranjang. Yuk mulai belanja!
          </p>
          <Link
            href="/#katalog"
            className="inline-flex items-center gap-2 bg-secondary text-primary px-8 py-4 rounded-xl font-bold hover:bg-secondary-800 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Lihat Katalog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-primary pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary font-bold text-label-sm hover:gap-4 transition-all mb-6"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            Kembali
          </Link>
          <h1 className="text-headline-h1 font-headline-h1 text-white">
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-primary-container rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-label-sm font-bold text-secondary uppercase tracking-widest">
                  Ringkasan Pesanan
                </h3>
                <span className="text-label-sm text-white/40">
                  {items.length} produk
                </span>
              </div>
              <div className="space-y-3">
                {items.map((item) => {
                  const key = getItemKey(item);
                  return (
                    <OrderItem
                      key={key}
                      item={item}
                      isExpanded={expandedItems.has(key)}
                      onToggle={() => toggleExpand(key)}
                    />
                  );
                })}
              </div>
              <div className="border-t border-white/10 mt-6 pt-6 flex justify-between items-center">
                <span className="text-body-md font-bold text-white">Total</span>
                <span className="text-headline-h3 font-bold text-secondary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-primary-container rounded-2xl border border-white/10 p-8 sticky top-28">
              <h3 className="text-label-sm font-bold text-secondary uppercase tracking-widest mb-6">
                Data Diri
              </h3>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="block space-y-2">
                    <span className="text-label-sm font-bold text-white">
                      Nama Lengkap *
                    </span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-label-sm font-bold text-white">
                      Email (Opsional)
                    </span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                      placeholder="john@perusahaan.com"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-label-sm font-bold text-white">
                    No. Telepon / WhatsApp *
                  </span>
                  <input
                    className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                    placeholder="+62 812 3456 7890"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-label-sm font-bold text-white">
                    Alamat Pengiriman *
                  </span>
                  <textarea
                    className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                    placeholder="Alamat lengkap pengiriman..."
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-label-sm font-bold text-white">
                    Catatan (Opsional)
                  </span>
                  <textarea
                    className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                    placeholder="Catatan tambahan untuk pesanan Anda..."
                    rows={2}
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: e.target.value })
                    }
                  />
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full mt-8 py-4 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
                {isSubmitting ? "Memproses pesanan..." : "Kirim Pesan via WhatsApp"}
              </button>
              <p className="text-center text-[12px] text-white/40 mt-4">
                Pesanan Anda akan dikirimkan ke WhatsApp kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
