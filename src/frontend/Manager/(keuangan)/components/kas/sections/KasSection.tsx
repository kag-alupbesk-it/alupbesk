"use client";

import { useState } from "react";
import { useApi } from "@/frontend/Manager/(keuangan)/hooks/useApi";
import { fetchKas, createKasEntry, updateKasEntry, deleteKasEntry } from "@/frontend/Manager/(keuangan)/services/kas";
import type { KasEntry, KasEntryInput, KasTipe, KasKategori } from "./types";
import { formatRp, formatTanggal, combineEntries, kategoriBadge } from "./helpers";
import * as s from "../style";
import { TransaksiFormModal } from "./TransaksiFormModal";

const KATEGORI_LABELS: Record<KasKategori, string> = {
  eceran: "Eceran",
  proyek: "Proyek",
  operasional: "Operasional",
};

function KasActions({
  entry,
  onEdit,
  onDelete,
  full = false,
}: {
  entry: KasEntry;
  onEdit: (entry: KasEntry) => void;
  onDelete: (entry: KasEntry) => void;
  full?: boolean;
}) {
  const extra = full ? " w-full" : "";
  return (
    <div className="flex items-center gap-1.5">
      <button className={`${s.actionButton}${extra}`} onClick={() => onEdit(entry)} title="Ubah">
        <span className="material-symbols-outlined text-[16px]">edit</span>
        {full && <span>Ubah</span>}
      </button>
      <button className={`${s.actionButtonDanger}${extra}`} onClick={() => onDelete(entry)} title="Hapus">
        <span className="material-symbols-outlined text-[16px]">delete</span>
        {full && <span>Hapus</span>}
      </button>
    </div>
  );
}

export function KasSection() {
  const { data: kas, error, refetch } = useApi(fetchKas, { interval: 30000 });
  const [errorMsg, setErrorMsg] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const [tipe, setTipe] = useState<KasTipe>("keluar");
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [kategori, setKategori] = useState<KasKategori>("operasional");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<KasEntry | null>(null);
  const [deleting, setDeleting] = useState<KasEntry | null>(null);
  const [pending, setPending] = useState(false);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 5000);
  };

  const selectTipe = (next: KasTipe) => {
    setTipe(next);
    setKategori(next === "masuk" ? "eceran" : "operasional");
  };

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");
    setSaving(true);
    try {
      const entry = await createKasEntry({
        tipe,
        deskripsi,
        jumlah: Number(jumlah),
        kategori,
        tanggal: new Date().toISOString().slice(0, 10),
      });
      flash(`Transaksi ${entry.tipe === "masuk" ? "masuk" : "keluar"} dicatat.`);
      setDeskripsi("");
      setJumlah("");
      refetch();
    } catch (reason) {
      setErrorMsg(reason instanceof Error ? reason.message : "Gagal mencatat transaksi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(input: KasEntryInput) {
    if (!editing) return;
    await updateKasEntry(editing.id, input);
    flash("Transaksi kas diperbarui.");
    refetch();
  }

  async function handleDelete() {
    if (!deleting) return;
    setErrorMsg("");
    setPending(true);
    try {
      await deleteKasEntry(deleting.id);
      flash("Transaksi kas dihapus.");
      setDeleting(null);
      refetch();
    } catch (reason) {
      setErrorMsg(reason instanceof Error ? reason.message : "Gagal menghapus transaksi.");
    } finally {
      setPending(false);
    }
  }

  const entries = kas ? combineEntries(kas) : [];
  const jenisBadge = (entry: KasEntry) => (entry.tipe === "masuk" ? s.masukBadge : s.keluarBadge);
  const jumlahClass = (entry: KasEntry) => (entry.tipe === "masuk" ? s.jumlahMasuk : s.jumlahKeluar);
  const shownError = errorMsg || error;

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <div>
            <h1 className={s.headerTitle}>Kas Masuk &amp; Keluar</h1>
            <p className={s.headerSubtitle}>Pemasukan disinkronkan dari pesanan disetujui; semua transaksi dapat ditambah, diubah, dan dihapus.</p>
          </div>
          <span className={s.badge}>Admin Keuangan</span>
        </header>

        {notice && <div className="mb-6 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs text-success animate-fadeIn">{notice}</div>}
        {shownError && <p className="mb-4 text-sm text-error">{shownError}</p>}

        <div className={s.cardGrid}>
          <div className={s.metricCard}>
            <div className={s.metricIcon}>
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <p className={s.metricLabel}>Saldo Kas</p>
              <p className={s.metricValue}>{kas ? formatRp(kas.saldo) : "…"}</p>
            </div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricIcon}>
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <div>
              <p className={s.metricLabel}>Total Pemasukan</p>
              <p className={s.metricValue}>{kas ? formatRp(kas.totalMasuk) : "…"}</p>
            </div>
          </div>
          <div className={s.metricCard}>
            <div className={s.metricIconOut}>
              <span className="material-symbols-outlined text-[20px]">trending_down</span>
            </div>
            <div>
              <p className={s.metricLabel}>Total Pengeluaran</p>
              <p className={s.metricValue}>{kas ? formatRp(kas.totalKeluar) : "…"}</p>
            </div>
          </div>
        </div>

        <div className={s.grid}>
          <form onSubmit={handleCreate} className={s.formCard}>
            <h2 className={s.formTitle}>Catat Transaksi</h2>
            <p className={`${s.formSubtitle} mb-4`}>Pemasukan atau pengeluaran kas.</p>

            <label className={`${s.fieldLabel} mb-1`}>Jenis Transaksi</label>
            <div className={`${s.toggleGroup} mb-4`}>
              <button type="button" className={`${s.toggleButton} ${tipe === "masuk" ? s.toggleActiveMasuk : s.toggleInactive}`} onClick={() => selectTipe("masuk")}>
                Masuk
              </button>
              <button type="button" className={`${s.toggleButton} ${tipe === "keluar" ? s.toggleActiveKeluar : s.toggleInactive}`} onClick={() => selectTipe("keluar")}>
                Keluar
              </button>
            </div>

            <label className={`${s.fieldLabel} mb-1`} htmlFor="deskripsi">Deskripsi</label>
            <input
              id="deskripsi"
              className={`${s.input} mb-4`}
              placeholder="cth: Pembayaran proyek / belanja bahan baku"
              value={deskripsi}
              onChange={(event) => setDeskripsi(event.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`${s.fieldLabel} mb-1`} htmlFor="jumlah">Jumlah (Rp)</label>
                <input
                  id="jumlah"
                  className={s.input}
                  type="number"
                  min="1"
                  step="1000"
                  placeholder="cth: 500000"
                  value={jumlah}
                  onChange={(event) => setJumlah(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className={`${s.fieldLabel} mb-1`} htmlFor="kategori">Kategori</label>
                <select id="kategori" className={s.input} value={kategori} onChange={(event) => setKategori(event.target.value as KasKategori)}>
                  {(Object.keys(KATEGORI_LABELS) as KasKategori[]).map((key) => (
                    <option key={key} value={key}>{KATEGORI_LABELS[key]}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className={s.submitButton} disabled={saving}>
              <span className="material-symbols-outlined text-[18px]">playlist_add</span>
              {saving ? "Menyimpan…" : "Simpan Transaksi"}
            </button>
          </form>

          <div className={s.tableCard}>
            <div className={s.tableToolbar}>
              <h2 className={s.tableTitle}>Riwayat Transaksi</h2>
            </div>

            <div className={`${s.mobileList} p-3`}>
              {entries.length === 0 && (
                <div className={`${s.card} py-10 text-center text-xs text-on-surface-variant`}>
                  Belum ada transaksi kas.
                </div>
              )}
              {entries.map((entry) => (
                <div key={entry.id} className={s.card}>
                  <div className={s.cardTop}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface">{entry.deskripsi}</p>
                      <p className="text-[10px] text-on-surface-variant">{entry.sumber}</p>
                    </div>
                    <span className={`${s.badgeBase} ${jenisBadge(entry)}`}>
                      {entry.tipe === "masuk" ? "Masuk" : "Keluar"}
                    </span>
                  </div>
                  <div className={s.cardInfo}>
                    <div>{formatTanggal(entry.tanggal)}</div>
                    <div className="flex items-center gap-2">
                      Kategori
                      <span className={`${s.badgeBase} ${kategoriBadge[entry.kategori]}`}>{entry.kategori}</span>
                    </div>
                  </div>
                  <div className={s.cardMeta}>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Jumlah</span>
                    <span className={`text-sm ${jumlahClass(entry)}`}>
                      {entry.tipe === "masuk" ? "+" : "-"}
                      {formatRp(entry.jumlah)}
                    </span>
                  </div>
                  <div className={s.cardActions}>
                    <KasActions
                      entry={entry}
                      onEdit={setEditing}
                      onDelete={setDeleting}
                      full
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={`${s.tableWrapper} ${s.desktopOnly}`}>
              <table className={s.table}>
                <thead className={s.tableHead}>
                  <tr>
                    <th className={s.tableHeadCell}>Tanggal</th>
                    <th className={s.tableHeadCell}>Jenis</th>
                    <th className={s.tableHeadCell}>Keterangan</th>
                    <th className={s.tableHeadCell}>Kategori</th>
                    <th className={`${s.tableHeadCell} text-right`}>Jumlah</th>
                    <th className={s.tableHeadCell}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className={s.tableRow}>
                      <td className={s.tableCell}>{formatTanggal(entry.tanggal)}</td>
                      <td className={s.tableCell}>
                        <span className={`${s.badgeBase} ${jenisBadge(entry)}`}>{entry.tipe === "masuk" ? "Masuk" : "Keluar"}</span>
                      </td>
                      <td className={s.tableCell}>
                        <p className="font-medium text-on-surface">{entry.deskripsi}</p>
                        <p className="text-[10px] text-on-surface-variant">{entry.sumber}</p>
                      </td>
                      <td className={s.tableCell}>
                        <span className={`${s.badgeBase} ${kategoriBadge[entry.kategori]}`}>{entry.kategori}</span>
                      </td>
                      <td className={`${s.tableCell} text-right ${jumlahClass(entry)}`}>
                        {entry.tipe === "masuk" ? "+" : "-"}{formatRp(entry.jumlah)}
                      </td>
                      <td className={s.tableCell}>
                        <KasActions entry={entry} onEdit={setEditing} onDelete={setDeleting} />
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className={s.emptyState}>Belum ada transaksi kas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <TransaksiFormModal
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}

      {deleting && (
        <div className={s.modalOverlay} onClick={() => setDeleting(null)}>
          <div className={s.modalContent} onClick={(event) => event.stopPropagation()}>
            <div className={s.modalHeader}>
              <div>
                <div className={s.modalTitle}>Hapus Transaksi</div>
                <div className={s.modalSubtitle}>{deleting.id}</div>
              </div>
              <button className={s.modalCloseButton} onClick={() => setDeleting(null)}>
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className={s.confirmIcon}>
              <span className="material-symbols-outlined text-error text-4xl">delete</span>
            </div>
            <div className={s.confirmTitle}>Hapus Transaksi Ini?</div>
            <div className={s.confirmText}>
              {deleting.deskripsi} sebesar {formatRp(deleting.jumlah)} akan dihapus dari buku kas.
            </div>
            <div className={s.actionsWrapper}>
              <button className={s.secondaryButton} onClick={() => setDeleting(null)} disabled={pending}>
                Batal
              </button>
              <button className={s.dangerButton} onClick={handleDelete} disabled={pending}>
                <span className="material-symbols-outlined text-[16px]">{pending ? "progress_activity" : "delete"}</span>
                {pending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
