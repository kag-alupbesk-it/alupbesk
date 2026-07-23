import { portfolioItems, caseStudies } from "@/data/portfolio";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/(katalog)/components/layout/Navbar";
import Footer from "@/(katalog)/components/layout/Footer";

export const metadata = {
  title: "Portofolio Proyek — ALUPBESK",
  description: "Galeri proyek dan studi kasus nyata pengerjaan komponen aluminium industrial oleh ALUPBESK.",
};

export default function PortofolioPage() {
  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 pt-28">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">PORTOFOLIO</span>
          <h2 className="text-[36px] md:text-[48px] font-bold text-white mt-3 leading-tight">
            Proyek yang Sudah<br />
            <span className="text-secondary">Kami Kerjakan</span>
          </h2>
          <p className="text-white/50 text-[15px] mt-4 max-w-xl mx-auto">
            Dari rangka conveyor hingga mounting panel surya — setiap proyek dikerjakan dengan presisi dan standar kualitas industrial.
          </p>
        </div>

        {/* Grid Proyek */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="group bg-primary-container rounded-2xl border border-white/10 overflow-hidden hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Gambar */}
              <div className="relative aspect-video overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${item.img}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  <span className="bg-secondary text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                    {item.industry}
                  </span>
                  <span className="bg-black/50 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-full">
                    {item.year}
                  </span>
                </div>
              </div>

              {/* Konten */}
              <div className="p-5">
                <p className="text-[11px] text-white/40 mb-1">{item.client}</p>
                <h3 className="text-[15px] font-bold text-white mb-3 leading-snug">{item.title}</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-secondary/70 bg-secondary/10 px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Challenge → Solution → Result */}
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Tantangan</p>
                    <p className="text-[12px] text-white/60 leading-relaxed line-clamp-2">{item.challenge}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-wider mb-1">Hasil</p>
                    <p className="text-[12px] text-white/70 leading-relaxed line-clamp-2">{item.result}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Studi Kasus */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">STUDI KASUS</span>
            <h2 className="text-[28px] font-bold text-white mt-2">Dampak Nyata bagi Klien Kami</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {caseStudies.map((cs) => (
              <div key={cs.id} className="bg-primary-container rounded-2xl border border-white/10 p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary font-bold text-[14px]">{cs.logo}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white">{cs.client}</p>
                    <p className="text-[11px] text-white/40">{cs.industry} · {cs.year}</p>
                  </div>
                </div>
                <h3 className="text-[16px] font-bold text-white mb-3">{cs.title}</h3>
                <p className="text-[13px] text-white/60 leading-relaxed mb-5">{cs.desc}</p>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="text-[20px] font-bold text-secondary">{m.value}</p>
                      <p className="text-[10px] text-white/40 leading-tight mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary-container rounded-2xl border border-white/10 p-8 md:p-12 text-center">
          <h3 className="text-[24px] font-bold text-white mb-3">Punya Proyek Serupa?</h3>
          <p className="text-white/50 text-[14px] mb-6 max-w-md mx-auto">
            Ceritakan kebutuhan Anda dan kami akan bantu wujudkan dengan material terbaik.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jasa-custom"
              className="px-8 py-3.5 bg-secondary text-primary font-bold rounded-xl hover:brightness-110 transition-all text-[14px]"
            >
              Request Custom Quote
            </Link>
            <Link
              href="/#kontak"
              className="px-8 py-3.5 border border-white/20 text-white font-bold rounded-xl hover:border-white/40 transition-all text-[14px]"
            >
              Hubungi Tim Kami
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}