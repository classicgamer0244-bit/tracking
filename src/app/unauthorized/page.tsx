import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-ink bg-destructive/10 text-destructive shadow-cargo-sm">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="font-heading text-2xl font-bold">Access denied</h1>
      <p className="max-w-md text-muted-foreground">
        You don&apos;t have permission to view this page. If you believe this is a mistake, contact your
        administrator.
      </p>
      <Button render={<Link href="/login" />}>Back to sign in</Button>
    </div>
  );
}
