import { prisma } from "../prisma/client.js";

// GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" }
    });

    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting products" });
  }
};


// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting product" });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, cost, unit } = req.body;

    const newProduct = await prisma.product.create({
      data: { name, category, price, cost, unit },
    });

    res.json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating product" });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, category, price, cost, unit } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: { name, category, price, cost, unit },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating product" });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.product.delete({ where: { id } });

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting product" });
  }
};
