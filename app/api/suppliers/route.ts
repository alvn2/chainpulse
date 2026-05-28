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

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { id, name, location, category, phone } = body;
    
    if (!id || !name || !location || !category || !phone) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const [existing] = await sql`SELECT id FROM suppliers WHERE id = ${id}`;
    if (existing) {
      return NextResponse.json({ error: 'Supplier ID already exists' }, { status: 400 });
    }

    await sql`
      INSERT INTO suppliers (id, name, location, category, phone, score)
      VALUES (${id}, ${name}, ${location}, ${category}, ${phone}, 100)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB Error creating supplier:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    const { id, name, location, category, phone } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID required' }, { status: 400 });
    }

    await sql`
      UPDATE suppliers 
      SET name = ${name}, location = ${location}, category = ${category}, phone = ${phone}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB Error editing supplier:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Supplier ID required' }, { status: 400 });
    }

    // Delete related POs to maintain referential integrity
    await sql`DELETE FROM purchase_orders WHERE supplier_id = ${id}`;
    
    // Delete supplier
    await sql`DELETE FROM suppliers WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DB Error deleting supplier:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
