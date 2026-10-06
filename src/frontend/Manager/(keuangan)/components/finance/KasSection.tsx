"use client";

import { useMemo, useState } from "react";
import { useFinance } from "./FinanceStore";
import { FeedbackToast } from "./ui/FeedbackToast";
import { FinancialStatCard } from "./ui/FinancialStatCard";
import { SelectTambahBaru } from "./ui/SelectTambahBaru";
import { StatusBadge } from "./ui/StatusBadge";
import { formatRp, formatTanggal, tanggalHariIni } from "./format";
import {
  JENIS_TRANSAKSI,
  LABEL_JENIS_TRANSAKSI,
  type JenisTransaksi,
  type KategoriBiaya,
  type PosProyek,
  type TransaksiKas,
} from "./types";
import * as s from "./style";

const IKON_JENIS: Record<JenisTransaksi, string> = {
  kas_masuk: "south_west",
  kas_keluar: "north_east",
  kas_beredar: "handshake",
};

type PeriodeKas = "hari" | "minggu" | "bulan" | "tahun";

const PERIODE_LIST: PeriodeKas[] = ["hari", "minggu", "bulan", "tahun"];

const LABEL_PERIODE: Record<PeriodeKas, string> = {
  hari: "Harian",
  minggu: "Mingguan",
  bulan: "Bulanan",
  tahun: "Tahunan",
};

function badgeJenis(jenis: JenisTransaksi) {
  if (jenis === "kas_masuk") return s.badgeMasuk;
  if (jenis === "kas_keluar") return s.badgeKeluar;
  return s.badgeBonedar;
}

function FormKas() {
  const { tambahTransaksi, opsiPerson, opsiKategori, opsiPos, tambahOpsi } = useFinance();
  const [jenis, setJenis] = useState<JenisTransaksi>("kas_keluar");
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [noNota, setNoNota] = useState("");
  const [uraian, setUraian] = useState("");
  const [nominal, setNominal] = useState(0);
  const [person, setPerson] = useState<string>("Sukarno");
  const [kategori, setKategori] = useState<KategoriBiaya>("BBM");
  const [posProyek, setPosProyek] = useState<PosProyek>("Nganyang");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const gantiJenis = (berikutnya: JenisTransaksi) => {
    setJenis(berikutnya);
    if (berikutnya === "kas_beredar") setKategori("BBM");
    if (berikutnya === "kas_masuk") setKategori("Dll");
  };

const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validasi: Record<string, string> = {};
    if (!tanggal) validasi.tanggal = "Tanggal wajib diisi.";
    if (!uraian.trim()) validasi.uraian = "Deskripsi wajib diisi.";
    if (nominal <= 0) validasi.nominal = "Jumlah harus lebih dari Rp 0.";
    if (!person.trim()) validasi.person = "Pilih person penerima atau pengeluar.";
    setErrors(validasi);
    if (Object.keys(validasi).length > 0) return;

    tambahTransaksi({
      tanggal,
      jenis,
      uraian: uraian.trim(),
      kategori,
      posProyek,
      person: person.trim(),
      nominal,
      noNota: noNota.trim(),
      bukti: "",
      sumber: "manual",
      refId: "",
    });
    setUraian("");
    setNominal(0);
    setNoNota("");
    setErrors({});
  };

  return (
    <form onSubmit={submit} className={s.card} noValidate>
      <h2 className={s.sectionTitle}>Catat Transaksi Kas</h2>
      <p className={s.sectionSubtitle}>
        Pilih jenis transaksi, lalu lengkapi tanggal, uraian, jumlah, person, kategori, dan pos/proyek.
      </p>

      <fieldset className="mt-4">
        <legend className={s.fieldLabel}>Jenis Transaksi</legend>
        <div role="group" aria-label="Jenis transaksi kas" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {JENIS_TRANSAKSI.map((item) => {
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

        <label className={s.fieldLabel}>
          No. Nota <span className="normal-case tracking-normal text-on-surface-variant/70">(opsional)</span>
          <input
            value={noNota}
            onChange={(event) => setNoNota(event.target.value)}
            placeholder="cth: BKB-4471"
            className={s.input}
          />
        </label>

        <SelectTambahBaru
          label="Person"
          value={person}
          options={opsiPerson}
          placeholder="cth: CV Sinar Jaya"
          error={errors.person}
          onChange={(value) => {
            setPerson(value);
            setErrors((current) => ({ ...current, person: "" }));
          }}
          onTambah={(value) => tambahOpsi("person", value)}
        />

        <label className={`${s.fieldLabel} sm:col-span-2 lg:col-span-3`}>
          Deskripsi
          <input
            value={uraian}
            onChange={(event) => {
              setUraian(event.target.value);
              setErrors((current) => ({ ...current, uraian: "" }));
            }}
            placeholder="cth: Beli BBM dumping site / Bon transport material"
            aria-invalid={Boolean(errors.uraian)}
            className={s.input}
          />
          {errors.uraian && (
            <span role="alert" className={s.inputErrorText}>
              {errors.uraian}
            </span>
          )}
        </label>

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

        <SelectTambahBaru
          label="Kategori"
          value={kategori}
          options={opsiKategori}
          placeholder="cth: Sewa Alat Berat"
          onChange={setKategori}
          onTambah={(value) => tambahOpsi("kategori", value)}
        />

        <SelectTambahBaru
          label="Pos/Proyek"
          value={posProyek}
          options={opsiPos}
          placeholder="cth: Pabrik Malang"
          onChange={setPosProyek}
          onTambah={(value) => tambahOpsi("pos", value)}
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
  const { tambahBukti } = useFinance();

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
                Unggah foto atau scan nota kas agar mudah diaudit saat pemeriksaan.
              </p>
              <label className={`${s.secondaryButton} mt-1 cursor-pointer`}>
                <span aria-hidden="true" className={s.iconSm}>
                  upload
                </span>
                Unggah Bukti
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) tambahBukti(transaksi.id, file.name);
                  }}
                />
              </label>
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
  const [periode, setPeriode] = useState<PeriodeKas>("hari");
  const [cari, setCari] = useState("");
  const [preview, setPreview] = useState<TransaksiKas | null>(null);
  const [hapus, setHapus] = useState<TransaksiKas | null>(null);

  const transaksi = useMemo(() => {
    const query = cari.trim().toLowerCase();
    const now = new Date();
    const hariIni = now.toISOString().slice(0, 10);
    const mulaiMinggu = new Date(now);
    mulaiMinggu.setDate(mulaiMinggu.getDate() - 6);
    const mulaiBulan = new Date(now.getFullYear(), now.getMonth(), 1);
    const mulaiTahun = new Date(now.getFullYear(), 0, 1);
    return transaksiUrut.filter((item) => {
      let cocokPeriode = true;
      if (periode === "hari") cocokPeriode = item.tanggal === hariIni;
      if (periode === "minggu") cocokPeriode = new Date(item.tanggal) >= mulaiMinggu;
      if (periode === "bulan") cocokPeriode = new Date(item.tanggal) >= mulaiBulan;
      if (periode === "tahun") cocokPeriode = new Date(item.tanggal) >= mulaiTahun;
      const cocokJenis = filterJenis === "all" || item.jenis === filterJenis;
      const cocokKategori = filterKategori === "all" || item.kategori === filterKategori;
      const cocokCari =
        !query ||
        `${item.uraian} ${item.person}`.toLowerCase().includes(query) ||
        (item.noNota || "").toLowerCase().includes(query);
      return cocokPeriode && cocokJenis && cocokKategori && cocokCari;
    });
  }, [transaksiUrut, filterJenis, filterKategori, cari, periode]);

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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={s.sectionTitle}>Riwayat Transaksi Kas</h2>
            <p className={s.sectionSubtitle}>
              Preview bukti nota dan hapus transaksi yang tidak sesuai pencatatan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className={s.segmentedTrack}>
              {PERIODE_LIST.map((p) => {
                const aktif = periode === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => setPeriode(p)}
                    className={`${s.segmentedItem} ${aktif ? s.segmentedItemActive : s.segmentedItemIdle}`}
                  >
                    {LABEL_PERIODE[p]}
                  </button>
                );
              })}
            </div>
            <span className={s.dataCounter}>
              {transaksi.length} dari {transaksiUrut.length} transaksi
            </span>
          </div>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
          <label className="sr-only" htmlFor="kas-cari">
            Cari uraian atau person
          </label>
          <input
            id="kas-cari"
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari uraian, person, atau no. nota..."
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
                  Pos/Proyek
                </th>
                <th scope="col" className={s.th}>
                  Person
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
                  <td className={s.tdMuted}>{item.posProyek}</td>
                  <td className={s.tdMuted}>{item.person}</td>
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
                  <td colSpan={9} className={s.emptyRow}>
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
                  <p className={s.cardListLabel}>Pos/Proyek</p>
                  <p className={s.cardListValue}>{item.posProyek}</p>
                </div>
                <div>
                  <p className={s.cardListLabel}>Person</p>
                  <p className={s.cardListValue}>{item.person}</p>
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