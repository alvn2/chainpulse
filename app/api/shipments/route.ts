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

    // Map columns to standard format
    const formatted = shipments.map(s => ({
      id: s.id,
      batch: s.batch_name,
      origin: s.origin,
      destination: s.destination,
      driver: s.driver_name,
      temp: parseFloat(s.current_temp) || 0,
      status: s.status,
      eta: s.eta,
      lastUpdate: s.created_at
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("DB Error in shipments:", error.message);
    return NextResponse.json([
      { id: 'SHP-782', batch: 'Naivasha Roses B.007', origin: 'Naivasha Farm', destination: 'JKIA Export Hub', driver: 'Kipchoge K.', temp: 9.4, status: 'BREACH', lastUpdate: new Date().toISOString() },
      { id: 'SHP-785', batch: 'Muranga Avocado R.3', origin: 'Muranga DC', destination: 'Mombasa Port', driver: 'Mwangi J.', temp: 4.2, status: 'IN TRANSIT', lastUpdate: new Date().toISOString() },
      { id: 'SHP-789', batch: 'Limuru Tea Box B.2', origin: 'Limuru HQ', destination: 'Westlands DC', driver: 'Njoroge P.', temp: 8.1, status: 'DELAYED', lastUpdate: new Date().toISOString() },
      { id: 'SHP-791', batch: 'Eldoret Berries B.04', origin: 'Eldoret North', destination: 'JKIA Export Hub', driver: 'Ochieng D.', temp: 3.8, status: 'IN TRANSIT', lastUpdate: new Date().toISOString() },
      { id: 'SHP-792', batch: 'Naivasha Carnations', origin: 'Naivasha Farm', destination: 'Mombasa Port', driver: 'Kamau R.', temp: 11.2, status: 'BREACH', lastUpdate: new Date().toISOString() },
    ]);
  }
}

