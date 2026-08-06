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
