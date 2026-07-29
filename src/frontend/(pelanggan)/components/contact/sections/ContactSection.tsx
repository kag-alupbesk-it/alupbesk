import ContactDetail from "../../shared/ContactDetail";
import FormField from "../../shared/FormField";

export default function ContactSection() {
  return (
    <section className="bg-primary py-section-gap-desktop" id="kontak">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:flex-row">
          <div className="flex flex-col justify-between bg-primary-container p-12 text-white lg:w-2/5">
            <div>
              <h2 className="text-headline-h1 font-headline-h1 mb-6">
                Ayo Berdiskusi Mengenai Proyek Anda
              </h2>
              <p className="text-primary-fixed-dim mb-12">
                Tim ahli kami siap membantu Anda memilih komponen yang paling
                efisien untuk kebutuhan produksi Anda.
              </p>
              <div className="space-y-8">
                <ContactDetail
                  icon="location_on"
                  title="Kantor Pusat"
                  text="5C9W+4XP, Karang Tengah Sitimulyo, Karang Anom, Sitimulyo, Kec. Piyungan, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55792"
                />
                <ContactDetail
                  icon="mail"
                  title="Email"
                  text="sales@alupbesk.co.id"
                />
                <ContactDetail
                  icon="phone"
                  title="Telepon / WA"
                  text="+62 21 8901 2345 / +62 812 3456 7890"
                />
              </div>
            </div>
            <div className="mt-12 flex gap-4">
              <a
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-secondary"
                href="#"
              >
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
              <a
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-secondary"
                href="#"
              >
                <span className="material-symbols-outlined">
                  business_center
                </span>
              </a>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-12 lg:w-3/5">
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  label="Nama Lengkap"
                  placeholder="John Doe"
                  type="text"
                />
                <FormField
                  label="Email Perusahaan"
                  placeholder="john@perusahaan.com"
                  type="email"
                />
              </div>
              <label className="block space-y-2">
                <span className="text-label-sm font-bold text-white">
                  Kategori Produk
                </span>
                <select className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white focus:border-secondary focus:outline-none">
                  <option className="bg-primary text-white">Pilih Kategori</option>
                  <option className="bg-primary text-white">Profil Ekstrusi</option>
                  <option className="bg-primary text-white">Linear Motion</option>
                  <option className="bg-primary text-white">Aksesoris Framing</option>
                  <option className="bg-primary text-white">Lainnya</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-label-sm font-bold text-white">
                  Pesan
                </span>
                <textarea
                  className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white placeholder:text-white/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                  placeholder="Detail kebutuhan atau pertanyaan Anda..."
                  rows={4}
                />
              </label>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-4 font-bold text-primary transition-all hover:bg-secondary-800"
                type="submit"
              >
                Kirim Pesan{" "}
                <span className="material-symbols-outlined">send</span>
              </button>
              <p className="text-center text-[12px] text-white/50">
                Dengan mengirim form ini, Anda menyetujui kebijakan privasi
                kami.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
