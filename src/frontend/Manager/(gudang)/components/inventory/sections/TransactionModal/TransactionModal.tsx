"use client";

import { useMemo, useState } from "react";
import type { GudangCategory, GudangInventoryItem, MaterialKind } from "@/backend/modules/gudangInventory";
import type { DimensionUnit } from "@/frontend/shared/units/dimensions";
import { toCm } from "@/frontend/shared/units/dimensions";
import * as s from "../../style/style";

export interface TransactionLotInput {
  length: number | null;
  width: number | null;
  quantity: number;
  rackGroup?: string;
  subRow?: string;
  lotCode?: string;
}

export interface TransactionItemForm {
  categoryId: string;
  itemName: string;
  brand: string;
  modelNo: string;
  color: string;
  rackGroup: string;
  subRow: string;
  unit?: string;
  materialKind?: MaterialKind;
  lengthPerUnit?: number | null;
  widthPerUnit?: number | null;
  weightPerUnit?: number | null;
}

export interface TransactionFormResult {
  type: "in" | "out";
  transactionDate: string;
  quantity: number;
  item: TransactionItemForm;
  lots?: TransactionLotInput[];
  personInCharge?: string;
  projectName?: string;
}

interface TransactionModalProps {
  mode: "in" | "out";
  newItem?: boolean;
  items: GudangInventoryItem[];
  categories: GudangCategory[];
  categoryNames: Map<string, string>;
  saving: boolean;
  onClose: () => void;
  onSubmit: (result: TransactionFormResult) => Promise<void>;
}

interface TransactionForm
  extends Omit<TransactionItemForm, "lengthPerUnit" | "widthPerUnit" | "weightPerUnit"> {
  quantity: string;
  transactionDate: string;
  personInCharge: string;
  projectName: string;
  lengthPerUnit: string;
  widthPerUnit: string;
  weightPerUnit: string;
  panjangUnit: DimensionUnit;
  lebarUnit: DimensionUnit;
}

interface LotRow {
  quantity: string;
  length: string;
  width: string;
  unit: DimensionUnit;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const KIND_TO_UNIT: Record<MaterialKind, string> = {
  unit: "pcs",
  bar: "batang",
  sheet: "lembar",
  roll: "roll",
};

function dimensionToCm(value: string, unit: DimensionUnit): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? toCm(parsed, unit) : null;
}

export function TransactionModal({
  mode,
  newItem = false,
  items,
  categories,
  categoryNames,
  saving,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const isOut = mode === "out";
  const [form, setForm] = useState<TransactionForm>(() => ({
    categoryId: categories[0]?.id ?? "",
    itemName: "",
    brand: "",
    modelNo: "",
    color: "",
    rackGroup: "",
    subRow: "",
    materialKind: "unit",
    lengthPerUnit: "",
    widthPerUnit: "",
    weightPerUnit: "",
    panjangUnit: "cm",
    lebarUnit: "cm",
    quantity: "1",
    transactionDate: todayIso(),
    personInCharge: "",
    projectName: "",
  }));
  const [pickedId, setPickedId] = useState("");
  const [lots, setLots] = useState<LotRow[]>([{ quantity: "1", length: "", width: "", unit: "cm" }]);
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionForm, string>>>({});

  function set<K extends keyof TransactionForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }) as TransactionForm);
  }

  function setMaterialKind(value: MaterialKind) {
    setForm((prev) => ({ ...prev, materialKind: value }));
  }

  function addLot() {
    setLots((prev) => [...prev, { quantity: "1", length: "", width: "", unit: "cm" }]);
  }

  function removeLot(index: number) {
    setLots((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function setLot(index: number, key: keyof LotRow, value: string) {
    setLots((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function pickExisting(id: string) {
    setPickedId(id);
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    setForm((prev) => ({
      ...prev,
      categoryId: item.categoryId,
      itemName: item.itemName,
      brand: item.brand,
      modelNo: item.modelNo,
      color: item.color,
      rackGroup: item.rackGroup,
      subRow: item.subRow,
      materialKind: item.materialKind,
    }));
  }

  const matchedItem = useMemo(() => {
    const model = form.modelNo.trim().toLowerCase();
    if (model) {
      const byModel = items.find((entry) => entry.modelNo.trim().toLowerCase() === model);
      if (byModel) return byModel;
    }
    const name = form.itemName.trim().toLowerCase();
    if (!name) return undefined;
    return items.find(
      (entry) =>
        entry.categoryId === form.categoryId && entry.itemName.trim().toLowerCase() === name,
    );
  }, [items, form.modelNo, form.itemName, form.categoryId]);

  const effectiveMaterialKind = matchedItem?.materialKind ?? form.materialKind;
  const isMaterialInput = !isOut && effectiveMaterialKind !== "unit";

  const lotQuantityTotal = lots.reduce((sum, lot) => {
    const value = Number(lot.quantity);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const quantityNumber = isMaterialInput ? lotQuantityTotal : Number(form.quantity);
  const projectedStock = matchedItem
    ? isOut
      ? matchedItem.currentStock - (Number.isFinite(quantityNumber) ? quantityNumber : 0)
      : matchedItem.materialKind === "unit"
        ? matchedItem.currentStock + (Number.isFinite(quantityNumber) ? quantityNumber : 0)
        : null
    : null;

  function validate(): boolean {
    const next: Partial<Record<keyof TransactionForm, string>> = {};
    if (!form.categoryId) next.categoryId = "Kategori wajib dipilih";
    if (!form.itemName.trim()) next.itemName = "Nama barang wajib diisi";
    if (!form.transactionDate) next.transactionDate = "Tanggal wajib diisi";
    if (isMaterialInput) {
      const hasValidLot = lots.some((lot) => {
        const value = Number(lot.quantity);
        return Number.isInteger(value) && value > 0;
      });
      if (!hasValidLot) next.quantity = "Isi minimal satu lot dengan jumlah lebih dari 0";
    } else if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
      next.quantity = "Jumlah harus bilangan bulat lebih dari 0";
    } else if (isOut && matchedItem && quantityNumber > matchedItem.currentStock) {
      next.quantity = "Jumlah melebihi stok tersedia";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    const lotPayload = isMaterialInput
      ? lots
          .map((lot) => ({
            quantity: Number(lot.quantity),
            length: dimensionToCm(lot.length, lot.unit),
            width: dimensionToCm(lot.width, lot.unit),
          }))
          .filter((lot) => Number.isInteger(lot.quantity) && lot.quantity > 0)
      : undefined;
    await onSubmit({
      type: mode,
      transactionDate: form.transactionDate,
      quantity: quantityNumber,
      item: {
        categoryId: form.categoryId,
        itemName: form.itemName.trim(),
        brand: form.brand.trim(),
        modelNo: form.modelNo.trim(),
        color: form.color.trim(),
        rackGroup: form.rackGroup.trim(),
        subRow: form.subRow.trim(),
        unit: newItem ? KIND_TO_UNIT[form.materialKind ?? "unit"] : undefined,
        materialKind: newItem ? form.materialKind : undefined,
        lengthPerUnit: newItem ? dimensionToCm(form.lengthPerUnit, form.panjangUnit) : null,
        widthPerUnit: newItem ? dimensionToCm(form.widthPerUnit, form.lebarUnit) : null,
        weightPerUnit: newItem && form.weightPerUnit.trim() !== "" ? Number(form.weightPerUnit) : null,
      },
      lots: lotPayload,
      personInCharge: form.personInCharge.trim() || undefined,
      projectName: isOut ? form.projectName.trim() || undefined : undefined,
    });
  }

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className={s.modalBackdrop} onClick={handleBackdrop}>
      <div className={s.modalContent}>
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>
              {newItem ? "Barang Baru" : isOut ? "Catat Barang Keluar" : "Catat Barang Masuk"}
            </h2>
            <p className={s.modalSubtitle}>
              {newItem
                ? "Barang dibuat di Master Stok dan tercatat sebagai barang masuk"
                : isOut
                  ? "Stok berkurang otomatis setelah disimpan"
                  : "Stok bertambah otomatis setelah disimpan"}
            </p>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formGroup}>
          {!newItem && items.length > 0 && (
            <div>
              <label className={s.formLabel}>Pilih Barang Terdaftar (opsional)</label>
              <select
                className={s.formInput}
                value={pickedId}
                onChange={(event) => pickExisting(event.target.value)}
              >
                <option value="">— Isi manual di bawah —</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.itemName}
                    {item.modelNo ? ` · ${item.modelNo}` : ""} — stok {item.currentStock} (
                    {categoryNames.get(item.categoryId) ?? "-"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={s.formLabel}>
              Kategori <span className={s.required}>*</span>
            </label>
            <select
              className={s.formInput}
              value={form.categoryId}
              onChange={(event) => set("categoryId", event.target.value)}
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className={s.formError}>{errors.categoryId}</p>}
          </div>

          <div>
            <label className={s.formLabel}>
              Nama Barang <span className={s.required}>*</span>
            </label>
            <input
              className={s.formInput}
              placeholder="Contoh: Handle Pintu"
              value={form.itemName}
              onChange={(event) => set("itemName", event.target.value)}
            />
            {errors.itemName && <p className={s.formError}>{errors.itemName}</p>}
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Merek</label>
              <input
                className={s.formInput}
                value={form.brand}
                onChange={(event) => set("brand", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>No. Model</label>
              <input
                className={s.formInput}
                value={form.modelNo}
                onChange={(event) => set("modelNo", event.target.value)}
              />
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Warna</label>
              <input
                className={s.formInput}
                value={form.color}
                onChange={(event) => set("color", event.target.value)}
              />
            </div>
            <div>
              <label className={s.formLabel}>Lokasi Rak</label>
              <input
                className={s.formInput}
                placeholder="Contoh: Rak A"
                value={form.rackGroup}
                onChange={(event) => set("rackGroup", event.target.value)}
              />
            </div>
          </div>

          <div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>Baris</label>
              <input
                className={s.formInput}
                placeholder="Contoh: 3"
                value={form.subRow}
                onChange={(event) => set("subRow", event.target.value)}
              />
            </div>
            {!isMaterialInput && (
              <div>
                <label className={s.formLabel}>
                  Jumlah {isOut ? "Keluar" : "Masuk"} <span className={s.required}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={s.formInput}
                  value={form.quantity}
                  onChange={(event) => set("quantity", event.target.value)}
                />
                {errors.quantity && <p className={s.formError}>{errors.quantity}</p>}
              </div>
            )}
          </div>

          {!matchedItem && (
            <div>
              <label className={s.formLabel}>Jenis Bahan</label>
              <select
                className={s.formInput}
                value={form.materialKind}
                onChange={(event) => setMaterialKind(event.target.value as MaterialKind)}
              >
                <option value="unit">Unit (pcs)</option>
                <option value="bar">Batang</option>
                <option value="sheet">Lembar</option>
                <option value="roll">Roll</option>
              </select>
            </div>
          )}

          {!matchedItem && form.materialKind !== "unit" && (
            <div className={s.formGrid}>
              <div>
                <label className={s.formLabel}>Panjang Acuan</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className={s.formInput}
                    value={form.lengthPerUnit}
                    onChange={(event) => set("lengthPerUnit", event.target.value)}
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
                <label className={s.formLabel}>Lebar Acuan</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className={s.formInput}
                    value={form.widthPerUnit}
                    onChange={(event) => set("widthPerUnit", event.target.value)}
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
          )}

          {isMaterialInput && (
            <div>
              <div className="flex items-center justify-between">
                <label className={s.formLabel}>
                  Lot Bahan <span className={s.required}>*</span>
                </label>
                <button type="button" className={s.ghostButton} onClick={addLot}>
                  <span className={s.buttonIcon}>add</span>
                  Tambah Lot
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {lots.map((lot, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className={s.formLabel}>Jumlah</label>
                      <input
                        type="number"
                        min="1"
                        className={s.formInput}
                        value={lot.quantity}
                        onChange={(event) => setLot(index, "quantity", event.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={s.formLabel}>Panjang</label>
                      <input
                        type="number"
                        min="0"
                        className={s.formInput}
                        value={lot.length}
                        onChange={(event) => setLot(index, "length", event.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={s.formLabel}>Lebar</label>
                      <input
                        type="number"
                        min="0"
                        className={s.formInput}
                        value={lot.width}
                        onChange={(event) => setLot(index, "width", event.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <label className={s.formLabel}>Satuan</label>
                      <select
                        className={s.formInput}
                        value={lot.unit}
                        onChange={(event) =>
                          setLot(index, "unit", event.target.value as DimensionUnit)
                        }
                      >
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                      </select>
                    </div>
                    {lots.length > 1 && (
                      <button
                        type="button"
                        className={s.modalCloseButton}
                        onClick={() => removeLot(index)}
                      >
                        <span className={s.closeIcon}>delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-secondary">
                Total lot: <span className="font-bold">{lotQuantityTotal}</span>
              </p>
              {errors.quantity && <p className={s.formError}>{errors.quantity}</p>}
            </div>
          )}

<div className={s.formGrid}>
            <div>
              <label className={s.formLabel}>
                Tanggal <span className={s.required}>*</span>
              </label>
              <input
                type="date"
                className={s.formInput}
                value={form.transactionDate}
                onChange={(event) => set("transactionDate", event.target.value)}
              />
              {errors.transactionDate && <p className={s.formError}>{errors.transactionDate}</p>}
            </div>
            <div>
              <label className={s.formLabel}>
                {isOut ? "Pengambil" : "Penerima"}
              </label>
              <input
                className={s.formInput}
                placeholder={isOut ? "Yang mengambil barang" : "Yang menerima barang"}
                value={form.personInCharge}
                onChange={(event) => set("personInCharge", event.target.value)}
              />
            </div>
          </div>

          {form.itemName.trim() && (
            <div className={s.itemDetailBox}>
              {matchedItem ? (
                <>
                  <p className={s.itemDetailStatus}>
                    Barang sudah terdaftar — transaksi menambah/mengurangi stok yang ada.
                  </p>
                  <div className={s.itemDetailGrid}>
                    <div className={s.itemDetailRow}>
                      <span className={s.itemDetailLabel}>Kategori</span>
                      <span className={s.itemDetailValue}>
                        {categoryNames.get(matchedItem.categoryId) ?? "-"}
                      </span>
                    </div>
                    <div className={s.itemDetailRow}>
                      <span className={s.itemDetailLabel}>Merek</span>
                      <span className={s.itemDetailValue}>{matchedItem.brand || "-"}</span>
                    </div>
                    <div className={s.itemDetailRow}>
                      <span className={s.itemDetailLabel}>No. Model</span>
                      <span className={s.itemDetailValue}>{matchedItem.modelNo || "-"}</span>
                    </div>
                    <div className={s.itemDetailRow}>
                      <span className={s.itemDetailLabel}>Warna</span>
                      <span className={s.itemDetailValue}>{matchedItem.color || "-"}</span>
                    </div>
                    <div className={s.itemDetailRow}>
                      <span className={s.itemDetailLabel}>Lokasi Rak</span>
                      <span className={s.itemDetailValue}>
                        {matchedItem.rackGroup || "-"}
                        {matchedItem.subRow ? ` · Baris ${matchedItem.subRow}` : ""}
                      </span>
                    </div>
                    <div className={s.itemDetailRow}>
                      <span className={s.itemDetailLabel}>Stok Saat Ini</span>
                      <span className={s.itemDetailValue}>{matchedItem.currentStock}</span>
                    </div>
                  </div>
                  {projectedStock !== null && (
                    <div className={`${s.badge} w-full text-center`}>
                      Stok {matchedItem.currentStock} &rarr; setelah simpan{" "}
                      <span className="font-bold">{projectedStock}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className={s.itemDetailStatus}>
                  Barang belum terdaftar — akan otomatis dibuat di Master Stok saat disimpan.
                </p>
              )}
            </div>
          )}

          {isOut && (
            <div>
              <label className={s.formLabel}>Proyek</label>
              <input
                className={s.formInput}
                placeholder="Opsional"
                value={form.projectName}
                onChange={(event) => set("projectName", event.target.value)}
              />
            </div>
          )}
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelButton} onClick={onClose}>
            Batal
          </button>
          <button className={s.saveButton} onClick={submit} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
