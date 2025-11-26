// src/controllers/reports.controller.js
import { prisma } from "../prisma/client.js";

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

export const getTopProducts = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!eventId) return res.status(400).json({ error: "eventId es requerido" });

    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      where: { sale: { eventId } },
      _sum: { quantity: true },
      _count: { id: true },
    });

    const products = await prisma.product.findMany();

    const mapped = items.map((i) => ({
      productId: i.productId,
      productName: products.find((p) => p.id === i.productId)?.name || "Producto eliminado",
      totalQty: i._sum.quantity || 0,
      totalSales: (products.find((p) => p.id === i.productId)?.price || 0) * (i._sum.quantity || 0),
    }));

    res.json(mapped);

  } catch (error) {
    console.error("Error en getTopProducts:", error);
    res.status(500).json({ error: "Error generando reporte de productos." });
  }
};

export const getInventoryCritical = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!eventId) {
      return res.status(400).json({ error: "eventId es requerido" });
    }

    const inventory = await prisma.inventory.findMany({
      where: { eventId },
      include: { product: true, bar: true }
    });

    const lowStock = inventory.filter(item => item.quantity < item.minStock);

    const formatted = lowStock.map(item => ({
      id: item.id,
      productName: item.product?.name || "Sin nombre",
      barName: item.bar?.name || "Sin barra",
      quantity: item.quantity,
      minStock: item.minStock
    }));

    return res.json(formatted);

  } catch (err) {
    console.error("❌ Error en getInventoryCritical:", err);
    return res.status(500).json({ error: "Error obteniendo inventario crítico" });
  }
};