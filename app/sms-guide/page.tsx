"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquareDot, Smartphone, Terminal, RefreshCw, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

type SmsMessage = { id: number; sender: string; message: string; direction: string; created_at: string };

export default function CommunicationsHub() {
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
    const timer = setInterval(fetchInbox, 5000); // Poll every 5 seconds for live presentation
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-[#10b981] selection:text-white overflow-y-auto custom-scrollbar flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-8 flex items-center justify-between shrink-0 border-b border-[#222] pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <MessageSquareDot className="w-8 h-8 text-[#10b981]" />
              <h1 className="text-3xl font-bold tracking-tight">Communications Hub</h1>
            </div>
            <p className="text-gray-400">Live Africa's Talking SMS Feed — Bridging offline drivers with the central database.</p>
          </div>
          <Link href="/dashboard" className="flex items-center px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
          
          {/* SMS Inbox (Left Col - Wider) */}
          <section className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-xl flex flex-col shadow-2xl overflow-hidden min-h-[600px]">
             <div className="p-4 border-b border-[#222] bg-[#161616] flex justify-between items-center shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center">
                  <Smartphone className="w-4 h-4 mr-2 text-emerald-500" /> Live Feed
                </h2>
                <div className="flex items-center gap-3">
                  <span className="flex items-center text-[10px] text-emerald-500 font-mono tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                     SYNCING
                  </span>
                  <button onClick={fetchInbox} className="text-zinc-500 hover:text-white transition-colors ml-2">
                     <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] bg-black/20">
                {inboxLoading ? (
                  <div className="text-zinc-500 text-sm text-center font-mono">Connecting to Africa's Talking...</div>
                ) : inbox.length === 0 ? (
                  <div className="text-zinc-500 text-sm text-center h-full flex flex-col items-center justify-center gap-3">
                     <MessageSquareDot className="w-12 h-12 text-zinc-800" />
                     <p>Awaiting incoming communications.</p>
                  </div>
                ) : (
                  inbox.map(msg => {
                    const isInbound = msg.direction === 'INBOUND';
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[80%] ${isInbound ? 'self-start' : 'self-end items-end ml-auto'}`}>
                        <div className="text-[10px] text-zinc-500 font-mono mb-1.5 flex items-center gap-2 px-1">
                          <span className="font-bold text-zinc-400">{msg.sender}</span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className={`p-4 text-sm leading-relaxed shadow-lg ${
                          isInbound 
                            ? 'bg-[#1a1a1a] border border-[#333] text-zinc-200 rounded-2xl rounded-tl-sm' 
                            : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-100 rounded-2xl rounded-tr-sm'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </section>

          {/* Reference & Config (Right Col) */}
          <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 h-full">
            
            {/* Commands Reference */}
            <section className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-xl shrink-0">
               <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-[#222] flex items-center">
                  <Terminal className="w-4 h-4 mr-2" /> Protocol Commands
               </h2>
               <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
                 Drivers in zero-internet zones can text these shortcodes to instantly update the live database.
               </p>
               <div className="space-y-4">
                 <CommandCard cmd="TEMP [val] [shpId]" desc="Log temperature. Values >8°C trigger automated outbound alerts." />
                 <CommandCard cmd="STATUS DELIVER [shpId]" desc="Mark a shipment as 100% delivered." />
                 <CommandCard cmd="RECV [qty] [skuId]" desc="Warehouse workers log inbound inventory." />
                 <CommandCard cmd="STOCK [qty] [skuId]" desc="Overwrite exact stock quantity." />
               </div>
            </section>
            
            {/* Live Webhook Configuration */}
            <section className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-6 shadow-xl shrink-0">
               <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center pb-2 border-b border-blue-900/30">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Live Integration
               </h2>
               <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                 The system is currently deployed and listening for Africa's Talking payloads at:
               </p>
               <div className="bg-black border border-blue-900/50 p-3 rounded text-[10px] font-mono text-blue-300 break-all mb-4 selection:bg-blue-500 selection:text-white">
                 https://chainpulse-brown.vercel.app/api/at/inbound
               </div>
               <div className="text-[11px] text-zinc-400 space-y-2">
                 <p>• Ensure this URL is pasted into the <strong>SMS Callback URL</strong> section of your Africa's Talking Dashboard.</p>
                 <p>• For sandbox testing, use the <strong className="text-emerald-400">Africa's Talking Android App</strong> to send texts, as standard iOS/Android carrier networks cannot reach the sandbox.</p>
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function CommandCard({ cmd, desc }: { cmd: string, desc: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 bg-[#0a0a0a] border border-[#222] rounded-lg">
      <span className="font-mono text-[11px] text-[#10b981] font-bold tracking-wide">{cmd}</span>
      <span className="text-zinc-400 text-xs">{desc}</span>
    </div>
  );
}
