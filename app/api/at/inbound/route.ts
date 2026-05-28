import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Handles inbound SMS from Africa's Talking
export async function POST(req: NextRequest) {
  try {
    // AT sends data as application/x-www-form-urlencoded
    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const sender = params.get('from');
    const message = params.get('text');
    const to = params.get('to');
    const date = params.get('date');
    const id = params.get('id');

    if (!message) {
      return new NextResponse('OK', { status: 200 }); // Always acknowledge
    }

    const parts = message.trim().split(' ');
    const command = parts[0]?.toUpperCase();

    // Mock processing logic (as if doing DB operations)
    let replyText = `Received command ${command}`;
    let triggerAlert = false;
    let alertMsg = '';

    switch (command) {
      case 'TEMP':
        if (parts.length >= 3) {
          const value = parseFloat(parts[1]);
          const batchId = parts[2];
          replyText = `Logged temp ${value}°C for batch ${batchId}.`;
          
          if (value > 8) {
            triggerAlert = true;
            alertMsg = `CRITICAL: Temp breach ${value}°C for batch ${batchId}`;
          }
        }
        break;
      case 'STOCK':
        if (parts.length >= 3) {
          const qty = parseInt(parts[1], 10);
          const skuId = parts[2];
          replyText = `Set stock for ${skuId} to ${qty}.`;
        }
        break;
      case 'RECV':
        if (parts.length >= 3) {
          const qty = parseInt(parts[1], 10);
          const skuId = parts[2];
          replyText = `Added ${qty} to ${skuId}.`;
        }
        break;
      case 'STATUS':
        if (parts.length >= 3) {
          const status = parts[1].toUpperCase();
          const shipmentId = parts[2];
          replyText = `Set shipment ${shipmentId} status to ${status}.`;
        }
        break;
      default:
        replyText = `Unknown command. Use TEMP, STOCK, RECV, STATUS.`;
    }

    console.log(`[AT Webhook] From: ${sender} | Command: ${command} | Reply: ${replyText}`);

    // If there's an alert, notify manager via Outbound AT API
    if (triggerAlert) {
      try {
        const username = process.env.AT_USERNAME || 'sandbox';
        const apiKey = process.env.AT_API_KEY;
        const senderId = process.env.AT_SENDER_ID;
        
        if (apiKey) {
          const payload = new URLSearchParams({
            username,
            to: '+254700000000', // Manager phone number mock
            message: alertMsg,
            from: senderId || ''
          });

          await axios.post(
            'https://api.africastalking.com/version1/messaging',
            payload.toString(),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apiKey': apiKey,
                'Accept': 'application/json'
              }
            }
          );
          console.log(`[AT SMS Sent] To Manager: ${alertMsg}`);
        } else {
          console.log(`[AT SMS Skipped] No API key configured. Msg: ${alertMsg}`);
        }
      } catch (err) {
        console.error('Failed to send outbound SMS', err);
      }
    }

    // Must return "OK" plain text to Africa's Talking
    return new NextResponse('OK', {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

  } catch (err) {
    console.error('Error handling webhook:', err);
    // Even on error, return OK so AT doesn't retry infinitely unless you want retries
    return new NextResponse('OK', { status: 200 });
  }
}
