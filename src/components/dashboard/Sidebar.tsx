"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/brand/Logo";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LogoutIcon,
  moduleIcons,
} from "@/components/icons";
import { isModuleActive, modules, type AppModule } from "@/lib/modules";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { initials } from "@/lib/format";

export interface ShellUser {
  fullName: string;
  email: string;
  role: Role;
}

const COLLAPSE_KEY = "ceyteq-sidebar-collapsed";

/* ── Shared module navigation (sidebar + mobile drawer) ──────────────────── */

export function ModuleNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Modules" className="space-y-1.5">
      {modules.map((mod) => {
        const active = isModuleActive(pathname, mod);
        const Icon = moduleIcons[mod.icon];
        return (
          <Link
            key={mod.key}
            href={mod.href}
            title={collapsed ? mod.label : undefined}
            aria-current={active ? "page" : undefined}
            className={[
              "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-all duration-250",
              collapsed ? "justify-center px-2" : "",
              active
                ? "neu-inset-sm nav-active-bar font-bold text-navy"
                : "font-semibold text-body hover:shadow-raised-sm hover:text-navy",
            ].join(" ")}
          >
            <span className={active ? "text-radium" : "text-soft group-hover:text-radium"}>
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </span>
            {!collapsed && <span className="min-w-0 flex-1 truncate">{mod.label}</span>}
            {!collapsed && mod.status === "soon" && (
              <span className="rounded-full bg-navy px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-radium-light">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ── User block + logout (sidebar footer / drawer footer) ────────────────── */

export function ShellUserFooter({ user, collapsed = false }: { user: ShellUser; collapsed?: boolean }) {
  return (
    <div className={collapsed ? "flex flex-col items-center gap-3" : ""}>
      <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
        <span className="neu-raised-sm grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold text-navy">
          {initials(user.fullName)}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-navy">{user.fullName}</p>
            <p className="truncate text-xs text-soft">{user.email}</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-radium-light shadow-[0_4px_14px_rgba(77,184,232,0.35)]">
          <span className="h-1.5 w-1.5 rounded-full bg-radium" />
          {ROLE_LABELS[user.role]}
        </span>
      )}

      <form action={signOutAction.bind(null, "local")} className={collapsed ? "" : "mt-3.5"}>
        <button
          type="submit"
          title="Sign out"
          className={`btn-neu inline-flex items-center justify-center gap-2 rounded-full font-bold text-navy ${
            collapsed ? "h-10 w-10" : "w-full px-4 py-2.5 text-sm"
          }`}
        >
          <LogoutIcon className="h-4.5 w-4.5" />
          {!collapsed && "Sign out"}
        </button>
      </form>
    </div>
  );
}

/* ── Desktop collapsible sidebar ─────────────────────────────────────────── */

export function Sidebar({ user }: { user: ShellUser }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage unavailable — stay expanded */
    }
  }, []);

  function toggle() {
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !v;
    });
  }

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col p-4 transition-all duration-300 md:flex ${
        collapsed ? "w-[92px]" : "w-72 xl:w-80"
      }`}
    >
      <div className="neu-raised flex h-full flex-col rounded-card-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-1 pb-4 pt-1">
          {collapsed ? (
            <Logo variant="icon" className="mx-auto h-10 w-10" />
          ) : (
            <Logo variant="sm" priority className="w-36 xl:w-40" />
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="neu-raised-sm neu-lift grid h-8 w-8 shrink-0 place-items-center rounded-full text-navy"
          >
            {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-0.5 py-1">
          <ModuleNav collapsed={collapsed} />
        </div>

        {/* Footer */}
        <div className="neu-inset-sm mt-4 rounded-3xl p-3.5">
          <ShellUserFooter user={user} collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}
