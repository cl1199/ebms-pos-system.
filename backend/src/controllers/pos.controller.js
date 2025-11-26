import { prisma } from "../prisma/client.js";

// ===============================
//      CREAR VENTA + INVENTARIO
// ===============================

export const createSale = async (req, res) => {
  try {
    const { eventId, barId, userId, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Debes enviar al menos un item en la venta",
      });
    }

    const productIds = items.map(i => Number(i.productId));

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    let total = 0;

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      const product = productMap.get(productId);

      if (!product) {
        return res.status(400).json({
          error: `El producto con ID ${productId} no existe en la base de datos`
        });
      }

      total += product.price * quantity;
    }

    // ===================================
    //  CREAR VENTA + ACTUALIZAR INVENTARIO
    // ===================================
    const sale = await prisma.$transaction(async (tx) => {

      // 1. Crear la venta
      const newSale = await tx.sale.create({
        data: {
          eventId: Number(eventId),
          barId: Number(barId),
          userId: Number(userId),
          total,
          items: {
            create: items.map(i => ({
              productId: Number(i.productId),
              quantity: Number(i.quantity),
              priceAtSale: productMap.get(Number(i.productId)).price
            }))
          }
        },
        include: { items: true }
      });

      // 2. Actualizar inventario para cada item
      for (const item of newSale.items) {
        const qty = Number(item.quantity);
        const productId = Number(item.productId);

        // 2.1 buscar inventario
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            eventId: Number(eventId),
            barId: Number(barId),
            productId
          }
        });

        if (!inventory) {
          throw new Error(
            `No existe inventario para productId=${productId} en este bar/evento`
          );
        }

        if (inventory.quantity < qty) {
          throw new Error(
            `Inventario insuficiente para productId=${productId}. Disponible: ${inventory.quantity}, solicitado: ${qty}`
          );
        }

        // 2.2 restar stock
        await tx.inventoryItem.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity - qty }
        });

        // 2.3 registrar ajuste
        await tx.inventoryAdjustment.create({
          data: {
            quantity: qty,
            type: "EXIT",
            reason: "SALE",
            eventId: Number(eventId),
            barId: Number(barId),
            productId,
            userId: Number(userId)
          }
        });
      }

      return newSale;
    });

    return res.status(201).json(sale);

  } catch (error) {
    console.error("Error al crear venta:", error);
    return res.status(500).json({
      error: "Error interno al crear la venta",
      details: error.message,
    });
  }
};

// ===============================
// CANCELAR VENTA + DEVOLVER INVENTARIO
// ===============================

export const cancelSale = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { userId, reason } = req.body;

    const id = Number(saleId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar venta
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale) {
        throw new Error("La venta no existe");
      }

      if (sale.cancelled === true) {
        throw new Error("La venta ya está cancelada");
      }

      // 2. Marcar venta como cancelada
      const cancelledSale = await tx.sale.update({
        where: { id },
        data: {
          cancelled: true,
          cancelledBy: userId ? Number(userId) : null,
          cancellationReason: reason || "CANCELACIÓN DE VENTA",
        },
        include: { items: true },
      });

      // 3. Revertir inventario de cada item vendido
      for (const item of sale.items) {
        const qty = Number(item.quantity);
        const productId = Number(item.productId);

        // encontrar inventario
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            eventId: sale.eventId,
            barId: sale.barId,
            productId,
          },
        });

        if (!inventory) {
          throw new Error(
            `No existe inventario para productId=${productId} en este bar/evento`
          );
        }

        // sumar inventario
        await tx.inventoryItem.update({
          where: { id: inventory.id },
          data: {
            quantity: inventory.quantity + qty,
          },
        });

        // registrar ajuste (entrada)
        await tx.inventoryAdjustment.create({
          data: {
            quantity: qty,
            type: "ENTRY",
            reason: "CANCEL SALE",
            eventId: sale.eventId,
            barId: sale.barId,
            productId,
            userId: Number(userId),
          },
        });
      }

      return cancelledSale;
    });

    return res.json({
      message: "Venta cancelada y stock devuelto correctamente",
      sale: result,
    });

  } catch (error) {
    console.error("Error al cancelar venta:", error);
    return res.status(400).json({
      error: error.message || "Error interno al cancelar la venta",
    });
  }
};

// ===================================================
//  OBTENER VENTAS POR EVENTO
// ===================================================
export const getSalesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const id = Number(eventId);

    const sales = await prisma.sale.findMany({
      where: { eventId: id },
      include: {
        items: { include: { product: true } },
        bar: true,
        cashier: true
      },
      orderBy: { createdAt: "desc" }
    });

    let total = 0;
    let totalCancelled = 0;

    for (const sale of sales) {
      if (sale.cancelled) totalCancelled += sale.total;
      else total += sale.total;
    }

    const net = total - totalCancelled;

    const byBar = {};
    for (const sale of sales) {
      const barName = sale.bar.name;
      if (!byBar[barName]) byBar[barName] = 0;
      if (!sale.cancelled) byBar[barName] += sale.total;
    }

    const byCashier = {};
    for (const sale of sales) {
      const cashierName =
        sale.cashier.username ||
        sale.cashier.name ||
        `User ${sale.userId}`;

      if (!byCashier[cashierName]) byCashier[cashierName] = 0;
      if (!sale.cancelled) byCashier[cashierName] += sale.total;
    }

    const productTotals = {};

    for (const sale of sales) {
      if (sale.cancelled) continue;

      for (const item of sale.items) {
        const key = item.product.name;

        if (!productTotals[key]) {
          productTotals[key] = {
            productId: item.productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }

        productTotals[key].quantity += item.quantity;
        productTotals[key].revenue += item.priceAtSale * item.quantity;
      }
    }

    return res.json({
      eventId: id,
      totals: { total, totalCancelled, net },
      summary: {
        byBar,
        byCashier,
        products: Object.values(productTotals)
      },
      sales
    });

  } catch (error) {
    console.error("Error al obtener ventas por evento:", error);
    return res.status(500).json({
      error: "Error interno al obtener ventas del evento",
      details: error.message
    });
  }
};

// ===================================================
//  OBTENER VENTAS POR BARRA
// ===================================================
export const getSalesByBar = async (req, res) => {
  try {
    const { barId } = req.params;
    const id = Number(barId);

    const sales = await prisma.sale.findMany({
      where: { barId: id },
      include: {
        items: { include: { product: true } },
        cashier: true,
        bar: true
      },
      orderBy: { createdAt: "desc" }
    });

    let total = 0;
    let totalCancelled = 0;

    for (const sale of sales) {
      if (sale.cancelled) totalCancelled += sale.total;
      else total += sale.total;
    }

    const net = total - totalCancelled;

    const byCashier = {};

    for (const sale of sales) {
      const cashierName =
        sale.cashier.username ||
        sale.cashier.name ||
        `User ${sale.userId}`;

      if (!byCashier[cashierName]) byCashier[cashierName] = 0;

      if (!sale.cancelled) byCashier[cashierName] += sale.total;
    }

    const productTotals = {};

    for (const sale of sales) {
      if (sale.cancelled) continue;

      for (const item of sale.items) {
        const key = item.product.name;

        if (!productTotals[key]) {
          productTotals[key] = {
            productId: item.productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }

        productTotals[key].quantity += item.quantity;
        productTotals[key].revenue += item.priceAtSale * item.quantity;
      }
    }

    return res.json({
      barId: id,
      barName: sales[0]?.bar?.name || null,
      totals: { total, totalCancelled, net },
      summary: { byCashier, products: Object.values(productTotals) },
      sales
    });

  } catch (error) {
    console.error("Error al obtener ventas de la barra:", error);
    return res.status(500).json({
      error: "Error interno al obtener ventas de la barra",
      details: error.message
    });
  }
};

// ===================================================
//  OBTENER VENTAS POR CAJERO
// ===================================================
export const getSalesByCashier = async (req, res) => {
  try {
    const { userId } = req.params;
    const id = Number(userId);

    const sales = await prisma.sale.findMany({
      where: { userId: id },
      include: {
        items: { include: { product: true } },
        bar: true,
        event: true,
        cashier: true
      },
      orderBy: { createdAt: "desc" }
    });

    let total = 0;
    let totalCancelled = 0;

    for (const sale of sales) {
      if (sale.cancelled) totalCancelled += sale.total;
      else total += sale.total;
    }

    const net = total - totalCancelled;

    const byEvent = {};

    for (const sale of sales) {
      const eventName = sale.event.name;
      if (!byEvent[eventName]) byEvent[eventName] = 0;

      if (!sale.cancelled) byEvent[eventName] += sale.total;
    }

    const productTotals = {};

    for (const sale of sales) {
      if (sale.cancelled) continue;

      for (const item of sale.items) {
        const key = item.product.name;

        if (!productTotals[key]) {
          productTotals[key] = {
            productId: item.productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }

        productTotals[key].quantity += item.quantity;
        productTotals[key].revenue += item.quantity * item.priceAtSale;
      }
    }

    return res.json({
      cashierId: id,
      cashierName: sales[0]?.cashier?.username || "Cajero",
      totals: { total, totalCancelled, net },
      summary: {
        byEvent,
        products: Object.values(productTotals)
      },
      sales
    });

  } catch (error) {
    console.error("Error al obtener ventas del cajero:", error);
    return res.status(500).json({
      error: "Error interno al obtener ventas del cajero",
      details: error.message
    });
  }
};
// ===================================================
//  INVENTARIO ACTUAL POR BAR + EVENTO
// ===================================================
export const getInventoryByBar = async (req, res) => {
  try {
    const { eventId, barId } = req.params;

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        eventId: Number(eventId),
        barId: Number(barId)
      },
      include: {
        product: true
      }
    });

    // preparar respuesta formateada
    const formatted = inventory.map(item => {
      const isLow = item.quantity <= item.minStock;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        unit: item.product.unit,
        quantity: item.quantity,
        minStock: item.minStock,
        lowStock: isLow,
      };
    });

    return res.json({
      eventId: Number(eventId),
      barId: Number(barId),
      inventory: formatted
    });

  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return res.status(500).json({
      error: "Error interno al obtener inventario",
      details: error.message
    });
  }
};

// ===================================================
//  AJUSTE MANUAL DE INVENTARIO
// ===================================================
export const adjustInventory = async (req, res) => {
  try {
    const { eventId, barId, productId, quantity, type, userId, reason } = req.body;

    if (!eventId || !barId || !productId || !quantity || !type || !userId) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: eventId, barId, productId, quantity, type, userId"
      });
    }

    const qty = Number(quantity);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar inventario
      const inventory = await tx.inventoryItem.findFirst({
        where: {
          eventId: Number(eventId),
          barId: Number(barId),
          productId: Number(productId)
        }
      });

      if (!inventory) {
        throw new Error("No existe inventario asociado a este bar/evento/producto.");
      }

      let newQuantity = inventory.quantity;

      // 2. Aplicar ajuste según tipo
      switch (type) {
        case "ENTRY":
          newQuantity = inventory.quantity + qty;
          break;

        case "EXIT":
        case "LOSS":
          if (inventory.quantity < qty) {
            throw new Error(
              `Inventario insuficiente para registrar ${type}. Disponible: ${inventory.quantity}, solicitado: ${qty}`
            );
          }
          newQuantity = inventory.quantity - qty;
          break;

        case "CORRECTION":
          // Corrección: se reemplaza la cantidad (no suma ni resta)
          newQuantity = qty;
          break;

        default:
          throw new Error("Tipo de ajuste inválido. Usa ENTRY, EXIT, LOSS o CORRECTION.");
      }

      // 3. Actualizar inventario
      await tx.inventoryItem.update({
        where: { id: inventory.id },
        data: { quantity: newQuantity }
      });

      // 4. Registrar movimiento
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          quantity: qty,
          type,
          reason: reason || null,
          eventId: Number(eventId),
          barId: Number(barId),
          productId: Number(productId),
          userId: Number(userId)
        }
      });

      return { newQuantity, adjustment };
    });

    return res.json({
      message: "Ajuste registrado correctamente",
      newQuantity: result.newQuantity,
      adjustment: result.adjustment
    });

  } catch (error) {
    console.error("Error en ajuste de inventario:", error);
    return res.status(400).json({
      error: error.message || "Error interno en ajustes de inventario"
    });
  }
};
// ===================================================
//  TRANSFERENCIA ENTRE BARRAS
// ===================================================
export const transferInventory = async (req, res) => {
  try {
    const { 
      eventId, 
      fromBarId, 
      toBarId, 
      productId, 
      quantity, 
      userId, 
      reason 
    } = req.body;

    if (!eventId || !fromBarId || !toBarId || !productId || !quantity || !userId) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: eventId, fromBarId, toBarId, productId, quantity, userId"
      });
    }

    const qty = Number(quantity);

    const result = await prisma.$transaction(async (tx) => {

      // =========================
      //  1. VALIDAR INVENTARIO ORIGEN
      // =========================
      const origin = await tx.inventoryItem.findFirst({
        where: {
          eventId: Number(eventId),
          barId: Number(fromBarId),
          productId: Number(productId)
        }
      });

      if (!origin) {
        throw new Error("No existe inventario en la barra de origen.");
      }

      if (origin.quantity < qty) {
        throw new Error(
          `Inventario insuficiente en barra origen. Disponible: ${origin.quantity}, solicitado: ${qty}`
        );
      }

      // =========================
      //  2. VALIDAR O CREAR INVENTARIO DESTINO
      // =========================
      let destination = await tx.inventoryItem.findFirst({
        where: {
          eventId: Number(eventId),
          barId: Number(toBarId),
          productId: Number(productId)
        }
      });

      // si no existe inventario en barra destino, lo creamos
      if (!destination) {
        destination = await tx.inventoryItem.create({
          data: {
            eventId: Number(eventId),
            barId: Number(toBarId),
            productId: Number(productId),
            quantity: 0,
            minStock: 0
          }
        });
      }

      // =========================
      //  3. RESTAR INVENTARIO EN ORIGEN
      // =========================
      await tx.inventoryItem.update({
        where: { id: origin.id },
        data: { quantity: origin.quantity - qty }
      });

      // Registrar movimiento: TRANSFER OUT
      await tx.inventoryAdjustment.create({
        data: {
          quantity: qty,
          type: "EXIT",
          reason: reason || "TRANSFER OUT",
          eventId: Number(eventId),
          barId: Number(fromBarId),
          productId: Number(productId),
          userId: Number(userId)
        }
      });

      // =========================
      //  4. SUMAR INVENTARIO EN DESTINO
      // =========================
      await tx.inventoryItem.update({
        where: { id: destination.id },
        data: { quantity: destination.quantity + qty }
      });

      // Registrar movimiento: TRANSFER IN
      await tx.inventoryAdjustment.create({
        data: {
          quantity: qty,
          type: "ENTRY",
          reason: reason || "TRANSFER IN",
          eventId: Number(eventId),
          barId: Number(toBarId),
          productId: Number(productId),
          userId: Number(userId)
        }
      });

      return {
        originNewQty: origin.quantity - qty,
        destinationNewQty: destination.quantity + qty
      };
    });

    return res.json({
      message: "Transferencia realizada con éxito",
      details: result
    });

  } catch (error) {
    console.error("Error en transferencia:", error);
    return res.status(400).json({
      error: error.message || "Error interno al transferir inventario"
    });
  }
};
// ===================================================
//  HISTORIAL DE INVENTARIO (TIMELINE)
// ===================================================
export const getInventoryHistory = async (req, res) => {
  try {
    const { eventId, barId } = req.params;

    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: {
        eventId: Number(eventId),
        barId: Number(barId),
      },
      include: {
        product: true,
        user: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = adjustments.map(adj => ({
      id: adj.id,
      productId: adj.productId,
      productName: adj.product.name,
      type: adj.type,
      quantity: adj.quantity,
      reason: adj.reason,
      createdAt: adj.createdAt,
      user: adj.user.username || adj.user.name || `Usuario ${adj.userId}`
    }));

    return res.json({
      eventId: Number(eventId),
      barId: Number(barId),
      history: formatted
    });

  } catch (error) {
    console.error("Error al obtener historial:", error);
    return res.status(500).json({
      error: "Error interno al obtener historial",
      details: error.message
    });
  }
};
// ===================================================
//  PRODUCTOS CON STOCK BAJO / AGOTADOS
// ===================================================
export const getLowStock = async (req, res) => {
  try {
    const { eventId, barId } = req.params;

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        eventId: Number(eventId),
        barId: Number(barId)
      },
      include: {
        product: true
      }
    });

    const low = inventory.filter(i => i.quantity <= i.minStock);

    return res.json({
      eventId: Number(eventId),
      barId: Number(barId),
      lowStock: low.map(i => ({
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        minStock: i.minStock
      }))
    });

  } catch (error) {
    console.error("Error al obtener low-stock:", error);
    return res.status(500).json({
      error: "Error interno al obtener low-stock",
      details: error.message
    });
  }
};
