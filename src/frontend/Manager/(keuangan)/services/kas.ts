import { request } from "@/services/api/request";
import type { KasData, KasEntry, KasEntryInput } from "@/backend/modules/keuangan";

export function fetchKas(): Promise<KasData> {
  return request<KasData>("/keuangan/kas");
}

export function createKasEntry(input: KasEntryInput): Promise<KasEntry> {
  return request<KasEntry>("/keuangan/kas", { method: "POST", body: JSON.stringify(input) });
}

export function updateKasEntry(id: string, input: KasEntryInput): Promise<KasEntry> {
  return request<KasEntry>(`/keuangan/kas/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteKasEntry(id: string): Promise<KasEntry> {
  return request<KasEntry>(`/keuangan/kas/${encodeURIComponent(id)}`, { method: "DELETE" });
}
