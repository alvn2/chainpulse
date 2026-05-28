import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const pos = await sql`
      SELECT * FROM purchase_orders ORDER BY created_at DESC
    `;
    return NextResponse.json(pos);
  } catch (error: any) {
    console.error("DB Error in purchase-orders:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { supplier_id, items, item_detail, total } = body;

    if (!supplier_id || !items || !item_detail || !total) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const [supplier] = await sql`SELECT name FROM suppliers WHERE id = ${supplier_id}`;
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const id = `PO-${2950 + Math.floor(Math.random() * 100)}`;
    
    await sql`
      INSERT INTO purchase_orders (id, supplier_id, supplier_name, items, item_detail, total, status, expected)
      VALUES (${id}, ${supplier_id}, ${supplier.name}, ${items}, ${item_detail}, ${total}, 'PENDING', 'In 5 Days')
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DB Error creating PO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
