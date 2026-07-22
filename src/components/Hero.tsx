export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-primary overflow-hidden" id="beranda">
      <div className="absolute inset-0 opacity-40">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAF01DjQuzxqehDWahuPf_aFZ3DcXxh2BQCZ6HnCpt0_6BjRemnRnCOreO2TuteIan0mTHZDXWotXGPoHKMVkicB5M76tANcB8cictuFOPGDHTtjt4X50Klwc7yOeYbxWSeeQhk2awTZI3kVF80cvuF_fo60X4dAZeiHPA-U-2pkWgj2_SYaqTqgKLwGjJ1hjgIBqe1Nu9AVSLCoCEbRxMKYknt41vggriwhwoIgYvhxTnUvHQZ495EOROjUTitJHD1WSaQZeQs1vk')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          
          <h1 className="text-display-hero-mobile md:text-display-hero font-display-hero text-white leading-tight">
            Solusi Produk Aluminium &amp; Komponen Industrial <span className="text-secondary">Terpercaya</span>
          </h1>
          <p className="text-primary-fixed-dim text-body-lg max-w-xl">
            Menyediakan material aluminium berkualitas tinggi dan komponen industri presisi untuk mendukung akselerasi produksi bisnis Anda di seluruh Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a className="px-8 py-4 bg-secondary text-primary font-bold rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-all group" href="#katalog">
              Lihat Katalog
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
            <a className="px-8 py-4 border border-white text-white font-bold rounded-full flex items-center justify-center gap-2 hover:bg-white hover:text-primary transition-all" href="#">
              <span className="material-symbols-outlined">chat</span>
              Hubungi via WhatsApp
            </a>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="text-headline-h2 text-secondary font-bold">15+</div>
              <div className="text-label-sm text-primary-fixed-dim">Tahun Pengalaman</div>
            </div>
            <div>
              <div className="text-headline-h2 text-secondary font-bold">500+</div>
              <div className="text-label-sm text-primary-fixed-dim">Partner Industri</div>
            </div>
            <div>
              <div className="text-headline-h2 text-secondary font-bold">1k+</div>
              <div className="text-label-sm text-primary-fixed-dim">Varian Produk</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}