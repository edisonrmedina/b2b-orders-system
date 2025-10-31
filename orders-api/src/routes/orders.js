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


router.post("/", validateOrder, createOrder);

router.get("/:id", getOrderById);

router.get("/", listOrders);

router.post("/:id/confirm", confirmOrder);

router.post("/:id/cancel", cancelOrder);


export default router;
