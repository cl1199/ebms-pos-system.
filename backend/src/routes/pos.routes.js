import express from "express";
import { createSale, cancelSale } from "../controllers/pos.controller.js";
import { getSalesByEvent } from "../controllers/pos.controller.js";
import { getSalesByBar } from "../controllers/pos.controller.js";
import { getSalesByCashier } from "../controllers/pos.controller.js";
import { getInventoryByBar } from "../controllers/pos.controller.js";
import { adjustInventory } from "../controllers/pos.controller.js";
import { transferInventory } from "../controllers/pos.controller.js";
import { getInventoryHistory } from "../controllers/pos.controller.js";
import { getLowStock } from "../controllers/pos.controller.js";

const router = express.Router();

router.post("/sale", createSale);
router.post("/cancel/:saleId", cancelSale);
router.get("/sales/event/:eventId", getSalesByEvent);
router.get("/sales/bar/:barId", getSalesByBar);
router.get("/sales/cashier/:userId", getSalesByCashier);
router.get("/inventory/bar/:eventId/:barId", getInventoryByBar);
router.post("/inventory/adjust", adjustInventory);
router.post("/inventory/transfer", transferInventory);
router.get("/inventory/history/:eventId/:barId", getInventoryHistory);
router.get("/inventory/low/:eventId/:barId", getLowStock);

export default router;
