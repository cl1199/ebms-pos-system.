// src/routes/assignments.routes.js
import { Router } from "express";
import {
  getAllAssignments,
  createAssignment,
  deleteAssignment,
  getAssignedBar,
} from "../controllers/assignments.controller.js";

import { authRequired, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// Solo admin puede manejar asignaciones
router.get("/", authRequired, adminOnly, getAllAssignments);
router.post("/", authRequired, adminOnly, createAssignment);
router.delete("/:id", authRequired, adminOnly, deleteAssignment);
router.get("/my-bar", authRequired, getAssignedBar);

export default router;