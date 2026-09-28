"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { mockSPK } from "../data/mockSPK";
import { tahapanOrder } from "../types";
import type { KirimGambarInput, SPK, StatusPengerjaan, TahapanProduksi } from "../types";

interface ProduksiContextValue {
  spk: SPK[];
  // Order yang masih menunggu gambar teknik: belum ada berkas, atau PM sudah
  // meminta revisi sehingga perlu unggah ulang.
  spkPerluGambar: SPK[];
  getSPK: (nomor: string) => SPK | undefined;
  kirimGambar: (input: KirimGambarInput) => SPK | undefined;
  ubahTahapan: (nomor: string, tahapan: TahapanProduksi) => void;
  hitungStatusPengerjaan: (tahapan: TahapanProduksi) => StatusPengerjaan;
}

const ProduksiContext = createContext<ProduksiContextValue | undefined>(undefined);

// Tahapan menentukan kartu ringkasan mana yang terisi: empat tahap pertama
// masih di dalam workshop, tahap terakhir berarti barang siap diserahkan.
function statusDariTahapan(tahapan: TahapanProduksi): StatusPengerjaan {
  return tahapan === "siap_kirim" ? "siap_kirim" : "dalam_produksi";
}

function aktivitasUntukTahapan(tahapan: TahapanProduksi, namaKontraktor: string) {
  if (tahapan === "siap_kirim") return `QC passed, barang siap kirim ke ${namaKontraktor}`;
  return `Tahap ${tahapan} dimulai di workshop`;
}

export function ProduksiProvider({ children }: { children: ReactNode }) {
  const [spk, setSPK] = useState<SPK[]>(mockSPK);

  const getSPK = useCallback((nomor: string) => spk.find((item) => item.nomor === nomor), [spk]);

  const spkPerluGambar = useMemo(
    () => spk.filter((item) => item.statusGambar === "belum_diunggah" || item.statusGambar === "revisi"),
    [spk],
  );

  const kirimGambar = useCallback((input: KirimGambarInput) => {
    let hasil: SPK | undefined;
    setSPK((current) =>
      current.map((item) => {
        if (item.nomor !== input.spkNomor) return item;
        hasil = {
          ...item,
          gambarTeknik: input.berkas,
          catatanTeknis: input.catatanTeknis.trim() || undefined,
          statusGambar: "menunggu_acc",
          statusPengerjaan: "menunggu_acc",
          tahapan: "pemotongan",
          aktivitasTerakhir: "Gambar teknik dikirim ke PM, menunggu ACC",
        };
        return hasil;
      }),
    );
    return hasil;
  }, []);

  const ubahTahapan = useCallback((nomor: string, tahapan: TahapanProduksi) => {
    setSPK((current) =>
      current.map((item) => {
        if (item.nomor !== nomor) return item;
        // Produksi tidak boleh berjalan sebelum gambar teknik di-ACC PM, karena
        // workshop akan memotong material dari ukuran yang salah.
        if (item.statusGambar !== "acc_pm") return item;
        if (!tahapanOrder.includes(tahapan)) return item;
        return {
          ...item,
          tahapan,
          statusPengerjaan: statusDariTahapan(tahapan),
          aktivitasTerakhir: aktivitasUntukTahapan(tahapan, item.namaKontraktor),
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      spk,
      spkPerluGambar,
      getSPK,
      kirimGambar,
      ubahTahapan,
      hitungStatusPengerjaan: statusDariTahapan,
    }),
    [spk, spkPerluGambar, getSPK, kirimGambar, ubahTahapan],
  );

  return <ProduksiContext.Provider value={value}>{children}</ProduksiContext.Provider>;
}

export function useProduksi() {
  const context = useContext(ProduksiContext);
  if (!context) throw new Error("useProduksi must be used within ProduksiProvider");
  return context;
}
