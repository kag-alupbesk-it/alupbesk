import ExcelJS from "exceljs";
import { TransaksiKas, JenisTransaksi } from "../types/types";

export async function parseCashflowExcel(file: File): Promise<Partial<TransaksiKas>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // Cari sheet "CF" atau ambil sheet pertama
  const worksheet = workbook.getWorksheet("CF") || workbook.worksheets[0];
  if (!worksheet) throw new Error("File Excel tidak memiliki lembar kerja (worksheet) yang valid.");

  const transactions: Partial<TransaksiKas>[] = [];

  // Data transaksi di template CF biasanya mulai dari baris 6 ke bawah
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 6) return; // Lewati header

    const dateCell = row.getCell(2).value; // Kolom B: Date
    const noNotaCell = row.getCell(3).value; // Kolom C: No. Nota
    const personCell = row.getCell(4).value || row.getCell(7).value; // Kolom D/G: Person
    const uraianCell = row.getCell(6).value; // Kolom F: Uraian
    const kategoriCell = row.getCell(8).value; // Kolom H: Account Code / Kategori
    const kasMasukCell = row.getCell(9).value; // Kolom I: Kas Masuk
    const kasKeluarCell = row.getCell(10).value; // Kolom J: Kas Keluar
    const posCell = row.getCell(12).value; // Kolom L: Pos

    // Jika baris kosong atau bertuliskan "Total per", lewati
    const uraianStr = String(uraianCell || "").trim();
    if (!uraianStr || uraianStr.toLowerCase().includes("total per")) {
      return;
    }

    let tanggal = new Date().toISOString().slice(0, 10);
    if (dateCell) {
      if (dateCell instanceof Date) {
        tanggal = dateCell.toISOString().slice(0, 10);
      } else {
        const parsed = new Date(String(dateCell));
        if (!isNaN(parsed.getTime())) {
          tanggal = parsed.toISOString().slice(0, 10);
        }
      }
    }

    const kasMasuk = Number(typeof kasMasukCell === "object" && kasMasukCell !== null && "result" in kasMasukCell ? kasMasukCell.result : kasMasukCell) || 0;
    const kasKeluar = Number(typeof kasKeluarCell === "object" && kasKeluarCell !== null && "result" in kasKeluarCell ? kasKeluarCell.result : kasKeluarCell) || 0;

    let jenis: JenisTransaksi = "kas_keluar";
    let nominal = 0;

    if (kasMasuk > 0) {
      jenis = "kas_masuk";
      nominal = kasMasuk;
    } else if (kasKeluar > 0) {
      jenis = "kas_keluar";
      nominal = kasKeluar;
    } else {
      return; // Abaikan jika tidak ada nominal masuk/keluar
    }

    transactions.push({
      tanggal,
      jenis,
      uraian: uraianStr,
      kategori: String(kategoriCell || (uraianStr.toLowerCase().includes("saldo bulan lalu") ? "Saldo Awal" : "Dll")),
      posProyek: String(posCell || "Kantor"),
      person: String(personCell || ""),
      nominal,
      noNota: String(noNotaCell || ""),
      bukti: "",
      sumber: "manual",
      refId: "",
    });
  });

  return transactions;
}
