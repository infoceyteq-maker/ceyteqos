/**
 * Inline SVG icon set (stroke style, currentColor). No external dependency,
 * so icons render identically offline and inherit brand colours from CSS.
 */

type IconProps = { className?: string };

function base(path: React.ReactNode) {
  return function Icon({ className = "h-5 w-5" }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };
}

export const OverviewIcon = base(
  <>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </>,
);

export const DepartmentsIcon = base(
  <>
    <rect x="9" y="3" width="6" height="5" rx="1.5" />
    <rect x="3" y="16" width="6" height="5" rx="1.5" />
    <rect x="15" y="16" width="6" height="5" rx="1.5" />
    <path d="M12 8v4M6 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
  </>,
);

export const EmployeesIcon = base(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
    <path d="M16 5.4a3.2 3.2 0 0 1 0 5.9M17.8 15.4c1.4.7 2.4 2 2.7 4.1" />
  </>,
);

export const LeadsIcon = base(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-5 4z" />
    <path d="M8 8h8M8 11.5h5" />
  </>,
);

export const StudioIcon = base(
  <>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4" />
  </>,
);

export const WebsitesIcon = base(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.3 3.4 5.2 3.4 8.5s-1.1 6.2-3.4 8.5c-2.3-2.3-3.4-5.2-3.4-8.5S9.7 5.8 12 3.5Z" />
  </>,
);

export const MoreIcon = base(
  <>
    <path d="M12 5v14M5 12h14" />
  </>,
);

export const SettingsIcon = base(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8" />
  </>,
);

export const SearchIcon = base(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.8-3.8" />
  </>,
);

export const BellIcon = base(
  <>
    <path d="M6 16v-5a6 6 0 1 1 12 0v5l1.2 2.6a1 1 0 0 1-.9 1.4H5.7a1 1 0 0 1-.9-1.4Z" />
    <path d="M10 20a2.2 2.2 0 0 0 4 0" />
  </>,
);

export const LogoutIcon = base(
  <>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8l-4 4 4 4M6 12h11" />
  </>,
);

export const MenuIcon = base(
  <>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </>,
);

export const CloseIcon = base(
  <>
    <path d="M6 6l12 12M18 6 6 18" />
  </>,
);

export const ChevronLeftIcon = base(<path d="m14.5 5.5-6.5 6.5 6.5 6.5" />);
export const ChevronRightIcon = base(<path d="m9.5 5.5 6.5 6.5-6.5 6.5" />);
export const ChevronDownIcon = base(<path d="m5.5 9.5 6.5 6.5 6.5-6.5" />);

export const MailIcon = base(
  <>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </>,
);

export const LockIcon = base(
  <>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
  </>,
);

export const EyeIcon = base(
  <>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </>,
);

export const EyeOffIcon = base(
  <>
    <path d="M4 4l16 16" />
    <path d="M9.9 6.2A8.4 8.4 0 0 1 12 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3 3.5M6.1 8A16.6 16.6 0 0 0 2.5 12S6 18.2 12 18.2c1.2 0 2.3-.2 3.3-.6" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 4.2 4.2" />
  </>,
);

export const PhoneIcon = base(
  <>
    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  </>,
);

export const ShieldIcon = base(
  <>
    <path d="M12 3 5 5.8v5.4c0 4.6 2.9 7.7 7 9.3 4.1-1.6 7-4.7 7-9.3V5.8Z" />
    <path d="m9.2 12 2 2 3.6-4" />
  </>,
);

export const SessionsIcon = base(
  <>
    <rect x="3" y="4.5" width="13" height="9" rx="2" />
    <path d="M7 17.5h6" />
    <rect x="17" y="9" width="4.5" height="9.5" rx="1.6" />
  </>,
);

export const ClockIcon = base(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);

export const PlusIcon = base(<path d="M12 5v14M5 12h14" />);

export const ArrowRightIcon = base(<path d="M4 12h15M13.5 6 19.5 12l-6 6" />);

export const UserIcon = base(
  <>
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M5 20c.8-3.4 3.6-5 7-5s6.2 1.6 7 5" />
  </>,
);

export const BuildingIcon = base(
  <>
    <rect x="5" y="3.5" width="11" height="17" rx="1.8" />
    <path d="M16 9.5h3a1 1 0 0 1 1 1v10M3.5 20.5h17M8.5 7.5h2M8.5 11h2M8.5 14.5h2M12 7.5h1.5M12 11h1.5" />
  </>,
);

export const ActivityIcon = base(<path d="M3.5 12h4l2.5-6 4 12 2.5-6h4" />);

export const AdminBadgeIcon = base(
  <>
    <path d="m12 3 2.2 2.1 3-.4 1 2.9 2.7 1.4-1.2 2.8 1.2 2.8-2.7 1.4-1 2.9-3-.4L12 20.8l-2.2-2.1-3 .4-1-2.9L3.1 14.8 4.3 12 3.1 9.2 5.8 7.8l1-2.9 3 .4Z" />
    <path d="m9.3 12 1.9 1.9 3.5-3.9" />
  </>,
);

/* ── Brand / social glyphs (filled, currentColor) ────────────────────────── */

function brand(path: React.ReactNode, viewBox = "0 0 24 24") {
  return function BrandIcon({ className = "h-4.5 w-4.5" }: IconProps) {
    return (
      <svg viewBox={viewBox} fill="currentColor" className={className} aria-hidden="true">
        {path}
      </svg>
    );
  };
}

export const WhatsAppIcon = brand(
  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91C21.94 6.45 17.5 2 12.04 2m0 18.14a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24 4.54 0 8.23 3.7 8.23 8.24 0 4.54-3.7 8.24-8.24 8.24m4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28" />,
);

export const FacebookIcon = brand(
  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12" />,
);

export const InstagramIcon = brand(
  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84m0 10.15A4 4 0 1 1 16 12a4 4 0 0 1-4 3.99m6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44" />,
);

export const LinkedInIcon = brand(
  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 2.06-2.06 2.06 2.06 0 0 1-2.06 2.06M7.12 20.45H3.56V9h3.56zM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.75 1.75 0 0 0 24 22.27V1.73A1.75 1.75 0 0 0 22.22 0" />,
);

export const PinterestIcon = brand(
  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.18-2.4.04-3.44l1.4-5.96s-.36-.72-.36-1.78c0-1.66.97-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.68 0 1.03-.65 2.56-1 3.99-.28 1.19.6 2.16 1.77 2.16 2.12 0 3.76-2.24 3.76-5.47 0-2.86-2.06-4.86-5-4.86a5.2 5.2 0 0 0-5.4 5.2c0 1.03.4 2.14.89 2.74a.36.36 0 0 1 .08.35l-.33 1.36c-.05.22-.18.26-.4.16-1.5-.7-2.43-2.88-2.43-4.65 0-3.78 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.6 7.47-6.23 7.47-1.21 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.5 3.15A12 12 0 1 0 12 0" />,
);

export const TikTokIcon = brand(
  <path d="M19.59 6.7a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3-.05.6-.05.9 0V9.4a6.34 6.34 0 0 0-5.11 10.4 6.34 6.34 0 0 0 10.86-4.43V8.8a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.31-.22" />,
);

export const YouTubeIcon = brand(
  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81M9.55 15.57V8.43L15.82 12z" />,
);

export const XIcon = brand(
  <path d="M18.9 2.1h3.68l-8.04 9.19L24 23.9h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 2.1h7.59l5.24 6.93zm-1.29 19.6h2.04L6.49 4.16H4.3z" />,
);

/** Map the module-registry icon names to components. */
export const moduleIcons: Record<string, (p: IconProps) => React.ReactNode> = {
  overview: OverviewIcon,
  departments: DepartmentsIcon,
  employees: EmployeesIcon,
  leads: LeadsIcon,
  studio: StudioIcon,
  websites: WebsitesIcon,
  more: MoreIcon,
  settings: SettingsIcon,
};

/** Map site-config social keys to components. */
export const socialIcons: Record<string, (p: IconProps) => React.ReactNode> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  pinterest: PinterestIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  x: XIcon,
};
