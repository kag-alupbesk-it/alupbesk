import type { FieldDelivery } from "@/services/field/types";

interface FieldDeliveryItemRow {
  id: string;
  name: string;
  category: string | null;
  specification: string | null;
  unit: string;
  quantity: number | string;
  quantity_shipped: number | string;
}

interface FieldDeliveryRow {
  id: string;
  contractor_code: string;
  contractor_name: string;
  project_address: string | null;
  phone: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  status: FieldDelivery["status"];
  driver_name: string | null;
  plate_number: string | null;
  vehicle_type: string | null;
  signature_image_url: string | null;
  project_image_url: string | null;
  print_count: number | string;
  field_delivery_items?: FieldDeliveryItemRow[] | null;
}

export function mapFieldDelivery(row: FieldDeliveryRow): FieldDelivery {
  return {
    id: row.id,
    kodeProduksi: row.contractor_code,
    namaKontraktor: row.contractor_name,
    alamatProyek: row.project_address ?? "",
    telepon: row.phone ?? undefined,
    tanggalKirim: row.shipped_at ?? row.created_at,
    items: (row.field_delivery_items ?? []).map((item) => ({
      id: item.id,
      namaBarang: item.name,
      jenisBarang: item.category ?? "Material",
      spesifikasi: item.specification ?? "",
      satuan: item.unit,
      kuantitas: Number(item.quantity),
      kuantitasTerkirim: Number(item.quantity_shipped),
    })),
    status: row.status,
    armada: row.driver_name
      ? {
          namaSopir: row.driver_name,
          platNomor: row.plate_number ?? "",
          jenisArmada: row.vehicle_type ?? "",
        }
      : undefined,
    signatureImagePath: row.signature_image_url ?? undefined,
    projectImagePath: row.project_image_url ?? undefined,
    cetakCount: Number(row.print_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
