/**
 * npm run seed
 * Creates (or updates) the first Super Master Admin from env vars:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME (optional)
 * Uses the service-role key — run locally only, never in the browser.
 * No demo accounts are created.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || "Ceyteq Administrator";

  if (!url || !serviceKey) {
    console.error("✗ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
    process.exit(1);
  }
  if (!email || !password) {
    console.error("✗ ADMIN_EMAIL / ADMIN_PASSWORD missing in .env.local");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("✗ ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find an existing user with this email (paginate through the user list).
  let existingId: string | null = null;
  for (let page = 1; page <= 20 && !existingId; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error(`✗ Could not list users: ${error.message}`);
      process.exit(1);
    }
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) existingId = match.id;
    if (data.users.length < 200) break;
  }

  let userId: string;

  if (existingId) {
    const { error } = await supabase.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) {
      console.error(`✗ Could not update existing admin: ${error.message}`);
      process.exit(1);
    }
    userId = existingId;
    console.log(`• Updated existing auth user ${email} (password reset, email confirmed).`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // first admin is pre-verified; login still requires the email OTP
      user_metadata: { full_name: fullName },
    });
    if (error || !data.user) {
      console.error(`✗ Could not create admin user: ${error?.message ?? "unknown error"}`);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`• Created auth user ${email}.`);
  }

  // The handle_new_user trigger creates an 'employee' profile — promote it.
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      role: "super_master_admin",
      status: "active",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error(`✗ Could not upsert admin profile: ${profileError.message}`);
    console.error("  Has supabase/migrations/0001_init.sql been run?");
    process.exit(1);
  }

  console.log(`✓ Super Master Admin ready: ${email}`);
  console.log("  Sign in with the password from ADMIN_PASSWORD, then enter the 6-digit code emailed to you.");
}

void main();
