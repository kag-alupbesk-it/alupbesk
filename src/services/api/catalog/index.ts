import type { Product } from "@/services/catalog";
import { request } from "../request";
export const catalogApi = { getProducts: (): Promise<Product[]> => request("/catalog/products"), getProduct: (id: number): Promise<Product> => request(`/catalog/products/${id}`) };
