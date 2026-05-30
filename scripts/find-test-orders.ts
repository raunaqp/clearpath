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
  const { data } = await sb
    .from("tier2_orders")
    .select("id, assessment_id, tier_choice, status, draft_pack_pdf_url, created_at")
    .in("assessment_id", [
      "0be5a3db-7d8a-41f3-869e-c3a8cdaa4ceb",
      "c363730c-b13f-4167-bf5c-692a34592202",
    ])
    .order("created_at", { ascending: false });
  console.log(JSON.stringify(data, null, 2));
})();
