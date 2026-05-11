import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 renamed `middleware` → `proxy`. Functionality is the same.
// This file does two unrelated jobs:
//
// 1. Basic Auth gate for /admin/* and /api/admin/* (legacy, single shared
//    password in ADMIN_PASSWORD).
// 2. Supabase session refresh + auth redirect for /dashboard/*
//    (customer auth — Story 2.2).
//
// Webhook endpoints (/api/webhooks/* — Story 2.8) are intentionally NOT
// matched here, so Cashfree can hit them unauthenticated.

const REALM = "ClearPath Admin";

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function decodeBasic(headerValue: string): { user: string; pass: string } | null {
  if (!headerValue.startsWith("Basic ")) return null;
  const encoded = headerValue.slice("Basic ".length).trim();
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }
  const colonIdx = decoded.indexOf(":");
  if (colonIdx < 0) return null;
  return { user: decoded.slice(0, colonIdx), pass: decoded.slice(colonIdx + 1) };
}

function handleAdmin(req: NextRequest): NextResponse {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return new NextResponse("Admin not configured (ADMIN_PASSWORD not set).", {
      status: 503,
    });
  }
  const auth = req.headers.get("authorization");
  if (!auth) return unauthorized();
  const creds = decodeBasic(auth);
  if (!creds) return unauthorized();
  if (creds.user !== "admin") return unauthorized();
  if (!timingSafeEqual(creds.pass, adminPassword)) return unauthorized();
  return NextResponse.next();
}

async function handleCustomerAuth(req: NextRequest): Promise<NextResponse> {
  // Defense in depth: if env is missing on this deploy, redirect to /login
  // (which renders without Supabase). Avoids 500'ing the whole route.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?return_to=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          for (const { name, value, options } of toSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const url = req.nextUrl.clone();
    const target = `${url.pathname}${url.search}`;
    url.pathname = "/login";
    url.search = `?return_to=${encodeURIComponent(target)}`;
    return NextResponse.redirect(url);
  }
  return res;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    return handleAdmin(req);
  }
  if (path.startsWith("/dashboard")) {
    return handleCustomerAuth(req);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*"],
};
