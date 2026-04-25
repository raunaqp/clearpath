import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";
import { OrdersTable, type AdminOrder } from "./OrdersTable";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending_verification", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "generating", label: "Generating" },
  { key: "delivered", label: "Delivered" },
  { key: "failed", label: "Failed" },
] as const;

type AssessmentRow = { id: string; share_token: string | null };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status ?? "all";

  const supabase = getServiceClient();

  let query = supabase
    .from("tier2_orders")
    .select(
      "id, status, created_at, updated_at, amount_inr, payment_screenshot_url, transaction_id, email_sent_to, assessment_id, draft_pack_pdf_url, verified_at, delivered_at"
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data: orders, error } = await query;
  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F6F2] px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl text-[#0E1411]">Tier 2 Orders</h1>
          <p className="text-sm text-[#993C1D] mt-4">
            Could not load orders: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const orderRows = (orders ?? []) as AdminOrder[];

  // Hydrate share tokens for assessment links.
  const assessmentIds = Array.from(
    new Set(orderRows.map((o) => o.assessment_id))
  );
  const tokenMap: Record<string, string | null> = {};
  if (assessmentIds.length > 0) {
    const { data: assessments } = await supabase
      .from("assessments")
      .select("id, share_token")
      .in("id", assessmentIds);
    for (const a of (assessments as AssessmentRow[] | null) ?? []) {
      tokenMap[a.id] = a.share_token;
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl text-[#0E1411] mb-2">
          Tier 2 Orders
        </h1>
        <p className="text-sm text-[#6B766F] mb-6">
          {orderRows.length} {orderRows.length === 1 ? "order" : "orders"}
          {filter !== "all" ? ` · filter: ${filter}` : ""}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.key;
            const href =
              f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`;
            return (
              <Link
                key={f.key}
                href={href}
                className={
                  active
                    ? "rounded-full bg-[#0F6E56] text-white px-3 py-1 text-xs font-medium"
                    : "rounded-full border border-[#D9D5C8] text-[#0E1411] hover:bg-white px-3 py-1 text-xs font-medium"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <OrdersTable orders={orderRows} tokenMap={tokenMap} />
      </div>
    </main>
  );
}
