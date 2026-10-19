"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import Link from "next/link";

import { customStyles as styles } from "../../style/style";
import { emptyCustomRequestForm, type CustomRequestFormItem } from "@/frontend/(pelanggan)/types/types";

import ServiceSelector from "../ServiceSelector/ServiceSelector";
import RequestForm, { type CustomImageUploadState } from "../RequestForm/RequestForm";
import RequestSidebar from "../RequestSidebar/RequestSidebar";
import SuccessState from "../SuccessState/SuccessState";
import { customApi } from "@/services/api/index";
import { contactDefaults } from "@/frontend/(pelanggan)/data/siteContentDefaults";
import { usePublicSiteContent } from "@/frontend/(pelanggan)/hooks/usePublicSiteContent";
import { getWhatsAppUrl } from "@/frontend/(pelanggan)/utils/getWhatsAppUrl";
import { buildCustomRequestMessage } from "@/frontend/shared/customRequests/message";

const maxFileSize = 5 * 1024 * 1024;
const acceptedFileTypes = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

// Ukuran (panjang x lebar) digabung ke catatan item agar ikut tersimpan & terkirim ke WhatsApp.
function gabungCatatanItem(item: CustomRequestFormItem): string {
  const panjang = item.panjang.trim();
  const lebar = item.lebar.trim();
  const bagian: string[] = [];
  if (panjang || lebar) {
    bagian.push(`Ukuran: ${panjang || "-"} x ${lebar || "-"} ${item.unitDimensi || "cm"}`);
  }
  if (item.technicalNote.trim()) bagian.push(item.technicalNote.trim());
  return bagian.join(" | ");
}

export default function CustomSection() {
  const [form, setForm] = useState(emptyCustomRequestForm);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isReadingImage, setIsReadingImage] = useState(false);

  const { data: contact } = usePublicSiteContent("contact", contactDefaults);

  const validItems = form.items.filter(
    (item) => item.name.trim() && Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0,
  );

  const isValid = Boolean(
    form.nama &&
      form.perusahaan &&
      form.telp &&
      form.projectAddress &&
      form.layanan &&
      form.deadline &&
      form.deskripsi &&
      imageFile &&
      validItems.length > 0 &&
      !isReadingImage,
  );

  const readFile = (file: File | undefined) => {
    if (!file) return;
    if (!acceptedFileTypes.has(file.type)) {
      setSubmitError("File harus berformat PNG, JPG, WEBP, atau PDF.");
      return;
    }
    if (file.size > maxFileSize) {
      setSubmitError("Ukuran file maksimal 5 MB.");
      return;
    }

    setIsReadingImage(true);
    setSubmitError("");
    setImageFile(file);

    // Jika PDF, jangan baca preview
    if (file.type === "application/pdf") {
      setImagePreview(undefined);
      setImageName(file.name);
      setIsReadingImage(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setImageName(file.name);
        setSubmitError("");
      }
      setIsReadingImage(false);
    };
    reader.onerror = () => {
      setImagePreview(undefined);
      setImageName("");
      setImageFile(null);
      setIsReadingImage(false);
      setSubmitError("Berkas tidak dapat dibaca. Coba pilih file lain.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    readFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    readFile(event.dataTransfer.files?.[0]);
  };

  const clearImage = () => {
    setImagePreview(undefined);
    setImageName("");
    setImageFile(null);
    setSubmitError("");
  };

  const upload: CustomImageUploadState = {
    imagePreview,
    imageName,
    isReadingImage,
    handleFileChange,
    handleDrop,
    clearImage,
  };

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    // Buka tab kosong sekarang, selagi masih dalam gesture klik. Jika ditunda
    // sampai setelah proses upload/create (async), browser memblokirnya sebagai
    // pop-up sehingga WhatsApp tidak pernah terbuka.
    const waTab = typeof window !== "undefined" ? window.open("", "_blank") : null;
    try {
      let imageUrl: string | undefined;
      let uploadedImageName: string | undefined;
      if (imageFile) {
        const formData = new FormData();
        formData.set("file", imageFile);
        const uploadResponse = await fetch("/api/custom/upload", {
          method: "POST",
          body: formData,
        });
        const uploadResult = (await uploadResponse.json()) as {
          success: boolean;
          data?: { url: string };
          error?: { message: string };
        };
        if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data) {
          throw new Error(uploadResult.error?.message ?? "Gambar gagal diunggah.");
        }
        imageUrl = uploadResult.data.url;
        uploadedImageName = imageName;
      }

      const items = validItems.map((item) => ({
        name: item.name.trim(),
        quantity: Math.max(1, Math.floor(Number(item.quantity))),
        unit: item.unit.trim() || "pcs",
        technicalNote: gabungCatatanItem(item),
      }));

      const created = await customApi.createRequest({
        nama: form.nama.trim(),
        kode: form.kode.trim() || undefined,
        perusahaan: form.perusahaan.trim() || undefined,
        email: form.email.trim() || undefined,
        telp: form.telp.trim(),
        projectAddress: form.projectAddress.trim() || undefined,
        layanan: form.layanan,
        deskripsi: form.deskripsi.trim(),
        deadline: form.deadline || undefined,
        items,
        rawImage: imageUrl,
        rawImageName: uploadedImageName,
      });

      const message = buildCustomRequestMessage(
        {
          nama: form.nama,
          kode: form.kode,
          perusahaan: form.perusahaan,
          telp: form.telp,
          projectAddress: form.projectAddress,
          layanan: form.layanan,
          deskripsi: form.deskripsi,
          deadline: form.deadline,
          items,
          rawImage: imageUrl,
        },
        "Halo ALUPBESK, saya ingin request Custom Quote:",
      );
      const waUrl = getWhatsAppUrl(contact.whatsapp, message);
      if (waUrl) {
        if (waTab) {
          waTab.location.replace(waUrl);
        } else {
          window.open(waUrl, "_blank");
        }
      } else if (waTab) {
        waTab.close();
      }
      setWhatsappHref(waUrl);
      setRequestId(created.id);
      setSubmitted(true);
    } catch (error) {
      if (waTab) waTab.close();
      setSubmitError(error instanceof Error ? error.message : "Request gagal dikirim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/catalog" className="text-on-surface/60">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-[16px] font-bold text-on-surface">Jasa Custom & Konsultasi</h1>
            <p className="text-[11px] text-on-surface/40">Request quote untuk kebutuhan spesifik Anda</p>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {submitted ? (
          <SuccessState
            requestId={requestId}
            whatsappHref={whatsappHref}
            onReset={() => {
              setForm(emptyCustomRequestForm);
              setWhatsappHref(null);
              setRequestId(null);
              clearImage();
              setSubmitted(false);
            }}
          />
        ) : (
          <div className={styles.grid}>
            <div className={styles.main}>
              <ServiceSelector form={form} setForm={setForm} />
              <RequestForm form={form} setForm={setForm} upload={upload} />
            </div>

            <RequestSidebar isValid={isValid} onSubmit={submit} checking={isSubmitting} itemsCount={validItems.length} hasName={Boolean(form.nama)} hasPhone={Boolean(form.telp)} hasService={Boolean(form.layanan)} hasDescription={Boolean(form.deskripsi)} hasDeadline={Boolean(form.deadline)} />
            {submitError && <p className="text-sm text-red-400 sm:col-span-2">{submitError}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
