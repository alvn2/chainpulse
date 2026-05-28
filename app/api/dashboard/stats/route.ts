import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    
    const [skuCount] = await sql`SELECT COUNT(*)::int as count FROM skus`;
    const [activeShipments] = await sql`SELECT COUNT(*)::int as count FROM shipments WHERE status != 'DELIVERED'`;
    const [breaches] = await sql`SELECT COUNT(*)::int as count FROM shipments WHERE status = 'BREACH'`;
    const [lowStock] = await sql`
      SELECT COUNT(*)::int as count FROM stock_levels sl
      JOIN skus s ON sl.sku_id = s.id
      WHERE sl.quantity <= s.reorder_threshold
    `;
    const [pendingPOs] = await sql`SELECT COUNT(*)::int as count FROM purchase_orders WHERE status = 'PENDING'`;

    return NextResponse.json({
      totalSkus: skuCount.count,
      activeShipments: activeShipments.count,
      coldBreachesToday: breaches.count,
      lowStockItems: lowStock.count,
      pendingPOs: pendingPOs.count,
    });
  } catch (error: any) {
    console.error("DB Error in dashboard/stats:", error.message);
    return NextResponse.json({
      totalSkus: 0,
      activeShipments: 0,
      coldBreachesToday: 0,
      lowStockItems: 0,
      pendingPOs: 0,
    }, { status: 500 });
  }
}
