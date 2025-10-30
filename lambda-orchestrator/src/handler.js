import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export const orchestrate = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { customer_id, items, idempotency_key, correlation_id } = body;

    const CUSTOMERS_API_BASE = process.env.CUSTOMERS_API_BASE;
    const ORDERS_API_BASE = process.env.ORDERS_API_BASE;
    const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

    // 1️⃣ Validar cliente
    const customer = await axios.get(
      `${CUSTOMERS_API_BASE}/internal/customers/${customer_id}`,
      { headers: { Authorization: `Bearer ${SERVICE_TOKEN}` } }
    );

    // 2️⃣ Crear orden
    const order = await axios.post(`${ORDERS_API_BASE}/orders`, {
      customer_id,
      items,
    });

    // 3️⃣ Confirmar orden
    const confirmed = await axios.post(
      `${ORDERS_API_BASE}/orders/${order.data.id}/confirm`,
      {},
      { headers: { "X-Idempotency-Key": idempotency_key } }
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        correlationId: correlation_id,
        data: { customer: customer.data, order: confirmed.data },
      }),
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
