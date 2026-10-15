export type AppRole =
  | "pelanggan"
  | "marketing"
  | "gudang"
  | "keuangan"
  | "proyek"
  | "field"
  | "produksi"
  | "manager"
  | "owner";

function matchesPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Modul divisi tempat Owner hanya boleh memantau (read-only).
const DIVISION_ROOTS = ["keuangan", "gudang", "marketing", "pm", "produksi", "field"];

function isDivisionPath(path: string): boolean {
  return DIVISION_ROOTS.some(
    (root) =>
      matchesPath(path, `/${root}`) || matchesPath(path, `/api/${root}`),
  );
}

/**
 * Owner bersifat pemantau: dilarang menulis di modul divisi, mengunggah file,
 * maupun menyunting konten. Fitur milik Owner sendiri (`/api/owner`,
 * `/api/admin`, `/api/push`, `/api/auth`) tetap diizinkan agar Owner masih bisa
 * mengelola user dan berlangganan notifikasi.
 */
function ownerReadOnly(role: string, pathname: string, method: string): boolean {
  if (role !== "owner" || READ_ONLY_METHODS.has(method.toUpperCase())) return false;
  return (
    isDivisionPath(pathname) ||
    // Modul "Pesanan Masuk" Owner bersifat pemantau: baca saja, tanpa mutasi.
    matchesPath(pathname, "/api/owner/orders") ||
    // Request custom juga pemantauan: Owner tidak mengubah status.
    matchesPath(pathname, "/api/custom") ||
    // Endpoint manager: keputusan order & CRUD user. Owner punya kanal sendiri
    // (`/api/owner/users`, `/api/owner/role-requests`), jadi tulisan di sini ditutup.
    matchesPath(pathname, "/api/manager") ||
    matchesPath(pathname, "/api/upload") ||
    matchesPath(pathname, "/api/content")
  );
}

export function roleCanAccess(
  role: AppRole,
  pathname: string,
  method = "GET",
): boolean {
  const adminRolePath = pathname.match(
    /^\/admin\/(manager|owner|gudang|keuangan|pm|produksi|field|marketing)(?=\/|$)/,
  );
  const path = adminRolePath ? pathname.slice("/admin".length) : pathname;
  const elevated = role === "manager" || role === "owner";

  if (ownerReadOnly(role, path, method)) return false;

  if (matchesPath(path, "/api/upload")) {
    // Marketing unggah gambar konten; PM (proyek) unggah gambar mentah
    // kontraktor saat membuat order.
    return role === "marketing" || role === "proyek" || elevated;
  }
  if (matchesPath(path, "/api/custom")) {
    // Form publik selalu boleh kirim POST. Baca & ubah status: marketing,
    // PM (proyek), manager, owner (owner read-only via ownerReadOnly).
    if (method === "POST") return true;
    return role === "marketing" || role === "proyek" || elevated;
  }
  if (matchesPath(path, "/api/contact")) {
    return method === "POST" || role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/content")) {
    return method === "GET" || role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/admin")) return elevated;
  if (["/owner", "/api/owner"].some((prefix) => matchesPath(path, prefix))) {
    return role === "owner" || role === "manager";
  }
  if (["/manager", "/api/manager"].some((prefix) => matchesPath(path, prefix))) {
    return role === "manager" || role === "owner";
  }
  if (["/keuangan", "/api/keuangan"].some((prefix) => matchesPath(path, prefix))) {
    return role === "keuangan" || elevated;
  }
  if (["/gudang", "/api/gudang"].some((prefix) => matchesPath(path, prefix))) {
    return role === "gudang" || elevated;
  }
  if (["/marketing", "/api/marketing"].some((prefix) => matchesPath(path, prefix))) {
    // PM (proyek) hanya membaca order produk untuk Pesanan Masuk gabungan.
    if (role === "proyek") return READ_ONLY_METHODS.has(method.toUpperCase());
    return role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/pm")) {
    if (matchesPath(path, "/api/pm/orders") && path.endsWith("/drawing")) {
      return role === "produksi" || elevated;
    }
    return role === "proyek" || role === "produksi" || elevated;
  }
  if (matchesPath(path, "/pm")) return role === "proyek" || elevated;
  if (["/produksi", "/api/produksi"].some((prefix) => matchesPath(path, prefix))) {
    return role === "produksi" || elevated;
  }
  if (["/field", "/api/field"].some((prefix) => matchesPath(path, prefix))) {
    return role === "field" || elevated;
  }
  return true;
}
