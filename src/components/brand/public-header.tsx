import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

export function PublicHeader({ action }: { action: React.ReactNode }) {
  return (
    <header className="border-b-2 border-ink/90 bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <LogoMark />
          ShipTrack
        </Link>
        {action}
      </div>
    </header>
  );
}
