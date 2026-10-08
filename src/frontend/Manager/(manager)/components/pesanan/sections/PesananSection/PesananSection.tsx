"use client";

import { useCallback, useState } from "react";
import { customApi } from "@/services/api/custom";
import type { CustomRequest } from "@/backend/modules/custom";
import type { GudangItem } from "@/backend/modules/gudang";
import { getProyekItems, createProjectOrder } from "@/frontend/Manager/(manager)/services/pesanan";
import * as s from "./style";
import { usePollingResource } from "@/frontend/shared/hooks/usePollingResource";

export function PesananSection() {
  const loadRequests = useCallback(() => customApi.getRequests(), []);
  const loadItems = useCallback(() => getProyekItems(), []);
  const { data: requests } = usePollingResource<CustomRequest[]>(loadRequests, []);
  const { data: items } = usePollingResource<GudangItem[]>(loadItems, []);
  const [requestId, setRequestId] = useState("");
  const [namaProyek, setNamaProyek] = useState("");
  const [pelanggan, setPelanggan] = useState("");
  const [telepon, setTelepon] = useState("");
  const [catatan, setCatatan] = useState("");
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setNotice(null);
    if (!namaProyek.trim()) return setError("Nama proyek wajib diisi.");
    if (!pelanggan.trim()) return setError("Nama pelanggan wajib diisi.");

    const selectedItems = items
      .filter((item) => (qtys[item.id] ?? 0) > 0)
      .map((item) => ({ gudangItemId: item.id, quantity: qtys[item.id] }));
    if (selectedItems.length === 0) return setError("Pilih minimal satu barang proyek beserta jumlahnya.");

    setLoading(true);
    try {
      await createProjectOrder({
        requestId: requestId || undefined,
        namaProyek: namaProyek.trim(),
        pelanggan: pelanggan.trim(),
        telepon: telepon.trim() || undefined,
        catatan: catatan.trim() || undefined,
        items: selectedItems,
      });
      setNotice(`Pesanan proyek "${namaProyek.trim()}" berhasil dibuat dan masuk ke antrian gudang.`);
      setRequestId("");
      setNamaProyek("");
      setPelanggan("");
      setTelepon("");
      setCatatan("");
      setQtys({});
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal membuat pesanan proyek.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <header className={s.header}>
          <div>
            <h1 className={s.title}>Buat Pesanan Proyek</h1>
            <p className={s.subtitle}>
              Buat pesanan proyek dari permintaan custom pelanggan. Proses stok &amp; pengiriman ditangani bagian Gudang.
            </p>
          </div>
          <span className={s.badge}>Manager</span>
        </header>

        {notice && <div className={s.notice}>{notice}</div>}

        <div className={s.card}>
          <h2 className={s.cardTitle}>Form Pesanan</h2>
          <p className={`${s.cardSubtitle} mb-5`}>Data pelanggan terisi otomatis dari permintaan custom yang dipilih.</p>

          <div className="mb-4">
            <label className={`${s.fieldLabel} mb-1`}>Permintaan Custom</label>
            <select className={s.input} value={requestId} onChange={(e) => selectRequest(e.target.value)}>
              <option value="">Pilih permintaan custom (opsional)...</option>
              {convertable.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.nama} · {request.layanan}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={`${s.fieldLabel} mb-1`}>Nama Proyek</label>
            <input className={s.input} placeholder="cth: Proyek Apartemen Citra 2" value={namaProyek} onChange={(e) => setNamaProyek(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`${s.fieldLabel} mb-1`}>Pelanggan</label>
              <input className={s.input} placeholder="Nama pelanggan" value={pelanggan} onChange={(e) => setPelanggan(e.target.value)} />
            </div>
            <div>
              <label className={`${s.fieldLabel} mb-1`}>Telepon</label>
              <input className={s.input} placeholder="No. telepon" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            </div>
          </div>

          <div className="mb-5">
            <label className={`${s.fieldLabel} mb-1`}>Catatan</label>
            <textarea className={s.textarea} rows={2} placeholder="Kebutuhan / deskripsi pemesanan" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          </div>

          <div>
            <label className={`${s.fieldLabel} mb-2`}>Barang Proyek</label>
            {items.length === 0 && <p className={s.hint}>Belum ada item gudang ber-kategori proyek.</p>}
            <div className="space-y-2 mb-5">
              {items.map((item) => (
                <div key={item.id} className={s.itemCard}>
                  <div className={s.itemInfo}>
                    <div className={s.itemTitle}>{item.sku}</div>
                    <div className={s.itemMeta}>
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

          <button className={s.primaryButton} onClick={handleSubmit} disabled={loading}>
            <span className="material-symbols-outlined text-[16px]">{loading ? "progress_activity" : "add_task"}</span>
            {loading ? "Menyimpan..." : "Buat Pesanan"}
          </button>
        </div>
      </div>
    </div>
  );
}
