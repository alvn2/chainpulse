"use client";

import React, { useState } from 'react';
import { Truck, MapPin, Search, Calendar, ChevronRight } from 'lucide-react';

const mockShipments = [
  { id: 'SHP-782', batch: 'Naivasha Roses B.007', origin: 'Naivasha Farm', destination: 'JKIA Export Hub', driver: 'Kipchoge K.', temp: 9.4, status: 'BREACH', lastUpdate: '2023-11-01T10:00:00Z', progress: 45 },
  { id: 'SHP-785', batch: 'Muranga Avocado R.3', origin: 'Muranga DC', destination: 'Mombasa Port', driver: 'Mwangi J.', temp: 4.2, status: 'IN TRANSIT', lastUpdate: '2023-11-01T10:05:00Z', progress: 78 },
  { id: 'SHP-789', batch: 'Limuru Tea Box B.2', origin: 'Limuru HQ', destination: 'Westlands DC', driver: 'Njoroge P.', temp: 8.1, status: 'DELAYED', lastUpdate: '2023-11-01T09:45:00Z', progress: 20 },
  { id: 'SHP-791', batch: 'Eldoret Berries B.04', origin: 'Eldoret North', destination: 'JKIA Export Hub', driver: 'Ochieng D.', temp: 3.8, status: 'IN TRANSIT', lastUpdate: '2023-11-01T10:15:00Z', progress: 10 },
  { id: 'SHP-792', batch: 'Naivasha Carnations', origin: 'Naivasha Farm', destination: 'Mombasa Port', driver: 'Kamau R.', temp: 11.2, status: 'BREACH', lastUpdate: '2023-11-01T10:20:00Z', progress: 65 },
  { id: 'SHP-772', batch: 'Kitale Maize Exp', origin: 'Kitale Whouse', destination: 'Nakuru Hub', driver: 'Mutua S.', temp: 0, status: 'DELIVERED', lastUpdate: '2023-10-31T18:00:00Z', progress: 100 },
];

export default function ShipmentsPage() {
  const [filter, setFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState(mockShipments[0]);

  const filtered = filter === 'ALL' ? mockShipments : mockShipments.filter(s => s.status === filter);

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight border-l-4 border-blue-500 pl-3">Shipments & Routing</h1>
          <p className="text-zinc-500 text-sm mt-1 pl-4">End-to-end trace view of all consignments.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold flex items-center justify-center rounded text-sm transition font-mono tracking-widest">
            CREATE SHIPMENT
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex gap-4 items-center shrink-0">
        <div className="flex bg-[#111] p-1 border border-[#222] rounded text-sm">
          {['ALL', 'LOADING', 'IN TRANSIT', 'DELAYED', 'BREACH', 'DELIVERED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded transition font-mono text-[10px] tracking-widest ${filter === f ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 bg-[#111] border border-[#222] px-3 py-1.5 rounded text-sm text-zinc-400 cursor-pointer hover:bg-[#1a1a1a] transition-colors">
           <Calendar className="w-4 h-4" /> <span className="text-xs">This Week</span>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-[#222] px-3 py-1.5 rounded text-sm w-48 focus-within:border-[#3b82f6] transition-colors">
           <Search className="w-4 h-4 text-zinc-500" />
           <input type="text" placeholder="Search ID..." className="bg-transparent border-none outline-none w-full font-mono placeholder:font-sans text-xs" />
        </div>
      </div>

      {/* Main Content Layout (Master Detail) */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
         {/* List View */}
         <div className="w-1/2 lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            {filtered.length === 0 && <div className="text-zinc-500 text-sm p-4 text-center">No shipments match status &apos;{filter}&apos;.</div>}
            
            {filtered.map(s => {
              const isSelected = selectedShipment.id === s.id;
              return (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedShipment(s)}
                  className={`bg-[#111] border rounded-lg p-4 cursor-pointer transition group ${isSelected ? 'border-blue-500/50 bg-[#16161a]' : 'border-[#222] hover:border-[#444]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-mono text-blue-400 mb-1">#{s.id.replace('SHP-', '')}</div>
                      <div className="font-semibold text-zinc-200">{s.batch}</div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 relative mt-4">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-zinc-800 -z-10"></div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-[#0a0a0a] border border-zinc-700 flex items-center justify-center shrink-0 z-10"><div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div></div>
                       <div className="text-xs text-zinc-400 font-mono">{s.origin}</div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 rounded-full bg-blue-900/20 border border-blue-900/50 flex items-center justify-center shrink-0 z-10"><MapPin className="w-2.5 h-2.5 text-blue-400" /></div>
                       <div className="text-xs font-medium text-white font-mono">{s.destination}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#222] flex justify-between items-center text-xs">
                     <div className="text-zinc-500 font-mono tracking-tight">{s.driver}</div>
                     <div className="flex items-center gap-4">
                       <div className={`font-mono font-bold ${s.temp > 8 ? 'text-red-500 animate-pulse' : 'text-[#10b981]'}`}>{s.status === 'DELIVERED' ? '-' : `${s.temp.toFixed(1)}°C`}</div>
                       <div className="text-zinc-500 font-mono tracking-tight">{s.progress}%</div>
                     </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 w-full bg-black rounded mt-3 overflow-hidden">
                    <div className={`h-full ${s.status === 'DELIVERED' ? 'bg-[#10b981]' : s.status === 'BREACH' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${s.progress}%` }}></div>
                  </div>
                </div>
              );
            })}
         </div>

         {/* Detail Panel Placeholder */}
         <div className="hidden lg:flex flex-1 bg-[#111] border border-[#222] rounded-lg flex-col overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-[#0a0a0a] border border-[#333] px-3 py-1.5 rounded flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
              <span className="font-mono text-[10px] tracking-widest text-zinc-300">LIVE TELEMATICS</span>
            </div>
            
             <div className="flex-1 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] flex items-center justify-center pointer-events-none border-b border-[#222]">
                 <div className="text-center">
                    <MapPin className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400 font-mono uppercase tracking-widest text-sm">Interactive Map Engine Offline</p>
                 </div>
             </div>

             <div className="h-[250px] bg-[#161616] p-6 flex flex-col justify-between shrink-0">
               <div>
                  <h3 className="font-mono text-xl font-bold text-white mb-1">{selectedShipment?.id}</h3>
                  <p className="text-zinc-400 text-sm">{selectedShipment?.batch}</p>
               </div>
               
               <div className="grid grid-cols-4 gap-4 mt-6">
                 <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                   <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Current Speed</div>
                   <div className="font-mono text-lg text-zinc-300">{selectedShipment?.status === 'DELIVERED' ? '0' : '65'} <span className="text-xs">km/h</span></div>
                 </div>
                 <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                   <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Temperature</div>
                   <div className={`font-mono text-lg ${selectedShipment?.temp! > 8 ? 'text-red-500' : 'text-[#10b981]'}`}>{selectedShipment?.status === 'DELIVERED' ? '-' : selectedShipment?.temp.toFixed(1)} <span className="text-xs">°C</span></div>
                 </div>
                 <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 text-center">
                   <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Estimated Arrival</div>
                   <div className="font-mono text-lg text-zinc-300">14:00</div>
                 </div>
                 <div className="bg-[#0a0a0a] border border-[#222] rounded p-3 flex items-center justify-center bg-blue-950/20 hover:bg-blue-950/40 cursor-pointer border-blue-900/50 transition-colors">
                   <div className="text-xs font-mono text-blue-400 uppercase tracking-widest text-center">View Full<br/>SMS Logs</div>
                 </div>
               </div>
             </div>
         </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'IN TRANSIT': 'bg-blue-950 text-blue-400 border-blue-900',
    'DELIVERED': 'bg-green-950 text-green-400 border-green-900',
    'BREACH': 'bg-red-950 text-red-400 border-red-900 font-bold tracking-widest',
    'DELAYED': 'bg-amber-950 text-amber-400 border-amber-900',
    'LOADING': 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  const color = colors[status] || 'bg-zinc-950 text-zinc-400 border-zinc-900';
  
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono ${color}`}>
      {status}
    </span>
  );
}
