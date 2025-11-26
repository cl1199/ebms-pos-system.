import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  getInventoryByBar,
  getInventoryHistory,
} from "../controllers/inventory.controller.js";

const router = Router();

router.get("/bar/:eventId/:barId", authRequired, getInventoryByBar);
router.get("/history/:eventId/:barId", authRequired, getInventoryHistory);

export default router;