import type { Product, ProductVariant } from "@/services/catalog/products";
import type { PortfolioItem, CaseStudy } from "@/services/portfolio";
export type { Product, ProductVariant, PortfolioItem, CaseStudy };

export interface CartItem {
  product: Product;
  quantity: number;
  note: string;
  selectedVariants?: Record<string, string>;
}

export interface CustomRequestForm {
  nama: string;
  perusahaan: string;
  email: string;
  telp: string;
  layanan: string;
  deskripsi: string;
  dimensi: string;
  kuantitas: string;
  deadline: string;
}

export const emptyCustomRequestForm: CustomRequestForm = {
  nama: "",
  perusahaan: "",
  email: "",
  telp: "",
  layanan: "",
  deskripsi: "",
  dimensi: "",
  kuantitas: "",
  deadline: "",
};
