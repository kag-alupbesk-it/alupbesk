import ExcelJS from "exceljs";

export type PayrollExcelRow = {
  no: number;
  nama: string;
  hari: string;
  tanggal: string;
  gajiHarian: number;
  tarifLembur: number;
  statusPagi: number;
  jamMasuk: string;
  jamPulang: string;
  proyek: string;
  gaji: number;
  makan: number;
};

export type ProjectAllocation = {
  proyek: string;
  total: number;
};

export type ParsedPayrollData = {
  rows: PayrollExcelRow[];
  projects: ProjectAllocation[];
  totalBayaran: number;
  potonganBon: number;
  totalDiTerima: number;
};

export async function parsePayrollExcel(file: File): Promise<ParsedPayrollData> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("File Excel tidak memiliki lembar kerja yang valid.");

  const rows: PayrollExcelRow[] = [];
  const projectsMap = new Map<string, number>();
  let totalBayaran = 0;
  let potonganBon = 0;
  let totalDiTerima = 0;

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 2) return; // Lewati header

    const noCell = row.getCell(1).value;
    const namaCell = row.getCell(2).value;
    const hariCell = row.getCell(3).value;
    const tanggalCell = row.getCell(4).value;
    const gajiHarianCell = row.getCell(5).value;
    const tarifLemburCell = row.getCell(6).value;
    const pagiCell = row.getCell(7).value;
    const jamMasukCell = row.getCell(8).value;
    const jamPulangCell = row.getCell(9).value;
    const proyekCell = row.getCell(10).value;
    const gajiCell = row.getCell(11).value;
    const makanCell = row.getCell(12).value;

    if (namaCell) {
      const nama = String(namaCell).trim();
      const hari = String(hariCell || "").trim();
      let tanggal = "";
      if (tanggalCell) {
        if (tanggalCell instanceof Date) {
          tanggal = tanggalCell.toISOString().slice(0, 10);
        } else {
          const parsed = new Date(String(tanggalCell));
          tanggal = !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : String(tanggalCell);
        }
      }

      const gajiHarian = Number(typeof gajiHarianCell === "object" && gajiHarianCell !== null && "result" in gajiHarianCell ? gajiHarianCell.result : gajiHarianCell) || 0;
      const tarifLembur = Number(typeof tarifLemburCell === "object" && tarifLemburCell !== null && "result" in tarifLemburCell ? tarifLemburCell.result : tarifLemburCell) || 0;
      const statusPagi = Number(typeof pagiCell === "object" && pagiCell !== null && "result" in pagiCell ? pagiCell.result : pagiCell) || 0;
      const gaji = Number(typeof gajiCell === "object" && gajiCell !== null && "result" in gajiCell ? gajiCell.result : gajiCell) || 0;
      const makan = Number(typeof makanCell === "object" && makanCell !== null && "result" in makanCell ? makanCell.result : makanCell) || 0;

      rows.push({
        no: Number(noCell) || rows.length + 1,
        nama,
        hari,
        tanggal,
        gajiHarian,
        tarifLembur,
        statusPagi,
        jamMasuk: String(jamMasukCell || ""),
        jamPulang: String(jamPulangCell || ""),
        proyek: String(proyekCell || "Kantor"),
        gaji,
        makan,
      });
    }

    // Baca rekap proyek di kolom R & T (Kolom 18 dan 20)
    const projNameCell = row.getCell(18).value;
    const projValCell = row.getCell(20).value;
    if (projNameCell) {
      const pName = String(projNameCell).trim();
      const pVal = Number(typeof projValCell === "object" && projValCell !== null && "result" in projValCell ? projValCell.result : projValCell) || 0;
      if (pName && !pName.toLowerCase().includes("total bayaran") && !pName.toLowerCase().includes("potongan bon") && !pName.toLowerCase().includes("total di terima")) {
        projectsMap.set(pName, (projectsMap.get(pName) || 0) + pVal);
      }
      if (pName.toLowerCase().includes("total bayaran")) {
        totalBayaran = pVal;
      }
      if (pName.toLowerCase().includes("potongan bon")) {
        potonganBon = pVal;
      }
      if (pName.toLowerCase().includes("total di terima")) {
        totalDiTerima = pVal;
      }
    }
  });

  // Jika totalDiTerima belum terbaca dari kolom R, hitung otomatis dari total gaji baris
  if (totalBayaran === 0) {
    totalBayaran = rows.reduce((sum, r) => sum + r.gaji + r.makan, 0);
  }
  if (totalDiTerima === 0) {
    totalDiTerima = totalBayaran - potonganBon;
  }

  const projects: ProjectAllocation[] = Array.from(projectsMap.entries()).map(([proyek, total]) => ({
    proyek,
    total,
  }));

  return {
    rows,
    projects,
    totalBayaran,
    potonganBon,
    totalDiTerima,
  };
}
