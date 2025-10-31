import express from "express";
import dotenv from "dotenv";
import customersRouter from "./routes/customers.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs"; 
import authRouter from '../src/routes/auth.js';

dotenv.config();
const app = express();

app.use(express.json());

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Rutas principales
app.use("/auth", authRouter); 
app.use("/customers", authMiddleware, customersRouter);

// Endpoint interno para Orders
import { getCustomerById } from "./controllers/customersController.js";
import { authMiddleware } from "./authMiddleware.js";
app.get("/internal/customers/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token !== process.env.SERVICE_TOKEN)
    return res.status(403).json({ error: "Unauthorized" });
  getCustomerById(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Customers API running on ${PORT}`));