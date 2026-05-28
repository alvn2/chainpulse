export const dynamic = 'force-dynamic';
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

export async function PUT(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { id, action } = body;

    if (action === 'receive' && id) {
      // 1. Get the PO
      const [po] = await sql`SELECT * FROM purchase_orders WHERE id = ${id}`;
      if (!po || po.status === 'RECEIVED') {
        return NextResponse.json({ error: 'PO not found or already received' }, { status: 400 });
      }

      // 2. Mark PO as RECEIVED
      await sql`UPDATE purchase_orders SET status = 'RECEIVED' WHERE id = ${id}`;

      // 3. Try to increase stock if 'items' maps to a valid SKU ID.
      // We extract a number from item_detail (e.g., "100 pcs" -> 100).
      // Fallback to 0 if parsing fails, but realistically we expect numbers.
      const match = po.item_detail.match(/(\d+)/);
      const qtyToAdd = match ? parseInt(match[1], 10) : 100; // default 100 if couldn't parse
      const skuId = po.items; // When POs are generated, 'items' usually holds the SKU ID

      const [stockExists] = await sql`SELECT quantity FROM stock_levels WHERE sku_id = ${skuId}`;
      if (stockExists) {
        await sql`
          UPDATE stock_levels 
          SET quantity = quantity + ${qtyToAdd}, last_updated = NOW() 
          WHERE sku_id = ${skuId}
        `;
        
        const logId = `RCV-${Date.now().toString().slice(-6)}`;
        await sql`
          INSERT INTO receiving_logs (id, worker, sku_id, quantity, sms_text)
          VALUES (${logId}, 'System (PO Received)', ${skuId}, ${qtyToAdd}, 'Automated Receiving from PO')
        `;
      }

      return NextResponse.json({ success: true, received: qtyToAdd, sku: skuId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("DB Error updating PO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
