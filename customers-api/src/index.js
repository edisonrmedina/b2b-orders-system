import express from "express";
import dotenv from "dotenv";
import customersRouter from "./routes/customers.js";

dotenv.config();
const app = express();

app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Rutas principales
app.use("/customers", customersRouter);

// Endpoint interno para Orders
import { getCustomerById } from "./controllers/customersController.js";
app.get("/internal/customers/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token !== process.env.SERVICE_TOKEN)
    return res.status(403).json({ error: "Unauthorized" });
  getCustomerById(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Customers API running on ${PORT}`));