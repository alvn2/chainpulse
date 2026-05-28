"use client";

import React, { useState } from 'react';
import { Search, Plus, Download, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const mockInventory = [
  { sku: 'SKU-RS-NV', name: 'Naivasha Red Roses', category: 'Perishable', unit: 'stems', qty: 450, threshold: 500, warehouse_zone: 'ZONE-B' },
  { sku: 'SKU-AV-MR', name: 'Hass Avocados', category: 'Perishable', unit: 'kg', qty: 1200, threshold: 1000, warehouse_zone: 'ZONE-C' },
  { sku: 'SKU-MZ-EL', name: 'Maize Grain', category: 'Dry Store', unit: 'kg', qty: 8500, threshold: 5000, warehouse_zone: 'ZONE-A' },
  { sku: 'SKU-MLK-LM', name: 'Fresh Milk', category: 'Cold Store', unit: 'liters', qty: 900, threshold: 800, warehouse_zone: 'ZONE-C' },
  { sku: 'SKU-BX-MD', name: 'Cardboard Box (Medium)', category: 'Dry Store', unit: 'pcs', qty: 280, threshold: 300, warehouse_zone: 'ZONE-A' },
  { sku: 'SKU-PA-TH', name: 'Thika Pineapples', category: 'Perishable', unit: 'pcs', qty: 0, threshold: 500, warehouse_zone: 'ZONE-C' },
];

const stockChartData = [
  { date: '10/01', stock: 45000 },
  { date: '10/05', stock: 42000 },
  { date: '10/10', stock: 38000 },
  { date: '10/15', stock: 51000 },
  { date: '10/20', stock: 47000 },
  { date: '10/25', stock: 43000 },
  { date: '10/30', stock: 49000 },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const filtered = mockInventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const healthy = mockInventory.filter(i => i.qty > i.threshold).length;
  const low = mockInventory.filter(i => i.qty <= i.threshold && i.qty > 0).length;
  const critical = mockInventory.filter(i => i.qty === 0).length;

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col gap-6 custom-scrollbar">
      
      {/* Top Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-zinc-500 text-sm">Manage global stock levels and warehouse distribution.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded text-sm transition">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-black hover:bg-[#0ea5e9] hover:text-white rounded text-sm font-semibold transition">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Stock</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#111111] p-4 rounded border border-[#222222]">
          <div className="text-zinc-500 text-xs font-mono mb-2 uppercase">Total SKUs</div>
          <div className="text-3xl font-bold">{mockInventory.length}</div>
        </div>
        <div className="bg-[#111111] p-4 rounded border border-[#222222]">
          <div className="text-zinc-500 text-xs font-mono mb-2 uppercase">Healthy Stock</div>
          <div className="text-3xl font-bold text-[#10b981] flex items-center gap-2">
            {healthy} <TrendingUp className="w-5 h-5 text-[#10b981]" />
          </div>
        </div>
        <div className="bg-[#111111] p-4 rounded border border-[#222222]">
          <div className="text-zinc-500 text-xs font-mono mb-2 uppercase">Low Stock</div>
          <div className="text-3xl font-bold text-amber-500 flex items-center gap-2">
            {low} <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-[#111111] p-4 rounded border border-red-900/50">
          <div className="text-red-500 text-xs font-mono mb-2 uppercase">Critical / Out</div>
          <div className="text-3xl font-bold text-red-500 flex items-center gap-2">
            {critical} <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[400px]">
        {/* Main Table Area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-[#111] p-2 rounded border border-[#222]">
            <div className="flex items-center bg-[#0a0a0a] border border-[#333] rounded px-3 py-1.5 w-64 focus-within:border-[#10b981] transition-colors">
              <Search className="w-4 h-4 text-zinc-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search SKUs or Products..." 
                className="bg-transparent border-none outline-none text-sm w-full font-mono placeholder:font-sans placeholder:text-zinc-600"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <select 
                 className="bg-[#0a0a0a] border border-[#333] text-sm rounded px-3 py-1.5 outline-none focus:border-[#10b981] transition-colors"
                 value={categoryFilter}
                 onChange={e => setCategoryFilter(e.target.value)}
                >
                 <option>All Categories</option>
                 <option>Perishable</option>
                 <option>Dry Store</option>
                 <option>Cold Store</option>
               </select>
            </div>
          </div>

          <div className="flex-1 bg-[#111111] rounded border border-[#222222] overflow-hidden flex flex-col">
            <div className="overflow-x-auto border-b border-[#222]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#0a0a0a] text-zinc-500 font-mono text-xs border-b border-[#222]">
                  <tr>
                    <th className="p-4 font-normal">SKU</th>
                    <th className="p-4 font-normal">Product</th>
                    <th className="p-4 font-normal">Category</th>
                    <th className="p-4 font-normal text-right">Quantity</th>
                    <th className="p-4 font-normal text-center">Status</th>
                    <th className="p-4 font-normal">Zone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No items found matching criteria.</td></tr>
                  ) : filtered.map(item => {
                    const isLow = item.qty <= item.threshold;
                    const isCritical = item.qty === 0;
                    return (
                      <tr key={item.sku} className="hover:bg-[#1a1a1a] transition cursor-pointer">
                        <td className="p-4 font-mono text-xs text-zinc-400">{item.sku}</td>
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4 text-zinc-500 text-xs">{item.category}</td>
                        <td className="p-4 text-right font-mono">
                          <span className={`${isCritical ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-white'}`}>
                            {item.qty}
                          </span>
                          <span className="text-zinc-600 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="p-4 text-center">
                           {isCritical ? (
                             <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest">Out of Stock</span>
                           ) : isLow ? (
                             <span className="bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest">Low Stock</span>
                           ) : (
                             <span className="bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest">Healthy</span>
                           )}
                        </td>
                        <td className="p-4 text-xs font-mono text-zinc-400">{item.warehouse_zone}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Charts */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111111] rounded border border-[#222222] p-4 flex flex-col h-64">
             <h3 className="text-xs uppercase font-mono text-zinc-500 mb-4 tracking-wider">Volume Trend (30 Days)</h3>
             <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={stockChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                   <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '12px' }}
                     itemStyle={{ color: '#10b981' }}
                   />
                   <Line type="monotone" dataKey="stock" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-[#111111] rounded border border-[#222222] flex-1 flex flex-col p-4 overflow-hidden">
             <h3 className="text-xs uppercase font-mono tracking-wider text-amber-500 mb-4 border-b border-[#222] pb-2">Action Required</h3>
             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
               {mockInventory.filter(i => i.qty <= i.threshold).map(item => (
                 <div key={'action-'+item.sku} className="bg-[#1a1a1a] p-3 rounded border border-[#333] hover:border-amber-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-sm font-medium">{item.name}</div>
                       <div className="text-[10px] font-mono text-amber-500 bg-amber-950/30 px-1 border border-amber-900/50 rounded">{item.qty} / {item.threshold}</div>
                    </div>
                    <button className="w-full py-1.5 bg-[#0a0a0a] hover:bg-[#10b981] hover:text-black hover:border-[#10b981] text-zinc-300 rounded text-xs tracking-wider font-mono transition-colors border border-[#333]">
                      CREATE PO
                    </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
