import { prisma } from "../prisma/client.js";

/* =======================================================
   INVENTARIO ACTUAL POR BARRA
   GET /api/inventory/bar/:eventId/:barId
======================================================= */
export const getInventoryByBar = async (req, res) => {
  try {
    const { eventId, barId } = req.params;

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        eventId: Number(eventId),
        barId: Number(barId),
      },
      include: {
        product: true,
      },
    });

    return res.json({
      inventory: inventory.map(i => ({
        id: i.id,
        productId: i.productId,
        name: i.product?.name,
        quantity: i.quantity,
        minStock: i.minStock,
      })),
    });

  } catch (err) {
    console.error("Error obteniendo inventario por barra:", err);
    return res.status(500).json({ error: "Error obteniendo inventario" });
  }
};

/* =======================================================
   HISTORIAL DE MOVIMIENTOS
   GET /api/inventory/history/:eventId/:barId
======================================================= */
export const getInventoryHistory = async (req, res) => {
  try {
    const { eventId, barId } = req.params;

    const history = await prisma.inventoryAdjustment.findMany({
      where: {
        eventId: Number(eventId),
        barId: Number(barId),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        product: true,
        user: true,
      },
    });

    return res.json({
      history: history.map(h => ({
        id: h.id,
        productName: h.product?.name,
        quantity: h.quantity,
        type: h.type,
        reason: h.reason,
        user: h.user?.name,
        createdAt: h.createdAt,
      })),
    });

  } catch (err) {
    console.error("Error obteniendo historial:", err);
    return res.status(500).json({ error: "Error obteniendo historial" });
  }
};