import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", (req, res) => {
  const { email } = req.body;

  // Validación básica (podrías buscar el cliente si quisieras)
  if (!email) return res.status(400).json({ error: "Email required" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

export default router;
