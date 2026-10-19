export type CustomRequestStatus =
  | "submitted"
  | "reviewed"
  | "quoted"
  | "accepted"
  | "rejected";

export interface CustomRequestItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  technicalNote: string;
  sortOrder: number;
}

export interface CreateCustomRequestItemInput {
  name: string;
  quantity: number;
  unit?: string;
  technicalNote?: string;
}

export interface CreateCustomRequestInput {
  nama: string;
  kode?: string;
  perusahaan?: string;
  email?: string;
  telp: string;
  projectAddress?: string;
  provinsi?: string;
  kabupaten?: string;
  layanan: string;
  deskripsi: string;
  deadline?: string;
  items: CreateCustomRequestItemInput[];
  rawImage?: string;
  rawImageName?: string;
}

export interface CustomRequest extends Omit<CreateCustomRequestInput, "items"> {
  id: string;
  source: "WEBSITE_JASA_CUSTOM" | "MANUAL";
  status: CustomRequestStatus;
  items: CustomRequestItem[];
  createdAt: string;
  updatedAt: string;
}