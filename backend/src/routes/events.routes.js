import express from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  checkEventRelations,
} from "../controllers/events.controller.js";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.get("/:id/check", checkEventRelations);

export default router;
