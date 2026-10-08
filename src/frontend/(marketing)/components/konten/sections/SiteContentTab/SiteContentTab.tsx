"use client";

import { useEffect, useState } from "react";
import * as s from "../../style/style";
import { contentApi } from "@/services/api";
import FileUploadInput from "../../../shared/FileUploadInput/FileUploadInput";

type HeroValue = { title: string; subtitle: string; imageUrl: string; primaryCta: string; primaryLink: string };
type ProfileValue = { title: string; description1: string; description2: string; visionTitle: string; visionText: string; missionTitle: string; missionText: string; imageUrl: string; quote: string; quoteAuthor: string };
type ContactValue = { title: string; subtitle: string; address: string; email: string; phone: string; whatsapp: string; instagram: string; linkedin: string };
type StepsValue = { steps: string[] };
type CapacitiesValue = { capacities: { label: string; value: string }[] };

const emptyHero: HeroValue = { title: "", subtitle: "", imageUrl: "", primaryCta: "", primaryLink: "" };
const emptyProfile: ProfileValue = { title: "", description1: "", description2: "", visionTitle: "", visionText: "", missionTitle: "", missionText: "", imageUrl: "", quote: "", quoteAuthor: "" };
const emptyContact: ContactValue = { title: "", subtitle: "", address: "", email: "", phone: "", whatsapp: "", instagram: "", linkedin: "" };
const emptySteps: StepsValue = { steps: [] };
const emptyCapacities: CapacitiesValue = { capacities: [] };

async function loadValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await contentApi.getSiteContent(key);
    return (res.value as unknown as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function SiteContentTab() {
  const [hero, setHero] = useState<HeroValue>(emptyHero);
  const [profile, setProfile] = useState<ProfileValue>(emptyProfile);
  const [contact, setContact] = useState<ContactValue>(emptyContact);
  const [stepsText, setStepsText] = useState("");
  const [capacitiesText, setCapacitiesText] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const [h, p, c, stepVal, capVal] = await Promise.all([
        loadValue<HeroValue>("hero", emptyHero),
        loadValue<ProfileValue>("profile", emptyProfile),
        loadValue<ContactValue>("contact", emptyContact),
        loadValue<StepsValue>("custom_steps", emptySteps),
        loadValue<CapacitiesValue>("custom_capacities", emptyCapacities),
      ]);
      if (!active) return;
      setHero({ ...emptyHero, ...h });
      setProfile({ ...emptyProfile, ...p });
      setContact({ ...emptyContact, ...c });
      setStepsText(stepVal.steps.join("\n"));
      setCapacitiesText(capVal.capacities.map((c) => `${c.label}: ${c.value}`).join("\n"));
    })()
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "Konten gagal dimuat."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function save(key: string, value: Record<string, unknown>) {
    setSavingKey(key);
    setError("");
    setNotice("");
    try {
      await contentApi.saveSiteContent(key, value);
      setNotice(`Konten "${key}" berhasil disimpan.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Konten gagal disimpan.");
    } finally {
      setSavingKey("");
    }
  }

  if (loading) {
    return <div className={s.container}><div className="h-64 bg-white/5 rounded animate-pulse" /></div>;
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Konten Statis Website</h3>
          <p className={s.subtitle}>Kelola teks dan gambar untuk bagian Hero, Profil, Kontak, serta Alur &amp; Kapasitas pada halaman Jasa Custom.</p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {notice && <p className="mb-4 text-sm text-emerald-400">{notice}</p>}

      <div className="space-y-8">
        <section className={s.card}>
          <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">Hero (Beranda)</h4>
          <p className={s.cardDesc}>Isi judul, subjudul, gambar latar, dan tombol utama di bagian atas halaman depan.</p>
          <div className="space-y-4 mt-4">
            <div className={s.field}><label className={s.label}>Judul *</label><input className={s.input} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></div>
            <div className={s.field}><label className={s.label}>Subjudul</label><textarea className={s.textarea} rows={2} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></div>
            <div className={s.field}><label className={s.label}>Gambar Latar</label><FileUploadInput value={hero.imageUrl} onChange={(imageUrl) => setHero({ ...hero, imageUrl })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className={s.field}><label className={s.label}>Teks Tombol Utama</label><input className={s.input} value={hero.primaryCta} onChange={(e) => setHero({ ...hero, primaryCta: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Tautan Tombol Utama</label><input className={s.input} value={hero.primaryLink} onChange={(e) => setHero({ ...hero, primaryLink: e.target.value })} /></div>
            </div>
          </div>
          <button onClick={() => save("hero", hero)} disabled={savingKey === "hero" || !hero.title.trim()} className={`${s.saveButton} mt-5`}>{savingKey === "hero" ? "Menyimpan..." : "Simpan Hero"}</button>
        </section>

        <section className={s.card}>
          <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">Profil (Tentang Kami)</h4>
          <p className={s.cardDesc}>Isi konten bagian Tentang Kami, termasuk visi, misi, gambar, dan kutipan.</p>
          <div className="space-y-4 mt-4">
            <div className={s.field}><label className={s.label}>Judul *</label><input className={s.input} value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} /></div>
            <div className={s.field}><label className={s.label}>Paragraf 1</label><textarea className={s.textarea} rows={2} value={profile.description1} onChange={(e) => setProfile({ ...profile, description1: e.target.value })} /></div>
            <div className={s.field}><label className={s.label}>Paragraf 2</label><textarea className={s.textarea} rows={2} value={profile.description2} onChange={(e) => setProfile({ ...profile, description2: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className={s.field}><label className={s.label}>Judul Visi</label><input className={s.input} value={profile.visionTitle} onChange={(e) => setProfile({ ...profile, visionTitle: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Isi Visi</label><textarea className={s.textarea} rows={2} value={profile.visionText} onChange={(e) => setProfile({ ...profile, visionText: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Judul Misi</label><input className={s.input} value={profile.missionTitle} onChange={(e) => setProfile({ ...profile, missionTitle: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Isi Misi</label><textarea className={s.textarea} rows={2} value={profile.missionText} onChange={(e) => setProfile({ ...profile, missionText: e.target.value })} /></div>
            </div>
            <div className={s.field}><label className={s.label}>Gambar</label><FileUploadInput value={profile.imageUrl} onChange={(imageUrl) => setProfile({ ...profile, imageUrl })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className={s.field}><label className={s.label}>Kutipan</label><textarea className={s.textarea} rows={2} value={profile.quote} onChange={(e) => setProfile({ ...profile, quote: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Penulis Kutipan</label><input className={s.input} value={profile.quoteAuthor} onChange={(e) => setProfile({ ...profile, quoteAuthor: e.target.value })} /></div>
            </div>
          </div>
          <button onClick={() => save("profile", profile)} disabled={savingKey === "profile" || !profile.title.trim()} className={`${s.saveButton} mt-5`}>{savingKey === "profile" ? "Menyimpan..." : "Simpan Profil"}</button>
        </section>

        <section className={s.card}>
          <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">Kontak</h4>
          <p className={s.cardDesc}>Isi informasi kontak yang tampil di bagian Kontak website.</p>
          <div className="space-y-4 mt-4">
            <div className={s.field}><label className={s.label}>Judul *</label><input className={s.input} value={contact.title} onChange={(e) => setContact({ ...contact, title: e.target.value })} /></div>
            <div className={s.field}><label className={s.label}>Subjudul</label><textarea className={s.textarea} rows={2} value={contact.subtitle} onChange={(e) => setContact({ ...contact, subtitle: e.target.value })} /></div>
            <div className={s.field}><label className={s.label}>Alamat</label><textarea className={s.textarea} rows={2} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className={s.field}><label className={s.label}>Email</label><input className={s.input} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Telepon / WA</label><input className={s.input} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Nomor WhatsApp (format internasional)</label><input className={s.input} value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>Instagram (URL)</label><input className={s.input} value={contact.instagram} onChange={(e) => setContact({ ...contact, instagram: e.target.value })} /></div>
              <div className={s.field}><label className={s.label}>LinkedIn (URL)</label><input className={s.input} value={contact.linkedin} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })} /></div>
            </div>
          </div>
          <button onClick={() => save("contact", contact)} disabled={savingKey === "contact" || !contact.title.trim()} className={`${s.saveButton} mt-5`}>{savingKey === "contact" ? "Menyimpan..." : "Simpan Kontak"}</button>
        </section>

        <section className={s.card}>
          <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">Alur Request Custom</h4>
          <p className={s.cardDesc}>Satu langkah per baris. Tampil pada sidebar halaman Jasa Custom.</p>
          <div className={s.field}><label className={s.label}>Langkah (satu per baris)</label><textarea className={s.textarea} rows={6} value={stepsText} onChange={(e) => setStepsText(e.target.value)} /></div>
          <button onClick={() => save("custom_steps", { steps: stepsText.split("\n").map((x) => x.trim()).filter(Boolean) })} disabled={savingKey === "custom_steps"} className={`${s.saveButton} mt-5`}>{savingKey === "custom_steps" ? "Menyimpan..." : "Simpan Alur"}</button>
        </section>

        <section className={s.card}>
          <h4 className="text-lg font-bold text-on-surface mb-1 font-headline">Kapasitas Produksi</h4>
          <p className={s.cardDesc}>Format &quot;Label: Nilai&quot; per baris. Tampil pada sidebar halaman Jasa Custom.</p>
          <div className={s.field}><label className={s.label}>Kapasitas (Label: Nilai, satu per baris)</label><textarea className={s.textarea} rows={5} value={capacitiesText} onChange={(e) => setCapacitiesText(e.target.value)} /></div>
          <button onClick={() => save("custom_capacities", { capacities: capacitiesText.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { const i = line.indexOf(":"); return i === -1 ? { label: line, value: "" } : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() }; }) })} disabled={savingKey === "custom_capacities"} className={`${s.saveButton} mt-5`}>{savingKey === "custom_capacities" ? "Menyimpan..." : "Simpan Kapasitas"}</button>
        </section>
      </div>
    </div>
  );
}
