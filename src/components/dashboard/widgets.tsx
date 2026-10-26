import Link from "next/link";
import type { ReactNode } from "react";

import { moduleIcons } from "@/components/icons";
import type { AppModule } from "@/lib/modules";
import { ROLE_LABELS, type Role } from "@/lib/permissions";

/* ── Dark navy stat panel ────────────────────────────────────────────────── */

export function StatPanel({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="neu-dark rounded-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-radium-light">
          {label}
        </p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-radium shadow-[inset_0_1px_0_rgba(143,219,247,0.35),0_0_14px_rgba(77,184,232,0.3)]">
          {icon}
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#9fb8d4]">{sub}</p>}
    </div>
  );
}

/* ── Role badge ──────────────────────────────────────────────────────────── */

export function RoleBadge({ role, className = "" }: { role: Role; className?: string }) {
  if (role === "super_master_admin") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-radium-light shadow-[0_4px_14px_rgba(77,184,232,0.35)] ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-radium animate-pulse-glow" />
        {ROLE_LABELS[role]}
      </span>
    );
  }
  return (
    <span
      className={`neu-inset-sm inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-navy ${className}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

/* ── Status pill ─────────────────────────────────────────────────────────── */

export function StatusPill({ status }: { status: string }) {
  const colour =
    status === "active"
      ? "text-success"
      : status === "invited"
        ? "text-warning"
        : "text-danger";
  const dot =
    status === "active" ? "bg-success" : status === "invited" ? "bg-warning" : "bg-danger";
  return (
    <span className={`neu-inset-sm inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${colour}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

/* ── Coming-soon module card / full placeholder ──────────────────────────── */

export function ComingSoonCard({ mod }: { mod: AppModule }) {
  const Icon = moduleIcons[mod.icon];
  return (
    <Link
      href={mod.href}
      className="neu-raised neu-lift group block rounded-card p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="neu-dark grid h-12 w-12 place-items-center rounded-2xl text-radium-light">
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </span>
        <span className="rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-radium-light">
          Coming soon
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-navy group-hover:text-blue-brand">
        {mod.label}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-body">{mod.blurb}</p>
    </Link>
  );
}

export function ComingSoonPage({ mod }: { mod: AppModule }) {
  const Icon = moduleIcons[mod.icon];
  return (
    <div className="neu-raised animate-rise rounded-card-lg px-6 py-14 text-center sm:px-10">
      <span className="neu-dark mx-auto grid h-20 w-20 place-items-center rounded-[26px] text-radium-light">
        {Icon ? <Icon className="h-10 w-10" /> : null}
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-navy">
        {mod.label}
      </h1>
      <span className="mt-3 inline-block rounded-full bg-navy px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-radium-light shadow-[0_6px_18px_rgba(77,184,232,0.35)]">
        Coming soon · Phase 2
      </span>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-body">{mod.blurb}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-soft">
        This module is scaffolded in the registry and navigation. Its
        features arrive in the next phase — no restructuring needed.
      </p>
    </div>
  );
}

/* ── Generic empty state ─────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="neu-inset rounded-card px-6 py-12 text-center">
      <span className="neu-raised-sm mx-auto grid h-16 w-16 place-items-center rounded-3xl text-radium">
        {icon}
      </span>
      <h3 className="mt-5 font-display text-lg font-bold text-navy">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-body">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
