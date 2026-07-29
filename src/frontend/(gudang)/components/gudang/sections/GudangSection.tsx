"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useApi } from "@/frontend/(manager)/hooks/useApi";
import { fetchGudangData } from "@/frontend/(gudang)/services/gudang";
import { GudangHeader } from "./GudangHeader";
import { GudangTable } from "./GudangTable";
import { GudangFormModal } from "./GudangFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { filterItems, computeMetrics } from "./helpers";
import type { GudangItem } from "./types";
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
  const { data: apiData } = useApi(fetchGudangData, { interval: 30000, enabled: false });
  const seeded = useRef(false);
  const [items, setItems] = useState<GudangItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerek, setSelectedMerek] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<GudangItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GudangItem | null>(null);

  useEffect(() => {
    if (apiData && apiData.items.length > 0 && !seeded.current) {
      seeded.current = true;
      setItems(apiData.items);
    }
  }, [apiData]);

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

  function handleSave(saved: GudangItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
    });
    setIsFormOpen(false);
    setEditItem(null);
  }

  function handleDeleteConfirm(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteItem(null);
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
