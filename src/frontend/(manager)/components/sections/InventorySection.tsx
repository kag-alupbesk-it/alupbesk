"use client";

import { useState } from "react";
import { inventoryItems as initialItems } from "../../data/managerData";

type InventoryItem = typeof initialItems[0] & { statusColor: string; barColor: string };

function getStatusFromStock(stock: number, threshold: number) {
  if (stock === 0) return { status: "Out of Stock", statusColor: "text-red-400", barColor: "bg-red-400" };
  const pct = Math.round((stock / threshold) * 100);
  if (pct < 30) return { status: "Critical", statusColor: "text-secondary", barColor: "bg-secondary" };
  return { status: "Healthy", statusColor: "text-emerald-400", barColor: "bg-emerald-400" };
}

const filters = ["All Items", "Extrusion", "Hardware", "Fasteners", "Electronics"];

export default function InventorySection() {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InventoryItem[]>(() =>
    initialItems.map((item) => {
      const { statusColor, barColor } = getStatusFromStock(item.stock, item.threshold);
      return { ...item, statusColor, barColor };
    })
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", variant: "", category: "Extrusion", icon: "inventory", stock: 0, threshold: 100 });

  const filteredItems = items.filter((item) => {
    const matchFilter = activeFilter === "All Items" || item.category === activeFilter;
    const matchSearch = search === "" || item.sku.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAdd = () => {
    if (!form.sku || !form.name) return;
    const { status, statusColor, barColor } = getStatusFromStock(form.stock, form.threshold);
    setItems((prev) => [...prev, { ...form, status, statusColor, barColor }]);
    setShowAddModal(false);
    setForm({ sku: "", name: "", variant: "", category: "Extrusion", icon: "inventory", stock: 0, threshold: 100 });
  };

  const handleOpenEdit = (idx: number) => {
    const item = filteredItems[idx];
    setEditingIdx(items.indexOf(item));
    setForm({ sku: item.sku, name: item.name, variant: item.variant, category: item.category, icon: item.icon, stock: item.stock, threshold: item.threshold });
    setShowEditModal(true);
    setShowMoreMenu(null);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    const { status, statusColor, barColor } = getStatusFromStock(form.stock, form.threshold);
    setItems((prev) => prev.map((item, i) => i === editingIdx ? { ...item, ...form, status, statusColor, barColor } : item));
    setShowEditModal(false);
    setEditingIdx(null);
  };

  const handleDelete = (idx: number) => {
    const item = filteredItems[idx];
    if (!confirm(`Hapus ${item.name}?`)) return;
    setItems((prev) => prev.filter((_, i) => items.indexOf(filteredItems[idx]) !== i));
    setShowMoreMenu(null);
  };

  const handleRestock = (idx: number) => {
    const item = filteredItems[idx];
    const originalIdx = items.indexOf(item);
    const newStock = item.stock + item.threshold;
    const { status, statusColor, barColor } = getStatusFromStock(newStock, item.threshold);
    setItems((prev) => prev.map((item, i) => i === originalIdx ? { ...item, stock: newStock, status, statusColor, barColor } : item));
    setShowMoreMenu(null);
  };

  const handleExport = () => {
    const header = "SKU,Name,Category,Stock,Threshold,Status\n";
    const rows = items.map((i) => `${i.sku},${i.name},${i.category},${i.stock},${i.threshold},${i.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Inventory_Export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-10 pb-24 min-h-screen">
      <header className="flex justify-between items-end mb-12">
        <div>
          <nav className="flex items-center gap-2 text-white/40 mb-3 text-xs uppercase tracking-widest font-bold">
            <span>Manufacturing</span><span className="material-symbols-outlined text-xs">chevron_right</span><span className="text-secondary font-bold">Inventory</span>
          </nav>
          <h2 className="text-4xl text-white font-bold font-headline">Inventory Management</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExport} className="px-6 py-3 rounded-pill border border-white/20 text-white flex items-center gap-2 hover:bg-white/5 transition-colors text-sm font-semibold">
            <span className="material-symbols-outlined text-xl">download</span> Export CSV
          </button>
          <button onClick={() => { setForm({ sku: "", name: "", variant: "", category: "Extrusion", icon: "inventory", stock: 0, threshold: 100 }); setShowAddModal(true); }} className="px-8 py-3 rounded-pill bg-secondary text-primary font-bold flex items-center gap-2 hover:brightness-110 transition-all text-sm shadow-xl shadow-secondary/10">
            <span className="material-symbols-outlined text-xl">add_circle</span> Add New SKU
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Active SKUs", value: items.length.toString(), change: `${items.filter((i) => i.status === "Healthy").length} healthy`, changeColor: "text-emerald-400", icon: "inventory", alert: false },
          { label: "Low Stock Alerts", value: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length.toString(), change: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 ? "Action Required" : "All clear", changeColor: "text-secondary", icon: "warning", alert: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 },
          { label: "Total Units", value: items.reduce((a, b) => a + b.stock, 0).toLocaleString(), change: `Across ${items.length} SKUs`, changeColor: "text-white/40", icon: "payments", alert: false },
        ].map((m) => (
          <div key={m.label} className={`p-8 rounded-xl border flex flex-col justify-between transition-all group shadow-lg ${m.alert ? "bg-secondary/5 border-secondary/30 relative overflow-hidden" : "bg-primary-container border-white/10 hover:border-secondary/30"}`}>
            {m.alert && <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[80px] -mr-16 -mt-16" />}
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-lg ${m.alert ? "bg-secondary/20" : "bg-secondary/10"}`}>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
              </div>
              {m.alert ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-pill border border-secondary/20">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                  <span className="text-secondary font-bold text-[10px] uppercase tracking-wider">{m.change}</span>
                </div>
              ) : <span className={`font-bold text-xs uppercase tracking-tighter ${m.changeColor}`}>{m.change}</span>}
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{m.label}</p>
              <h3 className={`text-4xl font-bold mt-2 font-headline ${m.alert ? "text-secondary" : "text-white"}`}>{m.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-primary-container border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex flex-wrap gap-6 items-center justify-between bg-white/5">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
            <input className="w-full bg-primary border border-white/10 rounded-lg pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-white placeholder:text-white/25" placeholder="Search by SKU or Product Name..." type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            <span className="text-white/40 font-bold text-xs uppercase tracking-widest mr-2">Filter:</span>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-5 py-2 rounded-pill font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${activeFilter === f ? "bg-secondary text-primary" : "border border-white/20 text-white/40 hover:text-white hover:bg-white/5"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white/40 border-b border-white/10">
                {["SKU ID", "Product Name", "Category", "Stock vs Threshold", "Status", "Actions"].map((h) => (
                  <th key={h} className={`px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item, i) => {
                const pct = item.threshold > 0 ? Math.round((item.stock / item.threshold) * 100) : 0;
                return (
                  <tr key={item.sku} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 font-mono text-sm text-secondary font-bold">{item.sku}</td>
                    <td className="px-6 py-6"><div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10"><span className="material-symbols-outlined text-secondary text-2xl">{item.icon}</span></div>
                      <div><div className="font-bold text-white">{item.name}</div><div className="text-xs text-white/40">{item.variant}</div></div>
                    </div></td>
                    <td className="px-6 py-6"><span className="px-3 py-1 rounded-pill bg-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider">{item.category}</span></td>
                    <td className="px-6 py-6 w-64">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white/70 font-medium">{item.stock.toLocaleString()} / {item.threshold.toLocaleString()} units</span>
                        <span className={`text-[10px] font-bold ${pct < 30 ? item.statusColor : "text-white/40"}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-primary rounded-full overflow-hidden border border-white/10"><div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                    </td>
                    <td className="px-6 py-6"><div className={`flex items-center gap-2 ${item.status === "Critical" ? `${item.statusColor} bg-secondary/10 px-2 py-1 rounded-pill` : item.statusColor}`}>
                      <div className={`w-2 h-2 rounded-full ${item.barColor} ${item.status === "Critical" ? "animate-pulse" : ""}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">{item.status}</span>
                    </div></td>
                    <td className="px-8 py-6 text-right"><div className="flex justify-end gap-1 relative">
                      <button onClick={() => handleOpenEdit(i)} className="p-2 text-white/40 hover:text-secondary transition-colors rounded-lg hover:bg-white/5"><span className="material-symbols-outlined text-xl">edit</span></button>
                      <button onClick={() => setShowMoreMenu(showMoreMenu === i ? null : i)} className="p-2 text-white/40 hover:text-secondary transition-colors rounded-lg hover:bg-white/5"><span className="material-symbols-outlined text-xl">more_vert</span></button>
                      {showMoreMenu === i && (
                        <div className="absolute top-full right-0 mt-1 bg-primary-container border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px] animate-fadeIn">
                          <button onClick={() => handleOpenEdit(i)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-lg">edit</span> Edit SKU</button>
                          <button onClick={() => handleRestock(i)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-lg">add_box</span> Restock</button>
                          <button onClick={() => handleDelete(i)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-lg">delete</span> Hapus</button>
                        </div>
                      )}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowAddModal(false)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xl font-bold text-white mb-6 font-headline">Tambah SKU Baru</h4>
            <div className="space-y-4">
              <input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option><option value="Hardware">Hardware</option><option value="Fasteners">Fasteners</option><option value="Electronics">Electronics</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Stock</label><input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Threshold</label><input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-white/20 rounded-pill text-white/40 font-bold text-sm hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-secondary text-primary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Tambah</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowEditModal(false)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xl font-bold text-white mb-6 font-headline">Edit SKU</h4>
            <div className="space-y-4">
              <input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option><option value="Hardware">Hardware</option><option value="Fasteners">Fasteners</option><option value="Electronics">Electronics</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Stock</label><input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Threshold</label><input className="w-full bg-primary border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-white/20 rounded-pill text-white/40 font-bold text-sm hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-secondary text-primary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
