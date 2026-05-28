"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquareDot, Smartphone, Send, Terminal, Link as LinkIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type SmsMessage = { id: number; sender: string; message: string; direction: string; created_at: string };

export default function SMSGuidePage() {
  const [phone, setPhone] = useState('+254700000000');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [inbox, setInbox] = useState<SmsMessage[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);

  async function fetchInbox() {
    try {
      const res = await fetch('/api/sms');
      const data = await res.json();
      setInbox(data);
    } catch (err) {
      console.error('Failed to fetch SMS inbox', err);
    } finally {
      setInboxLoading(false);
    }
  }

  useEffect(() => {
    fetchInbox();
    const timer = setInterval(fetchInbox, 5000); // Poll every 5 seconds for new SMS
    return () => clearInterval(timer);
  }, []);

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
      setResponse(`Status: ${res.status}\nResponse: ${text || 'OK'}`);
      setMessage('');
      fetchInbox(); // instantly refresh
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-[#10b981] selection:text-white overflow-y-auto custom-scrollbar flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-8 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <MessageSquareDot className="w-8 h-8 text-[#10b981]" />
              <h1 className="text-3xl font-bold tracking-tight">Live SMS Inbox & Simulator</h1>
            </div>
            <p className="text-gray-400">View live messages from Africa&apos;s Talking and simulate texts from the field.</p>
          </div>
          <Link href="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          
          {/* SMS Inbox (Left Col) */}
          <section className="bg-[#111111] border border-[#222222] rounded-xl flex flex-col shadow-xl overflow-hidden min-h-[500px]">
             <div className="p-4 border-b border-[#222] bg-[#161616] flex justify-between items-center shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center">
                  <Smartphone className="w-4 h-4 mr-2 text-emerald-500" /> Live Feed
                </h2>
                <div className="flex items-center gap-3">
                  <button onClick={fetchInbox} className="text-zinc-500 hover:text-white transition-colors">
                     <RefreshCw className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono text-zinc-600 bg-black px-2 py-0.5 rounded">{inbox.length} msgs</span>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] bg-black/20">
                {inboxLoading ? (
                  <div className="text-zinc-500 text-sm text-center">Loading messages...</div>
                ) : inbox.length === 0 ? (
                  <div className="text-zinc-500 text-sm text-center h-full flex items-center justify-center">No messages yet. Send a simulated SMS to see it here!</div>
                ) : (
                  inbox.map(msg => {
                    const isInbound = msg.direction === 'INBOUND';
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[85%] ${isInbound ? 'self-start' : 'self-end items-end ml-auto'}`}>
                        <div className="text-[10px] text-zinc-500 font-mono mb-1 flex items-center gap-2">
                          <span>{msg.sender}</span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${
                          isInbound 
                            ? 'bg-[#1a1a1a] border border-[#333] text-zinc-300 rounded-tl-none' 
                            : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-100 rounded-tr-none'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </section>

          {/* Simulator & Ngrok Section (Right Col) */}
          <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 h-full">
            
            {/* Live Simulator */}
            <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-xl shrink-0">
               <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Terminal className="w-5 h-5 mr-3 text-emerald-500" />
                  Simulator
               </h2>
               <p className="text-sm text-gray-400 mb-6">Test commands directly. These will appear in the inbox and update the database.</p>
               
               <form onSubmit={handleSimulate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Quick Fill</label>
                      <select 
                        onChange={e => setMessage(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981] font-mono text-zinc-400"
                        defaultValue=""
                      >
                        <option value="" disabled>Select example...</option>
                        <option value="TEMP 4.5 SHP-101">TEMP 4.5 SHP-101</option>
                        <option value="TEMP 12 SHP-101">TEMP 12 SHP-101 (Breach)</option>
                        <option value="RECV 50 SKU-RS-NV">RECV 50 SKU-RS-NV</option>
                        <option value="STATUS DELIVER SHP-101">STATUS DELIVER SHP-101</option>
                      </select>
                    </div>
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
            </section>

            {/* Commands Reference */}
            <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-xl shrink-0">
               <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-[#222]">
                  Command Reference
               </h2>
               <div className="space-y-3">
                 <CommandCard cmd="TEMP [val] [shpId]" desc="Log temp. (>8° triggers breach alert)" />
                 <CommandCard cmd="STOCK [qty] [skuId]" desc="Set absolute stock quantity." />
                 <CommandCard cmd="RECV [qty] [skuId]" desc="Add inbound inventory to stock." />
                 <CommandCard cmd="STATUS DELIVER [shpId]" desc="Mark shipment delivered." />
               </div>
            </section>
            
            {/* Ngrok Instructions */}
            <section className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-6 shadow-xl shrink-0">
               <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-2 flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Live Phone Testing
               </h2>
               <p className="text-xs text-gray-300 mb-3">
                 To test with a real phone via AT sandbox during the hackathon, run <code className="bg-black px-1 text-emerald-400">ngrok http 3000</code> and set your AT Webhook URL to <code className="bg-black px-1 text-blue-300">https://xyz.ngrok.../api/at/inbound</code>.
               </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function CommandCard({ cmd, desc }: { cmd: string, desc: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="font-mono text-[#10b981] bg-[#0a0a0a] px-2 py-1 rounded border border-[#333] whitespace-nowrap mr-3">{cmd}</span>
      <span className="text-zinc-400 text-right">{desc}</span>
    </div>
  );
}
