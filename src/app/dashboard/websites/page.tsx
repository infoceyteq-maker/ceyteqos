import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/dashboard/widgets";
import { modules } from "@/lib/modules";

export const metadata: Metadata = { title: "Websites" };

export default function WebsitesPage() {
  const mod = modules.find((m) => m.key === "websites")!;
  return <ComingSoonPage mod={mod} />;
}
