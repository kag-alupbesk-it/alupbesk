"use client";

import { useMemo, useState } from "react";
import * as styles from "../../style/style";
import { useApi } from "@/frontend/Manager/(manager)/hooks/useApi/useApi";
import { fetchInventoryData } from "@/frontend/Manager/(manager)/services/inventory/inventory";
import { gudangApi } from "@/services/api/index";
import { statusFromStock } from "../helpers/helpers";
import { filters, defaultForm } from "../data/data";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";
import type { MessageKey } from "@/frontend/shared/i18n/translations";

const inventoryStatusKeys: Record<string, MessageKey> = {
  Healthy: "managerInventoryHealthy",
  Critical: "managerInventoryCritical",
  "Out of Stock": "managerInventoryOutOfStock",
};

const categoryLabelKeys: Record<string, MessageKey> = {
  "All Items": "managerAllItems",
  Hardware: "managerHardware",
  Proyek: "managerProjectCategory",
};

interface InventoryItem {
  id: string; sku: string; name: string; variant: string; category: string; icon: string;
  stock: number; threshold: number; status: string; statusColor: string; barColor: string;
}

export default function InventorySection() {
  const { language, t } = useLanguage();
  const { data: apiData, refetch } = useApi(fetchInventoryData, { interval: 30000 });
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [search, setSearch] = useState("");
  const items = useMemo<InventoryItem[]>(() => (apiData?.items ?? []).map((item) => ({
    ...item,
    ...statusFromStock(item.stock, item.threshold),
  })), [apiData]);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const statusLabel = (status: string) => {
    const key = inventoryStatusKeys[status];
    return key ? t(key) : status;
  };
  const categoryLabel = (category: string) => {
    const key = categoryLabelKeys[category];
    return key ? t(key) : category;
  };

  const filteredItems = items.filter((item) => {
    const matchFilter = activeFilter === "All Items" || item.category === activeFilter;
    const matchSearch = search === "" || item.sku.toLowerCase().includes(search.toLowerCase()) || item.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const reloadInventory = async () => {
    await refetch();
  };

  const handleAdd = async () => {
    if (!form.sku || !form.name) return;
    setError("");
    try {
      await gudangApi.createItem({
        sku: form.sku,
        jenisBarang: form.name,
        kategoriBarang: form.category === "Proyek" ? "proyek" : "eceran",
        satuan: "pcs",
        merek: "",
        warna: form.variant,
        seksiLokasi: "Gudang Utama",
        stokAwal: form.stock,
        minStok: form.threshold,
        catatan: form.variant,
      });
      await reloadInventory();
      setShowAddModal(false);
      setForm(defaultForm);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("managerInventoryAddFailed"));
    }
  };

  const handleOpenEdit = (idx: number) => {
    const item = filteredItems[idx];
    setEditingIdx(items.indexOf(item));
    setForm({ sku: item.sku, name: item.name, variant: item.variant, category: item.category, icon: item.icon, stock: item.stock, threshold: item.threshold });
    setShowEditModal(true);
    setShowMoreMenu(null);
  };

  const handleSaveEdit = async () => {
    if (editingIdx === null) return;
    const item = items[editingIdx];
    if (!item) return;
    setError("");
    try {
      await gudangApi.updateStock(item.id, { stok: form.stock, minStok: form.threshold });
      await reloadInventory();
      setShowEditModal(false);
      setEditingIdx(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("managerInventoryUpdateFailed"));
    }
  };

  const handleDelete = async (idx: number) => {
    const item = filteredItems[idx];
    if (!confirm(t("managerDeleteInventoryItem").replace("{name}", item.name))) return;
    setError("");
    try {
      await gudangApi.deleteItem(item.id);
      await reloadInventory();
      setShowMoreMenu(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("managerInventoryDeleteFailed"));
    }
  };

  const handleRestock = async (idx: number) => {
    const item = filteredItems[idx];
    setError("");
    try {
      await gudangApi.recordMasuk(item.id, {
        jumlah: Math.max(1, item.threshold),
        tanggal: new Date().toISOString().slice(0, 10),
        sumber: "Restock Manajer",
        catatan: "Restock dari halaman Manager",
      });
      await reloadInventory();
      setShowMoreMenu(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("managerInventoryRestockFailed"));
    }
  };

  const handleExport = () => {
    const header = `${t("managerSkuId")},${t("managerProductName")},${t("managerCategory")},${t("managerStock")},${t("managerThreshold")},${t("managerStatus")}\n`;
    const rows = items.map((i) => `${i.sku},${i.name},${categoryLabel(i.category)},${i.stock},${i.threshold},${statusLabel(i.status)}`).join("\n");
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
            <span>{t("managerManufacturing")}</span><span className={`${styles.iconFont} ${styles.breadcrumbChevron}`}>chevron_right</span><span className={styles.breadcrumbActive}>{t("inventory")}</span>
          </nav>
          <h2 className={`${styles.headline} ${styles.pageTitle}`}>{t("managerInventoryTitle")}</h2>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleExport} className={`${styles.pill} ${styles.exportButton}`}>
            <span className={`${styles.iconFont} ${styles.iconInline}`}>download</span> {t("managerExportCsv")}
          </button>
          <button onClick={() => { setForm(defaultForm); setShowAddModal(true); }} className={`${styles.pill} ${styles.addButton}`}>
            <span className={`${styles.iconFont} ${styles.iconInline}`}>add_circle</span> {t("managerAddSku")}
          </button>
        </div>
      </header>

      {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}

      <section className={styles.metricsGrid}>
        {[
          { label: "managerTotalActiveSkus" as const, value: items.length.toString(), change: t("managerHealthyCount").replace("{count}", String(items.filter((i) => i.status === "Healthy").length)), icon: "inventory", alert: false },
          { label: "managerLowStockAlerts" as const, value: items.filter((i) => i.status === "Critical" || i.status === "Out of Stock").length.toString(), change: items.some((i) => i.status === "Critical" || i.status === "Out of Stock") ? t("managerActionRequired") : t("managerAllClearStatus"), icon: "warning", alert: items.some((i) => i.status === "Critical" || i.status === "Out of Stock") },
          { label: "managerTotalUnits" as const, value: items.reduce((a, b) => a + b.stock, 0).toLocaleString(language === "en" ? "en-US" : "id-ID"), change: t("managerAcrossSkus").replace("{count}", String(items.length)), icon: "payments", alert: false },
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
              <p className={styles.metricLabel}>{t(m.label)}</p>
              <h3 className={`${styles.headline} ${styles.metricValue} ${m.alert ? styles.metricValueAlert : styles.metricValueNormal}`}>{m.value}</h3>
            </div>
          </div>
        )})}
      </section>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <div className={styles.searchWrapper}>
            <span className={`${styles.iconFont} ${styles.searchIcon}`}>search</span>
            <input className={styles.searchInput} placeholder={t("managerInventorySearch")} type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>{t("managerFilter")}:</span>
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`${styles.pill} ${styles.filterButton} ${activeFilter === f ? styles.filterActive : styles.filterInactive}`}>{categoryLabel(f)}</button>
            ))}
          </div>
        </div>
        <div className={styles.mobileList}>
          {filteredItems.length === 0 && (
            <div className={`${styles.card} py-10 text-center text-xs text-on-surface-variant`}>
              {t("managerNoMatchingSkus")}
            </div>
          )}
          {filteredItems.map((item, i) => {
            const pct = item.threshold > 0 ? Math.round((item.stock / item.threshold) * 100) : 0;
            return (
              <div key={item.sku} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={styles.productIconBox}><span className={styles.productIconFont}>{item.icon}</span></div>
                    <div className="min-w-0">
                      <div className={`${styles.productName} truncate`}>{item.name}</div>
                      <div className={`${styles.productVariant} truncate`}>{item.variant}</div>
                    </div>
                  </div>
                  <div className={`${styles.statusRow} shrink-0 ${item.status === "Critical" ? `${item.statusColor} ${styles.statusCriticalRow}` : item.statusColor}`}>
                    <div className={`${styles.statusDot} ${item.barColor} ${item.status === "Critical" ? styles.statusDotPulse : ""}`} />
                    <span className={styles.statusText}>{statusLabel(item.status)}</span>
                  </div>
                </div>
                <div className={styles.cardInfo}>
                  <div className="font-mono font-bold text-secondary">{item.sku}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("managerCategory")}</span>
                    <span className={styles.categoryBadgePill}>{categoryLabel(item.category)}</span>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.stockLabel}>
                    {item.stock.toLocaleString(language === "en" ? "en-US" : "id-ID")} / {item.threshold.toLocaleString(language === "en" ? "en-US" : "id-ID")} {t("managerUnits")}
                  </span>
                  <span className={`${styles.pctText} ${pct < 30 ? item.statusColor : styles.pctNormal}`}>{pct}%</span>
                </div>
                <div className={`${styles.progressTrack} mt-2`}>
                  <div className={`${styles.progressFill} ${item.barColor}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                </div>
                <div className={`${styles.cardActions} gap-2`}>
                  <button aria-label={t("edit")} onClick={() => handleOpenEdit(i)} className={`${styles.iconButton} w-full`}><span className={`${styles.iconAction} ${styles.iconInline}`}>edit</span></button>
                  <button aria-label={t("commonMoreActions")} onClick={() => setShowMoreMenu(showMoreMenu === i ? null : i)} className={`${styles.iconButton} w-full`}><span className={`${styles.iconAction} ${styles.iconInline}`}>more_vert</span></button>
                </div>
                {showMoreMenu === i && (
                  <div className={`${styles.moreMenuFade} mt-2 space-y-1`}>
                    <button onClick={() => handleOpenEdit(i)} className={`${styles.menuItem} min-h-11 rounded-lg bg-surface-variant/40`}><span className={`${styles.iconAction} ${styles.iconMedium}`}>edit</span> {t("managerEditSku")}</button>
                    <button onClick={() => handleRestock(i)} className={`${styles.menuItem} min-h-11 rounded-lg bg-surface-variant/40`}><span className={`${styles.iconAction} ${styles.iconMedium}`}>add_box</span> {t("managerRestock")}</button>
                    <button onClick={() => handleDelete(i)} className={`${styles.menuItemDanger} min-h-11 rounded-lg bg-surface-variant/40`}><span className={`${styles.iconAction} ${styles.iconMedium}`}>delete</span> {t("delete")}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={`${styles.tableScroll} ${styles.desktopOnly}`}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                {[
                  ["managerSkuId", t("managerSkuId")],
                  ["managerProductName", t("managerProductName")],
                  ["managerCategory", t("managerCategory")],
                  ["managerStockVsThreshold", t("managerStockVsThreshold")],
                  ["managerStatus", t("managerStatus")],
                  ["managerActions", t("managerActions")],
                ].map(([key, label]) => (
                  <th key={key} className={`${styles.tableHeadCell} ${key === "managerActions" ? styles.tableHeadCellRight : ""}`}>{label}</th>
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
                        <span className={styles.stockLabel}>{item.stock.toLocaleString(language === "en" ? "en-US" : "id-ID")} / {item.threshold.toLocaleString(language === "en" ? "en-US" : "id-ID")} {t("managerUnits")}</span>
                        <span className={`${styles.pctText} ${pct < 30 ? item.statusColor : styles.pctNormal}`}>{pct}%</span>
                      </div>
                      <div className={styles.progressTrack}><div className={`${styles.progressFill} ${item.barColor}`} style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                    </td>
                    <td className={styles.statusCell}><div className={`${styles.statusRow} ${item.status === "Critical" ? `${item.statusColor} ${styles.statusCriticalRow}` : item.statusColor}`}>
                      <div className={`${styles.statusDot} ${item.barColor} ${item.status === "Critical" ? styles.statusDotPulse : ""}`} />
                      <span className={styles.statusText}>{statusLabel(item.status)}</span>
                    </div></td>
                    <td className={styles.actionCell}><div className={styles.actionButtons}>
                      <button aria-label={t("edit")} onClick={() => handleOpenEdit(i)} className={styles.iconButton}><span className={`${styles.iconAction} ${styles.iconInline}`}>edit</span></button>
                      <button aria-label={t("commonMoreActions")} onClick={() => setShowMoreMenu(showMoreMenu === i ? null : i)} className={styles.iconButton}><span className={`${styles.iconAction} ${styles.iconInline}`}>more_vert</span></button>
                      {showMoreMenu === i && (
                        <div className={`${styles.moreMenuFade} ${styles.moreMenu}`}>
                          <button onClick={() => handleOpenEdit(i)} className={styles.menuItem}><span className={`${styles.iconAction} ${styles.iconMedium}`}>edit</span> {t("managerEditSku")}</button>
                          <button onClick={() => handleRestock(i)} className={styles.menuItem}><span className={`${styles.iconAction} ${styles.iconMedium}`}>add_box</span> {t("managerRestock")}</button>
                          <button onClick={() => handleDelete(i)} className={styles.menuItemDanger}><span className={`${styles.iconAction} ${styles.iconMedium}`}>delete</span> {t("delete")}</button>
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
            <h4 className={`${styles.headline} ${styles.modalTitle}`}>{t("managerAddSkuTitle")}</h4>
            <div className={styles.formGroup}>
              <input className={styles.input} placeholder={t("managerSkuId")} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              <input className={styles.input} placeholder={t("managerProductName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={styles.input} placeholder={t("managerVariantDescription")} value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} />
              <select className={styles.select} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Hardware">{t("managerHardware")}</option><option value="Proyek">{t("managerProjectCategory")}</option>
              </select>
              <div className={styles.formRow}>
                <div><label className={styles.formLabel}>{t("managerStock")}</label><input className={styles.inputPlain} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className={styles.formLabel}>{t("managerThreshold")}</label><input className={styles.inputPlain} type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button onClick={() => setShowAddModal(false)} className={styles.cancelButtonPill}>{t("managerCancel")}</button>
              <button onClick={() => void handleAdd()} className={styles.submitButtonPill}>{t("managerAdd")}</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className={`${styles.modalOverlayFade} ${styles.modalOverlay}`} onClick={() => setShowEditModal(false)}>
          <div className={`${styles.modalContentScale} ${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
            <h4 className={`${styles.headline} ${styles.modalTitle}`}>{t("managerEditSkuTitle")}</h4>
            <div className={styles.formGroup}>
              <input className={styles.input} placeholder={t("managerSkuId")} value={form.sku} readOnly />
              <input className={styles.input} placeholder={t("managerProductName")} value={form.name} readOnly />
              <input className={styles.input} placeholder={t("managerVariantDescription")} value={form.variant} readOnly />
              <select className={styles.select} value={form.category} disabled>
                <option value="Hardware">{t("managerHardware")}</option><option value="Proyek">{t("managerProjectCategory")}</option>
              </select>
              <div className={styles.formRow}>
                <div><label className={styles.formLabel}>{t("managerStock")}</label><input className={styles.inputPlain} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className={styles.formLabel}>{t("managerThreshold")}</label><input className={styles.inputPlain} type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></div>
              </div>
            </div>
            <div className={styles.formActions}>
              <button onClick={() => setShowEditModal(false)} className={styles.cancelButtonPill}>{t("managerCancel")}</button>
              <button onClick={() => void handleSaveEdit()} className={styles.submitButtonPill}>{t("managerSave")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
