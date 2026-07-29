export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discount?: number;
  productIds?: number[];
  active: boolean;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export type PesananStatus = "pending" | "submitted_to_manager" | "confirmed" | "rejected_by_manager" | "cancelled";

export interface PemasaranOrder {
  id: string;
  customer: { name: string; phone: string; email?: string; address: string; note?: string };
  items: { productId: number; title: string; quantity: number; unitPrice: number; subtotal: number; variants?: Record<string, string>; note?: string }[];
  total: number;
  status: PesananStatus;
  marketingConfirmedAt?: string;
  submittedToManagerAt?: string;
  managerRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaporanRekap {
  totalPesanan: number;
  disetujui: number;
  ditolak: number;
  menunggu: number;
}

export interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  order: number;
  startDate: string;
  endDate: string;
}

export const emptyBannerForm: BannerFormData = {
  title: "", subtitle: "", imageUrl: "", linkUrl: "", active: true, order: 0, startDate: "", endDate: "",
};
