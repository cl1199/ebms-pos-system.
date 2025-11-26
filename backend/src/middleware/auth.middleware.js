import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export const authRequired = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Acceso restringido" });
  }
  next();
};