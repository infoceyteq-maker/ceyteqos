import Image from "next/image";

/**
 * The Ceyteq 3D logo (transparent PNG cut from the supplied artwork).
 *  - "full"  : complete lockup incl. tagline (login, large placements)
 *  - "sm"    : same lockup, smaller file (sidebar header)
 *  - "icon"  : the "C / signal" symbol only (collapsed sidebar, favicon)
 */
export function Logo({
  variant = "full",
  className = "",
  priority = false,
}: {
  variant?: "full" | "sm" | "icon";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "icon") {
    return (
      <Image
        src="/brand/ceyteq-icon.png"
        alt="Ceyteq"
        width={512}
        height={512}
        priority={priority}
        className={`logo-3d ${className}`}
      />
    );
  }

  return (
    <Image
      src={variant === "full" ? "/brand/ceyteq-logo.png" : "/brand/ceyteq-logo-sm.png"}
      alt="CEYTEQ — Empowering Digital Evolution"
      width={variant === "full" ? 1600 : 640}
      height={variant === "full" ? 672 : 269}
      priority={priority}
      className={`logo-3d ${className}`}
    />
  );
}
