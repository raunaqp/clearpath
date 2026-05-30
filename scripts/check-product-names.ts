import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}

import { getServiceClient } from "@/lib/supabase";

(async () => {
  const sb = getServiceClient();
  const ids = [
    "0be5a3db-7d8a-41f3-869e-c3a8cdaa4ceb",
    "c363730c-b13f-4167-bf5c-692a34592202",
  ];
  for (const id of ids) {
    const { data } = await sb
      .from("assessments")
      .select("id, name, one_liner, readiness_card, ai_extracted")
      .eq("id", id)
      .maybeSingle();
    if (!data) {
      console.log(`${id.slice(0, 8)} not found`);
      continue;
    }
    const card = data.readiness_card as Record<string, unknown> | null;
    const meta = card?.meta as Record<string, unknown> | undefined;
    const ai = data.ai_extracted as Record<string, unknown> | null;
    const aiFields =
      ai && ai.status === "complete"
        ? (ai.fields as Record<string, unknown>)
        : null;
    console.log("=".repeat(70));
    console.log(`assessment ${id.slice(0, 8)} — name=${data.name}`);
    console.log(`  one_liner: ${JSON.stringify(data.one_liner)}`);
    console.log(`  card.meta.product_name: ${JSON.stringify(meta?.product_name)}`);
    console.log(
      `  ai_extracted.device_name: ${JSON.stringify(aiFields?.device_name)}`
    );
    console.log(
      `  ai_extracted.intended_use_one_liner: ${JSON.stringify(aiFields?.intended_use_one_liner)}`
    );
  }
})();
