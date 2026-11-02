"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
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
  BANGUN_LEDGER,
  type JenisTransaksi,
  type KategoriBiaya,
  type TransaksiKas,
} from "../types/types";
import * as s from "../style/style";
import { useReadOnly } from "@/frontend/shared/access/AccessModeProvider";
import { exportCashflowToExcel } from "./exportCashflow";
import { parseCashflowExcel } from "./importCashflow";

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

function FormKas() {
  const { tambahTransaksi, opsiKategori, opsiPerson, opsiPos, tambahOpsi } = useFinance();
  const [jenis, setJenis] = useState<JenisTransaksi>("kas_keluar");
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [uraian, setUraian] = useState("");
  const [nominal, setNominal] = useState(0);
  const [kategori, setKategori] = useState<string>((KATEGORI_BIAYA as readonly string[])[0] ?? "");
  const [person, setPerson] = useState("");
  const [pos, setPos] = useState("");
  const [noNota, setNoNota] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const JENIS_BE = JENIS_TRANSAKSI;

  const gantiJenis = (berikutnya: JenisTransaksi) => {
    setJenis(berikutnya);
    setKategori((KATEGORI_BIAYA as readonly string[])[0] ?? "");
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
      posProyek: pos,
      person: person.trim(),
      nominal,
      noNota: noNota.trim(),
      bukti: "",
      sumber: "manual",
      refId: "",
    });
    setUraian("");
    setNominal(0);
    setPerson("");
    setPos("");
    setNoNota("");
    setErrors({});
  };

  return (
    <form onSubmit={submit} className={s.card} noValidate>
      <h2 className={s.sectionTitle}>Catat Transaksi Kas</h2>
      <p className={s.sectionSubtitle}>
        Pilih jenis transaksi, lalu lengkapi tanggal, deskripsi, jumlah, kategori, nama pihak, dan nomor nota.
      </p>

      <fieldset className="mt-4">
        <legend className={s.fieldLabel}>Jenis Transaksi</legend>
        <div role="group" aria-label="Jenis transaksi kas" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
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

        <label className={s.fieldLabel}>
          No. Nota (Opsional)
          <input
            value={noNota}
            onChange={(event) => setNoNota(event.target.value)}
            placeholder="cth: INV/001 atau TRX-01"
            className={s.input}
          />
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

        <SelectTambahBaru
          label="Pos / Proyek"
          value={pos}
          options={opsiPos}
          placeholder="cth: Kantor, Karang Ploso"
          onChange={(value) => setPos(value)}
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



function ModalCetakNota({
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
        aria-labelledby="cetak-nota-judul"
        className={`${s.modalPanel} max-w-xl bg-white text-slate-900 shadow-2xl`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 print:hidden">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">ALUPBESK KEUANGAN</p>
            <h3 id="cetak-nota-judul" className="text-lg font-bold text-slate-900">
              Cetak Nota / Kwitansi Kas
            </h3>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">ALUPBESK</h1>
              <p className="text-xs font-semibold text-slate-600">Divisi Keuangan &amp; Administrasi Proyek</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase text-slate-900">
                {transaksi.jenis === "kas_masuk" ? "KWITANSI KAS MASUK" : transaksi.jenis === "kas_keluar" ? "NOTA KAS KELUAR" : "NOTA KAS BEREDAR"}
              </p>
              <p className="text-xs font-mono text-slate-600 mt-0.5">No: {transaksi.noNota || transaksi.id}</p>
              <p className="text-xs text-slate-600">Tanggal: {formatTanggal(transaksi.tanggal)}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-2">
              <span className="font-medium text-slate-500">
                {transaksi.jenis === "kas_masuk" ? "Diterima Dari" : "Dibayarkan Kepada"}
              </span>
              <span className="col-span-2 font-bold text-slate-900">{transaksi.person || "-"}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-2">
              <span className="font-medium text-slate-500">Uraian / Keterangan</span>
              <span className="col-span-2 font-semibold text-slate-900 leading-relaxed">{transaksi.uraian}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-2">
              <span className="font-medium text-slate-500">Kategori &amp; Pos Proyek</span>
              <span className="col-span-2 font-medium text-slate-900">
                {transaksi.kategori} · <span className="font-bold">{transaksi.posProyek || "Kantor"}</span>
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-slate-100 p-4 border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">Jumlah Nominal</span>
              <span className={`text-xl font-extrabold ${transaksi.jenis === "kas_masuk" ? "text-emerald-700" : "text-rose-700"}`}>
                {formatRp(transaksi.nominal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
            <div>
              <p className="text-slate-600 mb-16">Disetujui / Dibuat oleh,</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                Admin Keuangan
              </p>
            </div>
            <div>
              <p className="text-slate-600 mb-16">Penerima / Pemberi,</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                {transaksi.person || "_________________"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Tutup
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <span aria-hidden="true" className={s.iconSm}>
                print
              </span>
              <span>Cetak Nota Sekarang</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModalEditTransaksi({
  transaksi,
  onTutup,
}: {
  transaksi: TransaksiKas;
  onTutup: () => void;
}) {
  const { ubahTransaksi, opsiKategori, opsiPerson, opsiPos, tambahOpsi } = useFinance();
  const [jenis, setJenis] = useState<JenisTransaksi>(transaksi.jenis);
  const [tanggal, setTanggal] = useState(transaksi.tanggal);
  const [uraian, setUraian] = useState(transaksi.uraian);
  const [nominal, setNominal] = useState(transaksi.nominal);
  const [kategori, setKategori] = useState<string>(transaksi.kategori);
  const [person, setPerson] = useState(transaksi.person);
  const [pos, setPos] = useState(transaksi.posProyek);
  const [noNota, setNoNota] = useState(transaksi.noNota);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const JENIS_BE = JENIS_TRANSAKSI;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validasi: Record<string, string> = {};
    if (!tanggal) validasi.tanggal = "Tanggal wajib diisi.";
    if (!uraian.trim()) validasi.uraian = "Deskripsi wajib diisi.";
    if (nominal <= 0) validasi.nominal = "Jumlah harus lebih dari Rp 0.";
    setErrors(validasi);
    if (Object.keys(validasi).length > 0) return;

    ubahTransaksi({
      ...transaksi,
      tanggal,
      jenis,
      uraian: uraian.trim(),
      kategori,
      posProyek: pos,
      person: person.trim(),
      nominal,
      noNota: noNota.trim(),
    });
    onTutup();
  };

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-transaksi-judul"
        className={`${s.modalPanel} max-w-2xl`}
      >
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Ubah Transaksi Kas</p>
            <h3 id="edit-transaksi-judul" className={s.modalTitle}>
              {transaksi.id}
            </h3>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup form edit transaksi" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-6" noValidate>
          <fieldset>
            <legend className={s.fieldLabel}>Jenis Transaksi</legend>
            <div role="group" aria-label="Jenis transaksi kas" className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {JENIS_BE.map((item) => {
                const aktif = jenis === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={aktif}
                    onClick={() => setJenis(item)}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <label className={s.fieldLabel}>
              No. Nota (Opsional)
              <input
                value={noNota}
                onChange={(event) => setNoNota(event.target.value)}
                placeholder="cth: TRX-0001 / INV/01"
                className={s.input}
              />
            </label>

            <label className={`${s.fieldLabel} sm:col-span-2`}>
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
              onChange={(value) => setPerson(value)}
              onTambah={(value) => tambahOpsi("person", value)}
            />

            <SelectTambahBaru
              label="Pos / Proyek"
              value={pos}
              options={opsiPos}
              placeholder="cth: Kantor, Karang Ploso"
              onChange={(value) => setPos(value)}
              onTambah={(value) => tambahOpsi("pos", value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Batal
            </button>
            <button type="submit" className={s.primaryButton}>
              <span aria-hidden="true" className={s.iconSm}>
                save
              </span>
              Simpan Perubahan
            </button>
          </div>
        </form>
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

function ModalKembalikan({
  transaksi,
  sudahKembali,
  onTutup,
}: {
  transaksi: TransaksiKas;
  sudahKembali: number;
  onTutup: () => void;
}) {
  const { tambahTransaksi } = useFinance();
  const sisa = Math.max(transaksi.nominal - sudahKembali, 0);
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [nominal, setNominal] = useState(sisa);
  const [uraian, setUraian] = useState(`Pengembalian kas beredar ${transaksi.id}`);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tanggal) {
      setError("Tanggal pengembalian wajib diisi.");
      return;
    }
    if (nominal <= 0) {
      setError("Nominal pengembalian harus lebih dari Rp 0.");
      return;
    }
    if (nominal > sisa) {
      setError(`Nominal pengembalian melebihi sisa kas beredar (${formatRp(sisa)}).`);
      return;
    }
    tambahTransaksi({
      tanggal,
      jenis: "kas_masuk",
      uraian: uraian.trim() || `Pengembalian kas beredar ${transaksi.id}`,
      kategori: transaksi.kategori,
      posProyek: transaksi.posProyek,
      person: transaksi.person,
      nominal,
      noNota: "",
      bukti: "",
      sumber: "kembali",
      refId: transaksi.id,
    });
    onTutup();
  };

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section role="dialog" aria-modal="true" aria-labelledby="kembali-judul" className={`${s.modalPanel} max-w-lg`}>
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>Catat Pengembalian Kas Beredar</p>
            <h3 id="kembali-judul" className={s.modalTitle}>
              {transaksi.uraian}
            </h3>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup form pengembalian" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-6" noValidate>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container/40 p-3 text-center">
            <div>
              <p className={s.metaText}>Total Beredar</p>
              <p className="text-sm font-bold text-on-surface">{formatRp(transaksi.nominal)}</p>
            </div>
            <div>
              <p className={s.metaText}>Sudah Kembali</p>
              <p className="text-sm font-bold text-success">{formatRp(sudahKembali)}</p>
            </div>
            <div>
              <p className={s.metaText}>Sisa</p>
              <p className="text-sm font-bold text-warning">{formatRp(sisa)}</p>
            </div>
          </div>

          <label className={s.fieldLabel}>
            Tanggal Pengembalian
            <input
              type="date"
              value={tanggal}
              onChange={(event) => {
                setTanggal(event.target.value);
                setError("");
              }}
              className={s.input}
            />
          </label>

          <label className={s.fieldLabel}>
            Nominal Dikembalikan (Rp)
            <input
              type="text"
              inputMode="numeric"
              value={nominal > 0 ? new Intl.NumberFormat("id-ID").format(nominal) : ""}
              onChange={(event) => {
                setNominal(Number(event.target.value.replace(/\D/g, "")) || 0);
                setError("");
              }}
              placeholder="0"
              aria-invalid={Boolean(error)}
              className={s.input}
            />
          </label>

          <label className={s.fieldLabel}>
            Keterangan
            <input value={uraian} onChange={(event) => setUraian(event.target.value)} className={s.input} />
          </label>

          {error && (
            <span role="alert" className={s.inputErrorText}>
              {error}
            </span>
          )}

          <p className="text-xs leading-relaxed text-on-surface-variant">
            Nominal ini dicatat otomatis sebagai <span className="font-bold text-on-surface">Kas Masuk</span> dan
            menambah kembali saldo kas kantor. Sisa kas beredar setelah pengembalian:{" "}
            <span className="font-bold text-on-surface">{formatRp(Math.max(sisa - nominal, 0))}</span>.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Batal
            </button>
            <button type="submit" className={s.primaryButton}>
              <span aria-hidden="true" className={s.iconSm}>
                keyboard_return
              </span>
              Simpan Pengembalian
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function KasSection() {
  const readOnly = useReadOnly();
  const { state, opsiKategori, clearToast, tambahTransaksi } = useFinance();
  const [filterJenis, setFilterJenis] = useState<"all" | JenisTransaksi>("all");
  const [filterKategori, setFilterKategori] = useState<"all" | KategoriBiaya>("all");
  const [cari, setCari] = useState("");
  const [edit, setEdit] = useState<TransaksiKas | null>(null);
  const [cetakNota, setCetakNota] = useState<TransaksiKas | null>(null);
  const [hapus, setHapus] = useState<TransaksiKas | null>(null);
  const [kembali, setKembali] = useState<TransaksiKas | null>(null);
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [dikembalikan, setDikembalikan] = useState(0);

  const ledger = useMemo(() => BANGUN_LEDGER(state.transaksi, bulan), [state.transaksi, bulan]);

  const pengembalianBeredar = useMemo(() => {
    const map = new Map<string, number>();
    state.transaksi.forEach((item) => {
      if (item.jenis === "kas_masuk" && item.refId) {
        map.set(item.refId, (map.get(item.refId) ?? 0) + item.nominal);
      }
    });
    return map;
  }, [state.transaksi]);

  const sisaBeredar = (item: TransaksiKas) =>
    Math.max(item.nominal - (pengembalianBeredar.get(item.id) ?? 0), 0);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const items = await parseCashflowExcel(file);
      if (items.length === 0) {
        alert("Tidak ada data transaksi yang ditemukan di file Excel.");
        return;
      }
      for (const item of items) {
        tambahTransaksi({
          tanggal: item.tanggal || tanggalHariIni(),
          jenis: item.jenis || "kas_keluar",
          uraian: item.uraian || "Import Excel",
          kategori: item.kategori || "Dll",
          posProyek: item.posProyek || "Kantor",
          person: item.person || "",
          nominal: item.nominal || 0,
          noNota: item.noNota || "",
          bukti: "",
          sumber: "manual",
          refId: "",
        });
      }
      alert(`Berhasil mengimpor ${items.length} transaksi dari Excel!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengimpor file Excel.");
    } finally {
      e.target.value = "";
    }
  };

  const barisTampil = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return ledger.baris.filter((item) => {
      const cocokJenis = filterJenis === "all" || item.jenis === filterJenis;
      const cocokKategori = filterKategori === "all" || item.kategori === filterKategori;
      const cocokCari =
        !query ||
        `${item.uraian} ${item.person}`.toLowerCase().includes(query) ||
        (item.noNota || "").toLowerCase().includes(query);
      return cocokJenis && cocokKategori && cocokCari;
    });
  }, [ledger.baris, filterJenis, filterKategori, cari]);

  const saldoSebenarnya = ledger.saldoAkhir - dikembalikan;

  return (
    <div className="space-y-5">
      <div className={s.statGrid}>
        <FinancialStatCard
          label="Saldo Bulan Lalu"
          value={formatRp(ledger.saldoAwal)}
          icon="history"
          trend="Saldo awal periode terpilih"
          tone="gold"
        />
        <FinancialStatCard
          label="Pemasukan Bulan Ini"
          value={formatRp(ledger.totalMasuk)}
          icon="south_west"
          trend={`${ledger.baris.filter((item) => item.jenis === "kas_masuk").length} transaksi masuk`}
          tone="success"
        />
        <FinancialStatCard
          label="Pengeluaran Bulan Ini"
          value={formatRp(ledger.totalKeluar)}
          icon="north_east"
          trend={`${ledger.baris.filter((item) => item.jenis === "kas_keluar").length} transaksi keluar`}
          tone="error"
        />
        <FinancialStatCard
          label="Saldo Akhir"
          value={formatRp(ledger.saldoAkhir)}
          icon="account_balance_wallet"
          trend={`Kas beredar ${formatRp(ledger.totalBeredar)}`}
          tone="neutral"
        />
      </div>

      {!readOnly && <FormKas />}

      <section className={s.card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h2 className={s.sectionTitle}>Ledger Kas Bulanan</h2>
            <p className={s.sectionSubtitle}>
              {readOnly
                ? "Saldo bulan lalu, arus kas, dan saldo berjalan per periode."
                : "Saldo bulan lalu, arus kas, dan saldo berjalan per periode. Ubah atau hapus transaksi yang tidak sesuai pencatatan."}
            </p>
          </div>
              <div className="flex flex-wrap items-center justify-end gap-2 lg:self-end" suppressHydrationWarning>
            <span className={s.dataCounter}>
              {barisTampil.length} dari {ledger.baris.length} transaksi
            </span>
            <label className={s.fieldLabel}>
              <span className="sr-only">Pilih periode bulan</span>
              <input
                type="month"
                value={bulan}
                onChange={(event) => setBulan(event.target.value || new Date().toISOString().slice(0, 7))}
                className={`${s.input} text-xs py-1.5 px-2.5`}
              />
            </label>
            <label className="bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap cursor-pointer">
              <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Import Excel</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => exportCashflowToExcel(state.transaksi, bulan)}
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
        </div>

        <div className={`mt-4 ${s.tableWrap}`}>
          <table className={`${s.table} min-w-[1000px] xl:min-w-0`}>
            <thead className={s.tableHead}>
              <tr>
                <th scope="col" className={s.th}>
                  Tanggal
                </th>
                <th scope="col" className={s.th}>
                  Uraian
                </th>
                <th scope="col" className={s.th}>
                  Kategori
                </th>
                <th scope="col" className={s.th}>
                  Person
                </th>
                <th scope="col" className={s.th}>
                  Pos
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Masuk
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Keluar
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Beredar
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Saldo
                </th>
                <th scope="col" className={`${s.th} text-right`}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={s.tr}>
                <td colSpan={5} className={`${s.td} font-semibold text-on-surface`}>
                  Saldo Bulan Lalu
                </td>
                <td colSpan={3} className={s.tdMuted} />
                <td className={`${s.td} text-right font-bold text-on-surface`}>{formatRp(ledger.saldoAwal)}</td>
                <td className={s.td} />
              </tr>
              {barisTampil.map((item) => (
                <tr key={item.id} className={s.tr}>
                  <td className={s.tdMuted}>{formatTanggal(item.tanggal)}</td>
                  <td className={s.tdStrong}>
                    <p className="font-semibold text-on-surface">{item.uraian}</p>
                    <p className={`${s.metaText} mt-0.5`}>
                      {item.noNota ? `${item.noNota} · ` : ""}
                      {item.id}
                    </p>
                  </td>
                  <td className={s.tdMuted}>{item.kategori}</td>
                  <td className={s.tdMuted}>{item.person || "-"}</td>
                  <td className={s.tdMuted}>{item.posProyek || "-"}</td>
                  <td className={`${s.td} text-right font-semibold text-success`}>
                    {item.jenis === "kas_masuk" ? formatRp(item.nominal) : "-"}
                  </td>
                  <td className={`${s.td} text-right font-semibold text-error`}>
                    {item.jenis === "kas_keluar" ? formatRp(item.nominal) : "-"}
                  </td>
                  <td className={`${s.td} text-right font-semibold text-warning`}>
                    {item.jenis === "kas_beredar" ? (
                      <>
                        <span>{formatRp(item.nominal)}</span>
                        {(pengembalianBeredar.get(item.id) ?? 0) > 0 && sisaBeredar(item) > 0 && (
                          <span className={`${s.metaText} block`}>Sisa {formatRp(sisaBeredar(item))}</span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className={`${s.td} text-right font-bold text-on-surface`}>{formatRp(item.saldo)}</td>
                  <td className={`${s.td} text-right`}>
                    <div className={s.actionGroup}>
                       {item.jenis === "kas_beredar" && (
                         <StatusBadge
                           tone={sisaBeredar(item) === 0 ? "approved" : "pending"}
                           label={sisaBeredar(item) === 0 ? "Lunas" : "Beredar"}
                           icon={sisaBeredar(item) === 0 ? "check_circle" : "handshake"}
                         />
                       )}
                      {!readOnly && item.jenis === "kas_beredar" && sisaBeredar(item) > 0 && (
                        <button
                          type="button"
                          onClick={() => setKembali(item)}
                          aria-label={`Catat pengembalian kas beredar ${item.uraian}`}
                          title="Catat pengembalian"
                          className={s.actionButton}
                        >
                          <span aria-hidden="true" className={s.iconSm}>
                            keyboard_return
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCetakNota(item)}
                        aria-label={`Cetak nota ${item.uraian}`}
                        title="Cetak nota/kwitansi"
                        className={s.actionButton}
                      >
                        <span aria-hidden="true" className={s.iconSm}>
                          print
                        </span>
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setEdit(item)}
                          aria-label={`Ubah transaksi ${item.uraian}`}
                          title="Ubah transaksi"
                          className={s.actionButton}
                        >
                          <span aria-hidden="true" className={s.iconSm}>
                            edit
                          </span>
                        </button>
                      )}
                      {!readOnly && (
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
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {barisTampil.length === 0 && (
                <tr>
                  <td colSpan={10} className={s.emptyRow}>
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className={s.tr}>
                <td colSpan={5} className={`${s.td} font-bold text-on-surface`}>
                  Total Bulan Ini
                </td>
                <td className={`${s.td} text-right font-bold text-success`}>{formatRp(ledger.totalMasuk)}</td>
                <td className={`${s.td} text-right font-bold text-error`}>{formatRp(ledger.totalKeluar)}</td>
                <td className={`${s.td} text-right font-bold text-warning`}>{formatRp(ledger.totalBeredar)}</td>
                <td className={`${s.td} text-right font-bold text-on-surface`}>{formatRp(ledger.saldoAkhir)}</td>
                <td className={s.td} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={`mt-4 ${s.card} bg-surface-container/40`}>
          <h3 className={s.sectionTitle}>Rekonsiliasi Saldo Kas</h3>
          <p className={`${s.sectionSubtitle} mb-3`}>
            Masukkan saldo yang dikembalikan/ digunakan untuk melihat selisih kas sebenarnya. Angka ini hanya untuk
            laporan dan tidak mengubah transaksi sistem.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={s.fieldLabel}>Saldo Dikembalikan</span>
              <input
                type="number"
                inputMode="numeric"
                value={dikembalikan || ""}
                onChange={(event) => setDikembalikan(Number(event.target.value) || 0)}
                placeholder="0"
                className={s.input}
              />
            </label>
            <div>
              <p className={s.fieldLabel}>Saldo Akhir Ledger</p>
              <p className="mt-2 text-base font-bold text-on-surface">{formatRp(ledger.saldoAkhir)}</p>
            </div>
            <div>
              <p className={s.fieldLabel}>Saldo Kas Sebenarnya</p>
              <p className={`mt-2 text-base font-bold ${saldoSebenarnya < 0 ? "text-error" : "text-success"}`}>
                {formatRp(saldoSebenarnya)}
              </p>
            </div>
          </div>
        </div>

        <div className={`mt-4 ${s.cardListWrap}`}>
          {barisTampil.length === 0 && <p className={s.emptyRow}>Tidak ada transaksi yang cocok dengan filter.</p>}
          {barisTampil.map((item) => (
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
                  <p className={s.cardListLabel}>Person</p>
                  <p className={s.cardListValue}>{item.person || "-"}</p>
                </div>
                <div>
                  <p className={s.cardListLabel}>Pos / Proyek</p>
                  <p className={s.cardListValue}>{item.posProyek || "-"}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className={s.cardListLabel}>
                    {item.jenis === "kas_masuk" ? "Masuk" : item.jenis === "kas_keluar" ? "Keluar" : "Beredar"}
                  </p>
                  <p
                    className={`text-base font-bold ${
                      item.jenis === "kas_masuk"
                        ? "text-success"
                        : item.jenis === "kas_keluar"
                          ? "text-error"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {item.jenis === "kas_beredar"
                      ? formatRp(item.nominal)
                      : `${item.jenis === "kas_masuk" ? "+" : "-"}${formatRp(item.nominal)}`}
                  </p>
                  {item.jenis === "kas_beredar" &&
                    (pengembalianBeredar.get(item.id) ?? 0) > 0 &&
                    sisaBeredar(item) > 0 && (
                      <p className={`${s.metaText} mt-0.5`}>Sisa {formatRp(sisaBeredar(item))}</p>
                    )}
                </div>
                <div className="text-right">
                  <p className={s.cardListLabel}>Saldo</p>
                  <p className="text-base font-bold text-on-surface">{formatRp(item.saldo)}</p>
                </div>
              </div>

              <div className={s.cardListActions}>
                {!readOnly && item.jenis === "kas_beredar" && sisaBeredar(item) > 0 && (
                  <button
                    type="button"
                    onClick={() => setKembali(item)}
                    aria-label={`Catat pengembalian kas beredar ${item.uraian}`}
                    title="Catat pengembalian"
                    className={s.actionButton}
                  >
                    <span aria-hidden="true" className={s.iconSm}>
                      keyboard_return
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCetakNota(item)}
                  aria-label={`Cetak nota ${item.uraian}`}
                  title="Cetak nota/kwitansi"
                  className={s.actionButton}
                >
                  <span aria-hidden="true" className={s.iconSm}>
                    print
                  </span>
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setEdit(item)}
                    aria-label={`Ubah transaksi ${item.uraian}`}
                    title="Ubah transaksi"
                    className={s.actionButton}
                  >
                    <span aria-hidden="true" className={s.iconSm}>
                      edit
                    </span>
                  </button>
                )}
                {!readOnly && (
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
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {edit && <ModalEditTransaksi transaksi={edit} onTutup={() => setEdit(null)} />}
      {cetakNota && <ModalCetakNota transaksi={cetakNota} onTutup={() => setCetakNota(null)} />}
      {hapus && <ModalHapus transaksi={hapus} onTutup={() => setHapus(null)} />}
      {kembali && (
        <ModalKembalikan
          transaksi={kembali}
          sudahKembali={pengembalianBeredar.get(kembali.id) ?? 0}
          onTutup={() => setKembali(null)}
        />
      )}
      <FeedbackToast message={state.toast} onDismiss={clearToast} />
    </div>
  );
}
