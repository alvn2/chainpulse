"use client";

import React, { useState, useEffect } from 'react';
import { Users, Phone, Star, FileText, Plus, X, CheckCircle } from 'lucide-react';

type Supplier = { id: string; name: string; location: string; cat: string; phone: string; score: number; activePOs: number };
type PO = { id: string; supplier_id: string; supplier_name: string; items: string; item_detail: string; total: number; status: string; expected: string; created_at: string };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPOForm] = useState({ supplier_id: '', items: '', item_detail: '', total: '' });
  const [saving, setSaving] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [supRes, poRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/purchase-orders'),
      ]);
      const [supData, poData] = await Promise.all([supRes.json(), poRes.json()]);
      setSuppliers(supData);
      setPOs(poData);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreatePO() {
    if (!poForm.supplier_id || !poForm.items || !poForm.item_detail || !poForm.total) return;
    setSaving(true);
    try {
      await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poForm, total: parseFloat(poForm.total) }),
      });
      setShowPOModal(false);
      setPOForm({ supplier_id: '', items: '', item_detail: '', total: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create PO:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleReceivePO(poId: string) {
    setReceivingId(poId);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: poId, action: 'receive' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`PO Received! Automatically added ${data.received} units of ${data.sku} to stock.`);
        fetchData();
      } else {
        alert(`Failed to receive: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to receive PO:', err);
    } finally {
      setReceivingId(null);
    }
  }

  const poStatusColors: Record<string, string> = {
    PENDING: 'bg-amber-950 text-amber-500 border-amber-900',
    CONFIRMED: 'bg-green-950 text-green-500 border-green-900',
    SHIPPED: 'bg-blue-950 text-blue-400 border-blue-900',
    RECEIVED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-48 rounded-lg"></div>)}
        </div>
        <div className="skeleton h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center shrink-0 border-l-4 border-amber-500 pl-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers & POs</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage vendor relations and purchase orders.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPOModal(true)} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono tracking-widest rounded text-xs transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> CREATE PO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {suppliers.map(sup => (
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
               <button 
                 onClick={() => { setPOForm({ ...poForm, supplier_id: sup.id }); setShowPOModal(true); }}
                 className="py-2 bg-[#0a0a0a] border border-[#333] text-zinc-300 rounded text-xs font-mono tracking-widest hover:bg-zinc-800 hover:text-white transition group-hover:border-zinc-500"
               >
                 NEW PO
               </button>
               <a 
                 href={`tel:${sup.phone}`}
                 className="py-2 bg-blue-950/20 border border-blue-900/50 text-blue-400 rounded text-xs font-mono tracking-widest hover:bg-blue-900/40 hover:border-blue-500 transition text-center"
               >
                 CALL
               </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* POs table */}
      <div className="bg-[#111] rounded-lg border border-[#222] overflow-hidden flex-1 shrink-0 flex flex-col min-h-[300px]">
         <div className="p-4 border-b border-[#222] bg-[#161616] flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest text-[#f5f5f5] text-xs font-mono">Purchase Orders</h3>
            <span className="text-[10px] font-mono text-zinc-500">{pos.length} total</span>
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
                  <th className="p-4 font-normal text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222] font-mono text-xs">
                 {pos.map(po => (
                   <tr key={po.id} className="hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                      <td className="p-4 font-bold text-amber-500">{po.id}</td>
                      <td className="p-4 text-white font-sans text-sm">{po.supplier_name}</td>
                      <td className="p-4 text-zinc-400">{po.items} <span className="text-zinc-600">({po.item_detail})</span></td>
                      <td className="p-4 text-right text-zinc-300">{Number(po.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                         <span className={`${poStatusColors[po.status] || ''} border px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest`}>{po.status}</span>
                      </td>
                      <td className="p-4 text-center">
                         {po.status !== 'RECEIVED' ? (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleReceivePO(po.id); }}
                             disabled={receivingId === po.id}
                             className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 rounded flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
                           >
                             <CheckCircle className="w-3 h-3" /> {receivingId === po.id ? '...' : 'RECEIVE'}
                           </button>
                         ) : (
                           <span className="text-zinc-600 text-[10px]">VERIFIED</span>
                         )}
                      </td>
                   </tr>
                 ))}
                 {pos.length === 0 && (
                   <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No purchase orders.</td></tr>
                 )}
              </tbody>
            </table>
         </div>
      </div>

      {/* Create PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center" onClick={() => setShowPOModal(false)}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">New Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="text-zinc-500 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Supplier</label>
                <select 
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500"
                  value={poForm.supplier_id}
                  onChange={e => setPOForm({...poForm, supplier_id: e.target.value})}
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">SKU ID</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. SKU-RS-NV" value={poForm.items} onChange={e => setPOForm({...poForm, items: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Quantity Detail</label>
                <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. 2000 pcs" value={poForm.item_detail} onChange={e => setPOForm({...poForm, item_detail: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-1">Total (KES)</label>
                <input type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. 70000" value={poForm.total} onChange={e => setPOForm({...poForm, total: e.target.value})} />
              </div>
            </div>
            
            <button 
              onClick={handleCreatePO} 
              disabled={saving || !poForm.supplier_id || !poForm.items || !poForm.total}
              className="w-full mt-6 py-3 bg-amber-500 text-black font-bold rounded text-sm hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'CREATING...' : 'CREATE PURCHASE ORDER'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
