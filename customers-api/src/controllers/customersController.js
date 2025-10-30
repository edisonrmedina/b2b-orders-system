import { pool } from "../db.js";

export const createCustomer = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [id]);
  if (rows.length === 0) return res.status(404).json({ error: "Customer not found" });
  res.json(rows[0]);
};

export const searchCustomers = async (req, res) => {
  const { search = "", limit = 10 } = req.query;
  const [rows] = await pool.query(
    "SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? LIMIT ?",
    [`%${search}%`, `%${search}%`, Number(limit)]
  );
  res.json(rows);
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  await pool.query("UPDATE customers SET name=?, email=?, phone=? WHERE id=?", [
    name,
    email,
    phone,
    id,
  ]);
  const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [id]);
  res.json(rows[0]);
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM customers WHERE id = ?", [id]);
  res.json({ success: true });
};