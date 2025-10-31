import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];

  // 1️⃣ Si es el SERVICE_TOKEN interno (usado por el orchestrator)
  if (token === process.env.SERVICE_TOKEN) return next();

  // 2️⃣ Si no, intentar validar como JWT normal
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
