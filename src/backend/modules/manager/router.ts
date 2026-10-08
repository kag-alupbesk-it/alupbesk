import { Router } from "express";
import { getLocalOrders } from "@/services/orders/index";
import { getDashboardData, getFinancialsData, getInventoryData, getUsersData, decideOrder, MANAGER_DECISIONS } from ".";

const router = Router();

router.get("/dashboard", (request, response) => {
  const period = typeof request.query.period === "string" ? request.query.period : "monthly";
  response.json({ success: true, data: getDashboardData(period) });
});

router.get("/financials", (request, response) => {
  const period = typeof request.query.period === "string" ? request.query.period : "monthly";
  response.json({ success: true, data: getFinancialsData(period) });
});

router.get("/inventory", (_request, response) => {
  response.json({ success: true, data: getInventoryData() });
});

router.get("/users", async (_request, response) => {
  const data = await getUsersData();
  response.setHeader("Cache-Control", "no-store");
  response.json({ success: true, data });
});

router.get("/orders", (_request, response) => {
  response.json({ success: true, data: getLocalOrders() });
});

router.post("/orders/:id/decision", (request, response) => {
  const { decision, reason } = request.body ?? {};
  if (!MANAGER_DECISIONS.includes(decision)) {
    return response.status(400).json({ success: false, error: { code: "INVALID_DECISION", message: "Keputusan tidak valid." } });
  }
  if (decision === "rejected_by_manager" && !(typeof reason === "string" && reason.trim())) {
    return response.status(400).json({ success: false, error: { code: "REASON_REQUIRED", message: "Alasan penolakan wajib diisi." } });
  }
  const order = decideOrder(request.params.id, decision, reason);
  if (!order) return response.status(404).json({ success: false, error: { code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." } });
  response.json({ success: true, data: order });
});

export default router;
