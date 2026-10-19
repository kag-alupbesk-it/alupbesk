import { Router } from "express";
import { z } from "zod";
import { createCustomRequest, getCustomRequests } from ".";
import { isAllowedRawImage } from "./requests/validation";

const router = Router();

const customRequestItemSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  unit: z.string().trim().optional(),
  technicalNote: z.string().trim().optional(),
});

const customRequestSchema = z
  .object({
    nama: z.string().trim().min(1),
    kode: z.string().trim().max(60).optional().or(z.literal("")),
    perusahaan: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(160).optional().or(z.literal("")),
    telp: z.string().trim().min(1).max(24),
    projectAddress: z.string().trim().min(1).max(200),
    provinsi: z.string().trim().max(100).optional().or(z.literal("")),
    kabupaten: z.string().trim().max(100).optional().or(z.literal("")),
    layanan: z.string().trim().min(1),
    deskripsi: z.string().trim().min(1).max(4000),
    deadline: z.string().trim().min(1),
    items: z.array(customRequestItemSchema).min(1),
    rawImage: z.string().trim().min(1),
    rawImageName: z.string().trim().min(1).max(255),
  })
  .refine((data) => isAllowedRawImage(data.rawImage), {
    message: "URL gambar harus milik storage ALUPBESK.",
  });

router.get("/requests", (_request, response) =>
  response.json({ success: true, data: getCustomRequests() }),
);
router.post("/requests", (request, response) => {
  const parsed = customRequestSchema.safeParse(request.body);
  if (!parsed.success)
    return response
      .status(400)
      .json({
        success: false,
        error: {
          code: "INVALID_CUSTOM_REQUEST",
          message: "Data request tidak valid.",
        },
      });
  return response
    .status(201)
    .json({ success: true, data: createCustomRequest(parsed.data) });
});

export default router;