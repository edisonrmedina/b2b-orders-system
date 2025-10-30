import { Router } from "express";
import {
  createProduct,
  getProductById,
  updateProduct,
  searchProducts,
} from "../controllers/productsController.js";
import { validateProduct } from "../validators/productsValidator.js";

const router = Router();

router.post("/", validateProduct, createProduct);
router.get("/:id", getProductById);
router.get("/", searchProducts);
router.patch("/:id", validateProduct, updateProduct);

export default router;
