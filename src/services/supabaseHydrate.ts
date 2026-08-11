import { db, enqueueUpsert, supabaseEnabled } from "./supabase";
import { products, type Product, type ProductVariant } from "./catalog/products";
import { writeOrder } from "./orders/orderStore";
import type { LocalOrder, OrderLine } from "./orders/types";
import { gudangItems } from "../backend/modules/gudang/items/store";
import type { GudangItem } from "../backend/modules/gudang/items/types";
import { gudangMovements } from "../backend/modules/gudang/movements/store";
import type { GudangMovement } from "../backend/modules/gudang/movements/types";
import { projectOrders } from "../backend/modules/gudang/projectOrders/store";
import type { ProjectOrder, ProjectOrderItem } from "../backend/modules/gudang/projectOrders/types";
import { customRequests } from "../backend/modules/custom/requests/store";
import type { CustomRequest } from "../backend/modules/custom/requests/types";
import { kasEntries, seedKasEntries } from "../backend/modules/keuangan/kas/store";
import { syncKasDariPesanan } from "../backend/modules/keuangan/kas/sync";
import { pembayaran } from "../backend/modules/keuangan/penagihan/store";
import { marketingBanners } from "../backend/modules/marketing/banners/store";
import type { MarketingBanner } from "../backend/modules/marketing/types";

let hydrated: Promise<void> | null = null;

// ---------------------------------------------------------------------
// Mapper: row DB (snake_case) <-> objek domain (camelCase)
// ---------------------------------------------------------------------

type ProductRow = {
  id: number;
  sku: string;
  badge: string | null;
  badge_bg: string | null;
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
    badge: row.badge ?? "",
    badgeBg: row.badge_bg ?? "bg-success",
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

function productToRow(product: Product): Record<string, unknown> {
  return {
    id: product.id,
    sku: product.sku,
    badge: product.badge,
    badge_bg: product.badgeBg,
    category: product.category,
    title: product.title,
    description: product.desc,
    price: product.price,
    stock: product.stock,
    img: product.img,
    datasheet: product.datasheet ?? null,
    best_seller: product.bestSeller ?? false,
    sold_count: product.soldCount ?? 0,
    highlights: product.highlights ?? [],
    specs: product.specs ?? [],
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

function gudangItemToRow(item: GudangItem): Record<string, unknown> {
  return {
    id: item.id,
    sku: item.sku,
    jenis_barang: item.jenisBarang,
    kategori_barang: item.kategoriBarang,
    satuan: item.satuan,
    merek: item.merek,
    warna: item.warna,
    seksi_lokasi: item.seksiLokasi,
    stok: item.stok,
    min_stok: item.minStok,
    proyek: item.proyek ?? null,
    catatan: item.catatan ?? null,
  };
}

function projectOrderToRow(order: ProjectOrder): Record<string, unknown> {
  return {
    id: order.id,
    request_id: order.requestId ?? null,
    nama_proyek: order.namaProyek,
    pelanggan: order.pelanggan,
    perusahaan: order.perusahaan ?? null,
    telepon: order.telepon ?? null,
    catatan: order.catatan ?? null,
    total_quantity: order.totalQuantity,
    status: order.status,
    processed_at: order.processedAt ?? null,
    completed_at: order.completedAt ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function projectOrderItemToRow(orderId: string, item: ProjectOrderItem): Record<string, unknown> {
  return {
    project_order_id: orderId,
    gudang_item_id: item.gudangItemId,
    sku: item.sku,
    jenis_barang: item.jenisBarang,
    merek: item.merek ?? null,
    warna: item.warna ?? null,
    satuan: item.satuan ?? null,
    quantity: item.quantity,
  };
}

// ---------------------------------------------------------------------
// Hydrasi per entitas
// ---------------------------------------------------------------------

async function hydrateProducts(): Promise<void> {
  if (!db) return;
  const { data: rows } = await db.from("products").select("*").order("id");
  const { data: variantRows } = await db
    .from("product_variants")
    .select("product_id, name, options, colors");

  const variantsByProduct = new Map<number, ProductVariant[]>();
  for (const v of variantRows ?? []) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push({
      name: v.name,
      options: Array.isArray(v.options) ? v.options.map(String) : [],
      colors: Array.isArray(v.colors) ? (v.colors as string[]) : undefined,
    });
    variantsByProduct.set(v.product_id, list);
  }

  if (!rows || rows.length === 0) {
    for (const product of products) {
      enqueueUpsert("products", productToRow(product), "id");
      for (const variant of product.variants ?? []) {
        enqueueUpsert(
          "product_variants",
          { product_id: product.id, name: variant.name, options: variant.options, colors: variant.colors ?? null },
        );
      }
    }
    return;
  }

  const mapped = rows.map((row) => toProduct(row, variantsByProduct.get(row.id) ?? []));
  products.splice(0, products.length, ...mapped);
}

async function hydrateOrders(): Promise<void> {
  if (!db) return;
  const { data: orderRows } = await db.from("orders").select("*");
  const { data: lineRows } = await db
    .from("order_lines")
    .select("order_id, product_id, quantity, variants, note, title, unit_price, subtotal");

  const linesByOrder = new Map<string, OrderLineRow[]>();
  for (const line of lineRows ?? []) {
    const list = linesByOrder.get(line.order_id) ?? [];
    list.push(line);
    linesByOrder.set(line.order_id, list);
  }

  for (const row of orderRows ?? []) {
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
    };
    writeOrder(order);
  }
}

async function hydrateGudang(): Promise<void> {
  if (!db) return;

  const { data: itemRows } = await db.from("gudang_items").select("*");
  if (itemRows && itemRows.length > 0) {
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
  } else {
    for (const item of gudangItems.values()) {
      enqueueUpsert("gudang_items", gudangItemToRow(item), "id");
    }
  }

  const { data: movementRows } = await db.from("gudang_movements").select("*");
  gudangMovements.clear();
  for (const row of movementRows ?? []) {
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

async function hydrateProjectOrders(): Promise<void> {
  if (!db) return;
  const { data: orderRows } = await db.from("project_orders").select("*");
  const { data: itemRows } = await db
    .from("project_order_items")
    .select("project_order_id, gudang_item_id, sku, jenis_barang, merek, warna, satuan, quantity");

  const itemsByOrder = new Map<string, ProjectOrderItem[]>();
  for (const row of itemRows ?? []) {
    const list = itemsByOrder.get(row.project_order_id) ?? [];
    list.push({
      gudangItemId: row.gudang_item_id,
      sku: row.sku,
      jenisBarang: row.jenis_barang,
      merek: row.merek ?? "",
      warna: row.warna ?? "",
      satuan: row.satuan ?? "",
      quantity: row.quantity,
    });
    itemsByOrder.set(row.project_order_id, list);
  }

  if (orderRows && orderRows.length > 0) {
    projectOrders.clear();
    for (const row of orderRows) {
      const order: ProjectOrder = {
        id: row.id,
        requestId: row.request_id ?? undefined,
        namaProyek: row.nama_proyek,
        pelanggan: row.pelanggan,
        perusahaan: row.perusahaan ?? undefined,
        telepon: row.telepon ?? undefined,
        catatan: row.catatan ?? undefined,
        items: itemsByOrder.get(row.id) ?? [],
        totalQuantity: row.total_quantity,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        processedAt: row.processed_at ?? undefined,
        completedAt: row.completed_at ?? undefined,
      };
      projectOrders.set(order.id, order);
    }
  } else {
    for (const order of projectOrders.values()) {
      enqueueUpsert("project_orders", projectOrderToRow(order), "id");
      for (const item of order.items) {
        enqueueUpsert("project_order_items", projectOrderItemToRow(order.id, item));
      }
    }
  }
}

async function hydrateCustomRequests(): Promise<void> {
  if (!db) return;
  const { data: rows } = await db.from("custom_requests").select("*");
  customRequests.clear();
  for (const row of rows ?? []) {
    const request: CustomRequest = {
      id: row.id,
      nama: row.nama,
      perusahaan: row.perusahaan ?? undefined,
      email: row.email ?? undefined,
      telp: row.telp,
      layanan: row.layanan,
      deskripsi: row.deskripsi,
      dimensi: row.dimensi ?? undefined,
      kuantitas: row.kuantitas ?? undefined,
      deadline: row.deadline ?? undefined,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    customRequests.set(request.id, request);
  }
}

async function hydrateKas(): Promise<void> {
  if (!db) return;
  const { data: rows } = await db.from("kas_entries").select("*");
  kasEntries.clear();
  for (const row of rows ?? []) {
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
  if (rows && rows.length > 0) return;
  seedKasEntries();
  syncKasDariPesanan();
}

async function hydratePenagihan(): Promise<void> {
  if (!db) return;
  const { data: rows } = await db.from("penagihan").select("order_id, status");
  pembayaran.clear();
  for (const row of rows ?? []) {
    pembayaran.set(row.order_id, row.status);
  }
}

async function hydrateBanners(): Promise<void> {
  if (!db) return;
  const { data: rows } = await db.from("marketing_banners").select("*");
  marketingBanners.clear();
  for (const row of rows ?? []) {
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

// ---------------------------------------------------------------------
// Hydrasi utama: dipanggil sekali di awal setiap request API.
// ---------------------------------------------------------------------
export function ensureHydrated(): Promise<void> {
  if (!supabaseEnabled) return Promise.resolve();
  if (!hydrated) {
    hydrated = (async () => {
      try {
        await hydrateProducts();
        await hydrateOrders();
        await hydrateGudang();
        await hydrateProjectOrders();
        await hydrateCustomRequests();
        await hydrateKas();
        await hydratePenagihan();
        await hydrateBanners();
      } catch (error) {
        console.error("[supabase] gagal hydrate data:", error);
      }
    })();
  }
  return hydrated;
}
