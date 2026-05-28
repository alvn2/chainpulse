"use client";

import React, { useState } from 'react';
import { ArrowLeft, MessageSquareDot, Smartphone, Send, Terminal, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function SMSGuidePage() {
  const [phone, setPhone] = useState('+254700000000');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSimulate(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const payload = new URLSearchParams();
      payload.append('from', phone);
      payload.append('text', message);
      
      const res = await fetch('/api/at/inbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      });
      
      const text = await res.text();
      setResponse(`Status: ${res.status}\nResponse: ${text || 'OK (No content returned, check DB/Alerts)'}`);
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-[#10b981] selection:text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Smartphone className="w-8 h-8 text-[#10b981]" />
              <h1 className="text-3xl font-bold tracking-tight">SMS Operations Guide</h1>
            </div>
            <p className="text-gray-400">Warehouse & Driver AT SMS Integration Guide</p>
          </div>
          <Link href="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Guide Section */}
          <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-xl flex flex-col h-full">
            <div className="mb-6 pb-6 border-b border-[#222222]">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageSquareDot className="w-5 h-5 mr-3 text-blue-400" />
                How it works
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Field workers (drivers, warehouse operators) text these shortcodes to our Africa&apos;s Talking (AT) phone number. 
                The system processes the text, logs data into Neon PostgreSQL, and triggers realtime alerts.
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <CommandCard 
                cmd="TEMP [value] [batchId]" 
                desc="Log a temperature reading for a specific shipment."
                example="TEMP 4.5 SHP-101"
              />
              <CommandCard 
                cmd="STOCK [qty] [skuId]" 
                desc="Set absolute stock level for a SKU."
                example="STOCK 450 SKU-RS-NV"
              />
              <CommandCard 
                cmd="RECV [qty] [skuId]" 
                desc="Add received inbound inventory to stock."
                example="RECV 50 SKU-RS-NV"
              />
              <CommandCard 
                cmd="STATUS DELIVER [shipmentId]" 
                desc="Update shipment delivery status."
                example="STATUS DELIVER SHP-101"
              />
            </div>
          </section>

          {/* Simulator & Ngrok Section */}
          <div className="flex flex-col gap-8 h-full">
            {/* Live Simulator */}
            <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-xl">
               <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Terminal className="w-5 h-5 mr-3 text-emerald-500" />
                  Live Simulator
               </h2>
               <p className="text-sm text-gray-400 mb-6">Test the webhook directly without a phone. This will update the real database.</p>
               
               <form onSubmit={handleSimulate} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Sender Phone</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">SMS Message</label>
                    <input 
                      type="text" 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="e.g. TEMP 12 SHP-101"
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981] font-mono uppercase"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !message}
                    className="w-full py-2 bg-[#10b981] text-black font-bold rounded text-sm hover:bg-emerald-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Simulated SMS'}
                  </button>
               </form>
               
               {response && (
                 <div className="mt-4 p-3 bg-black border border-[#333] rounded-lg">
                   <div className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Response</div>
                   <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{response}</pre>
                 </div>
               )}
            </section>

            {/* Ngrok Instructions */}
            <section className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-6 shadow-xl flex-1">
               <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-400">
                  <LinkIcon className="w-5 h-5 mr-3" />
                  Connecting Africa&apos;s Talking
               </h2>
               <p className="text-sm text-gray-300 mb-4">
                 For AT to reach your local environment during the hackathon, you must expose your localhost using <code className="bg-black px-1 rounded text-emerald-400">ngrok</code>.
               </p>
               <ol className="list-decimal pl-4 text-sm text-gray-400 space-y-2 mb-4">
                 <li>Run <code className="bg-black px-1 rounded text-white">ngrok http 3000</code> (or 3001) in your terminal.</li>
                 <li>Copy the generated Forwarding URL (e.g., <code className="text-blue-300">https://xyz.ngrok-free.app</code>).</li>
                 <li>Go to the Africa&apos;s Talking Dashboard -> SMS -> SMS Callback URLs.</li>
                 <li>Set the Inbound URL to: <code className="bg-black p-1 rounded block mt-1 text-white text-xs break-all">https://xyz.ngrok-free.app/api/at/inbound</code></li>
               </ol>
            </section>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-500 pb-8">
          Powered by Next.js, Neon DB & Africa&apos;s Talking.
        </footer>
      </div>
    </div>
  );
}

function CommandCard({ cmd, desc, example }: { cmd: string, desc: string, example: string }) {
  return (
    <div className="p-4 rounded-lg bg-black/50 border border-[#222] hover:border-[#333] transition-colors">
      <h3 className="text-lg font-mono text-[#10b981] mb-2">{cmd}</h3>
      <p className="text-sm text-gray-300 mb-3">{desc}</p>
      <div className="p-3 bg-[#111111] rounded border border-[#2a2a2a]">
        <span className="text-gray-500 uppercase font-semibold tracking-wider text-[10px] block mb-1">Example Text</span>
        <span className="font-mono text-gray-200">{example}</span>
      </div>
    </div>
  );
}
