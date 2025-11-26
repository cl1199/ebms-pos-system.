import express from "express";
import {
  getAllBars,
  getBarById,
  createBar,
  updateBar,
  deleteBar,
  getBarsByEvent
} from "../controllers/bars.controller.js";

const router = express.Router();

// MÁS ESPECÍFICAS PRIMERO
router.get("/event/:eventId", getBarsByEvent);

// LUEGO EL RESTO
router.get("/", getAllBars);
router.get("/:id", getBarById);
router.post("/", createBar);
router.put("/:id", updateBar);
router.delete("/:id", deleteBar);

export default router;
