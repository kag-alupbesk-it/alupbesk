"use client";

import { useId, useState } from "react";
import * as s from "../../style/style";

const BARU = "__opsi_baru__";

type Props = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  onTambah: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export function SelectTambahBaru({
  label,
  value,
  options,
  onChange,
  onTambah,
  placeholder = "cth: Tulis nama baru",
  error,
}: Props) {
  const id = useId();
  const [modeBaru, setModeBaru] = useState(false);
  const [teks, setTeks] = useState("");
  const [galat, setGalat] = useState("");

  const tutupModeBaru = () => {
    setModeBaru(false);
    setTeks("");
    setGalat("");
  };

  const simpan = () => {
    const bersih = teks.trim();
    if (!bersih) {
      setGalat("Nama wajib diisi.");
      return;
    }
    if (options.some((item) => item.toLowerCase() === bersih.toLowerCase())) {
      setGalat(`"${bersih}" sudah ada di daftar.`);
      return;
    }
    onTambah(bersih);
    onChange(bersih);
    tutupModeBaru();
  };

  return (
    <div>
      <label className={s.fieldLabel} htmlFor={id}>
        {label}
      </label>

      {!modeBaru ? (
        <select
          id={id}
          value={value}
          onChange={(event) => {
            if (event.target.value === BARU) {
              setModeBaru(true);
              setGalat("");
              return;
            }
            onChange(event.target.value);
          }}
          aria-invalid={Boolean(error)}
          className={s.select}
        >
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value={BARU}>+ Tambah baru…</option>
        </select>
      ) : (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            autoFocus
            value={teks}
            onChange={(event) => {
              setTeks(event.target.value);
              setGalat("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                simpan();
              }
              if (event.key === "Escape") tutupModeBaru();
            }}
            placeholder={placeholder}
            aria-label={`${label} baru`}
            aria-invalid={Boolean(galat)}
            className={s.input}
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={simpan}
              className={`${s.ghostButton} flex-1 sm:flex-none`}
              aria-label={`Simpan ${label} baru`}
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={tutupModeBaru}
              className={`${s.ghostButton} flex-1 sm:flex-none`}
              aria-label={`Batal tambah ${label}`}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {(error || galat) && (
        <span role="alert" className={s.inputErrorText}>
          {error || galat}
        </span>
      )}
    </div>
  );
}