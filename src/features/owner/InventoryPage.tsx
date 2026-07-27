"use client";

import { useState } from "react";

type InventoryItem = {
  sku: string;
  name: string;
  variant: string;
  category: string;
  icon: string;
  stock: number;
  threshold: number;
  status: string;
  statusColor: string;
  barColor: string;
};

const initialItems: InventoryItem[] = [
  {
    sku: "AL-EXT-4040-B",
    name: "T-Slot Aluminum 4040",
    variant: "Black Anodized Finish",
    category: "Extrusion",
    icon: "precision_manufacturing",
    stock: 452,
    threshold: 800,
    status: "Healthy",
    statusColor: "text-success",
    barColor: "bg-success",
  },
  {
    sku: "RAIL-LIN-15MGN",
    name: "MGN15 Linear Rail",
    variant: "Stainless Steel 440C",
    category: "Hardware",
    icon: "linear_scale",
    stock: 12,
    threshold: 100,
    status: "Critical",
    statusColor: "text-secondary",
    barColor: "bg-secondary",
  },
  {
    sku: "BRAK-COR-90D",
    name: "90° Corner Bracket",
    variant: "Cast Aluminum Alloy",
    category: "Fasteners",
    icon: "category",
    stock: 0,
    threshold: 500,
    status: "Out of Stock",
    statusColor: "text-error",
    barColor: "bg-error",
  },
  {
    sku: "FAST-M5-12SS",
    name: "M5 x 12mm Bolt",
    variant: "Button Head Hex Drive",
    category: "Fasteners",
    icon: "settings_input_component",
    stock: 2400,
    threshold: 5000,
    status: "Healthy",
    statusColor: "text-success",
    barColor: "bg-success",
  },
];

const filters = ["All Items", "Extrusion", "Hardware", "Fasteners", "Electronics"];

function getStatusFromStock(stock: number, threshold: number) {
  if (stock === 0) return { status: "Out of Stock", statusColor: "text-error", barColor: "bg-error" };
  const pct = Math.round((stock / threshold) * 100);
  if (pct < 30) return { status: "Critical", statusColor: "text-secondary", barColor: "bg-secondary" };
  return { status: "Healthy", statusColor: "text-success", barColor: "bg-success" };
}

export default function InventoryPage() {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [showAssistant, setShowAssistant] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [search, setSearch] = useState("");
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

  return (
    <div className="p-margin-x-desktop pb-section-gap-desktop min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-3 text-xs uppercase tracking-widest font-bold">
            <span>Manufacturing</span>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-secondary font-bold">Inventory</span>
          </nav>
          <h2 className="text-4xl text-on-surface font-bold font-headline">
            Inventory Management
          </h2>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              const header = "SKU,Name,Category,Stock,Threshold,Status\n";
              const rows = items.map((i) => `${i.sku},${i.name},${i.category},${i.stock},${i.threshold},${i.status}`).join("\n");
              const blob = new Blob([header + rows], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "Inventory_Export.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 rounded-pill border border-outline/50 text-on-surface flex items-center gap-2 hover:bg-surface-variant transition-colors text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            Export CSV
          </button>
          <button
            onClick={() => { setForm({ sku: "", name: "", variant: "", category: "Extrusion", icon: "inventory", stock: 0, threshold: 100 }); setShowAddModal(true); }}
            className="px-8 py-3 rounded-pill bg-secondary text-on-secondary font-bold flex items-center gap-2 hover:brightness-110 transition-all text-sm shadow-xl shadow-secondary/10"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            Add New SKU
          </button>
        </div>
      </header>

      {/* Metrics Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Active SKUs", value: items.length.toLocaleString(), change: `${items.filter((i) => i.status === "Healthy").length} healthy`, changeColor: "text-success", icon: "inventory", alert: false },
          { label: "Low Stock Alerts", value: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length.toString(), change: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 ? "Action Required" : "All clear", changeColor: "text-secondary", icon: "warning", alert: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 },
          { label: "Total Units", value: items.reduce((a, b) => a + b.stock, 0).toLocaleString(), change: `Across ${items.length} SKUs`, changeColor: "text-on-surface-variant", icon: "payments", alert: false },
        ].map((m) => (
          <div
            key={m.label}
            className={`p-8 rounded-xl border flex flex-col justify-between transition-all group shadow-lg ${
              m.alert
                ? "bg-secondary/5 border-secondary/30 relative overflow-hidden"
                : "bg-surface-container-low border-outline/10 hover:border-secondary/30"
            }`}
          >
            {m.alert && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[80px] -mr-16 -mt-16" />
            )}
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-lg ${m.alert ? "bg-secondary/20" : "bg-secondary/10"}`}>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
              </div>
              {m.alert ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-pill border border-secondary/20">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                  <span className="text-secondary font-bold text-[10px] uppercase tracking-wider">{m.change}</span>
                </div>
              ) : (
                <span className={`font-bold text-xs uppercase tracking-tighter ${m.changeColor} ${m.changeColor === "text-success" ? "bg-success/10 px-2 py-1 rounded" : ""}`}>{m.change}</span>
              )}
            </div>
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">{m.label}</p>
              <h3 className={`text-4xl font-bold mt-2 font-headline ${m.alert ? "text-secondary" : "text-on-surface"}`}>{m.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Inventory Table */}
      <section className="bg-surface-container-low border border-outline/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-outline/10 flex flex-wrap gap-6 items-center justify-between bg-surface-container-lowest/50">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full bg-background border border-outline/30 rounded-lg pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Search by SKU or Product Name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-widest mr-2">Filter:</span>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-5 py-2 rounded-pill font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${activeFilter === f ? "bg-secondary text-on-secondary" : "border border-outline/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/20 text-on-surface-variant border-b border-outline/20">
                {["SKU ID", "Product Name", "Category", "Stock vs Threshold", "Status", "Actions"].map((h) => (
                  <th key={h} className={`px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {filteredItems.map((item, i) => {
                const pct = item.threshold > 0 ? Math.round((item.stock / item.threshold) * 100) : 0;
                const isLow = pct < 30;
                return (
                  <tr key={item.sku} className="hover:bg-on-surface/5 transition-colors group">
                    <td className="px-8 py-6 font-mono text-sm text-secondary font-bold">{item.sku}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline/10">
                          <span className="material-symbols-outlined text-secondary text-2xl">{item.icon}</span>
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{item.name}</div>
                          <div className="text-xs text-on-surface-variant">{item.variant}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 rounded-pill bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                    </td>
                    <td className="px-6 py-6 w-64">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-on-surface font-medium">{item.stock.toLocaleString()} / {item.threshold.toLocaleString()} units</span>
                        <span className={`text-[10px] font-bold ${isLow ? item.statusColor : "text-on-surface-variant"}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-background rounded-full overflow-hidden border border-outline/10">
                        <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`flex items-center gap-2 ${item.status === "Critical" ? `${item.statusColor} bg-secondary/10 px-2 py-1 rounded-pill` : item.statusColor}`}>
                        <div className={`w-2 h-2 rounded-full ${item.barColor} ${item.status === "Critical" ? "animate-pulse" : ""}`} />
                        <span className="text-xs font-bold uppercase tracking-wider">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-1 relative">
                        <button onClick={() => handleOpenEdit(i)} className="p-2 text-on-surface-variant hover:text-secondary transition-colors rounded-lg hover:bg-surface-container-highest">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button onClick={() => setShowMoreMenu(showMoreMenu === i ? null : i)} className="p-2 text-on-surface-variant hover:text-secondary transition-colors rounded-lg hover:bg-surface-container-highest">
                          <span className="material-symbols-outlined text-xl">more_vert</span>
                        </button>
                        {showMoreMenu === i && (
                          <div className="absolute top-full right-0 mt-1 bg-surface border border-outline rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px] animate-fadeIn">
                            <button onClick={() => handleOpenEdit(i)} className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">edit</span> Edit SKU
                            </button>
                            <button onClick={() => handleRestock(i)} className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">add_box</span> Restock
                            </button>
                            <button onClick={() => handleDelete(i)} className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-variant transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">delete</span> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Assistant FAB */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 z-40">
        {showAssistant && (
          <div className="bg-surface/90 backdrop-blur-md p-5 rounded-xl max-w-xs text-sm mb-2 shadow-2xl border border-secondary/20 border-outline animate-fadeIn">
            <div className="flex items-center gap-2 mb-2 text-secondary">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              <span className="font-bold text-xs uppercase tracking-widest">Inventory Insight</span>
            </div>
            <p className="text-on-surface text-xs leading-relaxed">
              &quot;Linear Rails are depleting 20% faster than average this week. Recommend reordering today to maintain production schedules.&quot;
            </p>
          </div>
        )}
        <button onClick={() => setShowAssistant(!showAssistant)} className="w-16 h-16 bg-secondary text-on-secondary rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">bolt</span>
        </button>
      </div>

      {/* Add SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface border border-outline rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xl font-bold text-on-surface mb-6 font-headline">Tambah SKU Baru</h4>
            <div className="space-y-4">
              <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option>
                <option value="Hardware">Hardware</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Electronics">Electronics</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Stock</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Threshold</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-outline rounded-pill text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors">Batal</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Tambah</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit SKU Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowEditModal(false)}>
          <div className="bg-surface border border-outline rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xl font-bold text-on-surface mb-6 font-headline">Edit SKU</h4>
            <div className="space-y-4">
              <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option>
                <option value="Hardware">Hardware</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Electronics">Electronics</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Stock</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Threshold</label>
                  <input className="w-full bg-background border border-outline rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-outline rounded-pill text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors">Batal</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
