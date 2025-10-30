import { pool } from "../db.js";

export const createProduct = async (req, res) => {
  const { sku, name, price_cents, stock } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO products (sku, name, price_cents, stock) VALUES (?, ?, ?, ?)",
      [sku, name, price_cents, stock]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
  res.json(rows[0]);
};

export const searchProducts = async (req, res) => {
  const { search = "", limit = 10 } = req.query;
  const [rows] = await pool.query(
    "SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? LIMIT ?",
    [`%${search}%`, `%${search}%`, Number(limit)]
  );
  res.json(rows);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price_cents, stock } = req.body;
  await pool.query("UPDATE products SET name=?, price_cents=?, stock=? WHERE id=?", [
    name,
    price_cents,
    stock,
    id,
  ]);
  const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [id]);
  res.json(rows[0]);
};
