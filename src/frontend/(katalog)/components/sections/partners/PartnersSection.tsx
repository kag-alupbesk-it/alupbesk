import { PartnerCarousel } from "./PartnerCarousel";

// Function untuk bagian mitra pada beranda.
export default function PartnersSection() {
  return <section className="py-section-gap-desktop bg-primary" id="partners"><div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop"><div className="mb-10 text-center"><span className="text-secondary font-eyebrow text-eyebrow">MITRA KAMI</span><h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">Dipercaya oleh Pemimpin Industri</h2><p className="mx-auto mt-3 max-w-xl text-sm text-white/50">Logo akan dapat dikelola dari admin saat integrasi media dan database diaktifkan.</p></div><PartnerCarousel /></div></section>;
}
