import { getCatalogProduct } from "@/services/catalog";
import { saveLocalOrder } from "./saveLocalOrder";
import { notifyOrderStatusChange } from "@/services/push/orderNotifications";
import type { CreateOrderInput, LocalOrder, OrderLine } from "./types";

export function createLocalOrder(input: CreateOrderInput): LocalOrder {
  if (!input.items.length) throw new Error("Pesanan harus memiliki minimal satu produk.");
  const lines: OrderLine[] = input.items.map((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error("Jumlah produk harus positif.");
    const product = getCatalogProduct(item.productId);
    if (!product) throw new Error(`Produk ${item.productId} tidak ditemukan.`);
    if (product.stock <= 0 || item.quantity > product.stock) throw new Error(`Stok ${product.title} tidak mencukupi.`);
    return { ...item, title: product.title, unitPrice: product.price, subtotal: product.price * item.quantity };
  });
  const now = new Date().toISOString();
  const order: LocalOrder = { id: crypto.randomUUID(), status: "pending", customer: input.customer, items: lines, total: lines.reduce((total, line) => total + line.subtotal, 0), createdAt: now, updatedAt: now };
  saveLocalOrder(order);
  notifyOrderStatusChange(order, "pending");
  return order;
}
