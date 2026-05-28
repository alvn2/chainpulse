export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const alertsResult = await sql`
      SELECT id, type, severity, message, created_at as timestamp 
      FROM alerts 
      ORDER BY created_at DESC 
      LIMIT 15
    `;
    
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
        timestamp: a.timestamp,
      };
    });
    
    return NextResponse.json(mappedAlerts);
  } catch (error: any) {
    console.error("DB Error in alerts:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}
