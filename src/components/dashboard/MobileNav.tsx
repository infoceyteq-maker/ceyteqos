"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/Logo";
import {
  ModuleNav,
  ShellUserFooter,
  type ShellUser,
} from "@/components/dashboard/Sidebar";
import { CloseIcon, MenuIcon, moduleIcons } from "@/components/icons";
import { isModuleActive, mobilePrimaryKeys, modules } from "@/lib/modules";

/**
 * Mobile navigation: an ash bottom bar (4 primary modules + menu button)
 * and a slide-in drawer with the full module list.
 */
export function MobileNav({ user }: { user: ShellUser }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const primary = mobilePrimaryKeys
    .map((key) => modules.find((m) => m.key === key))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <>
      {/* Bottom bar */}
      <nav
        aria-label="Primary"
        className="neu-raised fixed inset-x-3 bottom-3 z-40 flex items-stretch justify-around rounded-card px-2 py-2 md:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {primary.map((mod, i) => {
          const active = isModuleActive(pathname, mod);
          const Icon = moduleIcons[mod.icon];
          const item = (
            <Link
              key={mod.key}
              href={mod.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[10px] font-bold ${
                active ? "neu-inset-sm text-navy" : "text-soft"
              }`}
            >
              <span className={active ? "text-radium" : ""}>
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </span>
              {mod.label.split(" ")[0]}
            </Link>
          );
          // Menu button sits in the middle of the bar.
          if (i === 2) {
            return (
              <span key={mod.key} className="contents">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="btn-primary -mt-6 grid h-12 w-12 shrink-0 place-items-center self-center rounded-full"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
                {item}
              </span>
            );
          }
          return item;
        })}
      </nav>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-[#0b1830]/45 backdrop-blur-[2px]"
          />
          <div className="neu-raised absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col rounded-r-[32px] p-5">
            <div className="flex items-center justify-between">
              <Logo variant="sm" className="w-32" />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="neu-raised-sm grid h-9 w-9 place-items-center rounded-full text-navy"
              >
                <CloseIcon className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
              <ModuleNav />
            </div>

            <div className="neu-inset-sm mt-4 rounded-3xl p-3.5">
              <ShellUserFooter user={user} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
