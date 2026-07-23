import { listenOrder } from "./orderStore";
import type { OrderStatusEvent } from "./types";
export function subscribeOrderStatus(id: string, listener: (event: OrderStatusEvent) => void): () => void { return listenOrder(id, listener); }
