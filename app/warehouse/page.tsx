"use client";

import React, { useState, useEffect } from 'react';
import { Warehouse as WarehouseIcon, Snowflake, Map, ListChecks } from 'lucide-react';

type Zone = { id: string; name: string; temp: string; capacity: number; current: number; type: string; reading: number | null };
type ReceivingLog = { id: string; worker: string; sku_id: string; sku_name: string; quantity: number; sms_text: string; timestamp: string };

export default function WarehousePage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [logs, setLogs] = useState<ReceivingLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const res = await fetch('/api/warehouse');
      const data = await res.json();
      setZones(data.zones);
      setLogs(data.receivingLogs);
    } catch (err) {
      console.error('Failed to fetch warehouse data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-lg"></div>)}
        </div>
        <div className="skeleton h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center shrink-0 border-l-4 border-zinc-500 pl-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouse Floor</h1>
          <p className="text-zinc-500 text-sm mt-1">Zone capacities, environmental controls, and intake logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
         {zones.map(z => {
           const usage = (z.current / z.capacity) * 100;
           return (
             <div key={z.id} className="bg-[#111] border border-[#222] p-5 rounded-lg flex flex-col hover:border-[#444] transition-colors">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-white">{z.name}</h3>
                   <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{z.id}</div>
                 </div>
                 {z.type === 'cold' ? (
                   <div className="p-2 bg-blue-950/30 rounded border border-blue-900 text-blue-400">
                     <Snowflake className="w-5 h-5" />
                   </div>
                 ) : (
                   <div className="p-2 bg-zinc-900 rounded border border-zinc-700 text-zinc-500">
                     <WarehouseIcon className="w-5 h-5" />
                   </div>
                 )}
               </div>

               <div className="space-y-4 flex-1">
                 <div>
                   <div className="flex justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1.5">
                     <span>Capacity</span>
                     <span className={usage > 85 ? 'text-amber-500' : 'text-[#10b981]'}>{usage.toFixed(1)}%</span>
                   </div>
                   <div className="h-2 w-full bg-black border border-[#333] rounded overflow-hidden">
                     <div 
                       className={`h-full ${usage > 85 ? 'bg-amber-500' : 'bg-[#10b981]'}`} 
                       style={{ width: `${usage}%` }}
                     ></div>
                   </div>
                   <div className="text-zinc-400 text-xs font-mono tracking-tight mt-2 text-right">
                     {z.current.toLocaleString()} / {z.capacity.toLocaleString()} <span className="text-zinc-600">units</span>
                   </div>
                 </div>

                 <div className="border-t border-[#222] pt-4">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-mono">Climate Parameters</div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-mono text-zinc-400">{z.temp}</span>
                      {z.reading !== null ? (
                        <span className="text-xl font-bold font-mono text-blue-400 tracking-tighter">{z.reading.toFixed(1)}°</span>
                      ) : (
                        <span className="text-xl font-bold font-mono text-zinc-600 tracking-tighter">--</span>
                      )}
                    </div>
                 </div>
               </div>
             </div>
           );
         })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[400px]">
         <div className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-4 pb-3 border-b border-[#222]">
              <ListChecks className="w-4 h-4 text-emerald-500" /> Recent Goods Receiving (SMS Log)
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {logs.map((log) => (
                 <div key={log.id} className="flex gap-3 text-sm border border-[#222] p-3 rounded-lg bg-[#0d0d0d] hover:bg-[#161616] transition cursor-pointer">
                   <div className="w-1 bg-[#10b981] rounded-full shrink-0"></div>
                   <div className="flex-1 py-1">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-mono font-bold text-zinc-300">{log.id}</span>
                       <span className="text-[10px] text-zinc-500 font-mono tracking-widest bg-black px-1.5 py-0.5 rounded border border-[#333]">
                         {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                     <div className="text-zinc-400 text-xs">
                       Worker <span className="text-white">&apos;{log.worker}&apos;</span> received{' '}
                       <span className="font-mono text-emerald-400">{log.quantity}</span> units of{' '}
                       <span className="font-mono text-zinc-300">{log.sku_id}</span>
                     </div>
                     <div className="text-[10px] text-zinc-500 font-mono mt-2 pt-2 border-t border-[#222] flex items-center gap-2">
                       <span className="uppercase tracking-widest">Origin SMS:</span>
                       <span className="text-zinc-300">&quot;{log.sms_text}&quot;</span>
                     </div>
                   </div>
                 </div>
               ))}
               {logs.length === 0 && <div className="text-xs text-zinc-500 p-4 text-center">No receiving logs yet.</div>}
            </div>
         </div>
         <div className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-4 pb-3 border-b border-[#222]">
              <Map className="w-4 h-4 text-blue-500" /> Dispatch Bay Schedule
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] border border-dashed border-[#333] rounded-lg">
               <Map className="w-12 h-12 text-zinc-800 mb-4" />
               <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Interactive Floorplan • Coming Soon</span>
            </div>
         </div>
      </div>
    </div>
  );
}
