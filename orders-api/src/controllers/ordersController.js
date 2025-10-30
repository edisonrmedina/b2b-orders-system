import axios from "axios";
import { pool } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

export const createOrder = async (req, res) => {
  const { customer_id, items } = req.body;

  try {
    // Validar cliente en Customers API
    const customerResp = await axios.get(
      `${process.env.CUSTOMERS_API_BASE}/internal/customers/${customer_id}`,
      { headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` } }
    );

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const [prodRows] = await conn.query("SELECT * FROM products WHERE id = ?", [item.product_id]);
        const product = prodRows[0];
        if (!product || product.stock < item.qty) {
          throw new Error(`Stock insuficiente para producto ${item.product_id}`);
        }

        const subtotal = product.price_cents * item.qty;
        total += subtotal;
        orderItems.push({
          product_id: item.product_id,
          qty: item.qty,
          unit_price_cents: product.price_cents,
          subtotal_cents: subtotal,
        });

        await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.qty, item.product_id]);
      }

      const [orderResult] = await conn.query(
        "INSERT INTO orders (customer_id, status, total_cents) VALUES (?, 'CREATED', ?)",
        [customer_id, total]
      );

      for (const item of orderItems) {
        await conn.query(
          "INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?)",
          [orderResult.insertId, item.product_id, item.qty, item.unit_price_cents, item.subtotal_cents]
        );
      }

      await conn.commit();
      const [rows] = await conn.query("SELECT * FROM orders WHERE id=?", [orderResult.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener una orden por ID (incluye items)
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) return res.status(404).json({ error: "Order not found" });

    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [id]);

    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar órdenes con filtros básicos
export const listOrders = async (req, res) => {
  const { status, from, to, limit = 20 } = req.query;

  let query = "SELECT * FROM orders WHERE 1=1";
  const params = [];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  if (from) {
    query += " AND created_at >= ?";
    params.push(from);
  }

  if (to) {
    query += " AND created_at <= ?";
    params.push(to);
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(Number(limit));

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmOrder = async (req, res) => {
  const { id } = req.params;
  const key = req.headers["x-idempotency-key"];
  if (!key) return res.status(400).json({ error: "Missing X-Idempotency-Key header" });

  const conn = await pool.getConnection();
  try {
    // ¿Ya existe la key?
    const [existing] = await conn.query("SELECT response_body FROM idempotency_keys WHERE `key` = ?", [key]);
    if (existing.length > 0) {
      return res.json(existing[0].response_body);
    }

    // Confirmar orden
    const [orderRows] = await conn.query("SELECT * FROM orders WHERE id=?", [id]);
    if (orderRows.length === 0) throw new Error("Order not found");
    const order = orderRows[0];
    if (order.status === "CONFIRMED") return res.json(order);

    await conn.query("UPDATE orders SET status='CONFIRMED' WHERE id=?", [id]);

    const [updatedRows] = await conn.query("SELECT * FROM orders WHERE id=?", [id]);
    const confirmedOrder = updatedRows[0];

    const response = { id: confirmedOrder.id, status: confirmedOrder.status, total_cents: confirmedOrder.total_cents };

    await conn.query(
      "INSERT INTO idempotency_keys (`key`, target_type, target_id, status, response_body, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [key, "order_confirm", id, "success", JSON.stringify(response)]
    );

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [orders] = await conn.query("SELECT * FROM orders WHERE id=?", [id]);
    if (orders.length === 0) throw new Error("Order not found");

    const order = orders[0];
    if (order.status === "CANCELED") throw new Error("Order already canceled");

    if (order.status === "CONFIRMED") {
      const createdAt = new Date(order.created_at);
      const diffMinutes = (Date.now() - createdAt.getTime()) / 60000;
      if (diffMinutes > 10) throw new Error("Cannot cancel after 10 minutes");
    }

    // Restaurar stock
    const [items] = await conn.query("SELECT * FROM order_items WHERE order_id=?", [id]);
    for (const item of items) {
      await conn.query("UPDATE products SET stock = stock + ? WHERE id=?", [item.qty, item.product_id]);
    }

    await conn.query("UPDATE orders SET status='CANCELED' WHERE id=?", [id]);
    await conn.commit();

    res.json({ success: true, message: "Order canceled" });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};
