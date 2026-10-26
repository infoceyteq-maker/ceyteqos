import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/dashboard/widgets";
import { modules } from "@/lib/modules";

export const metadata: Metadata = { title: "More Systems" };

export default function MoreSystemsPage() {
  const mod = modules.find((m) => m.key === "more")!;
  return <ComingSoonPage mod={mod} />;
}
