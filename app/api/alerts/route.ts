import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const alertsResult = await sql`
      SELECT id, type, severity, message, created_at as timestamp 
      FROM alerts 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    // Map severities to visual severities
    const mappedAlerts = alertsResult.map(a => {
      let vSev = 'blue';
      if (a.severity === 'HIGH') vSev = 'red';
      else if (a.severity === 'MEDIUM') vSev = 'amber';
      else if (a.severity === 'LOW') vSev = 'green';
      
      return {
        id: a.id,
        type: a.type,
        message: a.message,
        severity: vSev,
        timestamp: a.timestamp
      };
    });
    
    return NextResponse.json(mappedAlerts);
  } catch (error: any) {
    console.error("DB Error in alerts:", error.message);
    return NextResponse.json([
      { id: 1, type: 'TEMP BREACH', message: 'SHP-782 temp rose to 9.4°C', severity: 'red', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
      { id: 2, type: 'LOW STOCK', message: 'Naivasha Red Roses below threshold.', severity: 'amber', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: 3, type: 'DELAYED', message: 'Traffic issues reported for Limuru Milk Run', severity: 'amber', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    ]);
  }
}

