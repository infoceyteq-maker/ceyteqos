import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/dashboard/widgets";
import { modules } from "@/lib/modules";

export const metadata: Metadata = { title: "Web Studio" };

export default function StudioPage() {
  const mod = modules.find((m) => m.key === "studio")!;
  return <ComingSoonPage mod={mod} />;
}
