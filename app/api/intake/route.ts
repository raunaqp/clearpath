import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name."),
  email: z.string().email("Enter a valid email address."),
  mobile: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\+?\d[\d\s-]{7,14}$/.test(v), {
      message: "Enter a valid mobile number.",
    }),
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

  const { name, email, mobile, one_liner, url } = parsed.data;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      name,
      email,
      mobile: mobile || null,
      one_liner,
      url: url || null,
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
