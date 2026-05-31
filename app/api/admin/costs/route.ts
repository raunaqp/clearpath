/**
 * GET /api/admin/costs
 *
 * Returns the cost dashboard data shape used by /admin/costs. Auth-gated
 * by the existing middleware (Basic Auth, ADMIN_PASSWORD env). The page
 * server-renders via the same fetchCostsData helper; this endpoint exists
 * for refresh / programmatic access.
 */

import { NextResponse } from "next/server";
import { fetchCostsData } from "@/lib/admin/costs-data";

export const dynamic = "force-dynamic";

// SYSTEM: gated at the Vercel edge by Basic Auth on /api/admin/* —
// see middleware ("www-authenticate: Basic realm=\"ClearPath Admin\"").
// No per-request session check needed; the edge layer rejects before
// the function runs. If middleware is ever loosened on this path,
// re-introduce an in-handler auth check here.
export async function GET() {
  try {
    const data = await fetchCostsData();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
