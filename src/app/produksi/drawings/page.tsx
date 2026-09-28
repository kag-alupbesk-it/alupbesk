import { UploadGambarTeknik } from "@/frontend/(produksi)/components/UploadGambarTeknik";

export const metadata = {
  title: "Upload Gambar Teknik | Manajer Produksi",
  description: "Kirim gambar teknik kerja ke PM untuk diverifikasi sebelum masuk produksi",
};

export default function Page() {
  return <UploadGambarTeknik />;
}
