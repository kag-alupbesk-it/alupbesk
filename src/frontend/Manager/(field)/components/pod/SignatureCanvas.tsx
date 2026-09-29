"use client";

import { useEffect, useRef } from "react";
import * as s from "./style";

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
}

// Kanvas tanda tangan digital: mendukung mouse dan sentuh melalui Pointer
// Events. Hasil goresan disimpan sebagai data URL PNG agar bisa dirender
// ulang pada cetakan Surat Jalan (kolom TTD Penerima).
export function SignatureCanvas({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1c1e";

    const pos = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const start = (event: PointerEvent) => {
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      drawing.current = true;
      last.current = pos(event);
    };

    const move = (event: PointerEvent) => {
      if (!drawing.current || !last.current) return;
      event.preventDefault();
      const current = pos(event);
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(current.x, current.y);
      ctx.stroke();
      last.current = current;
    };

    const end = (event: PointerEvent) => {
      if (!drawing.current) return;
      drawing.current = false;
      last.current = null;
      canvas.releasePointerCapture?.(event.pointerId);
      onChange(canvas.toDataURL("image/png"));
    };

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    return () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", end);
    };
  }, [onChange]);

  // Render ulang goresan yang sudah disimpan bila form dibuka lagi.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !value) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = value;
  }, [value]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div>
      <div className={s.canvasWrap}>
        <canvas ref={canvasRef} className={s.canvas} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className={s.canvasHint}>Tuliskan tanda tangan dengan mouse / jari.</p>
        <button className={s.tertiaryButton} onClick={handleClear}>
          <span className="material-symbols-outlined text-[13px] align-middle mr-1">refresh</span>
          Ulangi
        </button>
      </div>
    </div>
  );
}