export const financialCards = [
  {
    label: "Total Pendapatan",
    value: "Rp 4.25M",
    change: "+12.4%",
    positive: true,
    bars: [2, 4, 3, 5, 4],
  },
  {
    label: "Biaya Operasional",
    value: "Rp 1.12M",
    change: "-2.1%",
    positive: false,
    bars: [4, 6, 3, 2, 5],
  },
  {
    label: "Laba Bersih",
    value: "Rp 3.13M",
    change: "+8.7%",
    positive: true,
    bars: [3, 5, 6, 4, 8],
  },
];

export const registrations = [
  { name: "Andi Wijaya", dept: "Logistik & Gudang", date: "12 Okt 2024", initial: "A" },
  { name: "Siti Aminah", dept: "Keuangan", date: "11 Okt 2024", initial: "S" },
  { name: "Bambang S.", dept: "Produksi Teknis", date: "10 Okt 2024", initial: "B" },
];

export const activities = [
  {
    time: "09:45 WIB",
    text: "Admin Budi: Update harga T-Slot 4040",
    tag: "Inventory",
    highlight: true,
  },
  { time: "08:30 WIB", text: "Staf Gudang Andi: Mengeluarkan 50 unit Linear Rail" },
  { time: "07:00 WIB", text: "Sistem: Backup data selesai", system: true },
  { time: "Kemarin, 17:15", text: "Direktur: Mengunduh Laporan Keuangan Q3" },
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
  { period: "Q3 2024 Interim", revenue: "$1,450,200", profit: "$412,000", margin: "28.4%" },
  { period: "August 2024 P&L", revenue: "$485,000", profit: "$138,000", margin: "28.4%" },
  { period: "July 2024 P&L", revenue: "$462,100", profit: "$129,400", margin: "28.0%" },
];

export const expenses = [
  { label: "Logistics", value: "$661,470", pct: 60, color: "bg-secondary" },
  { label: "Production", value: "$330,735", pct: 25, color: "bg-on-surface-variant" },
  { label: "Payroll", value: "$110,245", pct: 15, color: "bg-outline" },
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
