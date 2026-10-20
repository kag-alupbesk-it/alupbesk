export interface StaticFaqItem {
  id: string;
  question: { en: string; id: string };
  answer: { en: string; id: string };
}

export const staticFaqData: StaticFaqItem[] = [
  {
    id: "1",
    question: { en: "Does Alupbesk offer custom cutting services?", id: "Apakah Alupbesk melayani pemotongan custom?" },
    answer: {
      en: "Yes, we provide precision cutting services according to your technical drawings using CNC cutting machines to ensure dimensional accuracy.",
      id: "Ya, kami menyediakan layanan pemotongan presisi sesuai gambar teknis Anda menggunakan mesin CNC cutting untuk memastikan akurasi dimensi.",
    },
  },
  {
    id: "2",
    question: { en: "What is the estimated delivery time for outside the city?", id: "Berapa lama estimasi pengiriman untuk luar kota?" },
    answer: {
      en: "Delivery time depends on the project location and selected expedition. Our team will confirm the schedule after the order is processed.",
      id: "Estimasi pengiriman bergantung pada lokasi proyek dan pilihan ekspedisi. Tim kami akan mengonfirmasi jadwal setelah pesanan diproses.",
    },
  },
  {
    id: "3",
    question: { en: "Is there a minimum order for B2B purchases?", id: "Apakah ada minimum order untuk pembelian B2B?" },
    answer: {
      en: "We serve both retail and large-scale purchases. Distributor pricing terms can be confirmed with our sales team.",
      id: "Kami melayani pembelian retail dan partai besar. Ketentuan harga distributor dapat dikonfirmasi kepada tim penjualan.",
    },
  },
  {
    id: "4",
    question: { en: "How do I get a material certificate?", id: "Bagaimana cara mendapatkan sertifikat material?" },
    answer: {
      en: "Material certificates can be requested upon ordering and availability will be confirmed by our team.",
      id: "Sertifikat material dapat diminta saat pemesanan dan akan dikonfirmasi ketersediaannya oleh tim kami.",
    },
  },
];
