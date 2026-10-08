"use client";

import { useRef, useState } from "react";
import { request } from "@/services/api/request";
import * as s from "../shared/style";

interface Props {
  // Label path tujuan untuk menjelaskan kategori bukti.
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
  const [pending, setPending] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const result = await request<{ url: string }>("/upload", { method: "POST", body: form });
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setObjectUrl(URL.createObjectURL(file));
      onPathChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Foto gagal diunggah.");
    } finally {
      setPending(false);
    }
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
          disabled={pending}
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
          onChange={(e) => { void handleFile(e.target.files?.[0]); e.currentTarget.value = ""; }}
        />
      </div>

      {error && <p className="text-[10px] text-error mt-2">{error}</p>}

      <div className={s.photoPath}>{pending ? "Mengunggah foto..." : currentPath ? "Foto tersimpan di penyimpanan." : `Tujuan: ${targetPath}`}</div>
    </div>
  );
}
