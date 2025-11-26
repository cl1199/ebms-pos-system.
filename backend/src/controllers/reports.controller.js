// src/controllers/reports.controller.js
import { prisma } from "../prisma/client.js";

/* ===============================================
   🟦 1) Ventas por barra
   GET /api/reports/sales/by-bar?eventId=1
================================================ */
export const getSalesByBar = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!eventId) return res.status(400).json({ error: "eventId es requerido" });

    const results = await prisma.sale.groupBy({
      by: ["barId"],
      where: { eventId },
      _sum: { total: true },
    });

    const bars = await prisma.bar.findMany({ where: { eventId } });

    const mapped = results.map((r) => ({
      barId: r.barId,
      barName: bars.find((b) => b.id === r.barId)?.name || "Sin nombre",
      total: r._sum.total || 0,
    }));

    res.json(mapped);

  } catch (error) {
    console.error("Error en getSalesByBar:", error);
    res.status(500).json({ error: "Error generando el reporte." });
  }
};

/* ===============================================
   🟦 2) Productos más vendidos
   GET /api/reports/sales/top-products?eventId=1
================================================ */
export const getTopProducts = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!eventId) return res.status(400).json({ error: "eventId es requerido" });

    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      where: { sale: { eventId } },
      _sum: { quantity: true },
    });

    const products = await prisma.product.findMany();

    const mapped = items.map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return {
        productId: i.productId,
        productName: p?.name || "Producto eliminado",
        totalQty: i._sum.quantity || 0,
        totalSales: (p?.price || 0) * (i._sum.quantity || 0),
      };
    });

    res.json(mapped);

  } catch (error) {
    console.error("Error en getTopProducts:", error);
    res.status(500).json({ error: "Error generando reporte de productos." });
  }
};

/* ===============================================
   🟦 3) Inventario crítico
   GET /api/reports/inventory/critical?eventId=1
================================================ */
export const getInventoryCritical = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!eventId) {
      return res.status(400).json({ error: "eventId es requerido" });
    }

    // 🔥 TABLA CORRECTA: inventoryItem
    const inventory = await prisma.inventoryItem.findMany({
      where: { eventId },
      include: { product: true, bar: true },
    });

    const lowStock = inventory.filter(item => item.quantity < item.minStock);

    const formatted = lowStock.map(item => ({
      id: item.id,
      productName: item.product?.name || "Sin nombre",
      barName: item.bar?.name || "Sin barra",
      quantity: item.quantity,
      minStock: item.minStock,
    }));

    return res.json(formatted);

  } catch (err) {
    console.error("❌ Error en getInventoryCritical:", err);
    return res.status(500).json({ error: "Error obteniendo inventario crítico" });
  }
};

/* ===============================================
   🟦 4) Resumen general (ventas totales)
   GET /api/reports/sales/summary?eventId=1
================================================ */
export const getSalesSummary = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!eventId) return res.status(400).json({ error: "eventId es requerido" });

    const result = await prisma.sale.aggregate({
      where: { eventId },
      _sum: { total: true },
      _count: { id: true },
    });

    res.json({
      eventId,
      totalSales: result._sum.total || 0,
      totalTickets: result._count.id || 0,
      avgTicket:
        result._count.id > 0
          ? (result._sum.total || 0) / result._count.id
          : 0,
    });

  } catch (error) {
    console.error("Error en getSalesSummary:", error);
    res.status(500).json({ error: "Error generando resumen." });
  }
};