export const dynamic = 'force-dynamic';
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
    
    // Log inbound message
    await sql`INSERT INTO sms_messages (sender, message, direction) VALUES (${sender || 'Unknown'}, ${message}, 'INBOUND')`;

    const parts = message.trim().split(' ');
    const command = parts[0]?.toUpperCase();

    let replyText = `Received command ${command}`;
    
    // Array to hold outbound SMS we need to send
    const outboundTasks: { phone: string, text: string }[] = [];

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
            const alertMsg = `CRITICAL: Temp breach ${value}°C for shipment ${shipmentId}`;
            await sql`INSERT INTO alerts (type, severity, message) VALUES ('TEMP BREACH', 'HIGH', ${alertMsg})`;
            // Queue SMS to Manager
            const managerPhone = process.env.AT_MANAGER_PHONE || sender;
            if (managerPhone) outboundTasks.push({ phone: managerPhone, text: alertMsg });
          }
        }
        break;

      case 'STOCK':
        if (parts.length >= 3) {
          const qty = parseInt(parts[1], 10);
          const skuId = parts[2].toUpperCase();
          
          await sql`UPDATE stock_levels SET quantity = ${qty}, last_updated = NOW() WHERE sku_id = ${skuId}`;
          replyText = `Set stock for ${skuId} to ${qty}.`;

          // Check threshold for Auto-Reorder (Loop 3)
          const [check] = await sql`
            SELECT sl.quantity, s.reorder_threshold, s.name 
            FROM stock_levels sl JOIN skus s ON sl.sku_id = s.id 
            WHERE sl.sku_id = ${skuId}
          `;
          if (check && check.quantity <= check.reorder_threshold) {
            const alertText = `${check.name} (${skuId}) at ${check.quantity}/${check.reorder_threshold}.`;
            await sql`INSERT INTO alerts (type, severity, message) VALUES ('LOW STOCK', 'MEDIUM', ${alertText})`;
            
            // Auto create PO
            const [supplier] = await sql`SELECT id, name, phone FROM suppliers LIMIT 1`; // Grab first supplier as fallback if sku doesn't map directly
            if (supplier) {
               const poId = `PO-${2950 + Math.floor(Math.random() * 100)}`;
               const poQty = check.reorder_threshold * 2;
               await sql`
                 INSERT INTO purchase_orders (id, supplier_id, supplier_name, items, item_detail, total, status, expected)
                 VALUES (${poId}, ${supplier.id}, ${supplier.name}, ${skuId}, ${poQty.toString() + ' pcs'}, ${poQty * 100}, 'PENDING', 'In 5 Days')
               `;
               const poMsg = `Auto-reorder: ${skuId} stock at ${check.quantity} (threshold ${check.reorder_threshold}). ${poId} raised. Reply CONFIRM ${poId}.`;
               if (supplier.phone) outboundTasks.push({ phone: supplier.phone, text: poMsg });
            }
          }
        }
        break;

      case 'RECV':
        if (parts.length >= 3) {
          const qty = parseInt(parts[1], 10);
          const skuId = parts[2].toUpperCase();
          const worker = sender || 'Unknown';
          
          // Update stock
          const [updatedStock] = await sql`UPDATE stock_levels SET quantity = quantity + ${qty}, last_updated = NOW() WHERE sku_id = ${skuId} RETURNING quantity`;
          const newTotal = updatedStock ? updatedStock.quantity : qty;
          
          // Create receiving log
          const logId = `RCV-${Date.now().toString().slice(-6)}`;
          await sql`INSERT INTO receiving_logs (id, worker, sku_id, quantity, sms_text) VALUES (${logId}, ${worker}, ${skuId}, ${qty}, ${message})`;
          
          replyText = `RECV confirmed. ${skuId} now at ${newTotal} units.`;
          
          // Loop 2: Reply to worker
          if (sender) outboundTasks.push({ phone: sender, text: replyText });
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

    // Process outbound tasks (AT SMS API)
    if (outboundTasks.length > 0) {
      const username = process.env.AT_USERNAME;
      const apiKey = process.env.AT_API_KEY;
      const senderId = process.env.AT_SENDER_ID;
      
      if (username && apiKey && username !== 'sandbox') {
        for (const task of outboundTasks) {
          try {
            const payload = new URLSearchParams({
              username,
              to: task.phone,
              message: task.text,
            });
            if (senderId && senderId.trim() !== '') {
              payload.append('from', senderId);
            }
  
            await axios.post(
              'https://api.africastalking.com/version1/messaging',
              payload.toString(),
              { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'apiKey': apiKey } }
            );
            console.log(`[AT SMS Sent] To: ${task.phone} | Msg: ${task.text}`);
            await sql`INSERT INTO sms_messages (sender, message, direction) VALUES (${task.phone}, ${task.text}, 'OUTBOUND')`;
          } catch (err) {
            console.error('Failed to send outbound SMS task', err);
          }
        }
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
