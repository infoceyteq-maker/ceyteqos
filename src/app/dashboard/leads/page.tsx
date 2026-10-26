import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/dashboard/widgets";
import { modules } from "@/lib/modules";

export const metadata: Metadata = { title: "Leads & Forms" };

export default function LeadsPage() {
  const mod = modules.find((m) => m.key === "leads")!;
  return <ComingSoonPage mod={mod} />;
}
