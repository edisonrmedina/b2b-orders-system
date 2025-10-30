import { z } from "zod";

const productSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  price_cents: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const validateProduct = (req, res, next) => {
  try {
    productSchema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors.map(e => e.message) });
  }
};
