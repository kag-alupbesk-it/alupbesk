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
