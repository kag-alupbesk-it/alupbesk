"use client";

import { useRef, useState } from "react";
import * as s from "../style/style";

interface Props {
  // Path tujuan foto yang disimpan, mis. `/media/pod/SJ-2026-003-tanda-tangan.jpg`.
  targetPath: string;
  currentPath?: string;
  onPathChange: (path: string) => void;
  emptyText: string;
  uploadLabel: string;
}

// Unggah satu foto bukti terima. Pratinjau memakai object URL saat berkas baru
// dipilih, lalu beralih ke path tujuan yang dibangun dari targetPath.
export function PodPhotoPreview({ targetPath, currentPath, onPathChange, emptyText, uploadLabel }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar.");
      return;
    }
    setError(null);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(URL.createObjectURL(file));
    onPathChange(targetPath);
  };

  return (
    <div>
      <div className={s.photoWrap}>
        {objectUrl || currentPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={s.photoImg}
            src={objectUrl ?? currentPath}
            alt="Pratinjau bukti terima"
            onError={(e) => {
              if (!objectUrl) e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className={s.photoEmpty}>
            <span className={s.photoIcon}>photo_camera</span>
            <span className={s.photoLabel}>{emptyText}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className={`${s.tertiaryButton} w-full sm:w-auto`}
          onClick={() => inputRef.current?.click()}
        >
          <span className={s.actionIcon}>{currentPath || objectUrl ? "sync" : "add_a_photo"}</span>
          {currentPath || objectUrl ? "Ganti Foto" : uploadLabel}
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

      <div className={s.photoPath}>→ {targetPath}</div>
    </div>
  );
}
