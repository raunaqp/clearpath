/**
 * Phase 5.5.D — per-section attachment endpoints.
 *
 * POST   /api/draft/:id/attachments   — multipart upload one file
 *   form fields: section_key, doc_type, notes (optional), file
 *
 * Validates: file type (PDF/PNG/JPG), size (<=10 MB), order state.
 * Stores: Supabase bucket "draft_pack_attachments" at
 *   <order_id>/<section_key>/<sha256>.<ext>
 * DB: draft_pack_attachments row keyed on (order_id, section_key, sha256).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { requireAuthOwnedAssessment } from "@/lib/auth/require-owned-assessment";
import { createHash } from "crypto";
import {
  ATTACHMENT_FILE_LIMITS,
  isAcceptedMime,
} from "@/lib/attachments/doc-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const READABLE_STATUSES = ["verified", "generating", "delivered"] as const;
const BUCKET = "draft_pack_attachments";

type Params = { params: Promise<{ id: string }> };

function extensionFromMime(mime: string): string {
  if (mime.startsWith("application/pdf")) return "pdf";
  if (mime.startsWith("image/png")) return "png";
  if (mime.startsWith("image/jpeg")) return "jpg";
  return "bin";
}

export async function POST(req: NextRequest, ctx: Params) {
  const { id } = await ctx.params;

  const auth = await requireAuthOwnedAssessment(id);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 422 });
  }

  const file = form.get("file");
  const sectionKey = form.get("section_key");
  const docType = form.get("doc_type");
  const notes = form.get("notes");
  if (
    !(file instanceof File) ||
    typeof sectionKey !== "string" ||
    typeof docType !== "string"
  ) {
    return NextResponse.json(
      { error: "missing_fields", needs: ["file", "section_key", "doc_type"] },
      { status: 422 }
    );
  }
  if (file.size > ATTACHMENT_FILE_LIMITS.maxBytes) {
    return NextResponse.json(
      {
        error: "file_too_large",
        limit_bytes: ATTACHMENT_FILE_LIMITS.maxBytes,
        size_bytes: file.size,
      },
      { status: 413 }
    );
  }
  if (!isAcceptedMime(file.type)) {
    return NextResponse.json(
      {
        error: "mime_not_allowed",
        accepted: ATTACHMENT_FILE_LIMITS.acceptedMimePrefixes,
        got: file.type,
      },
      { status: 415 }
    );
  }

  const supabase = getServiceClient();

  // Authz.
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

  // Read the file once, compute sha256.
  const buf = Buffer.from(await file.arrayBuffer());
  const sha = createHash("sha256").update(buf).digest("hex");
  const ext = extensionFromMime(file.type);
  const storagePath = `${order.id}/${sectionKey}/${sha}.${ext}`;

  // Upload to Storage. upsert=true → identical reupload is a no-op.
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, {
      contentType: file.type,
      upsert: true,
    });
  if (upErr) {
    console.error("[attachments-upload] storage:", upErr.message);
    return NextResponse.json(
      { error: "storage_failed", message: upErr.message },
      { status: 500 }
    );
  }

  // Insert metadata row. (order_id, section_key, sha256) is unique →
  // dupe re-uploads return 23505 from PG; we treat that as success.
  const { data: inserted, error: insErr } = await supabase
    .from("draft_pack_attachments")
    .insert({
      order_id: order.id,
      section_key: sectionKey,
      filename: file.name,
      storage_path: storagePath,
      content_type: file.type,
      size_bytes: file.size,
      sha256: sha,
      doc_type: docType,
      notes: typeof notes === "string" ? notes : null,
      uploaded_by: user.id,
    })
    .select("id, doc_type, notes")
    .single();

  if (insErr) {
    const code = (insErr as { code?: string }).code;
    if (code === "23505") {
      // Duplicate (same sha already attached to this section). Re-fetch
      // the existing row and return it so the client can show success.
      const { data: existing } = await supabase
        .from("draft_pack_attachments")
        .select("id, doc_type, notes, filename")
        .eq("order_id", order.id)
        .eq("section_key", sectionKey)
        .eq("sha256", sha)
        .maybeSingle();
      return NextResponse.json({
        ok: true,
        attachment: existing ?? null,
        deduped: true,
      });
    }
    console.error("[attachments-upload] insert:", insErr.message);
    return NextResponse.json(
      { error: "db_failed", message: insErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    attachment: {
      id: inserted.id,
      filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      doc_type: inserted.doc_type,
      notes: inserted.notes,
      section_key: sectionKey,
    },
  });
}
