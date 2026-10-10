"use client";

import { useMemo, useState } from "react";
import { useFinance } from "../FinanceStore/FinanceStore";
import { FeedbackToast } from "../ui/FeedbackToast/FeedbackToast";
import { FinancialStatCard } from "../ui/FinancialStatCard/FinancialStatCard";
import { SelectTambahBaru } from "../ui/SelectTambahBaru/SelectTambahBaru";
import { StatusBadge } from "../ui/StatusBadge/StatusBadge";
import { SlipGajiModal } from "../SlipGajiModal/SlipGajiModal";
import { formatRp, formatTanggal, tanggalHariIni } from "../format/format";
import { hitungGaji, type Karyawan, type PosProyek } from "../types/types";
import * as s from "../style/style";
import { useReadOnly } from "@/frontend/shared/access/AccessModeProvider";

type DraftKaryawan = Omit<Karyawan, "id" | "statusBayar" | "tanggalBayar">;

const draftKosong = (): DraftKaryawan => ({
  nama: "",
  jabatan: "",
  lokasi: "Nganyang",
  gajiPokok: 0,
  tunjangan: 0,
  lembur: 0,
  potongan: 0,
  periode: tanggalHariIni(),
  metodeBayar: "Transfer BCA",
});

const METODE_BAYAR = ["Transfer BCA", "Transfer BRI", "Tunai", "Cek"];

const draftDari = (karyawan: Karyawan): DraftKaryawan => ({
  nama: karyawan.nama,
  jabatan: karyawan.jabatan,
  lokasi: karyawan.lokasi,
  gajiPokok: karyawan.gajiPokok,
  tunjangan: karyawan.tunjangan,
  lembur: karyawan.lembur,
  potongan: karyawan.potongan,
  periode: karyawan.periode,
  metodeBayar: karyawan.metodeBayar,
});

function InputRupiah({
  label,
  nilai,
  onUbah,
  prefix,
  error,
}: {
  label: string;
  nilai: number;
  onUbah: (value: number) => void;
  prefix?: string;
  error?: string;
}) {
  return (
    <label className={s.fieldLabel}>
      {label}
      <div className="relative">
        {prefix && (
          <span aria-hidden="true" className={`${s.metaText} absolute left-3 top-1/2 -translate-y-1/2`}>
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={nilai > 0 ? new Intl.NumberFormat("id-ID").format(nilai) : ""}
          onChange={(event) => onUbah(Number(event.target.value.replace(/\D/g, "")) || 0)}
          placeholder="0"
          aria-label={`${label} rupiah`}
          aria-invalid={Boolean(error)}
          className={`${s.input} ${prefix ? "pl-8" : ""}`}
        />
      </div>
      {error && (
        <span role="alert" className={s.inputErrorText}>
          {error}
        </span>
      )}
    </label>
  );
}

function FormKaryawan({
  edit,
  onSelesai,
}: {
  edit: Karyawan | null;
  onSelesai: () => void;
}) {
  const { tambahKaryawan, ubahKaryawan, opsiJabatan, opsiPos, tambahOpsiJabatan, tambahOpsi } =
    useFinance();
  const [draft, setDraft] = useState<DraftKaryawan>(() =>
    edit ? draftDari(edit) : draftKosong(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ubah = <K extends keyof DraftKaryawan>(field: K, value: DraftKaryawan[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validasi: Record<string, string> = {};
    if (!draft.nama.trim()) validasi.nama = "Nama karyawan wajib diisi.";
    if (!draft.jabatan.trim()) validasi.jabatan = "Jabatan wajib diisi.";
    if (draft.gajiPokok <= 0) validasi.gajiPokok = "Gaji pokok harus lebih dari Rp 0.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.periode))
      validasi.periode = "Tanggal gajian wajib diisi, cth: 2026-10-15.";
    if (draft.potongan > draft.gajiPokok + draft.tunjangan + draft.lembur)
      validasi.potongan = "Total potongan melebihi pendapatan karyawan.";
    setErrors(validasi);
    if (Object.keys(validasi).length > 0) return;

    if (edit) ubahKaryawan({ ...draft, ...edit, nama: draft.nama.trim(), jabatan: draft.jabatan.trim() });
    else
      tambahKaryawan({
        ...draft,
        nama: draft.nama.trim(),
        jabatan: draft.jabatan.trim(),
      });
    onSelesai();
  };

  const pendapatan = draft.gajiPokok + draft.tunjangan + draft.lembur;
  const potongan = draft.potongan;
  const bersihNetto = pendapatan - potongan;

  return (
    <form onSubmit={submit} className={s.card} noValidate>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className={s.sectionTitle}>{edit ? "Ubah Data Karyawan" : "Tambah Karyawan"}</h2>
          <p className={s.sectionSubtitle}>
            Lengkapi identitas, komponen gaji, dan potongan bon/kasbon. Data ini otomatis dipakai saat pencairan gaji.
          </p>
        </div>
        {edit && (
          <button type="button" onClick={onSelesai} className={s.secondaryButton}>
            <span aria-hidden="true" className={s.iconSm}>
              close
            </span>
            Batal Ubah
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <label className={`${s.fieldLabel} sm:col-span-2 lg:col-span-2 2xl:col-span-2`}>
          Nama Karyawan
          <input
            value={draft.nama}
            onChange={(event) => ubah("nama", event.target.value)}
            placeholder="cth: Slamet Riyadi"
            aria-invalid={Boolean(errors.nama)}
            className={s.input}
          />
          {errors.nama && (
            <span role="alert" className={s.inputErrorText}>
              {errors.nama}
            </span>
          )}
        </label>

        <SelectTambahBaru
          label="Jabatan"
          value={draft.jabatan}
          options={opsiJabatan}
          placeholder="cth: Operator Alat Berat"
          error={errors.jabatan}
          onChange={(value) => ubah("jabatan", value)}
          onTambah={tambahOpsiJabatan}
        />

        <SelectTambahBaru
          label="Lokasi / Pos"
          value={draft.lokasi}
          options={opsiPos}
          placeholder="cth: Pabrik Malang"
          onChange={(value) => ubah("lokasi", value as PosProyek)}
          onTambah={(value) => tambahOpsi("pos", value)}
        />

        <label className={s.fieldLabel}>
          Tanggal Gajian
          <input
            type="date"
            value={draft.periode}
            onChange={(event) => ubah("periode", event.target.value)}
            aria-invalid={Boolean(errors.periode)}
            className={s.input}
          />
          {errors.periode && (
            <span role="alert" className={s.inputErrorText}>
              {errors.periode}
            </span>
          )}
        </label>

        <label className={s.fieldLabel}>
          Metode Bayar
          <select
            value={draft.metodeBayar}
            onChange={(event) => ubah("metodeBayar", event.target.value)}
            className={s.select}
          >
            {METODE_BAYAR.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <InputRupiah
          label="Gaji Pokok"
          nilai={draft.gajiPokok}
          prefix="Rp"
          error={errors.gajiPokok}
          onUbah={(value) => ubah("gajiPokok", value)}
        />
        <InputRupiah
          label="Tunjangan"
          nilai={draft.tunjangan}
          prefix="Rp"
          onUbah={(value) => ubah("tunjangan", value)}
        />
        <InputRupiah
          label="Lembur"
          nilai={draft.lembur}
          prefix="Rp"
          onUbah={(value) => ubah("lembur", value)}
        />
        <InputRupiah
          label="Potongan Kasbon/Bon"
          nilai={draft.potongan}
          prefix="Rp"
          error={errors.potongan}
          onUbah={(value) => ubah("potongan", value)}
        />

        <div className={`${s.panelHighlight} flex flex-col justify-center sm:col-span-2 lg:col-span-1`}>
          <p className={s.cardListLabel}>Simulasi Gaji Bulanan</p>
          <p className={`${s.statValue} text-secondary`}>{formatRp(bersihNetto)}</p>
          <p className={`${s.metaText} mt-1`}>
            Pendapatan {formatRp(pendapatan)} · Potongan {formatRp(potongan)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onSelesai} className={s.secondaryButton}>
          Batal
        </button>
        <button type="submit" className={s.primaryButton}>
          <span aria-hidden="true" className={s.iconMd}>
            {edit ? "save" : "person_add"}
          </span>
          {edit ? "Simpan Perubahan" : "Tambah Karyawan"}
        </button>
      </div>
    </form>
  );
}

function ModalHapusKaryawan({
  karyawan,
  onTutup,
  onHapus,
}: {
  karyawan: Karyawan;
  onTutup: () => void;
  onHapus: () => void;
}) {
  const { state } = useFinance();
  const { netto } = hitungGaji(karyawan);
  const adaTransaksi = state.transaksi.some((item) => item.refId === karyawan.id);

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="hapus-karyawan-judul" className={`${s.modalPanel} max-w-md`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Hapus Karyawan</p>
            <h3 id="hapus-karyawan-judul" className={s.modalTitle}>
              {karyawan.nama}
            </h3>
            <p className={`${s.metaText} mt-1`}>
              {karyawan.id} · {karyawan.jabatan} · gajian {formatTanggal(karyawan.periode)}
            </p>
          </div>
          <button type="button" onClick={onTutup} aria-label="Batal hapus karyawan" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          <p className="text-xs leading-relaxed text-on-surface-variant">
            <span className="font-bold text-on-surface">{karyawan.nama}</span> dengan gaji pokok{" "}
            <span className="font-bold text-on-surface">{formatRp(karyawan.gajiPokok)}</span> dan neto{" "}
            <span className="font-bold text-on-surface">{formatRp(netto)}</span> akan dihapus dari daftar payroll
            gajian {formatTanggal(karyawan.periode)}.
          </p>
          <div className={adaTransaksi ? s.panelHighlight : s.panelMuted}>
            <p className={s.cardListLabel}>Dampak Penghapusan</p>
            <p className={`${s.detailValue} mt-1`}>
              {adaTransaksi
                ? "Ada transaksi Kas Keluar gaji atas nama ini. Transaksi tetap tersimpan sebagai riwayat pembukuan, hanya data karyawan yang dihapus."
                : "Belum ada transaksi Kas Keluar untuk karyawan ini, jadi tidak ada transaksi yang tersisa."}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Batal
            </button>
            <button type="button" onClick={onHapus} className={s.dangerButton}>
              <span aria-hidden="true" className={s.iconSm}>
                delete
              </span>
              Hapus Karyawan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DialogGajiLagi({ karyawan, onTutup }: { karyawan: Karyawan; onTutup: () => void }) {
  const { gajiLagi } = useFinance();
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const bentrok = tanggal === karyawan.periode;
  const bisaSubmit = !bentrok && tanggal !== "";

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bisaSubmit) return;
    gajiLagi(karyawan.id, tanggal);
    onTutup();
  };

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="dialog" aria-modal="true" aria-labelledby="gaji-lagi-judul" className={`${s.modalPanel} max-w-md`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Gaji Lagi</p>
            <h3 id="gaji-lagi-judul" className={s.modalTitle}>
              {karyawan.nama}
            </h3>
            <p className={`${s.metaText} mt-1`}>
              {karyawan.jabatan} · {karyawan.lokasi} · gajian sebelumnya {formatTanggal(karyawan.periode)}
            </p>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup dialog gaji lagi" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-6" noValidate>
          <label className={s.fieldLabel}>
            Tanggal Gajian Baru
            <input
              type="date"
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
              aria-invalid={bentrok}
              className={s.input}
            />
            {bentrok && (
              <span role="alert" className={s.inputErrorText}>
                Tanggal sama dengan gajian sebelumnya.
              </span>
            )}
          </label>

          <div className={s.panelHighlight}>
            <p className={s.cardListLabel}>Yang disalin</p>
            <p className={`${s.detailValue} mt-1`}>
              Gaji pokok, tunjangan, lembur, dan potongan dibawa apa adanya.
            </p>
            <p className={`${s.metaText} mt-1`}>Status pembayaran di-reset menjadi belum dibayar.</p>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Batal
            </button>
            <button type="submit" className={s.primaryButton} disabled={!bisaSubmit}>
              <span aria-hidden="true" className={s.iconMd}>
                event_repeat
              </span>
              Gaji Lagi
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DetailUangKas() {
  const { rekap, transaksiUrut } = useFinance();
  const BATAS = 5;
  const kolom = [
    {
      judul: "Uang Masuk",
      ikon: "arrow_downward",
      badgeLabel: "pemasukan",
      total: rekap.totalMasuk,
      data: transaksiUrut.filter((item) => item.jenis === "kas_masuk").slice(0, BATAS),
      tanda: "+",
      kelas: "text-success",
      badge: s.badgeMasuk,
    },
    {
      judul: "Uang Keluar",
      ikon: "arrow_upward",
      badgeLabel: "pengeluaran",
      total: rekap.totalKeluar,
      data: transaksiUrut.filter((item) => item.jenis === "kas_keluar").slice(0, BATAS),
      tanda: "-",
      kelas: "text-error",
      badge: s.badgeKeluar,
    },
  ];

  return (
    <section className={s.card}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={s.sectionTitle}>Detail Uang Masuk &amp; Uang Keluar</h2>
          <p className={s.sectionSubtitle}>
            Rekap kas seluruh transaksi — gaji yang ditandai terbayar otomatis tercatat sebagai uang keluar.
          </p>
        </div>
        <p className={s.metaText}>Saldo bersih {formatRp(rekap.saldo)} · kas beredar {formatRp(rekap.totalBeredar)}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {kolom.map((item) => (
          <div key={item.judul} className={s.panelMuted}>
            <div className="flex items-center justify-between gap-2">
              <p className={s.cardListLabel}>
                <span aria-hidden="true" className={`${s.iconSm} mr-1 align-middle`}>
                  {item.ikon}
                </span>
                {item.judul}
              </p>
              <span className={`${s.badgeBase} ${item.badge}`}>{item.badgeLabel}</span>
            </div>
            <p className={`${s.statValue} ${item.kelas}`}>
              {item.tanda}
              {formatRp(item.total)}
            </p>

            <ul className="mt-3">
              {item.data.map((tr) => (
                <li key={tr.id} className={s.findingRow}>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">{tr.uraian || tr.kategori}</p>
                    <p className={s.metaText}>
                      {formatTanggal(tr.tanggal)} · {tr.person || "-"} · {tr.noNota || tr.id}
                    </p>
                  </div>
                  <p className={`${s.findingValue} ${item.kelas}`}>
                    {item.tanda}
                    {formatRp(tr.nominal)}
                  </p>
                </li>
              ))}
              {item.data.length === 0 && (
                <li className={s.emptyRow}>Belum ada transaksi {item.judul.toLowerCase()}.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PayrollSection() {
  const readOnly = useReadOnly();
  const { state, opsiPos, bayarGaji, hapusKaryawan, clearToast } = useFinance();
  const [filterStatus, setFilterStatus] = useState<"all" | "belum" | "terbayar">("all");
  const [filterLokasi, setFilterLokasi] = useState("all");
  const [cari, setCari] = useState("");
  const [slip, setSlip] = useState<Karyawan | null>(null);
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [edit, setEdit] = useState<Karyawan | null>(null);
  const [hapus, setHapus] = useState<Karyawan | null>(null);
  const [gajiLagiRow, setGajiLagiRow] = useState<Karyawan | null>(null);
  const [filterPeriode, setFilterPeriode] = useState("");

  const mulaiTambah = () => {
    setEdit(null);
    setFormTerbuka(true);
  };

  const mulaiUbah = (karyawan: Karyawan) => {
    setEdit(karyawan);
    setFormTerbuka(true);
  };

  const tutupForm = () => {
    setFormTerbuka(false);
    setEdit(null);
  };

  const daftarPeriode = useMemo(
    () => [...new Set(state.karyawan.map((item) => item.periode))].sort((a, b) => b.localeCompare(a)),
    [state.karyawan],
  );
  const periodeAktif =
    filterPeriode && daftarPeriode.includes(filterPeriode) ? filterPeriode : "";

  const rowsPeriode = useMemo(
    () => (periodeAktif ? state.karyawan.filter((item) => item.periode === periodeAktif) : state.karyawan),
    [state.karyawan, periodeAktif],
  );

  const daftar = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return rowsPeriode.filter((item) => {
      const cocokStatus = filterStatus === "all" || item.statusBayar === filterStatus;
      const cocokLokasi = filterLokasi === "all" || item.lokasi === filterLokasi;
      const cocokCari =
        !query || `${item.nama} ${item.jabatan} ${item.lokasi}`.toLowerCase().includes(query);
      return cocokStatus && cocokLokasi && cocokCari;
    });
  }, [rowsPeriode, filterStatus, filterLokasi, cari]);

  const totalGaji = rowsPeriode.reduce((sum, item) => sum + hitungGaji(item).netto, 0);
  const gajiBelumDibayar = rowsPeriode
    .filter((item) => item.statusBayar === "belum")
    .reduce((sum, item) => sum + hitungGaji(item).netto, 0);
  const sudahBayar = rowsPeriode.filter((item) => item.statusBayar === "terbayar").length;
  const totalTunjangan = rowsPeriode.reduce((sum, item) => sum + item.tunjangan + item.lembur, 0);
  const totalPotongan = rowsPeriode.reduce((sum, item) => sum + item.potongan, 0);

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label={periodeAktif ? "Total Gaji Periode Ini" : "Total Gaji Semua Gajian"}
          value={formatRp(totalGaji)}
          icon="payments"
          trend={`${rowsPeriode.length} karyawan · gajian ${
            periodeAktif ? formatTanggal(periodeAktif) : "bebas tanggal"
          }`}
          tone="gold"
        />
        <FinancialStatCard
          label="Belum Dibayar"
          value={formatRp(gajiBelumDibayar)}
          icon="schedule"
          trend={`${rowsPeriode.length - sudahBayar} karyawan menunggu`}
          tone="error"
        />
        <FinancialStatCard
          label="Tunjangan + Lembur"
          value={formatRp(totalTunjangan)}
          icon="add_circle"
          trend="Komponen tambahan payroll"
          tone="success"
        />
        <FinancialStatCard
          label="Potongan Kasbon/Bon"
          value={formatRp(totalPotongan)}
          icon="remove_circle"
          trend="Potongan dari gaji karyawan"
          tone="neutral"
        />
      </div>

      {!formTerbuka && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className={s.sectionSubtitle}>
            {readOnly
              ? "Rincian pendapatan, potongan bon/kasbon, dan status pembayaran per karyawan."
              : "Tanggal gajian bebas per karyawan — gajian tidak harus barengan. Tekan “Gaji lagi” di baris karyawan untuk menyimpan gaji berikutnya tanpa mengetik nama lagi."}
          </p>
          {!readOnly && (
            <button type="button" onClick={mulaiTambah} className={`${s.primaryButton} shrink-0`}>
              <span aria-hidden="true" className={s.iconMd}>
                person_add
              </span>
              Tambah Karyawan
            </button>
          )}
        </div>
      )}

      {gajiLagiRow && <DialogGajiLagi karyawan={gajiLagiRow} onTutup={() => setGajiLagiRow(null)} />}

      {formTerbuka && <FormKaryawan edit={edit} onSelesai={tutupForm} />}

      <section className={s.card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={s.sectionTitle}>Daftar Gaji Karyawan</h2>
            <p className={s.sectionSubtitle}>
              Buka slip gaji untuk rincian pendapatan, potongan bon/kasbon, dan tandai pembayaran yang sudah cair.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={s.dataCounter}>
              {daftar.length} dari {rowsPeriode.length} karyawan
            </span>
            {!readOnly && (
              <button type="button" onClick={formTerbuka ? tutupForm : mulaiTambah} className={s.secondaryButton}>
                <span aria-hidden="true" className={s.iconSm}>
                  {formTerbuka ? "close" : "person_add"}
                </span>
                {formTerbuka ? "Tutup Form" : "Tambah Karyawan"}
              </button>
            )}
          </div>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
          <label className="sr-only" htmlFor="payroll-filter-periode">
            Filter tanggal gajian
          </label>
          <select
            id="payroll-filter-periode"
            value={periodeAktif}
            onChange={(event) => setFilterPeriode(event.target.value)}
            className={s.filterSelect}
          >
            <option value="">Semua gajian</option>
            {daftarPeriode.map((item) => (
              <option key={item} value={item}>
                Gajian {formatTanggal(item)}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="payroll-cari">
            Cari karyawan
          </label>
          <input
            id="payroll-cari"
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari nama atau jabatan..."
            className={s.searchInput}
          />
          <label className="sr-only" htmlFor="payroll-filter-status">
            Filter status pembayaran
          </label>
          <select
            id="payroll-filter-status"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as "all" | "belum" | "terbayar")}
            className={s.filterSelect}
          >
            <option value="all">Semua status</option>
            <option value="belum">Belum dibayar</option>
            <option value="terbayar">Terbayar</option>
          </select>
          <label className="sr-only" htmlFor="payroll-filter-lokasi">
            Filter lokasi
          </label>
          <select
            id="payroll-filter-lokasi"
            value={filterLokasi}
            onChange={(event) => setFilterLokasi(event.target.value)}
            className={s.filterSelect}
          >
            <option value="all">Semua lokasi</option>
            {opsiPos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className={`mt-4 ${s.tableWrap}`}>
          <table className={`${s.table} min-w-[960px] xl:min-w-0`}>
            <thead className={s.tableHead}>
              <tr>
                <th scope="col" className={s.th}>
                  Nama
                </th>
                <th scope="col" className={s.th}>
                  Jabatan
                </th>
                <th scope="col" className={s.th}>
                  Periode
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Gaji Pokok
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Tunjangan / Lembur
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Potongan Kasbon/Bon
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Total Netto
                </th>
                <th scope="col" className={s.th}>
                  Status Pembayaran
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((item) => {
                const { netto } = hitungGaji(item);
                return (
                  <tr key={item.id} className={s.tr}>
                    <td className={s.tdStrong}>
                      <p>{item.nama}</p>
                      <p className={`${s.metaText} mt-0.5`}>{item.lokasi}</p>
                    </td>
                    <td className={s.tdMuted}>{item.jabatan}</td>
                    <td className={s.tdMuted}>{formatTanggal(item.periode)}</td>
                    <td className={`${s.td} text-right text-on-surface`}>{formatRp(item.gajiPokok)}</td>
                    <td className={`${s.td} text-right text-success`}>
                      +{formatRp(item.tunjangan + item.lembur)}
                      <span className={`${s.metaText} block`}>
                        {formatRp(item.tunjangan)} tunj · {formatRp(item.lembur)} lembur
                      </span>
                    </td>
                    <td className={`${s.td} text-right text-error`}>
                      -{formatRp(item.potongan)}
                    </td>
                    <td className={`${s.td} ${s.amountStrong} text-secondary`}>{formatRp(netto)}</td>
                    <td className={s.td}>
                      {item.statusBayar === "terbayar" ? (
                        <StatusBadge tone="approved" label={`Terbayar ${formatTanggal(item.tanggalBayar)}`} icon="check" />
                      ) : (
                        <StatusBadge tone="pending" label="Belum dibayar" icon="schedule" />
                      )}
                    </td>
                    <td className={`${s.td} text-right`}>
                      <div className={s.actionGroup}>
                        <button
                          type="button"
                          onClick={() => setSlip(item)}
                          aria-label={`Buka slip gaji ${item.nama}`}
                          className={s.ghostButton}
                        >
                          <span aria-hidden="true" className={s.iconSm}>
                            receipt_long
                          </span>
                          Slip Gaji
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() => setGajiLagiRow(item)}
                              aria-label={`Gaji lagi ${item.nama} di tanggal lain`}
                              title="Gaji lagi di tanggal lain"
                              className={s.actionButton}
                            >
                              <span aria-hidden="true" className={s.iconSm}>
                                event_repeat
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => mulaiUbah(item)}
                              aria-label={`Ubah data gaji ${item.nama}`}
                              title="Ubah data karyawan"
                              className={s.actionButton}
                            >
                              <span aria-hidden="true" className={s.iconSm}>
                                edit
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => bayarGaji(item.id, new Date().toISOString().slice(0, 10))}
                              disabled={item.statusBayar === "terbayar"}
                              aria-label={`Tandai terbayar gaji ${item.nama}`}
                              title="Tandai terbayar"
                              className={s.actionButton}
                            >
                              <span aria-hidden="true" className={s.iconSm}>
                                paid
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setHapus(item)}
                              aria-label={`Hapus karyawan ${item.nama}`}
                              title="Hapus karyawan"
                              className={s.actionButtonDanger}
                            >
                              <span aria-hidden="true" className={s.iconSm}>
                                delete
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {daftar.length === 0 && (
                <tr>
                  <td colSpan={9} className={s.emptyRow}>
Belum ada data karyawan. Tekan &ldquo;Tambah Karyawan&rdquo; untuk menambah, atau filter gajian lain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`mt-4 ${s.cardListWrap}`}>
          {daftar.length === 0 && (
            <p className={s.emptyRow}>Belum ada data karyawan. Tekan &ldquo;Tambah Karyawan&rdquo; untuk menambah, atau filter gajian lain.</p>
          )}
          {daftar.map((item) => {
            const { netto } = hitungGaji(item);
            return (
              <article key={item.id} className={s.cardListItem}>
                <div className={s.cardListHead}>
                  <div className="min-w-0">
                    <p className={`${s.cardListTitle} break-words`}>{item.nama}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {item.jabatan} · {item.lokasi} · gajian {formatTanggal(item.periode)}
                    </p>
                  </div>
                  {item.statusBayar === "terbayar" ? (
                    <StatusBadge tone="approved" label={`Terbayar ${formatTanggal(item.tanggalBayar)}`} icon="check" />
                  ) : (
                    <StatusBadge tone="pending" label="Belum dibayar" icon="schedule" />
                  )}
                </div>

                <div className={s.cardListGrid}>
                  <div>
                    <p className={s.cardListLabel}>Gaji Pokok</p>
                    <p className={s.cardListValue}>{formatRp(item.gajiPokok)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Netto</p>
                    <p className={`${s.cardListValue} font-bold text-secondary`}>{formatRp(netto)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Tunjangan + Lembur</p>
                    <p className={`${s.cardListValue} text-success`}>+{formatRp(item.tunjangan + item.lembur)}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {formatRp(item.tunjangan)} tunj · {formatRp(item.lembur)} lembur
                    </p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Potongan Kasbon/Bon</p>
                    <p className={`${s.cardListValue} text-error`}>-{formatRp(item.potongan)}</p>
                  </div>
                </div>

                <div className={s.cardListActions}>
                  <button
                    type="button"
                    onClick={() => setSlip(item)}
                    aria-label={`Buka slip gaji ${item.nama}`}
                    className={s.ghostButton}
                  >
                    <span aria-hidden="true" className={s.iconSm}>
                      receipt_long
                    </span>
                    Slip Gaji
                  </button>
                  {!readOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => setGajiLagiRow(item)}
                        aria-label={`Gaji lagi ${item.nama} di tanggal lain`}
                        className={s.ghostButton}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          event_repeat
                        </span>
                        Gaji lagi
                      </button>
                      <button
                        type="button"
                        onClick={() => mulaiUbah(item)}
                        aria-label={`Ubah data gaji ${item.nama}`}
                        title="Ubah data karyawan"
                        className={s.actionButton}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => bayarGaji(item.id, new Date().toISOString().slice(0, 10))}
                        disabled={item.statusBayar === "terbayar"}
                        aria-label={`Tandai terbayar gaji ${item.nama}`}
                        title="Tandai terbayar"
                        className={s.actionButton}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          paid
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHapus(item)}
                        aria-label={`Hapus karyawan ${item.nama}`}
                        title="Hapus karyawan"
                        className={s.actionButtonDanger}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          delete
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <DetailUangKas />

      {hapus && (
        <ModalHapusKaryawan
          karyawan={hapus}
          onTutup={() => setHapus(null)}
          onHapus={() => {
            hapusKaryawan(hapus.id);
            setHapus(null);
          }}
        />
      )}
      {slip && <SlipGajiModal karyawan={slip} onTutup={() => setSlip(null)} />}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}