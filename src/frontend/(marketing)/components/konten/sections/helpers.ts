import type {
  PartnerFormData,
  FaqFormData,
  ServiceFormData,
  PortfolioItemFormData,
  CaseStudyFormData,
} from "./types";

export function validatePartnerForm(form: PartnerFormData): Partial<Record<keyof PartnerFormData, string>> {
  const errors: Partial<Record<keyof PartnerFormData, string>> = {};
  if (!form.name.trim()) errors.name = "Nama mitra wajib diisi";
  if (!form.initials.trim()) errors.initials = "Inisial wajib diisi";
  return errors;
}

export function validateFaqForm(form: FaqFormData): Partial<Record<keyof FaqFormData, string>> {
  const errors: Partial<Record<keyof FaqFormData, string>> = {};
  if (!form.question.trim()) errors.question = "Pertanyaan wajib diisi";
  if (!form.answer.trim()) errors.answer = "Jawaban wajib diisi";
  return errors;
}

export function validateServiceForm(form: ServiceFormData): Partial<Record<keyof ServiceFormData, string>> {
  const errors: Partial<Record<keyof ServiceFormData, string>> = {};
  if (!form.icon.trim()) errors.icon = "Ikon wajib diisi";
  if (!form.title.trim()) errors.title = "Judul layanan wajib diisi";
  if (!form.description.trim()) errors.description = "Deskripsi wajib diisi";
  return errors;
}

export function validatePortfolioItemForm(form: PortfolioItemFormData): Partial<Record<keyof PortfolioItemFormData, string>> {
  const errors: Partial<Record<keyof PortfolioItemFormData, string>> = {};
  if (!form.client.trim()) errors.client = "Nama klien wajib diisi";
  if (!form.industry.trim()) errors.industry = "Industri wajib diisi";
  if (!form.title.trim()) errors.title = "Judul proyek wajib diisi";
  if (!form.challenge.trim()) errors.challenge = "Tantangan wajib diisi";
  if (!form.solution.trim()) errors.solution = "Solusi wajib diisi";
  if (!form.result.trim()) errors.result = "Hasil wajib diisi";
  return errors;
}

export function validateCaseStudyForm(form: CaseStudyFormData): Partial<Record<keyof CaseStudyFormData, string>> {
  const errors: Partial<Record<keyof CaseStudyFormData, string>> = {};
  if (!form.client.trim()) errors.client = "Nama klien wajib diisi";
  if (!form.industry.trim()) errors.industry = "Industri wajib diisi";
  if (!form.title.trim()) errors.title = "Judul wajib diisi";
  return errors;
}
