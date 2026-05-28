# ChainPulse

**ChainPulse** is an enterprise-grade Supply Chain Management System designed specifically for cold-chain logistics, warehouse inventory control, and real-time fleet telematics. Built to operate in low-bandwidth environments, ChainPulse natively integrates with **Africa's Talking SMS API** to allow warehouse workers, suppliers, and drivers to interact with the central database using standard feature phones.

---

## 🏗️ Architecture & Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes, Vercel Edge Functions
- **Database:** Neon Serverless PostgreSQL
- **Real-Time Engine:** Custom Node.js + Express + Socket.IO Server
- **SMS Gateway:** Africa's Talking API (Inbound/Outbound)

---

## 🔄 The 4 Core Operational Loops

ChainPulse is built around 4 fully automated operational loops:

### Loop 1: Procurement (Outbound SMS)
When an Operations Manager creates a Purchase Order (PO) on the HQ Dashboard, the backend automatically fires an SMS to the supplier:
> `PO-2950: 200 pcs requested. Reply CONFIRM PO-2950 to accept.`

### Loop 2: Warehouse Receiving (Inbound SMS)
A warehouse worker unloads a truck and texts the Africa's Talking shortcode or sandbox number:
> `RECV 200 SKU-018`
The webhook instantly updates the global inventory stock levels, creates an audit log, and replies to the worker with a confirmation text.

### Loop 3: Auto-Replenishment (Inbound & Outbound)
If a warehouse worker texts a stock update (`STOCK 12 SKU-042`) and the quantity falls below the predefined `reorder_threshold`, ChainPulse automatically:
1. Triggers a system alert on the dashboard.
2. Generates a new Purchase Order in the database.
3. Fires an Outbound SMS to the supplier requesting the reorder.

### Loop 4: Dispatch & Live Telematics (WebSockets & SMS)
When a shipment is created, an SMS is sent to the assigned driver with instructions. 
> `SHP-123: Deliver Naivasha Roses to JKIA. Text TEMP [value] SHP-123 at each stop.`
Additionally, the driver opens the **Driver Terminal App** on their smartphone browser, which uses the `navigator.geolocation` API to stream their physical coordinates to the HQ Dashboard in real-time via Socket.IO.

---

## 📱 User Guide: SMS Command Reference

For field workers without access to smartphones, the following SMS commands can be texted directly to the Africa's Talking number:

| Command | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| **RECV** | `RECV [qty] [sku]` | Receive goods into warehouse inventory. | `RECV 50 SKU-001` |
| **STOCK** | `STOCK [qty] [sku]` | Manually override current stock levels. | `STOCK 12 SKU-001` |
| **TEMP** | `TEMP [value] [shipment_id]` | Log temperature for a cold-chain shipment. | `TEMP 4.5 SHP-123` |
| **STATUS** | `STATUS [status] [shipment_id]` | Update shipment status (e.g., DELIVER). | `STATUS DELIVER SHP-123` |

*(Note: Temperatures logged above 8°C will automatically trigger a CRITICAL BREACH alert on the HQ dashboard).*

---

## 🖥️ Local Development Setup

To run ChainPulse locally, you must run both the Next.js server and the Socket.IO server concurrently.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Ensure you have a `.env` file in the root directory with your Neon DB and Africa's Talking credentials:
```env
DATABASE_URL=postgres://...
AT_USERNAME=sandbox
AT_API_KEY=your_api_key
AT_SENDER_ID=
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Start the Application
Open **two** terminal windows.

**Terminal 1 (Next.js Dashboard):**
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000`

**Terminal 2 (Socket.IO Telematics Engine):**
```bash
npm run socket
```
The socket server will run on port `3001` to handle live GPS streams.

---

## 📡 Webhook Configuration (Africa's Talking)

To enable 2-way SMS:
1. Expose your local server using Ngrok: `ngrok http 3000`
2. Go to the Africa's Talking Dashboard -> SMS -> **SMS Callback URLs**
3. Set the Inbound Messages callback URL to:
   `https://<your-ngrok-url>.ngrok-free.app/api/at/inbound`

If deployed to Vercel, replace the ngrok URL with your production Vercel domain.
