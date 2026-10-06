"use client";

import { useMemo, useState } from "react";
import { useFinance, type InvoiceRingkas } from "./FinanceStore";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { StatusBadge } from "./ui/StatusBadge";
import { InvoicePreviewModal } from "./InvoicePreviewModal";
import { formatRp, formatTanggal } from "./format";
import type { StatusInvoice } from "./types";
import * as s from "./style";

const TONE_STATUS: Record<StatusInvoice, "pending" | "approved" | "overdue"> = {
  dp: "pending",
  lunas: "approved",
  overdue: "overdue",
};

const LABEL_STATUS: Record<StatusInvoice, string> = {
  dp: "DP Terbayar",
  lunas: "Lunas",
  overdue: "Overdue",
};

const IKON_STATUS: Record<StatusInvoice, string> = {
  dp: "payments",
  lunas: "check_circle",
  overdue: "warning",
};

export function TerminSection() {
  const { state, invoiceRingkas, lunasTermin, clearToast } = useFinance();
  const [filterStatus, setFilterStatus] = useState<"all" | StatusInvoice>("all");
  const [cari, setCari] = useState("");
  const [preview, setPreview] = useState<InvoiceRingkas | null>(null);

  const daftar = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return invoiceRingkas.filter((item) => {
      const cocokStatus = filterStatus === "all" || item.status === filterStatus;
      const cocokCari =
        !query ||
        `${item.invoice.nomor} ${item.invoice.nama} ${item.invoice.proyek} ${item.invoice.posProyek}`
          .toLowerCase()
          .includes(query);
      return cocokStatus && cocokCari;
    });
  }, [invoiceRingkas, filterStatus, cari]);

  const totalTagihan = invoiceRingkas.reduce((sum, item) => sum + item.totalTagihan, 0);
  const totalTerbayar = invoiceRingkas.reduce((sum, item) => sum + item.terbayar, 0);
  const totalSisa = invoiceRingkas.reduce((sum, item) => sum + item.sisaTagihan, 0);
  const overdue = invoiceRingkas.filter((item) => item.status === "overdue");

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label="Total Tagihan"
          value={formatRp(totalTagihan)}
          icon="receipt_long"
          trend={`${invoiceRingkas.length} invoice aktif`}
          tone="gold"
        />
        <FinancialStatCard
          label="Terbayar"
          value={formatRp(totalTerbayar)}
          icon="paid"
          trend="Termin yang sudah lunas"
          tone="success"
        />
        <FinancialStatCard
          label="Sisa Tagihan"
          value={formatRp(totalSisa)}
          icon="pending_actions"
          trend={`${invoiceRingkas.filter((item) => item.status === "dp").length} invoice masih DP`}
          tone="error"
        />
        <FinancialStatCard
          label="Overdue"
          value={String(overdue.length)}
          icon="warning"
          trend={overdue[0] ? `Terlambat: ${overdue[0].invoice.nama}` : "Tidak ada invoice terlambat"}
          tone="neutral"
        />
      </div>

      <section className={s.card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={s.sectionTitle}>Termin & Tagihan Invoice</h2>
            <p className={s.sectionSubtitle}>
              Status DP, lunas, atau overdue berdasarkan termin yang jatuh tempo. Buka preview untuk mencetak invoice.
            </p>
          </div>
          <span className={s.dataCounter}>
            {daftar.length} dari {invoiceRingkas.length} invoice
          </span>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
          <label className="sr-only" htmlFor="termin-cari">
            Cari invoice
          </label>
          <input
            id="termin-cari"
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari nomor invoice, nama, atau proyek..."
            className={s.searchInput}
          />
          <label className="sr-only" htmlFor="termin-filter-status">
            Filter status invoice
          </label>
          <select
            id="termin-filter-status"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as "all" | StatusInvoice)}
            className={s.filterSelect}
          >
            <option value="all">Semua status</option>
            <option value="dp">DP Terbayar</option>
            <option value="lunas">Lunas</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className={`mt-4 ${s.tableWrap}`}>
          <table className={`${s.table} min-w-[1180px]`}>
            <thead className={s.tableHead}>
              <tr>
                <th scope="col" className={s.th}>
                  No. Invoice
                </th>
                <th scope="col" className={s.th}>
                  Nama Kontraktor/Toko
                </th>
                <th scope="col" className={s.th}>
                  Proyek
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Total Tagihan
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Terbayar DP
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Sisa Tagihan
                </th>
                <th scope="col" className={s.th}>
                  Jatuh Tempo
                </th>
                <th scope="col" className={s.th}>
                  Status
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((item) => (
                <tr key={item.invoice.id} className={s.tr}>
                  <td className={s.tdStrong}>
                    <p>{item.invoice.nomor}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {formatTanggal(item.invoice.tanggal)} · {item.invoice.pihak}
                    </p>
                  </td>
                  <td className={s.tdStrong}>{item.invoice.nama}</td>
                  <td className={s.tdMuted}>
                    <p>{item.invoice.proyek}</p>
                    <p className={`${s.metaText} mt-0.5`}>{item.invoice.posProyek}</p>
                  </td>
                  <td className={`${s.td} ${s.amountStrong} text-on-surface`}>{formatRp(item.totalTagihan)}</td>
                  <td className={`${s.td} text-right text-success`}>{formatRp(item.terbayarDp)}</td>
                  <td className={`${s.td} ${s.amountStrong} text-error`}>{formatRp(item.sisaTagihan)}</td>
                  <td className={s.tdMuted}>{formatTanggal(item.jatuhTempo)}</td>
                  <td className={s.td}>
                    <StatusBadge tone={TONE_STATUS[item.status]} label={LABEL_STATUS[item.status]} icon={IKON_STATUS[item.status]} />
                  </td>
                  <td className={`${s.td} text-right`}>
                    <div className={s.actionGroup}>
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        aria-label={`Preview invoice ${item.invoice.nomor}`}
                        className={s.ghostButton}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          visibility
                        </span>
                        Preview
                      </button>
                      {item.terminBerikutnya && (
                        <button
                          type="button"
                          onClick={() => lunasTermin(item.invoice.id, item.terminBerikutnya.id)}
                          aria-label={`Tandai lunas ${item.terminBerikutnya.label} invoice ${item.invoice.nomor}`}
                          title={`Catat ${item.terminBerikutnya.label} sebagai Kas Masuk`}
                          className={s.actionButton}
                        >
                          <span aria-hidden="true" className={s.iconSm}>
                            paid
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {daftar.length === 0 && (
                <tr>
                  <td colSpan={9} className={s.emptyRow}>
                    Tidak ada invoice yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {preview && <InvoicePreviewModal data={preview} onTutup={() => setPreview(null)} />}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}