export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    
    const suppliers = await sql`
      SELECT s.*,
        (SELECT COUNT(*)::int FROM purchase_orders po WHERE po.supplier_id = s.id AND po.status != 'RECEIVED') as active_pos
      FROM suppliers s
      ORDER BY s.score DESC
    `;

    const mapped = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      location: s.location,
      cat: s.category,
      phone: s.phone,
      score: parseFloat(s.score),
      activePOs: s.active_pos,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("DB Error in suppliers:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}
