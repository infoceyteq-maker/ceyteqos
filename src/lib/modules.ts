/**
 * Module registry — the single source of truth for navigation.
 *
 * The sidebar, mobile bottom bar, drawer and dashboard "module" cards all
 * render from this list. To add a new department/module in a later phase:
 *   1. Add one entry here (status: "live").
 *   2. Create its route folder under src/app/dashboard/<key>/.
 * Nothing else needs to change.
 */

export type ModuleIcon =
  | "overview"
  | "departments"
  | "employees"
  | "leads"
  | "studio"
  | "websites"
  | "more"
  | "settings";

export interface AppModule {
  key: string;
  label: string;
  icon: ModuleIcon;
  href: string;
  status: "live" | "soon";
  blurb: string;
  children?: AppModule[];
}

export const modules: AppModule[] = [
  {
    key: "overview",
    label: "Overview",
    icon: "overview",
    href: "/dashboard",
    status: "live",
    blurb: "Organisation snapshot, hierarchy and recent security activity.",
  },
  {
    key: "departments",
    label: "Departments",
    icon: "departments",
    href: "/dashboard/departments",
    status: "live",
    blurb: "Nested department tree — Ceyteq → studios → teams.",
  },
  {
    key: "employees",
    label: "Employees",
    icon: "employees",
    href: "/dashboard/employees",
    status: "live",
    blurb: "People, roles and reporting lines across every department.",
  },
  {
    key: "leads",
    label: "Leads & Forms",
    icon: "leads",
    href: "/dashboard/leads",
    status: "soon",
    blurb: "Capture, qualify and route enquiries from every channel.",
  },
  {
    key: "studio",
    label: "Web Studio",
    icon: "studio",
    href: "/dashboard/studio",
    status: "soon",
    blurb: "Design and development workflow for client projects.",
  },
  {
    key: "websites",
    label: "Websites",
    icon: "websites",
    href: "/dashboard/websites",
    status: "soon",
    blurb: "Every managed website, domain and deployment in one place.",
  },
  {
    key: "more",
    label: "More Systems",
    icon: "more",
    href: "/dashboard/more",
    status: "soon",
    blurb: "Future Ceyteq systems plug in here — one registry entry each.",
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    href: "/dashboard/settings",
    status: "live",
    blurb: "Profile, password, sessions, audit log and company details.",
    children: [
      {
        key: "settings-profile",
        label: "Profile",
        icon: "settings",
        href: "/dashboard/settings#profile",
        status: "live",
        blurb: "",
      },
      {
        key: "settings-password",
        label: "Password",
        icon: "settings",
        href: "/dashboard/settings#password",
        status: "live",
        blurb: "",
      },
      {
        key: "settings-sessions",
        label: "Sessions",
        icon: "settings",
        href: "/dashboard/settings#sessions",
        status: "live",
        blurb: "",
      },
      {
        key: "settings-audit",
        label: "Audit log",
        icon: "settings",
        href: "/dashboard/settings#audit",
        status: "live",
        blurb: "",
      },
      {
        key: "settings-company",
        label: "Company",
        icon: "settings",
        href: "/dashboard/settings#company",
        status: "live",
        blurb: "",
      },
    ],
  },
];

/** Modules shown as "Coming soon" cards on the Overview page. */
export const comingSoonModules = modules.filter((m) => m.status === "soon");

/** The four destinations pinned in the mobile bottom bar. */
export const mobilePrimaryKeys = ["overview", "departments", "employees", "settings"];

export function isModuleActive(pathname: string, mod: AppModule): boolean {
  if (mod.key === "overview") return pathname === "/dashboard";
  const base = mod.href.split("#")[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}
