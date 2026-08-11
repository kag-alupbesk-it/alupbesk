import { submitOrderToManager } from "@/backend/modules/marketing";
import { flushWrites } from "@/services/supabase";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const order = submitOrderToManager(id); await flushWrites(); if (!order) return Response.json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." } }, { status: 404 }); return Response.json({ success: true, data: order }); }
