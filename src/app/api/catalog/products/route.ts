import { getCatalogProducts } from "@/services/catalog";

export async function GET() {
  return Response.json({ success: true, data: getCatalogProducts() });
}
