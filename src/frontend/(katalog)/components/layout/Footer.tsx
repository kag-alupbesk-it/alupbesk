import FooterLinks from "../shared/FooterLinks";

export default function Footer() {
  return (
    <footer className="bg-primary py-16 text-white">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-headline-h2 font-bold text-secondary-fixed">
                ALUPBESK
              </span>
            </div>
            <p className="text-label-sm leading-relaxed text-primary-fixed-dim">
              Penyedia solusi aluminium industrial terdepan dengan fokus pada
              presisi, kualitas, dan keberlanjutan pasokan material.
            </p>
          </div>
          <FooterLinks
            title="Tautan Cepat"
            links={[
              "Beranda",
              "Profile Perusahaan",
              "Katalog Produk",
              "Mitra Industri",
              "FAQ",
            ]}
          />
          <FooterLinks
            title="Produk Utama"
            links={[
              "Aluminum Extrusion",
              "Linear Guides",
              "Structural Framing",
              "Custom Machining",
            ]}
          />
          <div className="space-y-4">
            <h3 className="text-headline-h3 font-semibold text-secondary-fixed">
              Lokasi Kami
            </h3>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.849310412219!2d110.444865!3d-7.832166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5100040e42c3%3A0xedafc0d0b2eb3e8d!2sCV%20ALUPBESK%20CONTRACTOR!5e0!3m2!1sid!2sid!4v1"
                width="100%"
                height="180"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CV ALUPBESK CONTRACTOR - Google Maps"
                className="rounded-xl"
              />
            </div>
            <p className="text-label-sm leading-relaxed text-primary-fixed-dim">
            Karang Tengah Sitimulyo, Karang Anom, Sitimulyo, Kec. Piyungan, Kabupaten Bantul, Daerah Istimewa Yogyakarta,Indonesia
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-label-sm text-primary-fixed-dim">
            &copy; {new Date().getFullYear()} Alupbesk Industrial. All rights
            reserved.
          </p>
          <div className="flex gap-8 text-label-sm text-primary-fixed-dim">
            <a className="transition-colors hover:text-white" href="#">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-white" href="#">
              Terms of Service
            </a>
            <a className="transition-colors hover:text-white" href="#">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
