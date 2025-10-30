import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
});

export const validateCustomer = (req, res, next) => {
  try {
    customerSchema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors.map((e) => e.message) });
  }
};