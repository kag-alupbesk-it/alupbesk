import { Router } from "express";
import { getLocalOrders } from "@/services/orders";

const router = Router();

// Endpoint sementara untuk dashboard /admin; tambahkan middleware autentikasi sebelum produksi.
router.get("/orders", (_request, response) => response.json({ success: true, data: getLocalOrders() }));

export default router;
