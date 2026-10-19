"use client";

import { useMemo, useState } from "react";
import type { GudangCategory, GudangInventoryItem, MaterialKind } from "@/backend/modules/gudangInventory";
import * as s from "../../style/style";

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
}

export interface TransactionFormResult {
  type: "in" | "out";
  transactionDate: string;
  quantity: number;
  item: TransactionItemForm;
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

interface TransactionForm extends TransactionItemForm {
  quantity: string;
  transactionDate: string;
  personInCharge: string;
  projectName: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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
    unit: "pcs",
    materialKind: "unit",
    quantity: "1",
    transactionDate: todayIso(),
    personInCharge: "",
    projectName: "",
  }));
  const [pickedId, setPickedId] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionForm, string>>>({});

  function set<K extends keyof TransactionForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }) as TransactionForm);
  }

  function setMaterialKind(value: MaterialKind) {
    setForm((prev) => ({ ...prev, materialKind: value }));
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
      unit: item.unit,
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

  const quantityNumber = Number(form.quantity);
  const projectedStock = matchedItem
    ? isOut
      ? matchedItem.currentStock - (Number.isFinite(quantityNumber) ? quantityNumber : 0)
      : matchedItem.currentStock + (Number.isFinite(quantityNumber) ? quantityNumber : 0)
    : null;

  function validate(): boolean {
    const next: Partial<Record<keyof TransactionForm, string>> = {};
    if (!form.categoryId) next.categoryId = "Kategori wajib dipilih";
    if (!form.itemName.trim()) next.itemName = "Nama barang wajib diisi";
    if (!form.transactionDate) next.transactionDate = "Tanggal wajib diisi";
    if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
      next.quantity = "Jumlah harus bilangan bulat lebih dari 0";
    } else if (isOut && matchedItem && quantityNumber > matchedItem.currentStock) {
      next.quantity = "Jumlah melebihi stok tersedia";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
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
        unit: newItem ? form.unit?.trim() || "pcs" : undefined,
        materialKind: newItem ? form.materialKind : undefined,
      },
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
          </div>

          {!matchedItem && (
            <div className={s.formGrid}>
              <div>
                <label className={s.formLabel}>Satuan</label>
                <input
                  className={s.formInput}
                  placeholder="Contoh: pcs, batang, lembar"
                  value={form.unit}
                  onChange={(event) => set("unit", event.target.value)}
                />
              </div>
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
          <button className={s.saveButton} onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
