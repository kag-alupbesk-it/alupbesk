"use client";

import Image from "next/image";
import { useId, useState, useEffect, type ChangeEvent, type DragEvent } from "react";
import { Check, FileImage, Layers3, Plus, Trash2, UploadCloud, Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSearchItemId, setActiveSearchItemId] = useState<string | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set());
  const [searchSearched, setSearchSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/gudang/inventory/search?query=${searchQuery}`);
        const data = await response.json();
        if (response.ok) {
          setSearchResults(data.data || []);
          setSearchSearched(true);
        } else {
          console.error("API Error:", data);
          setSearchResults([]);
          setSearchSearched(true);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setSearchResults([]);
        setSearchSearched(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectItem = (itemId: string, item: any) => {
    setForm({
      ...form,
      items: form.items.map((i) =>
        i.id === itemId
          ? { ...i, name: `${item.itemName} (${item.brand} - ${item.modelNo})`, inventoryItemId: item.id, technicalNote: `Warna: ${item.color}, Rack: ${item.rackGroup}` }
          : i
      ),
    });
    setConfirmedItems(new Set([...confirmedItems, itemId]));
    setActiveSearchItemId(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchSearched(false);
  };

  const addCustomRequestItem = (itemId: string) => {
    setForm({
      ...form,
      items: form.items.map((i) =>
        i.id === itemId ? { ...i, inventoryItemId: undefined } : i
      ),
    });
    setConfirmedItems(new Set([...confirmedItems, itemId]));
    setActiveSearchItemId(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchSearched(false);
  };

  const update = (key: keyof CustomRequestForm, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const updateItem = (id: string, field: keyof Omit<CustomRequestFormItem, "id">, value: any) => {
    setForm({
      ...form,
      items: form.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const removeItem = (id: string) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((item) => item.id !== id) });
    const next = new Set(confirmedItems);
    next.delete(id);
    setConfirmedItems(next);
  };

  const startSearch = (itemId: string) => {
    setActiveSearchItemId(itemId);
    setSearchQuery("");
    setSearchResults([]);
    setSearchSearched(false);
  };

  const cancelSearch = () => {
    setActiveSearchItemId(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchSearched(false);
  };

  const addItem = () => {
    const newId = `${formId}-item-added-${form.items.length + 1}`;
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          id: newId,
          name: "",
          quantity: "1",
          unit: "pcs",
          panjang: "",
          lebar: "",
          unitDimensi: "cm",
          technicalNote: "",
          inventoryItemId: undefined,
        },
      ],
    });
    setConfirmedItems(new Set([...confirmedItems, newId]));
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
                <p className="mt-2 text-xs font-bold text-on-surface">Membaca preview...</p>
              </div>
            ) : upload.imagePreview || upload.imageName ? (
              <div className="flex flex-col gap-3 text-left sm:flex-row sm:items-center">
                {upload.imagePreview ? (
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border border-outline/30 bg-slate-100 sm:w-40">
                    <Image src={upload.imagePreview} alt="Preview gambar" fill unoptimized sizes="160px" className="object-contain" />
                  </div>
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-lg border border-outline/30 bg-surface-variant/50 sm:w-40">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">picture_as_pdf</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-400"><Check size={14} /><span className="text-xs font-bold">Berkas siap dilampirkan</span></div>
                  <p className="mt-1 truncate text-xs font-semibold text-on-surface">{upload.imageName}</p>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant">Preview lokal. File diunggah saat request dikirim.</p>
                  <button type="button" onClick={upload.clearImage} className="mt-2 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-red-400 hover:bg-error/10">Hapus preview</button>
                </div>
              </div>
            ) : (
              <label htmlFor="custom-raw-image" className="flex cursor-pointer flex-col items-center justify-center py-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><UploadCloud size={18} /></div>
                <p className="mt-2 text-xs font-bold text-on-surface">Drop gambar di sini atau <span className="text-secondary">browse file</span></p>
                <p className="mt-1 text-[10px] text-on-surface-variant">PNG, JPG, WEBP, atau PDF · maksimal 5 MB</p>
              </label>
            )}
            <input id="custom-raw-image" name="rawImage" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={upload.handleFileChange} disabled={upload.isReadingImage} className="sr-only" />
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

               {activeSearchItemId === item.id ? (
                 <div className="mb-4 rounded-xl border border-secondary/30 bg-surface-variant p-3 space-y-2">
                   <div className="flex items-center gap-2">
                     <Search size={16} className="text-secondary" />
                     <input className={`${styles.field} flex-1`} placeholder="Ketik nama barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                     <button onClick={cancelSearch}><X size={18} className="text-on-surface-variant" /></button>
                   </div>
                   {searchResults.map(result => (
                     <button key={result.id} onClick={() => selectItem(item.id, result)} className="w-full text-left rounded-lg bg-surface p-2 text-xs hover:bg-secondary/10">
                       {result.itemName} ({result.brand})
                     </button>
                   ))}
                   {searchQuery.length >= 2 && searchSearched && searchResults.length === 0 && (
                     <div className="mt-2 text-center">
                       <p className="text-xs text-on-surface-variant py-1">Barang tidak ditemukan.</p>
                       <button type="button" onClick={() => addCustomRequestItem(item.id)} className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-[10px] font-bold text-secondary hover:bg-secondary/20">
                         <Plus size={13} /> Tambah Request Barang
                       </button>
                     </div>
                   )}
                 </div>
               ) : !confirmedItems.has(item.id) && !item.inventoryItemId && !item.name ? (
                 <button type="button" onClick={() => startSearch(item.id)} className="mb-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-[10px] font-bold text-secondary transition-colors hover:bg-secondary/20">
                   <Search size={13} /> Cari Barang dari Gudang
                 </button>
               ) : (
                 <button type="button" onClick={() => startSearch(item.id)} className="mb-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-[10px] font-bold text-secondary transition-colors hover:bg-secondary/20">
                   <Search size={13} /> {item.inventoryItemId ? "Ganti Barang dari Gudang" : "Ganti Barang"}
                 </button>
               )}

              {confirmedItems.has(item.id) || item.inventoryItemId || item.name ? (
                <>
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
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px]">
                    <label className="space-y-1.5 block">
                      <span className={styles.label}>Panjang</span>
                      <input type="number" min="0" step="0.01" inputMode="decimal" className={styles.field} placeholder="cth. 100" value={item.panjang} onChange={(event) => updateItem(item.id, "panjang", event.target.value)} />
                    </label>
                    <label className="space-y-1.5 block">
                      <span className={styles.label}>Lebar</span>
                      <input type="number" min="0" step="0.01" inputMode="decimal" className={styles.field} placeholder="cth. 200" value={item.lebar} onChange={(event) => updateItem(item.id, "lebar", event.target.value)} />
                    </label>
                    <label className="space-y-1.5 block">
                      <span className={styles.label}>Satuan Ukuran</span>
                      <select className={styles.field} value={item.unitDimensi} onChange={(event) => updateItem(item.id, "unitDimensi", event.target.value)}>
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                      </select>
                    </label>
                  </div>
                  <label className="mt-3 space-y-1.5 block">
                    <span className={styles.label}>Catatan Teknis</span>
                    <textarea rows={2} className={`${styles.field} resize-none`} placeholder="Tambahkan finish, material, atau spesifikasi khusus..." value={item.technicalNote} onChange={(event) => updateItem(item.id, "technicalNote", event.target.value)} />
                  </label>
                </>
              ) : (
                <p className="text-[11px] text-on-surface-variant">Cari barang dari gudang atau tambahkan sebagai request barang baru.</p>
              )}
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
