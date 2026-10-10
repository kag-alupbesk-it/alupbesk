import { FinanceProvider } from "@/frontend/Manager/(keuangan)/components/finance/FinanceStore/FinanceStore";
import { InvoicePrintView } from "@/frontend/Manager/(keuangan)/components/finance/InvoicePrintView";

export const metadata = {
  title: "Cetak Invoice | ALUPBESK",
  description: "Invoice siap cetak - CV ALUPBESK",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FinanceProvider>
      <InvoicePrintView invoiceId={id} />
    </FinanceProvider>
  );
}
