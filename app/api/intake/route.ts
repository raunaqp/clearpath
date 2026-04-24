import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const uploadedDocSchema = z.object({
  filename: z.string().min(1).max(200),
  storage_path: z.string().min(1).max(500),
  size_bytes: z.number().int().positive().max(5 * 1024 * 1024),
  sha256: z.string().length(64),
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email, e.g. abc@xyz.com"),
  mobile: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        const digits = v.replace(/^\+?91[\s-]*/, "").replace(/[^0-9]/g, "");
        return digits.length === 10;
      },
      { message: "Please enter a 10-digit mobile number" }
    ),
  one_liner: z
    .string()
    .trim()
    .min(20, "Please add more detail (at least 20 characters)")
    .max(300, "Keep it to 300 characters or under.")
    .refine((v) => !/^\s*e\.g\./i.test(v), {
      message:
        "Please replace the example text with your own product description",
    }),
  url: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || /^https?:\/\/.+\..+/.test(v), {
      message: "Enter a valid URL starting with http:// or https://",
    }),
  uploaded_docs: z.array(uploadedDocSchema).max(3).optional().default([]),
  resume_id: z.string().uuid().optional(),
});

type AssessmentMeta = Record<string, unknown> & {
  conflict_acknowledged?: boolean;
  conflict_edit_attempts?: number;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first.message }, { status: 422 });
  }

  const { name, email, mobile, one_liner, url, uploaded_docs, resume_id } = parsed.data;

  const supabase = getServiceClient();

  if (resume_id) {
    // Resume flow: update existing row in place, clear downstream, bump edit counter.
    const { data: existing, error: fetchError } = await supabase
      .from("assessments")
      .select("id, meta")
      .eq("id", resume_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return NextResponse.json(
        { error: "Could not load assessment." },
        { status: 500 }
      );
    }
    if (!existing) {
      return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    }

    const currentMeta: AssessmentMeta =
      (existing.meta as AssessmentMeta | null) ?? {};
    const nextMeta: AssessmentMeta = { ...currentMeta };
    // Remove the key entirely rather than setting it to false.
    delete nextMeta.conflict_acknowledged;
    const priorAttempts =
      typeof currentMeta.conflict_edit_attempts === "number"
        ? currentMeta.conflict_edit_attempts
        : 0;
    nextMeta.conflict_edit_attempts = priorAttempts + 1;

    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        name,
        email,
        mobile: mobile || null,
        one_liner,
        url: url || null,
        uploaded_docs: uploaded_docs.length > 0 ? uploaded_docs : null,
        status: "draft",
        product_type: null,
        url_fetched_content: null,
        meta: nextMeta,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resume_id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Could not save your submission. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ assessmentId: existing.id }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      name,
      email,
      mobile: mobile || null,
      one_liner,
      url: url || null,
      uploaded_docs: uploaded_docs.length > 0 ? uploaded_docs : null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Could not save your submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ assessmentId: data.id }, { status: 201 });
}
