import { products, type Product } from "@/services/catalog";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getProducts(): Promise<Product[]> {
  await delay(300);
  return products;
}

export async function getProduct(id: number): Promise<Product | undefined> {
  await delay(200);
  return products.find((p) => p.id === id);
}

export interface CatalogSearchParams {
  query?: string;
  category?: string;
}

export async function searchProducts(params: CatalogSearchParams): Promise<Product[]> {
  await delay(200);
  return products.filter((p) => {
    const matchCategory = !params.category || params.category === "Semua" || p.category === params.category;
    const matchQuery = !params.query || `${p.title} ${p.sku} ${p.desc}`.toLowerCase().includes(params.query.toLowerCase());
    return matchCategory && matchQuery;
  });
}

export function getCategories(): string[] {
  return ["Semua", ...new Set(products.map((p) => p.category))];
}
