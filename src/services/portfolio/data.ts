export interface PortfolioItem {
  id: number;
  client: string;
  industry: string;
  title: string;
  challenge: string;
  solution: string;
  result: string;
  img: string;
  tags: string[];
  year: number;
}

export interface CaseStudy {
  id: number;
  client: string;
  logo: string; // initial/abbrev untuk placeholder
  industry: string;
  title: string;
  desc: string;
  metrics: { label: string; value: string }[];
  img: string;
  year: number;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    client: "PT Maju Bersama",
    industry: "Otomotif",
    title: "Rangka Conveyor Line Otomotif",
    challenge: "Klien membutuhkan 120 unit rangka conveyor dengan toleransi presisi tinggi untuk lini produksi otomotif baru.",
    solution: "Kami menyuplai profil T-Slot 4040 & 8080 custom-cut dengan toleransi ±0.1mm, lengkap dengan aksesoris bracket dan panel akrilik.",
    result: "Proyek selesai 2 minggu lebih cepat dari jadwal. Zero reject pada tahap QC akhir klien.",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    tags: ["T-Slot 8080", "Conveyor", "Custom Cut"],
    year: 2023,
  },
  {
    id: 2,
    client: "IndoSteel Corp",
    industry: "Manufaktur",
    title: "Workstation Industrial 50 Unit",
    challenge: "Kebutuhan 50 unit meja kerja industrial modular yang bisa dikonfigurasi ulang sesuai kebutuhan lantai produksi.",
    solution: "Desain rangka modular berbasis profil aluminium 4040 dengan sistem konektor quick-release. Semua komponen dapat dibongkar pasang tanpa alat khusus.",
    result: "Efisiensi pengaturan ulang layout pabrik meningkat 40%. Klien memesan 30 unit tambahan 3 bulan kemudian.",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    tags: ["4040 Profile", "Modular", "Workstation"],
    year: 2023,
  },
  {
    id: 3,
    client: "AluTech Solutions",
    industry: "Robotika",
    title: "Frame Mesin CNC Router",
    challenge: "Dibutuhkan frame mesin CNC router dengan rigiditas tinggi dan kemampuan menahan getaran frekuensi tinggi.",
    solution: "Kombinasi profil 8080 heavy-duty dan linear rail SBR20 dengan sistem anti-vibration mounting custom.",
    result: "Akurasi cutting meningkat 28%. Noise level turun 15dB dibanding frame besi sebelumnya.",
    img: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&q=80",
    tags: ["8080 Heavy Duty", "CNC", "Linear Rail"],
    year: 2024,
  },
  {
    id: 4,
    client: "MegaBuild Indonesia",
    industry: "Konstruksi",
    title: "Struktur Kanopi Aluminium",
    challenge: "Kanopi entrance gedung perkantoran 8 lantai dengan bentang 12 meter, harus tahan angin dan estetis.",
    solution: "Struktur aluminium plate 6061-T6 dengan sambungan las TIG presisi, finishing powder coating warna kustom RAL.",
    result: "Lulus uji beban 150% dari spesifikasi. Dipasang dalam 4 hari, lebih cepat dari estimasi 7 hari.",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    tags: ["Plate 6061", "Welding", "Powder Coating"],
    year: 2024,
  },
  {
    id: 5,
    client: "PT Energi Nusantara",
    industry: "Energi",
    title: "Mounting Panel Surya 200 Unit",
    challenge: "Mounting panel surya rooftop untuk 3 gedung industri, harus tahan korosi dan angin kencang.",
    solution: "Profil ekstrusi aluminium marine grade 6063-T5 dengan anodizing tebal 25 mikron, sistem adjustable tilt.",
    result: "Instalasi 200 unit selesai dalam 6 hari. Tidak ada kasus korosi setelah 18 bulan operasi.",
    img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    tags: ["Marine Grade", "Solar", "Anodizing"],
    year: 2024,
  },
  {
    id: 6,
    client: "Universitas Teknik Bandung",
    industry: "Pendidikan",
    title: "Lab Robotika — 20 Unit Gantry",
    challenge: "20 unit frame gantry robot untuk laboratorium riset dengan budget terbatas namun akurasi tinggi.",
    solution: "Desain efisien menggunakan profil 4040 & 2040, linear rail MGN12, dengan panduan assembly lengkap untuk mahasiswa.",
    result: "Biaya 35% lebih hemat dibanding solusi import. Seluruh unit selesai dirakit oleh mahasiswa dalam 2 hari workshop.",
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    tags: ["4040/2040", "Gantry", "Linear Rail MGN12"],
    year: 2023,
  },
];

export const caseStudies: CaseStudy[] = [
  {
    id: 1,
    client: "PT Maju Bersama",
    logo: "MB",
    industry: "Otomotif",
    title: "Peningkatan Efisiensi Rantai Pasok",
    desc: "Sejak bermitra dengan Alupbesk, kecepatan pengadaan komponen aluminium meningkat drastis. Ketersediaan stok yang handal membuat jadwal produksi tidak pernah terganggu.",
    metrics: [
      { label: "Efisiensi Pengadaan", value: "+35%" },
      { label: "Downtime Produksi", value: "0 jam" },
      { label: "Penghematan Biaya", value: "22%" },
    ],
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
    year: 2023,
  },
  {
    id: 2,
    client: "IndoSteel Corp",
    logo: "IS",
    industry: "Manufaktur",
    title: "Zero Reject pada QC Material",
    desc: "Kualitas material yang dikirimkan selalu sesuai dengan sertifikat uji teknis. Konsistensi dimensi dan finishing memudahkan tim QC dan mempercepat proses produksi.",
    metrics: [
      { label: "Tingkat Reject QC", value: "0%" },
      { label: "Konsistensi Dimensi", value: "±0.05mm" },
      { label: "Waktu Inspeksi", value: "-60%" },
    ],
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80",
    year: 2024,
  },
];