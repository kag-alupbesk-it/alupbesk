const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface InventoryItem {
  sku: string;
  name: string;
  variant: string;
  category: string;
  icon: string;
  stock: number;
  threshold: number;
  status: string;
}

export interface InventoryData {
  items: InventoryItem[];
  filters: string[];
}

export async function fetchInventoryData(): Promise<InventoryData> {
  // TODO: Replace with real API call
  await delay(500);
  return {
    items: [
      { sku: "AL-EXT-4040-B", name: "T-Slot Aluminum 4040", variant: "Black Anodized Finish", category: "Extrusion", icon: "precision_manufacturing", stock: 0, threshold: 800, status: "Out of Stock" },
      { sku: "RAIL-LIN-15MGN", name: "MGN15 Linear Rail", variant: "Stainless Steel 440C", category: "Hardware", icon: "linear_scale", stock: 0, threshold: 100, status: "Out of Stock" },
      { sku: "BRAK-COR-90D", name: "90° Corner Bracket", variant: "Cast Aluminum Alloy", category: "Fasteners", icon: "category", stock: 0, threshold: 500, status: "Out of Stock" },
      { sku: "FAST-M5-12SS", name: "M5 x 12mm Bolt", variant: "Button Head Hex Drive", category: "Fasteners", icon: "settings_input_component", stock: 0, threshold: 5000, status: "Out of Stock" },
    ],
    filters: ["All Items", "Extrusion", "Hardware", "Fasteners", "Electronics"],
  };
}
