import { NextResponse } from "next/server";

import { createAdminClient, hasSupabaseEnv } from "@/lib/supabase/admin";

/**
 * GET /api/health — reports app + Supabase connectivity, including a
 * per-table reachability check for every table the app depends on.
 * Never includes credentials or row data in the response.
 */
export const dynamic = "force-dynamic";

const TABLES = ["departments", "profiles", "audit_logs", "restaurant_submissions"] as const;

export async function GET() {
  const startedAt = Date.now();
  const tables: Record<string, "ok" | "fail"> = {};

  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    await Promise.all(
      TABLES.map(async (table) => {
        try {
          const { error } = await admin
            .from(table)
            .select("id", { count: "exact", head: true });
          tables[table] = error ? "fail" : "ok";
        } catch {
          tables[table] = "fail";
        }
      }),
    );
  } else {
    TABLES.forEach((table) => {
      tables[table] = "fail";
    });
  }

  const connected = TABLES.every((table) => tables[table] === "ok");

  return NextResponse.json(
    {
      status: connected ? "ok" : "degraded",
      app: "ceyteq-general-management-system",
      supabase: connected ? "connected" : "not connected",
      tables,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    { status: connected ? 200 : 503 },
  );
}
