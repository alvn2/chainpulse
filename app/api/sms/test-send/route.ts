import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { phone, text } = await req.json();
    
    if (!phone || !text) {
      return NextResponse.json({ error: 'Phone and text required' }, { status: 400 });
    }

    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    const senderId = process.env.AT_SENDER_ID;
    
    if (!username || !apiKey || username === 'sandbox') {
      return NextResponse.json({ error: 'Production AT_USERNAME and AT_API_KEY are missing in .env' }, { status: 400 });
    }

    // Prepare payload using Legacy API (works well for no-sender-id generic sends)
    const payload = new URLSearchParams();
    payload.append('username', username);
    payload.append('to', phone);
    payload.append('message', text);
    
    // Only append 'from' if a sender ID is actually configured, otherwise let AT use default
    if (senderId && senderId.trim() !== '') {
      payload.append('from', senderId);
    }

    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    const sql = getDb();
    await sql`INSERT INTO sms_messages (sender, message, direction) VALUES (${phone}, ${text}, 'OUTBOUND')`;

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error('Test SMS Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to send SMS', 
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
