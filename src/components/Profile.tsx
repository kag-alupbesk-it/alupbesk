export default function Profile() {
  return (
    <section className="py-section-gap-desktop bg-primary" id="profile">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
          <div>
            <span className="text-secondary font-eyebrow text-eyebrow">TENTANG KAMI</span>
            <h2 className="text-headline-h1 font-headline-h1 mt-4 mb-8 text-primary">
              <span className="text-white">Inovasi Material untuk Masa Depan Industri</span>
            </h2>
            <div className="space-y-6 text-primary-fixed-dim text-body-md">
              <p>Berdiri sejak tahun 2009, Alupbesk telah bertransformasi dari penyedia lokal menjadi salah satu distributor utama komponen aluminium industrial di Asia Tenggara.</p>
              <p>Kami percaya bahwa presisi bukan sekadar angka, melainkan pondasi dari setiap struktur yang kokoh. Dengan komitmen pada kualitas ISO, kami memastikan setiap profil yang keluar dari gudang kami memenuhi standar teknis yang ketat.</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="p-6 bg-primary-container rounded-xl border border-white/10 text-primary-fixed-dim">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">visibility</span>
                <h4 className="font-bold text-white mb-2">Visi Kami</h4>
                <p className="text-label-sm">Menjadi hub komponen industrial terintegrasi yang memajukan manufaktur Indonesia.</p>
              </div>
              <div className="p-6 bg-primary-container rounded-xl border border-white/10 text-primary-fixed-dim">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">rocket_launch</span>
                <h4 className="font-bold text-white mb-2">Misi Kami</h4>
                <p className="text-label-sm">Memberikan solusi material tepat waktu dengan efisiensi biaya maksimal bagi mitra.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-xl overflow-hidden border-8 border-primary-container shadow-xl">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC6MKx3ZuelSAN5ql9d7eBk-1SmAJK6ck5AGgut1huxFtlVQafImhD-4_YuUlQO270DLupLoI31HI6vhU_2BhXQHWR8EtCWT8UfwC7n9UQEGmuVsT2X_gj6MgHoXDlDiIoa9kErwJ59RneuKu0SxMMBetqmPAa64jvQgWmWU1mY6SmJ4Hipg7lebGcm7BByg9cMQHTNMjNyF9l4MOu340rI4UZPLjnjobeNlNLF7wwE9Rc5OQmbDkGCHn9b4wE9zge2nTsm8LSVEso')" }}
              ></div>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-primary-container text-white p-8 rounded-xl max-w-xs shadow-2xl border border-white/10">
              <p className="italic text-body-md">"Alupbesk memberikan standar baru dalam distribusi aluminium. Cepat, tepat, dan berkualitas."</p>
              <div className="mt-4 font-bold text-secondary text-label-sm">— CEO Industrial Solution</div>
            </div>
          </div>
        </div>

       
        <div className="text-center">
        </div>
      </div>
    </section>
  );
}
