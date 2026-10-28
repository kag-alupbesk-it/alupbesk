"use client";

import { useCallback, useState } from "react";
import * as s from "../../style/style";
import PortfolioItemFormModal from "../PortfolioItemFormModal/PortfolioItemFormModal";
import CaseStudyFormModal from "../CaseStudyFormModal/CaseStudyFormModal";
import { contentApi } from "@/services/api/index";
import type { PortfolioItem, CaseStudy } from "@/services/portfolio/index";
import type { PortfolioItemFormData, CaseStudyFormData } from "../types/types";
import { formToPortfolioItemInput, formToCaseStudyInput } from "../types/types";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export default function PortfolioTab() {
  const loadPortfolio = useCallback(() => contentApi.getPortfolio(), []);
  const {
    data: portfolio,
    loading,
    error: loadError,
    refresh,
  } = usePollingResource(loadPortfolio, { items: [], caseStudies: [] });
  const items = portfolio.items;
  const studies = portfolio.caseStudies;
  const [actionError, setActionError] = useState("");
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [showStudyForm, setShowStudyForm] = useState(false);
  const [editStudy, setEditStudy] = useState<CaseStudy | null>(null);

  async function handleSaveItem(form: PortfolioItemFormData, id?: number) {
    try {
      if (id) await contentApi.updatePortfolioItem(id, formToPortfolioItemInput(form));
      else await contentApi.createPortfolioItem(formToPortfolioItemInput(form));
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Item portofolio gagal disimpan.");
    }
    setShowItemForm(false);
    setEditItem(null);
  }

  async function handleDeleteItem(id: number) {
    if (!confirm("Hapus item portofolio ini?")) return;
    try {
      await contentApi.deletePortfolioItem(id);
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Item portofolio gagal dihapus.");
    }
  }

  async function handleSaveStudy(form: CaseStudyFormData, id?: number) {
    try {
      if (id) await contentApi.updateCaseStudy(id, formToCaseStudyInput(form));
      else await contentApi.createCaseStudy(formToCaseStudyInput(form));
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Studi kasus gagal disimpan.");
    }
    setShowStudyForm(false);
    setEditStudy(null);
  }

  async function handleDeleteStudy(id: number) {
    if (!confirm("Hapus studi kasus ini?")) return;
    try {
      await contentApi.deleteCaseStudy(id);
      refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Studi kasus gagal dihapus.");
    }
  }

  if (loading) {
    return <div className={s.container}><div className="h-64 bg-white/5 rounded animate-pulse" /></div>;
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div>
          <h3 className={s.title}>Kelola Portofolio</h3>
          <p className={s.subtitle}>Atur item proyek dan studi kasus untuk bagian portofolio website.</p>
        </div>
      </div>

      {(actionError || loadError) && <p className="mb-4 text-sm text-red-400">{actionError || loadError}</p>}

      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-on-surface font-headline">Item Portofolio</h4>
        <button onClick={() => { setEditItem(null); setShowItemForm(true); }} className={s.addButton}>
          <span className={s.icon}>add</span><span>Tambah Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-8 text-center">Belum ada item portofolio.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {items.map((item) => (
            <div key={item.id} className={s.card}>
              <div className={s.cardHeader}>
                <div>
                  <h4 className={s.cardTitle}>{item.title}</h4>
                  <p className={s.cardDesc}>{item.client} &middot; {item.industry}{item.year ? ` (${item.year})` : ""}</p>
                </div>
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.map((t) => <span key={t} className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-pill">{t}</span>)}
                </div>
              )}
              <div className={s.actions}>
                <button onClick={() => { setEditItem(item); setShowItemForm(true); }} className={`${s.actionButton} ${s.actionEdit}`}><span className={s.icon}>edit</span> Edit</button>
                <button onClick={() => handleDeleteItem(item.id)} className={`${s.actionButton} ${s.actionDelete} ml-auto`}><span className={s.icon}>delete</span> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-on-surface font-headline">Studi Kasus</h4>
        <button onClick={() => { setEditStudy(null); setShowStudyForm(true); }} className={s.addButton}>
          <span className={s.icon}>add</span><span>Tambah Studi Kasus</span>
        </button>
      </div>

      {studies.length === 0 ? (
        <p className="text-sm text-on-surface-variant py-8 text-center">Belum ada studi kasus.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {studies.map((study) => (
            <div key={study.id} className={s.card}>
              <div className={s.cardHeader}>
                <div className="flex items-center gap-3">
                  <span className="size-10 rounded-full bg-secondary/15 text-secondary grid place-items-center text-xs font-black">{study.logo || study.client.slice(0, 2).toUpperCase()}</span>
                  <h4 className={s.cardTitle}>{study.title}</h4>
                </div>
              </div>
              <p className={s.cardDesc}>{study.client} &middot; {study.industry}{study.year ? ` (${study.year})` : ""}</p>
              {study.metrics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {study.metrics.map((m, i) => <span key={i} className="text-[10px] text-on-surface-variant px-2 py-0.5 bg-surface-variant rounded-pill">{m.value}</span>)}
                </div>
              )}
              <div className={s.actions}>
                <button onClick={() => { setEditStudy(study); setShowStudyForm(true); }} className={`${s.actionButton} ${s.actionEdit}`}><span className={s.icon}>edit</span> Edit</button>
                <button onClick={() => handleDeleteStudy(study.id)} className={`${s.actionButton} ${s.actionDelete} ml-auto`}><span className={s.icon}>delete</span> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showItemForm && <PortfolioItemFormModal isOpen={showItemForm} editItem={editItem} onClose={() => { setShowItemForm(false); setEditItem(null); }} onSave={handleSaveItem} />}
      {showStudyForm && <CaseStudyFormModal isOpen={showStudyForm} editItem={editStudy} onClose={() => { setShowStudyForm(false); setEditStudy(null); }} onSave={handleSaveStudy} />}
    </div>
  );
}
