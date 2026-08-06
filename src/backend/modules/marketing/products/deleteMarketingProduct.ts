import { deleteProduct } from "@/services/catalog";

export function deleteMarketingProduct(id: number): boolean {
  return deleteProduct(id);
}
