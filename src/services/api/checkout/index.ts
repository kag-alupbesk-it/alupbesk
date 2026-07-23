import type { CreateOrderInput, LocalOrder, OrderStatusEvent } from "@/services/orders";
import { getApiBaseUrl, request } from "../request";
export const checkoutApi = {
  createOrder: (input: CreateOrderInput): Promise<LocalOrder> => request("/checkout/orders", { method: "POST", body: JSON.stringify(input) }),
  getOrderStatus: (id: string): Promise<OrderStatusEvent> => request(`/checkout/orders/${id}/status`),
  subscribeOrderStatus: (id: string, listener: (event: OrderStatusEvent) => void): (() => void) => { const source = new EventSource(`${getApiBaseUrl()}/checkout/orders/${id}/status/stream`); source.onmessage = (message) => listener(JSON.parse(message.data) as OrderStatusEvent); return () => source.close(); },
};
