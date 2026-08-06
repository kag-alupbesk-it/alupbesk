"use client";

import { useState, useMemo, useEffect } from "react";
import { gudangApi } from "@/services/api";
import { GudangHeader } from "./GudangHeader";
import { GudangTable } from "./GudangTable";
import { GudangFormModal } from "./GudangFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { filterItems, computeMetrics } from "./helpers";
import type { GudangItem } from "@/backend/modules/gudang";
import * as s from "../style";

interface GudangSectionProps {
  initialItems: GudangItem[];
}

function LoadingSkeleton() {
  return (
    <div className={s.container}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex gap-4">
          <div className={`h-20 w-48 ${s.skeleton}`} />
          <div className={`h-20 w-32 ${s.skeleton}`} />
          <div className={`h-20 w-32 ${s.skeleton}`} />
        </div>
        <div className={`h-96 ${s.skeleton}`} />
      </div>
    </div>
  );
}

export function GudangSection({ initialItems }: GudangSectionProps) {
  const [items, setItems] = useState<GudangItem[]>(initialItems);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerek, setSelectedMerek] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<GudangItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GudangItem | null>(null);

  useEffect(() => { gudangApi.getItems().then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : "Data gudang gagal dimuat.")); }, []);

  function handleTambah() {
    setEditItem(null);
    setIsFormOpen(true);
  }

  function handleEdit(item: GudangItem) {
    setEditItem(item);
    setIsFormOpen(true);
  }

  function handleDeleteRequest(item: GudangItem) {
    setDeleteItem(item);
  }

  async function handleSave(saved: GudangItem) {
    setError("");
    try {
      const { id: _id, ...input } = saved;
      const result = editItem ? await gudangApi.updateItem(editItem.id, input) : await gudangApi.createItem(input);
      setItems((prev) => editItem ? prev.map((item) => item.id === result.id ? result : item) : [...prev, result]);
      setIsFormOpen(false); setEditItem(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Barang gagal disimpan."); }
  }

  async function handleDeleteConfirm(id: string) {
    setError("");
    try { await gudangApi.deleteItem(id); setItems((prev) => prev.filter((item) => item.id !== id)); setDeleteItem(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Barang gagal dihapus."); }
  }

  const { totalStok, jumlahLowStock, daftarMerek } = useMemo(() => computeMetrics(items), [items]);

  const filteredItems = useMemo(
    () => filterItems(items, searchQuery, selectedMerek),
    [items, searchQuery, selectedMerek]
  );

  return (
    <>
      <div className={s.container}>
        <div className={s.wrapper}>
          <GudangHeader
            totalStok={totalStok}
            totalJenisItem={items.length}
            jumlahLowStock={jumlahLowStock}
            onTambah={handleTambah}
          />
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <GudangTable
            items={filteredItems}
            searchQuery={searchQuery}
            selectedMerek={selectedMerek}
            daftarMerek={daftarMerek}
            onSearchChange={setSearchQuery}
            onMerekChange={setSelectedMerek}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </div>
      </div>

      <GudangFormModal
        isOpen={isFormOpen}
        editItem={editItem}
        onClose={() => { setIsFormOpen(false); setEditItem(null); }}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
