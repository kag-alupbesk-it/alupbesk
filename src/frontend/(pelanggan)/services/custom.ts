import type { CustomRequestForm } from "@/frontend/(pelanggan)/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface CustomQuoteResponse {
  id: string;
  status: "submitted" | "reviewed" | "quoted" | "accepted";
  createdAt: string;
}

let quoteCounter = 0;

export async function submitCustomRequest(_form: CustomRequestForm): Promise<CustomQuoteResponse> {
  // TODO: Replace with real API call
  await delay(800);
  quoteCounter++;
  return {
    id: `CQ-${String(quoteCounter).padStart(4, "0")}`,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };
}
