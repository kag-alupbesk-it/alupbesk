"use client";

import { useRef, useState } from "react";

interface FileUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
  hint?: string;
}

export default function FileUploadInput({
  value,
  onChange,
  label,
  error,
  hint,
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Gagal mengunggah gambar.");
      }
      onChange(result.data.url);
    } catch (reason) {
      setUploadError(
        reason instanceof Error ? reason.message : "Gagal mengunggah gambar.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1 block text-[12px] font-medium text-on-surface-variant">
          {label}
          {hint && <span className="ml-1 font-normal text-on-surface/40">({hint})</span>}
        </label>
      )}
      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Pratinjau"
            className="h-16 w-16 rounded-lg border border-outline-variant object-cover"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? "Mengunggah..." : "Ganti Gambar"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-left text-xs text-red-400 hover:underline disabled:opacity-50"
              disabled={uploading}
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="block w-full rounded-lg border-2 border-dashed border-outline-variant px-4 py-5 text-center text-sm text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Mengunggah..." : "Pilih file gambar"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {(error || uploadError) && (
        <p className="mt-1 text-xs text-red-400">{error || uploadError}</p>
      )}
    </div>
  );
}
