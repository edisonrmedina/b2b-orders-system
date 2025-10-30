import { Router } from "express";
import {
  createCustomer,
  getCustomerById,
  searchCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customersController.js";
import { validateCustomer } from "../validator/customersValidator.js";

const router = Router();

router.post("/", validateCustomer, createCustomer);
router.get("/:id", getCustomerById);
router.get("/", searchCustomers);
router.put("/:id", validateCustomer, updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
