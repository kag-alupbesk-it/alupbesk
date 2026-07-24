"use client";

import { useState } from "react";
import Link from "next/link";

const LAYANAN = [
  {
    icon: "straighten",
    title: "Potong Custom",
    desc: "Pemotongan presisi sesuai dimensi yang Anda tentukan, toleransi hingga ±0.1mm.",
  },
  {
    icon: "design_services",
    title: "Desain Rangka",
    desc: "Konsultasi dan desain rangka aluminium untuk mesin, workstation, atau struktur custom.",
  },
  {
    icon: "format_paint",
    title: "Finishing Custom",
    desc: "Anodizing, powder coating, atau mill finish sesuai kebutuhan estetis dan teknis.",
  },
  {
    icon: "precision_manufacturing",
    title: "Fabrikasi Lengkap",
    desc: "Dari desain hingga produk jadi siap pasang, termasuk pengelasan dan perakitan.",
  },
];

export default function JasaCustomPage() {
  const [form, setForm] = useState({
    nama: "",
    perusahaan: "",
    email: "",
    telp: "",
    layanan: "",
    deskripsi: "",
    dimensi: "",
    kuantitas: "",
    deadline: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const isValid = form.nama && form.telp && form.layanan && form.deskripsi;

  const handleSubmit = () => {
    const msg = [
      `Halo ALUPBESK, saya ingin request *Custom Quote*:`,
      ``,
      `*Data Pemesan*`,
      `Nama: ${form.nama}`,
      `Perusahaan: ${form.perusahaan || "-"}`,
      `Email: ${form.email || "-"}`,
      `Telp/WA: ${form.telp}`,
      ``,
      `*Detail Kebutuhan*`,
      `Layanan: ${form.layanan}`,
      `Deskripsi: ${form.deskripsi}`,
      `Dimensi/Ukuran: ${form.dimensi || "-"}`,
      `Kuantitas: ${form.kuantitas || "-"}`,
      `Target Deadline: ${form.deadline || "-"}`,
    ].join("%0A");

    window.open(`https://wa.me/6281234567890?text=${msg}`, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Topbar */}
      <div className="sticky top-0 z-50 bg-primary-container border-b border-white/10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-white leading-none">Jasa Custom & Konsultasi</h1>
            <p className="text-[11px] text-white/40 mt-0.5">Request quote untuk kebutuhan spesifik Anda</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[40px] text-emerald-400">check_circle</span>
            </div>
            <h2 className="text-[24px] font-bold text-white mb-3">Permintaan Terkirim!</h2>
            <p className="text-white/50 text-[14px] mb-2 max-w-md">
              Tim kami akan menghubungi Anda melalui WhatsApp dalam 1x24 jam kerja untuk mendiskusikan detail kebutuhan Anda.
            </p>
            <p className="text-white/30 text-[12px] mb-8">Cek WhatsApp Anda untuk melanjutkan diskusi.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSubmitted(false); setForm({ nama: "", perusahaan: "", email: "", telp: "", layanan: "", deskripsi: "", dimensi: "", kuantitas: "", deadline: "" }); }}
                className="px-6 py-3 border border-white/20 text-white rounded-xl hover:border-white/40 transition-all text-[13px] font-semibold"
              >
                Request Lagi
              </button>
              <Link href="/" className="px-6 py-3 bg-secondary text-primary rounded-xl hover:brightness-110 transition-all text-[13px] font-bold">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Layanan yang tersedia */}
              <div className="grid sm:grid-cols-2 gap-3 mb-2">
                {LAYANAN.map((l) => (
                  <button
                    key={l.title}
                    type="button"
                    onClick={() => setForm({ ...form, layanan: l.title })}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      form.layanan === l.title
                        ? "border-secondary bg-secondary/10"
                        : "border-white/10 bg-primary-container hover:border-white/25"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] mb-2 block ${
                      form.layanan === l.title ? "text-secondary" : "text-white/40"
                    }`}>{l.icon}</span>
                    <p className={`text-[13px] font-bold mb-1 ${
                      form.layanan === l.title ? "text-secondary" : "text-white"
                    }`}>{l.title}</p>
                    <p className="text-[11px] text-white/40 leading-relaxed">{l.desc}</p>
                  </button>
                ))}
              </div>

              {/* Form detail */}
              <div className="bg-primary-container rounded-2xl border border-white/10 p-6 space-y-4">
                <h2 className="text-[13px] font-semibold text-white/70 mb-2">Data Pemesan</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">Nama Lengkap <span className="text-red-400">*</span></span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      placeholder="John Doe"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">Nama Perusahaan</span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      placeholder="PT Contoh Indonesia"
                      value={form.perusahaan}
                      onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">Email</span>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      placeholder="john@perusahaan.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">No. WhatsApp <span className="text-red-400">*</span></span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      placeholder="+62 812 3456 7890"
                      value={form.telp}
                      onChange={(e) => setForm({ ...form, telp: e.target.value })}
                    />
                  </label>
                </div>

                <h2 className="text-[13px] font-semibold text-white/70 pt-2">Detail Kebutuhan</h2>
                <label className="block space-y-1.5">
                  <span className="text-[12px] font-semibold text-white/70">Deskripsi Kebutuhan <span className="text-red-400">*</span></span>
                  <textarea
                    className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all resize-none"
                    placeholder="Jelaskan kebutuhan Anda secara detail. Misal: butuh rangka mesin CNC ukuran 1x1m dari profil 4040..."
                    rows={4}
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  />
                </label>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">Dimensi / Ukuran</span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      placeholder="misal: 500x500x1000mm"
                      value={form.dimensi}
                      onChange={(e) => setForm({ ...form, dimensi: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">Kuantitas</span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white placeholder:text-white/25 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      placeholder="misal: 10 unit"
                      value={form.kuantitas}
                      onChange={(e) => setForm({ ...form, kuantitas: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-white/70">Target Deadline</span>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-white/20 bg-white/[0.07] p-3 text-[13px] text-white/70 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="bg-primary-container rounded-2xl border border-white/10 p-6">
                <h3 className="text-[13px] font-semibold text-white/70 mb-4">Alur Request Custom</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Isi Form", desc: "Pilih layanan dan jelaskan kebutuhan Anda" },
                    { step: "2", title: "Diskusi via WA", desc: "Tim kami menghubungi dalam 1x24 jam" },
                    { step: "3", title: "Penawaran Harga", desc: "Kami kirimkan quotation detail" },
                    { step: "4", title: "Produksi", desc: "Setelah deal, produksi dimulai" },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-secondary">{s.step}</span>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white">{s.title}</p>
                        <p className="text-[11px] text-white/40">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className="w-full mt-6 py-4 rounded-xl bg-secondary text-primary font-bold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-[14px] shadow-lg shadow-secondary/20"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  Kirim Request via WA
                </button>
                <p className="text-[11px] text-white/30 text-center mt-3 leading-relaxed">
                  Request dikirim ke WhatsApp kami. Admin akan membalas dalam 1x24 jam kerja.
                </p>
              </div>

              <div className="bg-primary-container rounded-2xl border border-white/10 p-5">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Kapasitas Produksi</p>
                <div className="space-y-2">
                  {[
                    { label: "Min. Order", value: "1 unit" },
                    { label: "Lead Time", value: "3–14 hari kerja" },
                    { label: "Toleransi", value: "±0.1 mm" },
                    { label: "Finishing", value: "Anodizing / Powder Coat" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-[12px]">
                      <span className="text-white/40">{item.label}</span>
                      <span className="text-white/80 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}