"use client";

import React, { useState, useEffect } from 'react';
import { Send, Smartphone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type SmsMessage = { id: number; sender: string; message: string; direction: string; created_at: string };

export default function MessageCenter() {
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<SmsMessage[]>([]);

  async function fetchHistory() {
    try {
      const res = await fetch('/api/sms');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch SMS history', err);
    }
  }

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(fetchHistory, 5000);
    return () => clearInterval(timer);
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !text) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/sms/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, text })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('SMS Sent Successfully!');
        setText('');
        fetchHistory();
      } else {
        toast.error(`Failed to send: ${data.error}`);
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  // Pre-fill templates
  const templates = [
    { label: 'Confirm Order', val: 'Please reply CONFIRM to accept the latest Purchase Order.' },
    { label: 'Location Request', val: 'Please reply with your current location and ETA for the active shipment.' },
    { label: 'Dispatch Alert', val: 'Your shipment has been dispatched and is currently in transit.' },
  ];

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center shrink-0 border-l-4 border-emerald-500 pl-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Message Center</h1>
          <p className="text-zinc-500 text-sm mt-1">Direct SMS communication with drivers, suppliers, and staff.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        
        {/* Send SMS Form */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 shadow-2xl flex flex-col">
           <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2 border-b border-[#222] pb-3">
              <Send className="w-4 h-4 text-emerald-500" /> New Message
           </h2>
           
           <form onSubmit={handleSend} className="flex-1 flex flex-col">
             <div className="space-y-6 flex-1">
               <div>
                 <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Recipient Phone Number</label>
                 <div className="relative">
                   <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                   <input 
                     type="text" 
                     placeholder="+2547XXXXXXXX" 
                     required
                     value={phone}
                     onChange={e => setPhone(e.target.value)}
                     className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500 font-mono text-white transition-colors"
                   />
                 </div>
                 <p className="text-[10px] text-zinc-600 mt-1.5 font-mono">Include country code (e.g., +254 for Kenya).</p>
               </div>

               <div>
                 <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">Message Content</label>
                 <textarea 
                   rows={6}
                   required
                   value={text}
                   onChange={e => setText(e.target.value)}
                   placeholder="Type your message here..."
                   className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-4 text-sm outline-none focus:border-emerald-500 resize-none text-white transition-colors font-sans"
                 />
                 
                 <div className="mt-3 flex flex-wrap gap-2">
                   <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest pt-1 mr-1">Templates:</span>
                   {templates.map(t => (
                     <button 
                       key={t.label} 
                       type="button" 
                       onClick={() => setText(t.val)}
                       className="text-[10px] bg-[#1a1a1a] border border-[#333] hover:border-emerald-500 hover:text-emerald-400 text-zinc-400 px-2 py-1 rounded transition-colors"
                     >
                       {t.label}
                     </button>
                   ))}
                 </div>
               </div>
             </div>

             <button 
               type="submit" 
               disabled={sending || !phone || !text}
               className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]"
             >
               {sending ? (
                 <span className="animate-pulse">SENDING VIA AFRICA'S TALKING...</span>
               ) : (
                 <>SEND SECURE SMS <Send className="w-4 h-4" /></>
               )}
             </button>
           </form>
        </div>

        {/* SMS History Log */}
        <div className="bg-[#111] border border-[#222] rounded-xl flex flex-col shadow-2xl overflow-hidden">
           <div className="p-6 border-b border-[#222] bg-[#161616] flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Communications Log
              </h2>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#0a0a0a]">
              {history.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm font-mono">No communication history.</div>
              ) : (
                history.map(msg => {
                  const isOutbound = msg.direction === 'OUTBOUND';
                  return (
                    <div key={msg.id} className="flex gap-4 p-4 rounded-lg border border-[#222] bg-[#111] hover:border-[#333] transition-colors">
                       <div className="shrink-0 mt-1">
                         {isOutbound ? (
                           <div className="w-8 h-8 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-900">
                             <Send className="w-3.5 h-3.5 text-emerald-500" />
                           </div>
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-blue-950/50 flex items-center justify-center border border-blue-900">
                             <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                           </div>
                         )}
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                           <div className="font-mono text-xs font-bold text-zinc-300">
                             {isOutbound ? `To: ${msg.sender}` : `From: ${msg.sender}`}
                           </div>
                           <div className="text-[10px] text-zinc-600 font-mono">
                             {new Date(msg.created_at).toLocaleString()}
                           </div>
                         </div>
                         <p className="text-sm text-zinc-400 leading-relaxed">{msg.message}</p>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
