import { request } from "@/services/api/request";
import type { PMOrder } from "@/services/pm/types";

export function submitProductionDrawing(
  orderId: string,
  file: File,
  technicalNote: string,
): Promise<PMOrder> {
  const form = new FormData();
  form.set("file", file);
  form.set("technicalNote", technicalNote);

  return request(`/pm/orders/${encodeURIComponent(orderId)}/drawing`, {
    method: "POST",
    body: form,
  });
}
