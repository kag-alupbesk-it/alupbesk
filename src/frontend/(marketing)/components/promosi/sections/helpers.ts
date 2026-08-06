import type { BannerFormData } from "../../../types";

export function validateBannerForm(form: BannerFormData): Partial<Record<keyof BannerFormData, string>> {
  const errors: Partial<Record<keyof BannerFormData, string>> = {};
  if (!form.title.trim()) errors.title = "Judul banner wajib diisi";
  if (!form.imageUrl.trim()) errors.imageUrl = "URL gambar banner wajib diisi";
  if (form.order < 0) errors.order = "Urutan harus angka positif";
  return errors;
}

export function generateBannerId(): string {
  const num = String(Date.now()).slice(-5);
  return `BNR-${num}`;
}
