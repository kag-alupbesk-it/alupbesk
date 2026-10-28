"use client";

import { useCallback, useState } from "react";
import * as s from "../../style/style";
import ServiceFormModal from "../ServiceFormModal/ServiceFormModal";
import { contentApi } from "@/services/api/index";
import type { CustomService, CustomServiceInput } from "@/backend/modules/content/index";
import type { ServiceFormData } from "../types/types";
import { serviceToForm, formToServiceInput } from "../types/types";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export default function ServicesTab() {
  const loadServices = useCallback(() => contentApi.getServices(), []);
  const { data: items, loading, error: loadError, refresh } = usePollingResource<CustomService[]>(loadServices, []);
  const [actionError, setActionError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<CustomService | null>(null);

  async function handleSave(form: ServiceFormData, id?: string) {
    const input: CustomServiceInput = formToServiceInput(form);
    try {
      if (id) await contentApi.updateService(id, input);
      else await contentApi.createService(input);
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Layanan gagal disimpan.");
    }
    setShowForm(false);
    setEditItem(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus layanan ini?")) return;
    try {
      await contentApi.deleteService(id);
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Layanan gagal dihapus.");
    }
  }

  async function handleToggle(item: CustomService) {
    try {
      await contentApi.updateService(item.id, { ...formToServiceInput(serviceToForm(item)), active: !item.active });
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Layanan gagal diubah.");
    }
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Kelola Layanan Custom</h3>
          <p className={s.subtitle}>Atur daftar layanan custom yang tampil pada halaman Jasa Custom.</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className={s.addButton}>
          <span className={s.icon}>add</span>
          <span>Tambah Layanan</span>
        </button>
      </div>

      {(actionError || loadError) && <p className="mb-4 text-sm text-red-400">{actionError || loadError}</p>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white/5 rounded animate-pulse" />)}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-10 text-center">Belum ada layanan. Klik &quot;Tambah Layanan&quot; untuk menambahkan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sorted.map((item) => (
            <div key={item.id} className={s.card}>
              <div className={s.cardHeader}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-3xl">{item.icon}</span>
                  <h4 className={s.cardTitle}>{item.title}</h4>
                </div>
                <span className={`${s.badge} shrink-0 ${item.active ? s.badgeActive : s.badgeInactive}`}>
                  {item.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className={s.cardDesc}>{item.description}</p>
              <p className={s.meta}>Urutan ke-{item.sortOrder}</p>
              <div className={s.actions}>
                <button onClick={() => { setEditItem(item); setShowForm(true); }} className={`${s.actionButton} ${s.actionEdit}`}>
                  <span className={s.icon}>edit</span> Edit
                </button>
                <button onClick={() => handleToggle(item)} className={`${s.actionButton} ${s.actionToggle}`}>
                  <span className={s.icon}>{item.active ? "visibility_off" : "visibility"}</span>
                  {item.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button onClick={() => handleDelete(item.id)} className={`${s.actionButton} ${s.actionDelete} ml-auto`}>
                  <span className={s.icon}>delete</span> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ServiceFormModal isOpen={showForm} editItem={editItem} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={handleSave} />}
    </div>
  );
}
