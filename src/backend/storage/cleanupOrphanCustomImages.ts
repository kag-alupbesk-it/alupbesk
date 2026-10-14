import { db } from "@/services/supabase";

const BUCKET = "images";
const PREFIX = "custom";
const PAGE_SIZE = 500;
const MIN_AGE_MS = 24 * 60 * 60 * 1000;

function storagePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null;
  if (publicUrl.startsWith(`${PREFIX}/`)) return publicUrl;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index < 0) return null;
  try {
    return decodeURIComponent(publicUrl.slice(index + marker.length));
  } catch {
    return null;
  }
}

export async function cleanupOrphanCustomImages(now = Date.now()): Promise<number> {
  if (!db) throw new Error("DATABASE_UNAVAILABLE");

  const [requests, orders] = await Promise.all([
    db.from("custom_requests").select("raw_image").not("raw_image", "is", null),
    db.from("pm_orders").select("raw_image").not("raw_image", "is", null),
  ]);
  if (requests.error) throw requests.error;
  if (orders.error) throw orders.error;
  const referenced = new Set(
    [...(requests.data ?? []), ...(orders.data ?? [])]
      .map((row) => storagePath(row.raw_image))
      .filter((path): path is string => Boolean(path)),
  );

  const storage = db.storage.from(BUCKET);
  const files: { name: string; createdAt: number }[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await storage.list(PREFIX, {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "created_at", order: "asc" },
    });
    if (error) throw error;
    const page = data ?? [];
    for (const entry of page) {
      if (!entry.id || !entry.name || !entry.created_at) continue;
      const createdAt = Date.parse(entry.created_at);
      if (Number.isFinite(createdAt)) files.push({ name: entry.name, createdAt });
    }
    if (page.length < PAGE_SIZE) break;
  }

  const candidates = files
    .filter(({ name, createdAt }) => now - createdAt >= MIN_AGE_MS && !referenced.has(`${PREFIX}/${name}`))
    .map(({ name }) => `${PREFIX}/${name}`);
  for (let index = 0; index < candidates.length; index += 100) {
    const { error } = await storage.remove(candidates.slice(index, index + 100));
    if (error) throw error;
  }
  return candidates.length;
}
