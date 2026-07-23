import express from "express";
import { corsMiddleware } from "./middleware/cors";
import { catalogRouter, checkoutRouter, portfolioRouter } from "./modules/(katalog)";
export const app = express();
app.use(corsMiddleware); app.use(express.json());
app.use("/api/catalog", catalogRouter); app.use("/api/checkout", checkoutRouter); app.use("/api/portfolio", portfolioRouter);
app.use((_request, response) => response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Endpoint tidak ditemukan." } }));
