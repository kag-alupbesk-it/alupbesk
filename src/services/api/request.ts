import { isReadOnlyMode } from "@/frontend/shared/access/accessMode";

export interface ApiError { code: string; message: string; }
export interface ApiSuccess<T> { success: true; data: T; }
export interface ApiFailure { success: false; error: ApiError; }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const API_BASE_URL = "/api";
const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();

  // Mode pantau (Owner): tolak mutasi di sisi klien sebelum menyentuh jaringan.
  // Pertahanan utama tetap ada di server (`roleCanAccess` di src/proxy.ts).
  if (!READ_ONLY_METHODS.has(method) && isReadOnlyMode()) {
    throw new Error("Mode pantau: aksi ini tidak diizinkan untuk Owner.");
  }

  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  // The browser must add the multipart boundary for FormData requests.
  if (init?.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      cache: init?.cache ?? "no-store",
      headers,
    });
    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      throw new Error(
        payload.success
          ? "Permintaan API gagal."
          : payload.error.message,
      );
    }

    return payload.data;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Tidak dapat terhubung ke API.");
  }
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
