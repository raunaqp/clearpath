/**
 * /admin/costs — server component shell. Fetches data via shared
 * costs-data helper, renders the client dashboard. Auth-gated by
 * existing middleware.ts (matches /admin/:path*, Basic Auth +
 * ADMIN_PASSWORD env). Same protection as /admin/orders.
 */

import { fetchCostsData } from "@/lib/admin/costs-data";
import { CostDashboard } from "./CostDashboard";

export const dynamic = "force-dynamic";

export default async function AdminCostsPage() {
  let data;
  try {
    data = await fetchCostsData();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="min-h-screen bg-[#F7F6F2] px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl text-[#0E1411]">Cost dashboard</h1>
          <p className="text-sm text-[#993C1D] mt-4">
            Could not load cost data: {message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2]">
      <CostDashboard data={data} />
    </main>
  );
}
