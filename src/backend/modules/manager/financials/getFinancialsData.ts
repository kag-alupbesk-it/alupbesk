import { getLocalOrders } from "@/services/orders/index";
import { getCatalogProduct } from "@/services/catalog/index";
import { getGudangItems } from "@/backend/modules/gudang/index";
import { formatRp, isRevenueStatus, periodDays, withinDays } from "../helpers/index";
import type { BarData, FinancialsData, Metric, Statement } from "../types";

export function getFinancialsData(period = "monthly", opts?: { startDate?: string; endDate?: string }): FinancialsData {
  const orders = getLocalOrders();
  const gudangItems = getGudangItems();
  const now = Date.now();

  let current = orders;
  let windowMs = 0;
  const hasRange = !!(opts?.startDate || opts?.endDate);
  if (hasRange && opts?.startDate && opts?.endDate) {
    const start = new Date(opts.startDate + "T00:00:00").getTime();
    const end = new Date(opts.endDate + "T23:59:59").getTime();
    windowMs = Math.max(1, end - start);
    current = orders.filter((order) => {
      const at = new Date(order.createdAt).getTime();
      return at >= start && at <= end;
    });
  } else {
    const days = periodDays(period);
    windowMs = days * 86400000;
    current = orders.filter((order) => withinDays(order.createdAt, now, days));
  }
  const revenueList = current.filter((order) => isRevenueStatus(order.status));
  const revenue = revenueList.reduce((sum, order) => sum + order.total, 0);
  const total = current.length;
  const approved = revenueList.length;
  const rejected = current.filter((order) => order.status === "rejected_by_manager" || order.status === "cancelled").length;

  // Memisah pendapatan ke "eceran" vs "proyek" berdasarkan kategori item gudang
  // yang cocok dengan SKU produk tiap baris pesanan.
  let eceranRevenue = 0;
  let proyekRevenue = 0;
  for (const order of revenueList) {
    for (const line of order.items) {
      const product = getCatalogProduct(line.productId);
      const sku = product?.sku ?? "";
      const item = gudangItems.find((gudangItem) => gudangItem.sku === sku);
      if (item?.kategoriBarang === "proyek") proyekRevenue += line.subtotal;
      else eceranRevenue += line.subtotal;
    }
  }
  const donut = [
    { value: eceranRevenue, label: "Penjualan Eceran", color: "#dba501" },
    { value: proyekRevenue, label: "Pendapatan Proyek", color: "#4f9cf0" },
  ].filter((segment) => segment.value > 0);

  const metrics: Metric[] = [
    { label: "Net Revenue", value: formatRp(revenue), sub: null, icon: "trending_up" },
    { label: "Total Pesanan", value: String(total), sub: null, icon: "receipt_long" },
    { label: "Pesanan Disetujui", value: String(approved), sub: null, icon: "check_circle" },
    { label: "Pesanan Ditolak", value: String(rejected), sub: null, icon: "cancel" },
  ];

  let bucketCount = 12;
  if (!hasRange) {
    bucketCount = period === "daily" ? 7 : period === "weekly" ? 4 : period === "monthly" ? 12 : 4;
  } else {
    const totalDays = Math.max(1, Math.ceil(windowMs / 86400000));
    bucketCount = totalDays <= 7 ? totalDays || 1 : totalDays <= 31 ? 4 : totalDays <= 90 ? 6 : 12;
  }
  const bucketRevenue: number[] = [];
  for (let index = 0; index < bucketCount; index += 1) {
    let start: number;
    let end: number;
    if (hasRange && opts?.startDate && opts?.endDate) {
      const s = new Date(opts.startDate + "T00:00:00").getTime();
      const e = new Date(opts.endDate + "T23:59:59").getTime();
      start = s + index * ((e - s) / bucketCount);
      end = s + (index + 1) * ((e - s) / bucketCount);
    } else {
      start = now - (bucketCount - index) * (windowMs / bucketCount);
      end = now - (bucketCount - index - 1) * (windowMs / bucketCount);
    }
    bucketRevenue.push(
      orders.filter((order) => {
        const at = new Date(order.createdAt).getTime();
        return at >= start && at < end;
      }).filter((order) => isRevenueStatus(order.status)).reduce((sum, order) => sum + order.total, 0)
    );
  }
  const maxBucket = Math.max(...bucketRevenue, 1);
  const barChart: BarData[] = bucketRevenue.map((value) => ({ value: Math.round((value / maxBucket) * 100) }));

  const grouped = new Map<string, number>();
  for (const order of orders) {
    if (!isRevenueStatus(order.status)) continue;
    if (!hasRange) {
      if (!withinDays(order.createdAt, now, periodDays(period))) continue;
    } else if (opts?.startDate && opts?.endDate) {
      const at = new Date(order.createdAt).getTime();
      const start = new Date(opts.startDate + "T00:00:00").getTime();
      const end = new Date(opts.endDate + "T23:59:59").getTime();
      if (at < start || at > end) continue;
    } else {
      if (!withinDays(order.createdAt, now, periodDays(period))) continue;
    }
    const key = new Date(order.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    grouped.set(key, (grouped.get(key) ?? 0) + order.total);
  }
  const statements: Statement[] = [...grouped.entries()].sort(([left], [right]) => right.localeCompare(left)).map(([periodLabel, value]) => ({
    period: periodLabel,
    revenue: formatRp(value),
    // Order revenue is not profit. Show no profit estimate until actual costs
    // are linked to orders in the finance ledger.
    profit: "—",
    margin: "—",
  }));

  return { metrics, statements, expenses: [], barChart, donut };
}
