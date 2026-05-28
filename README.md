# ChainPulse - Supply Chain Visibility System

A Next.js 14 specialized dashboard tracking cold chain conditions and inventory management leveraging the Africa's Talking SMS API. Built for scale.

## Overview
This platform acts as an operation center.
- **Top Dashboard:** Presents status matrices and active logistics metrics in real-time.
- **SMS Integration:** Warehouse & delivery staff can update core system records purely via SMS bridging to the backend through Africa's Talking.
- **Supabase Backbone:** Employs Supabase for robust persistent datastore constructs.

## Core Setup Instructions

1. **Install Dependencies**
   Run the package setup:
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the provided `.env.example` to `.env` and fill the variables.
   - `AT_API_KEY`: Africa's Talking API key.
   - `AT_USERNAME`: Your Africa's talking username (or 'sandbox').
   - `AT_SENDER_ID`: Registered alphnumeric Sender ID (if used).
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY`: Credentials for DB integration.

3. **Setup Database**
   Log into your Supabase Dashboard, use `schema.sql` to generate the system tables and `seed.sql` to populate test metrics.

4. **Boot Development Server**
   ```bash
   npm run dev
   ```

## API Documentation

- `POST /api/at/inbound`: Receives inbound webhook calls from Africa's Talking and processes logic based on simple custom shortcodes (e.g., `TEMP`, `STOCK`).
- `GET /api/shipments`: Yields active transportation entities for rendering.
- `GET /api/alerts`: Exposes breach notifications or delayed shipping incidents.
- `GET /api/inventory`: Surfaces SKU allocations array and reorder requirements. 

Refer to `/sms-guide` path internally for specific driver operational codes.
