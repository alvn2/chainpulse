import React from 'react';
import { ArrowLeft, MessageSquareDot, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function SMSGuidePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-[#10b981] selection:text-white">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Smartphone className="w-8 h-8 text-[#10b981]" />
              <h1 className="text-3xl font-bold tracking-tight">SMS Commands Reference</h1>
            </div>
            <p className="text-gray-400">Warehouse & Driver AT SMS Integration Guide</p>
          </div>
          <Link href="/" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ops
          </Link>
        </header>

        <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 md:p-8 mb-8 shadow-xl">
          <div className="mb-6 pb-6 border-b border-[#222222]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageSquareDot className="w-5 h-5 mr-3 text-blue-400" />
              How it works
            </h2>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Workers in the field (drivers, warehouse operators) text these shortcodes to our Africa&apos;s Talking (AT) phone number. 
              The system processes the text, logs data into Supabase, and optionally triggers reverse alerts for anomalies (e.g., temperature breach).
            </p>
            <div className="inline-block bg-black border border-[#333333] px-4 py-2 rounded text-sm text-gray-300 font-mono">
              Gateway Number: <span className="text-[#10b981]">+254700000000</span> (Mock)
            </div>
          </div>

          <div className="space-y-6">
            <CommandCard 
              cmd="TEMP [value] [batchId]" 
              desc="Log a temperature reading for a specific cold chain batch."
              example="TEMP 4.5 NR-007"
              outcome="Logs reading. If > 8°C, alerts Ops immediately."
            />
            
            <CommandCard 
              cmd="STOCK [qty] [skuId]" 
              desc="Set the absolute stock level for a warehouse SKU."
              example="STOCK 450 SKU-RS-NV"
              outcome="Overwrites current stock with 450 for the given SKU."
            />

            <CommandCard 
              cmd="RECV [qty] [skuId]" 
              desc="Add received inventory (inbound) to existing stock."
              example="RECV 50 SKU-AV-MR"
              outcome="Increases current stock by 50."
            />

            <CommandCard 
              cmd="STATUS DELIVER [shipmentId]" 
              desc="Update the delivery status of an active shipment."
              example="STATUS DELIVER SHP-1001"
              outcome="Marks shipment SHP-1001 as DELIVERED."
            />
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500">
          Powered by Next.js & Africa&apos;s Talking API.
        </footer>
      </div>
    </div>
  );
}

function CommandCard({ cmd, desc, example, outcome }: { cmd: string, desc: string, example: string, outcome: string }) {
  return (
    <div className="p-4 rounded-lg bg-black/50 border border-[#222] hover:border-[#333] transition-colors">
      <h3 className="text-lg font-mono text-[#10b981] mb-2">{cmd}</h3>
      <p className="text-sm text-gray-300 mb-4">{desc}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-[#111111] rounded border border-[#2a2a2a]">
          <span className="text-gray-500 uppercase font-semibold tracking-wider text-[10px] block mb-1">Example Text</span>
          <span className="font-mono text-gray-200">{example}</span>
        </div>
        <div className="p-3 bg-[#111111] rounded border border-[#2a2a2a]">
          <span className="text-gray-500 uppercase font-semibold tracking-wider text-[10px] block mb-1">System Action</span>
          <span className="text-gray-400">{outcome}</span>
        </div>
      </div>
    </div>
  );
}
