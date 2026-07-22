export default function Partners() {
  // Data dummy logo berbentuk teks (typomark) agar bagian logo terlihat terisi penuh
  const dummyPartners = ["Ambatech", "IndoSteel", "MegaBuild", "ConstructCo", "AluTech", "InnoSpace"];

  return (
    <section className="py-section-gap-desktop bg-primary" id="partners">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-eyebrow text-eyebrow">MITRA KAMI</span>
          <h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">
            Dipercaya oleh Pemimpin Industri
          </h2>
        </div>
        
        {/* Grid Partner Logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center mb-24">
          {/* Logo 1 (Asli berupa gambar) */}
          
          
          {/* PERUBAHAN: Placeholder logo diubah menjadi nama perusahaan agar "ada isinya" dan tidak kosong */}
          {dummyPartners.map((partner, index) => (
             <div key={index} className="flex justify-center opacity-40 hover:opacity-100 transition-all duration-300 cursor-default">
                <span className="text-white font-bold text-xl tracking-widest uppercase">{partner}</span>
             </div>
          ))}
        </div>

        {/* Grid Testimonial */}
        <div className="grid gap-8 md:grid-cols-2">
          <Testimonial
            metric="+35%"
            title="Efisiensi Rantai Pasok"
            quote="Sejak bermitra dengan Alupbesk, kecepatan pengadaan komponen aluminium kami meningkat drastis. Ketersediaan stok mereka sangat handal."
            name="Iwan Hermawan"
            role="Logistics Mgr, PT Maju Bersama"
          />
          <Testimonial
            metric="0%"
            title="Tingkat Penolakan QC"
            quote="Kualitas material yang dikirimkan selalu sesuai dengan sertifikat uji teknis. Sangat memudahkan tim QC kami di lapangan."
            name="Rina Kusuma"
            role="Quality Head, IndoSteel Corp"
          />
        </div>
      </div>
    </section>
  );
}

function Testimonial({ metric, title, quote, name, role }: { metric: string; title: string; quote: string; name: string; role: string }) {
  return (
    // PERUBAHAN: Menggunakan efek bg-white/5 & backdrop-blur agar senada dengan card di Katalog, tanpa warna solid baru
    <article className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-10 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl transition-all duration-300">
      <span className="material-symbols-outlined absolute top-6 right-6 text-7xl text-secondary opacity-20 pointer-events-none">format_quote</span>
      
      <div className="text-headline-h1 text-secondary font-bold mb-4">{metric}</div>
      <p className="text-headline-h3 text-white mb-6">{title}</p>
      
      {/* PERUBAHAN: Teks quote diubah menjadi text-white/70 (putih transparan) agar kontras namun tetap lembut */}
      <p className="text-body-md text-white/70 mb-8 italic">&ldquo;{quote}&rdquo;</p>
      
      <div className="flex items-center gap-4">
        {/* Placeholder Avatar - menggunakan efek glass (white/10) */}
        <div className="h-12 w-12 rounded-full bg-white/10" />
        <div>
          <div className="font-bold text-white">{name}</div>
          {/* PERUBAHAN: Jabatan diubah menggunakan putih transparan 50% */}
          <div className="text-label-sm text-white/50">{role}</div>
        </div>
      </div>
    </article>
  );
}