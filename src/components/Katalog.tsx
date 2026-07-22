export default function Katalog() {
  const products = [
    {
      badge: "In Stock", badgeBg: "bg-success",
      category: "PROFIL EKSTRUSI", title: "T-Slot Aluminum 4040",
      desc: "Profil standar untuk rangka mesin dan workstation industrial dengan durabilitas tinggi.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2zDYfDPQRCFU9Hv20Z47_uvlI2eRBZNDstYo0yIr-z7SBrQf80xtUEVykli4ynO7xmBeOy38qru8uUOQGJUwa9bXaj7qIQ7DFPveodN9Jg0v9ieDAIWBCfaqX757wlT4HBeMRJesCoBIZsAReji5Ewn6NjtK4vk6zo-DY_69Zb96FFFZteF1ubS-JZcFr1miTJmZ7Szr3xIHBKeqjxGTi_E55qOFq_-y239gi_osNxNLgZLMlwMna68twTdjG75IFp9ASFE_InCY"
    },
    {
      badge: "Limited", badgeBg: "bg-secondary",
      category: "AKSESORIS", title: "Angle Bracket HD",
      desc: "Penyambung sudut heavy-duty dengan material aluminium die-cast untuk stabilitas maksimal.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRhmyJkMT3IBV7DuxGBMPSNr-gaJJRD1shSGQSjoaydygKWHEVM-NShZMfljIV7sY1olkekHXhFnYJIeTZZFf2XC5ml4Q1C3EDgPBwxFrhwMwxf18KEjImp0qU8lGLIz-59nuWZvOY5kSSqgcx5GvkLjOwU0qc8wgy_cqbWeesbcE41OOfUX2fyIWJuxV9wKjrrmBUUwxs-n9CO5_1dLjsG32Sy3n5rCoJKQAiLjcx3wbFGF_umvGXEz_sI3YOdL3d5vK2ed39CpM"
    },
    {
      badge: "In Stock", badgeBg: "bg-success",
      category: "SISTEM LINIER", title: "Linear Rail SBR16",
      desc: "Rel pemandu linier dengan koefisien gesekan rendah untuk akurasi gerakan tinggi.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6jqk1YW2Du6Vd_2ptSiP7rui2MZ8x3xUaDSCOQD_aQPAyJ6n2HIvi5RQAdLKHDNwfxhGfJvP2D67EhnzikqDz3THthUWcdSbXgvZzMWPlvQr2gvBOgBp0I8T-CAUdwWPqiT3QMZcA9XH3CW_zIhTlTtSjFvTER_8c4SEC68AtVOpZ0_JN9xeGiYd4qC1AKld8Y9pzqhuud-NAqWaL3GCgqd_BY5juSR_EHIGQE_L7FE1mJriZraL0O_0cgOiEE5XMIDFaJcci7us"
    },
    {
      badge: "In Stock", badgeBg: "bg-success",
      category: "LEMBARAN", title: "Aluminium Plate 6061",
      desc: "Plat paduan aluminium dengan kekuatan tinggi untuk aplikasi struktural dan dirgantara.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAK2sheNgcQjh4f4wICpYPbeom1cRrboOLNMBHjSWXDLZvCNoWJWS81kr9iG9Feh6DCnhcA0368B8zZqCq4PttRBR4CCZNX_NgomMF3fNEcJTfG98qCWOhhtRQTeXGkiowkZTD-a2LmZAMFPqKIqwYhprRmyrQyG3YxhFCNaxkvIV6xQV6uw_mSh2MNOdNihidwa4OcowAw1MsDUcZE6CUnbOew44HaiFQnHtfdaVl-OhEst6qJYXDMI039_0TYNf3HW03y6qstNzM"
    }
  ];

  return (
    <section className="py-section-gap-desktop bg-primary" id="katalog">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">KATALOG PRODUK</span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">
              Komponen Presisi untuk Konstruksi Unggul
            </h2>
          </div>
          <a className="text-secondary font-bold flex items-center gap-2 group hover:gap-4 transition-all" href="#">
            Lihat Semua Produk
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </a>
        </div>

        {/* Grid Katalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item, i) => (
            // PERUBAHAN: Background diubah menjadi bg-white/5 dengan backdrop-blur, border lebih soft
            <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/10">
              <div className="relative aspect-square">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${item.img}')` }}></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`${item.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                    {item.badge}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-secondary text-[12px] font-bold uppercase tracking-widest mb-2">{item.category}</div>
                {/* PERUBAHAN: Judul diubah jadi putih agar terbaca di background gelap */}
                <h4 className="text-headline-h3 text-white mb-2">{item.title}</h4>
                {/* PERUBAHAN: Deskripsi diubah jadi putih transparan */}
                <p className="text-label-sm text-white/70 mb-6 line-clamp-2">{item.desc}</p>
                {/* PERUBAHAN: Tombol transparan, jika di-hover menjadi warna secondary */}
                <button className="w-full py-3 rounded-lg border border-white/20 text-white group-hover:bg-secondary group-hover:border-secondary group-hover:text-primary transition-all font-bold text-label-sm">
                  Detail Produk
                </button>
              </div>
            </div>
          ))}

          {/* Placeholders */}
          {[5, 6, 7, 8].map((num) => (
            // PERUBAHAN: Menyesuaikan placeholder agar serasi dengan card produk di atasnya
            <div key={num} className="hidden lg:flex bg-white/5 rounded-xl border border-dashed border-white/20 items-center justify-center p-8 text-center text-white/50 transition-all hover:bg-white/10 hover:border-white/30 cursor-default">
              <p className="text-label-sm italic">Produk Katalog {num} tersedia di navigasi &apos;Lihat Semua&apos;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}