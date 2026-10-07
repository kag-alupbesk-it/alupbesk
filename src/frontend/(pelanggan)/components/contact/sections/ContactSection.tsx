"use client";

import { useState, type FormEvent } from "react";
import ContactDetail from "../../shared/ContactDetail";
import FormField from "../../shared/FormField";
import { contactDefaults } from "@/frontend/(pelanggan)/data/siteContentDefaults";
import { usePublicSiteContent } from "@/frontend/(pelanggan)/hooks/usePublicSiteContent";
import { contactApi } from "@/services/api";
import { useLanguage } from "@/frontend/shared/i18n/LanguageProvider";

const emptyForm = { name: "", email: "", category: "", message: "" };

export default function ContactSection() {
  const { t } = useLanguage();
  const { data: contact } = usePublicSiteContent("contact", contactDefaults);
  const [form, setForm] = useState(emptyForm);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setNotice("");
    setError("");
    try {
      await contactApi.createMessage(form);
      setForm(emptyForm);
      setNotice(t("messageSent"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("sendFailed"));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="bg-primary-container py-section-gap-desktop" id="kontak">
      <div className="max-w-container-max mx-auto px-margin-x-mobile md:px-margin-x-desktop">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-outline/20 shadow-2xl lg:flex-row">
          <div className="flex flex-col justify-between bg-primary p-12 text-on-primary lg:w-2/5">
            <div>
              <h2 className="text-headline-h1 font-headline-h1 mb-6">
                {contact.title === contactDefaults.title ? t("contactTitle") : contact.title}
              </h2>
              <p className="text-on-primary/70 mb-12">
                {contact.subtitle === contactDefaults.subtitle ? t("contactSubtitle") : contact.subtitle}
              </p>
              <div className="space-y-8">
                <ContactDetail
                  icon="location_on"
                  title={t("headquarters")}
                  text={contact.address}
                />
                <ContactDetail
                  icon="mail"
                  title={t("companyEmail")}
                  text={contact.email}
                />
                <ContactDetail
                  icon="phone"
                  title={t("phoneWhatsapp")}
                  text={contact.phone}
                />
              </div>
            </div>
            <div className="mt-12 flex gap-4">
              {contact.instagram && <a
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-on-primary/10 transition-all hover:bg-secondary"
                href={contact.instagram}
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined">photo_camera</span>
              </a>}
              {contact.linkedin && <a
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-on-primary/10 transition-all hover:bg-secondary"
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined">
                  business_center
                </span>
              </a>}
            </div>
          </div>
          <div className="bg-surface-container-high backdrop-blur-sm p-12 lg:w-3/5">
            <form className="space-y-6" onSubmit={submitMessage}>
              {notice && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">{notice}</p>}
              {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  label={t("fullName")}
                  placeholder="John Doe"
                  type="text"
                  value={form.name}
                  onChange={(name) => setForm((current) => ({ ...current, name }))}
                  required
                  maxLength={120}
                />
                <FormField
                  label={t("companyEmail")}
                  placeholder="john@perusahaan.com"
                  type="email"
                  value={form.email}
                  onChange={(email) => setForm((current) => ({ ...current, email }))}
                  maxLength={254}
                />
              </div>
              <label className="block space-y-2">
                <span className="text-label-sm font-bold text-on-surface">
                  {t("productCategory")}
                </span>
                <select
                  required
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-xl border border-outline/30 bg-surface-container p-4 text-on-surface focus:border-secondary focus:outline-none"
                >
                  <option value="" className="bg-surface-container text-on-surface">{t("chooseCategory")}</option>
                  <option value="Profil Ekstrusi" className="bg-surface-container text-on-surface">{t("extrusionProfile")}</option>
                  <option value="Linear Motion" className="bg-surface-container text-on-surface">Linear Motion</option>
                  <option value="Aksesoris Framing" className="bg-surface-container text-on-surface">{t("framingAccessories")}</option>
                  <option value="Lainnya" className="bg-surface-container text-on-surface">{t("otherCategory")}</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-label-sm font-bold text-on-surface">
                  {t("message")}
                </span>
                <textarea
                  className="w-full rounded-xl border border-outline/30 bg-surface-container p-4 text-on-surface placeholder:text-on-surface/40 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                  placeholder={t("messagePlaceholder")}
                  rows={4}
                  required
                  maxLength={5000}
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                />
              </label>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-4 font-bold text-primary transition-all hover:bg-secondary-800"
                type="submit"
                disabled={pending}
              >
                {pending ? t("sending") : t("sendMessage")}{" "}
                <span className="material-symbols-outlined">send</span>
              </button>
              <p className="text-center text-[12px] text-on-surface/50">
                {t("privacyConsent")}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
