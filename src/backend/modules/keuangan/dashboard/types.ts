export interface FinanceDashboardState {
  transaksi: unknown[];
  invoice: unknown[];
  karyawan: unknown[];
  opsiJabatan: string[];
  opsiPerson: string[];
  opsiKategori: string[];
  opsiPos: string[];
  seq: number;
  seqKaryawan: number;
  seqInvoice: number;
}

export const EMPTY_FINANCE_STATE: FinanceDashboardState = {
  transaksi: [],
  invoice: [],
  karyawan: [],
  opsiJabatan: [],
  opsiPerson: [],
  opsiKategori: [],
  opsiPos: [],
  seq: 1,
  seqKaryawan: 1,
  seqInvoice: 1,
};
