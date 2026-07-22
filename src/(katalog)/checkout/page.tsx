"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../components/contexts/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
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
    router.push("/");
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
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
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
          {/* Ringkasan Pesanan */}
          <div className="lg:col-span-2">
            <div className="bg-primary-container rounded-2xl border border-white/10 p-6 sticky top-28">
              <h3 className="text-label-sm font-bold text-secondary uppercase tracking-widest mb-6">
                Ringkasan Pesanan
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div
                      className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url('${item.product.img}')`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-label-sm font-bold text-white truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-[12px] text-white/50">
                        {formatPrice(item.product.price)} x{item.quantity}
                      </p>
                    </div>
                    <span className="text-label-sm font-bold text-white flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 mt-6 pt-6 flex justify-between items-center">
                <span className="text-body-md font-bold text-white">Total</span>
                <span className="text-headline-h3 font-bold text-secondary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Data Diri */}
          <div className="lg:col-span-3">
            <div className="bg-primary-container rounded-2xl border border-white/10 p-8">
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
                disabled={!isFormValid}
                className="w-full mt-8 py-4 rounded-xl bg-secondary text-primary font-bold hover:bg-secondary-800 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
                Kirim Pesan via WhatsApp
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
