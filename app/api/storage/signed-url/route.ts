import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const BUCKET = "assessment-docs";

const schema = z.object({
  filename: z.string().min(1).max(200),
  size_bytes: z.number().int().positive().max(5 * 1024 * 1024),
});

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(req: NextRequest) {
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
