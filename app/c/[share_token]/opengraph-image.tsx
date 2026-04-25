import { ImageResponse } from "next/og";
import { getServiceClient } from "@/lib/supabase";
import { ReadinessCardSchema } from "@/lib/schemas/readiness-card";

export const alt = "ClearPath Readiness Card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

const BAND_TINT: Record<string, string> = {
  red: "#FAECE7",
  amber: "#FAEEDA",
  green: "#EAF3DE",
  green_plus: "#E1F5EE",
  not_applicable: "#F7F6F2",
};

const BAND_ACCENT: Record<string, string> = {
  red: "#993C1D",
  amber: "#BA7517",
  green: "#3B6D11",
  green_plus: "#0F6E56",
  not_applicable: "#6B766F",
};

const RISK_LABEL: Record<string, string> = {
  high: "HIGH RISK",
  medium: "MEDIUM RISK",
  low: "LOW RISK",
  not_applicable: "RISK N/A",
};

type CardRow = {
  readiness_card: unknown;
};

export default async function Image({
  params,
}: {
  params: Promise<{ share_token: string }>;
}) {
  const { share_token } = await params;
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("assessments")
    .select("readiness_card")
    .eq("share_token", share_token)
    .eq("status", "completed")
    .maybeSingle<CardRow>();

  // If we can't load or validate the card, return a generic branded fallback.
  const parsed = data?.readiness_card
    ? ReadinessCardSchema.safeParse(data.readiness_card)
    : null;

  if (!parsed?.success) {
    return new ImageResponse(<FallbackImage />, { ...size });
  }

  const card = parsed.data;
  const productName = card.meta.product_name || card.meta.company_name;
  const tint = BAND_TINT[card.readiness.band] ?? "#F7F6F2";
  const accent = BAND_ACCENT[card.readiness.band] ?? "#0F6E56";
  const riskLabel = RISK_LABEL[card.risk.level] ?? "";
  const cdscoLine = card.classification.cdsco_class
    ? `Class ${card.classification.cdsco_class}${
        card.classification.class_qualifier
          ? ` · ${card.classification.class_qualifier}`
          : ""
      }`
    : "Not a medical device";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: tint,
          padding: 64,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            fontFamily: "Inter, sans-serif",
            letterSpacing: 4,
            color: "#0E1411",
            textTransform: "uppercase",
          }}
        >
          ClearPath · Readiness Card
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontFamily: "Inter, sans-serif",
              letterSpacing: 3,
              color: accent,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {riskLabel}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 84,
              lineHeight: 1.05,
              color: "#0E1411",
              maxWidth: 1000,
            }}
          >
            {productName}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontFamily: "Inter, sans-serif",
              color: "#3D453F",
              marginTop: 24,
            }}
          >
            {cdscoLine} · {card.timeline.display}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            fontFamily: "Inter, sans-serif",
            color: "#3D453F",
          }}
        >
          <div style={{ display: "flex" }}>clearpath.in</div>
          {card.readiness.score !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                color: accent,
              }}
            >
              <span style={{ fontSize: 24 }}>Readiness</span>
              <span style={{ fontSize: 56, fontFamily: "Georgia, serif" }}>
                {card.readiness.score}
              </span>
              <span style={{ fontSize: 24 }}>/ 10</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

function FallbackImage() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#F7F6F2",
        fontFamily: "Georgia, serif",
        color: "#0E1411",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          fontFamily: "Inter, sans-serif",
          letterSpacing: 4,
          color: "#0F6E56",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        ClearPath
      </div>
      <div style={{ display: "flex", fontSize: 64 }}>Readiness Card</div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          fontFamily: "Inter, sans-serif",
          color: "#6B766F",
          marginTop: 16,
        }}
      >
        clearpath.in
      </div>
    </div>
  );
}
