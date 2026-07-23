"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-primary py-section-gap-desktop" id="faq">
      <div className="max-w-container-max mx-auto grid gap-16 px-margin-x-mobile md:px-margin-x-desktop lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="text-secondary font-eyebrow text-eyebrow uppercase">
            PERTANYAAN UMUM
          </span>
          <h2 className="text-headline-h1 font-headline-h1 mt-4 mb-8 text-white">
            Segala yang Perlu Anda Ketahui
          </h2>
          <p className="text-primary-fixed-dim text-body-md mb-8">
            Informasi lengkap mengenai layanan, pengiriman, dan spesifikasi
            produk kami untuk kenyamanan transaksi Anda.
          </p>
          <div className="rounded-xl bg-primary-container p-8 text-white border border-white/10">
            <h4 className="font-bold mb-2">Masih punya pertanyaan?</h4>
            <p className="text-label-sm text-primary-fixed-dim mb-6">
              Hubungi tim ahli kami untuk konsultasi teknis gratis.
            </p>
            <a
              className="inline-block rounded-lg bg-secondary py-3 px-6 font-bold text-primary"
              href="#kontak"
            >
              Tanya Sekarang
            </a>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-4">
          {faqItems.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <div
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                key={question}
              >
                <button
                  className="group flex w-full items-center justify-between p-6 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  type="button"
                >
                  <span className="font-bold text-white transition-colors group-hover:text-secondary">
                    {question}
                  </span>
                  <span
                    className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? "rotate-180 text-secondary" : "text-white/60"}`}
                  >
                    expand_more
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="p-6 pt-0 text-label-sm text-white/70">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
