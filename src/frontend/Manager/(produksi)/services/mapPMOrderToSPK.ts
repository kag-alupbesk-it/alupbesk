import type { PMOrder } from "@/services/pm/types";
import type { SPK } from "../types/types";

export function mapPMOrderToSPK(order: PMOrder): SPK {
  const statusGambar: SPK["statusGambar"] = !order.hasProductionDrawing
    ? order.drawingStatus === "revisi"
      ? "revisi"
      : "belum_diunggah"
    : order.drawingStatus === "acc_gambar"
      ? "acc_pm"
      : order.drawingStatus;

  return {
    nomor: order.id,
    kodeProduksi: order.contractorCode || null,
    namaKontraktor: order.contractorName,
    telepon: order.contractorPhone,
    alamatProyek: order.projectAddress,
    targetDeadline: order.targetDate,
    tanggalMasuk: order.enteredAt,
    statusGambar,
    tahapan: order.productionStage,
    item: order.items.map((item) => ({
      kode: item.id,
      nama: item.name,
      kuantitas: item.quantity,
      satuan: item.unit,
      catatanSpesifikasi: item.technicalNote,
    })),
    gambarTeknik: order.hasProductionDrawing
      ? {
          nama: order.productionImageName ?? "gambar-teknik",
          ukuran: order.productionImageSize ?? 0,
          tipe: order.productionImageType ?? "application/octet-stream",
          url: order.productionImage,
        }
      : undefined,
    gambarAcuan: order.rawImage
      ? {
          nama: order.rawImageName ?? "gambar-acuan",
          url: order.rawImage,
        }
      : undefined,
    catatanTeknis: order.technicalNote,
    revisiCount: order.revisionCount,
    aktivitasTerakhir: order.lastActivity,
  };
}
