import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalSkus: 142,
    activeShipments: 14,
    coldBreachesToday: 2,
    lowStockItems: 5,
    pendingPOs: 3,
  });
}
