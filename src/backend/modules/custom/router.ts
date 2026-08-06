import { Router } from "express";
import { z } from "zod";
import { createCustomRequest, getCustomRequests } from ".";

const router = Router();
const customRequestSchema = z.object({
  nama: z.string().trim().min(1), perusahaan: z.string().trim().optional(), email: z.string().trim().email().optional().or(z.literal("")), telp: z.string().trim().min(1), layanan: z.string().trim().min(1), deskripsi: z.string().trim().min(1), dimensi: z.string().trim().optional(), kuantitas: z.string().trim().optional(), deadline: z.string().trim().optional(),
});

router.get("/requests", (_request, response) => response.json({ success: true, data: getCustomRequests() }));
router.post("/requests", (request, response) => {
  const parsed = customRequestSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ success: false, error: { code: "INVALID_CUSTOM_REQUEST", message: "Data request tidak valid." } });
  return response.status(201).json({ success: true, data: createCustomRequest(parsed.data) });
});

export default router;
