-- ChainPulse Database Schema
-- Run this against your Neon PostgreSQL instance

DROP TABLE IF EXISTS receiving_logs CASCADE;
DROP TABLE IF EXISTS temperature_logs CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS skus CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS warehouse_zones CASCADE;

-- SKU product catalog
CREATE TABLE skus (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('Perishable', 'Dry Store', 'Cold Store')),
  unit VARCHAR(20) NOT NULL,
  reorder_threshold INTEGER NOT NULL DEFAULT 0,
  warehouse_zone VARCHAR(10) NOT NULL
);

-- Current stock levels per SKU
CREATE TABLE stock_levels (
  sku_id VARCHAR(20) PRIMARY KEY REFERENCES skus(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active shipments
CREATE TABLE shipments (
  id VARCHAR(20) PRIMARY KEY,
  batch_name VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  driver_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'LOADING' CHECK (status IN ('LOADING', 'IN TRANSIT', 'DELAYED', 'BREACH', 'DELIVERED')),
  eta VARCHAR(20),
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Temperature readings per shipment
CREATE TABLE temperature_logs (
  id SERIAL PRIMARY KEY,
  shipment_id VARCHAR(20) NOT NULL REFERENCES shipments(id),
  value DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System alerts
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(50) NOT NULL,
  category VARCHAR(30) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  score DECIMAL(4,1) NOT NULL DEFAULT 0
);

-- Purchase orders
CREATE TABLE purchase_orders (
  id VARCHAR(20) PRIMARY KEY,
  supplier_id VARCHAR(20) NOT NULL REFERENCES suppliers(id),
  supplier_name VARCHAR(100) NOT NULL,
  items VARCHAR(20) NOT NULL,
  item_detail VARCHAR(50) NOT NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'RECEIVED')),
  expected VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Warehouse zones
CREATE TABLE warehouse_zones (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  temp_range VARCHAR(30) NOT NULL,
  capacity INTEGER NOT NULL,
  current_load INTEGER NOT NULL DEFAULT 0,
  type VARCHAR(10) NOT NULL CHECK (type IN ('dry', 'cold', 'transit')),
  reading DECIMAL(4,1)
);

-- Goods receiving log (SMS-driven)
CREATE TABLE receiving_logs (
  id VARCHAR(20) PRIMARY KEY,
  worker VARCHAR(50) NOT NULL,
  sku_id VARCHAR(20) NOT NULL REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  sms_text VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_temp_logs_shipment ON temperature_logs(shipment_id, recorded_at DESC);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_stock_sku ON stock_levels(sku_id);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
