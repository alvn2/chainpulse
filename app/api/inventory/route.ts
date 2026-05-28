export const dynamic = 'force-dynamic';
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
    const { mode } = body;

    if (mode === 'create_sku') {
      const { sku_id, name, category, unit, threshold, zone } = body;
      if (!sku_id || !name || !category || !unit || !threshold || !zone) {
        return NextResponse.json({ error: 'All SKU fields required' }, { status: 400 });
      }
      
      // Check if SKU exists
      const [existing] = await sql`SELECT id FROM skus WHERE id = ${sku_id}`;
      if (existing) {
        return NextResponse.json({ error: 'SKU ID already exists' }, { status: 400 });
      }

      // Insert SKU
      await sql`
        INSERT INTO skus (id, name, category, unit, reorder_threshold, warehouse_zone)
        VALUES (${sku_id}, ${name}, ${category}, ${unit}, ${threshold}, ${zone})
      `;

      // Insert initial stock level of 0
      await sql`
        INSERT INTO stock_levels (sku_id, quantity)
        VALUES (${sku_id}, 0)
      `;
      
      return NextResponse.json({ success: true, sku_id });
    }

    // Default modes: 'add' or 'set'
    const { sku_id, quantity } = body;
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

export async function PUT(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { sku_id, name, category, unit, threshold, zone } = body;
    
    if (!sku_id) {
      return NextResponse.json({ error: 'SKU ID required' }, { status: 400 });
    }

    await sql`
      UPDATE skus 
      SET name = ${name}, category = ${category}, unit = ${unit}, 
          reorder_threshold = ${threshold}, warehouse_zone = ${zone}
      WHERE id = ${sku_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB Error editing SKU:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const sku_id = searchParams.get('id');

    if (!sku_id) {
      return NextResponse.json({ error: 'SKU ID required' }, { status: 400 });
    }

    // Delete stock_levels first (foreign key constraint)
    await sql`DELETE FROM stock_levels WHERE sku_id = ${sku_id}`;
    
    // Delete SKU
    await sql`DELETE FROM skus WHERE id = ${sku_id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB Error deleting SKU:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
