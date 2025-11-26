import { prisma } from "../prisma/client.js";

/**
 * POST /api/inventory/initial
 * Admin define inventario inicial por evento/barra/producto
 */
export const createInitialInventory = async (req, res) => {
  try {
    const { eventId, barId, productId, quantity } = req.body;

    if (!eventId || !barId || !productId || quantity == null) {
      return res
        .status(400)
        .json({ error: "eventId, barId, productId y quantity son requeridos" });
    }

    const eventIdNum = Number(eventId);
    const barIdNum = Number(barId);
    const productIdNum = Number(productId);
    const qty = Number(quantity);

    // 1️⃣ Verificar si ya existe
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        eventId: eventIdNum,
        barId: barIdNum,
        productId: productIdNum,
      },
    });

    let inventoryItem;

    if (existing) {
      // 2️⃣ Si existe → actualizar
      inventoryItem = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { quantity: qty },
      });
    } else {
      // 3️⃣ Si NO existe → crear
      inventoryItem = await prisma.inventoryItem.create({
        data: {
          eventId: eventIdNum,
          barId: barIdNum,
          productId: productIdNum,
          quantity: qty,
        },
      });
    }

    // 4️⃣ Registrar ajuste
    await prisma.inventoryAdjustment.create({
      data: {
        eventId: eventIdNum,
        barId: barIdNum,
        productId: productIdNum,
        quantity: qty,
        type: "ENTRY",
        reason: "INVENTARIO INICIAL",
        userId: req.user.userId,
      },
    });

    return res.json({
      ok: true,
      message: "Inventario inicial registrado",
      item: inventoryItem,
    });
  } catch (err) {
    console.error("Error creando inventario inicial:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};