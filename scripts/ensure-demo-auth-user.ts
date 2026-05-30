/**
 * Idempotent: create the demo+regulator@clearpath.in Supabase auth user
 * so the founder can sign in and walk the /upgrade/[id] delivered state
 * during the regulator demo. Password is fixed + printed at end.
 */
import { getServiceClient } from "../lib/supabase";

const DEMO_EMAIL = "demo+regulator@clearpath.in";
const DEMO_PASSWORD = "ClearpathDemo2026!";

async function main() {
  const supabase = getServiceClient();

  // Look up existing auth users by email (admin API)
  // listUsers paginates; for a small project the first page is enough.
  const { data: list, error: lErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (lErr) {
    console.error("listUsers failed:", lErr.message);
    process.exit(1);
  }

  const existing = list.users.find(
    (u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()
  );

  if (existing) {
    // Reset the password to the known demo password so the founder can
    // log in regardless of historical state.
    const { error: uErr } = await supabase.auth.admin.updateUserById(
      existing.id,
      { password: DEMO_PASSWORD, email_confirm: true }
    );
    if (uErr) {
      console.error("updateUserById failed:", uErr.message);
      process.exit(1);
    }
    console.log(`✓ existing auth user found · id=${existing.id} · password reset`);
  } else {
    const { data: created, error: cErr } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (cErr || !created.user) {
      console.error("createUser failed:", cErr?.message);
      process.exit(1);
    }
    console.log(`✓ auth user created · id=${created.user.id}`);
  }

  console.log("");
  console.log("DEMO LOGIN CREDENTIALS");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
