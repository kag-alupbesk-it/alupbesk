"use client";

import { Fragment, useMemo, useState } from "react";
import { useFinance } from "../FinanceStore/FinanceStore";
import { FeedbackToast } from "../ui/FeedbackToast/FeedbackToast";
import { FinancialStatCard } from "../ui/FinancialStatCard/FinancialStatCard";
import { SelectTambahBaru } from "../ui/SelectTambahBaru/SelectTambahBaru";
import { StatusBadge } from "../ui/StatusBadge/StatusBadge";
import { SlipGajiModal } from "../SlipGajiModal/SlipGajiModal";
import { bulanHariIni, formatBulan, formatRp, formatTanggal } from "../format/format";
import {
  hitungGaji,
  type Karyawan,
  type Penggajian,
  type PosProyek,
  type StatusBayarGaji,
} from "../types/types";
import * as s from "../style/style";
import { useReadOnly } from "@/frontend/shared/access/AccessModeProvider";

type DraftKaryawan = Omit<Karyawan, "id">;

type Baris = {
  key: string;
  karyawan: Karyawan | null;
  slip: Penggajian | null;
  nama: string;
  jabatan: string;
  lokasi: PosProyek;
  gajiPokok: number;
  tunjangan: number;
  potongan: number;
  metodeBayar: string;
  status: StatusBayarGaji;
};

const draftKosong = (): DraftKaryawan => ({
  nama: "",
  jabatan: "",
  lokasi: "Kantor",
  gajiPokok: 0,
  tunjangan: 0,
  metodeBayar: "Transfer BCA",
});

const METODE_BAYAR = ["Transfer BCA", "Transfer BRI", "Tunai", "Cek"];

const draftDari = (karyawan: Karyawan): DraftKaryawan => ({
  nama: karyawan.nama,
  jabatan: karyawan.jabatan,
  lokasi: karyawan.lokasi,
  gajiPokok: karyawan.gajiPokok,
  tunjangan: karyawan.tunjangan,
  metodeBayar: karyawan.metodeBayar,
});

const tanggalHariIni = () => new Date().toISOString().slice(0, 10);

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

function InlinePayrollEditor({ slip }: { slip: Penggajian }) {
  const { ubahPenggajian, hapusPenggajian } = useFinance();
  const [tunjangan, setTunjangan] = useState(slip.tunjangan);
  const [potongan, setPotongan] = useState(slip.potongan);

  const simpan = () => {
    ubahPenggajian(slip.id, tunjangan, potongan, slip.metodeBayar);
  };

  return (
    <div className="rounded-xl border border-outline/30 bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Komponen Slip {formatBulan(slip.periode)}: {slip.nama}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <InputRupiah
          label="Tunjangan"
          nilai={tunjangan}
          prefix="Rp"
          onUbah={setTunjangan}
        />
        <InputRupiah
          label="Potongan Kasbon/Bon"
          nilai={potongan}
          prefix="Rp"
          onUbah={setPotongan}
        />
        <div className="flex items-end">
          <button type="button" onClick={simpan} className={`${s.primaryButton} w-full`}>
            Simpan Komponen
          </button>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => hapusPenggajian(slip.id)}
            className={`${s.dangerButton} w-full`}
          >
            <span aria-hidden="true" className={s.iconSm}>
              delete
            </span>
            Hapus Slip
          </button>
        </div>
      </div>
    </div>
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
    setErrors(validasi);
    if (Object.keys(validasi).length > 0) return;

    const payload = {
      ...draft,
      nama: draft.nama.trim(),
      jabatan: draft.jabatan.trim(),
    };
    if (edit) ubahKaryawan({ ...payload, id: edit.id });
    else tambahKaryawan(payload);
    onSelesai();
  };

  return (
    <form onSubmit={submit} className={s.card} noValidate>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className={s.sectionTitle}>{edit ? "Ubah Data Karyawan" : "Tambah Karyawan"}</h2>
          <p className={s.sectionSubtitle}>
            Data ini menjadi acuan slip gaji baru. Tunjangan dan potongan per bulan dapat diubah pada slip masing-masing.
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

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className={s.fieldLabel}>
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

        <InputRupiah
          label="Gaji Pokok"
          nilai={draft.gajiPokok}
          prefix="Rp"
          error={errors.gajiPokok}
          onUbah={(value) => ubah("gajiPokok", value)}
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
          label="Tunjangan"
          nilai={draft.tunjangan}
          prefix="Rp"
          onUbah={(value) => ubah("tunjangan", value)}
        />
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
  const { netto } = hitungGaji({ ...karyawan, potongan: 0 });
  const adaRiwayat = state.penggajian.some((item) => item.karyawanId === karyawan.id);

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
              {karyawan.id} · {karyawan.jabatan}
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
            <span className="font-bold text-on-surface">{formatRp(netto)}</span> akan dihapus dari daftar karyawan.
          </p>
          <div className={adaRiwayat ? s.panelHighlight : s.panelMuted}>
            <p className={s.cardListLabel}>Dampak Penghapusan</p>
            <p className={`${s.detailValue} mt-1`}>
              {adaRiwayat
                ? "Riwayat slip gaji dan transaksi Kas Keluar atas nama ini tetap tersimpan dan dapat dibuka kembali."
                : "Belum ada riwayat slip gaji untuk karyawan ini."}
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
            Rekap kas seluruh transaksi — gaji yang dibayar otomatis tercatat sebagai uang keluar.
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
  const {
    state,
    opsiPos,
    buatPenggajian,
    buatPenggajianBulan,
    bayarGaji,
    bayarLangsung,
    batalkanBayar,
    hapusKaryawan,
    clearToast,
  } = useFinance();
  const [periode, setPeriode] = useState(() => bulanHariIni());
  const [filterStatus, setFilterStatus] = useState<"all" | "belum" | "terbayar">("all");
  const [filterLokasi, setFilterLokasi] = useState("all");
  const [cari, setCari] = useState("");
  const [slipTerbuka, setSlipTerbuka] = useState<Penggajian | null>(null);
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [edit, setEdit] = useState<Karyawan | null>(null);
  const [hapus, setHapus] = useState<Karyawan | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((curr) => ({ ...curr, [id]: !curr[id] }));
  };

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

  const slipPeriode = useMemo(
    () => state.penggajian.filter((item) => item.periode === periode),
    [state.penggajian, periode],
  );

  const totalGaji = slipPeriode.reduce((sum, item) => sum + hitungGaji(item).netto, 0);
  const belumBayar = slipPeriode.filter((item) => item.statusBayar === "belum");
  const terbayar = slipPeriode.filter((item) => item.statusBayar === "terbayar");
  const gajiBelumDibayar = belumBayar.reduce((sum, item) => sum + hitungGaji(item).netto, 0);
  const totalTunjangan = slipPeriode.reduce((sum, item) => sum + item.tunjangan, 0);
  const totalPotongan = slipPeriode.reduce((sum, item) => sum + item.potongan, 0);
  const belumDibuat = state.karyawan.filter(
    (item) => !slipPeriode.some((slip) => slip.karyawanId === item.id),
  ).length;

  const daftar = useMemo<Baris[]>(() => {
    const query = cari.trim().toLowerCase();
    const hasil: Baris[] = [];

    for (const karyawan of state.karyawan) {
      const slip = slipPeriode.find((item) => item.karyawanId === karyawan.id) ?? null;
      const status = slip?.statusBayar ?? "belum";
      if (filterStatus !== "all" && status !== filterStatus) continue;
      const lokasi = slip?.lokasi ?? karyawan.lokasi;
      if (filterLokasi !== "all" && lokasi !== filterLokasi) continue;
      if (query && !`${karyawan.nama} ${karyawan.jabatan} ${karyawan.lokasi}`.toLowerCase().includes(query))
        continue;
      hasil.push({
        key: karyawan.id,
        karyawan,
        slip,
        nama: karyawan.nama,
        jabatan: karyawan.jabatan,
        lokasi,
        gajiPokok: slip?.gajiPokok ?? karyawan.gajiPokok,
        tunjangan: slip?.tunjangan ?? karyawan.tunjangan,
        potongan: slip?.potongan ?? 0,
        metodeBayar: slip?.metodeBayar ?? karyawan.metodeBayar,
        status,
      });
    }

    for (const slip of slipPeriode) {
      if (state.karyawan.some((item) => item.id === slip.karyawanId)) continue;
      if (filterStatus !== "all" && slip.statusBayar !== filterStatus) continue;
      if (filterLokasi !== "all" && slip.lokasi !== filterLokasi) continue;
      if (query && !`${slip.nama} ${slip.jabatan} ${slip.lokasi}`.toLowerCase().includes(query)) continue;
      hasil.push({
        key: slip.id,
        karyawan: null,
        slip,
        nama: slip.nama,
        jabatan: slip.jabatan,
        lokasi: slip.lokasi,
        gajiPokok: slip.gajiPokok,
        tunjangan: slip.tunjangan,
        potongan: slip.potongan,
        metodeBayar: slip.metodeBayar,
        status: slip.statusBayar,
      });
    }

    return hasil;
  }, [state.karyawan, slipPeriode, filterStatus, filterLokasi, cari]);

  const badgeStatus = (baris: Baris) => {
    if (!baris.slip) {
      return <StatusBadge tone="pending" label="Slip belum dibuat" icon="schedule" />;
    }
    if (baris.status === "terbayar") {
      return (
        <StatusBadge
          tone="approved"
          label={`Terbayar ${formatTanggal(baris.slip.tanggalBayar)}`}
          icon="check"
        />
      );
    }
    return <StatusBadge tone="pending" label="Belum dibayar" icon="schedule" />;
  };

  const aksiBaris = (baris: Baris) => {
    const { karyawan, slip } = baris;
    return (
      <div className={s.actionGroup}>
        {slip && (
          <button
            type="button"
            onClick={() => setSlipTerbuka(slip)}
            aria-label={`Buka slip gaji ${baris.nama}`}
            className={s.ghostButton}
          >
            <span aria-hidden="true" className={s.iconSm}>
              receipt_long
            </span>
            Slip Gaji
          </button>
        )}
        {!readOnly && karyawan && !slip && (
          <>
            <button
              type="button"
              onClick={() => buatPenggajian(karyawan.id, periode)}
              aria-label={`Buat slip gaji ${baris.nama}`}
              className={s.ghostButton}
            >
              <span aria-hidden="true" className={s.iconSm}>
                add_card
              </span>
              Buat Slip
            </button>
            <button
              type="button"
              onClick={() => bayarLangsung(karyawan.id, periode, tanggalHariIni())}
              aria-label={`Bayar langsung gaji ${baris.nama}`}
              title="Buat slip dan bayar hari ini"
              className={s.actionButton}
            >
              <span aria-hidden="true" className={s.iconSm}>
                paid
              </span>
            </button>
          </>
        )}
        {!readOnly && slip?.statusBayar === "belum" && (
          <button
            type="button"
            onClick={() => bayarGaji(slip.id, tanggalHariIni())}
            aria-label={`Bayar gaji ${baris.nama}`}
            title="Bayar hari ini"
            className={s.actionButton}
          >
            <span aria-hidden="true" className={s.iconSm}>
              paid
            </span>
          </button>
        )}
        {!readOnly && slip?.statusBayar === "terbayar" && (
          <button
            type="button"
            onClick={() => batalkanBayar(slip.id)}
            aria-label={`Batalkan pembayaran gaji ${baris.nama}`}
            title="Batalkan pembayaran"
            className={s.actionButtonDanger}
          >
            <span aria-hidden="true" className={s.iconSm}>
              undo
            </span>
          </button>
        )}
        {!readOnly && karyawan && (
          <>
            <button
              type="button"
              onClick={() => mulaiUbah(karyawan)}
              aria-label={`Ubah data karyawan ${baris.nama}`}
              title="Ubah data karyawan"
              className={s.actionButton}
            >
              <span aria-hidden="true" className={s.iconSm}>
                edit
              </span>
            </button>
            <button
              type="button"
              onClick={() => setHapus(karyawan)}
              aria-label={`Hapus karyawan ${baris.nama}`}
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
    );
  };

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label={`Total Gaji ${formatBulan(periode)}`}
          value={formatRp(totalGaji)}
          icon="payments"
          trend={`${slipPeriode.length} slip · ${terbayar.length} sudah dibayar`}
          tone="gold"
        />
        <FinancialStatCard
          label="Belum Dibayar"
          value={formatRp(gajiBelumDibayar)}
          icon="schedule"
          trend={`${belumBayar.length} slip menunggu · ${belumDibuat} karyawan belum dibuatkan slip`}
          tone="error"
        />
        <FinancialStatCard
          label="Tunjangan"
          value={formatRp(totalTunjangan)}
          icon="add_circle"
          trend="Komponen tambahan slip bulan ini"
          tone="success"
        />
        <FinancialStatCard
          label="Potongan Kasbon/Bon"
          value={formatRp(totalPotongan)}
          icon="remove_circle"
          trend="Potongan pada slip bulan ini"
          tone="neutral"
        />
      </div>

      {formTerbuka && <FormKaryawan edit={edit} onSelesai={tutupForm} />}

      <section className={s.card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className={s.sectionTitle}>Daftar Gaji Karyawan</h2>
            <p className={s.sectionSubtitle}>
              Pilih bulan gaji, buat slip, lalu bayar. Slip yang sudah dibayar terkunci dan dapat dibatalkan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={s.dataCounter}>{daftar.length} baris</span>
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() => buatPenggajianBulan(periode)}
                  className={s.secondaryButton}
                  disabled={!periode || state.karyawan.length === 0}
                >
                  <span aria-hidden="true" className={s.iconSm}>
                    playlist_add
                  </span>
                  Buat Semua Slip
                </button>
                <button type="button" onClick={formTerbuka ? tutupForm : mulaiTambah} className={s.secondaryButton}>
                  <span aria-hidden="true" className={s.iconSm}>
                    {formTerbuka ? "close" : "person_add"}
                  </span>
                  {formTerbuka ? "Tutup Form" : "Tambah Karyawan"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
          <label className="sr-only" htmlFor="payroll-periode">
            Bulan gaji
          </label>
          <input
            id="payroll-periode"
            type="month"
            value={periode}
            onChange={(event) => setPeriode(event.target.value)}
            className={s.filterSelect}
            aria-label="Bulan gaji"
          />
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

        {periode && (
          <p className={`mt-3 ${s.metaText}`}>
            Menampilkan gaji periode <span className="font-bold text-on-surface">{formatBulan(periode)}</span>
            {belumDibuat > 0 ? ` · ${belumDibuat} karyawan belum dibuatkan slip` : ""}
          </p>
        )}

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
                <th scope="col" className={`${s.th} text-right`}>
                  Gaji Pokok
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Tunjangan
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Potongan
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Total Netto
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
              {daftar.map((baris) => {
                const { netto } = hitungGaji(baris);
                const bisaEdit = Boolean(
                  !readOnly && baris.karyawan && baris.slip?.statusBayar === "belum",
                );
                const isExpanded = bisaEdit && Boolean(expanded[baris.key]);
                return (
                  <Fragment key={baris.key}>
                    <tr
                      className={`${s.tr} ${bisaEdit ? "cursor-pointer hover:bg-surface-variant/30" : ""}`}
                      onClick={() => bisaEdit && toggleExpand(baris.key)}
                    >
                      <td className={s.tdStrong}>
                        <div className="flex items-center gap-2">
                          {bisaEdit && (
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                              {isExpanded ? "expand_less" : "expand_more"}
                            </span>
                          )}
                          <div>
                            <p>{baris.nama}</p>
                            {!baris.karyawan && (
                              <p className={`${s.metaText} mt-0.5`}>Karyawan sudah dihapus</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={s.tdMuted}>{baris.jabatan}</td>
                      <td className={`${s.td} text-right text-on-surface`}>{formatRp(baris.gajiPokok)}</td>
                      <td className={`${s.td} text-right text-success`}>+{formatRp(baris.tunjangan)}</td>
                      <td className={`${s.td} text-right text-error`}>-{formatRp(baris.potongan)}</td>
                      <td className={`${s.td} ${s.amountStrong} text-secondary`}>{formatRp(netto)}</td>
                      <td className={s.td}>{badgeStatus(baris)}</td>
                      <td className={`${s.td} text-right`} onClick={(event) => event.stopPropagation()}>
                        {aksiBaris(baris)}
                      </td>
                    </tr>
                    {isExpanded && baris.slip && (
                      <tr className="bg-surface-variant/40">
                        <td colSpan={8} className="p-4">
                          <InlinePayrollEditor slip={baris.slip} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {daftar.length === 0 && (
                <tr>
                  <td colSpan={8} className={s.emptyRow}>
                    Belum ada data gaji untuk periode ini. Tekan &ldquo;Buat Semua Slip&rdquo; atau tambah karyawan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`mt-4 ${s.cardListWrap}`}>
          {daftar.length === 0 && (
            <p className={s.emptyRow}>
              Belum ada data gaji untuk periode ini. Tekan &ldquo;Buat Semua Slip&rdquo; atau tambah karyawan.
            </p>
          )}
          {daftar.map((baris) => {
            const { netto } = hitungGaji(baris);
            return (
              <article key={baris.key} className={s.cardListItem}>
                <div className={s.cardListHead}>
                  <div className="min-w-0">
                    <p className={`${s.cardListTitle} break-words`}>{baris.nama}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {baris.jabatan} · {baris.lokasi}
                      {!baris.karyawan ? " · karyawan sudah dihapus" : ""}
                    </p>
                  </div>
                  {badgeStatus(baris)}
                </div>

                <div className={s.cardListGrid}>
                  <div>
                    <p className={s.cardListLabel}>Gaji Pokok</p>
                    <p className={s.cardListValue}>{formatRp(baris.gajiPokok)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Netto</p>
                    <p className={`${s.cardListValue} font-bold text-secondary`}>{formatRp(netto)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Tunjangan</p>
                    <p className={`${s.cardListValue} text-success`}>+{formatRp(baris.tunjangan)}</p>
                  </div>
                  <div>
                    <p className={s.cardListLabel}>Potongan</p>
                    <p className={`${s.cardListValue} text-error`}>-{formatRp(baris.potongan)}</p>
                  </div>
                </div>

                {aksiBaris(baris)}
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
      {slipTerbuka && <SlipGajiModal slip={slipTerbuka} onTutup={() => setSlipTerbuka(null)} />}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}
