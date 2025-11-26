import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  getSalesSummary,
  getSalesByBar,
  getTopProducts,
  getInventoryCritical,
} from "../controllers/reports.controller.js";

const router = Router();

// Todas usan ?eventId=#
router.get("/sales/summary", authRequired, getSalesSummary);
router.get("/sales/by-bar", authRequired, getSalesByBar);
router.get("/sales/top-products", authRequired, getTopProducts);
router.get("/inventory/critical", authRequired, getInventoryCritical);

export default router;