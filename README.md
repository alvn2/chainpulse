# ChainPulse

Modern Supply Chain Visibility Engine. Real-time cold chain monitoring, SMS-driven inventory management, and automated purchase orders. Built for high-velocity African supply chains.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS 4, Recharts
- **Database**: Neon (Serverless PostgreSQL)
- **Integration**: Africa's Talking (SMS / USSD)
- **Icons**: Lucide React

## Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup (Neon PostgreSQL)**
   - The `.env` file should contain your `DATABASE_URL` pointing to your Neon database.
   - Run the database schema to create tables:
     ```bash
     psql $DATABASE_URL < schema.sql
     ```
   - (Optional) Seed the database with sample data:
     ```bash
     psql $DATABASE_URL < seed.sql
     ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or `3001`) in your browser.

## Africa's Talking Webhook & SMS Testing

Africa's Talking servers cannot send data to your local `localhost` server. To test SMS functionality during the hackathon:

1. **Expose Localhost via Ngrok**
   ```bash
   ngrok http 3000
   ```
   *Note: If your dev server is running on a different port, change `3000` to that port.*

2. **Update AT Dashboard**
   - Copy the generated Forwarding URL (e.g., `https://xyz.ngrok-free.app`).
   - Go to your Africa's Talking Dashboard -> SMS -> SMS Callback URLs.
   - Set the Inbound URL to: `https://xyz.ngrok-free.app/api/at/inbound`

3. **Simulate Without a Phone**
   - ChainPulse includes a built-in SMS Simulator for testing.
   - Navigate to **SMS Guide** from the dashboard navigation to simulate inbound texts directly into your database.

## Built for Hackathon
- **Auth**: The Login and Signup pages are simulated for seamless demonstrations.
- **Real Data**: All dashboards fetch real aggregated data from the Neon database.
- **SMS Sandbox**: Use the provided `+254700000000` test number in AT sandbox to see real SMS functionality.
