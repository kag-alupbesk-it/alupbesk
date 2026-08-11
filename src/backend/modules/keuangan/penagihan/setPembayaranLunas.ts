import { getPenagihan } from "./getPenagihan";
import { persistPembayaran } from "./store";
import type { PenagihanResult } from "../types";

export function setPembayaranLunas(id: string): PenagihanResult {
  const item = getPenagihan().find((entry) => entry.id === id);
  if (!item) return { ok: false, code: "TAGIHAN_NOT_FOUND" };
  persistPembayaran(id, "lunas");
  return { ok: true, item: { ...item, status: "lunas" } };
}
