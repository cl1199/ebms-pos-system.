import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Token consistente con el middleware
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "super_secret_key",
      { expiresIn: "1d" }
    );

    // Retornar usuario sin password
    const { passwordHash, ...userData } = user;

    res.json({ user: userData, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};