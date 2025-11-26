import { prisma } from "../prisma/client.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting users" });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting user" });
  }
};

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, passwordHash, role } = req.body;

    const newUser = await prisma.user.create({
      data: { name, email, passwordHash, role }
    });

    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating user" });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, passwordHash, role } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, passwordHash, role }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

/**
 * GET /api/reports/inventory/critical?eventId=#
 * Devuelve productos cuyo stock actual < stock mínimo para un evento.
 */
export const getInventoryCritical = async (req, res) => {
  try {
    const eventId = Number(req.query.eventId);

    if (!eventId) {
      return res.status(400).json({ error: "eventId es requerido" });
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        eventId,
        quantity: {
          lt: prisma.inventoryItem.fields.minStock, // quantity < minStock
        },
      },
      include: {
        product: true,
        bar: true,
      },
    });

    const mapped = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      barId: item.barId,
      quantity: item.quantity,
      minStock: item.minStock,
      productName: item.product?.name || "Producto",
      barName: item.bar?.name || "Barra",
      eventId: item.eventId,
      createdAt: item.createdAt,
    }));

    return res.json(mapped);
  } catch (err) {
    console.error("Error en getInventoryCritical:", err);
    return res
      .status(500)
      .json({ error: "Error obteniendo inventario crítico" });
  }
};