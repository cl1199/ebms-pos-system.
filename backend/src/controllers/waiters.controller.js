import { prisma } from "../prisma/client.js";

// ============================================
// CRUD de meseros (realmente Users con rol WAITER)
// ============================================

// GET /api/waiters
export const getAllWaiters = async (req, res) => {
  try {
    const waiters = await prisma.user.findMany({
      where: { role: "WAITER" },
    });
    res.json(waiters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting waiters" });
  }
};

// POST /api/waiters
export const createWaiter = async (req, res) => {
  try {
    const { name, email, passwordHash } = req.body;

    const newWaiter = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "WAITER",
      },
    });

    res.json(newWaiter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating waiter" });
  }
};

// PUT /api/waiters/:id
export const updateWaiter = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating waiter" });
  }
};

// DELETE /api/waiters/:id
export const deleteWaiter = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.user.delete({ where: { id } });

    res.json({ message: "Waiter deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting waiter" });
  }
};

// ============================================
// Asignar mesero a un EVENTO (sin barra)
// ============================================

export const assignWaiterToEvent = async (req, res) => {
  try {
    const waiterId = Number(req.body.waiterId);
    const eventId = Number(req.body.eventId);

    if (!waiterId || !eventId) {
      return res.status(400).json({ error: "Missing waiterId or eventId" });
    }

    // Validar que el mesero exista
    const waiter = await prisma.user.findUnique({
      where: { id: waiterId },
    });

    if (!waiter) {
      return res.status(404).json({ error: "Waiter not found" });
    }

    // Crear asignación sin barra
    const assignment = await prisma.waiterAssignment.create({
      data: {
        userId: waiterId,
        eventId: eventId,
        barId: null,     // 🔥 IMPORTANTE
      },
    });

    res.json(assignment);

  } catch (error) {
    console.error("ASSIGN ERROR:", error);
    res.status(500).json({ error: "Error assigning waiter" });
  }
};

// ============================================
// Obtener meseros asignados a un evento
// ============================================
export const getEventWaiters = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const assignments = await prisma.waiterAssignment.findMany({
      where: { eventId },
      include: { user: true },
    });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting event waiters" });
  }
};
