import { Router } from "express";
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  getOrderById,
  listOrders
} from "../controllers/ordersController.js";
import { validateOrder } from "../validators/ordersValidator.js";
import authRouter from "../routes/auth.js";

const router = Router();


// Crear orden
router.post("/", validateOrder, createOrder);

// Obtener una orden por ID (con sus items)
router.get("/:id", getOrderById);

// Listar órdenes (por estado, fechas, etc.)
router.get("/", listOrders);

router.post("/:id/confirm", confirmOrder);

router.post("/:id/cancel", cancelOrder);


export default router;
