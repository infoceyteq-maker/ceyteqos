import { siteConfig } from "@/lib/site-config";
import { MailIcon, PhoneIcon, WhatsAppIcon, socialIcons } from "@/components/icons";

/**
 * Company contact block rendered from site-config (single source of truth).
 *  - "compact": one slim row for the login/dashboard footers.
 *  - "full":    labelled cards for Settings → Company.
 */

function contactIcon(kind: string) {
  if (kind === "whatsapp") return <WhatsAppIcon className="h-4 w-4" />;
  if (kind === "email") return <MailIcon className="h-4 w-4" />;
  return <PhoneIcon className="h-4 w-4" />;
}

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {siteConfig.socials.map((s) => {
        const Icon = socialIcons[s.key];
        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ceyteq on ${s.label}`}
            title={`Ceyteq on ${s.label}`}
            className="neu-raised-sm neu-lift grid h-9 w-9 place-items-center rounded-full text-navy transition-colors hover:text-blue-brand"
          >
            {Icon ? <Icon className="h-4 w-4" /> : s.label[0]}
          </a>
        );
      })}
    </div>
  );
}

export function ContactFooter({ variant = "compact" }: { variant?: "compact" | "full" }) {
  if (variant === "full") {
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {siteConfig.contacts.map((c) => (
            <a
              key={c.key}
              href={c.href}
              {...(c.kind === "whatsapp"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="neu-inset-sm group flex items-center gap-3.5 rounded-3xl px-5 py-4"
            >
              <span className="neu-dark grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-radium-light">
                {contactIcon(c.kind)}
              </span>
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-soft">
                  {c.label}
                </span>
                <span className="block font-semibold text-navy group-hover:text-blue-brand">
                  {c.value}
                </span>
              </span>
            </a>
          ))}
        </div>
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-soft">
            Follow Ceyteq
          </p>
          <div className="flex flex-wrap gap-2.5">
            {siteConfig.socials.map((s) => {
              const Icon = socialIcons[s.key];
              return (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-raised-sm neu-lift inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-navy hover:text-blue-brand"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
        {siteConfig.contacts.map((c) => (
          <a
            key={c.key}
            href={c.href}
            {...(c.kind === "whatsapp"
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex items-center gap-1.5 font-semibold text-navy/80 transition-colors hover:text-blue-brand"
          >
            <span className="text-radium">{contactIcon(c.kind)}</span>
            <span className="hidden text-soft sm:inline">{c.label}:</span> {c.value}
          </a>
        ))}
      </div>
      <SocialLinks className="justify-center" />
      <p className="text-xs text-soft">
        © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.tagline}
      </p>
    </div>
  );
}
