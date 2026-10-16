"use client";

import Image from "next/image";
import { useId, type ChangeEvent, type DragEvent } from "react";
import { Check, FileImage, Layers3, Plus, Trash2, UploadCloud } from "lucide-react";
import { customStyles as styles } from "../../style/style";
import type { CustomRequestForm, CustomRequestFormItem } from "@/frontend/(pelanggan)/types/types";

export interface CustomImageUploadState {
  imagePreview?: string;
  imageName: string;
  isReadingImage: boolean;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
  clearImage: () => void;
}

const cardHeader = "rounded-2xl border border-outline/20 bg-primary-container p-5 sm:p-6 space-y-5";
const sectionTitle = "font-headline text-base font-bold text-on-surface";
const sectionSubtitle = "mt-1 text-[10px] text-on-surface-variant";
const gridField = "space-y-1.5 block";

export default function RequestForm({
  form,
  setForm,
  upload,
}: {
  form: CustomRequestForm;
  setForm: (form: CustomRequestForm) => void;
  upload: CustomImageUploadState;
}) {
  const formId = useId();

  const update = (key: keyof CustomRequestForm, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const updateItem = (id: string, field: keyof Omit<CustomRequestFormItem, "id">, value: string) => {
    setForm({
      ...form,
      items: form.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const removeItem = (id: string) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((item) => item.id !== id) });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { id: `${formId}-item-added-${form.items.length + 1}`, name: "", quantity: "1", unit: "pcs", technicalNote: "" },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <section className={cardHeader}>
        <div className="flex items-start gap-3 border-b border-outline/15 pb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><Layers3 size={17} /></div>
          <div>
            <h3 className={sectionTitle}>Informasi Order</h3>
            <p className={sectionSubtitle}>Identitas pemesan dan lampiran gambar referensi.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className={gridField}>
            <span className={styles.label}>Nama Lengkap <span className="text-secondary">*</span></span>
            <input className={styles.field} placeholder="cth. Budi Santoso" value={form.nama} onChange={(event) => update("nama", event.target.value)} required />
          </label>
          <label className={gridField}>
            <span className={styles.label}>Nama Perusahaan <span className="text-secondary">*</span></span>
            <input className={styles.field} placeholder="cth. PT Contoh Indonesia" value={form.perusahaan} onChange={(event) => update("perusahaan", event.target.value)} required />
          </label>
          <label className={gridField}>
            <span className={styles.label}>Email</span>
            <input type="email" className={styles.field} placeholder="john@perusahaan.com" value={form.email} onChange={(event) => update("email", event.target.value)} />
          </label>
          <label className={gridField}>
            <span className={styles.label}>No. WhatsApp <span className="text-secondary">*</span></span>
            <input type="tel" className={styles.field} placeholder="+62 812 3456 7890" value={form.telp} onChange={(event) => update("telp", event.target.value)} required />
          </label>
          <label className={gridField}>
            <span className={styles.label}>Alamat Proyek <span className="text-secondary">*</span></span>
            <input className={styles.field} placeholder="Alamat tujuan pengiriman" value={form.projectAddress} onChange={(event) => update("projectAddress", event.target.value)} required />
          </label>
          <label className={gridField}>
            <span className={styles.label}>Target Deadline <span className="text-secondary">*</span></span>
            <input type="date" className={`${styles.field} max-w-xs`} value={form.deadline} onChange={(event) => update("deadline", event.target.value)} required />
          </label>
        </div>

        {/* Upload Gambar Mentah / Referensi */}
        <div className="pt-4 border-t border-outline/15 space-y-3">
          <div className="flex items-center gap-2">
            <UploadCloud size={16} className="text-secondary" />
            <span className="text-xs font-semibold text-on-surface">Upload Gambar / Sketsa Referensi <span className="text-secondary">*</span></span>
          </div>
          <div
            onDragOver={(event) => { event.preventDefault(); }}
            onDrop={upload.handleDrop}
            className="rounded-xl border-2 border-dashed border-outline/30 bg-surface-container/60 p-4 text-center transition-colors hover:border-secondary/50"
          >
            {upload.isReadingImage ? (
              <div className="flex flex-col items-center justify-center py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><UploadCloud size={18} className="animate-pulse" /></div>
                <p className="mt-2 text-xs font-bold text-on-surface">Membaca preview gambar...</p>
              </div>
            ) : upload.imagePreview ? (
              <div className="flex flex-col gap-3 text-left sm:flex-row sm:items-center">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border border-outline/30 bg-slate-100 sm:w-40">
                  <Image src={upload.imagePreview} alt="Preview gambar mentah" fill unoptimized sizes="160px" className="object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-400"><Check size={14} /><span className="text-xs font-bold">Gambar siap dilampirkan</span></div>
                  <p className="mt-1 truncate text-xs font-semibold text-on-surface">{upload.imageName}</p>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant">Preview lokal. File diunggah saat request dikirim.</p>
                  <button type="button" onClick={upload.clearImage} className="mt-2 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-red-400 hover:bg-error/10">Hapus preview</button>
                </div>
              </div>
            ) : (
              <label htmlFor="custom-raw-image" className="flex cursor-pointer flex-col items-center justify-center py-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><UploadCloud size={18} /></div>
                <p className="mt-2 text-xs font-bold text-on-surface">Drop gambar di sini atau <span className="text-secondary">browse file</span></p>
                <p className="mt-1 text-[10px] text-on-surface-variant">PNG, JPG, atau WEBP · maksimal 5 MB</p>
              </label>
            )}
            <input id="custom-raw-image" name="rawImage" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload.handleFileChange} disabled={upload.isReadingImage} className="sr-only" />
          </div>
        </div>
      </section>

      <section className={cardHeader}>
        <div className="flex items-start gap-3 border-b border-outline/15 pb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300"><FileImage size={17} /></div>
          <div>
            <h3 className={sectionTitle}>Spesifikasi Item</h3>
            <p className={sectionSubtitle}>Tambahkan detail barang yang perlu dibuat. Bisa lebih dari satu.</p>
          </div>
          <button type="button" onClick={addItem} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-[10px] font-bold text-secondary transition-colors hover:bg-secondary/20">
            <Plus size={13} /> Tambah Item
          </button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-outline/20 bg-surface-container p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Item {String(index + 1).padStart(2, "0")}</span>
                <button type="button" onClick={() => removeItem(item.id)} disabled={form.items.length === 1} aria-label={`Hapus item ${index + 1}`} className="rounded-lg p-1.5 text-on-surface-variant/60 transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-30">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_110px_120px]">
                <label className="space-y-1.5 block">
                  <span className={styles.label}>Nama Item <span className="text-secondary">*</span></span>
                  <input className={styles.field} placeholder="cth. Curtain Wall Aluminium" value={item.name} onChange={(event) => updateItem(item.id, "name", event.target.value)} />
                </label>
                <label className="space-y-1.5 block">
                  <span className={styles.label}>Kuantitas <span className="text-secondary">*</span></span>
                  <input type="number" min="1" className={styles.field} value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} />
                </label>
                <label className="space-y-1.5 block">
                  <span className={styles.label}>Satuan</span>
                  <input className={styles.field} placeholder="pcs / m²" value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} />
                </label>
              </div>
              <label className="mt-3 space-y-1.5 block">
                <span className={styles.label}>Catatan Teknis</span>
                <textarea rows={2} className={`${styles.field} resize-none`} placeholder="Tambahkan finish, material, atau spesifikasi khusus..." value={item.technicalNote} onChange={(event) => updateItem(item.id, "technicalNote", event.target.value)} />
              </label>
            </div>
          ))}
        </div>
      </section>

      {catatanSection(form, update)}
    </div>
  );
}

function catatanSection(form: CustomRequestForm, update: (key: keyof CustomRequestForm, value: string) => void) {
  return (
    <section className={cardHeader}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><FileImage size={17} /></div>
        <div>
          <h3 className={sectionTitle}>Deskripsi Kebutuhan <span className="text-secondary">*</span></h3>
          <p className={sectionSubtitle}>Jelaskan kebutuhan Anda secara detail agar penawaran sesuai.</p>
        </div>
      </div>
      <label className="space-y-1.5 block">
        <textarea rows={4} className={`${styles.field} resize-none`} placeholder="Contoh: kebutuhan partisi aluminium untuk kantor, preferensi warna natural silver..." value={form.deskripsi} onChange={(event) => update("deskripsi", event.target.value)} required />
      </label>
    </section>
  );
}
