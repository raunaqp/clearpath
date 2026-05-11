import { NextRequest, NextResponse } from "next/server";

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

export function middleware(req: NextRequest): NextResponse {
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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
