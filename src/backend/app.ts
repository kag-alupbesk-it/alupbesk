import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { catalogRouter, portfolioRouter } from "./modules/(pelanggan)";
import marketingRouter from "./modules/marketing/router";
import { contentRouter } from "./modules/content";
import customRouter from "./modules/custom/router";
import gudangRouter from "./modules/gudang/router";
import managerRouter from "./modules/manager/router";
import { ensureHydrated } from "@/services/supabaseHydrate";
import { flushWrites } from "@/services/supabase";
export const app = express();
app.use(corsMiddleware); app.use(express.json());
// Muat data dari Supabase sebelum memproses request, lalu kirim antrean
// tulis setelah respons selesai agar data ikut tersimpan.
app.use((_request, _response, next) => {
  void ensureHydrated().then(() => next());
});
app.use((_request, response, next) => {
  response.on("finish", () => void flushWrites());
  next();
});
app.use("/api/catalog", catalogRouter); app.use("/api/portfolio", portfolioRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/content", contentRouter);
app.use("/api/custom", customRouter);
app.use("/api/gudang", gudangRouter);
app.use("/api/manager", managerRouter); app.use("/api/owner", managerRouter);
app.use((_request, response) => response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Endpoint tidak ditemukan." } }));
