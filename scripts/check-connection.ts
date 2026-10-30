/**
 * npm run check:db
 * Verifies that .env.local points at a reachable Supabase project and that
 * every app table (migrations 0001 + 0002) has been applied. Prints one
 * line per check plus a final verdict:
 *   Supabase connected: OK   /   Supabase connected: FAIL (reason)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const TABLES = ["departments", "profiles", "audit_logs", "restaurant_submissions"] as const;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.log(
      "Supabase connected: FAIL (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local)",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 1) Auth service reachable?
    const { error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    if (authError) {
      console.log(`Supabase connected: FAIL (auth: ${authError.message})`);
      process.exit(1);
    }
    console.log("✓ auth service reachable");

    // 2) All app tables present?
    for (const table of TABLES) {
      const { error } = await supabase
        .from(table)
        .select("id", { head: true, count: "exact" });

      if (error) {
        console.log(`✗ table ${table}: ${error.message}`);
        console.log(
          "Supabase connected: FAIL (database: has supabase/migrations/0001_init.sql and 0002_restaurant_submissions.sql been run?)",
        );
        process.exit(1);
      }
      console.log(`✓ table ${table}`);
    }

    console.log("Supabase connected: OK");
  } catch (err) {
    console.log(
      `Supabase connected: FAIL (${err instanceof Error ? err.message : String(err)})`,
    );
    process.exit(1);
  }
}

void main();
