import { prisma } from "../prisma/client.js";

/* -------------------------------------------------------
   GET /api/events
------------------------------------------------------- */
// GET /api/events
export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: "ACTIVE" },
      orderBy: { id: "asc" }
    });

    
    return res.json({ events });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting events" });
  }
};

/* -------------------------------------------------------
   GET /api/events/:id
------------------------------------------------------- */
export const getEventById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event)
      return res.status(404).json({ error: "Event not found" });

    return res.json(event);
  } catch (error) {
    console.error("❌ Error getting event:", error);
    return res.status(500).json({ error: "Error getting event" });
  }
};

/* -------------------------------------------------------
   POST /api/events
------------------------------------------------------- */
export const createEvent = async (req, res) => {
  try {
    const { name, date, location, status } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        name,
        date: date ? new Date(date) : null,
        location,
        status: status ?? "ACTIVE"
      }
    });

    return res.json(newEvent);
  } catch (error) {
    console.error("❌ Error creating event:", error);
    return res.status(500).json({ error: "Error creating event" });
  }
};

/* -------------------------------------------------------
   PUT /api/events/:id
------------------------------------------------------- */
export const updateEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, date, location, status } = req.body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : null,
        location,
        status
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error("❌ Error updating event:", error);
    return res.status(500).json({ error: "Error updating event" });
  }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const deleteBars = req.query.deleteBars === "true"; // ?deleteBars=true

    // 1) Verificar si el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 2) Contar barras asociadas
    const barsCount = await prisma.bar.count({
      where: { eventId },
    });

    // 3) Si hay barras y NO se indicó deleteBars => mandamos 409 para que el frontend decida
    if (barsCount > 0 && !deleteBars) {
      return res.status(409).json({
        message: "Este evento tiene barras asociadas.",
        barsCount,
        requiresBarsDelete: true,
      });
    }

    // 4) Si deleteBars=true, borramos todas las barras del evento
    if (deleteBars) {
      await prisma.bar.deleteMany({
        where: { eventId },
      });
    }

    // 5) Finalmente eliminamos el evento
    await prisma.event.delete({
      where: { id: eventId },
    });

    return res.json({
      message: "Evento eliminado correctamente",
      barsDeleted: deleteBars ? barsCount : 0,
    });
  } catch (error) {
    console.error("Error eliminando evento:", error);
    return res
      .status(500)
      .json({ error: "Error interno al eliminar evento" });
  }
};
// GET /api/events/:id/check
export const checkEventRelations = async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    // 1. Verificar si el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 2. Contar barras asociadas
    const barsCount = await prisma.bar.count({
      where: { eventId },
    });

    return res.json({
      ok: true,
      barsCount,
    });

  } catch (error) {
    console.error("Error checking event relations:", error);
    return res.status(500).json({
      error: "Internal error checking event relations",
    });
  }
};