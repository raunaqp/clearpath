/**
 * Phase 5.5.C — inline NEEDS INPUT save endpoint.
 *
 * POST /api/draft/:id/needs-input/save
 *   body: { section_key: string, descriptor: string, value: string }
 *
 * Persists the customer's answer for one [NEEDS INPUT: <descriptor>]
 * marker in section <section_key>.
 *
 * Storage shape on assessments.meta.needs_input_fields:
 *   {
 *     "01_executive_summary": {
 *       "clinical evidence status": "200-patient pilot, 89% sensitivity"
 *     },
 *     ...
 *   }
 *
 * The section's markdown content is NEVER mutated. The renderer
 * overlays filled values at display time. Customer can re-edit any
 * field by clicking the filled pill.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const READABLE_STATUSES = ["verified", "generating", "delivered"] as const;
const MAX_VALUE_BYTES = 4000;
const MAX_DESCRIPTOR_BYTES = 500;

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { section_key?: unknown; descriptor?: unknown; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 422 });
  }

  const sectionKey =
    typeof body.section_key === "string" ? body.section_key.trim() : null;
  const descriptor =
    typeof body.descriptor === "string" ? body.descriptor.trim() : null;
  const value = typeof body.value === "string" ? body.value : null;

  if (!sectionKey || !descriptor || value === null) {
    return NextResponse.json(
      { error: "missing_fields", fields: { sectionKey, descriptor, value } },
      { status: 422 }
    );
  }
  if (Buffer.byteLength(descriptor, "utf8") > MAX_DESCRIPTOR_BYTES) {
    return NextResponse.json(
      { error: "descriptor_too_large", limit_bytes: MAX_DESCRIPTOR_BYTES },
      { status: 413 }
    );
  }
  if (Buffer.byteLength(value, "utf8") > MAX_VALUE_BYTES) {
    return NextResponse.json(
      { error: "value_too_large", limit_bytes: MAX_VALUE_BYTES },
      { status: 413 }
    );
  }

  const supabase = getServiceClient();

  // Authz — must have an order in a renderable state.
  const { data: order } = await supabase
    .from("tier2_orders")
    .select("id, status")
    .eq("assessment_id", id)
    .neq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    !order ||
    !READABLE_STATUSES.includes(
      order.status as (typeof READABLE_STATUSES)[number]
    )
  ) {
    return NextResponse.json(
      { error: "order_not_ready", status: order?.status ?? null },
      { status: 409 }
    );
  }

  // Read-modify-write on assessments.meta.needs_input_fields.
  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select("meta")
    .eq("id", id)
    .single();
  if (aErr || !assessment) {
    return NextResponse.json(
      { error: "assessment_not_found", message: aErr?.message },
      { status: 404 }
    );
  }

  const meta = (assessment.meta ?? {}) as Record<string, unknown>;
  const fields =
    (meta.needs_input_fields as
      | Record<string, Record<string, string>>
      | undefined) ?? {};
  const sectionFields = fields[sectionKey] ?? {};

  // Empty value means "clear this field" — drop the key entirely.
  if (value.trim() === "") {
    delete sectionFields[descriptor];
    if (Object.keys(sectionFields).length === 0) {
      delete fields[sectionKey];
    } else {
      fields[sectionKey] = sectionFields;
    }
  } else {
    sectionFields[descriptor] = value;
    fields[sectionKey] = sectionFields;
  }
  meta.needs_input_fields = fields;
  meta.needs_input_updated_at = new Date().toISOString();

  const { error: upErr } = await supabase
    .from("assessments")
    .update({ meta })
    .eq("id", id);
  if (upErr) {
    console.error("[needs-input-save]", upErr.message);
    return NextResponse.json(
      { error: "save_failed", message: upErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, sectionKey, descriptor, value });
}
