/**
 * Ceyteq company contact details — single source of truth.
 * Rendered in the login footer, dashboard footer and Settings → Company.
 * All entries become real links (tel:, wa.me, mailto:, https).
 */

export const siteConfig = {
  name: "Ceyteq",
  product: "General Management System",
  tagline: "Empowering Digital Evolution",

  contacts: [
    {
      key: "hotline",
      label: "Hotline",
      value: "+94 77 66 55 493",
      href: "tel:+94776655493",
      kind: "phone" as const,
    },
    {
      key: "whatsapp-fr",
      label: "WhatsApp",
      value: "+33 7 44 28 42 69",
      href: "https://wa.me/33744284269",
      kind: "whatsapp" as const,
    },
    {
      key: "whatsapp-lk",
      label: "WhatsApp",
      value: "+94 76 860 7143",
      href: "https://wa.me/94768607143",
      kind: "whatsapp" as const,
    },
    {
      key: "mobile",
      label: "Mobile",
      value: "+94 78 860 7143",
      href: "tel:+94788607143",
      kind: "phone" as const,
    },
    {
      key: "email",
      label: "Email",
      value: "info.ceyteq@gmail.com",
      href: "mailto:info.ceyteq@gmail.com",
      kind: "email" as const,
    },
  ],

  socials: [
    {
      key: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/share/1KM2kZvaCC/",
    },
    {
      key: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/ceyteq/",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ceylon-technology",
    },
    {
      key: "pinterest",
      label: "Pinterest",
      href: "https://www.pinterest.com/infoceyteq/",
    },
    {
      key: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@ceyteq?lang=en-GB",
    },
    {
      key: "youtube",
      label: "YouTube",
      href: "https://youtube.com/@ceylontechnology-ceyteq",
    },
    { key: "x", label: "X", href: "https://x.com/CeylonTech22598" },
  ],
} as const;

export type ContactKind = (typeof siteConfig.contacts)[number]["kind"];
export type SocialKey = (typeof siteConfig.socials)[number]["key"];
