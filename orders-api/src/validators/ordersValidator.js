import { z } from "zod";

const orderSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      qty: z.number().int().positive()
    })
  ).min(1)
});

export const validateOrder = (req, res, next) => {
  try {
    orderSchema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors.map(e => e.message) });
  }
};
