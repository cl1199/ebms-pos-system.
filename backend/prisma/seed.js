import { prisma } from "../src/prisma/client.js";

async function main() {
  console.log("CREANDO EVENTO...");
  const event = await prisma.event.create({
    data: {
      name: "Technasia By MECCA",
      date: new Date(),
    },
  });
  console.log("EVENTO ID:", event.id);

  console.log("CREANDO BARRAS...");
  const barNames = ["Dance Floor", "VIP", "Booth"];

  const bars = [];
  for (let name of barNames) {
    const bar = await prisma.bar.create({
      data: {
        name,
        eventId: event.id,
      },
    });
    bars.push(bar);
  }

  console.log("BARRAS CREADAS:", bars);

  console.log("CARGANDO PRODUCTOS...");

  const productsData = [
    // SHOTS & TRAGOS
    { name: "Tablazo de Tequila (5)", price: 150, cost: 0, category: "Shots", unit: "unidad" },
    { name: "Pachón JW Red Ginger", price: 100, cost: 0, category: "Shots", unit: "unidad" },
    { name: "JW Black Breeze", price: 65, cost: 0, category: "Tragos", unit: "unidad" },
    { name: "JW Black Sour", price: 65, cost: 0, category: "Tragos", unit: "unidad" },
    { name: "Tanqueray Red Gin Tonic", price: 65, cost: 0, category: "Tragos", unit: "unidad" },
    { name: "Trago XL", price: 45, cost: 0, category: "Tragos", unit: "unidad" },

    // NO ALCOHOL
    { name: "Gaseosa", price: 20, cost: 0, category: "No Alcohol", unit: "unidad" },
    { name: "Agua Mineral", price: 20, cost: 0, category: "No Alcohol", unit: "unidad" },
    { name: "Agua Pura", price: 25, cost: 0, category: "No Alcohol", unit: "unidad" },
    { name: "Monster", price: 35, cost: 0, category: "No Alcohol", unit: "unidad" },

    // CIGARROS
    { name: "Cajetilla de Cigarros", price: 50, cost: 0, category: "Cigarros", unit: "unidad" },

    // BOTELLAS
    { name: "Don Julio 70", price: 900, cost: 0, category: "Botellas", unit: "unidad" },
    { name: "JW Black Label", price: 900, cost: 0, category: "Botellas", unit: "unidad" },
    { name: "JW Red Label", price: 550, cost: 0, category: "Botellas", unit: "unidad" },
    { name: "Tanqueray Gin", price: 550, cost: 0, category: "Botellas", unit: "unidad" },
    { name: "Tequila El Jimador", price: 450, cost: 0, category: "Botellas", unit: "unidad" },
    { name: "Ron XL", price: 400, cost: 0, category: "Botellas", unit: "unidad" },

    // CERVEZA
    { name: "Monte Carlo", price: 35, cost: 0, category: "Cerveza", unit: "unidad" },
  ];

  const products = [];
  for (let p of productsData) {
    const product = await prisma.product.create({ data: p });
    products.push(product);
  }

  console.log("Productos creados:", products.length);

  console.log("CREANDO INVENTARIO INICIAL PARA CADA BARRA...");

  for (let bar of bars) {
    for (let product of products) {
      await prisma.inventoryItem.create({
        data: {
          barId: bar.id,
          eventId: event.id,
          productId: product.id,
          quantity: 0,      // Arranca en 0
          minStock: 0,
        },
      });
    }
  }

  console.log("INVENTARIO INICIAL COMPLETADO ✔️");
}

main()
  .catch((e) => {
    console.error("❌ ERROR EN SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
