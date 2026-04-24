import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const schema = z.object({
  one_liner: z
    .string()
    .min(20, "Please tell us a bit more — at least 20 characters.")
    .max(200, "Keep it to 200 characters or under."),
  url: z
    .string()
    .optional()
    .refine((v) => !v || v === "" || /^https?:\/\/.+\..+/.test(v), {
      message: "Enter a valid URL starting with http:// or https://",
    }),
  email: z.string().email("Enter a valid email address."),
  newsletter_opt_in: z.boolean().optional().default(false),
});

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

  const { one_liner, url, email, newsletter_opt_in } = parsed.data;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      one_liner,
      url: url || null,
      email,
      newsletter_opt_in,
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
