"use client";

import { useEffect, useState } from "react";
import { gudangApi } from "@/services/api/gudang";
import { customApi } from "@/services/api/custom";
import type { GudangItem } from "@/backend/modules/gudang";
import type { CustomRequest } from "../types/types";
import * as s from "../style/style";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function ProjectOrderFormModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [proyekItems, setProyekItems] = useState<GudangItem[]>([]);
  const [requestId, setRequestId] = useState("");
  const [namaProyek, setNamaProyek] = useState("");
  const [pelanggan, setPelanggan] = useState("");
  const [telepon, setTelepon] = useState("");
  const [catatan, setCatatan] = useState("");
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customApi
      .getRequests()
      .then(setRequests)
      .catch(() => setRequests([]));
    gudangApi
      .getItems()
      .then((items) => setProyekItems(items.filter((item) => item.kategoriBarang === "proyek")))
      .catch(() => setProyekItems([]));
  }, []);

  const convertable = requests.filter(
    (request) => request.status !== "accepted" && request.status !== "rejected",
  );

  const selectRequest = (id: string) => {
    setRequestId(id);
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    setPelanggan(request.nama);
    setTelepon(request.telp);
    if (!namaProyek) setNamaProyek(request.perusahaan?.trim() || request.nama);
    const summary = [request.layanan, request.deskripsi, request.dimensi, request.kuantitas ? `Kuantitas: ${request.kuantitas}` : ""]
      .filter(Boolean)
      .join(" · ");
    if (summary) setCatatan(summary);
  };

  const setQty = (id: string, raw: string) => {
    const parsed = Math.max(0, Math.floor(Number(raw) || 0));
    setQtys((prev) => ({ ...prev, [id]: parsed }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!namaProyek.trim()) return setError("Nama proyek wajib diisi.");
    if (!pelanggan.trim()) return setError("Nama pelanggan wajib diisi.");

    const items = proyekItems
      .filter((item) => (qtys[item.id] ?? 0) > 0)
      .map((item) => ({ gudangItemId: item.id, quantity: qtys[item.id] }));
    if (items.length === 0) return setError("Pilih minimal satu barang proyek beserta jumlahnya.");

    setLoading(true);
    try {
      await gudangApi.createProjectOrder({
        requestId: requestId || undefined,
        namaProyek: namaProyek.trim(),
        pelanggan: pelanggan.trim(),
        telepon: telepon.trim() || undefined,
        catatan: catatan.trim() || undefined,
        items,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pesanan proyek.");
      setLoading(false);
    }
  };

  return (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <div className={s.modalTitle}>Buat Pesanan Proyek</div>
            <div className={s.modalSubtitle}>Konversi permintaan custom menjadi pesanan proyek.</div>
          </div>
          <button className={s.modalCloseButton} onClick={onClose}>
            <span className={s.closeIcon}>close</span>
          </button>
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Permintaan Custom</label>
          <select
            className={s.formInput}
            value={requestId}
            onChange={(e) => selectRequest(e.target.value)}
          >
            <option value="">Pilih permintaan custom (opsional)...</option>
            {convertable.map((request) => (
              <option key={request.id} value={request.id}>
                {request.nama} · {request.layanan}
              </option>
            ))}
          </select>
          <p className={s.hint}>Data pelanggan terisi otomatis dari permintaan yang dipilih.</p>
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Nama Proyek</label>
          <input
            className={s.formInput}
            placeholder="cth: Proyek Apartemen Citra 2"
            value={namaProyek}
            onChange={(e) => setNamaProyek(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={s.formField}>
            <label className={s.formLabel}>Pelanggan</label>
            <input
              className={s.formInput}
              placeholder="Nama pelanggan"
              value={pelanggan}
              onChange={(e) => setPelanggan(e.target.value)}
            />
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Telepon</label>
            <input
              className={s.formInput}
              placeholder="No. telepon"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
            />
          </div>
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Catatan</label>
          <textarea
            className={s.formTextarea}
            rows={2}
            placeholder="Kebutuhan / deskripsi pemesanan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>

        <div className={s.formField}>
          <label className={s.formLabel}>Barang Proyek</label>
          {proyekItems.length === 0 && (
            <p className={s.hint}>Belum ada item gudang ber-kategori proyek.</p>
          )}
          <div className="space-y-2">
            {proyekItems.map((item) => (
              <div key={item.id} className={s.itemSelectCard}>
                <div className={s.itemSelectInfo}>
                  <div className={s.itemSelectTitle}>{item.sku}</div>
                  <div className={s.itemSelectMeta}>
                    {item.jenisBarang} {item.merek} {item.warna} · stok {item.stok} {item.satuan}
                  </div>
                </div>
                <input
                  className={s.qtyInput}
                  type="number"
                  min={0}
                  value={qtys[item.id] ?? 0}
                  onChange={(e) => setQty(item.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="mb-4 text-xs text-error">{error}</p>}

        <div className={s.actionsWrapper}>
          <button className={s.secondaryButton} onClick={onClose} disabled={loading}>
            Batal
          </button>
          <button className={s.primaryButton} onClick={handleSubmit} disabled={loading}>
            <span className="material-symbols-outlined text-[16px]">
              {loading ? "progress_activity" : "add_task"}
            </span>
            {loading ? "Menyimpan..." : "Buat Pesanan"}
          </button>
        </div>
      </div>
    </div>
  );
}
