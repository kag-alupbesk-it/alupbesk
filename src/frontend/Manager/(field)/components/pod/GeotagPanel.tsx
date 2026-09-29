"use client";

import { useState } from "react";
import type { FieldGeotag } from "../types";
import * as s from "./style";

interface Props {
  value: FieldGeotag | null;
  onChange: (geo: FieldGeotag) => void;
}

type GeoState = "idle" | "locating" | "success" | "error";

// Mengambil latitude, longitude, dan timestamp lewat Browser Geolocation API.
// Dilengkapi fallback input manual agar tetap bisa diisi bila izin lokasi
// ditolak / tidak tersedia.
export function GeotagPanel({ value, onChange }: Props) {
  const [state, setState] = useState<GeoState>(value ? "success" : "idle");
  const [error, setError] = useState<string | null>(null);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      setState("error");
      setError("Geolocation tidak didukung browser ini. Isi koordinat secara manual.");
      return;
    }
    setState("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          timestamp: new Date().toISOString(),
        });
        setState("success");
      },
      (err) => {
        setState("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Izinkan akses lokasi, atau isi koordinat manual."
            : "Gagal mengambil lokasi. Coba lagi atau isi koordinat manual.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleManual = (key: "latitude" | "longitude", raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onChange({
      latitude: key === "latitude" ? parsed : (value?.latitude ?? 0),
      longitude: key === "longitude" ? parsed : (value?.longitude ?? 0),
      timestamp: value?.timestamp ?? new Date().toISOString(),
    });
    setState("success");
  };

  return (
    <div>
      {value ? (
        <div className={s.geoRow}>
          <span className={s.geoChip}>
            <span className={s.geoDot} />
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </span>
          <span className={s.geoChip}>
            {new Date(value.timestamp).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ) : (
        <p className="text-[10px] text-on-surface-variant">
          Belum ada titik lokasi. Ambil lokasi untuk mencatat bukti pengiriman di lokasi proyek.
        </p>
      )}

      {state === "locating" && (
        <p className="text-[10px] text-secondary mt-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
          Mengambil lokasi...
        </p>
      )}
      {state === "error" && error && <p className="text-[10px] text-error mt-2">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button className={s.tertiaryButton} onClick={handleLocate} disabled={state === "locating"}>
          <span className="material-symbols-outlined text-[13px] align-middle mr-1">my_location</span>
          {value ? "Ambil Ulang Lokasi" : "Ambil Lokasi"}
        </button>

        <div className="flex items-center gap-2">
          <input
            className={`${s.formInput} w-28`}
            type="number"
            step="any"
            placeholder="Latitude"
            value={value?.latitude ?? ""}
            onChange={(e) => handleManual("latitude", e.target.value)}
          />
          <input
            className={`${s.formInput} w-28`}
            type="number"
            step="any"
            placeholder="Longitude"
            value={value?.longitude ?? ""}
            onChange={(e) => handleManual("longitude", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}