"use client";

import { useMemo, useState } from "react";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/(owner)/hooks/useApi/useApi";
import { fetchInventoryData } from "@/frontend/(owner)/services/inventory/inventory";
import { statusFromStock } from "../helpers/helpers";
import { filters } from "../data/data";

interface InventoryItem {
  sku: string; name: string; variant: string; category: string; icon: string;
  stock: number; threshold: number; status: string; statusColor: string; barColor: string;
}

export default function InventorySection() {
  const { data: apiData } = useApi(fetchInventoryData, { interval: 30000 });
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [search, setSearch] = useState("");
  const items = useMemo<InventoryItem[]>(() => (apiData?.items ?? []).map((item) => ({
    ...item,
    ...statusFromStock(item.stock, item.threshold),
  })), [apiData]);

  const filteredItems = items.filter((item) => {
    const matchFilter = activeFilter === "All Items" || item.category === activeFilter;
    const matchSearch = search === "" || item.sku.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

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
                {["SKU ID", "Product Name", "Category", "Stock vs Threshold", "Status"].map((h) => (
                  <th key={h} className={styles.tableHeadCell}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredItems.map((item) => {
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
