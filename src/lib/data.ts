import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuditLog, Department, Profile } from "@/lib/database.types";

/**
 * Server-side data access for the dashboard. Everything runs through the
 * cookie-scoped Supabase client, so Row Level Security decides what the
 * signed-in user can see (Super Master Admin → all rows).
 */

/** The signed-in, OTP-verified user's profile. Redirects when absent. */
export const getCurrentProfile = cache(async (): Promise<Profile> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Defence in depth — middleware already enforces the second factor.
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (!meta?.mfa_verified_at) redirect("/verify");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  // Profile row missing (e.g. created before the trigger existed) — fall
  // back to the auth record instead of breaking the whole shell.
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (meta?.full_name as string | undefined) ?? "Ceyteq User",
    role: "employee",
    department_id: null,
    manager_id: null,
    status: "active",
    created_at: user.created_at,
    updated_at: user.created_at,
  };
});

export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as Department[];
}

export async function getEmployees(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });
  return (data ?? []) as Profile[];
}

export async function getAuditLog(limit = 20): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AuditLog[];
}

export interface OverviewData {
  departmentCount: number;
  employeeCount: number;
  /** Distinct users with a successful login in the last 30 minutes. */
  activeSessions: number;
  lastLogin: AuditLog | null;
  recentActivity: AuditLog[];
  departments: Department[];
}

export async function getOverviewData(userId: string): Promise<OverviewData> {
  const supabase = await createClient();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const [deptCount, empCount, recentLogins, lastLoginRes, activityRes, departments] =
    await Promise.all([
      supabase.from("departments").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("audit_logs")
        .select("user_id")
        .eq("action", "login")
        .gte("created_at", thirtyMinAgo)
        .limit(200),
      supabase
        .from("audit_logs")
        .select("*")
        .eq("action", "login")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(7),
      getDepartments(),
    ]);

  const activeSessions = new Set(
    (recentLogins.data ?? []).map((r) => r.user_id).filter(Boolean),
  ).size;

  return {
    departmentCount: deptCount.count ?? 0,
    employeeCount: empCount.count ?? 0,
    activeSessions,
    lastLogin: (lastLoginRes.data as AuditLog | null) ?? null,
    recentActivity: (activityRes.data ?? []) as AuditLog[],
    departments,
  };
}

/** Latest successful login (for the Settings → Sessions card). */
export async function getCurrentSessionInfo(userId: string): Promise<AuditLog | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("action", "login")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as AuditLog | null) ?? null;
}
