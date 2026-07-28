"use client";

import { useState, useMemo } from "react";
import type { GudangItem } from "@/services/gudang";
import { GudangHeader } from "./components/GudangHeader";
import { GudangTable } from "./components/GudangTable";
import { GudangFormModal } from "./components/GudangFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

interface GudangPageProps {
  initialItems: GudangItem[];
}

// GudangPage adalah client component karena butuh interaktivitas (search, filter).
// Data awal dioper dari server component (page.tsx) via props agar halaman
// tetap bisa di-render di server tanpa blocking pada sisi client.
export function GudangPage({ initialItems }: GudangPageProps) {
  // items dikelola sebagai state lokal agar CRUD langsung memperbarui UI dan metrik
  const [items, setItems] = useState<GudangItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerek, setSelectedMerek] = useState("ALL");

  // State modal — editItem null berarti mode Tambah, diisi berarti mode Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<GudangItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GudangItem | null>(null);

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
      // Update item yang sudah ada, atau tambahkan baru ke akhir list
      return exists
        ? prev.map((i) => (i.id === saved.id ? saved : i))
        : [...prev, saved];
    });
    setIsFormOpen(false);
    setEditItem(null);
  }

  function handleDeleteConfirm(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteItem(null);
  }

  // Derived state dihitung dari `items` (bukan initialItems) agar metrik
  // header ikut berubah secara real-time setiap kali CRUD dilakukan
  const totalStok = useMemo(
    () => items.reduce((acc, item) => acc + item.stok, 0),
    [items]
  );

  const jumlahLowStock = useMemo(
    () => items.filter((item) => item.stok <= item.minStok).length,
    [items]
  );

  const daftarMerek = useMemo(() => {
    const set = new Set(items.map((item) => item.merek));
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesMerek =
        selectedMerek === "ALL" || item.merek === selectedMerek;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.jenisBarang.toLowerCase().includes(q) ||
        item.merek.toLowerCase().includes(q) ||
        item.seksiLokasi.toLowerCase().includes(q) ||
        (item.catatan?.toLowerCase().includes(q) ?? false);

      return matchesMerek && matchesSearch;
    });
  }, [items, searchQuery, selectedMerek]);

  return (
    <>
      <div className="p-3 sm:p-4 md:p-10 min-h-screen">
        <div className="mx-auto max-w-7xl">
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