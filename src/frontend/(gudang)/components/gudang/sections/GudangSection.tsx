"use client";

import { useState, useMemo, useEffect } from "react";
import { gudangApi } from "@/services/api";
import { GudangHeader } from "./GudangHeader";
import { GudangTable } from "./GudangTable";
import { StockUpdateModal } from "./StockUpdateModal";
import { filterItems, computeMetrics } from "./helpers";
import type { GudangItem } from "@/backend/modules/gudang";
import * as s from "../style";

interface GudangSectionProps {
  initialItems: GudangItem[];
}

export function GudangSection({ initialItems }: GudangSectionProps) {
  const [items, setItems] = useState<GudangItem[]>(initialItems);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerek, setSelectedMerek] = useState("ALL");
  const [stockItem, setStockItem] = useState<GudangItem | null>(null);

  useEffect(() => { gudangApi.getItems().then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : "Data gudang gagal dimuat.")); }, []);

  function handleStock(item: GudangItem) {
    setStockItem(item);
  }

  async function handleSave(saved: GudangItem) {
    setError("");
    try {
      const result = await gudangApi.updateStock(saved.id, { stok: saved.stok, minStok: saved.minStok });
      setItems((prev) => prev.map((item) => (item.id === result.id ? result : item)));
      setStockItem(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Stok gagal disimpan."); }
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
          />
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <GudangTable
            items={filteredItems}
            searchQuery={searchQuery}
            selectedMerek={selectedMerek}
            daftarMerek={daftarMerek}
            onSearchChange={setSearchQuery}
            onMerekChange={setSelectedMerek}
            onStock={handleStock}
          />
        </div>
      </div>

      {stockItem && (
        <StockUpdateModal
          item={stockItem}
          onClose={() => setStockItem(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
