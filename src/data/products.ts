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
}

export const products: Product[] = [
  {
    id: 1,
    badge: "In Stock",
    badgeBg: "bg-success",
    category: "PROFIL EKSTRUSI",
    title: "T-Slot Aluminum 4040",
    desc: "Profil standar untuk rangka mesin dan workstation industrial dengan durabilitas tinggi.",
    price: 125000,
    stock: 150,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2zDYfDPQRCFU9Hv20Z47_uvlI2eRBZNDstYo0yIr-z7SBrQf80xtUEVykli4ynO7xmBeOy38qru8uUOQGJUwa9bXaj7qIQ7DFPveodN9Jg0v9ieDAIWBCfaqX757wlT4HBeMRJesCoBIZsAReji5Ewn6NjtK4vk6zo-DY_69Zb96FFFZteF1ubS-JZcFr1miTJmZ7Szr3xIHBKeqjxGTi_E55qOFq_-y239gi_osNxNLgZLMlwMna68twTdjG75IFp9ASFE_InCY",
  },
  {
    id: 2,
    badge: "Limited",
    badgeBg: "bg-secondary",
    category: "AKSESORIS",
    title: "Angle Bracket HD",
    desc: "Penyambung sudut heavy-duty dengan material aluminium die-cast untuk stabilitas maksimal.",
    price: 45000,
    stock: 30,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRhmyJkMT3IBV7DuxGBMPSNr-gaJJRD1shSGQSjoaydygKWHEVM-NShZMfljIV7sY1olkekHXhFnYJIeTZZFf2XC5ml4Q1C3EDgPBwxFrhwMwxf18KEjImp0qU8lGLIz-59nuWZvOY5kSSqgcx5GvkLjOwU0qc8wgy_cqbWeesbcE41OOfUX2fyIWJuxV9wKjrrmBUUwxs-n9CO5_1dLjsG32Sy3n5rCoJKQAiLjcx3wbFGF_umvGXEz_sI3YOdL3d5vK2ed39CpM",
  },
  {
    id: 3,
    badge: "In Stock",
    badgeBg: "bg-success",
    category: "SISTEM LINIER",
    title: "Linear Rail SBR16",
    desc: "Rel pemandu linier dengan koefisien gesekan rendah untuk akurasi gerakan tinggi.",
    price: 280000,
    stock: 75,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6jqk1YW2Du6Vd_2ptSiP7rui2MZ8x3xUaDSCOQD_aQPAyJ6n2HIvi5RQAdLKHDNwfxhGfJvP2D67EhnzikqDz3THthUWcdSbXgvZzMWPlvQr2gvBOgBp0I8T-CAUdwWPqiT3QMZcA9XH3CW_zIhTlTtSjFvTER_8c4SEC68AtVOpZ0_JN9xeGiYd4qC1AKld8Y9pzqhuud-NAqWaL3GCgqd_BY5juSR_EHIGQE_L7FE1mJriZraL0O_0cgOiEE5XMIDFaJcci7us",
  },
  {
    id: 4,
    badge: "In Stock",
    badgeBg: "bg-success",
    category: "LEMBARAN",
    title: "Aluminium Plate 6061",
    desc: "Plat paduan aluminium dengan kekuatan tinggi untuk aplikasi struktural dan dirgantara.",
    price: 520000,
    stock: 40,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAK2sheNgcQjh4f4wICpYPbeom1cRrboOLNMBHjSWXDLZvCNoWJWS81kr9iG9Feh6DCnhcA0368B8zZqCq4PttRBR4CCZNX_NgomMF3fNEcJTfG98qCWOhhtRQTeXGkiowkZTD-a2LmZAMFPqKIqwYhprRmyrQyG3YxhFCNaxkvIV6xQV6uw_mSh2MNOdNihidwa4OcowAw1MsDUcZE6CUnbOew44HaiFQnHtfdaVl-OhEst6qJYXDMI039_0TYNf3HW03y6qstNzM",
  },
];
