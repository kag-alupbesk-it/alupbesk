"use client";

import { useState } from "react";
import { useFinance } from "../FinanceStore/FinanceStore";
import { CurrencyInput } from "../ui/CurrencyInput/CurrencyInput";
import { formatRp, tanggalHariIni } from "../format/format";
import type { Invoice } from "../types/types";
import * as s from "../style/style";

const PIHAK_OPTIONS = ["Kontraktor", "Toko"] as const;
type Pihak = (typeof PIHAK_OPTIONS)[number];

type BarisTermin = {
  key: string;
  id: string;
  label: string;
  persen: string;
  nominal: number;
  jatuhTempo: string;
  tanggal: string;
  lunas: boolean;
};

function buatKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function hitungPersen(nominal: number, total: number): string {
  if (total <= 0 || nominal <= 0) return "";
  return String(Math.round((nominal / total) * 10000) / 100);
}

interface Props {
  awal?: Invoice;
  onTutup: () => void;
}

export function InvoiceFormModal({ awal, onTutup }: Props) {
  const { tambahInvoice, ubahInvoice, opsiPos, state } = useFinance();

  const totalAwal = awal ? awal.termin.reduce((sum, item) => sum + item.nominal, 0) : 0;

  const [nomor, setNomor] = useState(awal?.nomor ?? "");
  const [tanggal, setTanggal] = useState(awal?.tanggal ?? tanggalHariIni());
  const [pihak, setPihak] = useState<Pihak>(awal?.pihak ?? "Kontraktor");
  const [nama, setNama] = useState(awal?.nama ?? "");
  const [proyek, setProyek] = useState(awal?.proyek ?? "");
  const [posProyek, setPosProyek] = useState(awal?.posProyek ?? (opsiPos[0] ?? ""));
  const [uraian, setUraian] = useState(awal?.uraian ?? "");
  const [total, setTotal] = useState(totalAwal);
  const [termin, setTermin] = useState<BarisTermin[]>(() =>
    awal
      ? awal.termin.map((item) => ({
          key: buatKey(),
          id: item.id,
          label: item.label,
          persen: hitungPersen(item.nominal, totalAwal),
          nominal: item.nominal,
          jatuhTempo: item.jatuhTempo,
          tanggal: item.tanggal,
          lunas: item.lunas,
        }))
      : [
          {
            key: buatKey(),
            id: "",
            label: "DP",
            persen: "",
            nominal: 0,
            jatuhTempo: tanggalHariIni(),
            tanggal: tanggalHariIni(),
            lunas: false,
          },
        ],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalTermin = termin.reduce((sum, item) => sum + item.nominal, 0);
  const selisih = total - totalTermin;
  const saranNama = Array.from(new Set(state.invoice.map((item) => item.nama).filter(Boolean)));

  const ubahTotal = (value: number) => {
    setTotal(value);
    setErrors((current) => ({ ...current, total: "", terminTotal: "" }));
    setTermin((daftar) =>
      daftar.map((item) => (item.nominal > 0 ? { ...item, persen: hitungPersen(item.nominal, value) } : item)),
    );
  };

  const ubahPersen = (key: string, raw: string) => {
    const pct = Number(raw.replace(",", "."));
    setErrors((current) => ({ ...current, terminTotal: "" }));
    setTermin((daftar) =>
      daftar.map((item) =>
        item.key === key
          ? {
              ...item,
              persen: raw,
              nominal: Number.isFinite(pct) && total > 0 ? Math.round((total * pct) / 100) : 0,
            }
          : item,
      ),
    );
  };

  const ubahNominal = (key: string, nominal: number) => {
    setErrors((current) => ({ ...current, terminTotal: "" }));
    setTermin((daftar) =>
      daftar.map((item) =>
        item.key === key ? { ...item, nominal, persen: hitungPersen(nominal, total) } : item,
      ),
    );
  };

  const ubahFieldTermin = (key: string, patch: Partial<BarisTermin>) =>
    setTermin((daftar) => daftar.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const tambahBaris = () => {
    const sisa = Math.max(total - totalTermin, 0);
    setErrors((current) => ({ ...current, terminTotal: "", termin: "" }));
    setTermin((daftar) => [
      ...daftar,
      {
        key: buatKey(),
        id: "",
        label: `Termin ${daftar.length + 1}`,
        persen: hitungPersen(sisa, total),
        nominal: sisa,
        jatuhTempo: tanggalHariIni(),
        tanggal,
        lunas: false,
      },
    ]);
  };

  const hapusBaris = (key: string) =>
    setTermin((daftar) => (daftar.length <= 1 ? daftar : daftar.filter((item) => item.key !== key)));

  const buatNomorOtomatis = () => {
    const tahun = new Date().getFullYear();
    const lanjut = state.invoice.reduce((max, item) => {
      const cocok = item.nomor.match(/(\d+)\s*$/);
      return cocok ? Math.max(max, Number(cocok[1])) : max;
    }, 0);
    setNomor(`INV/${tahun}/${String(lanjut + 1).padStart(3, "0")}`);
    setErrors((current) => ({ ...current, nomor: "" }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validasi: Record<string, string> = {};
    if (!nomor.trim()) validasi.nomor = "Nomor invoice wajib diisi.";
    if (!tanggal) validasi.tanggal = "Tanggal invoice wajib diisi.";
    if (total <= 0) validasi.total = "Total nilai tagihan wajib diisi.";
    if (!nama.trim()) validasi.nama = "Nama kontraktor/toko wajib diisi.";
    if (!proyek.trim()) validasi.proyek = "Nama proyek wajib diisi.";
    if (!posProyek.trim()) validasi.posProyek = "Pos/lokasi proyek wajib diisi.";
    if (termin.length === 0) validasi.termin = "Minimal satu baris termin.";
    termin.forEach((item, index) => {
      if (!item.label.trim()) validasi[`label-${index}`] = "Label wajib diisi.";
      if (!item.jatuhTempo) validasi[`jatuh-${index}`] = "Jatuh tempo wajib diisi.";
      if (item.nominal <= 0) validasi[`nominal-${index}`] = "Nominal harus lebih dari Rp 0.";
    });
    if (total > 0 && Math.abs(selisih) > 0.5) {
      validasi.terminTotal = `Total termin ${formatRp(totalTermin)} belum sama dengan total tagihan ${formatRp(total)}.`;
    }
    setErrors(validasi);
    if (Object.keys(validasi).length > 0) return;

    const payload = {
      nomor: nomor.trim(),
      tanggal,
      pihak,
      nama: nama.trim(),
      proyek: proyek.trim(),
      posProyek,
      uraian: uraian.trim(),
      termin: termin.map((item) => ({
        id: item.id || buatKey(),
        label: item.label.trim(),
        tanggal: item.tanggal || tanggal,
        jatuhTempo: item.jatuhTempo,
        nominal: item.nominal,
        lunas: item.lunas,
      })),
    };

    if (awal) ubahInvoice({ ...payload, id: awal.id });
    else tambahInvoice(payload);
    onTutup();
  };

  const terminCocok = total > 0 && Math.abs(selisih) <= 0.5;
  const totalBelumDiisi = total <= 0;
  const toneIndikator = totalBelumDiisi
    ? "border-outline/30 bg-surface-variant/60 text-on-surface-variant"
    : terminCocok
      ? "border-success/40 bg-success/10 text-success"
      : "border-error/40 bg-error/10 text-error";

  return (
    <div className={s.modalOverlay} onMouseDown={(event) => event.target === event.currentTarget && onTutup()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-form-judul"
        className={`${s.modalPanel} max-w-5xl`}
      >
        <header className={s.modalHeader}>
          <div className="min-w-0">
            <p className={s.fieldLabel}>{awal ? "Ubah Invoice" : "Invoice Baru"}</p>
            <h3 id="invoice-form-judul" className={s.modalTitle}>
              Buat Tagihan &amp; Termin
            </h3>
          </div>
          <button type="button" onClick={onTutup} aria-label="Tutup form invoice" className={s.modalClose}>
            <span aria-hidden="true" className={s.iconMd}>
              close
            </span>
          </button>
        </header>

        <form onSubmit={submit} noValidate className="space-y-5 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={s.fieldLabel} htmlFor="invoice-nomor">
                Nomor Invoice
              </label>
              <div className="flex items-stretch gap-1.5">
                <input
                  id="invoice-nomor"
                  value={nomor}
                  onChange={(event) => {
                    setNomor(event.target.value);
                    setErrors((current) => ({ ...current, nomor: "" }));
                  }}
                  placeholder="INV/2026/001"
                  aria-invalid={Boolean(errors.nomor)}
                  className={s.input}
                />
                <button
                  type="button"
                  onClick={buatNomorOtomatis}
                  title="Buat nomor otomatis"
                  className={`${s.ghostButton} shrink-0 px-3`}
                >
                  <span aria-hidden="true" className={s.iconSm}>
                    autorenew
                  </span>
                </button>
              </div>
              {errors.nomor && (
                <span role="alert" className={s.inputErrorText}>
                  {errors.nomor}
                </span>
              )}
            </div>

            <label className={s.fieldLabel}>
              Tanggal Invoice
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

            <div>
              <label className={s.fieldLabel} htmlFor="invoice-total">
                Total Nilai Tagihan (Rp) <span className="text-error">*</span>
              </label>
              <CurrencyInput
                id="invoice-total"
                value={total}
                onChange={ubahTotal}
                placeholder="0"
                aria-invalid={Boolean(errors.total)}
              />
              {errors.total && (
                <span role="alert" className={s.inputErrorText}>
                  {errors.total}
                </span>
              )}
            </div>

            <div>
              <label className={s.fieldLabel} htmlFor="invoice-nama">
                Pihak / Klien / Kontraktor
              </label>
              <div className="flex items-stretch gap-1.5">
                <select
                  value={pihak}
                  onChange={(event) => setPihak(event.target.value as Pihak)}
                  aria-label="Jenis pihak"
                  className={`${s.select} w-28 shrink-0`}
                >
                  {PIHAK_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  id="invoice-nama"
                  list="invoice-saran-nama"
                  value={nama}
                  onChange={(event) => {
                    setNama(event.target.value);
                    setErrors((current) => ({ ...current, nama: "" }));
                  }}
                  placeholder="Nama klien / kontraktor / toko"
                  aria-invalid={Boolean(errors.nama)}
                  className={s.input}
                />
                <datalist id="invoice-saran-nama">
                  {saranNama.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
              {errors.nama && (
                <span role="alert" className={s.inputErrorText}>
                  {errors.nama}
                </span>
              )}
            </div>

            <label className={s.fieldLabel}>
              Nama Proyek
              <input
                value={proyek}
                onChange={(event) => {
                  setProyek(event.target.value);
                  setErrors((current) => ({ ...current, proyek: "" }));
                }}
                placeholder="cth: Proyek Apartemen Citra 2"
                aria-invalid={Boolean(errors.proyek)}
                className={s.input}
              />
              {errors.proyek && (
                <span role="alert" className={s.inputErrorText}>
                  {errors.proyek}
                </span>
              )}
            </label>

            <label className={s.fieldLabel}>
              Pos / Lokasi Proyek
              <select
                value={posProyek}
                onChange={(event) => {
                  setPosProyek(event.target.value);
                  setErrors((current) => ({ ...current, posProyek: "" }));
                }}
                aria-invalid={Boolean(errors.posProyek)}
                className={s.select}
              >
                <option value="" disabled>
                  Pilih pos…
                </option>
                {opsiPos.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.posProyek && (
                <span role="alert" className={s.inputErrorText}>
                  {errors.posProyek}
                </span>
              )}
            </label>

            <label className={`${s.fieldLabel} sm:col-span-2 lg:col-span-3`}>
              Uraian / Deskripsi Pekerjaan
              <textarea
                value={uraian}
                onChange={(event) => setUraian(event.target.value)}
                rows={2}
                placeholder="cth: Pemasangan kusen aluminium lantai 1-3"
                className={s.input}
              />
            </label>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={s.fieldLabel}>Termin Pembayaran</p>
                <p className={s.metaText}>
                  Total termin {formatRp(totalTermin)} dari tagihan {formatRp(total)}
                </p>
              </div>
              <button type="button" onClick={tambahBaris} className={s.ghostButton}>
                <span aria-hidden="true" className={s.iconSm}>
                  add
                </span>
                Tambah Baris Termin
              </button>
            </div>
            {errors.termin && (
              <span role="alert" className={s.inputErrorText}>
                {errors.termin}
              </span>
            )}

            <div className={`mt-3 ${s.tableWrapModal}`}>
              <table className={`${s.table} min-w-[680px]`}>
                <thead className={s.tableHead}>
                  <tr>
                    <th scope="col" className={s.th}>
                      Label Termin
                    </th>
                    <th scope="col" className={s.th}>
                      Persentase (%) / Nominal (Rp)
                    </th>
                    <th scope="col" className={s.th}>
                      Tanggal Jatuh Tempo
                    </th>
                    <th scope="col" className={`${s.th} text-right`}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {termin.map((item, index) => (
                    <tr key={item.key} className={s.tr}>
                      <td className={s.td}>
                        <input
                          value={item.label}
                          onChange={(event) => {
                            ubahFieldTermin(item.key, { label: event.target.value });
                            setErrors((current) => ({ ...current, [`label-${index}`]: "" }));
                          }}
                          placeholder="DP / Termin 1"
                          aria-label={`Label termin ${index + 1}`}
                          aria-invalid={Boolean(errors[`label-${index}`])}
                          className={`${s.input} mt-0`}
                        />
                        {errors[`label-${index}`] && (
                          <span role="alert" className={s.inputErrorText}>
                            {errors[`label-${index}`]}
                          </span>
                        )}
                      </td>
                      <td className={s.td}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-xl border border-outline/30 bg-surface-variant px-2 focus-within:border-secondary">
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={100}
                              step={0.01}
                              value={item.persen}
                              onChange={(event) => ubahPersen(item.key, event.target.value)}
                              aria-label={`Persentase termin ${index + 1}`}
                              placeholder="0"
                              className="min-h-11 w-14 bg-transparent py-2 text-right text-xs text-on-surface outline-none placeholder:text-on-surface-variant/70 md:min-h-0"
                            />
                            <span className="text-xs font-semibold text-on-surface-variant">%</span>
                          </div>
                          <CurrencyInput
                            value={item.nominal}
                            onChange={(value) => ubahNominal(item.key, value)}
                            aria-label={`Nominal termin ${index + 1}`}
                            className="mt-0 min-w-[150px] flex-1"
                          />
                        </div>
                        {errors[`nominal-${index}`] && (
                          <span role="alert" className={s.inputErrorText}>
                            {errors[`nominal-${index}`]}
                          </span>
                        )}
                      </td>
                      <td className={s.td}>
                        <input
                          type="date"
                          value={item.jatuhTempo}
                          onChange={(event) => {
                            ubahFieldTermin(item.key, { jatuhTempo: event.target.value });
                            setErrors((current) => ({ ...current, [`jatuh-${index}`]: "" }));
                          }}
                          aria-label={`Jatuh tempo termin ${index + 1}`}
                          aria-invalid={Boolean(errors[`jatuh-${index}`])}
                          className={`${s.input} mt-0`}
                        />
                        {errors[`jatuh-${index}`] && (
                          <span role="alert" className={s.inputErrorText}>
                            {errors[`jatuh-${index}`]}
                          </span>
                        )}
                      </td>
                      <td className={`${s.td} text-right`}>
                        <button
                          type="button"
                          onClick={() => hapusBaris(item.key)}
                          disabled={termin.length <= 1}
                          aria-label={`Hapus termin ${index + 1}`}
                          className={s.actionButtonDanger}
                        >
                          <span aria-hidden="true" className={s.iconSm}>
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${toneIndikator}`}
            >
              <span className="font-semibold">
                {totalBelumDiisi
                  ? "Isi total nilai tagihan, lalu bagi ke tiap baris termin."
                  : terminCocok
                    ? "Total termin sesuai dengan total tagihan."
                    : "Total termin harus sama dengan total tagihan."}
              </span>
              {!totalBelumDiisi && (
                <span className="font-bold">
                  {terminCocok ? formatRp(totalTermin) : `Selisih ${formatRp(Math.abs(selisih))}`}
                </span>
              )}
            </div>
            {errors.terminTotal && (
              <span role="alert" className={s.inputErrorText}>
                {errors.terminTotal}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onTutup} className={s.secondaryButton}>
              Batal
            </button>
            <button type="submit" className={s.primaryButton}>
              <span aria-hidden="true" className={s.iconSm}>
                save
              </span>
              {awal ? "Simpan Perubahan" : "Simpan Invoice"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
