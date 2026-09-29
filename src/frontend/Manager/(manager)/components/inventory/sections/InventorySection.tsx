"use client";

import { useState, useEffect, useRef } from "react";
import * as styles from "../style";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi";
import { fetchInventoryData } from "@/frontend/Manager/(manager)/services/inventory";
import { statusFromStock } from "./helpers";
import { filters, defaultForm } from "./data";

interface InventoryItem {
  sku: string; name: string; variant: string; category: string; icon: string;
  stock: number; threshold: number; status: string; statusColor: string; barColor: string;
}

export default function InventorySection() {
  const { data: apiData } = useApi(fetchInventoryData, { interval: 30000 });
  const seeded = useRef(false);
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (apiData && !seeded.current) {
      seeded.current = true;
      setItems(
        apiData.items.map((item) => {
          const { statusColor, barColor } = statusFromStock(item.stock, item.threshold);
          return { ...item, statusColor, barColor };
        })
      );
    }
  }, [apiData]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filteredItems = items.filter((item) => {
    const matchFilter = activeFilter === "All Items" || item.category === activeFilter;
    const matchSearch = search === "" || item.sku.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAdd = () => {
    if (!form.sku || !form.name) return;
    const { status, statusColor, barColor } = statusFromStock(form.stock, form.threshold);
    setItems((prev) => [...prev, { ...form, status, statusColor, barColor }]);
    setShowAddModal(false);
    setForm(defaultForm);
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
    const { status, statusColor, barColor } = statusFromStock(form.stock, form.threshold);
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
    const { status, statusColor, barColor } = statusFromStock(newStock, item.threshold);
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <nav className={styles.breadcrumb}>
            <span>Manufacturing</span><span className={`${styles.iconFont} ${styles.breadcrumbChevron}`}>chevron_right</span><span className={styles.breadcrumbActive}>Inventory</span>
          </nav>
          <h2 className={`${styles.headline} ${styles.pageTitle}`}>Inventory Management</h2>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleExport} className={`${styles.pill} ${styles.exportButton}`}>
            <span className={`${styles.iconFont} ${styles.iconInline}`}>download</span> Export CSV
          </button>
          <button onClick={() => { setForm(defaultForm); setShowAddModal(true); }} className={`${styles.pill} ${styles.addButton}`}>
            <span className={`${styles.iconFont} ${styles.iconInline}`}>add_circle</span> Add New SKU
          </button>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        {[
          { label: "Total Active SKUs", value: items.length.toString(), change: `${items.filter((i) => i.status === "Healthy").length} healthy`, icon: "inventory", alert: false },
          { label: "Low Stock Alerts", value: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length.toString(), change: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 ? "Action Required" : "All clear", icon: "warning", alert: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length > 0 },
          { label: "Total Units", value: items.reduce((a, b) => a + b.stock, 0).toLocaleString(), change: `Across ${items.length} SKUs`, icon: "payments", alert: false },
        ].map((m, idx) => { const changeColors = [styles.changeHealthy, styles.changeAlert, styles.changeNeutral]; return (
          <div key={m.label} className={`${styles.metricCard} ${m.alert ? styles.metricAlertCard : styles.metricNormalCard}`}>
            {m.alert && <div className={styles.metricAlertGlow} />}
            <div className={styles.metricHeader}>
              <div className={`${styles.metricIconWrapper} ${m.alert ? styles.iconWrapperAlert : styles.iconWrapperNormal}`}>
                <span className={styles.metricIconFilled} style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
              </div>
              {m.alert ? (
                <div className={styles.alertBadgePill}>
                  <div className={styles.alertDot} />
                  <span className={styles.alertBadgeText}>{m.change}</span>
                </div>
              ) : <span className={`${styles.changeText} ${changeColors[idx]}`}>{m.change}</span>}
            </div>
            <div>
              <p className={styles.metricLabel}>{m.label}</p>
              <h3 className={`${styles.headline} ${styles.metricValue} ${m.alert ? styles.metricValueAlert : styles.metricValueNormal}`}>{m.value}</h3>
            </div>
          </div>
        )})}
      </section>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <div className={styles.searchWrapper}>
            <span className={`${styles.iconFont} ${styles.searchIcon}`}>search</span>
            <input className={styles.searchInput} placeholder="Search by SKU or Product Name..." type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>Filter:</span>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`${styles.pill} ${styles.filterButton} ${activeFilter === f ? styles.filterActive : styles.filterInactive}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                {["SKU ID", "Product Name", "Category", "Stock vs Threshold", "Status", "Actions"].map((h) => (
                  <th key={h} className={`${styles.tableHeadCell} ${h === "Actions" ? styles.tableHeadCellRight : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredItems.map((item, i) => {
                const pct = item.threshold > 0 ? Math.round((item.stock / item.threshold) * 100) : 0;
                return (
                  <tr key={item.sku} className={styles.tableRow}>
                    <td className={styles.skuCell}>{item.sku}</td>
                    <td className={styles.productCell}><div className={styles.productCellInner}>
                      <div className={styles.productIconBox}><span className={styles.productIconFont}>{item.icon}</span></div>
                      <div><div className={styles.productName}>{item.name}</div><div className={styles.productVariant}>{item.variant}</div></div>
                    </div></td>
                    <td className={styles.categoryCell}><span className={styles.categoryBadgePill}>{item.category}</span></td>
                    <td className={styles.stockCell}>
                      <div className={styles.stockCellInner}>
                        <span className={styles.stockLabel}>{item.stock.toLocaleString()} / {item.threshold.toLocaleString()} units</span>
                        <span className={`${styles.pctText} ${pct < 30 ? item.statusColor : styles.pctNormal}`}>{pct}%</span>
                      </div>
                      <div className={styles.progressTrack}><div className={`${styles.progressFill} ${item.barColor}`} style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                    </td>
                    <td className={styles.statusCell}><div className={`${styles.statusRow} ${item.status === "Critical" ? `${item.statusColor} ${styles.statusCriticalRow}` : item.statusColor}`}>
                      <div className={`${styles.statusDot} ${item.barColor} ${item.status === "Critical" ? styles.statusDotPulse : ""}`} />
                      <span className={styles.statusText}>{item.status}</span>
                    </div></td>
                    <td className={styles.actionCell}><div className={styles.actionButtons}>
                      <button onClick={() => handleOpenEdit(i)} className={styles.iconButton}><span className={`${styles.iconAction} ${styles.iconInline}`}>edit</span></button>
                      <button onClick={() => setShowMoreMenu(showMoreMenu === i ? null : i)} className={styles.iconButton}><span className={`${styles.iconAction} ${styles.iconInline}`}>more_vert</span></button>
                      {showMoreMenu === i && (
                        <div className={`${styles.moreMenuFade} ${styles.moreMenu}`}>
                          <button onClick={() => handleOpenEdit(i)} className={styles.menuItem}><span className={`${styles.iconAction} ${styles.iconMedium}`}>edit</span> Edit SKU</button>
                          <button onClick={() => handleRestock(i)} className={styles.menuItem}><span className={`${styles.iconAction} ${styles.iconMedium}`}>add_box</span> Restock</button>
                          <button onClick={() => handleDelete(i)} className={styles.menuItemDanger}><span className={`${styles.iconAction} ${styles.iconMedium}`}>delete</span> Hapus</button>
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
        <div className={`${styles.modalOverlayFade} ${styles.modalOverlay}`} onClick={() => setShowAddModal(false)}>
          <div className={`${styles.modalContentScale} ${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
            <h4 className={`${styles.headline} ${styles.modalTitle}`}>Tambah SKU Baru</h4>
            <div className={styles.formGroup}>
              <input className={styles.input} placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className={styles.input} placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.input} placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option><option value="Hardware">Hardware</option><option value="Fasteners">Fasteners</option><option value="Electronics">Electronics</option>
              </select>
              <div className={styles.formRow}>
                <div><label className={styles.formLabel}>Stock</label><input className={styles.inputPlain} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className={styles.formLabel}>Threshold</label><input className={styles.inputPlain} type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button onClick={() => setShowAddModal(false)} className={styles.cancelButtonPill}>Batal</button>
              <button onClick={handleAdd} className={styles.submitButtonPill}>Tambah</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={`${styles.modalOverlayFade} ${styles.modalOverlay}`} onClick={() => setShowEditModal(false)}>
          <div className={`${styles.modalContentScale} ${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
            <h4 className={`${styles.headline} ${styles.modalTitle}`}>Edit SKU</h4>
            <div className={styles.formGroup}>
              <input className={styles.input} placeholder="SKU ID" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className={styles.input} placeholder="Nama Produk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.input} placeholder="Varian / Deskripsi" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Extrusion">Extrusion</option><option value="Hardware">Hardware</option><option value="Fasteners">Fasteners</option><option value="Electronics">Electronics</option>
              </select>
              <div className={styles.formRow}>
                <div><label className={styles.formLabel}>Stock</label><input className={styles.inputPlain} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className={styles.formLabel}>Threshold</label><input className={styles.inputPlain} type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button onClick={() => setShowEditModal(false)} className={styles.cancelButtonPill}>Batal</button>
              <button onClick={handleSaveEdit} className={styles.submitButtonPill}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
