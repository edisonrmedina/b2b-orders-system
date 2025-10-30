import express from "express";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Rutas
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Orders API running on ${PORT}`));
