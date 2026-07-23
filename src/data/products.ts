export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: number;
  badge: string;
  badgeBg: string;
  category: string;
  title: string;
  desc: string;
  price: number;
  stock: number;
  img: string;
  sku: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  variants?: ProductVariant[];
  datasheet?: string;
}

export const products: Product[] = [
    {
    id: 1,
    badge: "In Stock",
    badgeBg: "bg-success",
    category: "PROFIL EKSTRUSI",
    title: "T-Slot Aluminum 4040",
    desc: "Profil standar untuk rangka mesin dan workstation industrial dengan durabilitas tinggi. Cocok untuk konstruksi frame CNC, conveyor, dan meja kerja presisi.",
    sku: "ALU-4040-500",
    price: 125000,
    stock: 150,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2zDYfDPQRCFU9Hv20Z47_uvlI2eRBZNDstYo0yIr-z7SBrQf80xtUEVykli4ynO7xmBeOy38qru8uUOQGJUwa9bXaj7qIQ7DFPveodN9Jg0v9ieDAIWBCfaqX757wlT4HBeMRJesCoBIZsAReji5Ewn6NjtK4vk6zo-DY_69Zb96FFFZteF1ubS-JZcFr1miTJmZ7Szr3xIHBKeqjxGTi_E55qOFq_-y239gi_osNxNLgZLMlwMna68twTdjG75IFp9ASFE_InCY",
    highlights: [
      "Bisa dipotong custom sesuai permintaan",
      "Kompatibel dengan semua aksesoris T-Slot standar",
      "Permukaan anodized tahan korosi",
      "Cocok untuk CNC, conveyor & meja kerja",
    ],
    specs: [
      { label: "Material", value: "Aluminium Alloy 6063-T5" },
      { label: "Ukuran Profil", value: "40 × 40 mm" },
      { label: "Panjang Default", value: "500 mm (custom tersedia)" },
      { label: "Lebar Slot", value: "8 mm" },
      { label: "Berat", value: "±1.08 kg/m" },
      { label: "Finishing", value: "Natural Anodized" },
    ],
    variants: [
      { name: "Ukuran", options: ["40x40", "40x80", "40x120"] },
      { name: "Panjang", options: ["1m", "2m", "3m", "6m"] },
    ],
    datasheet: "datasheet-tslot-4040.pdf",
  },
  {
    id: 2,
    badge: "Limited",
    badgeBg: "bg-secondary",
    category: "AKSESORIS",
    title: "Angle Bracket HD",
    desc: "Penyambung sudut heavy-duty dengan material aluminium die-cast untuk stabilitas sambungan 90° yang maksimal pada rangka profil T-Slot.",
    sku: "ACC-BRKT-HD90",
    price: 45000,
    stock: 30,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRhmyJkMT3IBV7DuxGBMPSNr-gaJJRD1shSGQSjoaydygKWHEVM-NShZMfljIV7sY1olkekHXhFnYJIeTZZFf2XC5ml4Q1C3EDgPBwxFrhwMwxf18KEjImp0qU8lGLIz-59nuWZvOY5kSSqgcx5GvkLjOwU0qc8wgy_cqbWeesbcE41OOfUX2fyIWJuxV9wKjrrmBUUwxs-n9CO5_1dLjsG32Sy3n5rCoJKQAiLjcx3wbFGF_umvGXEz_sI3YOdL3d5vK2ed39CpM",
    highlights: [
      "Sambungan sudut 90° presisi tinggi",
      "Termasuk baut & mur T-Slot",
      "Stok terbatas — segera pesan",
      "Kompatibel dengan profil 4040 & 4080",
    ],
    specs: [
      { label: "Material", value: "Aluminium Die-Cast" },
      { label: "Sudut", value: "90°" },
      { label: "Ukuran", value: "40 × 40 mm" },
      { label: "Finishing", value: "Natural / Silver" },
      { label: "Isi Paket", value: "1 Bracket + 2 Baut M5 + 2 Mur T" },
      { label: "Beban Maks", value: "±80 kg" },
    ],
    variants: [
      { name: "Ukuran", options: ["20x20", "30x30", "40x40"] },
    ],
  },
  {
    id: 3,
    badge: "In Stock",
    badgeBg: "bg-success",
    category: "SISTEM LINIER",
    title: "Linear Rail SBR16",
    desc: "Rel pemandu linier dengan koefisien gesekan rendah untuk akurasi gerakan tinggi. Ideal untuk mesin CNC, 3D printer, dan laser cutting.",
    sku: "LIN-SBR16-1000",
    price: 280000,
    stock: 75,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6jqk1YW2Du6Vd_2ptSiP7rui2MZ8x3xUaDSCOQD_aQPAyJ6n2HIvi5RQAdLKHDNwfxhGfJvP2D67EhnzikqDz3THthUWcdSbXgvZzMWPlvQr2gvBOgBp0I8T-CAUdwWPqiT3QMZcA9XH3CW_zIhTlTtSjFvTER_8c4SEC68AtVOpZ0_JN9xeGiYd4qC1AKld8Y9pzqhuud-NAqWaL3GCgqd_BY5juSR_EHIGQE_L7FE1mJriZraL0O_0cgOiEE5XMIDFaJcci7us",
    highlights: [
      "Akurasi gerakan ±0.02 mm",
      "Tersedia panjang 300mm hingga 1500mm",
      "Sudah termasuk 2 blok luncur (SBR16UU)",
      "Cocok untuk CNC, 3D printer & laser",
    ],
    specs: [
      { label: "Diameter Rel", value: "16 mm" },
      { label: "Panjang Default", value: "1000 mm (custom tersedia)" },
      { label: "Material Rel", value: "Baja Chrome (SUJ2)" },
      { label: "Blok Luncur", value: "2x SBR16UU" },
      { label: "Beban Dinamis", value: "1,530 N" },
      { label: "Finishing", value: "Chrome Plated" },
    ],
    variants: [
      { name: "Tipe", options: ["SBR16", "SBR20", "SBR25"] },
      { name: "Panjang", options: ["400mm", "600mm", "1000mm"] },
    ],
  },
  {
    id: 4,
    badge: "In Stock",
    badgeBg: "bg-success",
    category: "LEMBARAN",
    title: "Aluminium Plate 6061",
    desc: "Plat paduan aluminium dengan kekuatan tarik tinggi untuk aplikasi struktural, dirgantara, dan komponen mesin presisi.",
    sku: "PLT-6061-T6-3",
    price: 520000,
    stock: 40,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAK2sheNgcQjh4f4wICpYPbeom1cRrboOLNMBHjSWXDLZvCNoWJWS81kr9iG9Feh6DCnhcA0368B8zZqCq4PttRBR4CCZNX_NgomMF3fNEcJTfG98qCWOhhtRQTeXGkiowkZTD-a2LmZAMFPqKIqwYhprRmyrQyG3YxhFCNaxkvIV6xQV6uw_mSh2MNOdNihidwa4OcowAw1MsDUcZE6CUnbOew44HaiFQnHtfdaVl-OhEst6qJYXDMI039_0TYNf3HW03y6qstNzM",
    highlights: [
      "Bisa dipotong & dibor sesuai ukuran",
      "Kekuatan tarik hingga 310 MPa",
      "Mudah di-machining & las",
      "Toleransi dimensi ±0.1 mm",
    ],
    specs: [
      { label: "Paduan", value: "Aluminium 6061-T6" },
      { label: "Ukuran Default", value: "300 × 300 mm" },
      { label: "Ketebalan", value: "3 mm (tersedia 1–20 mm)" },
      { label: "Kekuatan Tarik", value: "310 MPa" },
      { label: "Kekerasan", value: "95 HB" },
      { label: "Finishing", value: "Mill Finish / Anodized" },
    ],
    variants: [
      { name: "Ketebalan", options: ["3mm", "5mm", "6mm", "10mm"] },
      { name: "Ukuran", options: ["1x1m", "1x2m", "1.2x2.4m"] },
    ],
  },
];
