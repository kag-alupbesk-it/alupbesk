"use client";

import { useEffect, useState } from "react";
import * as s from "../style";
import PartnerFormModal from "./PartnerFormModal";
import { contentApi } from "@/services/api";
import type { Partner, PartnerInput } from "@/backend/modules/content";
import type { PartnerFormData } from "./types";
import { partnerToForm, formToPartnerInput } from "./types";

export default function PartnersTab() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Partner | null>(null);

  useEffect(() => {
    contentApi
      .getPartners()
      .then(setItems)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Mitra gagal dimuat."))
      .finally(() => setLoading(false));
  }, []);

  async function refresh() {
    setItems(await contentApi.getPartners());
  }

  async function handleSave(form: PartnerFormData, id?: string) {
    const input: PartnerInput = formToPartnerInput(form);
    try {
      if (id) await contentApi.updatePartner(id, input);
      else await contentApi.createPartner(input);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mitra gagal disimpan.");
    }
    setShowForm(false);
    setEditItem(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus mitra ini?")) return;
    try {
      await contentApi.deletePartner(id);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mitra gagal dihapus.");
    }
  }

  async function handleToggle(item: Partner) {
    try {
      await contentApi.updatePartner(item.id, { ...formToPartnerInput(partnerToForm(item)), active: !item.active });
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mitra gagal diubah.");
    }
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Kelola Mitra</h3>
          <p className={s.subtitle}>Atur brand partner yang tampil pada carousel mitra di halaman depan.</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className={s.addButton}>
          <span className={s.icon}>add</span>
          <span>Tambah Mitra</span>
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white/5 rounded animate-pulse" />)}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-10 text-center">Belum ada mitra. Klik &quot;Tambah Mitra&quot; untuk menambahkan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sorted.map((item) => (
            <div key={item.id} className={s.card}>
              <div className={s.cardHeader}>
                <div className="flex items-center gap-3">
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt="" className="size-12 rounded-full object-contain bg-surface p-2 border border-outline/30" />
                  ) : (
                    <span className="size-12 rounded-full bg-secondary/15 text-secondary grid place-items-center text-sm font-black">{item.initials}</span>
                  )}
                  <h4 className={s.cardTitle}>{item.name}</h4>
                </div>
                <span className={`${s.badge} ${item.active ? s.badgeActive : s.badgeInactive}`}>
                  {item.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
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

      <PartnerFormModal isOpen={showForm} editPartner={editItem} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={handleSave} />
    </div>
  );
}
