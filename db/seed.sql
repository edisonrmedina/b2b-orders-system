-- Seed customers
INSERT INTO customers (name, email, phone)
VALUES
  ('ACME Corp', 'ops@acme.com', '555-1234'),
  ('Globex Inc', 'sales@globex.com', '555-5678'),
  ('Initech', 'contact@initech.com', '555-9876');

-- Seed products
INSERT INTO products (sku, name, price_cents, stock)
VALUES
  ('SKU-001', 'Laptop Pro', 129900, 10),
  ('SKU-002', 'Wireless Mouse', 19900, 50),
  ('SKU-003', 'Mechanical Keyboard', 59900, 20);
