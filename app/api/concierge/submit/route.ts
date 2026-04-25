import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import {
  CONTEXT_MAX_WORDS,
  JOURNEY_STAGE_LABELS,
  JOURNEY_STAGE_VALUES,
  type JourneyStage,
} from "@/lib/concierge/validation";

const FOUNDER_EMAIL = "founder@clearpath.in";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "ClearPath <noreply@clearpath.in>";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  email: z
    .string()
    .trim()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email, e.g. abc@xyz.com"
    ),
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
  product_name: z
    .string()
    .trim()
    .min(1, "Please enter the product name")
    .max(200),
  journey_stage: z.enum(JOURNEY_STAGE_VALUES, {
    message: "Please pick how long you've been on this journey",
  }),
  context: z
    .string()
    .trim()
    .min(1, "Please share what challenges you're facing")
    .refine((v) => v.split(/\s+/).length <= CONTEXT_MAX_WORDS, {
      message: `Keep it to ${CONTEXT_MAX_WORDS} words or under.`,
    }),
  source_assessment_id: z.string().uuid().optional(),
  prefilled: z.boolean().optional().default(false),
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

  const {
    name,
    email,
    mobile,
    product_name,
    journey_stage,
    context,
    source_assessment_id,
    prefilled,
  } = parsed.data;

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("tier3_waitlist")
    .insert({
      name,
      email,
      mobile: mobile || null,
      product_name,
      journey_stage,
      context,
      source_assessment_id: source_assessment_id ?? null,
      prefilled: !!prefilled,
      status: "waitlist",
    })
    .select("id")
    .single();

  if (error) {
    console.error("tier3_waitlist insert error:", error);
    return NextResponse.json(
      { error: "Could not save your request. Please try again." },
      { status: 500 }
    );
  }

  // Fire emails best-effort. We never fail the user's submission on email
  // failure — the row is already saved and the founder can chase manually.
  void sendEmails({
    waitlistId: data.id,
    name,
    email,
    mobile: mobile || null,
    product_name,
    journey_stage,
    context,
    source_assessment_id: source_assessment_id ?? null,
    prefilled: !!prefilled,
  }).catch((err) => {
    console.error("concierge email send failed:", err);
  });

  return NextResponse.json(
    {
      id: data.id,
      journey_stage,
    },
    { status: 201 }
  );
}

type EmailPayload = {
  waitlistId: string;
  name: string;
  email: string;
  mobile: string | null;
  product_name: string;
  journey_stage: JourneyStage;
  context: string;
  source_assessment_id: string | null;
  prefilled: boolean;
};

async function sendEmails(p: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY not set — concierge submission saved but emails not sent.",
      { waitlistId: p.waitlistId }
    );
    return;
  }

  const sourceLink = p.source_assessment_id
    ? `https://clearpath.in/assess/${p.source_assessment_id}`
    : "(no source assessment)";

  const founderBody = `New Tier 3 concierge request — ${p.product_name}

Name:                  ${p.name}
Email:                 ${p.email}
Mobile:                ${p.mobile ?? "(not provided)"}
Product:               ${p.product_name}
Journey stage:         ${JOURNEY_STAGE_LABELS[p.journey_stage]}
Prefilled from card:   ${p.prefilled ? "yes" : "no"}
Source assessment:     ${sourceLink}
Waitlist row id:       ${p.waitlistId}

Challenges
----------
${p.context}
`;

  const userBody = `Thanks, ${p.name}. Here's what happens next:

1. Within 48 hours, we'll email you with a regulatory expert matched to your case.
2. The expert will schedule a 30-minute kick-off call.
3. We'll send a Razorpay link for ₹50,000 — payment is only due after the kick-off call confirms fit.
4. Review starts immediately after payment. 12-month engagement begins.

Questions in the meantime? Reply to this email or write to ${FOUNDER_EMAIL}.

— The ClearPath team
`;

  await Promise.all([
    sendOne(apiKey, {
      from: FROM_EMAIL,
      to: FOUNDER_EMAIL,
      reply_to: p.email,
      subject: `[Tier 3] New Concierge Request — ${p.product_name}`,
      text: founderBody,
    }),
    sendOne(apiKey, {
      from: FROM_EMAIL,
      to: p.email,
      reply_to: FOUNDER_EMAIL,
      subject: "Your ClearPath Concierge request received",
      text: userBody,
    }),
  ]);
}

async function sendOne(
  apiKey: string,
  msg: { from: string; to: string; reply_to: string; subject: string; text: string }
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(msg),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 200)}`);
  }
}
