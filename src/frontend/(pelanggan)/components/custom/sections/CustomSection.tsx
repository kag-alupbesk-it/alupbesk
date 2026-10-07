"use client";

import { useState } from "react";
import Link from "next/link";

import { customStyles as styles } from "../style";
import { emptyCustomRequestForm } from "@/frontend/(pelanggan)/types";

import ServiceSelector from "./ServiceSelector";
import RequestForm from "./RequestForm";
import RequestSidebar from "./RequestSidebar";
import SuccessState from "./SuccessState";
import { customApi } from "@/services/api";
import { contactDefaults } from "@/frontend/(pelanggan)/data/siteContentDefaults";
import { usePublicSiteContent } from "@/frontend/(pelanggan)/hooks/usePublicSiteContent";
import { getWhatsAppUrl } from "@/frontend/(pelanggan)/utils/getWhatsAppUrl";

export default function CustomSection() {
  const [form, setForm] = useState(emptyCustomRequestForm);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);
  const { data: contact } = usePublicSiteContent("contact", contactDefaults);

  const isValid = Boolean(
    form.nama &&
      form.telp &&
      form.layanan &&
      form.deskripsi
  );

  const submit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await customApi.createRequest(form);
      const message = [
        "Halo ALUPBESK, saya ingin request Custom Quote:",
        `Nama: ${form.nama}`,
        `Layanan: ${form.layanan}`,
        `Deskripsi: ${form.deskripsi}`,
        `Dimensi: ${form.dimensi || "-"}`,
        `Kuantitas: ${form.kuantitas || "-"}`,
      ].join("\n");
      setWhatsappHref(getWhatsAppUrl(contact.whatsapp, message));
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Request gagal dikirim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link
            href="/catalog"
            className="text-on-surface/60"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </Link>

          <div>
            <h1 className="text-[16px] font-bold text-on-surface">
              Jasa Custom & Konsultasi
            </h1>

            <p className="text-[11px] text-on-surface/40">
              Request quote untuk kebutuhan spesifik Anda
            </p>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {submitted ? (
          <SuccessState
            onReset={() => {
              setForm(emptyCustomRequestForm);
              setWhatsappHref(null);
              setSubmitted(false);
            }}
            whatsappHref={whatsappHref}
          />
        ) : (
          <div className={styles.grid}>
            <div className={styles.main}>
              <ServiceSelector
                form={form}
                setForm={setForm}
              />

              <RequestForm
                form={form}
                setForm={setForm}
              />
            </div>

            <RequestSidebar
              isValid={isValid}
              onSubmit={submit}
            />
            {submitError && <p className="text-sm text-red-400 sm:col-span-2">{submitError}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
