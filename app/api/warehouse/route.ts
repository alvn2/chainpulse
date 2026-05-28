import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    
    const zones = await sql`SELECT * FROM warehouse_zones ORDER BY id ASC`;
    const logs = await sql`
      SELECT rl.*, s.name as sku_name 
      FROM receiving_logs rl 
      JOIN skus s ON rl.sku_id = s.id
      ORDER BY rl.created_at DESC 
      LIMIT 10
    `;
    const skus = await sql`SELECT id, name, warehouse_zone FROM skus ORDER BY name ASC`;

    return NextResponse.json({
      zones: zones.map(z => ({
        id: z.id,
        name: z.name,
        temp: z.temp_range,
        capacity: z.capacity,
        current: z.current_load,
        type: z.type,
        reading: z.reading ? parseFloat(z.reading) : null,
      })),
      receivingLogs: logs.map(l => ({
        id: l.id,
        worker: l.worker,
        sku_id: l.sku_id,
        sku_name: l.sku_name,
        quantity: l.quantity,
        sms_text: l.sms_text,
        timestamp: l.created_at,
      })),
      skus: skus
    });
  } catch (error: any) {
    console.error("DB Error in warehouse:", error.message);
    return NextResponse.json({ zones: [], receivingLogs: [], skus: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { action } = body;

    if (action === 'transfer') {
      const { sku_id, new_zone } = body;
      
      if (!sku_id || !new_zone) {
        return NextResponse.json({ error: 'SKU and Target Zone are required' }, { status: 400 });
      }

      // 1. Get SKU to find current zone and quantity
      const [sku] = await sql`
        SELECT s.warehouse_zone, sl.quantity 
        FROM skus s
        JOIN stock_levels sl ON s.id = sl.sku_id
        WHERE s.id = ${sku_id}
      `;

      if (!sku) {
        return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
      }

      const currentZone = sku.warehouse_zone;
      const quantity = sku.quantity;

      if (currentZone === new_zone) {
        return NextResponse.json({ error: 'SKU is already in this zone' }, { status: 400 });
      }

      // 2. Update SKU's zone
      await sql`UPDATE skus SET warehouse_zone = ${new_zone} WHERE id = ${sku_id}`;

      // 3. Update Zone Load Capacities (if quantity > 0)
      if (quantity > 0) {
        // Decrease load in old zone
        await sql`UPDATE warehouse_zones SET current_load = GREATEST(current_load - ${quantity}, 0) WHERE id = ${currentZone}`;
        // Increase load in new zone
        await sql`UPDATE warehouse_zones SET current_load = current_load + ${quantity} WHERE id = ${new_zone}`;
      }

      // Log the transfer in receiving_logs as an internal move
      const logId = `TRF-${Date.now().toString().slice(-6)}`;
      await sql`
        INSERT INTO receiving_logs (id, worker, sku_id, quantity, sms_text)
        VALUES (${logId}, 'System', ${sku_id}, ${quantity}, ${`Transferred ${currentZone} -> ${new_zone}`})
      `;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error("DB Error in warehouse POST:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
