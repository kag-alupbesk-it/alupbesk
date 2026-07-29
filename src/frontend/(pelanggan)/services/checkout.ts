const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface CreateOrderParams {
  items: { productId: number; quantity: number; variants?: Record<string, string>; note?: string }[];
  customer: { name: string; email: string; phone: string; address: string; note?: string };
}

export interface Order {
  id: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "completed";
  createdAt: string;
  total: number;
}

let orderCounter = 0;

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  await delay(500);
  orderCounter++;
  return {
    id: `ORD-${String(orderCounter).padStart(4, "0")}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    total: params.items.reduce((sum, item) => sum + item.quantity * 10000, 0),
  };
}
