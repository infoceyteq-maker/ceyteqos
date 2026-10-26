import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { ContactFooter } from "@/components/ContactFooter";
import { ActivityIcon, DepartmentsIcon, ShieldIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site-config";

/**
 * Shared layout for all pre-authentication pages:
 * ash background → dark navy 3D branding panel + raised form card + footer.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <main className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Branding panel (top on mobile, left on desktop) */}
        <section className="neu-dark animate-rise rounded-card-lg p-7 sm:p-9 lg:p-11">
          <Logo variant="full" priority className="mx-auto w-full max-w-md lg:mx-0" />
          <p className="mt-5 text-center font-display text-lg font-bold tracking-wide text-radium-light lg:text-left">
            {siteConfig.tagline}
          </p>
          <p className="mt-2 hidden max-w-md text-sm leading-relaxed text-[#b9cde4] lg:block">
            The Ceyteq {siteConfig.product} — one secure command centre for
            every department, studio and system we build next.
          </p>

          <ul className="mt-8 hidden space-y-4 lg:block">
            {[
              {
                icon: <ShieldIcon className="h-5 w-5" />,
                title: "Two-step sign-in",
                text: "Password plus a one-time email code on every login.",
              },
              {
                icon: <DepartmentsIcon className="h-5 w-5" />,
                title: "Hierarchy-ready",
                text: "Super Master Admin → heads → managers → employees.",
              },
              {
                icon: <ActivityIcon className="h-5 w-5" />,
                title: "Fully audited",
                text: "Every login, code and password event is recorded.",
              },
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/5 text-radium shadow-[inset_0_1px_0_rgba(143,219,247,0.35),0_0_16px_rgba(77,184,232,0.25)]">
                  {f.icon}
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-white">
                    {f.title}
                  </span>
                  <span className="block text-sm text-[#b9cde4]">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Form card */}
        <section className="neu-raised-lg animate-rise rounded-card-lg p-6 sm:p-9 lg:p-10">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-[28px]">
            {title}
          </h1>
          <p className="mb-7 mt-1.5 text-sm text-body">{subtitle}</p>
          {children}
        </section>
      </main>

      <footer className="pb-2 pt-4">
        <ContactFooter />
      </footer>
    </div>
  );
}
