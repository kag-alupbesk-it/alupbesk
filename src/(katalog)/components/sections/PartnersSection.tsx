import { dummyPartners, testimonials } from "@/data/partners";


export default function PartnersSection() {
  return (
    <section className="py-section-gap-desktop bg-primary" id="partners">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-eyebrow text-eyebrow">
            MITRA KAMI
          </span>
          <h2 className="text-headline-h1 font-headline-h1 mt-4 text-white">
            Dipercaya oleh Pemimpin Industri
          </h2>
        </div>

        {/* Grid Partner Logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center mb-24">
          {dummyPartners.map((partner, index) => (
            <div
              key={index}
              className="flex justify-center opacity-40 hover:opacity-100 transition-all duration-300 cursor-default"
            >
              <span className="text-white font-bold text-xl tracking-widest uppercase">
                {partner}
              </span>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
}
