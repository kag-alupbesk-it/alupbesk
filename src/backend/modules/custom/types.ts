export type CustomRequestStatus = "submitted" | "reviewed" | "quoted" | "accepted" | "rejected";
export interface CreateCustomRequestInput { nama: string; perusahaan?: string; email?: string; telp: string; layanan: string; deskripsi: string; dimensi?: string; kuantitas?: string; deadline?: string; }
export interface CustomRequest extends CreateCustomRequestInput { id: string; status: CustomRequestStatus; createdAt: string; updatedAt: string; }
