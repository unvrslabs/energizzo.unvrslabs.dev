import { NextResponse, type NextRequest } from "next/server";

const ADMIN_HOST = "dash.ildispaccio.energy";
const PUBLIC_HOSTS = new Set(["ildispaccio.energy", "www.ildispaccio.energy"]);
const PUBLIC_SITE_URL = "https://ildispaccio.energy";
const ADMIN_SITE_URL = "https://dash.ildispaccio.energy";

const NETWORK_COOKIE_NAME = "ildispaccio_network";
const ADMIN_COOKIE_NAME = "ildispaccio_admin";

function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/report/") ||
    pathname.startsWith("/podcast/invito") ||
    pathname.startsWith("/api/podcast-invite") ||
    pathname.startsWith("/api/network-join") ||
    pathname === "/network/login" ||
    pathname.startsWith("/api/network/")
  );
}

function isAdminProtectedRoute(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/api/email-preview") ||
    pathname.startsWith("/api/agent-chat")
  );
}

function isAdminRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    isAdminProtectedRoute(pathname) ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/email-preview") ||
    pathname.startsWith("/api/agent-chat")
  );
}

function isNetworkProtectedRoute(pathname: string): boolean {
  return (
    (pathname === "/network" || pathname.startsWith("/network/")) &&
    pathname !== "/network/login"
  );
}

function handleAdmin(request: NextRequest, pathname: string) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const hasCookie = !!cookie?.value;

  if (pathname === "/login") {
    if (hasCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next({ request });
  }

  if (isAdminProtectedRoute(pathname)) {
    if (!hasCookie) {
      const url = new URL("/login", request.url);
      if (pathname !== "/dashboard") {
        url.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request });
}

export async function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const pathname = request.nextUrl.pathname;

  // dash.ildispaccio.energy → solo rotte admin
  if (host === ADMIN_HOST) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (isPublicRoute(pathname) && !isAdminRoute(pathname)) {
      return NextResponse.redirect(new URL(pathname, PUBLIC_SITE_URL));
    }
    return handleAdmin(request, pathname);
  }

  // ildispaccio.energy + www → solo rotte pubbliche
  if (PUBLIC_HOSTS.has(host)) {
    if (isAdminRoute(pathname)) {
      return NextResponse.redirect(new URL(pathname, ADMIN_SITE_URL));
    }
    if (isNetworkProtectedRoute(pathname)) {
      const cookie = request.cookies.get(NETWORK_COOKIE_NAME);
      if (!cookie?.value) {
        const url = new URL("/network/login", request.url);
        if (pathname !== "/network") {
          url.searchParams.set("next", pathname);
        }
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next({ request });
  }

  // Host sconosciuto (localhost, preview VPS diretto, legacy):
  // /network/* segue la logica pubblica, resto applica admin.
  if (pathname === "/network/login" || pathname.startsWith("/api/network/")) {
    return NextResponse.next({ request });
  }
  if (isNetworkProtectedRoute(pathname)) {
    const cookie = request.cookies.get(NETWORK_COOKIE_NAME);
    if (!cookie?.value) {
      const url = new URL("/network/login", request.url);
      if (pathname !== "/network") {
        url.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
  return handleAdmin(request, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
