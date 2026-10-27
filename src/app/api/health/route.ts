import { NextResponse } from "next/server";

import { createAdminClient, hasSupabaseEnv } from "@/lib/supabase/admin";

/**
 * GET /api/health — reports app + Supabase connectivity.
 * Never includes credentials or row data in the response.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let supabase: "ok" | "fail" = "fail";

  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("departments")
        .select("id", { count: "exact", head: true });
      supabase = error ? "fail" : "ok";
    } catch {
      supabase = "fail";
    }
  }

  return NextResponse.json(
    {
      status: supabase === "ok" ? "ok" : "degraded",
      app: "ceyteq-general-management-system",
      supabase: supabase === "ok" ? "connected" : "not connected",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: supabase === "ok" ? 200 : 503 },
  );
}
