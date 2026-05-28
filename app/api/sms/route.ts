import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const messages = await sql`
      SELECT * FROM sms_messages ORDER BY created_at DESC LIMIT 50
    `;
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("DB Error fetching SMS messages:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}
