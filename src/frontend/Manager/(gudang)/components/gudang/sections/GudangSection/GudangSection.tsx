"use client";

import { useState, useMemo, useEffect } from "react";
import { gudangApi } from "@/services/api";
import { GudangHeader } from "../GudangHeader/GudangHeader";
import { GudangTable } from "../GudangTable/GudangTable";
import { StockUpdateModal } from "../StockUpdateModal/StockUpdateModal";
import { StockMasukModal } from "../StockMasukModal/StockMasukModal";
import { StockKeluarModal } from "../StockKeluarModal/StockKeluarModal";
import { ItemFormModal } from "../ItemFormModal/ItemFormModal";
import { MovementHistorySection } from "../MovementHistorySection/MovementHistorySection";
import { ProjectStockSummary } from "../ProjectStockSummary/ProjectStockSummary";
import { filterItems, computeMetrics } from "../helpers/helpers";
import type { GudangItem, GudangMovement, GudangMasukInput, GudangKeluarInput, GudangItemInput } from "../types/types";
import * as s from "../../style/style";

interface GudangSectionProps {
  initialItems: GudangItem[];
}

export function GudangSection({ initialItems }: GudangSectionProps) {
  const [items, setItems] = useState<GudangItem[]>(initialItems);
  const [movements, setMovements] = useState<GudangMovement[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMerek, setSelectedMerek] = useState("ALL");
  const [selectedKategori, setSelectedKategori] = useState("ALL");
  const [selectedProyek, setSelectedProyek] = useState("ALL");
  const [stockItem, setStockItem] = useState<GudangItem | null>(null);
  const [masukItem, setMasukItem] = useState<GudangItem | null>(null);
  const [keluarItem, setKeluarItem] = useState<GudangItem | null>(null);
  const [showTambah, setShowTambah] = useState(false);

  useEffect(() => {
    gudangApi.getItems().then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : "Data gudang gagal dimuat."));
    gudangApi.getMovements().then(setMovements).catch(() => undefined);
  }, []);

  function refreshMovements() {
    gudangApi.getMovements().then(setMovements).catch(() => undefined);
  }

  function handleStock(item: GudangItem) {
    setStockItem(item);
  }

  async function handleSaveStock(saved: GudangItem) {
    setError("");
    try {
      const result = await gudangApi.updateStock(saved.id, { stok: saved.stok, minStok: saved.minStok });
      setItems((prev) => prev.map((item) => (item.id === result.id ? result : item)));
      setStockItem(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Stok gagal disimpan."); }
  }

  async function handleCreateItem(input: GudangItemInput) {
    setError("");
    try {
      const created = await gudangApi.createItem(input);
      setItems((prev) => [...prev, created]);
      setShowTambah(false);
      refreshMovements();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Barang gagal disimpan."); }
  }

  async function handleSaveMasuk(input: GudangMasukInput) {
    if (!masukItem) return;
    setError("");
    try {
      const movement = await gudangApi.recordMasuk(masukItem.id, input);
      setItems((prev) => prev.map((item) => (item.id === masukItem.id ? { ...item, stok: movement.stokSesudah } : item)));
      setMasukItem(null);
      refreshMovements();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Barang masuk gagal disimpan."); }
  }

  async function handleSaveKeluar(input: GudangKeluarInput) {
    if (!keluarItem) return;
    setError("");
    try {
      const movement = await gudangApi.recordKeluar(keluarItem.id, input);
      setItems((prev) => prev.map((item) => (item.id === keluarItem.id ? { ...item, stok: movement.stokSesudah } : item)));
      setKeluarItem(null);
      refreshMovements();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Barang keluar gagal disimpan."); }
  }

  const metrics = useMemo(() => computeMetrics(items), [items]);

  const filteredItems = useMemo(
    () => filterItems(items, searchQuery, selectedMerek, selectedKategori, selectedProyek),
    [items, searchQuery, selectedMerek, selectedKategori, selectedProyek]
  );

  function handleProyekChange(value: string) {
    setSelectedProyek(value);
    if (value !== "ALL") setSelectedKategori("proyek");
  }

  return (
    <>
      <div className={s.container}>
        <div className={s.wrapper}>
          <GudangHeader
            totalStok={metrics.totalStok}
            totalJenisItem={items.length}
            jumlahLowStock={metrics.jumlahLowStock}
            onTambah={() => setShowTambah(true)}
          />
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <ProjectStockSummary
            items={items}
            selectedProyek={selectedProyek}
            onProyekChange={handleProyekChange}
          />
          <GudangTable
            items={filteredItems}
            searchQuery={searchQuery}
            selectedMerek={selectedMerek}
            selectedKategori={selectedKategori}
            selectedProyek={selectedProyek}
            daftarMerek={metrics.daftarMerek}
            daftarProyek={metrics.daftarProyek}
            onSearchChange={setSearchQuery}
            onMerekChange={setSelectedMerek}
            onKategoriChange={setSelectedKategori}
            onProyekChange={handleProyekChange}
            onStock={handleStock}
            onMasuk={setMasukItem}
            onKeluar={setKeluarItem}
          />
          <MovementHistorySection movements={movements} items={items} />
        </div>
      </div>

      {stockItem && (
        <StockUpdateModal
          item={stockItem}
          onClose={() => setStockItem(null)}
          onSave={handleSaveStock}
        />
      )}

      {masukItem && (
        <StockMasukModal
          item={masukItem}
          onClose={() => setMasukItem(null)}
          onSave={handleSaveMasuk}
        />
      )}

      {keluarItem && (
        <StockKeluarModal
          item={keluarItem}
          onClose={() => setKeluarItem(null)}
          onSave={handleSaveKeluar}
        />
      )}

      {showTambah && (
        <ItemFormModal
          onClose={() => setShowTambah(false)}
          onSave={handleCreateItem}
        />
      )}
    </>
  );
}
