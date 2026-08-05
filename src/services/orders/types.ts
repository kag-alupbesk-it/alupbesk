export type OrderStatus = "pending" | "submitted_to_manager" | "confirmed" | "rejected_by_manager" | "processing" | "completed" | "cancelled";

export interface OrderLineInput {
  productId: number;
  quantity: number;
  variants?: Record<string, string>;
  note?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
}

export interface CreateOrderInput {
  items: OrderLineInput[];
  customer: CustomerDetails;
}

export interface OrderLine extends OrderLineInput {
  title: string;
  unitPrice: number;
  subtotal: number;
}

export interface LocalOrder {
  id: string;
  status: OrderStatus;
  customer: CustomerDetails;
  items: OrderLine[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}
