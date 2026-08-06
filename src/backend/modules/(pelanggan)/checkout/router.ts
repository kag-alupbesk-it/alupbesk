import { Router } from "express";
import { z } from "zod";
import {
  createLocalOrder,
  getLocalOrder,
  subscribeOrderStatus,
} from "@/services/orders";
const router = Router();
const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        variants: z.record(z.string(), z.string()).optional(),
        note: z.string().optional(),
      }),
    )
    .min(1),
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().min(1),
    note: z.string().optional(),
  }),
});
router.post("/orders", (request, response) => {
  const parsed = orderSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({
        success: false,
        error: { code: "INVALID_ORDER", message: "Data pesanan tidak valid." },
      });
  try {
    return response
      .status(201)
      .json({ success: true, data: createLocalOrder(parsed.data) });
  } catch (error) {
    return response
      .status(422)
      .json({
        success: false,
        error: {
          code: "ORDER_VALIDATION_FAILED",
          message:
            error instanceof Error ? error.message : "Pesanan tidak valid.",
        },
      });
  }
});
router.get("/orders/:id/status", (request, response) => {
  const order = getLocalOrder(request.params.id);
  return order
    ? response.json({
        success: true,
        data: {
          orderId: order.id,
          status: order.status,
          updatedAt: order.updatedAt,
        },
      })
    : response
        .status(404)
        .json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Pesanan tidak ditemukan.",
          },
        });
});
router.get("/orders/:id/status/stream", (request, response) => {
  const order = getLocalOrder(request.params.id);
  if (!order)
    return response
      .status(404)
      .json({
        success: false,
        error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." },
      });
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();
  const send = (event: {
    orderId: string;
    status: string;
    updatedAt: string;
  }) => response.write(`data: ${JSON.stringify(event)}\n\n`);
  send({ orderId: order.id, status: order.status, updatedAt: order.updatedAt });
  const unsubscribe = subscribeOrderStatus(order.id, send);
  request.on("close", unsubscribe);
  return undefined;
});
export default router;
