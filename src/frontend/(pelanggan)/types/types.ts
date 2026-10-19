import type { PortfolioItem, CaseStudy } from "@/services/portfolio/index";
export type { PortfolioItem, CaseStudy };

export interface CustomRequestFormItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  panjang: string;
  lebar: string;
  unitDimensi: string;
  technicalNote: string;
  inventoryItemId?: string;
}

export interface CustomRequestForm {
  nama: string;
  kode: string;
  perusahaan: string;
  email: string;
  telp: string;
  projectAddress: string;
  provinsi: string;
  kabupaten: string;
  layanan: string;
  deskripsi: string;
  deadline: string;
  items: CustomRequestFormItem[];
}

export const emptyCustomRequestForm: CustomRequestForm = {
  nama: "",
  kode: "",
  perusahaan: "",
  email: "",
  telp: "",
  projectAddress: "",
  provinsi: "",
  kabupaten: "",
  layanan: "",
  deskripsi: "",
  deadline: "",
  items: [
    {
      id: "item-1",
      name: "",
      quantity: "1",
      unit: "pcs",
      panjang: "",
      lebar: "",
      unitDimensi: "cm",
      technicalNote: "",
      inventoryItemId: undefined,
    },
  ],
};
