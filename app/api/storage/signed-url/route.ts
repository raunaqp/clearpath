import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth/require-owned-assessment";

const BUCKET = "assessment-docs";

const schema = z.object({
  filename: z.string().min(1).max(200),
  size_bytes: z.number().int().positive().max(5 * 1024 * 1024),
});

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(req: NextRequest) {
  // AUTH ONLY (not AUTH+OWN) — at intake time there is no assessment
  // row yet, so we can't enforce ownership. The storage path uses a
  // server-minted UUID prefix and is bound to the row only when
  // `/api/intake` writes `uploaded_docs[].storage_path`. Rate-limiting
  // and per-user upload quotas live one layer up; this gate just
  // guarantees the caller is signed in.
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    );
  }

  const { filename } = parsed.data;
  const storagePath = `intake/${crypto.randomUUID()}_${safeName(filename)}`;

  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error("Signed URL error:", error);
    return NextResponse.json(
      { error: "Could not prepare upload. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    storage_path: storagePath,
  });
}
