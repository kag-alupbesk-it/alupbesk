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
