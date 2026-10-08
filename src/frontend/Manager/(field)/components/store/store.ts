import { request } from "@/services/api/request";
import type {
  FieldDelivery,
  FieldDeliveryStatus,
  PodInput,
  SuratJalanInput,
} from "../types/types";

const api = "/field/deliveries";

export const fieldStore = {
  getDeliveries: () => request<FieldDelivery[]>(api),
  getDelivery: (id: string) =>
    request<FieldDelivery>(`${api}/${encodeURIComponent(id)}`),
  saveSuratJalan: (id: string, input: SuratJalanInput) =>
    request<FieldDelivery>(`${api}/${encodeURIComponent(id)}/shipment`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  submitPod: (id: string, input: PodInput) =>
    request<FieldDelivery>(`${api}/${encodeURIComponent(id)}/pod`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};

export type { FieldDelivery, FieldDeliveryStatus };
