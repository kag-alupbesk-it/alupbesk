"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { useFinance } from "../FinanceStore/FinanceStore";
import { FeedbackToast } from "../ui/FeedbackToast/FeedbackToast";
import { FinancialStatCard } from "../ui/FinancialStatCard/FinancialStatCard";
import { StatusBadge } from "../ui/StatusBadge/StatusBadge";
import { SelectTambahBaru } from "../ui/SelectTambahBaru/SelectTambahBaru";
import { formatRp, formatTanggal, tanggalHariIni } from "../format/format";
import {
  JENIS_TRANSAKSI,
  KATEGORI_BIAYA,
  LABEL_JENIS_TRANSAKSI,
  type JenisTransaksi,
  type KategoriBiaya,
  type TransaksiKas,
} from "../types/types";
import * as s from "../style/style";
import { exportCashflowToExcel } from "./exportCashflow";

const IKON_JENIS: Record<JenisTransaksi, string> = {
  kas_masuk: "south_west",
  kas_keluar: "north_east",
  kas_beredar: "handshake",
};



function badgeJenis(jenis: JenisTransaksi) {
  if (jenis === "kas_masuk") return s.badgeMasuk;
  if (jenis === "kas_keluar") return s.badgeKeluar;
  return s.badgeBonedar;
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setPreset(type: string, setStart: (v: string) => void, setEnd: (v: string) => void) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (type === "today") {
    const s = formatDateForInput(now);
    setStart(s); setEnd(s);
    return;
  }
  if (type === "yesterday") {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    const s = formatDateForInput(d);
    setStart(s); setEnd(s);
    return;
  }
  if (type === "thisWeek") {
    const d = new Date(now);
    const day = d.getDay(); // 0 Sun
    const diff = day === 0 ? 6 : day - 1; // Monday
    const start = new Date(d); start.setDate(d.getDate() - diff);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(now));
    return;
  }
  if (type === "lastWeek") {
    const d = new Date(now);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const end = new Date(d); end.setDate(d.getDate() - diff - 1);
    const start = new Date(end); start.setDate(end.getDate() - 6);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(end));
    return;
  }
  if (type === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(now));
    return;
  }
  if (type === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(end));
    return;
  }
  if (type === "last3Months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(end));
    return;
  }
  if (type === "last6Months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(end));
    return;
  }
  if (type === "thisYear") {
    const start = new Date(now.getFullYear(), 0, 1);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(now));
    return;
  }
  if (type === "lastYear") {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    setStart(formatDateForInput(start)); setEnd(formatDateForInput(end));
    return;
  }
}

function FormKas() {
  const { tambahTransaksi, opsiKategori, opsiPerson, tambahOpsi } = useFinance();
  const [jenis, setJenis] = useState<JenisTransaksi>("kas_keluar");
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [uraian, setUraian] = useState("");
  const [nominal, setNominal] = useState(0);
  const [kategori, setKategori] = useState<string>(KATEGORI_BIAYA[0]);
  const [person, setPerson] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const JENIS_BE = JENIS_TRANSAKSI.filter((item) => item !== "kas_beredar");

  const gantiJenis = (berikutnya: JenisTransaksi) => {
    setJenis(berikutnya);
    setKategori(KATEGORI_BIAYA[0]);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validasi: Record<string, string> = {};
    if (!tanggal) validasi.tanggal = "Tanggal wajib diisi.";
    if (!uraian.trim()) validasi.uraian = "Deskripsi wajib diisi.";
    if (nominal <= 0) validasi.nominal = "Jumlah harus lebih dari Rp 0.";
    if (jenis === "kas_keluar" && !person.trim())
      validasi.person = "Penerima wajib diisi untuk pengeluaran.";
    setErrors(validasi);
    if (Object.keys(validasi).length > 0) return;

    tambahTransaksi({
      tanggal,
      jenis,
      uraian: uraian.trim(),
      kategori,
      posProyek: "",
      person: person.trim(),
      nominal,
      noNota: "",
      bukti: "",
      sumber: "manual",
      refId: "",
    });
    setUraian("");
    setNominal(0);
    setPerson("");
    setErrors({});
  };

  return (
    <form onSubmit={submit} className={s.card} noValidate>
      <h2 className={s.sectionTitle}>Catat Transaksi Kas</h2>
      <p className={s.sectionSubtitle}>
        Pilih jenis transaksi, lalu lengkapi tanggal, deskripsi, jumlah, kategori, dan nama pihak (penerima untuk
        pengeluaran).
      </p>

      <fieldset className="mt-4">
        <legend className={s.fieldLabel}>Jenis Transaksi</legend>
        <div role="group" aria-label="Jenis transaksi kas" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {JENIS_BE.map((item) => {
            const aktif = jenis === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={aktif}
                onClick={() => gantiJenis(item)}
                className={`${s.choiceButton} ${aktif ? s.choiceButtonActive : s.choiceButtonIdle}`}
              >
                <span aria-hidden="true" className={s.iconSm}>
                  {IKON_JENIS[item]}
                </span>
                {LABEL_JENIS_TRANSAKSI[item]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <label className={s.fieldLabel}>
          Tanggal
          <input
            type="date"
            value={tanggal}
            onChange={(event) => {
              setTanggal(event.target.value);
              setErrors((current) => ({ ...current, tanggal: "" }));
            }}
            aria-invalid={Boolean(errors.tanggal)}
            className={s.input}
          />
          {errors.tanggal && (
            <span role="alert" className={s.inputErrorText}>
              {errors.tanggal}
            </span>
          )}
        </label>

        <SelectTambahBaru
          label="Kategori"
          value={kategori}
          options={opsiKategori}
          placeholder="cth: Kategori baru"
          onChange={(value) => {
            setKategori(value);
            setErrors((current) => ({ ...current, kategori: "" }));
          }}
          onTambah={(value) => tambahOpsi("kategori", value)}
        />

        <label className={s.fieldLabel}>
          Jumlah (Rp)
          <input
            type="text"
            inputMode="numeric"
            value={nominal > 0 ? new Intl.NumberFormat("id-ID").format(nominal) : ""}
            onChange={(event) => {
              const angka = Number(event.target.value.replace(/\D/g, "")) || 0;
              setNominal(angka);
              setErrors((current) => ({ ...current, nominal: "" }));
            }}
            placeholder="0"
            aria-label="Jumlah rupiah"
            aria-invalid={Boolean(errors.nominal)}
            className={s.input}
          />
          {errors.nominal && (
            <span role="alert" className={s.inputErrorText}>
              {errors.nominal}
            </span>
          )}
        </label>

        <label className={`${s.fieldLabel} sm:col-span-2 lg:col-span-2 2xl:col-span-1`}>
          Deskripsi
          <input
            value={uraian}
            onChange={(event) => {
              setUraian(event.target.value);
              setErrors((current) => ({ ...current, uraian: "" }));
            }}
            placeholder="cth: Pembelian BBM genset proyek"
            aria-invalid={Boolean(errors.uraian)}
            className={s.input}
          />
          {errors.uraian && (
            <span role="alert" className={s.inputErrorText}>
              {errors.uraian}
            </span>
          )}
        </label>

        <SelectTambahBaru
          label={jenis === "kas_keluar" ? "Penerima" : "Pihak / Pemberi"}
          value={person}
          options={opsiPerson}
          placeholder={jenis === "kas_keluar" ? "cth: Bambang Sutrisno" : "cth: CV Karya Baja"}
          error={errors.person}
          onChange={(value) => {
            setPerson(value);
            setErrors((current) => ({ ...current, person: "" }));
          }}
          onTambah={(value) => tambahOpsi("person", value)}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" className={s.primaryButton}>
          <span aria-hidden="true" className={s.iconMd}>
            playlist_add
          </span>
          Simpan Transaksi
        </button>
      </div>
    </form>
  );
}

function ModalBukti({
  transaksi,
  onTutup,
}: {
  transaksi: TransaksiKas;
  onTutup: () => void;
}) {

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bukti-judul"
        className={`${s.modalPanel} max-w-2xl`}
      >
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Preview Bukti Nota</p>
            <h3 id="bukti-judul" className={`${s.modalTitle} truncate`}>
              {transaksi.uraian}
            </h3>
            <p className={`${s.metaText} mt-1`}>
              {transaksi.noNota ? `No. nota ${transaksi.noNota}` : "Tanpa nomor nota"} · {formatTanggal(transaksi.tanggal)}
            </p>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup preview bukti" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Jenis</dt>
              <dd className={s.detailValue}>{LABEL_JENIS_TRANSAKSI[transaksi.jenis]}</dd>
            </div>
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Nominal</dt>
              <dd className={s.detailValue}>{formatRp(transaksi.nominal)}</dd>
            </div>
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Kategori</dt>
              <dd className={s.detailValue}>{transaksi.kategori}</dd>
            </div>
            <div className={s.cardCompact}>
              <dt className={s.detailLabel}>Pos/Proyek</dt>
              <dd className={s.detailValue}>{transaksi.posProyek}</dd>
            </div>
          </dl>

          {transaksi.bukti ? (
            <div className={`${s.cardCompact} flex items-center gap-3`}>
              <span aria-hidden="true" className={`${s.iconHero} text-secondary`}>
                image
              </span>
              <div className="min-w-0">
                <p className={s.detailLabel}>Bukti terlampir</p>
                <p className="truncate text-xs font-bold text-on-surface">{transaksi.bukti}</p>
              </div>
            </div>
          ) : (
            <div className={s.emptyState}>
              <span aria-hidden="true" className={s.emptyStateIcon}>
                no_photography
              </span>
              <p className="text-xs font-bold text-on-surface">Bukti nota belum dilampirkan</p>
              <p className={`${s.sectionSubtitle} max-w-sm`}>
                Unggah foto atau scan nota kas belum tersedia di backend.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ModalHapus({
  transaksi,
  onTutup,
}: {
  transaksi: TransaksiKas;
  onTutup: () => void;
}) {
  const { hapusTransaksi } = useFinance();

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="hapus-judul" className={`${s.modalPanel} max-w-md`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Hapus Transaksi</p>
            <h3 id="hapus-judul" className={s.modalTitle}>
              {transaksi.id}
            </h3>
          </div>
          <button type="button" onClick={onTutup} aria-label="Batal hapus transaksi" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <p className="text-xs leading-relaxed text-on-surface-variant">
            <span className="font-bold text-on-surface">{transaksi.uraian}</span> sebesar{" "}
            <span className="font-bold text-on-surface">{formatRp(transaksi.nominal)}</span> akan dihapus dari
            buku kas {LABEL_JENIS_TRANSAKSI[transaksi.jenis]}.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                hapusTransaksi(transaksi.id);
                onTutup();
              }}
              className={s.dangerButton}
            >
              <span aria-hidden="true" className={s.iconSm}>
                delete
              </span>
              Hapus
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function KasSection() {
  const { state, rekap, transaksiUrut, opsiKategori, clearToast } = useFinance();
  const [filterJenis, setFilterJenis] = useState<"all" | JenisTransaksi>("all");
  const [filterKategori, setFilterKategori] = useState<"all" | KategoriBiaya>("all");
  const [cari, setCari] = useState("");
  const [preview, setPreview] = useState<TransaksiKas | null>(null);
  const [hapus, setHapus] = useState<TransaksiKas | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const transaksi = useMemo(() => {
    const query = cari.trim().toLowerCase();
    let start: Date | null = null;
    let end: Date | null = null;
    if (startDate) start = new Date(startDate + "T00:00:00");
    if (endDate) end = new Date(endDate + "T23:59:59");
    return transaksiUrut.filter((item) => {
      const d = new Date(item.tanggal + "T00:00:00");
      const cocokPeriode = (!start || d >= start) && (!end || d <= end);
      const cocokJenis = filterJenis === "all" || item.jenis === filterJenis;
      const cocokKategori = filterKategori === "all" || item.kategori === filterKategori;
      const cocokCari =
        !query ||
        `${item.uraian} ${item.person}`.toLowerCase().includes(query) ||
        (item.noNota || "").toLowerCase().includes(query);
      return cocokPeriode && cocokJenis && cocokKategori && cocokCari;
    });
  }, [transaksiUrut, filterJenis, filterKategori, cari, startDate, endDate]);

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label="Saldo Kas Utama"
          value={formatRp(rekap.saldo)}
          icon="account_balance_wallet"
          trend="Kas masuk dikurangi kas keluar"
          tone="gold"
        />
        <FinancialStatCard
          label="Total Pemasukan"
          value={formatRp(rekap.totalMasuk)}
          icon="south_west"
          trend={`${transaksiUrut.filter((item) => item.jenis === "kas_masuk").length} transaksi masuk`}
          tone="success"
        />
        <FinancialStatCard
          label="Total Pengeluaran"
          value={formatRp(rekap.totalKeluar)}
          icon="north_east"
          trend={`${transaksiUrut.filter((item) => item.jenis === "kas_keluar").length} transaksi keluar`}
          tone="error"
        />
        <FinancialStatCard
          label="Kas Beredar"
          value={formatRp(rekap.totalBeredar)}
          icon="handshake"
          trend={`Bon ke ${new Set(transaksiUrut.filter((item) => item.jenis === "kas_beredar").map((item) => item.person)).size} person`}
          tone="neutral"
        />
      </div>

      <FormKas />

      <section className={s.card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h2 className={s.sectionTitle}>Riwayat Transaksi Kas</h2>
            <p className={s.sectionSubtitle}>
              Preview bukti nota dan hapus transaksi yang tidak sesuai pencatatan.
            </p>
          </div>
              <div className="flex flex-wrap items-center justify-end gap-2 lg:self-end" suppressHydrationWarning>
            <span className={s.dataCounter}>
              {transaksi.length} dari {transaksiUrut.length} transaksi
            </span>
            <button
              type="button"
              onClick={() => exportCashflowToExcel(transaksi)}
              className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
          <label className="sr-only" htmlFor="kas-cari">
            Cari uraian atau penerima
          </label>
          <input
            id="kas-cari"
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari uraian, penerima, atau no. nota..."
            className={s.searchInput}
          />
          <label className="sr-only" htmlFor="kas-filter-jenis">
            Filter jenis transaksi
          </label>
          <select
            id="kas-filter-jenis"
            value={filterJenis}
            onChange={(event) => setFilterJenis(event.target.value as "all" | JenisTransaksi)}
            className={s.filterSelect}
          >
            <option value="all">Semua jenis</option>
            {JENIS_TRANSAKSI.map((item) => (
              <option key={item} value={item}>
                {LABEL_JENIS_TRANSAKSI[item]}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="kas-filter-kategori">
            Filter kategori
          </label>
          <select
            id="kas-filter-kategori"
            value={filterKategori}
            onChange={(event) => setFilterKategori(event.target.value as "all" | KategoriBiaya)}
            className={s.filterSelect}
          >
            <option value="all">Semua kategori</option>
            {opsiKategori.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${s.input} text-xs py-1 px-1.5`}
              max={endDate || new Date().toISOString().slice(0,10)}
              min={new Date(Date.now() - 5*365*24*60*60*1000).toISOString().slice(0,10)}
            />
            <span className="text-on-surface-variant text-xs">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${s.input} text-xs py-1 px-1.5`}
              min={startDate || undefined}
              max={new Date().toISOString().slice(0,10)}
            />
          </div>
        </div>

        <div className={`mt-4 ${s.tableWrap}`}>
          <table className={`${s.table} min-w-[820px] xl:min-w-0`}>
            <thead className={s.tableHead}>
              <tr>
                <th scope="col" className={s.th}>
                  Tanggal
                </th>
                <th scope="col" className={s.th}>
                  Jenis
                </th>
                <th scope="col" className={s.th}>
                  Uraian
                </th>
                <th scope="col" className={s.th}>
                  Kategori
                </th>
                <th scope="col" className={s.th}>
                  Penerima
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Nominal
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
              {transaksi.map((item) => (
                <tr key={item.id} className={s.tr}>
                  <td className={s.tdMuted}>{formatTanggal(item.tanggal)}</td>
                  <td className={s.td}>
                    <span className={`${s.badgeBase} ${badgeJenis(item.jenis)}`}>
                      <span aria-hidden="true" className={s.iconXs}>
                        {IKON_JENIS[item.jenis]}
                      </span>
                      {LABEL_JENIS_TRANSAKSI[item.jenis]}
                    </span>
                  </td>
                  <td className={s.tdStrong}>
                    <p className="font-semibold text-on-surface">{item.uraian}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {item.noNota ? `${item.noNota} · ` : ""}
                      {item.id}
                    </p>
                  </td>
                  <td className={s.tdMuted}>{item.kategori}</td>
                  <td className={s.tdMuted}>{item.person || "-"}</td>
                  <td
                    className={`${s.td} text-right font-bold ${
                      item.jenis === "kas_masuk" ? "text-success" : "text-error"
                    }`}
                  >
                    {item.jenis === "kas_masuk" ? "+" : "-"}
                    {formatRp(item.nominal)}
                  </td>
                  <td className={s.td}>
                    {item.jenis === "kas_beredar" ? (
                      <StatusBadge tone="pending" label="Kas Beredar" icon="handshake" />
                    ) : (
                      <StatusBadge tone="approved" label="Lunas" icon="check" />
                    )}
                  </td>
                  <td className={`${s.td} text-right`}>
                    <div className={s.actionGroup}>
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        aria-label={`Preview bukti ${item.uraian}`}
                        title="Preview bukti"
                        className={s.actionButton}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          visibility
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHapus(item)}
                        aria-label={`Hapus transaksi ${item.uraian}`}
                        title="Hapus transaksi"
                        className={s.actionButtonDanger}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transaksi.length === 0 && (
                <tr>
                  <td colSpan={8} className={s.emptyRow}>
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        <div className={`mt-4 ${s.cardListWrap}`}>
          {transaksi.length === 0 && <p className={s.emptyRow}>Tidak ada transaksi yang cocok dengan filter.</p>}
          {transaksi.map((item) => (
            <article key={item.id} className={s.cardListItem}>
              <div className={s.cardListHead}>
                <div className="min-w-0">
                  <p className={`${s.cardListTitle} break-words`}>{item.uraian}</p>
                  <p className={`${s.metaText} mt-0.5`}>
                    {formatTanggal(item.tanggal)}
                    {item.noNota ? ` · ${item.noNota}` : ""}
                  </p>
                </div>
                <span className={`${s.badgeBase} ${badgeJenis(item.jenis)} shrink-0`}>
                  <span aria-hidden="true" className={s.iconXs}>
                    {IKON_JENIS[item.jenis]}
                  </span>
                  {LABEL_JENIS_TRANSAKSI[item.jenis]}
                </span>
              </div>

              <div className={s.cardListGrid}>
                <div>
                  <p className={s.cardListLabel}>Kategori</p>
                  <p className={s.cardListValue}>{item.kategori}</p>
                </div>
                <div>
                  <p className={s.cardListLabel}>Penerima</p>
                  <p className={s.cardListValue}>{item.person || "-"}</p>
                </div>
                <div>
                  <p className={s.cardListLabel}>Status</p>
                  <p className={`${s.cardListValue} mt-1`}>
                    {item.jenis === "kas_beredar" ? (
                      <StatusBadge tone="pending" label="Kas Beredar" icon="handshake" />
                    ) : (
                      <StatusBadge tone="approved" label="Lunas" icon="check" />
                    )}
                  </p>
                </div>
              </div>

              <p className={`mt-3 text-right text-base font-bold ${item.jenis === "kas_masuk" ? "text-success" : "text-error"}`}>
                {item.jenis === "kas_masuk" ? "+" : "-"}
                {formatRp(item.nominal)}
              </p>

              <div className={s.cardListActions}>
                <button
                  type="button"
                  onClick={() => setPreview(item)}
                  aria-label={`Preview bukti ${item.uraian}`}
                  title="Preview bukti"
                  className={s.actionButton}
                >
                  <span aria-hidden="true" className={s.iconSm}>
                    visibility
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHapus(item)}
                  aria-label={`Hapus transaksi ${item.uraian}`}
                  title="Hapus transaksi"
                  className={s.actionButtonDanger}
                >
                  <span aria-hidden="true" className={s.iconSm}>
                    delete
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {preview && <ModalBukti transaksi={preview} onTutup={() => setPreview(null)} />}
      {hapus && <ModalHapus transaksi={hapus} onTutup={() => setHapus(null)} />}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}