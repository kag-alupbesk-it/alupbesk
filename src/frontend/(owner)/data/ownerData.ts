export const financialCards = [
  { label: "Total Pendapatan", value: "Rp 0", change: "0%", positive: true, bars: [0, 0, 0, 0, 0] },
  { label: "Biaya Operasional", value: "Rp 0", change: "0%", positive: true, bars: [0, 0, 0, 0, 0] },
  { label: "Laba Bersih", value: "Rp 0", change: "0%", positive: true, bars: [0, 0, 0, 0, 0] },
];

export const registrations = [
  { name: "Andi Wijaya", dept: "Logistik & Gudang", date: "12 Okt 2024", initial: "A" },
  { name: "Siti Aminah", dept: "Keuangan", date: "11 Okt 2024", initial: "S" },
  { name: "Bambang S.", dept: "Produksi Teknis", date: "10 Okt 2024", initial: "B" },
];

export const activities = [
  { time: "--:-- WIB", text: "Belum ada aktivitas", tag: "System", highlight: false, system: true },
];

export const users = [
  {
    name: "Elena Rodriguez",
    email: "e.rodriguez@alupbesk.com",
    dept: "Structural Engineering",
    role: "Owner",
    status: "ACTIVE",
    active: true,
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@alupbesk.com",
    dept: "Logistics & Supply",
    role: "Admin",
    status: "PENDING",
    active: false,
  },
  {
    name: "Sarah Jenkins",
    email: "s.jenkins@alupbesk.com",
    dept: "Precision Machining",
    role: "Staff",
    status: "ACTIVE",
    active: true,
  },
  {
    name: "Julian Weber",
    email: "j.weber@alupbesk.com",
    dept: "Quality Control",
    role: "Staff",
    status: "SUSPENDED",
    active: false,
  },
];

export const inventoryItems = [
  {
    sku: "AL-EXT-4040-B",
    name: "T-Slot Aluminum 4040",
    variant: "Black Anodized Finish",
    category: "Extrusion",
    icon: "precision_manufacturing",
    stock: 452,
    threshold: 800,
    status: "Healthy",
  },
  {
    sku: "RAIL-LIN-15MGN",
    name: "MGN15 Linear Rail",
    variant: "Stainless Steel 440C",
    category: "Hardware",
    icon: "linear_scale",
    stock: 12,
    threshold: 100,
    status: "Critical",
  },
  {
    sku: "BRAK-COR-90D",
    name: "90° Corner Bracket",
    variant: "Cast Aluminum Alloy",
    category: "Fasteners",
    icon: "category",
    stock: 0,
    threshold: 500,
    status: "Out of Stock",
  },
  {
    sku: "FAST-M5-12SS",
    name: "M5 x 12mm Bolt",
    variant: "Button Head Hex Drive",
    category: "Fasteners",
    icon: "settings_input_component",
    stock: 2400,
    threshold: 5000,
    status: "Healthy",
  },
];

export const statements = [
  { period: "Q4 2024 Interim", revenue: "$0", profit: "$0", margin: "0%" },
];

export const expenses = [
  { label: "Logistics", value: "$0", pct: 0, color: "bg-secondary" },
  { label: "Production", value: "$0", pct: 0, color: "bg-on-surface-variant" },
  { label: "Payroll", value: "$0", pct: 0, color: "bg-outline" },
];

export const suppliers = [
  { name: "Titanium Forge Ltd", grade: "Aerospace Grade", score: 98.4, bars: 4 },
  { name: "AluCast Solutions", grade: "Recycled Stock", score: 84.2, bars: 3 },
  { name: "Precision Mold Inc", grade: "Custom Tooling", score: 72.9, bars: 2 },
];

export const reportTemplates = [
  {
    icon: "inventory_2",
    title: "Inventory Audit",
    desc: "Comprehensive reconciliation of raw materials, work-in-progress, and finished goods.",
    meta: "Last Run: 2d ago",
    action: "download",
  },
  {
    icon: "account_balance",
    title: "Financial Year-End",
    desc: "P&L summary, tax liabilities, and departmental budget utilization for fiscal 2024.",
    meta: "Scheduled: Dec 31",
    action: "print",
    filled: true,
  },
  {
    icon: "history_edu",
    title: "Operational Log",
    desc: "Machine uptime reports, maintenance schedules, and incident logs per facility.",
    meta: "Live Sync: Active",
    action: "share",
    live: true,
  },
];

export const systemEvents = [
  { id: "EVT-9028-X", origin: "Milling Unit A", desc: "Batch completion successful. 402 units processed.", time: "14:02:11", error: false },
  { id: "EVT-9029-X", origin: "Quality Control", desc: "Surface finish deviation < 0.01mm. Grade A+ certification.", time: "14:05:45", error: false },
  { id: "EVT-9030-X", origin: "Logistics Hub", desc: "Refueling required for automated transporters.", time: "14:10:02", error: true },
];
