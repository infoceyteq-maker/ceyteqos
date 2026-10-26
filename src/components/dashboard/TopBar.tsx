"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { signOutAction } from "@/app/auth/actions";
import type { ShellUser } from "@/components/dashboard/Sidebar";
import {
  BellIcon,
  ChevronDownIcon,
  LogoutIcon,
  SearchIcon,
  SettingsIcon,
  moduleIcons,
} from "@/components/icons";
import { isModuleActive, modules } from "@/lib/modules";
import { ROLE_LABELS } from "@/lib/permissions";
import { initials } from "@/lib/format";

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

export function TopBar({ user }: { user: ShellUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeModule = modules.find((m) => isModuleActive(pathname, m));
  const title = activeModule?.label ?? "Dashboard";

  /* Module quick-search */
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useOutsideClose(() => setSearchOpen(false));
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return modules.filter(
      (m) => m.label.toLowerCase().includes(q) || m.blurb.toLowerCase().includes(q),
    );
  }, [query]);

  /* Notifications */
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useOutsideClose(() => setBellOpen(false));

  /* Profile menu */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useOutsideClose(() => setMenuOpen(false));

  useEffect(() => {
    setSearchOpen(false);
    setBellOpen(false);
    setMenuOpen(false);
    setQuery("");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="neu-raised flex items-center gap-3 rounded-card px-4 py-3 sm:gap-4 sm:px-5">
        <h1 className="min-w-0 flex-1 truncate font-display text-lg font-extrabold tracking-tight text-navy sm:text-xl">
          {title}
        </h1>

        {/* Search */}
        <div ref={searchRef} className="relative hidden w-64 sm:block lg:w-80">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft">
            <SearchIcon className="h-4.5 w-4.5" />
          </span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) router.push(results[0].href);
            }}
            placeholder="Search modules…"
            aria-label="Search modules"
            className="input-inset w-full rounded-full py-2.5 pl-11 pr-4 text-sm font-medium"
          />
          {searchOpen && query.trim() && (
            <div className="neu-raised absolute left-0 right-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-3xl p-2">
              {results.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-soft">No modules match “{query}”.</p>
              ) : (
                results.map((m) => {
                  const Icon = moduleIcons[m.icon];
                  return (
                    <Link
                      key={m.key}
                      href={m.href}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-navy transition-shadow hover:shadow-inset-soft-sm"
                    >
                      <span className="text-radium">{Icon ? <Icon className="h-4.5 w-4.5" /> : null}</span>
                      {m.label}
                      {m.status === "soon" && (
                        <span className="ml-auto rounded-full bg-navy px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-radium-light">
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => setBellOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={bellOpen}
            className="neu-raised-sm neu-lift relative grid h-10 w-10 place-items-center rounded-full text-navy"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          {bellOpen && (
            <div className="neu-raised absolute right-0 top-[calc(100%+10px)] z-40 w-72 rounded-3xl p-4">
              <p className="font-display text-sm font-bold text-navy">Notifications</p>
              <p className="mt-1.5 text-sm leading-relaxed text-body">
                You&apos;re all caught up. Alerts from future modules will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Profile menu"
            aria-expanded={menuOpen}
            className="neu-raised-sm neu-lift flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2.5"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy font-display text-xs font-extrabold text-radium-light">
              {initials(user.fullName)}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-bold text-navy lg:block">
              {user.fullName}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-soft" />
          </button>

          {menuOpen && (
            <div className="neu-raised absolute right-0 top-[calc(100%+10px)] z-40 w-72 rounded-3xl p-4">
              <p className="truncate font-display text-sm font-bold text-navy">{user.fullName}</p>
              <p className="truncate text-xs text-soft">{user.email}</p>
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-radium-light">
                <span className="h-1.5 w-1.5 rounded-full bg-radium" />
                {ROLE_LABELS[user.role]}
              </span>

              <div className="mt-3.5 space-y-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-semibold text-navy transition-shadow hover:shadow-inset-soft-sm"
                >
                  <SettingsIcon className="h-4.5 w-4.5 text-radium" />
                  Settings
                </Link>
                <form action={signOutAction.bind(null, "local")}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-navy transition-shadow hover:shadow-inset-soft-sm"
                  >
                    <LogoutIcon className="h-4.5 w-4.5 text-radium" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
