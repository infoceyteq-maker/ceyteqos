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
  // TEMP DIAGNOSTIC (remove): surface upstream error codes to find why the
  // production deployment cannot reach Supabase. No key material is exposed.
  let debugAdmin: string | null = null;
  let debugAnon: string | null = null;

  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("departments")
        .select("id", { count: "exact", head: true });
      supabase = error ? "fail" : "ok";
      if (error) debugAdmin = `${error.code ?? "?"}: ${error.message}`.slice(0, 200);
    } catch (err) {
      supabase = "fail";
      debugAdmin = `throw: ${err instanceof Error ? err.message : String(err)}`.slice(0, 200);
    }
  }

  if (hasSupabaseEnv()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        { auth: { persistSession: false } },
      );
      const { error } = await anon.from("departments").select("id").limit(1);
      debugAnon = error ? `${error.code ?? "?"}: ${error.message}`.slice(0, 200) : "ok";
    } catch (err) {
      debugAnon = `throw: ${err instanceof Error ? err.message : String(err)}`.slice(0, 200);
    }
  }

  return NextResponse.json(
    {
      status: supabase === "ok" ? "ok" : "degraded",
      app: "ceyteq-general-management-system",
      supabase: supabase === "ok" ? "connected" : "not connected",
      debugAdmin,
      debugAnon,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: supabase === "ok" ? 200 : 503 },
  );
}
