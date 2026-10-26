import type { Metadata } from "next";

import { HierarchyTree } from "@/components/dashboard/HierarchyTree";
import { ComingSoonCard, StatPanel } from "@/components/dashboard/widgets";
import {
  ClockIcon,
  DepartmentsIcon,
  EmployeesIcon,
  SessionsIcon,
  ShieldIcon,
} from "@/components/icons";
import { getCurrentProfile, getOverviewData } from "@/lib/data";
import { auditLabel, formatDateTime, formatLongDate, greetingForNow } from "@/lib/format";
import { comingSoonModules } from "@/lib/modules";

export const metadata: Metadata = { title: "Overview" };

function activityDot(action: string): string {
  if (action === "login" || action === "otp_verified") return "bg-success";
  if (action === "login_failed" || action === "otp_failed") return "bg-danger";
  if (action.includes("password")) return "bg-warning";
  return "bg-radium";
}

export default async function OverviewPage() {
  const profile = await getCurrentProfile();
  const data = await getOverviewData(profile.id);
  const firstName = profile.full_name.trim().split(/\s+/)[0] ?? "there";

  return (
    <div className="animate-rise space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          {greetingForNow()}, {firstName}
        </h2>
        <p className="mt-1 text-sm text-body">{formatLongDate()} · Ceyteq organisation snapshot</p>
      </div>

      {/* Dark stat panels */}
      <section className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
        <StatPanel
          label="Departments"
          value={String(data.departmentCount)}
          sub="Nested teams under Ceyteq"
          icon={<DepartmentsIcon className="h-5 w-5" />}
        />
        <StatPanel
          label="Employees"
          value={String(data.employeeCount)}
          sub="People with system access"
          icon={<EmployeesIcon className="h-5 w-5" />}
        />
        <StatPanel
          label="Active sessions"
          value={String(data.activeSessions)}
          sub="Signed in during the last 30 minutes"
          icon={<SessionsIcon className="h-5 w-5" />}
        />
        <StatPanel
          label="Last login"
          value={data.lastLogin ? formatDateTime(data.lastLogin.created_at).split(",")[0]! : "—"}
          sub={
            data.lastLogin
              ? formatDateTime(data.lastLogin.created_at).split(",").slice(1).join(",").trim()
              : "Your most recent sign-in"
          }
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </section>

      {/* Hierarchy + security activity */}
      <section className="grid gap-5 lg:grid-cols-5">
        <div className="neu-raised rounded-card-lg p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-3">
            <span className="neu-dark grid h-10 w-10 place-items-center rounded-2xl text-radium-light">
              <DepartmentsIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-navy">Organisation hierarchy</h3>
              <p className="text-xs text-soft">Super Master Admin → Departments → Employees</p>
            </div>
          </div>
          <HierarchyTree
            departments={data.departments}
            adminName={profile.full_name}
            employeeCount={data.employeeCount}
          />
        </div>

        <div className="neu-raised rounded-card-lg p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <span className="neu-dark grid h-10 w-10 place-items-center rounded-2xl text-radium-light">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-navy">Recent security activity</h3>
              <p className="text-xs text-soft">From the audit log</p>
            </div>
          </div>

          {data.recentActivity.length === 0 ? (
            <p className="neu-inset-sm rounded-2xl px-4 py-6 text-center text-sm text-body">
              No activity recorded yet — events will appear here as people sign in.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {data.recentActivity.map((event) => (
                <li
                  key={event.id}
                  className="neu-inset-sm flex items-center gap-3 rounded-2xl px-4 py-3"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${activityDot(event.action)}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-navy">
                      {auditLabel(event.action)}
                    </span>
                    <span className="block truncate text-xs text-soft">
                      {event.email ?? "—"} · {formatDateTime(event.created_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Future modules */}
      <section>
        <h3 className="mb-4 font-display text-lg font-bold text-navy">Systems in preparation</h3>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {comingSoonModules.map((mod) => (
            <ComingSoonCard key={mod.key} mod={mod} />
          ))}
        </div>
      </section>
    </div>
  );
}
