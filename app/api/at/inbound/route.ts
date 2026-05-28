import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import axios from 'axios';

// Handles inbound SMS from Africa's Talking
export async function POST(req: NextRequest) {
  try {
    // AT sends data as application/x-www-form-urlencoded
    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const sender = params.get('from');
    const message = params.get('text');

    if (!message) {
      return new NextResponse('OK', { status: 200 });
    }

    const sql = getDb();
    const parts = message.trim().split(' ');
    const command = parts[0]?.toUpperCase();

    let replyText = `Received command ${command}`;
    let triggerAlert = false;
    let alertMsg = '';

    switch (command) {
      case 'TEMP':
        if (parts.length >= 3) {
          const value = parseFloat(parts[1]);
          const shipmentId = parts[2].toUpperCase();
          
          // Log temperature to DB
          await sql`INSERT INTO temperature_logs (shipment_id, value) VALUES (${shipmentId}, ${value})`;
          replyText = `Logged temp ${value}°C for shipment ${shipmentId}.`;
          
          if (value > 8) {
            // Update shipment status to BREACH
            await sql`UPDATE shipments SET status = 'BREACH' WHERE id = ${shipmentId} AND status != 'DELIVERED'`;
            triggerAlert = true;
            alertMsg = `CRITICAL: Temp breach ${value}°C for shipment ${shipmentId}`;
            await sql`INSERT INTO alerts (type, severity, message) VALUES ('TEMP BREACH', 'HIGH', ${alertMsg})`;
          }
        }
        break;

      case 'STOCK':
        if (parts.length >= 3) {
          const qty = parseInt(parts[1], 10);
          const skuId = parts[2].toUpperCase();
          
          await sql`UPDATE stock_levels SET quantity = ${qty}, last_updated = NOW() WHERE sku_id = ${skuId}`;
          replyText = `Set stock for ${skuId} to ${qty}.`;

          // Check threshold
          const [check] = await sql`
            SELECT sl.quantity, s.reorder_threshold, s.name 
            FROM stock_levels sl JOIN skus s ON sl.sku_id = s.id 
            WHERE sl.sku_id = ${skuId}
          `;
          if (check && check.quantity <= check.reorder_threshold) {
            await sql`INSERT INTO alerts (type, severity, message) VALUES ('LOW STOCK', 'MEDIUM', ${`${check.name} (${skuId}) at ${check.quantity}/${check.reorder_threshold}.`})`;
          }
        }
        break;

      case 'RECV':
        if (parts.length >= 3) {
          const qty = parseInt(parts[1], 10);
          const skuId = parts[2].toUpperCase();
          const worker = sender || 'Unknown';
          
          // Update stock
          await sql`UPDATE stock_levels SET quantity = quantity + ${qty}, last_updated = NOW() WHERE sku_id = ${skuId}`;
          
          // Create receiving log
          const logId = `RCV-${Date.now().toString().slice(-6)}`;
          await sql`INSERT INTO receiving_logs (id, worker, sku_id, quantity, sms_text) VALUES (${logId}, ${worker}, ${skuId}, ${qty}, ${message})`;
          
          replyText = `Added ${qty} to ${skuId}.`;
        }
        break;

      case 'STATUS':
        if (parts.length >= 3) {
          const status = parts[1].toUpperCase();
          const shipmentId = parts[2].toUpperCase();
          
          const validStatuses = ['LOADING', 'IN TRANSIT', 'DELAYED', 'BREACH', 'DELIVERED'];
          const mappedStatus = status === 'DELIVER' ? 'DELIVERED' : status;
          
          if (validStatuses.includes(mappedStatus)) {
            await sql`UPDATE shipments SET status = ${mappedStatus} WHERE id = ${shipmentId}`;
            if (mappedStatus === 'DELIVERED') {
              await sql`UPDATE shipments SET progress = 100 WHERE id = ${shipmentId}`;
              await sql`INSERT INTO alerts (type, severity, message) VALUES ('DELIVERY', 'LOW', ${`${shipmentId} successfully delivered.`})`;
            }
            replyText = `Set shipment ${shipmentId} status to ${mappedStatus}.`;
          } else {
            replyText = `Invalid status. Use: LOADING, IN TRANSIT, DELAYED, BREACH, DELIVERED.`;
          }
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
            to: sender || '+254700000000',
            message: alertMsg,
            from: senderId || '',
          });

          await axios.post(
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
          console.log(`[AT SMS Sent] Alert: ${alertMsg}`);
        }
      } catch (err) {
        console.error('Failed to send outbound SMS', err);
      }
    }

    return new NextResponse('OK', {
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (err) {
    console.error('Error handling webhook:', err);
    return new NextResponse('OK', { status: 200 });
  }
}
