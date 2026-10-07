"use client";

import { useMemo, useState } from "react";
import { useFinance } from "../FinanceStore/FinanceStore";
import { FeedbackToast } from "../ui/FeedbackToast/FeedbackToast";
import { FinancialStatCard } from "../ui/FinancialStatCard/FinancialStatCard";
import { SelectTambahBaru } from "../ui/SelectTambahBaru/SelectTambahBaru";
import { StatusBadge } from "../ui/StatusBadge/StatusBadge";
import { SlipGajiModal } from "../SlipGajiModal/SlipGajiModal";
import { formatRp, formatTanggal } from "../format/format";
import { hitungGaji, periodeBerikutnya, type Karyawan, type PosProyek } from "../types/types";
import * as s from "../style/style";

type DraftKaryawan = Omit<Karyawan, "id" | "statusBayar" | "tanggalBayar">;

const draftKosong = (): DraftKaryawan => ({
  nama: "",
  jabatan: "",
  lokasi: "Nganyang",
  gajiPokok: 0,
  tunjangan: 0,
  lembur: 0,
  potonganBon: 0,
  potonganKasbon: 0,
  periode: new Date().toISOString().slice(0, 7),
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
  potonganBon: karyawan.potonganBon,
  potonganKasbon: karyawan.potonganKasbon,
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
    if (!/^\d{4}-\d{2}$/.test(draft.periode)) validasi.periode = "Periode harus bulan berjalan, cth: 2026-10.";
    if (draft.potonganBon + draft.potonganKasbon > draft.gajiPokok + draft.tunjangan + draft.lembur)
      validasi.potonganBon = "Total potongan melebihi pendapatan karyawan.";
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
  const potongan = draft.potonganBon + draft.potonganKasbon;
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
          Periode Gaji
          <input
            type="month"
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
          label="Potongan Bon"
          nilai={draft.potonganBon}
          prefix="Rp"
          error={errors.potonganBon}
          onUbah={(value) => ubah("potonganBon", value)}
        />
        <InputRupiah
          label="Potongan Kasbon"
          nilai={draft.potonganKasbon}
          prefix="Rp"
          onUbah={(value) => ubah("potonganKasbon", value)}
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
              {karyawan.id} · {karyawan.jabatan} · {karyawan.periode}
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
            periode {karyawan.periode}.
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

export function PayrollSection() {
  const { state, totalGaji, gajiBelumDibayar, opsiPos, bayarGaji, hapusKaryawan, clearToast } =
    useFinance();
  const [filterStatus, setFilterStatus] = useState<"all" | "belum" | "terbayar">("all");
  const [filterLokasi, setFilterLokasi] = useState("all");
  const [cari, setCari] = useState("");
  const [slip, setSlip] = useState<Karyawan | null>(null);
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [edit, setEdit] = useState<Karyawan | null>(null);
  const [hapus, setHapus] = useState<Karyawan | null>(null);

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

  const urutBulanBerikutnya = useMemo(() => {
    const terakhir = [...state.karyawan].map((item) => item.periode).sort().at(-1);
    return periodeBerikutnya(terakhir ?? new Date().toISOString().slice(0, 7));
  }, [state.karyawan]);

  const daftar = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return state.karyawan.filter((item) => {
      const cocokStatus = filterStatus === "all" || item.statusBayar === filterStatus;
      const cocokLokasi = filterLokasi === "all" || item.lokasi === filterLokasi;
      const cocokCari =
        !query || `${item.nama} ${item.jabatan} ${item.lokasi}`.toLowerCase().includes(query);
      return cocokStatus && cocokLokasi && cocokCari;
    });
  }, [state.karyawan, filterStatus, filterLokasi, cari]);

  const sudahBayar = state.karyawan.filter((item) => item.statusBayar === "terbayar").length;
  const totalTunjangan = state.karyawan.reduce((sum, item) => sum + item.tunjangan + item.lembur, 0);
  const totalPotongan = state.karyawan.reduce(
    (sum, item) => sum + item.potonganBon + item.potonganKasbon,
    0,
  );

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label="Total Gaji Bulan Ini"
          value={formatRp(totalGaji)}
          icon="payments"
          trend={`${state.karyawan.length} karyawan · periode ${state.karyawan[0]?.periode ?? "-"}`}
          tone="gold"
        />
        <FinancialStatCard
          label="Belum Dibayar"
          value={formatRp(gajiBelumDibayar)}
          icon="schedule"
          trend={`${state.karyawan.length - sudahBayar} karyawan menunggu`}
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
          label="Potongan Bon + Kasbon"
          value={formatRp(totalPotongan)}
          icon="remove_circle"
          trend="Potongan dari gaji karyawan"
          tone="neutral"
        />
      </div>

      {!formTerbuka && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className={s.sectionSubtitle}>
            Belum ada karyawan baru di periode {urutBulanBerikutnya}? Tambahkan dulu agar bisa dihitung di slip gaji.
          </p>
          <button type="button" onClick={mulaiTambah} className={`${s.primaryButton} shrink-0`}>
            <span aria-hidden="true" className={s.iconMd}>
              person_add
            </span>
            Tambah Karyawan
          </button>
        </div>
      )}

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
              {daftar.length} dari {state.karyawan.length} karyawan
            </span>
            <button type="button" onClick={formTerbuka ? tutupForm : mulaiTambah} className={s.secondaryButton}>
              <span aria-hidden="true" className={s.iconSm}>
                {formTerbuka ? "close" : "person_add"}
              </span>
              {formTerbuka ? "Tutup Form" : "Tambah Karyawan"}
            </button>
          </div>
        </div>

        <div className={`mt-4 ${s.toolbarRow}`}>
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
                  Potongan Bon/Kasbon
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
                    <td className={s.tdMuted}>{item.periode}</td>
                    <td className={`${s.td} text-right text-on-surface`}>{formatRp(item.gajiPokok)}</td>
                    <td className={`${s.td} text-right text-success`}>
                      +{formatRp(item.tunjangan + item.lembur)}
                      <span className={`${s.metaText} block`}>
                        {formatRp(item.tunjangan)} tunj · {formatRp(item.lembur)} lembur
                      </span>
                    </td>
                    <td className={`${s.td} text-right text-error`}>
                      -{formatRp(item.potonganBon + item.potonganKasbon)}
                      <span className={`${s.metaText} block`}>
                        {formatRp(item.potonganBon)} bon · {formatRp(item.potonganKasbon)} kasbon
                      </span>
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
                      </div>
                    </td>
                  </tr>
                );
              })}
              {daftar.length === 0 && (
                <tr>
                  <td colSpan={9} className={s.emptyRow}>
Belum ada data karyawan. Tekan &ldquo;Tambah Karyawan&rdquo; untuk mengisi data payroll.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`mt-4 ${s.cardListWrap}`}>
          {daftar.length === 0 && (
            <p className={s.emptyRow}>Belum ada data karyawan. Tekan &ldquo;Tambah Karyawan&rdquo; untuk mengisi data payroll.</p>
          )}
          {daftar.map((item) => {
            const { netto } = hitungGaji(item);
            return (
              <article key={item.id} className={s.cardListItem}>
                <div className={s.cardListHead}>
                  <div className="min-w-0">
                    <p className={`${s.cardListTitle} break-words`}>{item.nama}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {item.jabatan} · {item.lokasi} · {item.periode}
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
                    <p className={s.cardListLabel}>Potongan Bon/Kasbon</p>
                    <p className={`${s.cardListValue} text-error`}>-{formatRp(item.potonganBon + item.potonganKasbon)}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {formatRp(item.potonganBon)} bon · {formatRp(item.potonganKasbon)} kasbon
                    </p>
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
                </div>
              </article>
            );
          })}
        </div>
      </section>

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