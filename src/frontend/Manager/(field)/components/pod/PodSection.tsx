"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fieldStore } from "../store";
import type { FieldDelivery } from "../types";
import * as s from "./style";
import { PodPhotoPreview } from "./PodPhotoPreview";

export function PodSection() {
  const [deliveries, setDeliveries] = useState<FieldDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signatureImagePath, setSignatureImagePath] = useState("");
  const [projectImagePath, setProjectImagePath] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fieldStore.getDeliveries();
      setDeliveries(data);
      setNotice(null);
    } catch {
      setDeliveries([]);
      setNotice("Gagal memuat data bukti terima.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fieldStore
      .getDeliveries()
      .then(setDeliveries)
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const seleksi = useMemo(() => {
    const list = deliveries.filter((d) => d.status !== "selesai-kirim");
    return list.length > 0 ? list : deliveries;
  }, [deliveries]);

  const selected = useMemo(
    () => deliveries.find((d) => d.id === selectedId) ?? seleksi[0] ?? null,
    [deliveries, selectedId, seleksi],
  );

  const isSelesai = selected?.status === "selesai-kirim";

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const delivery = deliveries.find((d) => d.id === id);
    setSignatureImagePath(delivery?.signatureImagePath ?? "");
    setProjectImagePath(delivery?.projectImagePath ?? "");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setError(null);
    if (!signatureImagePath) {
      setError("Unggah foto tanda tangan penerima pada surat jalan terlebih dahulu.");
      return;
    }
    if (!projectImagePath) {
      setError("Unggah foto bukti proyek yang sudah sampai terlebih dahulu.");
      return;
    }
    setPending(true);
    try {
      await fieldStore.submitPod(selected.id, { signatureImagePath, projectImagePath });
      await load();
      setNotice("Bukti terima tersimpan — status pengiriman diperbarui dan siap dicetak.");
      setPending(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan bukti terima.");
      setPending(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>Bukti Terima</h1>
              <span className={s.badge}>Bukti Terima</span>
            </div>
            <p className={s.headerSubtitle}>
              Wajib unggah 2 foto: tanda tangan penerima pada surat jalan dan bukti proyek yang sudah sampai.
            </p>
          </div>
        </div>

        {notice && <div className={s.notice}>{notice}</div>}

        {loading ? (
          <div className={`${s.panel} ${s.emptyCell}`}>Memuat...</div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {seleksi.map((delivery) => (
                <button
                  key={delivery.id}
                  className={`${s.selectCard} ${selected?.id === delivery.id ? s.selectCardActive : ""}`}
                  onClick={() => handleSelect(delivery.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className={s.selectSJ}>{delivery.id}</span>
                    {delivery.status === "selesai-kirim" && <span className={s.badgeDone}>Bukti terima lengkap</span>}
                  </div>
                  <div className={s.selectKontraktor}>{delivery.kodeProduksi}</div>
                  <div className={s.selectSub}>{delivery.namaKontraktor}</div>
                  <div className={s.selectSub}>{delivery.alamatProyek}</div>
                </button>
              ))}
            </div>

            {selected ? (
              <div className={s.grid}>
                <div className={`${s.panel} ${s.panelBody}`}>
                  <div className={s.panelTitle}>
                    <span className={s.panelIcon}>draw</span> Foto Tanda Tangan Penerima
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1 mb-1">
                    Unggah foto surat jalan yang sudah ditandatangani penerima/kontraktor.
                  </p>
                  <PodPhotoPreview
                    targetPath={`/media/pod/${selected.id}-tanda-tangan.jpg`}
                    currentPath={selected.signatureImagePath}
                    onPathChange={setSignatureImagePath}
                    emptyText="Belum ada foto tanda tangan penerima."
                    uploadLabel="Unggah Foto Tanda Tangan"
                  />

                  <div className="mt-8">
                    <div className={s.panelTitle}>
                      <span className={s.panelIcon}>photo_camera</span> Foto Bukti Proyek Sampai
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1 mb-1">
                      Unggah foto barang/proyek yang sudah sampai di lokasi proyek.
                    </p>
                    <PodPhotoPreview
                      targetPath={`/media/pod/${selected.id}-bukti-proyek.jpg`}
                      currentPath={selected.projectImagePath}
                      onPathChange={setProjectImagePath}
                      emptyText="Belum ada foto bukti proyek."
                      uploadLabel="Unggah Foto Bukti Proyek"
                    />
                  </div>
                </div>

                <div className={`${s.panel} ${s.panelBody}`}>
                  <div className={`${s.panelTitle}`}>
                    <span className={s.panelIcon}>receipt_long</span> Ringkasan Pengiriman
                  </div>

                  <div className="mt-4 rounded-xl border border-outline/20 bg-surface-variant/40 px-4 py-3">
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Surat Jalan</span>
                      <span className={s.infoValue}>{selected.id}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Kontraktor</span>
                      <span className={s.infoValue}>{selected.namaKontraktor}</span>
                    </div>
                    <div className={s.infoRow}>
                      <span className={s.infoLabel}>Kode Produksi</span>
                      <span className={s.infoValue}>{selected.kodeProduksi}</span>
                    </div>
                    {selected.armada && (
                      <div className={s.infoRow}>
                        <span className={s.infoLabel}>Kendaraan</span>
                        <span className={s.infoValue}>
                          {selected.armada.namaSopir} · {selected.armada.platNomor}
                        </span>
                      </div>
                    )}
                    {selected.items.map((item) => (
                      <div key={item.id} className={s.itemCard}>
                        <div className={s.itemTitle}>{item.namaBarang}</div>
                        <div className={s.itemQty}>
                          {item.kuantitasTerkirim}/{item.kuantitas} {item.satuan}
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && <p className="mt-4 text-xs text-error">{error}</p>}

                  {isSelesai ? (
                    <div className={`${s.doneBox} mt-5`}>
                      <div className={s.doneLabel}>
                        <span className="material-symbols-outlined text-[16px]">verified</span> Bukti Terima Lengkap
                      </div>
                      <p className={s.doneText}>
                        Kedua foto bukti sudah tersimpan. Cetak surat jalan untuk arsip maupun serah terima
                        kontraktor.
                      </p>
                    </div>
                  ) : (
                    <div className={s.actionsWrapper}>
                      <Link
                        href={`/field/surat-jalan/${selected.id}/print`}
                        className={s.secondaryButton}
                        style={{ textAlign: "center" }}
                      >
                        <span className="material-symbols-outlined text-[15px] align-middle mr-1">print</span>
                        Cetak
                      </Link>
                      <button className={s.primaryButton} onClick={handleSubmit} disabled={pending}>
                        <span className="material-symbols-outlined text-[16px]">
                          {pending ? "progress_activity" : "save"}
                        </span>
                        {pending ? "Menyimpan..." : "Simpan Bukti Terima"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`${s.panel} ${s.emptyCell}`}>Tidak ada data pengiriman untuk dilengkapi bukti terimanya.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
