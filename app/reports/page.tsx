"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Printer } from 'lucide-react';

const mockBarData = [
  { name: 'Mon', breaches: 0 },
  { name: 'Tue', breaches: 1 },
  { name: 'Wed', breaches: 0 },
  { name: 'Thu', breaches: 3 },
  { name: 'Fri', breaches: 0 },
  { name: 'Sat', breaches: 2 },
  { name: 'Sun', breaches: 0 },
];

const mockPieData = [
  { name: 'In Transit', value: 14 },
  { name: 'Delayed', value: 3 },
  { name: 'Breach', value: 2 },
  { name: 'Delivered', value: 25 },
];

const mockAreaData = [
  { date: '10/01', stock: 45000 },
  { date: '10/05', stock: 42000 },
  { date: '10/10', stock: 38000 },
  { date: '10/15', stock: 51000 },
  { date: '10/20', stock: 47000 },
  { date: '10/25', stock: 43000 },
  { date: '10/30', stock: 49000 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function ReportsPage() {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center shrink-0 border-l-4 border-emerald-500 pl-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1">Cross-sectional analysis of supply chain health.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono tracking-widest uppercase transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded text-[10px] font-mono tracking-widest uppercase transition-colors text-emerald-500 border-emerald-900/30">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
         <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
           <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Inventory Turnover</div>
           <div className="text-2xl font-bold text-white font-mono">14.2x</div>
         </div>
         <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
           <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Cold Chain Compliance</div>
           <div className="text-2xl font-bold text-emerald-500 font-mono">98.5%</div>
         </div>
         <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
           <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Supplier Performance</div>
           <div className="text-2xl font-bold text-blue-400 font-mono">92.0%</div>
         </div>
         <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
           <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Shipment Delays</div>
           <div className="text-2xl font-bold text-amber-500 font-mono">3.4%</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
        {/* Area Chart - Stock Levels */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col col-span-1 lg:col-span-2 h-[300px]">
           <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-6 font-mono border-b border-[#222] pb-3">Global Stock Levels Over Time</h3>
           <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={mockAreaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                 <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '12px' }}
                   itemStyle={{ color: '#10b981' }}
                 />
                 <Area type="monotone" dataKey="stock" stroke="#10b981" fillOpacity={1} fill="url(#colorStock)" strokeWidth={2} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col h-[300px]">
          <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-6 font-mono border-b border-[#222] pb-3">Cold Chain Breaches (7 Days)</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1a1a1a' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Bar dataKey="breaches" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col h-[300px]">
          <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-6 font-mono border-b border-[#222] pb-3">Shipment Status Distribution</h3>
          <div className="flex-1 w-full min-h-[200px] relative flex">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockPieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <div className="text-xl font-bold font-mono">44</div>
                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total</div>
               </div>
            </div>
            
            <div className="w-1/2 flex flex-col justify-center gap-3 pl-4 border-l border-[#222]">
              {mockPieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-zinc-400 uppercase">{d.name}</span>
                  </div>
                  <span className="text-white font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
