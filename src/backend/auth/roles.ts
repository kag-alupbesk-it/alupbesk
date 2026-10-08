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

  if (matchesPath(path, "/api/upload")) {
    return role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/custom")) {
    return method === "POST" || role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/contact")) {
    return method === "POST" || role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/content")) {
    return method === "GET" || role === "marketing" || elevated;
  }
  if (matchesPath(path, "/api/admin")) return elevated;
  if (["/owner", "/api/owner"].some((prefix) => matchesPath(path, prefix))) {
    return role === "owner";
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
