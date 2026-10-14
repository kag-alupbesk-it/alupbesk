"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gudangInventoryApi, productionRequestsApi, type InventorySnapshot } from "@/services/api/index";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";
import { useReadOnly } from "@/frontend/shared/access/AccessModeProvider";
import type {
  GudangInventoryItem,
  GudangInventoryItemInput,
} from "@/backend/modules/gudangInventory";
import type {
  InventoryInInput,
  InventoryOutInput,
  InventoryExportType,
} from "@/services/api/gudangInventory";
import { MasterStokTab } from "../MasterStokTab/MasterStokTab";
import { TransactionsTab } from "../TransactionsTab/TransactionsTab";
import { ProductionRequestsTab } from "../ProductionRequestsTab/ProductionRequestsTab";
import { ItemFormModal } from "../ItemFormModal/ItemFormModal";
import { TransactionModal, type TransactionFormResult } from "../TransactionModal/TransactionModal";
import { CategoryModal } from "../CategoryModal/CategoryModal";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import * as s from "../../style/style";
import ResponsiveRoleNavigation from "@/frontend/shared/navigation/ResponsiveRoleNavigation";
import { getRoleNavigationItems } from "@/frontend/shared/navigation/roleNavigation";
import { useSidebar } from "@/frontend/Manager/(gudang)/components/layout/SidebarProvider/SidebarProvider";
import { getRolePagePath } from "@/frontend/shared/navigation/getRolePagePath";

const EMPTY_SNAPSHOT: InventorySnapshot = {
  categories: [],
  items: [],
  inTransactions: [],
  outTransactions: [],
  productionRequests: [],
};

type TabKey = "master" | "masuk" | "keluar" | "permintaan";

const NAV_ITEMS = getRoleNavigationItems("gudang");

export function InventorySection() {
  const readOnly = useReadOnly();
  const pathname = getRolePagePath(usePathname());
  const isOwnerInventoryPage = pathname === "/owner/gudang";
  const { desktopOpen } = useSidebar();
  const loadSnapshot = useCallback(() => gudangInventoryApi.getSnapshot(), []);
  const { data, error: loadError, refresh } = usePollingResource<InventorySnapshot>(
    loadSnapshot,
    EMPTY_SNAPSHOT,
  );

  const [tab, setTab] = useState<TabKey>("master");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<GudangInventoryItem | null>(null);
  const [showCategory, setShowCategory] = useState(false);
  const [transactionMode, setTransactionMode] = useState<"in" | "out" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GudangInventoryItem | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const isTabKey = (key: string): key is TabKey =>
    key === "master" || key === "masuk" || key === "keluar" || key === "permintaan";
  const handleNavigationSelect = (key: string) => {
    if (isTabKey(key)) setTab(key);
  };

  const categoryNames = useMemo(
    () => new Map(data.categories.map((category) => [category.id, category.name])),
    [data.categories],
  );

  const totalStock = useMemo(
    () => data.items.reduce((sum, item) => sum + item.currentStock, 0),
    [data.items],
  );

  function reportError(reason: unknown, fallback: string) {
    setNotice("");
    setActionError(reason instanceof Error ? reason.message : fallback);
  }

  async function runAction(action: () => Promise<void>, fallback: string) {
    setActionError("");
    setBusy(true);
    try {
      await action();
      refresh();
    } catch (reason) {
      reportError(reason, fallback);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveItem(input: GudangInventoryItemInput) {
    await runAction(async () => {
      if (editItem) await gudangInventoryApi.updateItem(editItem.id, input);
      else await gudangInventoryApi.createItem(input);
      setShowItemForm(false);
      setEditItem(null);
      setNotice(editItem ? "Barang berhasil diperbarui." : "Barang berhasil ditambahkan.");
    }, "Barang gagal disimpan.");
  }

  async function handleSaveTransaction(result: TransactionFormResult) {
    await runAction(async () => {
      const item = result.item;
      if (result.type === "in") {
        const input: InventoryInInput = {
          ...item,
          transactionDate: result.transactionDate,
          quantity: result.quantity,
          createdBy: result.personInCharge,
        };
        await gudangInventoryApi.createIn(input);
        setNotice("Barang masuk berhasil dicatat.");
      } else {
        const input: InventoryOutInput = {
          ...item,
          transactionDate: result.transactionDate,
          quantity: result.quantity,
          projectName: result.projectName,
          createdBy: result.personInCharge,
        };
        await gudangInventoryApi.createOut(input);
        setNotice("Barang keluar berhasil dicatat.");
      }
      setTransactionMode(null);
    }, "Transaksi gagal disimpan.");
  }

  async function handleDeleteItem() {
    if (!deleteTarget) return;
    await runAction(async () => {
      await gudangInventoryApi.deleteItem(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Barang berhasil dihapus.");
    }, "Barang gagal dihapus.");
  }

  async function handleCreateCategory(name: string) {
    await runAction(async () => {
      await gudangInventoryApi.createCategory(name);
      setShowCategory(false);
      setNotice("Kategori berhasil ditambahkan.");
    }, "Kategori gagal disimpan.");
  }

  async function handleDecide(id: string, action: "approve" | "reject", reason?: string) {
    await runAction(async () => {
      await productionRequestsApi.decide(id, action, reason);
      setNotice(
        action === "approve"
          ? "Permintaan disetujui, stok terpotong dan tercatat sebagai barang keluar."
          : "Permintaan material ditolak.",
      );
    }, "Permintaan gagal diproses.");
  }

  async function handleImport(file: File) {
    await runAction(async () => {
      const summary = await gudangInventoryApi.importWorkbook(file);
      setNotice(
        `Import selesai: ${summary.itemsAdded} barang baru, ${summary.itemsUpdated} diperbarui, ` +
          `${summary.inAdded} barang masuk, ${summary.outAdded} barang keluar.`,
      );
    }, "Import gagal. Pastikan berkas .xlsx valid.");
    if (importInputRef.current) importInputRef.current.value = "";
  }

  function handleExport(type: InventoryExportType) {
    window.open(gudangInventoryApi.exportUrl(type), "_blank", "noopener");
  }

  const activeExportType: InventoryExportType =
    tab === "master" ? "items" : tab === "masuk" ? "in" : "out";

  return (
    <>
      {!isOwnerInventoryPage && (
        <ResponsiveRoleNavigation
          role="gudang"
          items={NAV_ITEMS}
          desktopOpen={desktopOpen}
          selectedKey={tab}
          onSelect={handleNavigationSelect}
        />
      )}
      <div className={s.container}>
        <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <h1 className={s.headerTitle}>Data Gudang Inventaris</h1>
            <p className={s.headerSubtitle}>
              Master stok, pencatatan barang masuk, dan barang keluar gudang ALUPBESK
            </p>
          </div>
          <div className={s.headerActions}>
            {!readOnly && (
              <>
                <button className={s.ghostButton} onClick={() => setShowCategory(true)} disabled={busy}>
                  <span className={s.buttonIcon}>category</span>
                  Kategori
                </button>
                <button
                  className={s.ghostButton}
                  onClick={() => importInputRef.current?.click()}
                  disabled={busy}
                >
                  <span className={s.buttonIcon}>upload</span>
                  Import
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleImport(file);
                  }}
                />
              </>
            )}
            <button className={s.ghostButton} onClick={() => handleExport(activeExportType)}>
              <span className={s.buttonIcon}>download</span>
              Export
            </button>
            </div>
          </div>

        <div className={s.metricsRow}>
          <MetricCard icon="inventory" label="Jenis Barang" value={data.items.length} />
          <MetricCard icon="inventory_2" label="Total Stok" value={totalStock} />
          <MetricCard icon="category" label="Kategori" value={data.categories.length} />
          <MetricCard
            icon="swap_vert"
            label="Transaksi"
            value={data.inTransactions.length + data.outTransactions.length}
          />
        </div>

        {isOwnerInventoryPage && (
          <div className={s.tabs}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`${s.tab} ${tab === item.key ? s.tabActive : s.tabInactive}`}
                onClick={() => handleNavigationSelect(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {(actionError || loadError) && (
          <p className={s.errorBanner}>{actionError || loadError}</p>
        )}
        {notice && !actionError && <p className={s.successBanner}>{notice}</p>}

        {tab === "master" && (
          <MasterStokTab
            items={data.items}
            categories={data.categories}
            categoryNames={categoryNames}
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            readOnly={readOnly}
            busy={busy}
            onAdd={() => {
              setEditItem(null);
              setShowItemForm(true);
            }}
            onCreateCategory={() => setShowCategory(true)}
            onEdit={(item) => {
              setEditItem(item);
              setShowItemForm(true);
            }}
            onDelete={setDeleteTarget}
            onRecordIn={() => setTransactionMode("in")}
            onRecordOut={() => setTransactionMode("out")}
          />
        )}

        {tab === "masuk" && (
          <TransactionsTab
            kind="in"
            inTransactions={data.inTransactions}
            outTransactions={data.outTransactions}
            search={search}
            onSearchChange={setSearch}
            readOnly={readOnly}
            onAdd={() => setTransactionMode("in")}
          />
        )}

        {tab === "keluar" && (
          <TransactionsTab
            kind="out"
            inTransactions={data.inTransactions}
            outTransactions={data.outTransactions}
            search={search}
            onSearchChange={setSearch}
            readOnly={readOnly}
            onAdd={() => setTransactionMode("out")}
          />
        )}

        {tab === "permintaan" && (
          <ProductionRequestsTab
            requests={data.productionRequests}
            items={data.items}
            search={search}
            onSearchChange={setSearch}
            readOnly={readOnly}
            busy={busy}
            onDecide={handleDecide}
          />
        )}
      </div>

      {showItemForm && (
        <ItemFormModal
          categories={data.categories}
          item={editItem}
          saving={busy}
          onClose={() => {
            setShowItemForm(false);
            setEditItem(null);
          }}
          onSubmit={handleSaveItem}
          onCreateCategory={() => setShowCategory(true)}
        />
      )}

      {transactionMode && (
        <TransactionModal
          mode={transactionMode}
          items={data.items}
          categories={data.categories}
          categoryNames={categoryNames}
          saving={busy}
          onClose={() => setTransactionMode(null)}
          onSubmit={handleSaveTransaction}
        />
      )}

      {showCategory && (
        <CategoryModal
          categories={data.categories}
          saving={busy}
          onClose={() => setShowCategory(false)}
          onSubmit={handleCreateCategory}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Hapus Barang"
          message={`Hapus "${deleteTarget.itemName}" beserta seluruh riwayat transaksinya? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          saving={busy}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteItem}
        />
      )}
    </div>
    </>
  );
}

function MetricCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className={s.metricCard}>
      <span className={s.metricIcon}>
        <span className={s.buttonIcon}>{icon}</span>
      </span>
      <div>
        <p className={s.metricLabel}>{label}</p>
        <p className={s.metricValue}>{value}</p>
      </div>
    </div>
  );
}
