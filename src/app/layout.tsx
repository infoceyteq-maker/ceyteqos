import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} ${siteConfig.product} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description:
    "Ceyteq's general management system: secure sign-in with email verification, department hierarchy and the foundation for every future Ceyteq system.",
  applicationName: siteConfig.name,
  robots: { index: false, follow: false }, // internal staff system — keep out of search indexes
};

export const viewport: Viewport = {
  themeColor: "#e4e4e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
