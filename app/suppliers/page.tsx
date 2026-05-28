"use client";

import React from 'react';
import { Users, Phone, Star, FileText } from 'lucide-react';

const mockSuppliers = [
  { id: 'SUP-01', name: 'Maridadi Flowers', location: 'Naivasha', cat: 'Perishable', phone: '+254700111222', score: 98.5, activePOs: 3 },
  { id: 'SUP-02', name: 'Kakuzi Farms', location: 'Muranga', cat: 'Perishable', phone: '+254711222333', score: 96.0, activePOs: 1 },
  { id: 'SUP-03', name: 'Eldoret Grain Co', location: 'Eldoret', cat: 'Dry Store', phone: '+254722333444', score: 99.0, activePOs: 0 },
  { id: 'SUP-04', name: 'Limuru Dairy', location: 'Limuru', cat: 'Cold Store', phone: '+254733444555', score: 95.0, activePOs: 2 },
];

export default function SuppliersPage() {
  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center shrink-0 border-l-4 border-amber-500 pl-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers & POs</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage vendor relations and purchase orders.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono tracking-widest rounded text-xs transition">
            CREATE PO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {mockSuppliers.map(sup => (
          <div key={sup.id} className="bg-[#111] border border-[#222] rounded-lg p-5 flex flex-col hover:border-[#444] transition group">
            <div className="flex justify-between items-start mb-5">
               <div>
                 <h3 className="font-bold text-white leading-tight font-sans text-lg">{sup.name}</h3>
                 <div className="text-xs text-zinc-500 font-mono tracking-tight mt-1">{sup.location} • {sup.cat}</div>
               </div>
               <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-[#333] px-2.5 py-1.5 rounded shadow-inner">
                 <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                 <span className="text-[10px] font-mono font-bold text-amber-500">{sup.score}</span>
               </div>
            </div>
            
            <div className="space-y-3 mb-6 bg-[#0a0a0a] p-3 rounded border border-[#222]">
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Phone className="w-3 h-3 text-zinc-500" /> 
                </div>
                <span className="font-mono text-xs">{sup.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3 text-zinc-500" />
                </div>
                <span className="text-xs font-mono"><span className="text-white font-bold">{sup.activePOs}</span> Active Orders</span>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3">
               <button className="py-2 bg-[#0a0a0a] border border-[#333] text-zinc-300 rounded text-xs font-mono tracking-widest hover:bg-zinc-800 hover:text-white transition group-hover:border-zinc-500">
                 VIEW
               </button>
               <button className="py-2 bg-blue-950/20 border border-blue-900/50 text-blue-400 rounded text-xs font-mono tracking-widest hover:bg-blue-900/40 hover:border-blue-500 transition">
                 SMS
               </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mock POs table */}
      <div className="bg-[#111] rounded-lg border border-[#222] overflow-hidden flex-1 shrink-0 flex flex-col min-h-[300px]">
         <div className="p-4 border-b border-[#222] bg-[#161616]">
            <h3 className="font-bold uppercase tracking-widest text-[#f5f5f5] text-xs font-mono">Active Purchase Orders</h3>
         </div>
         <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap text-zinc-300">
              <thead className="bg-[#0a0a0a] text-zinc-500 font-mono text-[10px] uppercase tracking-widest border-b border-[#222]">
                <tr>
                  <th className="p-4 font-normal">PO Number</th>
                  <th className="p-4 font-normal">Supplier</th>
                  <th className="p-4 font-normal">Items</th>
                  <th className="p-4 font-normal text-right">Total (KES)</th>
                  <th className="p-4 font-normal text-center">Status</th>
                  <th className="p-4 font-normal text-right">Expected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-xs">
                 <tr className="hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                    <td className="p-4 font-bold text-amber-500">PO-2941</td>
                    <td className="p-4 text-white font-sans text-sm">Maridadi Flowers</td>
                    <td className="p-4 text-zinc-400">SKU-RS-NV <span className="text-zinc-600">(2000 stems)</span></td>
                    <td className="p-4 text-right text-zinc-300">70,000.00</td>
                    <td className="p-4 text-center">
                       <span className="bg-amber-950 text-amber-500 border border-amber-900 px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest">Pending</span>
                    </td>
                    <td className="p-4 text-right text-zinc-500">In 3 Days</td>
                 </tr>
                 <tr className="hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                    <td className="p-4 font-bold text-blue-400">PO-2940</td>
                    <td className="p-4 text-white font-sans text-sm">Kakuzi Farms</td>
                    <td className="p-4 text-zinc-400">SKU-AV-MR <span className="text-zinc-600">(500 kg)</span></td>
                    <td className="p-4 text-right text-zinc-300">60,000.00</td>
                    <td className="p-4 text-center">
                       <span className="bg-green-950 text-green-500 border border-green-900 px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest">Confirmed</span>
                    </td>
                    <td className="p-4 text-right text-zinc-500">Tomorrow</td>
                 </tr>
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
