// src/controllers/assignments.controller.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todas las asignaciones
export const getAllAssignments = async (req, res) => {
  try {
    const assigns = await prisma.waiterAssignment.findMany({
      include: {
        event: true,
        bar: true,
        user: true,
      },
      orderBy: { id: "asc" },
    });

    res.json({ assignments: assigns });
  } catch (error) {
    console.error("Error obteniendo asignaciones:", error);
    res.status(500).json({ error: "Error al obtener asignaciones" });
  }
};

// Crear nueva asignación
export const createAssignment = async (req, res) => {
  try {
    const { eventId, barId, userId } = req.body;

    if (!eventId || !barId || !userId) {
      return res
        .status(400)
        .json({ error: "eventId, barId y userId son obligatorios" });
    }

    // Evitar asignación duplicada del mismo cajero en el mismo evento
    const existing = await prisma.waiterAssignment.findFirst({
      where: {
        eventId: Number(eventId),
        userId: Number(userId),
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Este cajero ya está asignado en este evento",
      });
    }

    const newAssign = await prisma.waiterAssignment.create({
      data: {
        eventId: Number(eventId),
        barId: Number(barId),
        userId: Number(userId),
      },
    });

    res.json({ assignment: newAssign });
  } catch (error) {
    console.error("Error creando asignación:", error);
    res.status(500).json({ error: "Error al crear asignación" });
  }
};

// Eliminar asignación
export const deleteAssignment = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.waiterAssignment.delete({
      where: { id },
    });

    res.json({ message: "Asignación eliminada" });
  } catch (error) {
    console.error("Error eliminando asignación:", error);
    res.status(500).json({ error: "Error al eliminar asignación" });
  }
};

export const getAssignedBar = async (req, res) => {
  try {
    const { userId } = req.user;

    const assignment = await prisma.waiterAssignment.findFirst({
      where: { userId },
      include: {
        bar: true,
        event: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: "No asignación encontrada" });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Error en getAssignedBar:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

  