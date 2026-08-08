import { getGudangItems } from "@/backend/modules/gudang";

export async function GET() {
  const items = getGudangItems().filter((item) => item.kategoriBarang === "proyek");
  return Response.json({ success: true, data: items });
}
