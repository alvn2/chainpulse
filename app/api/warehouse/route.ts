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
    });
  } catch (error: any) {
    console.error("DB Error in warehouse:", error.message);
    return NextResponse.json({ zones: [], receivingLogs: [] }, { status: 500 });
  }
}
