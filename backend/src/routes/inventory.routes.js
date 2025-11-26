import { Router } from "express";
import {
  createInitialInventory
} from "../controllers/inventory.controller.js";

import { authRequired, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// ADMIN define inventario inicial
router.post("/initial", authRequired, adminOnly, createInitialInventory);

export default router;