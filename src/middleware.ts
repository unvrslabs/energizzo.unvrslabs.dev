import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_HOST = "dash.ildispaccio.energy";
const PUBLIC_HOSTS = new Set(["ildispaccio.energy", "www.ildispaccio.energy"]);
const PUBLIC_SITE_URL = "https://ildispaccio.energy";
const ADMIN_SITE_URL = "https://dash.ildispaccio.energy";

const NETWORK_COOKIE_NAME = "ildispaccio_network";

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

function isAdminRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}

function isNetworkProtectedRoute(pathname: string): boolean {
  return (
    (pathname === "/network" || pathname.startsWith("/network/")) &&
    pathname !== "/network/login"
  );
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
    return updateSession(request);
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
  // /network/* segue la logica pubblica, il resto va al default admin.
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
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
