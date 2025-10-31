import express from "express";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import { authMiddleware } from "./authMiddleware.js";
import authRouter from '../src/routes/auth.js';

dotenv.config();

const app = express();
app.use(express.json());

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRouter);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Rutas
app.use("/api/products",authMiddleware , productsRouter);
app.use("/orders",authMiddleware, ordersRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Orders API running on ${PORT}`));
