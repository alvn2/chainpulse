import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const inventoryResult = await sql`
      SELECT sl.sku_id as sku, s.name, s.category, s.unit, 
             sl.quantity as qty, s.reorder_threshold as threshold, 
             s.warehouse_zone, sl.last_updated
      FROM stock_levels sl
      JOIN skus s ON sl.sku_id = s.id
      ORDER BY s.name ASC
    `;
    return NextResponse.json(inventoryResult);
  } catch (error: any) {
    console.error("DB Error in inventory:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { sku_id, quantity, mode } = body;

    if (!sku_id || quantity === undefined) {
      return NextResponse.json({ error: 'sku_id and quantity required' }, { status: 400 });
    }

    if (mode === 'add') {
      await sql`
        UPDATE stock_levels 
        SET quantity = quantity + ${quantity}, last_updated = NOW()
        WHERE sku_id = ${sku_id}
      `;
    } else {
      await sql`
        UPDATE stock_levels 
        SET quantity = ${quantity}, last_updated = NOW()
        WHERE sku_id = ${sku_id}
      `;
    }

    // Check for low stock and create alert
    const [check] = await sql`
      SELECT sl.quantity, s.reorder_threshold, s.name 
      FROM stock_levels sl JOIN skus s ON sl.sku_id = s.id 
      WHERE sl.sku_id = ${sku_id}
    `;
    if (check && check.quantity <= check.reorder_threshold) {
      await sql`
        INSERT INTO alerts (type, severity, message)
        VALUES ('LOW STOCK', 'MEDIUM', ${`${check.name} (${sku_id}) at ${check.quantity}/${check.reorder_threshold}.`})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB Error updating inventory:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
