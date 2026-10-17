export interface CustomRequestMessageItem {
  name: string;
  quantity: number | string;
  unit: string;
  technicalNote?: string;
}

export interface CustomRequestMessageData {
  nama?: string;
  kode?: string;
  perusahaan?: string;
  telp?: string;
  projectAddress?: string;
  layanan?: string;
  deskripsi?: string;
  deadline?: string;
  items: CustomRequestMessageItem[];
  rawImage?: string;
  imageUrl?: string;
}

function appendIf(lines: string[], label: string, value: string | undefined): void {
  if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
}

// Daftar item untuk template WA, baris opsional kosong dilewati.
export function buildCustomRequestItemsText(
  items: CustomRequestMessageItem[],
): string {
  if (items.length === 0) return "";
  return items
    .map((item, index) => {
      const base = `${index + 1}. ${item.name} — ${item.quantity} ${item.unit}`;
      return item.technicalNote ? `${base}\n   Catatan: ${item.technicalNote}` : base;
    })
    .join("\n");
}

// Pesan WhatsApp mengikuti isi form: item satu per baris, field opsional kosong
// (perusahaan/kode/alamat/deadline) tidak ditampilkan sebagai dash.
export function buildCustomRequestMessage(
  data: CustomRequestMessageData,
  firstLine: string,
): string {
  const lines: string[] = [firstLine];
  appendIf(lines, "Nama", data.nama);
  appendIf(lines, "Kode Produksi", data.kode);
  appendIf(lines, "Perusahaan", data.perusahaan);
  appendIf(lines, "No. WhatsApp", data.telp);
  appendIf(lines, "Alamat Proyek", data.projectAddress);
  appendIf(lines, "Layanan", data.layanan);
  appendIf(lines, "Deskripsi", data.deskripsi);
  appendIf(lines, "Target Deadline", data.deadline);

  const itemsText = buildCustomRequestItemsText(data.items);
  if (itemsText) {
    lines.push(`Spesifikasi Item:\n${itemsText}`);
  }



  return lines.join("\n");
}