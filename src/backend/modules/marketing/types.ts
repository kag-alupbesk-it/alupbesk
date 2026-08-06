import type { LocalOrder } from "@/services/orders";
export interface MarketingBanner { id: string; title: string; subtitle?: string; imageUrl: string; linkUrl?: string; active: boolean; order: number; startDate?: string; endDate?: string; createdAt: string; }
export type MarketingBannerInput = Omit<MarketingBanner, "id" | "createdAt">;
export type MarketingOrderStatus = "pending" | "submitted_to_manager" | "confirmed" | "rejected_by_manager" | "cancelled";
export type MarketingOrder = Omit<LocalOrder, "status"> & { status: MarketingOrderStatus; marketingConfirmedAt?: string; submittedToManagerAt?: string; managerRejectionReason?: string };
export interface MarketingReport { totalPesanan: number; disetujui: number; ditolak: number; menunggu: number; }
