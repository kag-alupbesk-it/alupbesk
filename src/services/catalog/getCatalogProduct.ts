import { products, type Product } from "./products";

export function getCatalogProduct(id: number): Product | undefined {
  return products.find((product) => product.id === id);
}
