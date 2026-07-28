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
    <div className="px-3 sm:px-4 lg:px-margin-x-desktop py-4 sm:py-8 lg:py-section-gap-desktop min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
        <div>
          <nav className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant mb-2 sm:mb-3 text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            <span>Manufacturing</span>
            <span className="material-symbols-outlined text-[10px] sm:text-xs">
              chevron_right
            </span>
            <span className="text-secondary font-bold">Inventory</span>
          </nav>
          <h2 className="text-xl sm:text-2xl md:text-4xl text-on-surface font-bold font-headline">
            Inventory Management
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-pill border border-white/10 text-on-surface flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-xs sm:text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-base sm:text-xl">download</span>
            Export CSV
          </button>
          <button
            onClick={() => { setForm({ sku: "", name: "", variant: "", category: "Extrusion", icon: "inventory", stock: 0, threshold: 100 }); setShowAddModal(true); }}
            className="px-5 sm:px-8 py-2 sm:py-3 rounded-pill bg-secondary text-on-secondary font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all text-xs sm:text-sm shadow-xl shadow-secondary/10"
          >
            <span className="material-symbols-outlined text-base sm:text-xl">add_circle</span>
            Add New SKU
          </button>
        </div>
      </header>

      {/* Metrics Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
        {[
          { label: "Total Active SKUs", value: items.length.toLocaleString(), change: `${items.filter((i) => i.status === "Healthy").length} healthy`, changeColor: "text-success", icon: "inventory", alert: false },
          { label: "Low Stock Alerts", value: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length.toString(), change: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 ? "Action Required" : "All clear", changeColor: "text-secondary", icon: "warning", alert: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 },
          { label: "Total Units", value: items.reduce((a, b) => a + b.stock, 0).toLocaleString(), change: `Across ${items.length} SKUs`, changeColor: "text-on-surface-variant", icon: "payments", alert: false },
        ].map((m) => (
          <div
            key={m.label}
            className={`p-4 sm:p-8 rounded-xl border flex flex-col justify-between transition-all group shadow-lg ${
              m.alert
                ? "bg-secondary/5 border-secondary/30 relative overflow-hidden"
                : "bg-primary-container border-white/10 hover:border-secondary/30"
            }`}
          >
            {m.alert && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[80px] -mr-16 -mt-16" />
            )}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className={`p-2 sm:p-3 rounded-lg ${m.alert ? "bg-secondary/20" : "bg-secondary/10"}`}>
                <span className="material-symbols-outlined text-secondary text-lg sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
              </div>
              {m.alert ? (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-secondary/10 rounded-pill border border-secondary/20">
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-secondary rounded-full animate-pulse" />
                  <span className="text-secondary font-bold text-[8px] sm:text-[10px] uppercase tracking-wider">{m.change}</span>
                </div>
              ) : (
                <span className={`font-bold text-[10px] sm:text-xs uppercase tracking-tighter ${m.changeColor} ${m.changeColor === "text-success" ? "bg-success/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded" : ""}`}>{m.change}</span>
              )}
            </div>
            <div>
              <p className="text-on-surface-variant text-[10px] sm:text-xs uppercase tracking-widest font-bold">{m.label}</p>
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-2 font-headline ${m.alert ? "text-secondary" : "text-on-surface"}`}>{m.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Inventory Table */}
      <section className="bg-primary-container border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-3 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 items-stretch sm:items-center justify-between bg-white/[0.03]">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg sm:text-xl">search</span>
            <input
              className="w-full bg-white/[0.05] border border-white/10/30 rounded-lg pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Search SKU or Product..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0">
            <span className="text-on-surface-variant font-bold text-[10px] sm:text-xs uppercase tracking-widest mr-1 sm:mr-2 shrink-0">Filter:</span>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-pill font-bold text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${activeFilter === f ? "bg-secondary text-on-secondary" : "border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/5"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-on-surface-variant border-b border-white/10">
                {["SKU ID", "Product Name", "Category", "Stock vs Threshold", "Status", "Actions"].map((h) => (
                   <th key={h} className={`px-3 sm:px-4 md:px-8 py-3 sm:py-5 font-bold text-[8px] sm:text-[10px] uppercase tracking-[0.15em] ${h === "Actions" ? "text-right" : ""} ${h === "Category" ? "hidden md:table-cell" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item, i) => {
                const pct = item.threshold > 0 ? Math.round((item.stock / item.threshold) * 100) : 0;
                const isLow = pct < 30;
                return (
                  <tr key={item.sku} className="hover:bg-on-surface/5 transition-colors group">
                    <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 font-mono text-[10px] sm:text-sm text-secondary font-bold">{item.sku}</td>
                    <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-5">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 border border-white/10">
                          <span className="material-symbols-outlined text-secondary text-base sm:text-xl md:text-2xl">{item.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-on-surface truncate">{item.name}</div>
                          <div className="text-[9px] sm:text-xs text-on-surface-variant truncate">{item.variant}</div>
                          <span className="md:hidden inline-block mt-0.5 px-1.5 py-0.5 rounded bg-white/[0.05] text-on-surface-variant text-[8px] sm:text-[10px] font-bold uppercase">{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-5 hidden md:table-cell">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-pill bg-white/[0.05] text-on-surface-variant text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-5 min-w-[120px] sm:min-w-48">
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-xs text-on-surface font-medium">{item.stock.toLocaleString()} / {item.threshold.toLocaleString()}</span>
                        <span className={`text-[8px] sm:text-[10px] font-bold ${isLow ? item.statusColor : "text-on-surface-variant"}`}>{pct}%</span>
                      </div>
                      <div className="h-1 sm:h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/10">
                        <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-3 sm:py-5">
                      <div className={`flex items-center gap-1 sm:gap-2 ${item.status === "Critical" ? `${item.statusColor} bg-secondary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-pill` : item.statusColor}`}>
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.barColor} ${item.status === "Critical" ? "animate-pulse" : ""}`} />
                        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-right">
                      <div className="flex justify-end gap-0.5 sm:gap-1 relative">
                        <button onClick={() => handleOpenEdit(i)} className="p-1.5 sm:p-2 text-on-surface-variant hover:text-secondary transition-colors rounded-lg hover:bg-white/[0.05]">
                          <span className="material-symbols-outlined text-base sm:text-xl">edit</span>
                        </button>
                        <button onClick={() => setShowMoreMenu(showMoreMenu === i ? null : i)} className="p-1.5 sm:p-2 text-on-surface-variant hover:text-secondary transition-colors rounded-lg hover:bg-white/[0.05]">
                          <span className="material-symbols-outlined text-base sm:text-xl">more_vert</span>
                        </button>
                        {showMoreMenu === i && (
                          <div className="absolute top-full right-0 mt-1 bg-primary-container border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden min-w-[140px] sm:min-w-[160px] animate-fadeIn">
                            <button onClick={() => handleOpenEdit(i)} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-base sm:text-lg">edit</span> Edit SKU
                            </button>
                            <button onClick={() => handleRestock(i)} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-base sm:text-lg">add_box</span> Restock
                            </button>
                            <button onClick={() => handleDelete(i)} className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-error hover:bg-surface-variant transition-colors flex items-center gap-2">
                              <span className="material-symbols-outlined text-base sm:text-lg">delete</span> Hapus
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

      {/* Add SKU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-5 sm:p-8 w-full max-w-md shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg sm:text-xl font-bold text-on-surface mb-4 sm:mb-6 font-headline">Tambah SKU Baru</h4>
            <div className="space-y-4">
              <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option>
                <option value="Hardware">Hardware</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Electronics">Electronics</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Stock</label>
                  <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Threshold</label>
                  <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-white/10 rounded-pill text-on-surface-variant font-bold text-sm hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Tambah</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit SKU Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-primary-container border border-white/10 rounded-2xl p-5 sm:p-8 w-full max-w-md shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg sm:text-xl font-bold text-on-surface mb-4 sm:mb-6 font-headline">Edit SKU</h4>
            <div className="space-y-4">
              <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/50" placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option>
                <option value="Hardware">Hardware</option>
                <option value="Fasteners">Fasteners</option>
                <option value="Electronics">Electronics</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Stock</label>
                  <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">Threshold</label>
                  <input className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-white/10 rounded-pill text-on-surface-variant font-bold text-sm hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-secondary text-on-secondary rounded-pill font-bold text-sm hover:brightness-110 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
