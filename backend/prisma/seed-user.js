import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando usuario ADMIN...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@pos.com",
      passwordHash,
      role: "ADMIN"
    }
  });

  console.log("Usuario creado:", user);
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Listo.");
  });