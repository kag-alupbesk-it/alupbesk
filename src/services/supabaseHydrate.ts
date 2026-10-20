import { db, supabaseEnabled } from "./supabase";
import { consumeHydrationStale } from "./hydrationInvalidation";
import { products, type Product, type ProductVariant } from "./catalog/products";
import { replaceOrders } from "./orders/orderStore";
import type { LocalOrder, OrderLine } from "./orders/types";
import { gudangItems } from "../backend/modules/gudang/items/store";
import type { GudangItem } from "../backend/modules/gudang/items/types";
import { gudangMovements } from "../backend/modules/gudang/movements/store";
import type { GudangMovement } from "../backend/modules/gudang/movements/types";
import { customRequests } from "../backend/modules/custom/requests/store";
import type { CustomRequest, CustomRequestItem } from "../backend/modules/custom/requests/types";
import { kasEntries } from "../backend/modules/keuangan/kas/store";
import { syncKasDariPesanan } from "../backend/modules/keuangan/kas/sync";
import { marketingBanners } from "../backend/modules/marketing/banners/store";
import type { MarketingBanner } from "../backend/modules/marketing/types";
import { partners } from "../backend/modules/content/partners/store";
import type { Partner } from "../backend/modules/content/types";
import { customServices } from "../backend/modules/content/services/store";
import { siteContent } from "../backend/modules/content/sitecontent/store";
import { portfolioItems, caseStudies } from "./portfolio/store";
import type { PortfolioItem, CaseStudy } from "./portfolio/data";
import { replaceAuditLogs, type AuditAction } from "../backend/modules/audit/auditStore";
import {
  gudangCategories,
  seedDefaultCategories,
  DEFAULT_CATEGORIES,
} from "../backend/modules/gudangInventory/categories/store";
import { gudangInventoryItems } from "../backend/modules/gudangInventory/items/store";
import {
  gudangInTransactions,
  gudangOutTransactions,
} from "../backend/modules/gudangInventory/transactions/store";
import { productionRequests } from "../backend/modules/gudangInventory/productionRequests/store";
import type { ProductionRequestItem } from "../backend/modules/gudangInventory/productionRequests/types";
import { gudangMaterialLots } from "../backend/modules/gudangInventory/lots/store";
import { pmCutLists } from "../backend/modules/pm/cutting/store";
import type {
  PMCutAllocation,
  PMCutListItem,
} from "../backend/modules/pm/cutting/types";

let hydrated: Promise<void> | null = null;
let hydratedAt = 0;
let refreshing = false;
const HYDRATION_TTL_MS = 3_000;

type SelectResult<Row> = {
  data: Row[] | null;
  error: { message: string } | null;
};

async function readRows<Row>(
  query: PromiseLike<SelectResult<Row>>,
): Promise<Row[]> {
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------
// Mapper: row DB (snake_case) <-> objek domain (camelCase)
// ---------------------------------------------------------------------

type ProductRow = {
  id: number;
  sku: string;
  category: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  img: string | null;
  datasheet: string | null;
  best_seller: boolean | null;
  sold_count: number | null;
  highlights: unknown;
  specs: unknown;
};

function toProduct(row: ProductRow, variants: ProductVariant[]): Product {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    desc: row.description ?? "",
    price: Number(row.price),
    stock: row.stock,
    img: row.img ?? "",
    sku: row.sku,
    highlights: Array.isArray(row.highlights) ? row.highlights.map(String) : [],
    specs: Array.isArray(row.specs)
      ? (row.specs as { label: string; value: string }[])
      : [],
    variants: variants.length ? variants : undefined,
    datasheet: row.datasheet ?? undefined,
    bestSeller: row.best_seller ?? false,
    soldCount: row.sold_count ?? 0,
  };
}

type OrderLineRow = {
  product_id: number;
  quantity: number;
  variants: unknown;
  note: string | null;
  title: string;
  unit_price: number;
  subtotal: number;
};

// ---------------------------------------------------------------------
// Hydrasi per entitas
// ---------------------------------------------------------------------

async function hydrateProducts(): Promise<void> {
  if (!db) return;
  const rows = await readRows(db.from("products").select("*").order("id"));
  const variantRows = await readRows(
    db.from("product_variants").select("product_id, name, options, colors"),
  );

  const variantsByProduct = new Map<number, ProductVariant[]>();
  for (const v of variantRows) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push({
      name: v.name,
      options: Array.isArray(v.options) ? v.options.map(String) : [],
      colors: Array.isArray(v.colors) ? (v.colors as string[]) : undefined,
    });
    variantsByProduct.set(v.product_id, list);
  }

  if (rows.length === 0) {
    products.splice(0, products.length);
    return;
  }

  const mapped = rows.map((row) => toProduct(row, variantsByProduct.get(row.id) ?? []));
  products.splice(0, products.length, ...mapped);
}

async function hydrateOrders(): Promise<void> {
  if (!db) return;
  const orderRows = await readRows(db.from("orders").select("*"));
  const lineRows = await readRows(
    db
      .from("order_lines")
      .select("order_id, product_id, quantity, variants, note, title, unit_price, subtotal"),
  );

  const linesByOrder = new Map<string, OrderLineRow[]>();
  for (const line of lineRows) {
    const list = linesByOrder.get(line.order_id) ?? [];
    list.push(line);
    linesByOrder.set(line.order_id, list);
  }

  const hydratedOrders: LocalOrder[] = [];
  for (const row of orderRows) {
    const lines = (linesByOrder.get(row.id) ?? []).map<OrderLine>((line) => ({
      productId: line.product_id,
      quantity: line.quantity,
      variants: line.variants ? (line.variants as Record<string, string>) : undefined,
      note: line.note ?? undefined,
      title: line.title,
      unitPrice: Number(line.unit_price),
      subtotal: Number(line.subtotal),
    }));
    const order: LocalOrder = {
      id: row.id,
      status: row.status as LocalOrder["status"],
      customer: {
        name: row.customer_name,
        phone: row.customer_phone,
        email: row.customer_email ?? undefined,
        address: row.customer_address,
        note: row.customer_note ?? undefined,
      },
      items: lines,
      total: Number(row.total),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      managerDecisionAt: row.manager_decision_at ?? undefined,
      managerRejectionReason: row.manager_rejection_reason ?? undefined,
      marketingConfirmedAt: row.marketing_confirmed_at ?? undefined,
      submittedToManagerAt: row.submitted_to_manager_at ?? undefined,
      processedAt: row.processed_at ?? undefined,
    };
    hydratedOrders.push(order);
  }
  replaceOrders(hydratedOrders);
}

async function hydrateGudang(): Promise<void> {
  if (!db) return;

  const itemRows = await readRows(db.from("gudang_items").select("*"));
  gudangItems.clear();
  for (const row of itemRows) {
    const item: GudangItem = {
      id: row.id,
      sku: row.sku,
      jenisBarang: row.jenis_barang,
      kategoriBarang: row.kategori_barang,
      satuan: row.satuan,
      merek: row.merek,
      warna: row.warna ?? "",
      seksiLokasi: row.seksi_lokasi ?? "",
      stok: Number(row.stok),
      minStok: Number(row.min_stok),
      proyek: row.proyek ?? undefined,
      catatan: row.catatan ?? undefined,
    };
    gudangItems.set(item.id, item);
  }

  const movementRows = await readRows(db.from("gudang_movements").select("*"));
  gudangMovements.clear();
  for (const row of movementRows) {
    const movement: GudangMovement = {
      id: row.id,
      itemId: row.item_id,
      tipe: row.tipe,
      jumlah: Number(row.jumlah),
      tanggal: row.tanggal,
      createdAt: row.created_at,
      sumber: row.sumber ?? undefined,
      buktiNota: row.bukti_nota ?? undefined,
      tujuan: row.tujuan ?? undefined,
      penerima: row.penerima ?? undefined,
      catatan: row.catatan ?? undefined,
      stokSebelum: Number(row.stok_sebelum),
      stokSesudah: Number(row.stok_sesudah),
    };
    gudangMovements.set(movement.id, movement);
  }
}

// Toleran terhadap tabel yang belum ada: modul lain tidak boleh gagal hydrate
// hanya karena migrasi gudang inventaris belum dijalankan.
async function hydrateGudangInventory(): Promise<void> {
  if (!db) return;

  try {
    await hydrateGudangInventoryTables();
  } catch (error) {
    console.error("[supabase] gagal hydrate gudang inventaris:", error);
  }
}

async function hydrateGudangInventoryTables(): Promise<void> {
  if (!db) return;

  const categoryRows = await readRows(db.from("gudang_categories").select("*"));
  gudangCategories.clear();
  for (const row of categoryRows) {
    gudangCategories.set(row.id, {
      id: row.id,
      name: row.name,
      createdAt: row.created_at ?? "",
    });
  }
  if (categoryRows.length === 0) {
    if (db) {
      await db.from("gudang_categories").upsert(
        DEFAULT_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
        { onConflict: "id" },
      );
    }
    const now = new Date().toISOString();
    for (const c of DEFAULT_CATEGORIES) {
      gudangCategories.set(c.id, { ...c, createdAt: now });
    }
  }

  const itemRows = await readRows(db.from("gudang_inventory_items").select("*"));
  gudangInventoryItems.clear();
  for (const row of itemRows) {
    gudangInventoryItems.set(row.id, {
      id: row.id,
      categoryId: row.category_id,
      itemName: row.item_name,
      brand: row.brand ?? "",
      modelNo: row.model_no ?? "",
      color: row.color ?? "",
      rackGroup: row.rack_group ?? "",
      subRow: row.sub_row ?? "",
      currentStock: Number(row.current_stock),
      unit: row.unit ?? "pcs",
      materialKind: row.material_kind ?? "unit",
       lengthPerUnit: row.length_per_unit === null ? null : Number(row.length_per_unit),
       widthPerUnit: row.width_per_unit === null ? null : Number(row.width_per_unit),
       weightPerUnit: row.weight_per_unit === null ? null : Number(row.weight_per_unit),
       thickness: row.thickness === null ? null : Number(row.thickness),
       glassType: row.glass_type ?? null,
       createdAt: row.created_at ?? "",
       updatedAt: row.updated_at ?? "",
     });
   }

  const inRows = await readRows(db.from("gudang_in_transactions").select("*"));
  gudangInTransactions.clear();
  for (const row of inRows) {
    gudangInTransactions.set(row.id, {
      id: row.id,
      transactionDate: row.transaction_date,
      categoryId: row.category_id,
      itemId: row.item_id,
      quantity: Number(row.quantity),
      createdBy: row.created_by ?? "",
      createdAt: row.created_at ?? "",
    });
  }

  const outRows = await readRows(db.from("gudang_out_transactions").select("*"));
  gudangOutTransactions.clear();
  for (const row of outRows) {
    gudangOutTransactions.set(row.id, {
      id: row.id,
      transactionDate: row.transaction_date,
      categoryId: row.category_id,
      itemId: row.item_id,
      projectId: row.project_id ?? null,
      projectName: row.project_name ?? "",
      source: row.source === "produksi" ? "produksi" : "manual",
      quantity: Number(row.quantity),
      createdBy: row.created_by ?? "",
      createdAt: row.created_at ?? "",
    });
  }

  const requestRows = await readRows(
    db.from("gudang_production_requests").select("*"),
  );
  const requestItemRows = await readRows(
    db.from("gudang_production_request_items").select("*"),
  );
  const requestItemsByRequest = new Map<string, ProductionRequestItem[]>();
  for (const row of requestItemRows) {
    const list = requestItemsByRequest.get(row.request_id) ?? [];
    list.push({
      id: row.id,
      itemId: row.item_id ?? null,
      categoryId: row.category_id ?? "",
      categoryName: row.category_name ?? "",
      itemName: row.item_name ?? "",
      modelNo: row.model_no ?? "",
      brand: row.brand ?? "",
      color: row.color ?? "",
      rackGroup: row.rack_group ?? "",
      subRow: row.sub_row ?? "",
      quantity: Number(row.quantity),
    });
    requestItemsByRequest.set(row.request_id, list);
  }
  productionRequests.clear();
  for (const row of requestRows) {
    productionRequests.set(row.id, {
      id: row.id,
      requestDate: row.request_date,
      spkRef: row.spk_ref ?? "",
      spkLabel: row.spk_label ?? "",
      requesterName: row.requester_name ?? "",
      note: row.note ?? "",
      status: row.status ?? "diajukan",
      approvedBy: row.approved_by ?? undefined,
      approvedAt: row.approved_at ?? undefined,
      rejectReason: row.reject_reason ?? undefined,
      items: requestItemsByRequest.get(row.id) ?? [],
      createdAt: row.created_at ?? "",
      updatedAt: row.updated_at ?? "",
    });
  }
}

// Toleran terhadap tabel yang belum ada: modul lain tidak boleh gagal hydrate
// hanya karena migrasi lot/cutting belum dijalankan.
async function hydrateGudangMaterialLots(): Promise<void> {
  if (!db) return;
  try {
    const rows = await readRows(db.from("gudang_material_lots").select("*"));
    gudangMaterialLots.clear();
    for (const row of rows) {
      gudangMaterialLots.set(row.id, {
        id: row.id,
        itemId: row.item_id,
        lotCode: row.lot_code ?? "",
        receivedDate: row.received_date,
        inTransactionId: row.in_transaction_id ?? null,
         length: row.length === null ? null : Number(row.length),
         width: row.width === null ? null : Number(row.width),
         thickness: row.thickness === null ? null : Number(row.thickness),
         glassType: row.glass_type ?? null,
         quantity: Number(row.quantity),
         rackGroup: row.rack_group ?? "",
        subRow: row.sub_row ?? "",
        status: row.status ?? "tersedia",
        note: row.note ?? "",
        createdAt: row.created_at ?? "",
        updatedAt: row.updated_at ?? "",
      });
    }
  } catch (error) {
    console.error("[supabase] gagal hydrate lot bahan:", error);
  }
}

async function hydratePMCutLists(): Promise<void> {
  if (!db) return;
  try {
    const listRows = await readRows(db.from("pm_cut_lists").select("*"));
    const itemRows = await readRows(db.from("pm_cut_list_items").select("*"));
    const allocRows = await readRows(db.from("pm_cut_allocations").select("*"));

    const allocsByItem = new Map<string, PMCutAllocation[]>();
    for (const row of allocRows) {
      const list = allocsByItem.get(row.cut_list_item_id) ?? [];
      list.push({
        id: row.id,
        cutListItemId: row.cut_list_item_id,
        lotId: row.lot_id ?? null,
        quantity: Number(row.quantity),
        lengthUsed: row.length_used === null ? null : Number(row.length_used),
        widthUsed: row.width_used === null ? null : Number(row.width_used),
        leftoverLength:
          row.leftover_length === null ? null : Number(row.leftover_length),
        leftoverWidth:
          row.leftover_width === null ? null : Number(row.leftover_width),
        leftoverStatus: row.leftover_status === "scrap" ? "scrap" : "reusable",
        createdAt: row.created_at ?? "",
      });
      allocsByItem.set(row.cut_list_item_id, list);
    }

    const itemsByList = new Map<string, PMCutListItem[]>();
    for (const row of itemRows) {
      const list = itemsByList.get(row.cut_list_id) ?? [];
      list.push({
        id: row.id,
        cutListId: row.cut_list_id,
        componentName: row.component_name,
        quantity: Number(row.quantity),
        length: row.length === null ? null : Number(row.length),
        width: row.width === null ? null : Number(row.width),
        thickness: row.thickness === null ? null : Number(row.thickness),
        glassType: row.glass_type ?? null,
        materialItemId: row.material_item_id ?? null,
        note: row.note ?? "",
        sortOrder: Number(row.sort_order ?? 0),
        allocations: (allocsByItem.get(row.id) ?? []).sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        ),
      });
      itemsByList.set(row.cut_list_id, list);
    }

    pmCutLists.clear();
    for (const row of listRows) {
      pmCutLists.set(row.id, {
        id: row.id,
        orderId: row.order_id,
        title: row.title ?? "",
        note: row.note ?? "",
        status: row.status ?? "draft",
        createdBy: row.created_by ?? "",
        items: (itemsByList.get(row.id) ?? []).sort(
          (a, b) => a.sortOrder - b.sortOrder,
        ),
        createdAt: row.created_at ?? "",
        updatedAt: row.updated_at ?? "",
      });
    }
  } catch (error) {
    console.error("[supabase] gagal hydrate cutting list:", error);
  }
}

async function hydrateCustomRequests(): Promise<void> {
  if (!db) return;
  const rows = await readRows(db.from("custom_requests").select("*"));
  const itemRows = await readRows(
    db.from("custom_request_items").select("*"),
  );
  const itemsByRequest = new Map<string, CustomRequestItem[]>();
  for (const row of itemRows) {
    const list = itemsByRequest.get(row.request_id) ?? [];
    list.push({
      id: row.id,
      name: row.name ?? "",
      quantity: Number(row.quantity),
      unit: row.unit ?? "pcs",
      technicalNote: row.technical_note ?? "",
      sortOrder: Number(row.sort_order ?? 0),
    });
    itemsByRequest.set(row.request_id, list);
  }
  customRequests.clear();
  for (const row of rows) {
    const request: CustomRequest = {
      id: row.id,
      nama: row.nama,
      kode: row.kode ?? undefined,
      perusahaan: row.perusahaan ?? undefined,
      email: row.email ?? undefined,
       telp: row.telp,
       projectAddress: row.project_address ?? undefined,
       provinsi: row.provinsi ?? undefined,
       kabupaten: row.kabupaten ?? undefined,
       layanan: row.layanan,
      deskripsi: row.deskripsi,
      deadline: row.deadline ?? undefined,
      rawImage: row.raw_image ?? undefined,
      rawImageName: row.raw_image_name ?? undefined,
      source: row.source === "MANUAL" ? "MANUAL" : "WEBSITE_JASA_CUSTOM",
      status: row.status,
      items: itemsByRequest.get(row.id) ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    customRequests.set(request.id, request);
  }
}

async function hydrateKas(): Promise<void> {
  if (!db) return;
  const rows = await readRows(db.from("kas_entries").select("*"));
  kasEntries.clear();
  for (const row of rows) {
    kasEntries.set(row.id, {
      id: row.id,
      tipe: row.tipe,
      sumber: row.sumber,
      deskripsi: row.deskripsi,
      jumlah: Number(row.jumlah),
      kategori: row.kategori,
      tanggal: row.tanggal,
      createdAt: row.created_at,
    });
  }
  if (rows.length > 0) return;
  syncKasDariPesanan();
}

async function hydrateBanners(): Promise<void> {
  if (!db) return;
  const rows = await readRows(db.from("marketing_banners").select("*"));
  marketingBanners.clear();
  for (const row of rows) {
    const banner: MarketingBanner = {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      imageUrl: row.image_url,
      linkUrl: row.link_url ?? undefined,
      active: row.active,
      order: row.sort_order,
      startDate: row.start_date ?? undefined,
      endDate: row.end_date ?? undefined,
      createdAt: row.created_at,
    };
    marketingBanners.set(banner.id, banner);
  }
}

async function hydratePartners(): Promise<void> {
  if (!db) return;
  const rows = await readRows(db.from("partners").select("*"));
  partners.clear();
  for (const row of rows) {
    const partner: Partner = {
      id: row.id,
      name: row.name,
      initials: row.initials,
      logoUrl: row.logo_url ?? undefined,
      sortOrder: row.sort_order,
      active: row.active,
      createdAt: row.created_at,
    };
    partners.set(partner.id, partner);
  }
}

async function hydrateCustomServices(): Promise<void> {
  if (!db) return;
  const rows = await readRows(db.from("custom_services").select("*"));
  customServices.clear();
  for (const row of rows) {
    customServices.set(row.id, {
      id: row.id,
      icon: row.icon,
      title: row.title,
      description: row.description,
      sortOrder: row.sort_order,
      active: row.active,
      createdAt: row.created_at,
    });
  }
}

async function hydrateSiteContent(): Promise<void> {
  if (!db) return;
  const rows = await readRows(
    db.from("site_content").select("key, value, updated_at"),
  );
  siteContent.clear();
  for (const row of rows) {
    siteContent.set(row.key, {
      key: row.key,
      value: row.value as Record<string, unknown>,
      updatedAt: row.updated_at,
    });
  }
}

async function hydratePortfolio(): Promise<void> {
  if (!db) return;
  const itemRows = await readRows(db.from("portfolio_items").select("*"));
  const caseRows = await readRows(db.from("case_studies").select("*"));

  portfolioItems.clear();
  for (const row of itemRows) {
    const item: PortfolioItem = {
      id: row.id,
      client: row.client,
      industry: row.industry,
      title: row.title,
      challenge: row.challenge,
      solution: row.solution,
      result: row.result,
      img: row.img ?? "",
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
      year: row.year ?? 0,
    };
    portfolioItems.set(item.id, item);
  }

  caseStudies.clear();
  for (const row of caseRows) {
    const study: CaseStudy = {
      id: row.id,
      client: row.client,
      logo: row.logo ?? "",
      industry: row.industry,
      title: row.title,
      desc: row.description ?? "",
      metrics: Array.isArray(row.metrics) ? (row.metrics as { label: string; value: string }[]) : [],
      img: row.img ?? "",
      year: row.year ?? 0,
    };
    caseStudies.set(study.id, study);
  }
}

async function hydrateAuditLogs(): Promise<void> {
  if (!db) return;
  const rows = await readRows(
    db
      .from("audit_logs")
      .select("id, timestamp, user_email, user_name, role, action, target, details")
      .order("timestamp", { ascending: false })
      .limit(1000),
  );
  replaceAuditLogs(
    rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      userEmail: row.user_email ?? "",
      userName: row.user_name ?? "",
      role: row.role ?? "",
      action: row.action as AuditAction,
      target: row.target ?? "",
      details: row.details ?? "",
    })),
  );
}

// ---------------------------------------------------------------------
// Hydrasi utama: dipanggil sekali di awal setiap request API.
// ---------------------------------------------------------------------
export function ensureHydrated(): Promise<void> {
  if (!supabaseEnabled) return Promise.resolve();
  const stale = consumeHydrationStale();
  if (!hydrated || ((Date.now() - hydratedAt >= HYDRATION_TTL_MS || stale) && !refreshing)) {
    refreshing = true;
    hydrated = (async () => {
      try {
        await Promise.all([
          hydrateProducts(),
          hydrateOrders(),
          hydrateGudang(),
          hydrateGudangInventory(),
          hydrateGudangMaterialLots(),
          hydratePMCutLists(),
          hydrateCustomRequests(),
          hydrateBanners(),
          hydratePartners(),
          hydrateCustomServices(),
          hydrateSiteContent(),
          hydratePortfolio(),
          hydrateAuditLogs(),
        ]);
        // hydrateKas bergantung pada data pesanan (syncKasDariPesanan), jadi
        // dijalankan setelah batch paralel selesai.
        await hydrateKas();
        hydratedAt = Date.now();
      } catch (error) {
        console.error("[supabase] gagal hydrate data:", error);
        // Cache failures briefly too: a missing table must not trigger a full
        // round of database queries on every API request.
        hydratedAt = Date.now();
      } finally {
        refreshing = false;
      }
    })();
  }
  return hydrated;
}
