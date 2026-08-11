import { z } from "zod";
import { createLocalOrder } from "@/services/orders";
import { flushWrites } from "@/services/supabase";

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    variants: z.record(z.string(), z.string()).optional(),
    note: z.string().optional(),
  })).min(1),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().min(1),
    note: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: "INVALID_ORDER", message: "Data pesanan tidak valid." } },
      { status: 400 }
    );
  }
  try {
    const order = createLocalOrder(parsed.data);
    await flushWrites();
    return Response.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    await flushWrites();
    return Response.json(
      { success: false, error: { code: "ORDER_VALIDATION_FAILED", message: error instanceof Error ? error.message : "Pesanan tidak valid." } },
      { status: 422 }
    );
  }
}
