"use client";

import { useMemo, useState } from "react";
import { fieldStore } from "../../store";
import type { FieldDelivery } from "../../types";
import { sisaItem, totalKuantitas, totalTerkirim } from "../../antrean/shared/helpers";
import * as s from "../shared/style";

const JENIS_ARMADA = ["Pickup Engkel", "Fuso Doble", "Tronton", "L300 / Carry", "Container Box"];

interface Props {
  delivery: FieldDelivery;
  onClose: () => void;
  onSaved: () => void;
}

export function SuratJalanFormModal({ delivery, onClose, onSaved }: Props) {
  const [bertahap, setBertahap] = useState(false);
  const [namaSopir, setNamaSopir] = useState(delivery.armada?.namaSopir ?? "");
  const [platNomor, setPlatNomor] = useState(delivery.armada?.platNomor ?? "");
  const [jenisArmada, setJenisArmada] = useState(delivery.armada?.jenisArmada ?? "");
  const [kuantitas, setKuantitas] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const item of delivery.items) init[item.id] = sisaItem(item);
    return init;
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sisaTotal = useMemo(
    () => totalKuantitas(delivery) - totalTerkirim(delivery),
    [delivery],
  );

  const kirimTotal = useMemo(
    () => delivery.items.reduce((sum, item) => sum + Math.max(0, kuantitas[item.id] ?? 0), 0),
    [delivery, kuantitas],
  );

  const handleQuantity = (itemId: string, raw: string) => {
    const parsed = Math.max(0, Math.floor(Number(raw) || 0));
    setKuantitas((prev) => ({ ...prev, [itemId]: parsed }));
  };

  const setBesaran = (itemId: string) => {
    const item = delivery.items.find((entry) => entry.id === itemId);
    if (!item) return;
    setKuantitas((prev) => ({ ...prev, [itemId]: sisaItem(item) }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!namaSopir.trim() || !platNomor.trim() || !jenisArmada.trim()) {
      setError("Lengkapi data kendaraan: nama sopir, plat nomor, dan jenis kendaraan.");
      return;
    }
    const kirim = delivery.items.map((item) => ({
      itemId: item.id,
      kuantitas: Math.max(0, kuantitas[item.id] ?? 0),
    }));
    if (kirim.every((entry) => entry.kuantitas === 0)) {
      setError("Minimal satu barang harus dikirim pada surat jalan ini.");
      return;
    }
    setPending(true);
    try {
      await fieldStore.saveSuratJalan(delivery.id, {
        armada: { namaSopir: namaSopir.trim(), platNomor: platNomor.trim().toUpperCase(), jenisArmada },
        kirim,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan surat jalan.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>Buat Surat Jalan</div>
            <div className={s.modalSubtitle}>
              {delivery.id} · {delivery.kodeProduksi} · {delivery.namaKontraktor}
            </div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Data Kendaraan</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                className={s.formInput}
                placeholder="Nama Sopir"
                value={namaSopir}
                onChange={(e) => setNamaSopir(e.target.value)}
              />
            </div>
            <div>
              <input
                className={s.formInput}
                placeholder="Plat Nomor (cth B 1234 XYZ)"
                value={platNomor}
                onChange={(e) => setPlatNomor(e.target.value)}
              />
            </div>
            <div>
              <select className={s.formInput} value={jenisArmada} onChange={(e) => setJenisArmada(e.target.value)}>
                <option value="">Pilih jenis kendaraan...</option>
                {JENIS_ARMADA.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-outline/25 bg-surface-variant/40 px-4 py-3 mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Pengiriman Bertahap
            </div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">
              Aktifkan untuk mengubah jumlah barang pada surat jalan ini.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={bertahap}
            onClick={() => setBertahap((value) => !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-pill transition-colors ${
              bertahap ? "bg-secondary" : "bg-outline/40"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-primary-container shadow transition-transform ${
                bertahap ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className={s.sectionCard}>
          <div className={s.sectionTitle}>
            <span className={s.sectionIcon}>inventory_2</span> Rincian Barang — Sesuaikan Jumlah
          </div>
          <div className="space-y-2">
            {delivery.items.map((item) => {
              const sisa = sisaItem(item);
              const nilai = kuantitas[item.id] ?? 0;
              const melebihi = nilai > sisa;
              return (
                <div key={item.id} className={s.itemRow}>
                  <div className={s.itemInfo}>
                    <div className={s.itemTitle}>{item.namaBarang}</div>
                    <div className={s.itemMeta}>
                      {item.spesifikasi ?? "-"} · {item.satuan}
                    </div>
                    <div className={s.itemStats}>
                      <span>
                        <span className={s.statLabel}>Pesan </span>
                        <span className={s.statValue}>{item.kuantitas}</span>
                      </span>
                      <span>
                        <span className={s.statLabel}>Terkirim </span>
                        <span className={s.statValue}>{item.kuantitasTerkirim}</span>
                      </span>
                      <span>
                        <span className={s.statLabel}>Sisa </span>
                        <span className={`${s.statValue} text-secondary`}>{sisa}</span>
                      </span>
                      <span>
                        <span className={s.statLabel}>Akan dikirim </span>
                        <span className={s.statValue}>{melebihi ? Math.min(nilai, sisa) : nilai}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className={s.qtyInput}
                      type="number"
                      min={0}
                      max={sisa}
                      disabled={!bertahap}
                      value={bertahap ? nilai : sisa}
                      onChange={(e) => handleQuantity(item.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-[9px] font-bold text-secondary uppercase tracking-wide hover:underline"
                      onClick={() => setBesaran(item.id)}
                      disabled={!bertahap}
                    >
                      Max
                    </button>
                  </div>
                  {melebihi && (
                    <div className="w-full text-[10px] text-error">
                      Jumlah melebihi sisa — akan dipotong ke {sisa} {item.satuan}.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={s.summaryBar}>
          <div className={s.summaryTotal}>
            Sisa total <span className={s.summaryHighlight}>{sisaTotal}</span> · Akan dikirim{" "}
            <span className="text-secondary font-headline">
              {Math.min(kirimTotal, sisaTotal)}
            </span>
          </div>
          <div className="text-[10px] text-on-surface-variant">
            Setelah disimpan, status menjadi Dalam Pengiriman dan sisa dihitung otomatis.
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-error">{error}</p>}

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose} disabled={pending}>
            Batal
          </button>
          <button className={s.primaryButton} onClick={handleSubmit} disabled={pending}>
            <span className="material-symbols-outlined text-[16px]">
              {pending ? "progress_activity" : "assignment"}
            </span>
            {pending ? "Menyimpan..." : "Terbitkan Surat Jalan"}
          </button>
        </div>

        <p className="text-center text-[10px] text-on-surface-variant mt-3">
          Setelah disimpan Anda bisa mencetak Surat Jalan dari rincian pengiriman.
        </p>
      </div>
    </div>
  );
}