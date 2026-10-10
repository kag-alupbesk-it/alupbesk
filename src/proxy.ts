import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/services/supabase";
import { roleCanAccess, type AppRole } from "@/backend/auth/roles";

const ADMIN_ROLE_ROUTES = [
  "manager",
  "owner",
  "gudang",
  "keuangan",
  "pm",
  "produksi",
  "field",
  "marketing",
] as const;
const ADMIN_PUBLIC_ROUTES = ["login", "register"] as const;

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

/**
 * Hanya izinkan nilai `next` berupa path internal (dimulai satu `/` dan bukan
 * `//`). Nilai absolut/protocol-relative dibuang supaya tidak menjadi open
 * redirect setelah login.
 */
function enforceSafeNext(url: URL) {
  const nextRaw = url.searchParams.get("next");
  if (nextRaw && (!nextRaw.startsWith("/") || nextRaw.startsWith("//"))) {
    url.searchParams.delete("next");
  }
}

type CatalogPageRoute = {
  legacyPath: string;
  isCanonical: boolean;
  canonicalPath?: string;
};

function getCatalogPageRoute(pathname: string): CatalogPageRoute | null {
  const catalogPages: Record<string, string> = {
    "/catalog": "/",
    "/catalog/produk": "/katalog",
    "/catalog/portofolio": "/portofolio",
    "/catalog/jasa-custom": "/jasa-custom",
  };
  const legacyPages: Record<string, string> = {
    "/katalog": "/catalog/produk",
    "/portofolio": "/catalog/portofolio",
    "/jasa-custom": "/catalog/jasa-custom",
  };

  if (pathname in catalogPages) {
    return { legacyPath: catalogPages[pathname], isCanonical: true };
  }
  if (pathname in legacyPages) {
    return { legacyPath: pathname, isCanonical: false, canonicalPath: legacyPages[pathname] };
  }
  return null;
}

function getAdminRoleRoute(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const adminRole = parts[1] as (typeof ADMIN_ROLE_ROUTES)[number] | undefined;
  const legacyRole = parts[0] as (typeof ADMIN_ROLE_ROUTES)[number] | undefined;

  if (parts[0] === "admin" && adminRole && ADMIN_ROLE_ROUTES.includes(adminRole)) {
    return {
      legacyPath: `/${parts.slice(1).join("/")}`,
      isCanonical: true,
    };
  }

  if (legacyRole && ADMIN_ROLE_ROUTES.includes(legacyRole)) {
    return {
      legacyPath: pathname,
      isCanonical: false,
    };
  }

  return null;
}

function requiresRole(pathname: string, method: string): boolean {
  const routePrefixes = [
    "/api/manager",
    "/api/admin",
    "/api/owner",
    "/api/gudang",
    "/api/keuangan",
    "/api/pm",
    "/api/produksi",
    "/api/field",
    "/api/marketing",
    "/api/upload",
  ];
  if (routePrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  if (pathname.startsWith("/api/content/")) return method !== "GET" && method !== "HEAD";
  if (pathname.startsWith("/api/custom/")) return method !== "POST";
  if (pathname.startsWith("/api/contact/")) return method !== "POST";

  if (pathname.startsWith("/api/push/")) return true;

  if (
    [
      "/manager",
      "/owner",
      "/gudang",
      "/keuangan",
      "/pm",
      "/produksi",
      "/field",
      "/marketing",
    ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  ) {
    return true;
  }

  // Fail-closed: semua path /admin/<x> kecuali login/register wajib punya sesi
  // aktif. Ini melindungi halaman admin apa pun (termasuk yang akan ditambah
  // nanti) dari akses langsung oleh user yang belum login.
  const adminParts = pathname.split("/").filter(Boolean);
  if (
    adminParts.length >= 2 &&
    adminParts[0] === "admin" &&
    !ADMIN_PUBLIC_ROUTES.includes(adminParts[1] as (typeof ADMIN_PUBLIC_ROUTES)[number])
  ) {
    return true;
  }

  return false;
}

function denied(request: NextRequest, api: boolean, status: 401 | 403) {
  if (api) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: status === 401 ? "AUTH_REQUIRED" : "ROLE_FORBIDDEN",
          message:
            status === 401
              ? "Silakan login untuk melanjutkan."
              : "Role akun tidak memiliki akses ke fitur ini.",
        },
      },
      { status },
    );
  }
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const api = pathname.startsWith("/api/");
  if (!api && pathname === "/") return redirectTo(request, "/catalog");

  const catalogRoute = api ? null : getCatalogPageRoute(pathname);
  if (catalogRoute && !catalogRoute.isCanonical && catalogRoute.canonicalPath) {
    return redirectTo(request, catalogRoute.canonicalPath);
  }
  if (catalogRoute?.isCanonical) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = catalogRoute.legacyPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  const adminRoleRoute = api ? null : getAdminRoleRoute(pathname);
  if (adminRoleRoute && !adminRoleRoute.isCanonical) {
    return redirectTo(request, `/admin${pathname}`);
  }

  const adminPath = pathname.split("/").filter(Boolean);
  if (
    !api &&
    adminPath.length === 2 &&
    adminPath[0] === "admin" &&
    ADMIN_PUBLIC_ROUTES.includes(adminPath[1] as (typeof ADMIN_PUBLIC_ROUTES)[number])
  ) {
    const rewriteUrl = request.nextUrl.clone();
    enforceSafeNext(rewriteUrl);
    rewriteUrl.pathname = `/${adminPath[1]}`;
    return NextResponse.rewrite(rewriteUrl);
  }
  if (
    !api &&
    adminPath.length === 1 &&
    ADMIN_PUBLIC_ROUTES.includes(adminPath[0] as (typeof ADMIN_PUBLIC_ROUTES)[number])
  ) {
    const redirectUrl = request.nextUrl.clone();
    enforceSafeNext(redirectUrl);
    redirectUrl.pathname = `/admin/${adminPath[0]}`;
    return NextResponse.redirect(redirectUrl);
  }

  const permissionPath = adminRoleRoute?.legacyPath ?? pathname;
  if (!requiresRole(permissionPath, request.method)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !db) return denied(request, api, 401);

  const rewriteUrl = adminRoleRoute?.isCanonical
    ? request.nextUrl.clone()
    : null;
  if (rewriteUrl && adminRoleRoute) {
    rewriteUrl.pathname = adminRoleRoute.legacyPath;
  }
  const createResponse = () =>
    rewriteUrl
      ? NextResponse.rewrite(rewriteUrl, { request })
      : NextResponse.next({ request });
  let response = createResponse();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = createResponse();
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user?.email) return denied(request, api, 401);
  const { data: profile, error: profileError } = await db
    .from("users")
    .select("role, active")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (profileError || !profile || !profile.active) return denied(request, api, 403);
  if (!roleCanAccess(profile.role as AppRole, permissionPath, request.method)) {
    return denied(request, api, 403);
  }

  // Fail-closed untuk sub-halaman /admin/<x> yang tidak dikenal (bukan salah
  // satu role resmi dan bukan /admin/app). Tidak ada role yang boleh membukanya.
  if (
    adminRoleRoute === null &&
    pathname.startsWith("/admin/") &&
    pathname !== "/admin" &&
    pathname !== "/admin/app"
  ) {
    return denied(request, api, 403);
  }

  if (adminRoleRoute?.isCanonical) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
