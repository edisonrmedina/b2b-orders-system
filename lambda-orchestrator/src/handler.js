import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export const orchestrate = async (event) => {
  try {
    
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { customer_id, items, idempotency_key, correlation_id } = body;

    
    const { CUSTOMERS_API_BASE, ORDERS_API_BASE, SERVICE_TOKEN } = process.env;

    
    const headers = {
      Authorization: `Bearer ${SERVICE_TOKEN}`,
      "Content-Type": "application/json",
    };

    
    console.log("Validating customer...");
    
    const { data: customer } = await axios.get(
      `${CUSTOMERS_API_BASE}/internal/customers/${customer_id}`,
      { headers }
    );

    console.log("Creating order...");
    
    const { data: order } = await axios.post(
      `${ORDERS_API_BASE}/orders`,
      { customer_id, items },
      { headers }
    );

    
    console.log("Confirming order...");
    const { data: confirmed } = await axios.post(
      `${ORDERS_API_BASE}/orders/${order.id}/confirm`,
      {},
      { headers: { ...headers, "X-Idempotency-Key": idempotency_key } }
    );

    
    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        correlationId: correlation_id || null,
        data: { customer, order: confirmed },
      }),
    };
  } catch (error) {
    console.error("❌ Lambda error:", error.message);

    
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    return {
      statusCode: status,
      body: JSON.stringify({
        success: false,
        error: message,
      }),
    };
  }
};
