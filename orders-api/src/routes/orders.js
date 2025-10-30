import { Router } from "express";
import {
  createOrder,
  getOrderById,
  listOrders
} from "../controllers/ordersController.js";
import { validateOrder } from "../validators/ordersValidator.js";

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
