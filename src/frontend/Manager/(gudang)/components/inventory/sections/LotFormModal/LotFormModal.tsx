"use client";

import { useState } from "react";
import type {
  GudangInventoryItem,
  GudangMaterialLotInput,
  GudangMaterialLotView,
  MaterialLotStatus,
} from "@/backend/modules/gudangInventory";
import type { DimensionUnit } from "@/frontend/shared/units/dimensions";
import { toCm } from "@/frontend/shared/units/dimensions";
import * as s from "../../style/style";

interface LotFormModalProps {
  items: GudangInventoryItem[];
  lot: GudangMaterialLotView | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: GudangMaterialLotInput) => Promise<void>;
}

interface LotForm {
  itemId: string;
  lotCode: string;
  receivedDate: string;
  length: string;
  width: string;
  panjangUnit: DimensionUnit;
  lebarUnit: DimensionUnit;
  quantity: string;
  rackGroup: string;
  subRow: string;
  status: MaterialLotStatus;
  note: string;
}

const STATUS_OPTIONS: MaterialLotStatus[] = [
  "tersedia",
  "sisa",
  "scrap",
  "habis",
];

export function LotFormModal({
  items,
  lot,
  saving,
  onClose,
  onSubmit,
}: LotFormModalProps) {
  const [form, setForm] = useState<LotForm>(() => ({
    itemId: lot?.itemId ?? items[0]?.id ?? "",
    lotCode: lot?.lotCode ?? "",
    receivedDate: lot?.receivedDate ?? new Date().toISOString().slice(0, 10),
    length: lot?.length != null ? String(lot.length) : "",
    width: lot?.width != null ? String(lot.width) : "",
    panjangUnit: "cm",
    lebarUnit: "cm",
    quantity: String(lot?.quantity ?? 1),
    rackGroup: lot?.rackGroup ?? "",
    subRow: lot?.subRow ?? "",
    status: lot?.status ?? "tersedia",
    note: lot?.note ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof LotForm, string>>>({});
  const [cooldown, setCooldown] = useState(false);

  const isFormValid = Boolean(form.itemId) && Number(form.quantity) >= 0;
  const isButtonDisabled = saving || cooldown || !isFormValid;

  function set<K extends keyof LotForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof LotForm, string>> = {};
    if (!form.itemId) next.itemId = "Barang wajib dipilih";
    if (form.quantity === "" || Number(form.quantity) < 0) {
      next.quantity = "Jumlah minimal 0";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function dimensionToCm(value: string, unit: DimensionUnit): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? toCm(parsed, unit) : null;
  }

  async function handleSave() {
    if (!validate() || isButtonDisabled) return;
    setCooldown(true);
    try {
      await onSubmit({
        itemId: form.itemId,
        lotCode: form.lotCode.trim(),
        receivedDate: form.receivedDate,
        length: dimensionToCm(form.length, form.panjangUnit),
        width: dimensionToCm(form.width, form.lebarUnit),
        quantity: Number(form.quantity),
        rackGroup: form.rackGroup.trim(),
        subRow: form.subRow.trim(),
        status: form.status,
        note: form.note.trim(),
      });
    } finally {
      setCooldown(false);
    }
  }

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>{lot ? "Edit Lot" : "Tambah Lot"}</h2>
            <p className={s.modalSubtitle}>Lot bahan baku & sisa potong</p>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formGroup}>
          <div>
            <label className={s.formLabel}>
              Barang <span className={s.required}>*</span>
            </label>
            <select
              className={s.formInput}
              value={form.itemId}
              onChange={(event) => set("itemId", event.target.value)}
            >
              <option value="">Pilih barang</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName}
                  {item.modelNo ? ` — ${item.modelNo}` : ""}
                </option>
              ))}
            </select>
            {errors.itemId && <p className={s.formError}>{errors.itemId}</p>}
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Kode Lot</label>
              <input
                className={s.formInput}
                placeholder="Contoh: LOT-001"
                value={form.lotCode}
                onChange={(event) => set("lotCode", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>Tanggal Terima</label>
              <input
                type="date"
                className={s.formInput}
                value={form.receivedDate}
                onChange={(event) => set("receivedDate", event.target.value)}
              />
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Panjang per Batang</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={s.formInput}
                  value={form.length}
                  onChange={(event) => set("length", event.target.value)}
                />
                <select
                  className={s.formInput}
                  value={form.panjangUnit}
                  onChange={(event) => set("panjangUnit", event.target.value as DimensionUnit)}
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>
            <div>
              <label className={s.formLabel}>Lebar</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={s.formInput}
                  value={form.width}
                  onChange={(event) => set("width", event.target.value)}
                />
                <select
                  className={s.formInput}
                  value={form.lebarUnit}
                  onChange={(event) => set("lebarUnit", event.target.value as DimensionUnit)}
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Jumlah (batang/lembar)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={s.formInput}
                value={form.quantity}
                onChange={(event) => set("quantity", event.target.value)}
              />
              {errors.quantity && <p className={s.formError}>{errors.quantity}</p>}
            </div>
            <div>
              <label className={s.formLabel}>Status</label>
              <select
                className={s.formInput}
                value={form.status}
                onChange={(event) => set("status", event.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Lokasi Rak</label>
              <input
                className={s.formInput}
                value={form.rackGroup}
                onChange={(event) => set("rackGroup", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>Baris</label>
              <input
                className={s.formInput}
                value={form.subRow}
                onChange={(event) => set("subRow", event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={s.formLabel}>Catatan</label>
            <input
              className={s.formInput}
              value={form.note}
              onChange={(event) => set("note", event.target.value)}
            />
          </div>
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelButton} onClick={onClose}>
            Batal
          </button>
          <button
            className={`${s.saveButton} disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            onClick={handleSave}
            disabled={isButtonDisabled}
          >
            {saving || cooldown ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
