import { getMarketingOrders } from "./getMarketingOrders";
import type { MarketingReport } from "./types";
export function getMarketingReport(): MarketingReport { const orders = getMarketingOrders(); return { totalPesanan: orders.length, disetujui: orders.filter((order) => order.status === "confirmed").length, ditolak: orders.filter((order) => order.status === "rejected_by_manager").length, menunggu: orders.filter((order) => order.status === "pending" || order.status === "submitted_to_manager").length }; }
