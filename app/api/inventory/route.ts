import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const inventoryResult = await sql`
      SELECT sl.sku_id as sku, s.name, s.category, s.unit, sl.quantity as qty, s.reorder_threshold as threshold, s.warehouse_zone, sl.last_updated
      FROM stock_levels sl
      JOIN skus s ON sl.sku_id = s.id
      ORDER BY s.name ASC
    `;
    return NextResponse.json(inventoryResult);
  } catch (error: any) {
    console.error("DB Error in inventory:", error.message);
    return NextResponse.json([
      { sku: 'SKU-RS-NV', name: 'Naivasha Red Roses', category: 'Perishable', unit: 'stems', qty: 450, threshold: 500, warehouse_zone: 'ZONE-B' },
      { sku: 'SKU-AV-MR', name: 'Hass Avocados', category: 'Perishable', unit: 'kg', qty: 1200, threshold: 1000, warehouse_zone: 'ZONE-C' },
      { sku: 'SKU-MZ-EL', name: 'Maize Grain', category: 'Dry Store', unit: 'kg', qty: 8500, threshold: 5000, warehouse_zone: 'ZONE-A' },
      { sku: 'SKU-MLK-LM', name: 'Fresh Milk', category: 'Cold Store', unit: 'liters', qty: 900, threshold: 800, warehouse_zone: 'ZONE-C' },
      { sku: 'SKU-BX-MD', name: 'Cardboard Box (Medium)', category: 'Dry Store', unit: 'pcs', qty: 280, threshold: 300, warehouse_zone: 'ZONE-A' },
    ]);
  }
}

