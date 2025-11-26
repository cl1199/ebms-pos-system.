import express from "express";
import cors from "cors";

import productsRouter from "./routes/products.routes.js";

import eventsRouter from "./routes/events.routes.js";

import barsRouter from "./routes/bars.routes.js";

import usersRouter from "./routes/users.routes.js";

import waitersRouter from "./routes/waiters.routes.js";

import posRouter from "./routes/pos.routes.js";

import reportsRoutes from "./routes/reports.routes.js";

import authRoutes from "./routes/auth.routes.js";

import assignmentsRoutes from "./routes/assignments.routes.js";

import inventoryRoutes from "./routes/inventory.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend working!" });
});

app.use("/api/products", productsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/bars", barsRouter);
app.use("/api/users", usersRouter);
app.use("/api/waiters", waitersRouter);
app.use("/api/pos", posRouter);
app.use("/api/reports", reportsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/inventory", inventoryRoutes);



export default app;
