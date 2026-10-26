import type { Metadata } from "next";
import type { ReactNode } from "react";

import { signOutAction } from "@/app/auth/actions";
import { ContactFooter } from "@/components/ContactFooter";
import { ChangePasswordForm, ProfileForm } from "@/components/dashboard/SettingsForms";
import { RoleBadge } from "@/components/dashboard/widgets";
import {
  ActivityIcon,
  BuildingIcon,
  LockIcon,
  LogoutIcon,
  SessionsIcon,
  UserIcon,
} from "@/components/icons";
import { getAuditLog, getCurrentProfile, getCurrentSessionInfo } from "@/lib/data";
import { auditLabel, formatDateTime, shortUserAgent } from "@/lib/format";

export const metadata: Metadata = { title: "Settings" };

function Section({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="neu-raised scroll-mt-32 rounded-card-lg p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="neu-dark grid h-10 w-10 place-items-center rounded-2xl text-radium-light">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-navy">{title}</h3>
          <p className="text-xs text-soft">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const [sessionInfo, audit] = await Promise.all([
    getCurrentSessionInfo(profile.id),
    getAuditLog(20),
  ]);
  const isAdmin = profile.role === "super_master_admin";

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy">
            Settings
          </h2>
          <p className="mt-1 text-sm text-body">Your account, security and company details.</p>
        </div>
        <RoleBadge role={profile.role} />
      </div>

      {/* Jump links */}
      <nav aria-label="Settings sections" className="flex flex-wrap gap-2.5">
        {[
          ["profile", "Profile"],
          ["password", "Password"],
          ["sessions", "Sessions"],
          ["audit", "Audit log"],
          ["company", "Company"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="btn-neu rounded-full px-4 py-2 text-sm font-bold"
          >
            {label}
          </a>
        ))}
      </nav>

      <Section
        id="profile"
        icon={<UserIcon className="h-5 w-5" />}
        title="Profile"
        description="How you appear across the Ceyteq systems."
      >
        <ProfileForm fullName={profile.full_name} email={profile.email} />
      </Section>

      <Section
        id="password"
        icon={<LockIcon className="h-5 w-5" />}
        title="Change password"
        description="You'll need your current password to set a new one."
      >
        <ChangePasswordForm />
      </Section>

      <Section
        id="sessions"
        icon={<SessionsIcon className="h-5 w-5" />}
        title="Sessions"
        description="Sessions sign out automatically after 30 minutes idle."
      >
        <div className="neu-inset-sm flex flex-wrap items-center gap-3 rounded-3xl px-5 py-4">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy">This device</p>
            <p className="truncate text-xs text-soft">
              {sessionInfo
                ? `${shortUserAgent(sessionInfo.user_agent)} · signed in ${formatDateTime(sessionInfo.created_at)}`
                : "Current session"}
            </p>
          </div>
          <span className="rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-radium-light">
            Current
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <form action={signOutAction.bind(null, "local")}>
            <button
              type="submit"
              className="btn-neu inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
            >
              <LogoutIcon className="h-4.5 w-4.5" />
              Sign out
            </button>
          </form>
          <form action={signOutAction.bind(null, "global")}>
            <button
              type="submit"
              className="btn-neu inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-danger"
            >
              <LogoutIcon className="h-4.5 w-4.5" />
              Sign out everywhere
            </button>
          </form>
        </div>
        <p className="mt-3 text-xs text-soft">
          “Sign out everywhere” ends every session on all devices — useful if
          you think your account was used somewhere else.
        </p>
      </Section>

      <Section
        id="audit"
        icon={<ActivityIcon className="h-5 w-5" />}
        title="Audit log"
        description={
          isAdmin
            ? "Latest security events across all accounts (IPs are stored hashed)."
            : "Your latest security events (IPs are stored hashed)."
        }
      >
        {audit.length === 0 ? (
          <p className="neu-inset-sm rounded-2xl px-4 py-6 text-center text-sm text-body">
            No events recorded yet.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {audit.map((event) => (
              <li
                key={event.id}
                className="neu-inset-sm flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-navy">
                    {auditLabel(event.action)}
                  </span>
                  <span className="block truncate text-xs text-soft">
                    {event.email ?? "—"} · {shortUserAgent(event.user_agent)}
                  </span>
                </span>
                <span className="text-xs font-semibold text-body">
                  {formatDateTime(event.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        id="company"
        icon={<BuildingIcon className="h-5 w-5" />}
        title="Company"
        description="Ceyteq contact channels — from src/lib/site-config.ts."
      >
        <ContactFooter variant="full" />
      </Section>
    </div>
  );
}
