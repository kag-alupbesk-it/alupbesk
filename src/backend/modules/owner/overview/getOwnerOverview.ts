import { getLocalOrders } from "@/services/orders/index";
import { getCustomRequests } from "@/backend/modules/custom/index";
import { getRoleRequests } from "@/backend/modules/roleRequests/index";
import { getGudangItems } from "@/backend/modules/gudang/index";
import { getKasData, getPenagihan } from "@/backend/modules/keuangan/index";
import { listPMOrders } from "@/backend/modules/pm/index";
import { getFieldDeliveries } from "@/backend/modules/field/index";
import { getDashboardData } from "@/backend/modules/manager/dashboard/getDashboardData";
import {
  fmtTime,
  formatRp,
  isRevenueStatus,
  periodDays,
  withinDays,
} from "@/backend/modules/manager/helpers/index";
import type { Activity, Registration, SystemStatus } from "@/backend/modules/manager/types";
import type { PMOrder } from "@/services/pm/types";
import type { FieldDelivery } from "@/services/field/types";
import type {
  OwnerAttentionItem,
  OwnerCashPoint,
  OwnerDivisionCard,
  OwnerMetric,
  OwnerOverview,
} from "./types";

type Period = "daily" | "weekly" | "monthly" | "yearly";

const BUCKET_SPEC: Record<
  Period,
  { count: number; stepDays: number; format: Intl.DateTimeFormatOptions }
> = {
  daily: { count: 7, stepDays: 1, format: { day: "2-digit", month: "short" } },
  weekly: { count: 6, stepDays: 7, format: { day: "2-digit", month: "short" } },
  monthly: { count: 6, stepDays: 30, format: { month: "short" } },
  yearly: { count: 6, stepDays: 365, format: { year: "numeric" } },
};

// Sumber data proyek/pengiriman bergantung pada database. Bila DB belum siap
// Overview tetap harus tampil, jadi setiap pemanggilan dibungkus aman.
async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch {
    return fallback;
  }
}

function buildCashflow(
  period: Period,
  masuk: { tanggal: string; jumlah: number }[],
  keluar: { tanggal: string; jumlah: number }[],
): { points: OwnerCashPoint[]; totals: { saldo: number; totalMasuk: number; totalKeluar: number } } {
  const spec = BUCKET_SPEC[period] ?? BUCKET_SPEC.monthly;
  const now = Date.now();
  const buckets = Array.from({ length: spec.count }, (_, index) => ({
    label: new Intl.DateTimeFormat("id-ID", spec.format).format(
      new Date(now - (spec.count - index) * spec.stepDays * 86400000),
    ),
    start: now - (spec.count - index) * spec.stepDays * 86400000,
    end: now - (spec.count - index - 1) * spec.stepDays * 86400000,
    masuk: 0,
    keluar: 0,
  }));

  const place = (entry: { tanggal: string; jumlah: number }, key: "masuk" | "keluar") => {
    const at = Date.parse(entry.tanggal);
    if (Number.isNaN(at)) return;
    const bucket = buckets.find((b) => at >= b.start && at < b.end);
    if (bucket) bucket[key] += entry.jumlah;
  };

  masuk.forEach((entry) => place(entry, "masuk"));
  keluar.forEach((entry) => place(entry, "keluar"));

  const totalMasuk = masuk.reduce((sum, entry) => sum + entry.jumlah, 0);
  const totalKeluar = keluar.reduce((sum, entry) => sum + entry.jumlah, 0);

  return {
    points: buckets.map((b) => ({ label: b.label, masuk: b.masuk, keluar: b.keluar })),
    totals: { saldo: totalMasuk - totalKeluar, totalMasuk, totalKeluar },
  };
}

function metric(label: string, value: string | number): OwnerMetric {
  return { label, value: String(value) };
}

export async function getOwnerOverview(period = "monthly"): Promise<OwnerOverview> {
  const typedPeriod: Period = (["daily", "weekly", "monthly", "yearly"] as const).includes(
    period as Period,
  )
    ? (period as Period)
    : "monthly";

  const now = Date.now();
  const days = periodDays(typedPeriod);
  const orders = getLocalOrders();
  const current = orders.filter((order) => withinDays(order.createdAt, now, days));

  const pendingOrders = current.filter(
    (order) => order.status === "pending" || order.status === "submitted_to_manager",
  );
  const approvedOrders = current.filter(
    (order) => isRevenueStatus(order.status) || order.status === "processing",
  );

  const kas = getKasData();
  const penagihan = await safe(() => Promise.resolve(getPenagihan()), []);
  const unpaidInvoices = penagihan.filter((item) => item.status === "belum_bayar");
  const unpaidValue = unpaidInvoices.reduce((sum, item) => sum + item.nilai, 0);

  const gudangItems = getGudangItems();
  const criticalStock = gudangItems.filter((item) => item.stok < item.minStok);

  const pmOrders: PMOrder[] = await safe(() => listPMOrders(), []);
  const activeProjects = pmOrders.filter((order) => order.projectStatus !== "selesai");
  const pendingDrawingAcc = pmOrders.filter((order) => order.drawingStatus === "menunggu_acc");
  const inProduction = pmOrders.filter((order) => order.projectStatus === "produksi");
  const readyToShip = pmOrders.filter((order) => order.projectStatus === "siap_kirim");
  const needsDrawing = pmOrders.filter(
    (order) => !order.hasProductionDrawing && order.projectStatus !== "selesai",
  );

  const deliveries: FieldDelivery[] = await safe(() => getFieldDeliveries(), []);
  const today = new Date(now).toISOString().slice(0, 10);
  const deliveriesToday = deliveries.filter(
    (delivery) => delivery.tanggalKirim.slice(0, 10) === today,
  );
  const readyDeliveries = deliveries.filter((delivery) => delivery.status === "siap-kirim");
  const shippingDeliveries = deliveries.filter(
    (delivery) => delivery.status === "dalam-pengiriman",
  );
  const doneDeliveries = deliveries.filter((delivery) => delivery.status === "selesai-kirim");

  const { points, totals } = buildCashflow(typedPeriod, kas.masuk, kas.keluar);

  const cards: OwnerDivisionCard[] = [
    {
      division: "marketing",
      label: "Marketing",
      icon: "campaign",
      href: "/owner/pesanan",
      headline: metric("Pesanan Masuk", current.length),
      metrics: [
        metric("Menunggu Verifikasi", pendingOrders.length),
        metric("Disetujui", approvedOrders.length),
        metric("Periode", `${days} hari`),
      ],
      attention: pendingOrders.length,
    },
    {
      division: "keuangan",
      label: "Keuangan",
      icon: "payments",
      href: "/owner/keuangan",
      headline: metric("Saldo Kas", formatRp(totals.saldo)),
      metrics: [
        metric("Pemasukan", formatRp(totals.totalMasuk)),
        metric("Pengeluaran", formatRp(totals.totalKeluar)),
        metric("Tagihan Belum Bayar", unpaidInvoices.length),
        metric("Nilai Tertunggak", formatRp(unpaidValue)),
      ],
      attention: unpaidInvoices.length,
    },
    {
      division: "gudang",
      label: "Inventory",
      icon: "inventory_2",
      href: "/owner/gudang",
      headline: metric("Jenis Barang", gudangItems.length),
      metrics: [
        metric("Stok Kritis", criticalStock.length),
        metric("Stok Aman", gudangItems.length - criticalStock.length),
        metric("Seksi Lokasi", new Set(gudangItems.map((item) => item.seksiLokasi)).size),
      ],
      attention: criticalStock.length,
    },
    {
      division: "proyek",
      label: "Proyek",
      icon: "apartment",
      href: "/owner/proyek",
      headline: metric("Proyek Aktif", activeProjects.length),
      metrics: [
        metric("Total Proyek", pmOrders.length),
        metric("Menunggu ACC Gambar", pendingDrawingAcc.length),
        metric("Selesai", pmOrders.length - activeProjects.length),
      ],
      attention: pendingDrawingAcc.length,
    },
    {
      division: "produksi",
      label: "Produksi",
      icon: "precision_manufacturing",
      href: "/owner/produksi",
      headline: metric("Dalam Produksi", inProduction.length),
      metrics: [
        metric("Siap Kirim", readyToShip.length),
        metric("Perlu Gambar Teknik", needsDrawing.length),
        metric("Total SPK", pmOrders.length),
      ],
      attention: needsDrawing.length,
    },
    {
      division: "field",
      label: "Pengiriman",
      icon: "local_shipping",
      href: "/owner/field",
      headline: metric("Pengiriman Hari Ini", deliveriesToday.length),
      metrics: [
        metric("Siap Kirim", readyDeliveries.length),
        metric("Dalam Pengiriman", shippingDeliveries.length),
        metric("Selesai", doneDeliveries.length),
      ],
      attention: readyDeliveries.length,
    },
  ];

  const attention: OwnerAttentionItem[] = [];

  pendingOrders.slice(0, 3).forEach((order) => {
    attention.push({
      id: `order-${order.id}`,
      division: "marketing",
      title: `Pesanan ${order.id}`,
      detail: `${order.customer.name} menunggu verifikasi manager`,
      href: `/owner/pesanan?focus=order-${order.id}`,
      level: "high",
    });
  });

  unpaidInvoices.slice(0, 3).forEach((item) => {
    attention.push({
      id: `tagihan-${item.id}`,
      division: "keuangan",
      title: `Tagihan ${item.id}`,
      detail: `${item.pelanggan} - ${formatRp(item.nilai)} belum dibayar`,
      href: `/owner/keuangan?focus=tagihan`,
      level: "high",
    });
  });

  pendingDrawingAcc.slice(0, 2).forEach((order) => {
    attention.push({
      id: `gambar-${order.id}`,
      division: "proyek",
      title: `ACC Gambar ${order.id}`,
      detail: `${order.contractorName} menunggu persetujuan gambar`,
      href: `/owner/proyek?focus=approval`,
      level: "high",
    });
  });

  criticalStock.slice(0, 3).forEach((item) => {
    attention.push({
      id: `stok-${item.id}`,
      division: "gudang",
      title: item.jenisBarang,
      detail: `Stok ${item.stok} ${item.satuan} di bawah minimum ${item.minStok} (${item.seksiLokasi})`,
      href: `/owner/gudang?focus=stok-kritis`,
      level: "medium",
    });
  });

  needsDrawing.slice(0, 2).forEach((order) => {
    attention.push({
      id: `spk-${order.id}`,
      division: "produksi",
      title: `SPK ${order.id}`,
      detail: `${order.contractorName} belum punya gambar teknik`,
      href: `/owner/produksi?focus=gambar`,
      level: "medium",
    });
  });

  readyDeliveries.slice(0, 2).forEach((delivery) => {
    attention.push({
      id: `kirim-${delivery.id}`,
      division: "field",
      title: delivery.id,
      detail: `${delivery.namaKontraktor} siap dikirim dari ${delivery.alamatProyek}`,
      href: `/owner/field?focus=siap-kirim`,
      level: "medium",
    });
  });

  const roleRequests = await safe(() => Promise.resolve(getRoleRequests()), []);
  roleRequests.slice(0, 2).forEach((request) => {
    attention.push({
      id: `akun-${request.id}`,
      division: "marketing",
      title: request.name,
      detail: `Pendaftaran akun ${request.requestedRole} dari ${request.department}`,
      href: `/owner/users?focus=pendaftaran`,
      level: "high",
    });
  });

  const sortedAttention = attention
    .sort((left, right) => {
      if (left.level === right.level) return 0;
      return left.level === "high" ? -1 : 1;
    })
    .slice(0, 8);

  // Registrasi, aktivitas, dan status sistem dipakai ulang dari dashboard
  // manager; includeRoleRequests = true agar "Pendaftaran Baru" ikut terisi.
  const base = await getDashboardData(typedPeriod, true);
  const registrations: Registration[] = base.registrations;
  const activities: Activity[] = base.activities;
  const systemStatus: SystemStatus = base.systemStatus;

  // Aktivitas lintas divisi: tambahkan aksi registrasi & permintaan custom di
  // atas feed order yang sudah ada, lalu urutkan kembali.
  const customActivities: Activity[] = getCustomRequests()
    .slice(0, 5)
    .map((request) => ({
      time: fmtTime(request.createdAt),
      text: `Permintaan custom dari ${request.nama}`,
      tag: request.layanan,
      highlight: false,
    }));

  const mergedActivities = [...activities, ...customActivities].slice(0, 10);

  const orderActivities: Activity[] = current.slice(0, 5).map((order) => ({
    time: fmtTime(order.createdAt),
    text: `Pesanan ${order.id} dari ${order.customer.name}`,
    tag: order.status,
    highlight: order.status === "confirmed" || order.status === "completed",
  }));

  return {
    period: typedPeriod,
    cards,
    attention: sortedAttention,
    cashflow: points,
    totals,
    registrations,
    activities: [...orderActivities, ...mergedActivities].slice(0, 10),
    systemStatus,
  };
}

/** Dipakai oleh halaman Overview untuk label periode pada grafik. */
export function ownerCashflowLabel(period: string): string {
  const labels: Record<string, string> = {
    daily: "7 hari terakhir",
    weekly: "6 minggu terakhir",
    monthly: "6 bulan terakhir",
    yearly: "6 tahun terakhir",
  };
  return labels[period] ?? labels.monthly;
}
