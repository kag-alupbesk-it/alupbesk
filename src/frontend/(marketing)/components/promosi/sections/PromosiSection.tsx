"use client";

import { useCallback, useState } from "react";
import * as s from "../style";
import BannerCard from "./BannerCard";
import BannerFormModal from "./BannerFormModal";
import type { MarketingBanner, MarketingBannerInput } from "@/backend/modules/marketing";
import type { BannerFormData } from "../../../types";
import { marketingApi } from "@/services/api";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export default function PromosiSection() {
  const loadBanners = useCallback(() => marketingApi.getBanners(), []);
  const { data: banners, loading, error: loadError, refresh } = usePollingResource<MarketingBanner[]>(loadBanners, []);
  const [actionError, setActionError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<MarketingBanner | null>(null);

  function toInput(banner: MarketingBanner): MarketingBannerInput {
    return {
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      active: banner.active,
      order: banner.order,
      startDate: banner.startDate,
      endDate: banner.endDate,
    };
  }

  async function handleSave(form: BannerFormData, id?: string) {
    const input: MarketingBannerInput = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl || undefined,
      active: form.active,
      order: form.order,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (id) {
        await marketingApi.updateBanner(id, input);
      } else {
        await marketingApi.createBanner(input);
      }
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Banner gagal disimpan.");
    }
    setShowForm(false);
    setEditBanner(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await marketingApi.deleteBanner(id);
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Banner gagal dihapus.");
    }
  }

  async function handleToggle(id: string) {
    const banner = banners.find((b) => b.id === id);
    if (!banner) return;
    try {
      await marketingApi.updateBanner(id, { ...toInput(banner), active: !banner.active });
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Banner gagal diubah.");
    }
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
        <button onClick={() => { setEditBanner(null); setShowForm(true); }} className={s.addButton}>
          <span className={s.icon}>add</span>
          <span>Tambah Banner</span>
        </button>
      </div>

      {(actionError || loadError) && <p className="mb-4 text-sm text-red-400">{actionError || loadError}</p>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-10 text-center">
          Belum ada banner. Klik &quot;Tambah Banner&quot; untuk membuat promosi pertama.
        </p>
      ) : (
        <>
          {activeBanners.length > 0 && (
            <>
              <h4 className="text-lg font-bold text-on-surface font-headline mb-4">Banner Aktif</h4>
              <div className={s.bannerGrid}>
                {activeBanners.map((banner) => (
                  <BannerCard key={banner.id} banner={banner} onEdit={(b) => { setEditBanner(b); setShowForm(true); }} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </div>
            </>
          )}

          {inactiveBanners.length > 0 && (
            <>
              <h4 className="text-lg font-bold text-on-surface font-headline mb-4 mt-8">Banner Nonaktif</h4>
              <div className={s.bannerGrid}>
                {inactiveBanners.map((banner) => (
                  <BannerCard key={banner.id} banner={banner} onEdit={(b) => { setEditBanner(b); setShowForm(true); }} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {showForm && <BannerFormModal isOpen={showForm} editBanner={editBanner} onClose={() => { setShowForm(false); setEditBanner(null); }} onSave={handleSave} />}
    </div>
  );
}
