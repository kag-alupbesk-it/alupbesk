import { getCatalogProduct } from "@/services/catalog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getCatalogProduct(Number(id));
  if (!product) {
    return Response.json(
      { success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Produk tidak ditemukan." } },
      { status: 404 }
    );
  }
  return Response.json({ success: true, data: product });
}
