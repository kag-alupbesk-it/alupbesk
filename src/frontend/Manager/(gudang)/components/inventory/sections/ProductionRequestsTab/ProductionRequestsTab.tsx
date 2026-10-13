"use client";

import { useMemo, useState } from "react";
import type {
  ProductionRequest,
  ProductionRequestItem,
} from "@/backend/modules/gudangInventory/productionRequests";
import type { GudangInventoryItem } from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

interface ProductionRequestsTabProps {
  requests: ProductionRequest[];
  items: GudangInventoryItem[];
  search: string;
  onSearchChange: (value: string) => void;
  readOnly: boolean;
  busy: boolean;
  onDecide: (id: string, action: "approve" | "reject", reason?: string) => Promise<void>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: ProductionRequest["status"]): string {
  if (status === "disetujui") return s.statusApproved;
  if (status === "ditolak") return s.statusRejected;
  return s.statusPending;
}

function statusLabel(status: ProductionRequest["status"]): string {
  if (status === "disetujui") return "Disetujui";
  if (status === "ditolak") return "Ditolak";
  return "Menunggu ACC";
}

export function ProductionRequestsTab({
  requests,
  items,
  search,
  onSearchChange,
  readOnly,
  busy,
  onDecide,
}: ProductionRequestsTabProps) {
  const [decision, setDecision] = useState<{
    request: ProductionRequest;
    action: "approve" | "reject";
  } | null>(null);
  const [reason, setReason] = useState("");

  const stockByItem = useMemo(
    () => new Map(items.map((item) => [item.id, item.currentStock])),
    [items],
  );

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...requests].sort((left, right) => {
      const leftPending = left.status === "diajukan" ? 0 : 1;
      const rightPending = right.status === "diajukan" ? 0 : 1;
      if (leftPending !== rightPending) return leftPending - rightPending;
      return right.updatedAt.localeCompare(left.updatedAt);
    });
    if (!query) return sorted;
    return sorted.filter((request) => {
      const haystack = [
        request.spkRef,
        request.spkLabel,
        request.requesterName,
        request.note,
        ...request.items.map((item) => `${item.itemName} ${item.modelNo} ${item.brand}`),
      ];
      return haystack.join(" ").toLowerCase().includes(query);
    });
  }, [requests, search]);

  const pendingCount = requests.filter((request) => request.status === "diajukan").length;

  function closeDecision() {
    setDecision(null);
    setReason("");
  }

  async function confirmDecision() {
    if (!decision) return;
    await onDecide(decision.request.id, decision.action, reason.trim());
    closeDecision();
  }

  function availability(item: ProductionRequestItem): number | null {
    if (!item.itemId) return null;
    return stockByItem.get(item.itemId) ?? null;
  }

  return (
    <div>
      <div className={s.tableToolbar}>
        <div className={s.searchWrapper}>
          <span className={s.searchIcon}>search</span>
          <input
            className={s.searchInput}
            placeholder="Cari SPK, pemohon, atau barang..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <span className={s.footerText}>
          <span className="font-bold text-secondary">{pendingCount}</span> menunggu ACC
        </span>
      </div>

      {rows.length === 0 ? (
        <div className={s.tableCard}>
          <p className={s.emptyCell}>Belum ada permintaan material dari divisi produksi.</p>
        </div>
      ) : (
        <div className={s.requestList}>
          {rows.map((request) => (
            <article key={request.id} className={s.requestCard}>
              <div className={s.requestCardHeader}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={s.requestTitle}>
                      {request.spkLabel || request.spkRef || "Tanpa SPK"}
                    </h3>
                    <span className={statusBadgeClass(request.status)}>
                      {statusLabel(request.status)}
                    </span>
                  </div>
                  <p className={s.requestMeta}>
                    {request.spkRef ? `SPK ${request.spkRef} · ` : ""}
                    Pemohon {request.requesterName || "-"} · Diajukan{" "}
                    {formatDate(request.requestDate)}
                  </p>
                </div>
                {!readOnly && request.status === "diajukan" && (
                  <div className={s.requestActions}>
                    <button
                      className={s.approveButton}
                      disabled={busy}
                      onClick={() => {
                        setReason("");
                        setDecision({ request, action: "approve" });
                      }}
                    >
                      <span className={s.buttonIcon}>check_circle</span>
                      Setujui
                    </button>
                    <button
                      className={s.rejectButton}
                      disabled={busy}
                      onClick={() => {
                        setReason("");
                        setDecision({ request, action: "reject" });
                      }}
                    >
                      <span className={s.buttonIcon}>cancel</span>
                      Tolak
                    </button>
                  </div>
                )}
              </div>

              {request.note && <p className={s.requestNote}>Catatan: {request.note}</p>}
              {request.status === "ditolak" && request.rejectReason && (
                <p className={s.requestNote}>Alasan ditolak: {request.rejectReason}</p>
              )}
              {request.status !== "diajukan" && (
                <p className={s.requestNote}>
                  {statusLabel(request.status)} oleh {request.approvedBy || "-"} pada{" "}
                  {formatDateTime(request.approvedAt)}
                </p>
              )}

              <div className={s.tableWrapper}>
                <table className={s.table}>
                  <thead className={s.tableHead}>
                    <tr>
                      <th className={s.th}>Nama Barang</th>
                      <th className={s.th}>Kategori</th>
                      <th className={s.th}>Merek</th>
                      <th className={s.th}>No. Model</th>
                      <th className={s.th}>Warna</th>
                      <th className={s.th}>Lokasi Rak</th>
                      <th className={s.thRight}>Diminta</th>
                      {request.status === "diajukan" && <th className={s.thRight}>Stok</th>}
                    </tr>
                  </thead>
                  <tbody className={s.tbody}>
                    {request.items.map((item) => {
                      const stock = availability(item);
                      const shortage =
                        request.status === "diajukan" &&
                        (stock === null || stock < item.quantity);
                      return (
                        <tr key={item.id} className={s.row}>
                          <td className={s.td}>
                            <div className={s.nameText}>{item.itemName || "-"}</div>
                          </td>
                          <td className={s.td}>
                            <span className={s.categoryBadge}>{item.categoryName || "-"}</span>
                          </td>
                          <td className={s.td}>
                            <span className={s.badge}>{item.brand || "-"}</span>
                          </td>
                          <td className={s.td}>
                            <span className={s.modelText}>{item.modelNo || "-"}</span>
                          </td>
                          <td className={s.td}>
                            <span className={s.subText}>{item.color || "-"}</span>
                          </td>
                          <td className={s.td}>
                            <span className={s.nameText}>
                              {item.rackGroup || "-"}
                              {item.subRow ? ` · Baris ${item.subRow}` : ""}
                            </span>
                          </td>
                          <td className={s.tdRight}>
                            <span className={s.stockText}>{item.quantity}</span>
                          </td>
                          {request.status === "diajukan" && (
                            <td className={s.tdRight}>
                              <span className={shortage ? s.stockLow : s.nameText}>
                                {stock === null ? "Tidak tersedia" : stock}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}

      {decision && (
        <div className={s.modalBackdrop} onClick={(event) => {
          if (event.target === event.currentTarget) closeDecision();
        }}>
          <div className={s.modalContent}>
            <div className={s.modalHeader}>
              <div>
                <h2 className={s.modalTitle}>
                  {decision.action === "approve" ? "Setujui Permintaan" : "Tolak Permintaan"}
                </h2>
                <p className={s.modalSubtitle}>
                  {decision.request.spkLabel || decision.request.spkRef}
                </p>
              </div>
              <button className={s.modalCloseButton} onClick={closeDecision}>
                <span className={s.closeIcon}>close</span>
              </button>
            </div>

            {decision.action === "approve" ? (
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Menyetujui akan memotong stok untuk {decision.request.items.length} jenis
                barang dan mencatatnya sebagai barang keluar. Pastikan stok mencukupi.
              </p>
            ) : (
              <div className={s.formGroup}>
                <div>
                  <label className={s.formLabel}>Alasan Penolakan</label>
                  <textarea
                    className={s.textarea}
                    rows={3}
                    value={reason}
                    placeholder="Tulis alasan penolakan..."
                    onChange={(event) => setReason(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div className={s.modalFooter}>
              <button className={s.cancelButton} onClick={closeDecision}>
                Batal
              </button>
              <button
                className={decision.action === "approve" ? s.saveButton : s.dangerButton}
                onClick={() => void confirmDecision()}
                disabled={busy}
              >
                {busy
                  ? "Memproses..."
                  : decision.action === "approve"
                    ? "Setujui"
                    : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
