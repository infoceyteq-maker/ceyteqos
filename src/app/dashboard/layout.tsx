import type { ReactNode } from "react";

import { ContactFooter } from "@/components/ContactFooter";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { Sidebar, type ShellUser } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { getCurrentProfile } from "@/lib/data";

/**
 * Dashboard shell: collapsible sidebar (desktop), top bar, and a mobile
 * bottom bar + drawer. All navigation renders from src/lib/modules.ts.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  const user: ShellUser = {
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
  };

  return (
    <div className="flex min-h-dvh">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-8 lg:px-8">
          {children}
        </main>

        <footer className="mx-auto hidden w-full max-w-7xl px-4 pb-7 sm:px-6 md:block lg:px-8">
          <div className="neu-raised rounded-card px-6 py-5">
            <ContactFooter />
          </div>
        </footer>
      </div>

      <MobileNav user={user} />
    </div>
  );
}
