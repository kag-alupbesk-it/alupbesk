"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fieldStore } from "../store";
import type { FieldDelivery, FieldGeotag } from "../types";
import * as s from "./style";
import { SignatureCanvas } from "./SignatureCanvas";
import { GeotagPanel } from "./GeotagPanel";
import { PodPhotoPreview } from "./PodPhotoPreview";

export function PodSection() {
  const [deliveries, setDeliveries] = useState<FieldDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geo, setGeo] = useState<FieldGeotag | null>(null);
  const [signature, setSignature] = useState("");
  const [podPath, setPodPath] = useState("");
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
      setNotice("Gagal memuat data POD.");
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
    setGeo(delivery?.geotag ?? null);
    setSignature(delivery?.signatureDataUrl ?? "");
    setPodPath(delivery?.podPath ?? "");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setError(null);
    if (!geo) {
      setError("Ambil lokasi pengiriman terlebih dahulu.");
      return;
    }
    if (!signature) {
      setError("Tanda tangan penerima belum ditulis.");
      return;
    }
    if (!podPath) {
      setError("Unggah foto bukti kirim terlebih dahulu.");
      return;
    }
    setPending(true);
    try {
      await fieldStore.submitPod(selected.id, { geotag: geo, signatureDataUrl: signature, podPath });
      await load();
      setNotice("POD tersimpan — status pengiriman diperbarui dan siap dicetak.");
      setPending(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan POD.");
      setPending(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <div className={s.header}>
          <div>
            <div className={s.headerLeft}>
              <h1 className={s.headerTitle}>POD, Geotagging & E-Signature</h1>
              <span className={s.badge}>Proof of Delivery</span>
            </div>
            <p className={s.headerSubtitle}>
              Lengkapi bukti terima barang: foto POD, titik lokasi, dan tanda tangan digital penerima.
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
                    {delivery.status === "selesai-kirim" && <span className={s.badgeDone}>POD lengkap</span>}
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
                    <span className={s.panelIcon}>document_scanner</span> E-Signature Penerima
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Tanda tangan diterapkan pada kolom TTD Penerima saat surat jalan dicetak.
                  </p>
                  <SignatureCanvas value={signature} onChange={setSignature} />

                  <div className="mt-6">
                    <div className={s.panelTitle}>
                      <span className={s.panelIcon}>my_location</span> Geotagging
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1 mb-2">
                      Titik lokasi & waktu diambil dari Browser Geolocation API.
                    </p>
                    <GeotagPanel value={geo} onChange={setGeo} />
                  </div>
                </div>

                <div className={`${s.panel} ${s.panelBody}`}>
                  <div className={s.panelTitle}>
                    <span className={s.panelIcon}>photo_camera</span> Upload Foto POD
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1 mb-1">
                    Pratinjau foto bukti kirim — tersimpan pada URL internal{" "}
                    <code className="text-secondary">/media/pod/SJ-[ID].jpg</code>.
                  </p>
                  <PodPhotoPreview
                    deliveryId={selected.id}
                    currentPath={selected.podPath}
                    onPathChange={setPodPath}
                  />

                  <div className="mt-8 rounded-xl border border-outline/20 bg-surface-variant/40 px-4 py-3">
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
                        <span className={s.infoLabel}>Armada</span>
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
                        <span className="material-symbols-outlined text-[16px]">verified</span> POD Lengkap
                      </div>
                      <p className={s.doneText}>
                        Geotag, tanda tangan, dan foto bukti sudah tersimpan. Cetak surat jalan untuk arsip
                        maupun serah terima kontraktor.
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
                        {pending ? "Menyimpan..." : "Simpan POD"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`${s.panel} ${s.emptyCell}`}>Tidak ada data pengiriman untuk di-POD-kan.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}