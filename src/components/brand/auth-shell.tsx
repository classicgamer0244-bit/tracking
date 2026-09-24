import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-heading text-xl font-semibold">
          <LogoMark />
          ShipTrack
        </Link>
        {children}
      </div>
    </div>
  );
}
