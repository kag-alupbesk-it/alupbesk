"use client";

import { useState } from "react";
import Link from "next/link";

import { customStyles as styles } from "../style";
import { emptyCustomRequestForm } from "@/frontend/(pelanggan)/types";

import ServiceSelector from "./ServiceSelector";
import RequestForm from "./RequestForm";
import RequestSidebar from "./RequestSidebar";
import SuccessState from "./SuccessState";

export default function CustomSection() {
  const [form, setForm] = useState(emptyCustomRequestForm);
  const [submitted, setSubmitted] = useState(false);

  const isValid = Boolean(
    form.nama &&
      form.telp &&
      form.layanan &&
      form.deskripsi
  );

  const submit = () => {
    const message =
      `Halo ALUPBESK, saya ingin request Custom Quote:%0A%0A` +
      `Nama: ${form.nama}%0A` +
      `Layanan: ${form.layanan}%0A` +
      `Deskripsi: ${form.deskripsi}%0A` +
      `Dimensi: ${form.dimensi || "-"}%0A` +
      `Kuantitas: ${form.kuantitas || "-"}`;

    window.open(
      `https://wa.me/6281234567890?text=${message}`,
      "_blank"
    );

    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link
            href="/"
            className="text-white/60"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </Link>

          <div>
            <h1 className="text-[16px] font-bold text-white">
              Jasa Custom & Konsultasi
            </h1>

            <p className="text-[11px] text-white/40">
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
              setSubmitted(false);
            }}
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
          </div>
        )}
      </main>
    </div>
  );
}
