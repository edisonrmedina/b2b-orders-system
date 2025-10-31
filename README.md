# 🧾 B2B Orders System

Sistema B2B compuesto por dos APIs (Customers y Orders) y un Lambda Orchestrator que las orquesta.  
Desarrollado con **Node.js + Express + MySQL + Docker + Serverless Framework**.

---

## 🧱 Arquitectura General

```
+-----------------+       +----------------+       +------------------------+
|  Customers API  | <---> |  Orders API    | <---> | Lambda Orchestrator   |
| (puerto 3001)   |       | (puerto 3010)  |       | (puerto 3000 local)   |
+-----------------+       +----------------+       +------------------------+
        ↑
        |
        +--> MySQL (base de datos b2b)
```

---

## ⚙️ Tecnologías Utilizadas

- **Node.js 22**
- **Express.js**
- **MySQL 8**
- **Docker / Docker Compose**
- **Serverless Framework + serverless-offline**
- **Axios**
- **JWT + dotenv**
- **Zod / Joi** (validación)
- **OpenAPI 3.0** (documentación de endpoints)

---

## 🚀 Levantamiento del Entorno Local

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/<tu-usuario>/b2b-orders-system.git
cd b2b-orders-system
```

### 2️⃣ Crear archivos `.env` en cada servicio

#### 📁 `customers-api/.env`

```env
PORT=3001
DB_HOST=mysql
DB_USER=root
DB_PASS=root
DB_NAME=b2b
JWT_SECRET=secret123
SERVICE_TOKEN=internal123
```

#### 📁 `orders-api/.env`

```env
PORT=3002
DB_HOST=mysql
DB_USER=root
DB_PASS=root
DB_NAME=b2b
CUSTOMERS_API_BASE=http://customers-api:3001
SERVICE_TOKEN=internal123
JWT_SECRET=secret123
```

#### 📁 `lambda-orchestrator/.env`

```env
PORT=3000
CUSTOMERS_API_BASE=http://localhost:3001
ORDERS_API_BASE=http://localhost:3010
SERVICE_TOKEN=internal123
```

### 3️⃣ Construir y levantar los contenedores

```bash
docker-compose build
docker-compose up -d
```

Esto levantará:
- **MySQL** (puerto 3306)
- **Customers API** (puerto 3001)
- **Orders API** (puerto 3010)

### 4️⃣ Verificar servicios

```bash
curl http://localhost:3001/health   # → {"status":"ok"}
curl http://localhost:3010/health   # → {"status":"ok"}
```

### 5️⃣ Levantar el Lambda Orchestrator local

```bash
cd lambda-orchestrator
npm install
npm run dev
```

Serverless mostrará algo como:

```
Serverless: Offline [HTTP] listening on http://localhost:3000
```

---

## 🧪 Probar el Flujo Completo

### Endpoint Lambda

```
POST http://localhost:3000/dev/orchestrator/create-and-confirm-order
```

### Body (JSON)

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "qty": 2 }
  ],
  "idempotency_key": "abc-123",
  "correlation_id": "req-789"
}
```

### Respuesta esperada

```json
{
  "success": true,
  "correlationId": "req-789",
  "data": {
    "customer": {
      "id": 1,
      "name": "ACME Corp",
      "email": "ops@acme.com",
      "phone": "555-1234"
    },
    "order": {
      "id": 5,
      "status": "CONFIRMED",
      "total_cents": 259800
    }
  }
}
```

---

## 🧩 Estructura del Proyecto

```
b2b-orders-system/
│
├── customers-api/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── index.js
│   ├── .env
│   └── openapi.yaml
│
├── orders-api/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── index.js
│   ├── .env
│   └── openapi.yaml
│
├── lambda-orchestrator/
│   ├── src/
│   │   └── handler.js
│   ├── serverless.yml
│   └── .env
│
├── db/
│   ├── schema.sql
│   └── seed.sql
│
└── docker-compose.yml
```

---

## 🧮 Base de Datos

Las tablas mínimas incluidas en `/db/schema.sql`:

- `customers` (id, name, email, phone, created_at)
- `products` (id, sku, name, price_cents, stock, created_at)
- `orders` (id, customer_id, status, total_cents, created_at)
- `order_items` (id, order_id, product_id, qty, unit_price_cents, subtotal_cents)
- `idempotency_keys` (key, target_type, target_id, status, response_body, created_at, expires_at)

Datos iniciales en `/db/seed.sql`.

---

## 📜 Endpoints Principales

### Customers API (puerto 3001)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/customers` | Crear cliente |
| GET | `/customers/:id` | Detalle de cliente |
| GET | `/internal/customers/:id` | Endpoint interno para Orders (requiere `Authorization: Bearer internal123`) |

### Orders API (puerto 3010)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/orders` | Crear pedido |
| POST | `/orders/:id/confirm` | Confirmar pedido (idempotente) |
| GET | `/orders/:id` | Obtener detalle de pedido |

### Lambda Orchestrator (puerto 3000)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/dev/orchestrator/create-and-confirm-order` | Orquesta creación + confirmación de pedido |

---

## 📘 Documentación Swagger

- Customers API → [http://localhost:3001/docs](http://localhost:3001/docs)
- Orders API → [http://localhost:3010/docs](http://localhost:3010/docs)

--

## 🧠 Ejemplo de Flujo

1. **Lambda recibe:**
   ```json
   { "customer_id": 1, "items": [{ "product_id": 1, "qty": 2 }] }
   ```

2. **Valida cliente** vía Customers API.

3. **Crea la orden** en Orders API.

4. **Confirma la orden** (idempotente).

5. **Devuelve JSON consolidado** con cliente + orden confirmada.

---

## ☁️ Probar Lambda (local y AWS)

### 🧩 1️⃣ Ejecución local (Serverless Offline)

Desde la carpeta `/lambda-orchestrator`:

```bash
npm install
npm run dev

---

---
## ✅ Comandos Útiles

```bash
# Apagar contenedores
docker-compose down

# Ver logs de un servicio
docker-compose logs orders-api

# Acceder a MySQL
docker exec -it mysql_db mysql -uroot -proot b2b

# Reconstruir un servicio específico
docker-compose up -d --build customers-api
```

---

## 🐛 Troubleshooting

### Error: `serverless-offline` con ESM

Si obtienes un error sobre `top-level await`, ejecuta:

```bash
cd lambda-orchestrator
npm install serverless-offline@13.3.0 --save-dev
```

### Error de conexión a MySQL

Asegúrate de que el contenedor de MySQL esté corriendo:

```bash
docker-compose ps
```

---

## 🧾 Créditos

Desarrollado por **Edison Reinoso**  
Prueba técnica – Senior Backend (Node.js + MySQL + Docker + Lambda)

---

## 📄 Licencia

MIT License