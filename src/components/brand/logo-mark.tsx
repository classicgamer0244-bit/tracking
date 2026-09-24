import { cn } from "@/lib/utils";

/**
 * ShipTrack's mark: an isometric crate with a location pin locked onto its
 * corner — "a package, being tracked" in one glyph. Reads clearly down to
 * favicon size; `mono` renders it as a single currentColor shape for
 * contexts where the two-tone version won't have enough contrast.
 */
export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  if (mono) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={cn("h-8 w-8", className)} xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="currentColor" />
        <path
          d="M16 8.5 24 12.5V20.5L16 24.5 8 20.5V12.5L16 8.5Z"
          stroke="var(--background)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M8 12.5 16 16.5 24 12.5" stroke="var(--background)" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M16 16.5V24.5" stroke="var(--background)" strokeWidth="1.8" />
        <circle cx="23.5" cy="9.5" r="4" fill="var(--background)" />
        <circle cx="23.5" cy="9.5" r="1.4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("h-8 w-8", className)} xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="var(--ink)" />
      <path
        d="M16 8.5 24 12.5V20.5L16 24.5 8 20.5V12.5L16 8.5Z"
        fill="var(--ink)"
        stroke="var(--cargo)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 12.5 16 16.5 24 12.5" stroke="var(--cargo)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 16.5V24.5" stroke="var(--cargo)" strokeWidth="1.8" />
      <path d="M16 8.5 16 16.5" stroke="var(--cargo)" strokeOpacity="0.5" strokeWidth="1.4" />
      <circle cx="23.5" cy="9.5" r="4.25" fill="var(--cargo)" stroke="var(--ink)" strokeWidth="1.2" />
      <circle cx="23.5" cy="9.5" r="1.3" fill="var(--ink)" />
    </svg>
  );
}
