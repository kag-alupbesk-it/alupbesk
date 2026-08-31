"use client";

import { useEffect, useState } from "react";
import * as s from "../style";
import FaqFormModal from "./FaqFormModal";
import { contentApi } from "@/services/api";
import type { FaqItem, FaqItemInput } from "@/backend/modules/content";
import type { FaqFormData } from "./types";
import { faqToForm, formToFaqInput } from "./types";

export default function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FaqItem | null>(null);

  useEffect(() => {
    contentApi
      .getFaq()
      .then(setItems)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "FAQ gagal dimuat."))
      .finally(() => setLoading(false));
  }, []);

  async function refresh() {
    setItems(await contentApi.getFaq());
  }

  async function handleSave(form: FaqFormData, id?: string) {
    const input: FaqItemInput = formToFaqInput(form);
    try {
      if (id) await contentApi.updateFaq(id, input);
      else await contentApi.createFaq(input);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "FAQ gagal disimpan.");
    }
    setShowForm(false);
    setEditItem(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      await contentApi.deleteFaq(id);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "FAQ gagal dihapus.");
    }
  }

  async function handleToggle(item: FaqItem) {
    try {
      await contentApi.updateFaq(item.id, { ...formToFaqInput(faqToForm(item)), active: !item.active });
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "FAQ gagal diubah.");
    }
  }

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Kelola FAQ</h3>
          <p className={s.subtitle}>Atur pertanyaan yang sering diajukan untuk ditampilkan pada bagian FAQ website.</p>
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }} className={s.addButton}>
          <span className={s.icon}>add</span>
          <span>Tambah FAQ</span>
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />)}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-10 text-center">Belum ada FAQ. Klik &quot;Tambah FAQ&quot; untuk menambahkan.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => (
            <div key={item.id} className={s.card}>
              <div className={s.cardHeader}>
                <div className="flex-1">
                  <h4 className={s.cardTitle}>{item.question}</h4>
                  <p className={s.cardDesc}>{item.answer}</p>
                </div>
                <span className={`${s.badge} shrink-0 ${item.active ? s.badgeActive : s.badgeInactive}`}>
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

      <FaqFormModal isOpen={showForm} editItem={editItem} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={handleSave} />
    </div>
  );
}
