"use client";

import { useState } from "react";
import type { KasEntry, KasEntryInput, KasTipe, KasKategori } from "./types";
import * as s from "../style";

const KATEGORI_LABELS: Record<KasKategori, string> = {
  eceran: "Eceran",
  proyek: "Proyek",
  operasional: "Operasional",
};

interface Props {
  entry: KasEntry;
  onClose: () => void;
  onSave: (input: KasEntryInput) => Promise<void>;
}

export function TransaksiFormModal({ entry, onClose, onSave }: Props) {
  const [tipe, setTipe] = useState<KasTipe>(entry.tipe);
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi);
  const [jumlah, setJumlah] = useState(String(entry.jumlah));
  const [kategori, setKategori] = useState<KasKategori>(entry.kategori);
  const [tanggal, setTanggal] = useState(entry.tanggal);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!deskripsi.trim()) return setError("Deskripsi wajib diisi.");
    const jumlahValue = Number(jumlah);
    if (!Number.isFinite(jumlahValue) || jumlahValue <= 0) return setError("Jumlah harus lebih dari nol.");
    setSaving(true);
    try {
      await onSave({
        tipe,
        deskripsi,
        jumlah: jumlahValue,
        kategori,
        tanggal: tanggal || new Date().toISOString().slice(0, 10),
      });
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan transaksi.");
      setSaving(false);
    }
  };

  const selectTipe = (next: KasTipe) => {
    setTipe(next);
    if (next === "masuk") setKategori((current) => (current === "operasional" ? "eceran" : current));
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(event) => event.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>Ubah Transaksi</div>
            <div className={s.modalSubtitle}>{entry.id}</div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <label className={`${s.fieldLabel} mb-1`}>Jenis Transaksi</label>
        <div className={`${s.toggleGroup} mb-4`}>
          <button type="button" className={`${s.toggleButton} ${tipe === "masuk" ? s.toggleActiveMasuk : s.toggleInactive}`} onClick={() => selectTipe("masuk")}>
            Masuk
          </button>
          <button type="button" className={`${s.toggleButton} ${tipe === "keluar" ? s.toggleActiveKeluar : s.toggleInactive}`} onClick={() => selectTipe("keluar")}>
            Keluar
          </button>
        </div>

        <label className={`${s.fieldLabel} mb-1`} htmlFor="modal-deskripsi">Deskripsi</label>
        <input
          id="modal-deskripsi"
          className={`${s.input} mb-4`}
          value={deskripsi}
          onChange={(event) => setDeskripsi(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`${s.fieldLabel} mb-1`} htmlFor="modal-jumlah">Jumlah (Rp)</label>
            <input
              id="modal-jumlah"
              className={s.input}
              type="number"
              min="1"
              step="1000"
              value={jumlah}
              onChange={(event) => setJumlah(event.target.value)}
            />
          </div>
          <div>
            <label className={`${s.fieldLabel} mb-1`} htmlFor="modal-tanggal">Tanggal</label>
            <input
              id="modal-tanggal"
              className={s.input}
              type="date"
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
            />
          </div>
        </div>

        <label className={`${s.fieldLabel} mb-1`} htmlFor="modal-kategori">Kategori</label>
        <select id="modal-kategori" className={`${s.input} mb-4`} value={kategori} onChange={(event) => setKategori(event.target.value as KasKategori)}>
          {(Object.keys(KATEGORI_LABELS) as KasKategori[]).map((key) => (
            <option key={key} value={key}>{KATEGORI_LABELS[key]}</option>
          ))}
        </select>

        {error && <p className="mb-4 text-xs text-error">{error}</p>}

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button className={s.primaryButton} onClick={handleSave} disabled={saving}>
            <span className="material-symbols-outlined text-[16px]">{saving ? "progress_activity" : "save"}</span>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
