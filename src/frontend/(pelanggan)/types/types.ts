import type { Product, ProductVariant } from "@/services/catalog/products";
import type { PortfolioItem, CaseStudy } from "@/services/portfolio/index";
export type { Product, ProductVariant, PortfolioItem, CaseStudy };

export interface CustomRequestFormItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
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
  layanan: "",
  deskripsi: "",
  deadline: "",
  items: [{ id: "item-1", name: "", quantity: "1", unit: "pcs", technicalNote: "", inventoryItemId: undefined }],
};
