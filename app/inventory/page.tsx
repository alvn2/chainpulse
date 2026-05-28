"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, TrendingDown, TrendingUp, AlertCircle, X, PackagePlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type InventoryItem = { sku: string; name: string; category: string; unit: string; qty: number; threshold: number; warehouse_zone: string };

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Modal state
  const [modalTab, setModalTab] = useState<'update' | 'create'>('update');
  const [addForm, setAddForm] = useState({ sku_id: '', quantity: '', mode: 'add' as 'add' | 'set' });
  const [createForm, setCreateForm] = useState({ sku_id: '', name: '', category: 'Perishable', unit: 'pcs', threshold: '100', zone: 'ZONE-A' });
  const [saving, setSaving] = useState(false);

  async function fetchInventory() {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  async function handleAddStock() {
    if (!addForm.sku_id || !addForm.quantity) return;
    setSaving(true);
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku_id: addForm.sku_id,
          quantity: parseInt(addForm.quantity, 10),
          mode: addForm.mode,
        }),
      });
      setShowAddModal(false);
      setAddForm({ sku_id: '', quantity: '', mode: 'add' });
      fetchInventory();
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSKU() {
    if (!createForm.sku_id || !createForm.name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'create_sku',
          sku_id: createForm.sku_id.toUpperCase(),
          name: createForm.name,
          category: createForm.category,
          unit: createForm.unit,
          threshold: parseInt(createForm.threshold, 10),
          zone: createForm.zone
        }),
      });
      
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setShowAddModal(false);
        setCreateForm({ sku_id: '', name: '', category: 'Perishable', unit: 'pcs', threshold: '100', zone: 'ZONE-A' });
        fetchInventory();
      }
    } catch (err) {
      console.error('Failed to create SKU:', err);
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const headers = ['SKU', 'Product', 'Category', 'Quantity', 'Unit', 'Threshold', 'Zone', 'Status'];
    const rows = inventory.map(i => {
      const status = i.qty === 0 ? 'OUT OF STOCK' : i.qty <= i.threshold ? 'LOW STOCK' : 'HEALTHY';
      return [i.sku, i.name, i.category, i.qty, i.unit, i.threshold, i.warehouse_zone, status].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainpulse-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCreatePO(skuId: string) {
    const item = inventory.find(i => i.sku === skuId);
    if (!item) return;
    try {
      await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: 'SUP-01',
          items: skuId,
          item_detail: `${item.threshold} ${item.unit}`,
          total: item.threshold * 35,
        }),
      });
      alert(`Purchase Order created for ${item.name}`);
    } catch (err) {
      console.error('Failed to create PO:', err);
    }
  }

  const filtered = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const healthy = inventory.filter(i => i.qty > i.threshold).length;
  const low = inventory.filter(i => i.qty <= i.threshold && i.qty > 0).length;
  const critical = inventory.filter(i => i.qty === 0).length;

  if (loading) {
    return (
      <div className="p-6 h-full overflow-y-auto flex flex-col gap-6 custom-scrollbar">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-[#111] p-4 rounded border border-[#222]"><div className="skeleton h-4 w-20 mb-2"></div><div className="skeleton h-8 w-12"></div></div>)}
        </div>
        <div className="skeleton h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col gap-6 custom-scrollbar">
      
      {/* Top Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-zinc-500 text-sm">Manage global stock levels and warehouse distribution.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded text-sm transition">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-black hover:bg-emerald-400 rounded text-sm font-semibold transition shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add / Create Stock</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#111111] p-4 rounded border border-[#222222]">
          <div className="text-zinc-500 text-xs font-mono mb-2 uppercase">Total SKUs</div>
          <div className="text-3xl font-bold">{inventory.length}</div>
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
               {inventory.filter(i => i.qty <= i.threshold).map(item => (
                 <div key={'action-'+item.sku} className="bg-[#1a1a1a] p-3 rounded border border-[#333] hover:border-amber-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-sm font-medium">{item.name}</div>
                       <div className="text-[10px] font-mono text-amber-500 bg-amber-950/30 px-1 border border-amber-900/50 rounded">{item.qty} / {item.threshold}</div>
                    </div>
                    <button 
                      onClick={() => handleCreatePO(item.sku)}
                      className="w-full py-1.5 bg-[#0a0a0a] hover:bg-[#10b981] hover:text-black hover:border-[#10b981] text-zinc-300 rounded text-xs tracking-wider font-mono transition-colors border border-[#333]"
                    >
                      CREATE PO
                    </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Add / Create Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Inventory Management</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Modal Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-[#0a0a0a] rounded-lg border border-[#222]">
               <button 
                 onClick={() => setModalTab('update')} 
                 className={`flex-1 text-sm py-2 rounded-md font-medium transition ${modalTab === 'update' ? 'bg-[#222] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 Update Existing
               </button>
               <button 
                 onClick={() => setModalTab('create')} 
                 className={`flex-1 text-sm py-2 rounded-md font-medium transition flex items-center justify-center gap-2 ${modalTab === 'create' ? 'bg-[#10b981] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 <PackagePlus className="w-4 h-4" /> Create New SKU
               </button>
            </div>
            
            {modalTab === 'update' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">SKU</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981]"
                    value={addForm.sku_id}
                    onChange={e => setAddForm({...addForm, sku_id: e.target.value})}
                  >
                    <option value="">Select SKU...</option>
                    {inventory.map(i => <option key={i.sku} value={i.sku}>{i.sku} — {i.name} (Current: {i.qty})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981] font-mono"
                    placeholder="Enter quantity..."
                    value={addForm.quantity}
                    onChange={e => setAddForm({...addForm, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Mode</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setAddForm({...addForm, mode: 'add'})}
                      className={`flex-1 py-2 rounded text-sm font-mono border transition ${addForm.mode === 'add' ? 'bg-[#10b981] text-black border-[#10b981]' : 'bg-[#0a0a0a] border-[#333] text-zinc-400 hover:border-zinc-500'}`}
                    >
                      + ADD TO STOCK
                    </button>
                    <button 
                      onClick={() => setAddForm({...addForm, mode: 'set'})}
                      className={`flex-1 py-2 rounded text-sm font-mono border transition ${addForm.mode === 'set' ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#0a0a0a] border-[#333] text-zinc-400 hover:border-zinc-500'}`}
                    >
                      = SET LEVEL
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleAddStock} 
                  disabled={saving || !addForm.sku_id || !addForm.quantity}
                  className="w-full mt-6 py-3 bg-[#10b981] text-black font-bold rounded text-sm hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'SAVING...' : 'CONFIRM UPDATE'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">SKU ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981] font-mono uppercase"
                      placeholder="e.g. SKU-NEW-01"
                      value={createForm.sku_id}
                      onChange={e => setCreateForm({...createForm, sku_id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Category</label>
                    <select 
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981]"
                      value={createForm.category}
                      onChange={e => setCreateForm({...createForm, category: e.target.value})}
                    >
                      <option>Perishable</option>
                      <option>Dry Store</option>
                      <option>Cold Store</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981]"
                    placeholder="Product name..."
                    value={createForm.name}
                    onChange={e => setCreateForm({...createForm, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Unit</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981]"
                      placeholder="kg, pcs..."
                      value={createForm.unit}
                      onChange={e => setCreateForm({...createForm, unit: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Threshold</label>
                    <input 
                      type="number" 
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981] font-mono"
                      placeholder="100"
                      value={createForm.threshold}
                      onChange={e => setCreateForm({...createForm, threshold: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Zone</label>
                    <select 
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-[#10b981]"
                      value={createForm.zone}
                      onChange={e => setCreateForm({...createForm, zone: e.target.value})}
                    >
                      <option>ZONE-A</option>
                      <option>ZONE-B</option>
                      <option>ZONE-C</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleCreateSKU} 
                  disabled={saving || !createForm.sku_id || !createForm.name}
                  className="w-full mt-6 py-3 bg-[#10b981] text-black font-bold rounded text-sm hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'CREATING...' : 'CREATE NEW SKU'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
