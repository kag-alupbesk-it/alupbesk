"use client";

import { useState } from "react";
import * as s from "../style";
import BannerCard from "./BannerCard";
import BannerFormModal from "./BannerFormModal";
import type { Banner, BannerFormData } from "../../../types";
import { banners as initialBanners, promos } from "../../../data/pemasaranData";
import { generateBannerId } from "./helpers";

export default function PromosiSection() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  function handleTambah() {
    setEditBanner(null);
    setShowForm(true);
  }

  function handleEdit(banner: Banner) {
    setEditBanner(banner);
    setShowForm(true);
  }

  function handleSave(form: BannerFormData, id?: string) {
    if (id) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...form, subtitle: form.subtitle || undefined, linkUrl: form.linkUrl || undefined, startDate: form.startDate || undefined, endDate: form.endDate || undefined } : b))
      );
    } else {
      const newBanner: Banner = {
        id: generateBannerId(),
        title: form.title,
        subtitle: form.subtitle || undefined,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || undefined,
        active: form.active,
        order: form.order,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        createdAt: new Date().toISOString(),
      };
      setBanners((prev) => [...prev, newBanner].sort((a, b) => a.order - b.order));
    }
    setShowForm(false);
    setEditBanner(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus banner ini?")) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  function handleToggle(id: string) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  }

  const activeBanners = banners.filter((b) => b.active);
  const inactiveBanners = banners.filter((b) => !b.active);

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Kelola Promosi &amp; Tampilan Website</h3>
          <p className={s.subtitle}>
            Atur banner iklan, penawaran khusus, dan urutan konten yang tampil di halaman depan website publik.
          </p>
        </div>
        <button onClick={handleTambah} className={s.addButton}>
          <span className={s.icon}>add</span>
          <span>Tambah Banner</span>
        </button>
      </div>

      {activeBanners.length > 0 && (
        <>
          <h4 className="text-lg font-bold text-on-surface font-headline mb-4">Banner Aktif</h4>
          <div className={s.bannerGrid}>
            {activeBanners.map((banner) => (
              <BannerCard key={banner.id} banner={banner} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
            ))}
          </div>
        </>
      )}

      {inactiveBanners.length > 0 && (
        <>
          <h4 className="text-lg font-bold text-on-surface font-headline mb-4 mt-8">Banner Nonaktif</h4>
          <div className={s.bannerGrid}>
            {inactiveBanners.map((banner) => (
              <BannerCard key={banner.id} banner={banner} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
            ))}
          </div>
        </>
      )}

      <div className={s.promoSection}>
        <h4 className="text-lg font-bold text-on-surface font-headline mb-4">Penawaran Khusus</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promos.map((promo) => (
            <div key={promo.id} className={s.promoCard}>
              <div className={s.promoIcon}>
                <span className={`${s.icon} text-secondary text-2xl`}>local_offer</span>
              </div>
              <div className={s.promoInfo}>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className={s.promoTitle}>{promo.title}</h5>
                  <span className={`${s.promoBadge} ${promo.active ? s.promoBadgeActive : s.promoBadgeInactive}`}>
                    {promo.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className={s.promoDesc}>{promo.description}</p>
                {promo.discount && <span className={s.promoDiscount}>Diskon {promo.discount}%</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BannerFormModal isOpen={showForm} editBanner={editBanner} onClose={() => { setShowForm(false); setEditBanner(null); }} onSave={handleSave} />
    </div>
  );
}
