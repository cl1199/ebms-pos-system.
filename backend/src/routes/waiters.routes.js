import express from "express";
import {
  getAllWaiters,
  createWaiter,
  updateWaiter,
  deleteWaiter,
  assignWaiterToEvent,
  getEventWaiters
} from "../controllers/waiters.controller.js";

const router = express.Router();

router.get("/", getAllWaiters);
router.post("/", createWaiter);
router.put("/:id", updateWaiter);
router.delete("/:id", deleteWaiter);

// asignar mesero a un evento
router.post("/assign", assignWaiterToEvent);

// obtener meseros de un evento
router.get("/event/:eventId", getEventWaiters);

export default router;
