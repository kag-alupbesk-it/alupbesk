import { enqueueUpsert, enqueueDelete } from "@/services/supabase";

export interface ProductVariant {
  name: string;
  options: string[];
  colors?: string[];
}

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
  sku: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  variants?: ProductVariant[];
  datasheet?: string;
  bestSeller?: boolean;
  soldCount?: number;
}

export type ProductInput = Omit<Product, "id" | "badgeBg" | "highlights" | "specs" | "variants" | "datasheet" | "bestSeller" | "soldCount"> & {
  badgeBg?: string;
  highlights?: string[];
  specs?: { label: string; value: string }[];
  variants?: ProductVariant[];
  datasheet?: string;
  bestSeller?: boolean;
  soldCount?: number;
};

export const products: Product[] = [];


// Produk & harga dikelola divisi marketing, sedangkan stok dikelola gudang.
// Array ini dimutasi langsung sehingga katalog website selalu memakai data terbaru.
function persistProductVariants(productId: number, variants?: ProductVariant[]): void {
  enqueueDelete("product_variants", "product_id", String(productId));
  for (const variant of variants ?? []) {
    enqueueUpsert(
      "product_variants",
      { product_id: productId, name: variant.name, options: variant.options, colors: variant.colors ?? null },
    );
  }
}

export function createProduct(input: ProductInput): Product {
  const id = products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
  const product: Product = {
    id,
    badge: input.badge,
    badgeBg: input.badgeBg ?? "bg-success",
    category: input.category,
    title: input.title,
    desc: input.desc,
    price: input.price,
    stock: input.stock,
    img: input.img,
    sku: input.sku,
    highlights: input.highlights ?? [],
    specs: input.specs ?? [],
    variants: input.variants,
    datasheet: input.datasheet,
    bestSeller: input.bestSeller,
    soldCount: input.soldCount,
  };
  products.push(product);
  enqueueUpsert(
    "products",
    {
      id: product.id,
      sku: product.sku,
      badge: product.badge,
      badge_bg: product.badgeBg,
      category: product.category,
      title: product.title,
      description: product.desc,
      price: product.price,
      stock: product.stock,
      img: product.img,
      datasheet: product.datasheet ?? null,
      best_seller: product.bestSeller ?? false,
      sold_count: product.soldCount ?? 0,
      highlights: product.highlights ?? [],
      specs: product.specs ?? [],
    },
    "id",
  );
  persistProductVariants(product.id, product.variants);
  return product;
}

export function updateProduct(id: number, input: Partial<ProductInput>): Product | undefined {
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return undefined;
  products[index] = { ...products[index], ...input, id };
  enqueueUpsert(
    "products",
    {
      id: products[index].id,
      sku: products[index].sku,
      badge: products[index].badge,
      badge_bg: products[index].badgeBg,
      category: products[index].category,
      title: products[index].title,
      description: products[index].desc,
      price: products[index].price,
      stock: products[index].stock,
      img: products[index].img,
      datasheet: products[index].datasheet ?? null,
      best_seller: products[index].bestSeller ?? false,
      sold_count: products[index].soldCount ?? 0,
      highlights: products[index].highlights ?? [],
      specs: products[index].specs ?? [],
    },
    "id",
  );
  persistProductVariants(products[index].id, products[index].variants);
  return products[index];
}

export function deleteProduct(id: number): boolean {
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  enqueueDelete("products", "id", String(id));
  return true;
}
