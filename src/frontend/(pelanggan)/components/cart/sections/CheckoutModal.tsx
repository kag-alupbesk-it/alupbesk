"use client";

import { useState } from "react";
import { useCart } from "@/frontend/(pelanggan)/hooks/useCart";
import Modal from "../../shared/Modal";

export default function CheckoutModal() {
  const { items, totalPrice, isCheckoutOpen, setCheckoutOpen, clearCart } =
    useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleClose = () => {
    setCheckoutOpen(false);
    setForm({ name: "", email: "", phone: "", address: "", note: "" });
  };

  const handleSubmit = () => {
    const productList = items
      .map(
        (item) =>
          `- ${item.product.title} x${item.quantity} = ${formatPrice(item.product.price * item.quantity)}`
      )
      .join("%0A");

    const message = `Halo ALUPBESK, saya ingin memesan:%0A%0A${productList}%0A%0ATotal: ${formatPrice(totalPrice)}%0A%0ANama: ${form.name}%0AEmail: ${form.email}%0ATelp: ${form.phone}%0AAlamat: ${form.address}%0ACatatan: ${form.note}`;

    window.open(`https://wa.me/6281234567890?text=${message}`, "_blank");
    clearCart();
    handleClose();
  };

  const isFormValid = form.name && form.phone && form.address;

  return (
    <Modal isOpen={isCheckoutOpen} onClose={handleClose} maxWidth="max-w-2xl">
      <div className="p-8">
        <h3 className="text-headline-h1 font-headline-h1 text-white mb-2">
          Checkout
        </h3>
        <p className="text-primary-fixed-dim text-body-md mb-8">
          Lengkapi data Anda untuk menyelesaikan pesanan.
        </p>

        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
          <h4 className="text-label-sm font-bold text-secondary uppercase tracking-widest mb-4">
            Ringkasan Pesanan
          </h4>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between items-center text-label-sm"
              >
                <span className="text-white/70">
                  {item.product.title} x{item.quantity}
                </span>
                <span className="text-white font-bold">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
            <span className="text-body-md font-bold text-white">Total</span>
            <span className="text-headline-h3 font-bold text-secondary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-label-sm font-bold text-white">
                Nama Lengkap *
              </span>
              <input
                className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-label-sm font-bold text-white">
                Email (Opsional)
              </span>
              <input
                className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                placeholder="john@perusahaan.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-label-sm font-bold text-white">
              No. Telepon / WhatsApp *
            </span>
            <input
              className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="+62 812 3456 7890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-label-sm font-bold text-white">
              Alamat Pengiriman *
            </span>
            <textarea
              className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="Alamat lengkap pengiriman..."
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-label-sm font-bold text-white">
              Catatan (Opsional)
            </span>
            <textarea
              className="w-full rounded-xl border border-white/20 bg-white/5 p-3 text-label-sm text-white placeholder:text-white/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="Catatan tambahan untuk pesanan Anda..."
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full mt-8 py-4 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          Kirim Pesan via WhatsApp
        </button>
        <p className="text-center text-[12px] text-white/40 mt-4">
          Pesanan Anda akan dikirimkan ke WhatsApp kami.
        </p>
      </div>
    </Modal>
  );
}
