"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Pencil, Play, Plus, Trash2 } from "lucide-react";
import type {
  GudangInventoryItemView,
  GudangMaterialLotView,
} from "@/backend/modules/gudangInventory";
import type {
  CreateCutListInput,
  ExecuteAllocationInput,
  PMCutList,
  UpdateCutListInput,
} from "@/backend/modules/pm/cutting";
import { cuttingApi } from "@/services/api/pm/cutting";
import { useProduksi } from "../../context/ProduksiContext/ProduksiContext";
import { CutListFormModal } from "./CutListFormModal";
import { ExecuteCutModal } from "./ExecuteCutModal";

const cardClass = "rounded-2xl border border-outline/30 bg-surface-container-low p-5 lg:p-6";
const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold text-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

function statusBadge(status: PMCutList["status"]) {
  if (status === "selesai") {
    return { label: "Selesai", className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" };
  }
  if (status === "diproses") {
    return { label: "Diproses", className: "bg-secondary/12 text-secondary border-secondary/30" };
  }
  return { label: "Draft", className: "bg-slate-400/10 text-slate-300 border-slate-400/30" };
}

function allocatedFor(list: PMCutList, itemId: string): number {
  const item = list.items.find((entry) => entry.id === itemId);
  if (!item) return 0;
  return item.allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
}

async function fetchCuttingData() {
  const [lists, materialList, lotList] = await Promise.all([
    cuttingApi.list(),
    cuttingApi.listMaterials(),
    cuttingApi.listLots(),
  ]);
  return { lists, materialList, lotList };
}

export function CuttingList() {
  const { spk } = useProduksi();
  const [cutLists, setCutLists] = useState<PMCutList[]>([]);
  const [materials, setMaterials] = useState<GudangInventoryItemView[]>([]);
  const [lots, setLots] = useState<GudangMaterialLotView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editList, setEditList] = useState<PMCutList | null>(null);
  const [executeTarget, setExecuteTarget] = useState<PMCutList | null>(null);

  const spkOptions = useMemo(
    () =>
      spk.map((item) => ({
        id: item.nomor,
        label: `${item.kodeProduksi ? `${item.kodeProduksi} · ` : ""}${item.namaKontraktor}`,
      })),
    [spk],
  );
  const spkLabel = useMemo(
    () => new Map(spkOptions.map((option) => [option.id, option.label])),
    [spkOptions],
  );
  const itemName = useMemo(
    () => new Map(materials.map((material) => [material.id, material.itemName])),
    [materials],
  );

  const load = useCallback(async () => {
    const { lists, materialList, lotList } = await fetchCuttingData();
    setCutLists(lists);
    setMaterials(materialList);
    setLots(lotList);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { lists, materialList, lotList } = await fetchCuttingData();
        if (!active) return;
        setCutLists(lists);
        setMaterials(materialList);
        setLots(lotList);
        setError("");
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : "Data cutting list gagal dimuat.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function run(action: () => Promise<void>, fallback: string, success: string) {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await action();
      setNotice(success);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : fallback);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(input: CreateCutListInput) {
    await run(
      async () => {
        await cuttingApi.create(input);
        setShowForm(false);
      },
      "Daftar potong gagal dibuat.",
      "Daftar potong dibuat.",
    );
  }

  async function handleUpdate(id: string, input: UpdateCutListInput) {
    await run(
      async () => {
        await cuttingApi.update(id, input);
        setEditList(null);
      },
      "Daftar potong gagal diperbarui.",
      "Daftar potong diperbarui.",
    );
  }

  async function handleExecute(id: string, allocations: ExecuteAllocationInput[]) {
    await run(
      async () => {
        await cuttingApi.execute(id, allocations);
        setExecuteTarget(null);
      },
      "Eksekusi potong gagal.",
      "Potong dieksekusi, sisa lot diperbarui.",
    );
  }

  async function handleDelete(list: PMCutList) {
    await run(
      async () => {
        await cuttingApi.remove(list.id);
      },
      "Daftar potong gagal dihapus.",
      "Daftar potong dihapus.",
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-headline text-xl font-extrabold uppercase tracking-tight text-on-surface lg:text-2xl">
            Cutting List
          </h1>
          <p className="mt-1 text-xs text-on-surface-variant">
            Kelola daftar potong material per SPK dan catat sisa potong bahan.
          </p>
        </div>
        <button
          className={primaryButtonClass}
          onClick={() => {
            setEditList(null);
            setShowForm(true);
          }}
          disabled={saving}
        >
          <Plus size={15} /> Buat Daftar Potong
        </button>
      </header>

      {(error || notice) && (
        <p
          className={[
            "mb-4 rounded-xl border px-4 py-3 text-xs",
            error
              ? "border-red-400/30 bg-red-400/10 text-red-200"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
          ].join(" ")}
        >
          {error || notice}
        </p>
      )}

      {loading ? (
        <p className="py-16 text-center text-xs text-on-surface-variant">Memuat...</p>
      ) : cutLists.length === 0 ? (
        <div className={`${cardClass} py-16 text-center`}>
          <ClipboardCheck size={28} className="mx-auto mb-3 text-on-surface-variant/50" />
          <p className="text-xs text-on-surface-variant">
            Belum ada daftar potong. Buat daftar potong untuk SPK yang sedang dikerjakan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {cutLists.map((list) => {
            const badge = statusBadge(list.status);
            return (
              <section key={list.id} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-on-surface">
                      {list.title || "Daftar Potong"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-on-surface-variant">
                      {spkLabel.get(list.orderId) ?? list.orderId}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-outline/25">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-surface-variant/40 text-on-surface-variant">
                      <tr>
                        <th className="px-3 py-2 font-bold uppercase tracking-wide">Komponen</th>
                        <th className="px-3 py-2 text-right font-bold uppercase tracking-wide">Qty</th>
                        <th className="px-3 py-2 text-right font-bold uppercase tracking-wide">Terpotong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.items.map((item) => (
                        <tr key={item.id} className="border-t border-outline/20">
                          <td className="px-3 py-2 text-on-surface">
                            {item.componentName}
                            {item.length != null ? ` · ${item.length} cm` : ""}
                            {item.materialItemId ? (
                              <span className="block text-[10px] text-on-surface-variant">
                                {itemName.get(item.materialItemId) ?? "bahan"}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-right text-on-surface">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-bold text-on-surface">
                            {allocatedFor(list, item.id)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {list.note && (
                  <p className="mt-2 text-[10px] text-on-surface-variant">{list.note}</p>
                )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  {list.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => setEditList(list)}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg border border-outline/30 px-3 py-2 text-[11px] font-bold text-on-surface-variant transition-colors hover:text-on-surface"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  {list.status !== "selesai" && (
                    <button
                      type="button"
                      onClick={() => setExecuteTarget(list)}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-[11px] font-bold text-primary transition-all hover:brightness-110"
                    >
                      <Play size={13} /> Eksekusi
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(list)}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-lg border border-outline/30 px-3 py-2 text-[11px] font-bold text-on-surface-variant transition-colors hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {showForm && (
        <CutListFormModal
          spkOptions={spkOptions}
          materials={materials}
          cutList={null}
          saving={saving}
          onClose={() => setShowForm(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {editList && (
        <CutListFormModal
          spkOptions={spkOptions}
          materials={materials}
          cutList={editList}
          saving={saving}
          onClose={() => setEditList(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {executeTarget && (
        <ExecuteCutModal
          cutList={executeTarget}
          lots={lots}
          saving={saving}
          onClose={() => setExecuteTarget(null)}
          onSubmit={(allocations) => handleExecute(executeTarget.id, allocations)}
        />
      )}
    </div>
  );
}
