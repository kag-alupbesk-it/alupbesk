"use client";

import type { MarketingBanner as Banner } from "@/backend/modules/marketing";
import * as s from "../style";

interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function BannerCard({ banner, onEdit, onDelete, onToggle }: BannerCardProps) {
  return (
    <div className={s.bannerCard}>
      <div className={s.bannerImageWrapper}>
        <img src={banner.imageUrl} alt={banner.title} className={s.bannerImage} />
        <div className={s.bannerOverlay} />
        <span className={`${s.bannerBadge} ${banner.active ? s.bannerBadgeActive : s.bannerBadgeInactive}`}>
          {banner.active ? "Aktif" : "Nonaktif"}
        </span>
      </div>
      <div className={s.bannerBody}>
        <h3 className={s.bannerTitle}>{banner.title}</h3>
        {banner.subtitle && <p className={s.bannerSubtitle}>{banner.subtitle}</p>}
        <div className={s.bannerMeta}>
          <span>Urutan ke-{banner.order}</span>
          {banner.startDate && <span>Mulai: {banner.startDate}</span>}
        </div>
      </div>
      <div className={s.bannerActions}>
        <button onClick={() => onEdit(banner)} className={`${s.actionButton} ${s.actionEdit}`}>
          <span className={s.icon}>edit</span>
          Edit
        </button>
        <button onClick={() => onToggle(banner.id)} className={`${s.actionButton} ${s.actionToggle}`}>
          <span className={s.icon}>{banner.active ? "visibility_off" : "visibility"}</span>
          {banner.active ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button onClick={() => onDelete(banner.id)} className={`${s.actionButton} ${s.actionDelete} ml-auto`}>
          <span className={s.icon}>delete</span>
          Hapus
        </button>
      </div>
    </div>
  );
}
