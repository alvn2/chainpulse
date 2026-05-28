import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  try {
    const sql = getDb();
    
    let shipments;
    if (statusFilter && statusFilter !== 'ALL') {
      shipments = await sql`
        SELECT s.*, 
               (SELECT value FROM temperature_logs t WHERE t.shipment_id = s.id ORDER BY recorded_at DESC LIMIT 1) as current_temp
        FROM shipments s 
        WHERE s.status = ${statusFilter}
        ORDER BY created_at DESC
      `;
    } else {
      shipments = await sql`
        SELECT s.*, 
               (SELECT value FROM temperature_logs t WHERE t.shipment_id = s.id ORDER BY recorded_at DESC LIMIT 1) as current_temp
        FROM shipments s 
        ORDER BY created_at DESC
      `;
    }

    const formatted = shipments.map(s => ({
      id: s.id,
      batch: s.batch_name,
      origin: s.origin,
      destination: s.destination,
      driver: s.driver_name,
      temp: parseFloat(s.current_temp) || 0,
      status: s.status,
      eta: s.eta,
      progress: s.progress,
      lastUpdate: s.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("DB Error in shipments:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { batch, origin, destination, driver } = body;

    if (!batch || !origin || !destination || !driver) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const id = `SHP-${Date.now().toString().slice(-3)}`;
    
    await sql`
      INSERT INTO shipments (id, batch_name, origin, destination, driver_name, status, eta, progress)
      VALUES (${id}, ${batch}, ${origin}, ${destination}, ${driver}, 'LOADING', '-', 0)
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DB Error creating shipment:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
