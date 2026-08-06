import type { MarketingProduct } from "@/backend/modules/marketing";

export type { MarketingProduct };

export interface ProductFormData {
  title: string;
  category: string;
  sku: string;
  price: string;
  stock: string;
  badge: string;
  img: string;
  desc: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormData = {
  title: "",
  category: "",
  sku: "",
  price: "",
  stock: "0",
  badge: "In Stock",
  img: "",
  desc: "",
};

export function formatPrice(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}
