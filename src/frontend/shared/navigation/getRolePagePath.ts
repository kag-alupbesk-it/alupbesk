const ROLE_PREFIX =
  /^\/admin\/(?:manager|owner|gudang|keuangan|pm|produksi|field|marketing)(?=\/|$)/;

export function getRolePagePath(pathname: string) {
  return ROLE_PREFIX.test(pathname) ? pathname.replace(/^\/admin/, "") : pathname;
}
