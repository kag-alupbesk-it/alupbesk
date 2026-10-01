"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadDrawing } from "./drawingDownload";

interface DownloadDrawingButtonProps {
  scopeId: string;
  fileName: string;
  label?: string;
  className?: string;
}

export function DownloadDrawingButton({
  scopeId,
  fileName,
  label = "Download",
  className = "",
}: DownloadDrawingButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    try {
      await downloadDrawing(scopeId, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunduh gambar.");
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded-md border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-secondary/20 disabled:opacity-60 ${className}`}
      >
        {pending ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
        {pending ? "Menyiapkan..." : label}
      </button>
      {error && <span className="text-[9px] text-red-300">{error}</span>}
    </span>
  );
}
