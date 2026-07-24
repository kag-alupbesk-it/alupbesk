import { readOrders } from "./orderStore";
import type { LocalOrder } from "./types";

// Function untuk membaca seluruh pesanan sementara bagi admin lokal.
export function getLocalOrders(): LocalOrder[] { return readOrders(); }
