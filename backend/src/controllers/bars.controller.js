import { prisma } from "../prisma/client.js";

// GET /api/bars
export const getAllBars = async (req, res) => {
  try {
    const bars = await prisma.bar.findMany({
      include: { event: true }
    });
    res.json(bars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting bars" });
  }
};

// GET /api/bars/:id
export const getBarById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bar = await prisma.bar.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!bar) return res.status(404).json({ error: "Bar not found" });

    res.json(bar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting bar" });
  }
};

// POST /api/bars
export const createBar = async (req, res) => {
  try {
    const { name, location, eventId } = req.body;

    const newBar = await prisma.bar.create({
      data: {
        name,
        location,
        eventId: Number(eventId)
      }
    });

    res.json(newBar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating bar" });
  }
};

// PUT /api/bars/:id
export const updateBar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, location } = req.body;

    const updated = await prisma.bar.update({
      where: { id },
      data: { name, location }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating bar" });
  }
};

// DELETE /api/bars/:id
export const deleteBar = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.bar.delete({ where: { id } });

    res.json({ message: "Bar deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting bar" });
  }
};
export const getBarsByEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event || event.status === "DELETED") {
      return res.status(404).json({ error: "Evento no disponible." });
    }
    return res.json({ bars });
  } catch (error) {
    console.error("Error obteniendo barras por evento:", error);
    res.status(500).json({
      error: "Error interno al obtener barras",
      details: error.message,
    });
  }
};
