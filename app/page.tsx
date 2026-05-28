'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Shipment = { id: string; batch: string; origin: string; destination: string; driver: string; temp: number; status: string; lastUpdate: string };
type Alert = { id: string; type: string; message: string; severity: 'red' | 'amber' | 'emerald' | 'blue' | 'green'; timestamp: string };
type DashboardStats = { totalSkus: number, activeShipments: number, coldBreachesToday: number, lowStockItems: number, pendingPOs: number };

const mockShipments: Shipment[] = [
  { id: 'SHP-782', batch: 'Naivasha Roses B.007', origin: 'Naivasha Farm', destination: 'JKIA Export Hub', driver: 'Kipchoge K.', temp: 9.4, status: 'BREACH', lastUpdate: new Date().toISOString() },
  { id: 'SHP-785', batch: 'Muranga Avocado R.3', origin: 'Muranga DC', destination: 'Mombasa Port', driver: 'Mwangi J.', temp: 4.2, status: 'IN TRANSIT', lastUpdate: new Date().toISOString() },
  { id: 'SHP-789', batch: 'Limuru Tea Box B.2', origin: 'Limuru HQ', destination: 'Westlands DC', driver: 'Njoroge P.', temp: 8.1, status: 'DELAYED', lastUpdate: new Date().toISOString() },
  { id: 'SHP-791', batch: 'Eldoret Berries B.04', origin: 'Eldoret North', destination: 'JKIA Export Hub', driver: 'Ochieng D.', temp: 3.8, status: 'IN TRANSIT', lastUpdate: new Date().toISOString() },
  { id: 'SHP-792', batch: 'Naivasha Carnations', origin: 'Naivasha Farm', destination: 'Mombasa Port', driver: 'Kamau R.', temp: 11.2, status: 'BREACH', lastUpdate: new Date().toISOString() },
];

const mockAlerts: Alert[] = [
  { id: '1', type: 'TEMP BREACH', message: 'SHP-782 temp rose to 9.4°C.', severity: 'red', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: '2', type: 'LOW STOCK', message: 'Naivasha Red Roses below threshold.', severity: 'amber', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: '3', type: 'DELAYED', message: 'Traffic issues reported for Limuru.', severity: 'amber', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
];

const stats: DashboardStats = {
  totalSkus: 142,
  activeShipments: 14,
  coldBreachesToday: 2,
  lowStockItems: 5,
  pendingPOs: 3
};

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto h-full pr-2 custom-scrollbar">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 shrink-0">
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Total SKUs</div>
          <div className="text-2xl font-bold font-mono text-zinc-200">{stats.totalSkus}</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Active Shipments</div>
          <div className="text-2xl font-bold font-mono text-[#10b981]">{stats.activeShipments}</div>
          <div className="text-[10px] text-zinc-600 mt-2">Live tracking active</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Cold Breaches</div>
          <div className="text-2xl font-bold font-mono text-[#ef4444]">
             {stats.coldBreachesToday < 10 ? `0${stats.coldBreachesToday}` : stats.coldBreachesToday}
          </div>
          {stats.coldBreachesToday > 0 && <div className="text-[10px] text-[#ef4444] mt-2 font-semibold uppercase tracking-tighter">Action Required</div>}
        </div>
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Low Stock Items</div>
          <div className="text-2xl font-bold font-mono text-amber-500">{stats.lowStockItems}</div>
          <div className="text-[10px] text-zinc-600 mt-2 hover:text-white cursor-pointer transition-colors underline">View Inventory</div>
        </div>
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-lg">
          <div className="text-xs font-medium text-zinc-500 uppercase mb-1">Pending Reorders</div>
          <div className="text-2xl font-bold font-mono text-amber-500">{stats.pendingPOs}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[400px]">
        {/* Left Col - Shipments */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1 bg-[#111111] border border-[#222222] rounded-lg flex flex-col overflow-hidden min-h-[250px]">
             <div className="p-3 border-b border-[#222222] flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Live Shipment Feed</h2>
              <span className="text-[10px] font-mono text-zinc-600">Showing {mockShipments.length} active</span>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-[#0a0a0a] text-zinc-500 sticky top-0 z-10 shadow-[0_1px_0_#222] text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-3 font-normal whitespace-nowrap">ID</th>
                    <th className="p-3 font-normal">Batch/Origin</th>
                    <th className="p-3 font-normal">Destination</th>
                    <th className="p-3 font-normal text-center">Temp (°C)</th>
                    <th className="p-3 font-normal text-center">Status</th>
                    <th className="p-3 font-normal text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {mockShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                      <td className="p-3 text-blue-400 whitespace-nowrap font-bold">#{s.id.replace('SHP-', '')}</td>
                      <td className="p-3">
                        <span className="text-white font-sans">{s.batch}</span> <br/>
                        <span className="text-[10px] text-zinc-500">{s.origin}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-zinc-300">{s.destination}</td>
                      <td className={`p-3 text-center ${s.temp > 8 ? 'text-red-500 font-bold animate-pulse' : 'text-[#10b981]'}`}>
                        {s.temp.toFixed(1)}°
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="p-3 text-right text-zinc-500 whitespace-nowrap">
                        {new Date(s.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                  {mockShipments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">No active shipments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="h-[200px] shrink-0 bg-[#111111] border border-[#222222] rounded-lg relative overflow-hidden flex flex-col">
            <div className="absolute top-3 left-3 z-10 bg-black/80 p-2 rounded border border-[#222222] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400">TELEMATICS ENGINE</span>
            </div>
            {/* Map Visuals */}
            <div className="flex-1 w-full h-full opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
               <div className="absolute w-full h-px bg-zinc-800 top-1/2"></div>
               <div className="absolute h-full w-px bg-zinc-800 left-1/3"></div>
               <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                  <svg className="w-6 h-6 text-[#10b981] mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Alerts */}
        <div className="flex bg-[#111111] border border-[#222222] rounded-lg flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-[#222222] bg-[#161616] flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">System Alerts</h3>
            <span className="text-[10px] bg-red-600 font-bold font-mono tracking-widest text-white px-2 py-0.5 rounded">{mockAlerts.length} RECENT</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {mockAlerts.map((a) => {
              const styles: any = {
                red: { bg: 'bg-red-950/20 border-red-900/50', bar: 'bg-red-600', text: 'text-red-500' },
                amber: { bg: 'bg-amber-950/20 border-amber-900/50', bar: 'bg-amber-600', text: 'text-amber-500' },
                emerald: { bg: 'bg-green-950/20 border-green-900/50', bar: 'bg-green-600', text: 'text-green-500' },
                green: { bg: 'bg-green-950/20 border-green-900/50', bar: 'bg-green-600', text: 'text-green-500' },
                blue: { bg: 'bg-zinc-800/20 border-zinc-700', bar: 'bg-blue-600', text: 'text-blue-500' }
              };
              const s = styles[a.severity] || styles.blue;
              
              return (
                <div key={a.id} className={`p-3 ${s.bg} border rounded flex gap-3 hover:bg-opacity-50 transition-colors`}>
                  <div className={`w-1 flex-shrink-0 ${s.bar} rounded`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] flex justify-between items-center mb-1">
                      <span className={`${s.text} font-bold uppercase tracking-tighter truncate leading-none`}>{a.type}</span>
                      <span className="text-zinc-500 shrink-0 ml-2 text-right leading-none font-mono">
                        {new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-xs mt-1 text-zinc-300 leading-snug break-words">
                      {a.message}
                    </div>
                  </div>
                </div>
              );
            })}
            {mockAlerts.length === 0 && <div className="text-xs text-zinc-500 p-4 text-center">No recent alerts.</div>}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'IN TRANSIT': 'bg-blue-950 text-blue-400 border-blue-900',
    'DELIVERED': 'bg-green-950 text-green-400 border-green-900',
    'BREACH': 'bg-red-950 text-red-500 border-red-900 font-bold',
    'DELAYED': 'bg-amber-950 text-amber-400 border-amber-900',
    'LOADING': 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };
  const color = colors[status] || 'bg-zinc-950 text-zinc-400 border-zinc-900';
  
  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-widest ${color}`}>
      {status}
    </span>
  );
}
