-- ChainPulse Seed Data
-- Realistic Kenyan supply chain / cold chain data

-- SKUs
INSERT INTO skus (id, name, category, unit, reorder_threshold, warehouse_zone) VALUES
  ('SKU-RS-NV', 'Naivasha Red Roses', 'Perishable', 'stems', 500, 'ZONE-B'),
  ('SKU-AV-MR', 'Hass Avocados', 'Perishable', 'kg', 1000, 'ZONE-C'),
  ('SKU-MZ-EL', 'Maize Grain', 'Dry Store', 'kg', 5000, 'ZONE-A'),
  ('SKU-MLK-LM', 'Fresh Milk', 'Cold Store', 'liters', 800, 'ZONE-C'),
  ('SKU-BX-MD', 'Cardboard Box (Medium)', 'Dry Store', 'pcs', 300, 'ZONE-A'),
  ('SKU-PA-TH', 'Thika Pineapples', 'Perishable', 'pcs', 500, 'ZONE-C'),
  ('SKU-TE-LM', 'Limuru Premium Tea', 'Dry Store', 'kg', 200, 'ZONE-A'),
  ('SKU-CR-NV', 'Naivasha Carnations', 'Perishable', 'stems', 400, 'ZONE-B');

-- Stock Levels
INSERT INTO stock_levels (sku_id, quantity) VALUES
  ('SKU-RS-NV', 450),
  ('SKU-AV-MR', 1200),
  ('SKU-MZ-EL', 8500),
  ('SKU-MLK-LM', 900),
  ('SKU-BX-MD', 280),
  ('SKU-PA-TH', 0),
  ('SKU-TE-LM', 350),
  ('SKU-CR-NV', 620);

-- Shipments
INSERT INTO shipments (id, batch_name, origin, destination, driver_name, status, eta, progress, created_at) VALUES
  ('SHP-782', 'Naivasha Roses B.007', 'Naivasha Farm', 'JKIA Export Hub', 'Kipchoge K.', 'BREACH', '14:00', 45, NOW() - INTERVAL '5 minutes'),
  ('SHP-785', 'Muranga Avocado R.3', 'Muranga DC', 'Mombasa Port', 'Mwangi J.', 'IN TRANSIT', '16:30', 78, NOW() - INTERVAL '10 minutes'),
  ('SHP-789', 'Limuru Tea Box B.2', 'Limuru HQ', 'Westlands DC', 'Njoroge P.', 'DELAYED', '15:45', 20, NOW() - INTERVAL '30 minutes'),
  ('SHP-791', 'Eldoret Berries B.04', 'Eldoret North', 'JKIA Export Hub', 'Ochieng D.', 'IN TRANSIT', '18:00', 10, NOW() - INTERVAL '15 minutes'),
  ('SHP-792', 'Naivasha Carnations', 'Naivasha Farm', 'Mombasa Port', 'Kamau R.', 'BREACH', '17:15', 65, NOW() - INTERVAL '3 minutes'),
  ('SHP-772', 'Kitale Maize Exp', 'Kitale Whouse', 'Nakuru Hub', 'Mutua S.', 'DELIVERED', '-', 100, NOW() - INTERVAL '6 hours'),
  ('SHP-795', 'Thika Pineapple Box', 'Thika Farms', 'Nairobi CBD', 'Wambui A.', 'LOADING', '19:00', 0, NOW() - INTERVAL '1 minute');

-- Temperature Logs
INSERT INTO temperature_logs (shipment_id, value, recorded_at) VALUES
  ('SHP-782', 9.4, NOW() - INTERVAL '2 minutes'),
  ('SHP-782', 7.2, NOW() - INTERVAL '20 minutes'),
  ('SHP-782', 5.1, NOW() - INTERVAL '40 minutes'),
  ('SHP-785', 4.2, NOW() - INTERVAL '5 minutes'),
  ('SHP-785', 4.0, NOW() - INTERVAL '25 minutes'),
  ('SHP-789', 8.1, NOW() - INTERVAL '8 minutes'),
  ('SHP-791', 3.8, NOW() - INTERVAL '4 minutes'),
  ('SHP-791', 3.6, NOW() - INTERVAL '24 minutes'),
  ('SHP-792', 11.2, NOW() - INTERVAL '1 minute'),
  ('SHP-792', 8.8, NOW() - INTERVAL '15 minutes'),
  ('SHP-792', 6.5, NOW() - INTERVAL '30 minutes'),
  ('SHP-795', 5.0, NOW() - INTERVAL '1 minute');

-- Alerts
INSERT INTO alerts (type, severity, message, created_at) VALUES
  ('TEMP BREACH', 'HIGH', 'SHP-782 temp rose to 9.4°C — Naivasha Roses batch at risk.', NOW() - INTERVAL '2 minutes'),
  ('TEMP BREACH', 'HIGH', 'SHP-792 temp rose to 11.2°C — Naivasha Carnations critical.', NOW() - INTERVAL '4 minutes'),
  ('LOW STOCK', 'MEDIUM', 'Naivasha Red Roses (SKU-RS-NV) below reorder threshold — 450/500.', NOW() - INTERVAL '10 minutes'),
  ('OUT OF STOCK', 'HIGH', 'Thika Pineapples (SKU-PA-TH) completely out of stock.', NOW() - INTERVAL '12 minutes'),
  ('DELAYED', 'MEDIUM', 'SHP-789 Limuru Tea delayed — traffic on Limuru Road.', NOW() - INTERVAL '15 minutes'),
  ('LOW STOCK', 'MEDIUM', 'Cardboard Box (SKU-BX-MD) below threshold — 280/300.', NOW() - INTERVAL '20 minutes'),
  ('DELIVERY', 'LOW', 'SHP-772 Kitale Maize successfully delivered to Nakuru Hub.', NOW() - INTERVAL '6 hours');

-- Suppliers
INSERT INTO suppliers (id, name, location, category, phone, score) VALUES
  ('SUP-01', 'Maridadi Flowers', 'Naivasha', 'Perishable', '+254700111222', 98.5),
  ('SUP-02', 'Kakuzi Farms', 'Muranga', 'Perishable', '+254711222333', 96.0),
  ('SUP-03', 'Eldoret Grain Co', 'Eldoret', 'Dry Store', '+254722333444', 99.0),
  ('SUP-04', 'Limuru Dairy', 'Limuru', 'Cold Store', '+254733444555', 95.0),
  ('SUP-05', 'Thika Fresh Produce', 'Thika', 'Perishable', '+254744555666', 91.5);

-- Purchase Orders
INSERT INTO purchase_orders (id, supplier_id, supplier_name, items, item_detail, total, status, expected, created_at) VALUES
  ('PO-2941', 'SUP-01', 'Maridadi Flowers', 'SKU-RS-NV', '2000 stems', 70000, 'PENDING', 'In 3 Days', NOW() - INTERVAL '1 day'),
  ('PO-2940', 'SUP-02', 'Kakuzi Farms', 'SKU-AV-MR', '500 kg', 60000, 'CONFIRMED', 'Tomorrow', NOW() - INTERVAL '2 days'),
  ('PO-2938', 'SUP-04', 'Limuru Dairy', 'SKU-MLK-LM', '500 liters', 45000, 'SHIPPED', 'Today', NOW() - INTERVAL '3 days'),
  ('PO-2935', 'SUP-05', 'Thika Fresh Produce', 'SKU-PA-TH', '1000 pcs', 35000, 'PENDING', 'In 5 Days', NOW() - INTERVAL '12 hours');

-- Warehouse Zones
INSERT INTO warehouse_zones (id, name, temp_range, capacity, current_load, type, reading) VALUES
  ('ZONE-A', 'Dry Store A', 'Ambient', 5000, 2400, 'dry', NULL),
  ('ZONE-B', 'Cold Store B', '2.0 - 4.0 °C', 2000, 1800, 'cold', 3.1),
  ('ZONE-C', 'Cold Store C', '0.0 - 2.0 °C', 1500, 900, 'cold', 1.2),
  ('ZONE-D', 'Dispatch Bay', 'Transit', 1000, 450, 'transit', NULL);

-- Receiving Logs
INSERT INTO receiving_logs (id, worker, sku_id, quantity, sms_text, created_at) VALUES
  ('RCV-901', 'Kariuki', 'SKU-AV-MR', 200, 'RECV 200 SKU-AV-MR', NOW() - INTERVAL '10 minutes'),
  ('RCV-902', 'Otieno', 'SKU-MZ-EL', 500, 'RECV 500 SKU-MZ-EL', NOW() - INTERVAL '25 minutes'),
  ('RCV-903', 'Njeri', 'SKU-RS-NV', 100, 'RECV 100 SKU-RS-NV', NOW() - INTERVAL '40 minutes'),
  ('RCV-904', 'Kamau', 'SKU-MLK-LM', 300, 'RECV 300 SKU-MLK-LM', NOW() - INTERVAL '55 minutes'),
  ('RCV-905', 'Wanjiku', 'SKU-TE-LM', 150, 'RECV 150 SKU-TE-LM', NOW() - INTERVAL '70 minutes'),
  ('RCV-906', 'Kiprop', 'SKU-BX-MD', 50, 'RECV 50 SKU-BX-MD', NOW() - INTERVAL '85 minutes');
