"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileImage,
  Info,
  Layers3,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { usePMOrders } from "../../context/PMOrderContext/PMOrderContext";

interface FormItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  technicalNote: string;
}

const inputClass = "mt-2 w-full rounded-xl border border-outline/35 bg-surface px-3.5 py-3 text-xs text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-secondary/70 focus:ring-2 focus:ring-secondary/10";
const labelClass = "text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant";
const maxFileSize = 10 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function createItem(id: string): FormItem {
  return { id, name: "", quantity: "1", unit: "pcs", technicalNote: "" };
}

export function CreateOrderForm() {
  const router = useRouter();
  const { addOrder } = usePMOrders();
  // Id baris item harus sama antara render server dan client agar tidak terjadi hydration
  // mismatch, jadi pakai useId() sebagai prefix (bukan Date.now()).
  const formId = useId();
  const [contractorName, setContractorName] = useState("");
  const [contractorCode, setContractorCode] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [items, setItems] = useState<FormItem[]>(() => [createItem(`${formId}-item-1`)]);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [imageName, setImageName] = useState("");
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const updateItem = (id: string, field: keyof Omit<FormItem, "id">, value: string) => {
    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) return currentItems;
      return currentItems.filter((item) => item.id !== id);
    });
  };

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!acceptedImageTypes.has(file.type)) {
      setError("File gambar harus berformat PNG, JPG, atau WEBP.");
      return;
    }
    if (file.size > maxFileSize) {
      setError("Ukuran gambar maksimal 10 MB.");
      return;
    }

    setIsReadingImage(true);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setImageName(file.name);
        setError("");
      }
      setIsReadingImage(false);
    };
    reader.onerror = () => {
      setImagePreview(undefined);
      setImageName("");
      setIsReadingImage(false);
      setError("Gambar tidak dapat dibaca. Coba pilih file lain.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    readFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  };

  const clearImage = () => {
    setImagePreview(undefined);
    setImageName("");
    setError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isReadingImage) {
      setError("Tunggu sampai preview gambar selesai dibaca.");
      return;
    }
    if (!contractorName.trim() || !contractorCode.trim() || !targetDate) {
      setError("Nama kontraktor, kode produksi, dan target selesai wajib diisi.");
      return;
    }

    const hasInvalidItem = items.some(
      (item) => item.name.trim() && (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0),
    );
    if (hasInvalidItem) {
      setError("Kuantitas setiap item yang memiliki nama harus lebih besar dari nol.");
      return;
    }

    const validItems = items.filter((item) => item.name.trim() && Number(item.quantity) > 0);
    if (validItems.length === 0) {
      setError("Tambahkan minimal satu item dengan kuantitas yang valid.");
      return;
    }

    addOrder({
      contractorName,
      contractorCode,
      targetDate,
      items: validItems.map((item) => ({
        name: item.name.trim(),
        quantity: Math.max(1, Math.floor(Number(item.quantity))),
        unit: item.unit.trim() || "pcs",
        technicalNote: item.technicalNote.trim(),
      })),
      rawImage: imagePreview,
      rawImageName: imageName || undefined,
    });
    router.push("/pm");
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <Link href="/pm" className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-colors hover:text-secondary">
          <ArrowLeft size={14} /> Kembali ke overview
        </Link>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Tambah Order Baru</h2>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">Catat kebutuhan kontraktor dan referensi desain sebelum meneruskan order ke tim teknis.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
            <div className="flex items-start gap-3 border-b border-outline/20 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary"><Layers3 size={17} /></div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Informasi Order</h3>
                <p className="mt-1 text-[10px] text-on-surface-variant">Identitas order dan komunikasi internal dengan kontraktor.</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="contractor-name" className={labelClass}>Nama Kontraktor <span className="text-secondary">*</span></label>
                <input id="contractor-name" name="contractorName" value={contractorName} onChange={(event) => setContractorName(event.target.value)} placeholder="cth. PT Karya Mandiri" className={inputClass} required />
              </div>
              <div>
                <label htmlFor="contractor-code" className={labelClass}>Kode Produksi dari Kontraktor <span className="text-secondary">*</span></label>
                <input id="contractor-code" name="contractorCode" value={contractorCode} onChange={(event) => setContractorCode(event.target.value)} placeholder="cth. KM-7842-A" className={`${inputClass} font-mono uppercase`} required />
                <p className="mt-1.5 text-[9px] text-on-surface-variant/70">Kode ini menjadi acuan pencarian utama di dashboard.</p>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="target-date" className={labelClass}>Target Selesai <span className="text-secondary">*</span></label>
                <input id="target-date" name="targetDate" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className={`${inputClass} max-w-xs`} required />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
            <div className="flex items-start gap-3 border-b border-outline/20 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300"><FileImage size={17} /></div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Spesifikasi Item</h3>
                <p className="mt-1 text-[10px] text-on-surface-variant">Tambahkan detail barang yang perlu diproduksi.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-outline/25 bg-surface-variant/25 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Item {String(index + 1).padStart(2, "0")}</span>
                    <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} aria-label={`Hapus item ${index + 1}`} className="rounded-lg p-1.5 text-on-surface-variant/60 transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_110px_120px]">
                    <div>
                      <label htmlFor={`item-name-${item.id}`} className={labelClass}>Nama Item <span className="text-secondary">*</span></label>
                      <input id={`item-name-${item.id}`} name="itemName" value={item.name} onChange={(event) => updateItem(item.id, "name", event.target.value)} placeholder="cth. Curtain Wall Aluminium" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor={`item-quantity-${item.id}`} className={labelClass}>Kuantitas <span className="text-secondary">*</span></label>
                      <input id={`item-quantity-${item.id}`} name="itemQuantity" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor={`item-unit-${item.id}`} className={labelClass}>Satuan</label>
                      <input id={`item-unit-${item.id}`} name="itemUnit" value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} placeholder="pcs / m²" className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label htmlFor={`item-note-${item.id}`} className={labelClass}>Catatan Teknis</label>
                    <textarea id={`item-note-${item.id}`} name="itemTechnicalNote" value={item.technicalNote} onChange={(event) => updateItem(item.id, "technicalNote", event.target.value)} placeholder="Tambahkan finish, material, atau spesifikasi khusus..." rows={2} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5 sm:p-6">
            <div className="flex items-start gap-3 border-b border-outline/20 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><UploadCloud size={17} /></div>
              <div>
                <h3 className="font-headline text-base font-bold text-on-surface">Upload Gambar Mentah</h3>
                <p className="mt-1 text-[10px] text-on-surface-variant">Sketsa awal atau desain dari kontraktor untuk komunikasi tim teknis.</p>
              </div>
            </div>
            <div
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`mt-5 rounded-2xl border-2 border-dashed p-5 transition-colors sm:p-7 ${isDragging ? "border-secondary bg-secondary/8" : "border-outline/35 bg-surface-variant/20 hover:border-secondary/50"}`}
            >
              {isReadingImage ? (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"><UploadCloud size={22} className="animate-pulse" /></div>
                  <p className="mt-4 text-sm font-bold text-on-surface">Membaca preview gambar...</p>
                  <p className="mt-1.5 text-[10px] text-on-surface-variant">File hanya diproses di browser.</p>
                </div>
              ) : imagePreview ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-outline/30 bg-slate-100 sm:w-52">
                    <Image src={imagePreview} alt="Preview gambar mentah kontraktor" fill unoptimized sizes="208px" className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-emerald-300"><Check size={15} /><span className="text-xs font-bold">Gambar siap dilampirkan</span></div>
                    <p className="mt-2 truncate text-sm font-semibold text-on-surface">{imageName}</p>
                    <p className="mt-1 text-[10px] text-on-surface-variant">Preview lokal. File tidak diunggah ke server.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <label htmlFor="raw-image" className="cursor-pointer rounded-lg border border-outline/30 px-3 py-2 text-[10px] font-bold text-on-surface-variant hover:border-secondary/50 hover:text-secondary">Ganti gambar</label>
                      <button type="button" onClick={clearImage} className="rounded-lg px-3 py-2 text-[10px] font-bold text-red-300 hover:bg-error/10">Hapus preview</button>
                    </div>
                  </div>
                </div>
              ) : (
                <label htmlFor="raw-image" className="flex cursor-pointer flex-col items-center justify-center py-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary"><UploadCloud size={22} /></div>
                  <p className="mt-4 text-sm font-bold text-on-surface">Drop gambar di sini atau <span className="text-secondary">browse file</span></p>
                  <p className="mt-1.5 text-[10px] text-on-surface-variant">PNG, JPG, atau WEBP · maksimal 10 MB</p>
                </label>
              )}
              <input ref={imageInputRef} id="raw-image" name="rawImage" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} disabled={isReadingImage} className="sr-only" />
            </div>
          </section>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-xs text-red-300">
              <Info size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link href="/pm" className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline/35 px-4 py-3 text-xs font-bold text-on-surface-variant transition-colors hover:border-on-surface/40 hover:text-on-surface">Batal</Link>
            <button type="submit" disabled={isReadingImage} className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-xs font-extrabold text-primary shadow-lg shadow-secondary/15 transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60">
              <Save size={15} /> Simpan Order
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[100px] xl:self-start">
          <section className="rounded-2xl border border-secondary/20 bg-secondary/8 p-5">
            <div className="flex items-center gap-2 text-secondary"><Info size={15} /><h3 className="text-xs font-extrabold uppercase tracking-[0.12em]">Internal Workflow</h3></div>
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">Kontraktor tidak memiliki akses login. Semua data dan status komunikasi dicatat oleh PM di modul ini.</p>
            <div className="mt-5 space-y-3">
              {["Order masuk dari komunikasi eksternal", "Tim teknis membuat gambar produksi", "PM melakukan approval dan revisi"].map((step, index) => (
                <div key={step} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[9px] font-extrabold text-secondary">{index + 1}</span>
                  <p className="text-[10px] leading-relaxed text-on-surface-variant">{step}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-outline/30 bg-surface-container-low p-5">
            <h3 className="text-xs font-bold text-on-surface">Checklist sebelum simpan</h3>
            <div className="mt-4 space-y-3">
              {[
                [Boolean(contractorName), "Nama kontraktor terisi"],
                [Boolean(contractorCode), "Kode produksi tidak ambigu"],
                [Boolean(targetDate), "Target selesai ditentukan"],
                [items.some((item) => item.name.trim()), "Minimal satu item spesifikasi"],
              ].map(([ready, label]) => (
                <div key={String(label)} className="flex items-center gap-2.5 text-[10px]">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${ready ? "bg-emerald-400/15 text-emerald-300" : "bg-surface-variant text-on-surface-variant/40"}`}>
                    {ready ? <Check size={10} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={ready ? "text-on-surface-variant" : "text-on-surface-variant/55"}>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}
