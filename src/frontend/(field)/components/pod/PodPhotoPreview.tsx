"use client";

import { useRef, useState } from "react";
import * as s from "./style";

interface Props {
  deliveryId: string;
  currentPath?: string;
  onPathChange: (path: string) => void;
}

// Upload foto bukti kirim. Pratinjau memakai format URL internal ringkas
// `/media/pod/SJ-[ID].jpg`; saat memilih berkas, preview lokal dibuat lewat
// object URL dan path tujuan dibangun dari ID surat jalan.
export function PodPhotoPreview({ deliveryId, currentPath, onPathChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const target = `/media/pod/${deliveryId}.jpg`;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar.");
      return;
    }
    setError(null);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(URL.createObjectURL(file));
    onPathChange(target);
  };

  return (
    <div>
      <div className={s.photoWrap}>
        {objectUrl || currentPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={s.photoImg}
            src={objectUrl ?? currentPath}
            alt="Pratinjau bukti kirim"
            onError={(e) => {
              if (!objectUrl) e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className={s.photoEmpty}>
            <span className={s.photoIcon}>photo_camera</span>
            <span className={s.photoLabel}>
              Belum ada foto bukti kirim.
              <br />Unggah foto saat barang tiba di lokasi proyek.
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button className={s.tertiaryButton} onClick={() => inputRef.current?.click()}>
          <span className="material-symbols-outlined text-[13px] align-middle mr-1">upload</span>
          {currentPath || objectUrl ? "Ganti Foto" : "Unggah Foto POD"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && <p className="text-[10px] text-error mt-2">{error}</p>}

      <div className={s.photoPath}>→ {target}</div>
    </div>
  );
}