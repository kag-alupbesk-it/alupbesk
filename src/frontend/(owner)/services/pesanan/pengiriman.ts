import { request } from "@/services/api/request";
import type { FieldDelivery } from "@/services/field/types";

// Surat jalan & bukti terima (POD) dipantau Owner dari modul lapangan.
// GET saja — mutasi pengiriman tetap milik role field.
export function getPengiriman(): Promise<FieldDelivery[]> {
  return request<FieldDelivery[]>("/field/deliveries");
}
